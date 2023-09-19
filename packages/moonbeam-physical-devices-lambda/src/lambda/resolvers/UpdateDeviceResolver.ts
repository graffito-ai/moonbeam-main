import {DynamoDBClient, GetItemCommand, UpdateItemCommand} from "@aws-sdk/client-dynamodb";
import {UpdateDeviceInput, UserDeviceErrorType, UserDeviceResponse, PushDevice} from "@moonbeam/moonbeam-models";

/**
 * UpdateDevice resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param updateDeviceInput update device input, used to update an existent physical device
 * @returns {@link Promise} of {@link UserDeviceResponse}
 */
export const updateDevice = async (fieldName: string, updateDeviceInput: UpdateDeviceInput): Promise<UserDeviceResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the DynamoDB document client
        const dynamoDbClient = new DynamoDBClient({region: region});

        // update the timestamps accordingly
        const updatedAt = new Date().toISOString();
        updateDeviceInput.lastLoginDate = updateDeviceInput.lastLoginDate ? updateDeviceInput.lastLoginDate : updatedAt;

        // check to see if there is a physical device object to update. If there's none, then return an error accordingly.
        const preExistingPhysicalDevice = await dynamoDbClient.send(new GetItemCommand({
            TableName: process.env.PHYSICAL_DEVICES_TABLE!,
            Key: {
                id: {
                    S: updateDeviceInput.id
                },
                tokenId: {
                    S: updateDeviceInput.tokenId
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

        // if there is an item retrieved, then we need to check its contents
        if (preExistingPhysicalDevice && preExistingPhysicalDevice.Item) {
            // update the physical device object based on the passed in object
            await dynamoDbClient.send(new UpdateItemCommand({
                TableName: process.env.PHYSICAL_DEVICES_TABLE!,
                Key: {
                    id: {
                        S: updateDeviceInput.id
                    },
                    tokenId: {
                        S: updateDeviceInput.tokenId
                    }
                },
                ExpressionAttributeNames: {
                    "#dst": "deviceState",
                    "#llog": "lastLoginDate"
                },
                ExpressionAttributeValues: {
                    ":dst": {
                        S: updateDeviceInput.deviceState
                    },
                    ":llog": {
                        S: updateDeviceInput.lastLoginDate
                    }
                },
                UpdateExpression: "SET #dst = :dst, #llog = :llog",
                ReturnValues: "UPDATED_NEW"
            }));

            // return the updated physical device object
            return {
                data: updateDeviceInput as PushDevice
            }
        } else {
            const errorMessage = `Unknown physical device object to update!`;
            console.log(errorMessage);

            return {
                errorMessage: errorMessage,
                errorType: UserDeviceErrorType.NoneOrAbsent
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
