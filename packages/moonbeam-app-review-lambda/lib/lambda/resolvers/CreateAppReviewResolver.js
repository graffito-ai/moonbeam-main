"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAppReview = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * CreateAppReview resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param createAppReviewInput the input passed in, used to create and/or update
 * an existing user's App Review record/eligibility.
 *
 * @returns {@link Promise} of {@link AppReviewResponse}
 */
const createAppReview = async (fieldName, createAppReviewInput) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // initializing the DynamoDB document client
        const dynamoDbClient = new client_dynamodb_1.DynamoDBClient({ region: region });
        // update the timestamps accordingly
        const createdAt = new Date().toISOString();
        createAppReviewInput.createdAt = createAppReviewInput.createdAt ? createAppReviewInput.createdAt : createdAt;
        createAppReviewInput.updatedAt = createAppReviewInput.updatedAt ? createAppReviewInput.updatedAt : createdAt;
        /**
         * check to see if there is an existing App Review for the user.
         */
        const preExistingAppReview = createAppReviewInput.id && await dynamoDbClient.send(new client_dynamodb_1.GetItemCommand({
            TableName: process.env.APP_REVIEW_TABLE,
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
            await dynamoDbClient.send(new client_dynamodb_1.UpdateItemCommand({
                TableName: process.env.APP_REVIEW_TABLE,
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
                    createdAt: preExistingAppReview.Item.createdAt.S
                }
            };
        }
        else {
            // store a new App Review object for user
            await dynamoDbClient.send(new client_dynamodb_1.PutItemCommand({
                TableName: process.env.APP_REVIEW_TABLE,
                Item: {
                    id: {
                        S: createAppReviewInput.id
                    },
                    createdAt: {
                        S: createAppReviewInput.createdAt
                    },
                    updatedAt: {
                        S: createAppReviewInput.updatedAt
                    }
                },
            }));
            // return the App Review object
            return {
                data: createAppReviewInput
            };
        }
    }
    catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: moonbeam_models_1.AppReviewErrorType.UnexpectedError
        };
    }
};
exports.createAppReview = createAppReview;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRlQXBwUmV2aWV3UmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL3Jlc29sdmVycy9DcmVhdGVBcHBSZXZpZXdSZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw4REFBMkc7QUFDM0csK0RBQWlIO0FBRWpIOzs7Ozs7OztHQVFHO0FBQ0ksTUFBTSxlQUFlLEdBQUcsS0FBSyxFQUFFLFNBQWlCLEVBQUUsb0JBQTBDLEVBQThCLEVBQUU7SUFDL0gsSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2Qyw0Q0FBNEM7UUFDNUMsTUFBTSxjQUFjLEdBQUcsSUFBSSxnQ0FBYyxDQUFDLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7UUFFNUQsb0NBQW9DO1FBQ3BDLE1BQU0sU0FBUyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDM0Msb0JBQW9CLENBQUMsU0FBUyxHQUFHLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDN0csb0JBQW9CLENBQUMsU0FBUyxHQUFHLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFFN0c7O1dBRUc7UUFDSCxNQUFNLG9CQUFvQixHQUFHLG9CQUFvQixDQUFDLEVBQUUsSUFBSSxNQUFNLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxnQ0FBYyxDQUFDO1lBQ2pHLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFpQjtZQUN4QyxHQUFHLEVBQUU7Z0JBQ0QsRUFBRSxFQUFFO29CQUNBLENBQUMsRUFBRSxvQkFBb0IsQ0FBQyxFQUFFO2lCQUM3QjthQUNKO1NBQ0osQ0FBQyxDQUFDLENBQUM7UUFFSixtR0FBbUc7UUFDbkcsSUFBSSxvQkFBb0IsSUFBSSxvQkFBb0IsQ0FBQyxJQUFJLEVBQUU7WUFDbkQsZ0dBQWdHO1lBQ2hHLE1BQU0sT0FBTyxHQUFHLDRDQUE0QyxvQkFBb0IsQ0FBQyxFQUFFLGdCQUFnQixDQUFDO1lBQ3BHLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFckI7OztlQUdHO1lBQ0gsTUFBTSxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksbUNBQWlCLENBQUM7Z0JBQzVDLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFpQjtnQkFDeEMsR0FBRyxFQUFFO29CQUNELEVBQUUsRUFBRTt3QkFDQSxDQUFDLEVBQUUsb0JBQW9CLENBQUMsRUFBRTtxQkFDN0I7aUJBQ0o7Z0JBQ0Qsd0JBQXdCLEVBQUU7b0JBQ3RCLE1BQU0sRUFBRSxXQUFXO2lCQUN0QjtnQkFDRCx5QkFBeUIsRUFBRTtvQkFDdkIsS0FBSyxFQUFFO3dCQUNILENBQUMsRUFBRSxvQkFBb0IsQ0FBQyxTQUFTO3FCQUNwQztpQkFDSjtnQkFDRCxnQkFBZ0IsRUFBRSxnQkFBZ0I7Z0JBQ2xDLFlBQVksRUFBRSxhQUFhO2FBQzlCLENBQUMsQ0FBQyxDQUFDO1lBRUosd0NBQXdDO1lBQ3hDLE9BQU87Z0JBQ0gsSUFBSSxFQUFFO29CQUNGLEVBQUUsRUFBRSxvQkFBb0IsQ0FBQyxFQUFFO29CQUMzQixTQUFTLEVBQUUsb0JBQW9CLENBQUMsU0FBUztvQkFDekMsU0FBUyxFQUFFLG9CQUFvQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBRTtpQkFDcEQ7YUFDSixDQUFBO1NBQ0o7YUFBTTtZQUNILHlDQUF5QztZQUN6QyxNQUFNLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxnQ0FBYyxDQUFDO2dCQUN6QyxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBaUI7Z0JBQ3hDLElBQUksRUFBRTtvQkFDRixFQUFFLEVBQUU7d0JBQ0EsQ0FBQyxFQUFFLG9CQUFvQixDQUFDLEVBQUU7cUJBQzdCO29CQUNELFNBQVMsRUFBRTt3QkFDUCxDQUFDLEVBQUUsb0JBQW9CLENBQUMsU0FBVTtxQkFDckM7b0JBQ0QsU0FBUyxFQUFFO3dCQUNQLENBQUMsRUFBRSxvQkFBb0IsQ0FBQyxTQUFVO3FCQUNyQztpQkFDSjthQUNKLENBQUMsQ0FBQyxDQUFDO1lBRUosK0JBQStCO1lBQy9CLE9BQU87Z0JBQ0gsSUFBSSxFQUFFLG9CQUFpQzthQUMxQyxDQUFBO1NBQ0o7S0FDSjtJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1YsTUFBTSxZQUFZLEdBQUcsb0NBQW9DLFNBQVMsVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNsRixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzFCLE9BQU87WUFDSCxZQUFZLEVBQUUsWUFBWTtZQUMxQixTQUFTLEVBQUUsb0NBQWtCLENBQUMsZUFBZTtTQUNoRCxDQUFDO0tBQ0w7QUFDTCxDQUFDLENBQUE7QUE1RlksUUFBQSxlQUFlLG1CQTRGM0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0R5bmFtb0RCQ2xpZW50LCBHZXRJdGVtQ29tbWFuZCwgUHV0SXRlbUNvbW1hbmQsIFVwZGF0ZUl0ZW1Db21tYW5kfSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWR5bmFtb2RiXCI7XG5pbXBvcnQge0FwcFJldmlldywgQXBwUmV2aWV3RXJyb3JUeXBlLCBBcHBSZXZpZXdSZXNwb25zZSwgQ3JlYXRlQXBwUmV2aWV3SW5wdXR9IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5cbi8qKlxuICogQ3JlYXRlQXBwUmV2aWV3IHJlc29sdmVyXG4gKlxuICogQHBhcmFtIGZpZWxkTmFtZSBuYW1lIG9mIHRoZSByZXNvbHZlciBwYXRoIGZyb20gdGhlIEFwcFN5bmMgZXZlbnRcbiAqIEBwYXJhbSBjcmVhdGVBcHBSZXZpZXdJbnB1dCB0aGUgaW5wdXQgcGFzc2VkIGluLCB1c2VkIHRvIGNyZWF0ZSBhbmQvb3IgdXBkYXRlXG4gKiBhbiBleGlzdGluZyB1c2VyJ3MgQXBwIFJldmlldyByZWNvcmQvZWxpZ2liaWxpdHkuXG4gKlxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBBcHBSZXZpZXdSZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IGNyZWF0ZUFwcFJldmlldyA9IGFzeW5jIChmaWVsZE5hbWU6IHN0cmluZywgY3JlYXRlQXBwUmV2aWV3SW5wdXQ6IENyZWF0ZUFwcFJldmlld0lucHV0KTogUHJvbWlzZTxBcHBSZXZpZXdSZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8vIGluaXRpYWxpemluZyB0aGUgRHluYW1vREIgZG9jdW1lbnQgY2xpZW50XG4gICAgICAgIGNvbnN0IGR5bmFtb0RiQ2xpZW50ID0gbmV3IER5bmFtb0RCQ2xpZW50KHtyZWdpb246IHJlZ2lvbn0pO1xuXG4gICAgICAgIC8vIHVwZGF0ZSB0aGUgdGltZXN0YW1wcyBhY2NvcmRpbmdseVxuICAgICAgICBjb25zdCBjcmVhdGVkQXQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIGNyZWF0ZUFwcFJldmlld0lucHV0LmNyZWF0ZWRBdCA9IGNyZWF0ZUFwcFJldmlld0lucHV0LmNyZWF0ZWRBdCA/IGNyZWF0ZUFwcFJldmlld0lucHV0LmNyZWF0ZWRBdCA6IGNyZWF0ZWRBdDtcbiAgICAgICAgY3JlYXRlQXBwUmV2aWV3SW5wdXQudXBkYXRlZEF0ID0gY3JlYXRlQXBwUmV2aWV3SW5wdXQudXBkYXRlZEF0ID8gY3JlYXRlQXBwUmV2aWV3SW5wdXQudXBkYXRlZEF0IDogY3JlYXRlZEF0O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBjaGVjayB0byBzZWUgaWYgdGhlcmUgaXMgYW4gZXhpc3RpbmcgQXBwIFJldmlldyBmb3IgdGhlIHVzZXIuXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBwcmVFeGlzdGluZ0FwcFJldmlldyA9IGNyZWF0ZUFwcFJldmlld0lucHV0LmlkICYmIGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IEdldEl0ZW1Db21tYW5kKHtcbiAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuQVBQX1JFVklFV19UQUJMRSEsXG4gICAgICAgICAgICBLZXk6IHtcbiAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVBcHBSZXZpZXdJbnB1dC5pZFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuXG4gICAgICAgIC8vIGlmIHRoZXJlIGlzIGFuIGl0ZW0gcmV0cmlldmVkLCB0aGVuIHdlIHdpbGwgbmVlZCB0byBqdXN0IHVwZGF0ZSB0aGF0IGl0ZW0ncyB1cGRhdGVkQXQgdGltZXN0YW1wLlxuICAgICAgICBpZiAocHJlRXhpc3RpbmdBcHBSZXZpZXcgJiYgcHJlRXhpc3RpbmdBcHBSZXZpZXcuSXRlbSkge1xuICAgICAgICAgICAgLy8gaWYgdGhlcmUgaXMgYW4gZXhpc3RlbnQgRkFRIG9iamVjdCwgdGhlbiB3ZSBjYW5ub3QgZHVwbGljYXRlIHRoYXQsIHNvIHdlIHdpbGwgcmV0dXJuIGFuIGVycm9yXG4gICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gYFByZS1leGlzdGluZyBBcHAgUmV2aWV3IHJlY29yZCBmb3VuZCBmb3IgJHtjcmVhdGVBcHBSZXZpZXdJbnB1dC5pZH0uIFVwZGF0aW5nIGl0IWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhtZXNzYWdlKTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiB1cGRhdGUgdGhlIHByZS1leGlzdGluZyBBcHAgUmV2aWV3IG9iamVjdCdzIHVwZGF0ZWRBdCB0aW1lc3RhbXAgaW4gb3JkZXIgdG9cbiAgICAgICAgICAgICAqIGNvbW11bmljYXRlIHRoYXQgdGhlIHVzZXIgaGFzIGp1c3Qgbm93IHNlZW4gdGhlIEFwcCBSZXZpZXcgcG9wLXVwLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBVcGRhdGVJdGVtQ29tbWFuZCh7XG4gICAgICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5BUFBfUkVWSUVXX1RBQkxFISxcbiAgICAgICAgICAgICAgICBLZXk6IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZUFwcFJldmlld0lucHV0LmlkXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lczoge1xuICAgICAgICAgICAgICAgICAgICBcIiN1YXRcIjogXCJ1cGRhdGVkQXRcIlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlczoge1xuICAgICAgICAgICAgICAgICAgICBcIjphdFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVBcHBSZXZpZXdJbnB1dC51cGRhdGVkQXRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgVXBkYXRlRXhwcmVzc2lvbjogXCJTRVQgI3VhdCA9IDphdFwiLFxuICAgICAgICAgICAgICAgIFJldHVyblZhbHVlczogXCJVUERBVEVEX05FV1wiXG4gICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgIC8vIHJldHVybiB0aGUgdXBkYXRlZCBBcHAgUmV2aWV3IGRldGFpbHNcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICBpZDogY3JlYXRlQXBwUmV2aWV3SW5wdXQuaWQsXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRBdDogY3JlYXRlQXBwUmV2aWV3SW5wdXQudXBkYXRlZEF0LFxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IHByZUV4aXN0aW5nQXBwUmV2aWV3Lkl0ZW0uY3JlYXRlZEF0LlMhXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gc3RvcmUgYSBuZXcgQXBwIFJldmlldyBvYmplY3QgZm9yIHVzZXJcbiAgICAgICAgICAgIGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IFB1dEl0ZW1Db21tYW5kKHtcbiAgICAgICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LkFQUF9SRVZJRVdfVEFCTEUhLFxuICAgICAgICAgICAgICAgIEl0ZW06IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZUFwcFJldmlld0lucHV0LmlkXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlQXBwUmV2aWV3SW5wdXQuY3JlYXRlZEF0IVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZUFwcFJldmlld0lucHV0LnVwZGF0ZWRBdCFcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgIC8vIHJldHVybiB0aGUgQXBwIFJldmlldyBvYmplY3RcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGF0YTogY3JlYXRlQXBwUmV2aWV3SW5wdXQgYXMgQXBwUmV2aWV3XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nICR7ZmllbGROYW1lfSBxdWVyeSAke2Vycn1gO1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICBlcnJvclR5cGU6IEFwcFJldmlld0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgfTtcbiAgICB9XG59XG4iXX0=