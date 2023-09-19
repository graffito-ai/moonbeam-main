import {DynamoDBClient, GetItemCommand} from "@aws-sdk/client-dynamodb";
import {GetDeviceInput, UserDeviceErrorType, UserDeviceResponse, UserDeviceState} from "@moonbeam/moonbeam-models";

/**
 * GetDevice resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getDeviceInput device input used for the physical device object to be retrieved
 * @returns {@link Promise} of {@link UserDeviceResponse}
 */
export const getDevice = async (fieldName: string, getDeviceInput: GetDeviceInput): Promise<UserDeviceResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the DynamoDB document client
        const dynamoDbClient = new DynamoDBClient({region: region});

        // retrieve the physical device object, given the device by token input object
        const retrievedData = await dynamoDbClient.send(new GetItemCommand({
            TableName: process.env.PHYSICAL_DEVICES_TABLE!,
            Key: {
                id: {
                    S: getDeviceInput.id
                },
                tokenId: {
                    S: getDeviceInput.tokenId
                }
            }
        }));

        // if there is an item retrieved, then return it accordingly
        if (retrievedData && retrievedData.Item) {
            // return the retrieved physical device object
            return {
                data: {
                    id: retrievedData.Item.id.S!,
                    tokenId: retrievedData.Item.tokenId.S!,
                    deviceState: retrievedData.Item.deviceState.S! as UserDeviceState,
                    lastLoginDate: retrievedData.Item.lastLoginDate.S!
                }
            }
        } else {
            const errorMessage = `Physical device object not found for ${getDeviceInput.id}, with token ${getDeviceInput.tokenId}`;
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
