"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReimbursementEligibility = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * UpdateReimbursementEligibility resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param updateReimbursementEligibilityInput update reimbursement eligibility input, used to update an existent reimbursement eligibility
 * @returns {@link Promise} of {@link ReimbursementResponse}
 */
const updateReimbursementEligibility = async (fieldName, updateReimbursementEligibilityInput) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // initializing the DynamoDB document client
        const dynamoDbClient = new client_dynamodb_1.DynamoDBClient({ region: region });
        // update the timestamps accordingly
        const updatedAt = new Date().toISOString();
        updateReimbursementEligibilityInput.updatedAt = updateReimbursementEligibilityInput.updatedAt ? updateReimbursementEligibilityInput.updatedAt : updatedAt;
        // check to see if there is a reimbursement eligibility object to update. If there's none, then return an error accordingly.
        const preExistingReimbursementEligibilityObject = await dynamoDbClient.send(new client_dynamodb_1.GetItemCommand({
            TableName: process.env.REIMBURSEMENT_ELIGIBILITY_TABLE,
            Key: {
                id: {
                    S: updateReimbursementEligibilityInput.id
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
        // if there is an item retrieved, then we need to check its contents
        if (preExistingReimbursementEligibilityObject && preExistingReimbursementEligibilityObject.Item) {
            // update the reimbursement eligibility object based on the passed in object
            await dynamoDbClient.send(new client_dynamodb_1.UpdateItemCommand({
                TableName: process.env.REIMBURSEMENT_ELIGIBILITY_TABLE,
                Key: {
                    id: {
                        S: updateReimbursementEligibilityInput.id
                    }
                },
                ExpressionAttributeNames: {
                    "#estat": "eligibilityStatus",
                    "#uat": "updatedAt"
                },
                ExpressionAttributeValues: {
                    ":estat": {
                        S: updateReimbursementEligibilityInput.eligibilityStatus
                    },
                    ":uat": {
                        S: updateReimbursementEligibilityInput.updatedAt
                    }
                },
                UpdateExpression: "SET #estat = :estat, #uat = :uat",
                ReturnValues: "UPDATED_NEW"
            }));
            // return the updated reimbursement eligibility object
            return {
                id: updateReimbursementEligibilityInput.id,
                data: updateReimbursementEligibilityInput
            };
        }
        else {
            const errorMessage = `Unknown reimbursement eligibility object to update!`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.ReimbursementsErrorType.NoneOrAbsent
            };
        }
    }
    catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: moonbeam_models_1.ReimbursementsErrorType.UnexpectedError
        };
    }
};
exports.updateReimbursementEligibility = updateReimbursementEligibility;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXBkYXRlUmVpbWJ1cnNlbWVudEVsaWdpYmlsaXR5UmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL3Jlc29sdmVycy9VcGRhdGVSZWltYnVyc2VtZW50RWxpZ2liaWxpdHlSZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw4REFBMkY7QUFDM0YsK0RBTW1DO0FBRW5DOzs7Ozs7R0FNRztBQUNJLE1BQU0sOEJBQThCLEdBQUcsS0FBSyxFQUFFLFNBQWlCLEVBQUUsbUNBQXdFLEVBQTZDLEVBQUU7SUFDM0wsSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2Qyw0Q0FBNEM7UUFDNUMsTUFBTSxjQUFjLEdBQUcsSUFBSSxnQ0FBYyxDQUFDLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7UUFFNUQsb0NBQW9DO1FBQ3BDLE1BQU0sU0FBUyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDM0MsbUNBQW1DLENBQUMsU0FBUyxHQUFHLG1DQUFtQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsbUNBQW1DLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFFMUosNEhBQTRIO1FBQzVILE1BQU0seUNBQXlDLEdBQUcsTUFBTSxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksZ0NBQWMsQ0FBQztZQUMzRixTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQywrQkFBZ0M7WUFDdkQsR0FBRyxFQUFFO2dCQUNELEVBQUUsRUFBRTtvQkFDQSxDQUFDLEVBQUUsbUNBQW1DLENBQUMsRUFBRTtpQkFDNUM7YUFDSjtZQUNEOzs7OztlQUtHO1lBQ0gsb0JBQW9CLEVBQUUsTUFBTTtZQUM1Qix3QkFBd0IsRUFBRTtnQkFDdEIsTUFBTSxFQUFFLElBQUk7YUFDZjtTQUNKLENBQUMsQ0FBQyxDQUFDO1FBRUosb0VBQW9FO1FBQ3BFLElBQUkseUNBQXlDLElBQUkseUNBQXlDLENBQUMsSUFBSSxFQUFFO1lBQzdGLDRFQUE0RTtZQUM1RSxNQUFNLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxtQ0FBaUIsQ0FBQztnQkFDNUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsK0JBQWdDO2dCQUN2RCxHQUFHLEVBQUU7b0JBQ0QsRUFBRSxFQUFFO3dCQUNBLENBQUMsRUFBRSxtQ0FBbUMsQ0FBQyxFQUFFO3FCQUM1QztpQkFDSjtnQkFDRCx3QkFBd0IsRUFBRTtvQkFDdEIsUUFBUSxFQUFFLG1CQUFtQjtvQkFDN0IsTUFBTSxFQUFFLFdBQVc7aUJBQ3RCO2dCQUNELHlCQUF5QixFQUFFO29CQUN2QixRQUFRLEVBQUU7d0JBQ04sQ0FBQyxFQUFFLG1DQUFtQyxDQUFDLGlCQUFpQjtxQkFDM0Q7b0JBQ0QsTUFBTSxFQUFFO3dCQUNKLENBQUMsRUFBRSxtQ0FBbUMsQ0FBQyxTQUFTO3FCQUNuRDtpQkFDSjtnQkFDRCxnQkFBZ0IsRUFBRSxrQ0FBa0M7Z0JBQ3BELFlBQVksRUFBRSxhQUFhO2FBQzlCLENBQUMsQ0FBQyxDQUFDO1lBRUosc0RBQXNEO1lBQ3RELE9BQU87Z0JBQ0gsRUFBRSxFQUFFLG1DQUFtQyxDQUFDLEVBQUU7Z0JBQzFDLElBQUksRUFBRSxtQ0FBK0Q7YUFDeEUsQ0FBQTtTQUNKO2FBQU07WUFDSCxNQUFNLFlBQVksR0FBRyxxREFBcUQsQ0FBQztZQUMzRSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRTFCLE9BQU87Z0JBQ0gsWUFBWSxFQUFFLFlBQVk7Z0JBQzFCLFNBQVMsRUFBRSx5Q0FBdUIsQ0FBQyxZQUFZO2FBQ2xELENBQUE7U0FDSjtLQUNKO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDVixNQUFNLFlBQVksR0FBRyxvQ0FBb0MsU0FBUyxhQUFhLEdBQUcsRUFBRSxDQUFDO1FBQ3JGLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUIsT0FBTztZQUNILFlBQVksRUFBRSxZQUFZO1lBQzFCLFNBQVMsRUFBRSx5Q0FBdUIsQ0FBQyxlQUFlO1NBQ3JELENBQUE7S0FDSjtBQUNMLENBQUMsQ0FBQTtBQWhGWSxRQUFBLDhCQUE4QixrQ0FnRjFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtEeW5hbW9EQkNsaWVudCwgR2V0SXRlbUNvbW1hbmQsIFVwZGF0ZUl0ZW1Db21tYW5kfSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWR5bmFtb2RiXCI7XG5pbXBvcnQge1xuICAgIFJlaW1idXJzZW1lbnRFbGlnaWJpbGl0eSxcbiAgICBSZWltYnVyc2VtZW50RWxpZ2liaWxpdHlSZXNwb25zZSxcbiAgICBSZWltYnVyc2VtZW50UmVzcG9uc2UsXG4gICAgUmVpbWJ1cnNlbWVudHNFcnJvclR5cGUsXG4gICAgVXBkYXRlUmVpbWJ1cnNlbWVudEVsaWdpYmlsaXR5SW5wdXQsXG59IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5cbi8qKlxuICogVXBkYXRlUmVpbWJ1cnNlbWVudEVsaWdpYmlsaXR5IHJlc29sdmVyXG4gKlxuICogQHBhcmFtIGZpZWxkTmFtZSBuYW1lIG9mIHRoZSByZXNvbHZlciBwYXRoIGZyb20gdGhlIEFwcFN5bmMgZXZlbnRcbiAqIEBwYXJhbSB1cGRhdGVSZWltYnVyc2VtZW50RWxpZ2liaWxpdHlJbnB1dCB1cGRhdGUgcmVpbWJ1cnNlbWVudCBlbGlnaWJpbGl0eSBpbnB1dCwgdXNlZCB0byB1cGRhdGUgYW4gZXhpc3RlbnQgcmVpbWJ1cnNlbWVudCBlbGlnaWJpbGl0eVxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBSZWltYnVyc2VtZW50UmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCB1cGRhdGVSZWltYnVyc2VtZW50RWxpZ2liaWxpdHkgPSBhc3luYyAoZmllbGROYW1lOiBzdHJpbmcsIHVwZGF0ZVJlaW1idXJzZW1lbnRFbGlnaWJpbGl0eUlucHV0OiBVcGRhdGVSZWltYnVyc2VtZW50RWxpZ2liaWxpdHlJbnB1dCk6IFByb21pc2U8UmVpbWJ1cnNlbWVudEVsaWdpYmlsaXR5UmVzcG9uc2U+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OITtcblxuICAgICAgICAvLyBpbml0aWFsaXppbmcgdGhlIER5bmFtb0RCIGRvY3VtZW50IGNsaWVudFxuICAgICAgICBjb25zdCBkeW5hbW9EYkNsaWVudCA9IG5ldyBEeW5hbW9EQkNsaWVudCh7cmVnaW9uOiByZWdpb259KTtcblxuICAgICAgICAvLyB1cGRhdGUgdGhlIHRpbWVzdGFtcHMgYWNjb3JkaW5nbHlcbiAgICAgICAgY29uc3QgdXBkYXRlZEF0ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgICAgICB1cGRhdGVSZWltYnVyc2VtZW50RWxpZ2liaWxpdHlJbnB1dC51cGRhdGVkQXQgPSB1cGRhdGVSZWltYnVyc2VtZW50RWxpZ2liaWxpdHlJbnB1dC51cGRhdGVkQXQgPyB1cGRhdGVSZWltYnVyc2VtZW50RWxpZ2liaWxpdHlJbnB1dC51cGRhdGVkQXQgOiB1cGRhdGVkQXQ7XG5cbiAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZXJlIGlzIGEgcmVpbWJ1cnNlbWVudCBlbGlnaWJpbGl0eSBvYmplY3QgdG8gdXBkYXRlLiBJZiB0aGVyZSdzIG5vbmUsIHRoZW4gcmV0dXJuIGFuIGVycm9yIGFjY29yZGluZ2x5LlxuICAgICAgICBjb25zdCBwcmVFeGlzdGluZ1JlaW1idXJzZW1lbnRFbGlnaWJpbGl0eU9iamVjdCA9IGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IEdldEl0ZW1Db21tYW5kKHtcbiAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuUkVJTUJVUlNFTUVOVF9FTElHSUJJTElUWV9UQUJMRSEsXG4gICAgICAgICAgICBLZXk6IHtcbiAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICBTOiB1cGRhdGVSZWltYnVyc2VtZW50RWxpZ2liaWxpdHlJbnB1dC5pZFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIHdlJ3JlIG5vdCBpbnRlcmVzdGVkIGluIGdldHRpbmcgYWxsIHRoZSBkYXRhIGZvciB0aGlzIGNhbGwsIGp1c3QgdGhlIG1pbmltdW0gZm9yIHVzIHRvIGRldGVybWluZSB3aGV0aGVyIHRoaXMgaXMgYSBkdXBsaWNhdGUgb3Igbm90XG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2FtYXpvbmR5bmFtb2RiL2xhdGVzdC9kZXZlbG9wZXJndWlkZS9SZXNlcnZlZFdvcmRzLmh0bWxcbiAgICAgICAgICAgICAqIEBsaW5rIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9hbWF6b25keW5hbW9kYi9sYXRlc3QvZGV2ZWxvcGVyZ3VpZGUvRXhwcmVzc2lvbnMuRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzLmh0bWxcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgUHJvamVjdGlvbkV4cHJlc3Npb246ICcjaWRmJyxcbiAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lczoge1xuICAgICAgICAgICAgICAgICcjaWRmJzogJ2lkJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgYW4gaXRlbSByZXRyaWV2ZWQsIHRoZW4gd2UgbmVlZCB0byBjaGVjayBpdHMgY29udGVudHNcbiAgICAgICAgaWYgKHByZUV4aXN0aW5nUmVpbWJ1cnNlbWVudEVsaWdpYmlsaXR5T2JqZWN0ICYmIHByZUV4aXN0aW5nUmVpbWJ1cnNlbWVudEVsaWdpYmlsaXR5T2JqZWN0Lkl0ZW0pIHtcbiAgICAgICAgICAgIC8vIHVwZGF0ZSB0aGUgcmVpbWJ1cnNlbWVudCBlbGlnaWJpbGl0eSBvYmplY3QgYmFzZWQgb24gdGhlIHBhc3NlZCBpbiBvYmplY3RcbiAgICAgICAgICAgIGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IFVwZGF0ZUl0ZW1Db21tYW5kKHtcbiAgICAgICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LlJFSU1CVVJTRU1FTlRfRUxJR0lCSUxJVFlfVEFCTEUhLFxuICAgICAgICAgICAgICAgIEtleToge1xuICAgICAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogdXBkYXRlUmVpbWJ1cnNlbWVudEVsaWdpYmlsaXR5SW5wdXQuaWRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiI2VzdGF0XCI6IFwiZWxpZ2liaWxpdHlTdGF0dXNcIixcbiAgICAgICAgICAgICAgICAgICAgXCIjdWF0XCI6IFwidXBkYXRlZEF0XCJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCI6ZXN0YXRcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogdXBkYXRlUmVpbWJ1cnNlbWVudEVsaWdpYmlsaXR5SW5wdXQuZWxpZ2liaWxpdHlTdGF0dXNcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgXCI6dWF0XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IHVwZGF0ZVJlaW1idXJzZW1lbnRFbGlnaWJpbGl0eUlucHV0LnVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBVcGRhdGVFeHByZXNzaW9uOiBcIlNFVCAjZXN0YXQgPSA6ZXN0YXQsICN1YXQgPSA6dWF0XCIsXG4gICAgICAgICAgICAgICAgUmV0dXJuVmFsdWVzOiBcIlVQREFURURfTkVXXCJcbiAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSB1cGRhdGVkIHJlaW1idXJzZW1lbnQgZWxpZ2liaWxpdHkgb2JqZWN0XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGlkOiB1cGRhdGVSZWltYnVyc2VtZW50RWxpZ2liaWxpdHlJbnB1dC5pZCxcbiAgICAgICAgICAgICAgICBkYXRhOiB1cGRhdGVSZWltYnVyc2VtZW50RWxpZ2liaWxpdHlJbnB1dCBhcyBSZWltYnVyc2VtZW50RWxpZ2liaWxpdHlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmtub3duIHJlaW1idXJzZW1lbnQgZWxpZ2liaWxpdHkgb2JqZWN0IHRvIHVwZGF0ZSFgO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFJlaW1idXJzZW1lbnRzRXJyb3JUeXBlLk5vbmVPckFic2VudFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyAke2ZpZWxkTmFtZX0gbXV0YXRpb24gJHtlcnJ9YDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBSZWltYnVyc2VtZW50c0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==