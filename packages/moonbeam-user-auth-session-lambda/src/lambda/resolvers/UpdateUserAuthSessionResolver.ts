import {DynamoDBClient, GetItemCommand, UpdateItemCommand} from "@aws-sdk/client-dynamodb";
import {UpdateUserAuthSessionInput, UserAuthSessionErrorType, UserAuthSessionResponse} from "@moonbeam/moonbeam-models";

/**
 * UpdateUserAuthSession resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param updateUserAuthSessionInput User Auth Session input object, used to update an existing session object (if found).
 * @returns {@link Promise} of {@link UserAuthSessionResponse}
 */
export const updateUserAuthSession = async (fieldName: string, updateUserAuthSessionInput: UpdateUserAuthSessionInput): Promise<UserAuthSessionResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the DynamoDB document client
        const dynamoDbClient = new DynamoDBClient({region: region});

        // update the timestamps accordingly
        const updatedAt = new Date().toISOString();
        updateUserAuthSessionInput.updatedAt = updateUserAuthSessionInput.updatedAt ? updateUserAuthSessionInput.updatedAt : updatedAt;

        /**
         * check to see if there is an existing User Auth Session with the same ID.
         */
        const preExistingUserAuthSession = updateUserAuthSessionInput.id && await dynamoDbClient.send(new GetItemCommand({
            TableName: process.env.USER_AUTH_SESSION_TABLE!,
            Key: {
                id: {
                    S: updateUserAuthSessionInput.id
                }
            }
        }));

        // if there is an item to be retrieved, we update it accordingly
        if (preExistingUserAuthSession && preExistingUserAuthSession.Item) {
            // update the user auth session object, by increasing the number of sessions, and the latest updated timestamp
            const updatedNumberOfSessions = Number(Number(preExistingUserAuthSession.Item.numberOfSessions.N!) + 1);
            await dynamoDbClient.send(new UpdateItemCommand({
                TableName: process.env.USER_AUTH_SESSION_TABLE!,
                Key: {
                    id: {
                        S: updateUserAuthSessionInput.id
                    }
                },
                ExpressionAttributeNames: {
                    "#NOS": "numberOfSessions",
                    "#UA": "updatedAt"
                },
                ExpressionAttributeValues: {
                    ":nos": {
                        N: updatedNumberOfSessions.toString() // increase the existing number of sessions by 1
                    },
                    ":ua": {
                        S: updateUserAuthSessionInput.updatedAt
                    }
                },
                UpdateExpression: "SET #NOS = :nos, #UA = :ua",
                ReturnValues: "UPDATED_NEW"
            }));

            // return the updated user auth session object
            return {
                data: {
                    id: updateUserAuthSessionInput.id,
                    createdAt: preExistingUserAuthSession.Item.createdAt.S!,
                    updatedAt: updateUserAuthSessionInput.updatedAt,
                    numberOfSessions: updatedNumberOfSessions
                }
            }
        } else {
            // if there is no item retrieved, then we return an error
            const errorMessage = `User Auth session not found for ${updateUserAuthSessionInput.id}`;
            console.log(errorMessage);

            return {
                errorMessage: errorMessage,
                errorType: UserAuthSessionErrorType.NoneOrAbsent
            }
        }
    } catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: UserAuthSessionErrorType.UnexpectedError
        }
    }
}
