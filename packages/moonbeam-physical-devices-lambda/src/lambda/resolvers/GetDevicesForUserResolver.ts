import {
    GetDevicesForUserInput,
    PushDevice,
    UserDeviceErrorType,
    UserDevicesResponse,
    UserDeviceState
} from "@moonbeam/moonbeam-models";
import {AttributeValue, DynamoDBClient, QueryCommand} from "@aws-sdk/client-dynamodb";

/**
 * GetDevicesForUser resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getDevicesForUserInput devices for user input used for the physical devices
 * for a particular user, to be retrieved
 * @returns {@link Promise} of {@link UserDevicesResponse}
 */
export const getDevicesForUser = async (fieldName: string, getDevicesForUserInput: GetDevicesForUserInput): Promise<UserDevicesResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the DynamoDB document client
        const dynamoDbClient = new DynamoDBClient({region: region});

        /**
         * the data to be retrieved from the Query Command
         * the eligible user Items returned from the Query Command, all aggregated together
         * the last evaluated key, to help with the pagination of results
         */
        let result: Record<string, AttributeValue>[] = [];
        let exclusiveStartKey, retrievedData;

        do {
            /**
             * retrieve all the physical devices for a particular user, given the global secondary index
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
                IndexName: `${process.env.PHYSICAL_DEVICES_ID_GLOBAL_INDEX!}-${process.env.ENV_NAME!}-${region}`,
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
                    ":idf": {
                        S: getDevicesForUserInput.id
                    }
                },
                KeyConditionExpression: '#idf = :idf'
            }));

            exclusiveStartKey = retrievedData.LastEvaluatedKey;
            result = result.concat(retrievedData.Items);
        } while (retrievedData && retrievedData.Count && retrievedData.Items &&
        retrievedData.Items.length && retrievedData.Count !== 0 &&
        retrievedData.Items.length !== 0 && retrievedData.LastEvaluatedKey);

        // if there are physical devices retrieved, then return them accordingly
        if (result && result.length !== 0) {
            // convert the Dynamo DB data from Dynamo DB JSON format to a Moonbeam push device  data format
            const pushDevicesData: PushDevice[] = [];
            result.forEach(pushDeviceResult => {
                if (pushDeviceResult.deviceState.S! as UserDeviceState === UserDeviceState.Active) {
                    const pushDevice: PushDevice = {
                        id: pushDeviceResult.id.S!,
                        tokenId: pushDeviceResult.tokenId.S!,
                        deviceState: pushDeviceResult.deviceState.S! as UserDeviceState,
                        lastLoginDate: pushDeviceResult.lastLoginDate.S!
                    };
                    pushDevicesData.push(pushDevice);
                }
            });

            /**
             * we will filter the active devices in the order of their lastLoginDate so that we can only return
             * the last active device that the user has logged in to.
             */
            pushDevicesData.sort((a, b) => Date.parse(b.lastLoginDate) - Date.parse(a.lastLoginDate));

            // return the list of physical devices for user
            return {
                data: [pushDevicesData[0]] // return the first device in the list of active devices since we know that's the latest one that the user has logged into
            }
        } else {
            const errorMessage = `Physical Devices for user ${getDevicesForUserInput.id} not found!`;
            console.log(errorMessage);

            return {
                errorMessage: errorMessage,
                errorType: UserDeviceErrorType.NoneOrAbsent
            }
        }
    } catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: UserDeviceErrorType.UnexpectedError
        };
    }
}
