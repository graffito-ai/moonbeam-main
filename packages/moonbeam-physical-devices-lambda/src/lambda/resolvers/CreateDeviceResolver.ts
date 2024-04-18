import {
    AttributeValue,
    DynamoDBClient,
    GetItemCommand,
    PutItemCommand,
    QueryCommand,
    UpdateItemCommand
} from "@aws-sdk/client-dynamodb";
import {
    CreateDeviceInput,
    PushDevice,
    UserDeviceErrorType,
    UserDeviceResponse,
    UserDeviceState
} from "@moonbeam/moonbeam-models";

/**
 * CreateDevice resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param createDeviceInput create device input object, used to create a physical device.
 * @returns {@link Promise} of {@link UserDeviceResponse}
 */
export const createDevice = async (fieldName: string, createDeviceInput: CreateDeviceInput): Promise<UserDeviceResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the DynamoDB document client
        const dynamoDbClient = new DynamoDBClient({region: region});

        // update the timestamps accordingly
        const createdAt = new Date().toISOString();
        createDeviceInput.lastLoginDate = createDeviceInput.lastLoginDate ? createDeviceInput.lastLoginDate : createdAt;

        /**
         * check to see if the same user id/device combination already exists in the DB.
         */
        const preExistingPhysicalDevice = await dynamoDbClient.send(new GetItemCommand({
            TableName: process.env.PHYSICAL_DEVICES_TABLE!,
            Key: {
                id: {
                    S: createDeviceInput.id
                },
                tokenId: {
                    S: createDeviceInput.tokenId
                }
            },
            /**
             * we're not interested in getting all the data for this call, just the minimum for us to determine whether this is a duplicate or not
             *
             * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html
             * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ExpressionAttributeNames.html
             */
            ProjectionExpression: '#idf, #tId, #dSt',
            ExpressionAttributeNames: {
                '#idf': 'id',
                '#tId': 'tokenId',
                '#dSt': 'deviceState'
            }
        }));

        // if there is an item retrieved, it does not matter because we want to update that item's status and last login date
        if (preExistingPhysicalDevice && preExistingPhysicalDevice.Item) {
            /**
             * if there is a pre-existing device with the same composite primary key (userId/id, tokenId) combination,
             * then we update that device's state and login date accordingly.
             */
            await dynamoDbClient.send(new UpdateItemCommand({
                TableName: process.env.PHYSICAL_DEVICES_TABLE!,
                Key: {
                    id: {
                        S: createDeviceInput.id
                    },
                    tokenId: {
                        S: createDeviceInput.tokenId
                    }
                },
                ExpressionAttributeNames: {
                    "#dst": "deviceState",
                    "#llog": "lastLoginDate"
                },
                ExpressionAttributeValues: {
                    ":dst": {
                        S: createDeviceInput.deviceState
                    },
                    ":llog": {
                        S: createDeviceInput.lastLoginDate
                    }
                },
                UpdateExpression: "SET #dst = :dst, #llog = :llog",
                ReturnValues: "UPDATED_NEW"
            }));

            // return the updated physical device object
            return {
                data: createDeviceInput as PushDevice
            }
        } else {
            /**
             * if there is no item retrieved for this particular user, we move forward by determining if there are any devices with the same token associated with
             * different users.
             * If there are, we want to update their states to INACTIVE and store the new device accordingly. Otherwise, we want to just store the new device
             * accordingly.
             */
            const matchedDevicesByToken: PushDevice[] = await getDevicesByToken(dynamoDbClient, region, createDeviceInput.tokenId);
            // check the size of the matched devices returned
            if (matchedDevicesByToken.length === 0) {
                // if there are no other matched devices, then just store the new device and return it accordingly
                await dynamoDbClient.send(new PutItemCommand({
                    TableName: process.env.PHYSICAL_DEVICES_TABLE!,
                    Item: {
                        id: {
                            S: createDeviceInput.id
                        },
                        tokenId: {
                            S: createDeviceInput.tokenId
                        },
                        deviceState: {
                            S: createDeviceInput.deviceState
                        },
                        lastLoginDate: {
                            S: createDeviceInput.lastLoginDate!
                        }
                    },
                }));

                // return the stored physical device object
                return {
                    data: createDeviceInput as PushDevice
                }
            } else {
                /**
                 * if there are other matched devices, then ensure that we mark them as INACTIVE before storing and
                 * returning the new device accordingly.
                 */
                return inactivateDevices(dynamoDbClient, matchedDevicesByToken).then(failureFlag => {
                    // store the new device
                    return !failureFlag ? dynamoDbClient.send(new PutItemCommand({
                            TableName: process.env.PHYSICAL_DEVICES_TABLE!,
                            Item: {
                                id: {
                                    S: createDeviceInput.id
                                },
                                tokenId: {
                                    S: createDeviceInput.tokenId
                                },
                                deviceState: {
                                    S: createDeviceInput.deviceState
                                },
                                lastLoginDate: {
                                    S: createDeviceInput.lastLoginDate!
                                }
                            }
                        })).then(_ => {
                            // return the stored physical device object
                            return {
                                data: createDeviceInput as PushDevice
                            }
                        }) :
                        {
                            errorMessage: `Unexpected error while Inactivating existing devices with same push token!`,
                            errorType: UserDeviceErrorType.UnexpectedError
                        }
                })
            }
        }
    } catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: UserDeviceErrorType.UnexpectedError
        }
    }
}

