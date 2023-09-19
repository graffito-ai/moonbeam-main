import {DynamoDBClient, GetItemCommand, PutItemCommand} from "@aws-sdk/client-dynamodb";
import {
    CreateUserAuthSessionInput,
    UserAuthSessionErrorType,
    UserAuthSessionResponse
} from "@moonbeam/moonbeam-models";

/**
 * CreateUserAuthSession resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param createUserAuthSessionInput User Auth Session input object, used to create a new User Auth Session object.
 * @returns {@link Promise} of {@link UserAuthSessionResponse}
 */
export const createUserAuthSession = async (fieldName: string, createUserAuthSessionInput: CreateUserAuthSessionInput): Promise<UserAuthSessionResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the DynamoDB document client
        const dynamoDbClient = new DynamoDBClient({region: region});

        // update the timestamps accordingly
        const createdAt = new Date().toISOString();
        createUserAuthSessionInput.createdAt = createUserAuthSessionInput.createdAt ? createUserAuthSessionInput.createdAt : createdAt;
        createUserAuthSessionInput.updatedAt = createUserAuthSessionInput.updatedAt ? createUserAuthSessionInput.updatedAt : createdAt;

        /**
         * check to see if there is an existing User Auth Session with the same ID, in case there is
         * an id passed in.
         */
        const preExistingAuthSession = createUserAuthSessionInput.id && await dynamoDbClient.send(new GetItemCommand({
            TableName: process.env.USER_AUTH_SESSION_TABLE!,
            Key: {
                id: {
                    S: createUserAuthSessionInput.id
                }
            },
            /**
             * we're not interested in getting all the data for this call, just the minimum for us to determine whether this is a duplicate or not
             *
             * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html
             * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ExpressionAttributeNames.html
             */
            ProjectionExpression: '#idf',
            ExpressionAttributeNames: {
                '#idf': 'id'
            }
        }));

        // if there is an item retrieved, then we return an error
        if (preExistingAuthSession && preExistingAuthSession.Item) {
            // if there is an existent link object, then we cannot duplicate that, so we will return an error
            const errorMessage = `Duplicate User Auth Session object found!`;
            console.log(errorMessage);

            return {
                errorMessage: errorMessage,
                errorType: UserAuthSessionErrorType.DuplicateObjectFound
            }
        } else {
            // store the new User Auth Session
            await dynamoDbClient.send(new PutItemCommand({
                TableName: process.env.USER_AUTH_SESSION_TABLE!,
                Item: {
                    id: {
                        S: createUserAuthSessionInput.id!
                    },
                    createdAt: {
                        S: createUserAuthSessionInput.createdAt!
                    },
                    updatedAt: {
                        S: createUserAuthSessionInput.updatedAt!
                    },
                    numberOfSessions: {
                        N: "1" // hardcoding this first number of sessions to one
                    }
                },
            }));

            // return the User Auth Session object
            return {
                data: {
                    id: createUserAuthSessionInput.id,
                    createdAt: createUserAuthSessionInput.createdAt,
                    updatedAt: createUserAuthSessionInput.updatedAt,
                    numberOfSessions: 1 // hardcoding this first number of sessions to one
                }
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
