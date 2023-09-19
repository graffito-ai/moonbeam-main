import {DynamoDBClient, GetItemCommand} from "@aws-sdk/client-dynamodb";
import {GetUserAuthSessionInput, UserAuthSessionErrorType, UserAuthSessionResponse} from "@moonbeam/moonbeam-models";

/**
 * GetUserAuthSession resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getUserAuthSessionInput user auth session input, used to retrieved the appropriate session
 * @returns {@link Promise} of {@link UserAuthSessionResponse}
 */
export const getUserAuthSession = async (fieldName: string, getUserAuthSessionInput: GetUserAuthSessionInput): Promise<UserAuthSessionResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the DynamoDB document client
        const dynamoDbClient = new DynamoDBClient({region: region});

        // retrieve the User Auth Session given the input
        const retrievedData = await dynamoDbClient.send(new GetItemCommand({
            TableName: process.env.USER_AUTH_SESSION_TABLE!,
            Key: {
                id: {
                    S: getUserAuthSessionInput.id
                }
            }
        }));

        // if there is an item retrieved, then return all of its contents
        if (retrievedData && retrievedData.Item) {
            // return the user auth session response
            return {
                data: {
                    id: retrievedData.Item.id.S!,
                    createdAt: retrievedData.Item.createdAt.S!,
                    updatedAt: retrievedData.Item.updatedAt.S!,
                    numberOfSessions: Number(retrievedData.Item.numberOfSessions.N!)
                }
            }
        } else {
            const errorMessage = `User Auth session not found for ${getUserAuthSessionInput.id}`;
            console.log(errorMessage);

            return {
                errorMessage: errorMessage,
                errorType: UserAuthSessionErrorType.NoneOrAbsent
            }
        }

    } catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: UserAuthSessionErrorType.UnexpectedError
        };
    }
}