/**
 * Function used to inactivate a list of devices, given that they match with a newly created device's
 * push token.
 *
 * @param dynamoDbClient dynamoDBClient used to interact with the database
 * @param pushDevices list of push devices to mark as INACTIVE
 */
const inactivateDevices = async (dynamoDbClient: DynamoDBClient, pushDevices: PushDevice[]): Promise<boolean> => {
    let failedDevices: boolean = false;

    // update the timestamps accordingly
    const updatedAt = new Date().toISOString();

    // loop through the entire list of push devices and update them accordingly
    for (const pushDevice of pushDevices) {
        // update the physical device object based on the passed in object
        const storedItem = await dynamoDbClient.send(new UpdateItemCommand({
            TableName: process.env.PHYSICAL_DEVICES_TABLE!,
            Key: {
                id: {
                    S: pushDevice.id
                },
                tokenId: {
                    S: pushDevice.tokenId
                }
            },
            ExpressionAttributeNames: {
                "#dst": "deviceState",
                "#llog": "lastLoginDate"
            },
            ExpressionAttributeValues: {
                ":dst": {
                    S: UserDeviceState.Inactive
                },
                ":llog": {
                    S: updatedAt
                }
            },
            UpdateExpression: "SET #dst = :dst, #llog = :llog",
            ReturnValues: "UPDATED_NEW"
        }));
        // update the failed devices flag accordingly, depending on whether updating the devices was successful or not
        if (storedItem.$metadata.httpStatusCode && storedItem.$metadata.httpStatusCode !== 200) {
            failedDevices = true;
        }
    }
    return Promise.resolve(failedDevices);
}

/**
 * Function used to retrieve physical devices given a token
 *
 * @param dynamoDbClient dynamoDBClient used to interact with the database
 * @param region region passed in
 * @param tokenId the token ID to match physical devices by
 *
 * @return a {@link Promise} of {@link PushDevice}s representing the push devices matched
 * by the inputted token.
 */
const getDevicesByToken = async (dynamoDbClient: DynamoDBClient, region: string, tokenId: string): Promise<PushDevice[]> => {
    /**
     * the data to be retrieved from the Query Command
     * the eligible user Items returned from the Query Command, all aggregated together
     * the last evaluated key, to help with the pagination of results
     */
    let result: Record<string, AttributeValue>[] = [];
    let exclusiveStartKey, retrievedData;

    do {
        /**
         * retrieve all the physical devices, given the global secondary index
         *
         * Limit of 1 MB per paginated response data (in our case 7,000 items). An average size for an Item is about 110 bytes, which means that we won't
         * need to do pagination here, since we actually retrieve all users in a looped format, and we account for
         * paginated responses.
         *
         * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.Pagination.html}
         * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html}
         */
        retrievedData = await dynamoDbClient.send(new QueryCommand({
            TableName: process.env.PHYSICAL_DEVICES_TABLE!,
            IndexName: `${process.env.PHYSICAL_DEVICES_TOKEN_ID_GLOBAL_INDEX!}-${process.env.ENV_NAME!}-${region}`,
            ...(exclusiveStartKey && {ExclusiveStartKey: exclusiveStartKey}),
            Limit: 7000, // 7000 * 1110 bytes = 770,000 bytes = 0.777 MB (leave a margin of error here up to 1 MB)
            /**
             * we're not interested in getting all the data for this call, just the minimum for us to return the necessary information
             *
             * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html
             * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ExpressionAttributeNames.html
             */
            ProjectionExpression: '#idf, #tId, #dst, #llog',
            ExpressionAttributeNames: {
                '#idf': 'id',
                '#tId': 'tokenId',
                '#dst': 'deviceState',
                '#llog': 'lastLoginDate'
            },
            ExpressionAttributeValues: {
                ":tId": {
                    S: tokenId
                }
            },
            KeyConditionExpression: '#tId = :tId'
        }));

        exclusiveStartKey = retrievedData.LastEvaluatedKey;
        result = result.concat(retrievedData.Items);
    } while (retrievedData && retrievedData.Count && retrievedData.Items &&
    retrievedData.Items.length && retrievedData.Count !== 0 &&
    retrievedData.Items.length !== 0 && retrievedData.LastEvaluatedKey);

    // if there is a physical device retrieved, then return it accordingly
    if (result && result.length !== 0) {
        // convert the Dynamo DB data from Dynamo DB JSON format to a Moonbeam push device data format
        let pushDeviceData: PushDevice[] = [];
        result.forEach(pushDeviceResult => {
            // only retrieve the push device that's in an ACTIVE state (if it exists) - should only be one
            if (pushDeviceResult.deviceState.S! as UserDeviceState === UserDeviceState.Active) {
                const pushDevice: PushDevice = {
                    id: pushDeviceResult.id.S!,
                    tokenId: pushDeviceResult.tokenId.S!,
                    deviceState: pushDeviceResult.deviceState.S! as UserDeviceState,
                    lastLoginDate: pushDeviceResult.lastLoginDate.S!
                };
                pushDeviceData.push(pushDevice);
            }
        });

        // only return if we found an active physical device (ignore the inactive entries)
        if (pushDeviceData.length !== 0) {
            // return the physical devices matched by token
            return pushDeviceData
        } else {
            const errorMessage = `Active Physical Devices with token ${tokenId} not found!`;
            console.log(errorMessage);

            return [];
        }
    } else {
        const errorMessage = `Physical Devices with token ${tokenId} not found!`;
        console.log(errorMessage);

        return [];
    }
}
