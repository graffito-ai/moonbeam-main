import {DynamoDBClient, GetItemCommand, PutItemCommand, UpdateItemCommand} from "@aws-sdk/client-dynamodb";
import {AppReview, AppReviewErrorType, AppReviewResponse, CreateAppReviewInput} from "@moonbeam/moonbeam-models";

/**
 * CreateAppReview resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param createAppReviewInput the input passed in, used to create and/or update
 * an existing user's App Review record/eligibility.
 *
 * @returns {@link Promise} of {@link AppReviewResponse}
 */
export const createAppReview = async (fieldName: string, createAppReviewInput: CreateAppReviewInput): Promise<AppReviewResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the DynamoDB document client
        const dynamoDbClient = new DynamoDBClient({region: region});

        // update the timestamps accordingly
        const createdAt = new Date().toISOString();
        createAppReviewInput.createdAt = createAppReviewInput.createdAt ? createAppReviewInput.createdAt : createdAt;
        createAppReviewInput.updatedAt = createAppReviewInput.updatedAt ? createAppReviewInput.updatedAt : createdAt;

        /**
         * check to see if there is an existing App Review for the user.
         */
        const preExistingAppReview = createAppReviewInput.id && await dynamoDbClient.send(new GetItemCommand({
            TableName: process.env.APP_REVIEW_TABLE!,
            Key: {
                id: {
                    S: createAppReviewInput.id
                }
            }
        }));

        // if there is an item retrieved, then we will need to just update that item's updatedAt timestamp.
        if (preExistingAppReview && preExistingAppReview.Item) {
            // if there is an existent FAQ object, then we cannot duplicate that, so we will return an error
            const message = `Pre-existing App Review record found for ${createAppReviewInput.id}. Updating it!`;
            console.log(message);

            /**
             * update the pre-existing App Review object's updatedAt timestamp in order to
             * communicate that the user has just now seen the App Review pop-up.
             */
            await dynamoDbClient.send(new UpdateItemCommand({
                TableName: process.env.APP_REVIEW_TABLE!,
                Key: {
                    id: {
                        S: createAppReviewInput.id
                    }
                },
                ExpressionAttributeNames: {
                    "#uat": "updatedAt"
                },
                ExpressionAttributeValues: {
                    ":at": {
                        S: createAppReviewInput.updatedAt
                    }
                },
                UpdateExpression: "SET #uat = :at",
                ReturnValues: "UPDATED_NEW"
            }));

            // return the updated App Review details
            return {
                data: {
                    id: createAppReviewInput.id,
                    updatedAt: createAppReviewInput.updatedAt,
                    createdAt: preExistingAppReview.Item.createdAt.S!
                }
            }
        } else {
            // store a new App Review object for user
            await dynamoDbClient.send(new PutItemCommand({
                TableName: process.env.APP_REVIEW_TABLE!,
                Item: {
                    id: {
                        S: createAppReviewInput.id
                    },
                    createdAt: {
                        S: createAppReviewInput.createdAt!
                    },
                    updatedAt: {
                        S: createAppReviewInput.updatedAt!
                    }
                },
            }));

            // return the App Review object
            return {
                data: createAppReviewInput as AppReview
            }
        }
    } catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: AppReviewErrorType.UnexpectedError
        };
    }
}
