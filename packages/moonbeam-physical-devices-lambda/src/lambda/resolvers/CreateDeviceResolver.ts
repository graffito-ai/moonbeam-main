import {DynamoDBClient, GetItemCommand, PutItemCommand} from "@aws-sdk/client-dynamodb";
import {CreateDeviceInput, UserDeviceResponse, PushDevice, UserDeviceErrorType} from "@moonbeam/moonbeam-models";

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
            ProjectionExpression: '#idf, #tId',
            ExpressionAttributeNames: {
                '#idf': 'id',
                '#tId': 'tokenId'
            }
        }));

        // if there is an item retrieved, then we return an error
        if (preExistingPhysicalDevice && preExistingPhysicalDevice.Item) {
            /**
             * if there is a pre-existing device with the same composite primary key (userId/id, tokenId) combination,
             * then we cannot duplicate that, so we will return an error.
             */
            const errorMessage = `Duplicate physical device found!`;
            console.log(errorMessage);

            return {
                errorMessage: errorMessage,
                errorType: UserDeviceErrorType.DuplicateObjectFound
            }
        } else {
            // store the physical device object
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
                        S: createDeviceInput.lastLoginDate
                    }
                },
            }));

            // return the physical device object
            return {
                data: createDeviceInput as PushDevice
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
