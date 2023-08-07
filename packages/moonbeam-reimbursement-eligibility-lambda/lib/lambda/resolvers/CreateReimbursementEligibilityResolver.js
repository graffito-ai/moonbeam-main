"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReimbursementEligibility = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * CreateReimbursementEligibility resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param createReimbursementEligibilityInput create reimbursement eligibility input object, used to create a reimbursement
 * eligibility based on a triggered cron event.
 * @returns {@link Promise} of {@link ReimbursementEligibilityResponse}
 */
const createReimbursementEligibility = async (fieldName, createReimbursementEligibilityInput) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // initializing the DynamoDB document client
        const dynamoDbClient = new client_dynamodb_1.DynamoDBClient({ region: region });
        // update the timestamps accordingly
        const createdAt = new Date().toISOString();
        createReimbursementEligibilityInput.createdAt = createReimbursementEligibilityInput.createdAt ? createReimbursementEligibilityInput.createdAt : createdAt;
        createReimbursementEligibilityInput.updatedAt = createReimbursementEligibilityInput.updatedAt ? createReimbursementEligibilityInput.updatedAt : createdAt;
        /**
         * check to see if the reimbursement eligibility already exists in the DB. Although this is a very rare situation, since we have so many resilient
         * methods (such as Dead-Letter-Queue, retries, etc.) we want to put a safeguard around duplicates even here.
         */
        const preExistingReimbursementEligibility = await dynamoDbClient.send(new client_dynamodb_1.GetItemCommand({
            TableName: process.env.REIMBURSEMENT_ELIGIBILITY_TABLE,
            Key: {
                id: {
                    S: createReimbursementEligibilityInput.id
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
        if (preExistingReimbursementEligibility && preExistingReimbursementEligibility.Item) {
            /**
             * if there is a pre-existing reimbursement eligibility with the same primary key,
             * then we cannot duplicate that, so we will return an error.
             */
            const errorMessage = `Duplicate reimbursement eligibility found!`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.ReimbursementsErrorType.DuplicateObjectFound
            };
        }
        else {
            // store the reimbursement eligibility object
            await dynamoDbClient.send(new client_dynamodb_1.PutItemCommand({
                TableName: process.env.REIMBURSEMENT_ELIGIBILITY_TABLE,
                Item: {
                    id: {
                        S: createReimbursementEligibilityInput.id
                    },
                    eligibilityStatus: {
                        S: createReimbursementEligibilityInput.eligibilityStatus
                    },
                    createdAt: {
                        S: createReimbursementEligibilityInput.createdAt
                    },
                    updatedAt: {
                        S: createReimbursementEligibilityInput.updatedAt
                    }
                },
            }));
            // return the reimbursement eligibility object
            return {
                id: createReimbursementEligibilityInput.id,
                data: createReimbursementEligibilityInput
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
exports.createReimbursementEligibility = createReimbursementEligibility;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRlUmVpbWJ1cnNlbWVudEVsaWdpYmlsaXR5UmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL3Jlc29sdmVycy9DcmVhdGVSZWltYnVyc2VtZW50RWxpZ2liaWxpdHlSZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw4REFBd0Y7QUFDeEYsK0RBTW1DO0FBRW5DOzs7Ozs7O0dBT0c7QUFDSSxNQUFNLDhCQUE4QixHQUFHLEtBQUssRUFBRSxTQUFpQixFQUFFLG1DQUF3RSxFQUE2QyxFQUFFO0lBQzNMLElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsNENBQTRDO1FBQzVDLE1BQU0sY0FBYyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBRTVELG9DQUFvQztRQUNwQyxNQUFNLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzNDLG1DQUFtQyxDQUFDLFNBQVMsR0FBRyxtQ0FBbUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLG1DQUFtQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQzFKLG1DQUFtQyxDQUFDLFNBQVMsR0FBRyxtQ0FBbUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLG1DQUFtQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBRTFKOzs7V0FHRztRQUNILE1BQU0sbUNBQW1DLEdBQUcsTUFBTSxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksZ0NBQWMsQ0FBQztZQUNyRixTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQywrQkFBZ0M7WUFDdkQsR0FBRyxFQUFFO2dCQUNELEVBQUUsRUFBRTtvQkFDQSxDQUFDLEVBQUUsbUNBQW1DLENBQUMsRUFBRTtpQkFDNUM7YUFDSjtZQUNEOzs7OztlQUtHO1lBQ0gsb0JBQW9CLEVBQUUsTUFBTTtZQUM1Qix3QkFBd0IsRUFBRTtnQkFDdEIsTUFBTSxFQUFFLElBQUk7YUFDZjtTQUNKLENBQUMsQ0FBQyxDQUFDO1FBRUosb0VBQW9FO1FBQ3BFLElBQUksbUNBQW1DLElBQUksbUNBQW1DLENBQUMsSUFBSSxFQUFFO1lBQ2pGOzs7ZUFHRztZQUNILE1BQU0sWUFBWSxHQUFHLDRDQUE0QyxDQUFDO1lBQ2xFLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7WUFFMUIsT0FBTztnQkFDSCxZQUFZLEVBQUUsWUFBWTtnQkFDMUIsU0FBUyxFQUFFLHlDQUF1QixDQUFDLG9CQUFvQjthQUMxRCxDQUFBO1NBQ0o7YUFBTTtZQUNILDZDQUE2QztZQUM3QyxNQUFNLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxnQ0FBYyxDQUFDO2dCQUN6QyxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQywrQkFBZ0M7Z0JBQ3ZELElBQUksRUFBRTtvQkFDRixFQUFFLEVBQUU7d0JBQ0EsQ0FBQyxFQUFFLG1DQUFtQyxDQUFDLEVBQUU7cUJBQzVDO29CQUNELGlCQUFpQixFQUFFO3dCQUNmLENBQUMsRUFBRSxtQ0FBbUMsQ0FBQyxpQkFBbUQ7cUJBQzdGO29CQUNELFNBQVMsRUFBRTt3QkFDUCxDQUFDLEVBQUUsbUNBQW1DLENBQUMsU0FBVTtxQkFDcEQ7b0JBQ0QsU0FBUyxFQUFFO3dCQUNQLENBQUMsRUFBRSxtQ0FBbUMsQ0FBQyxTQUFVO3FCQUNwRDtpQkFDSjthQUNKLENBQUMsQ0FBQyxDQUFDO1lBRUosOENBQThDO1lBQzlDLE9BQU87Z0JBQ0gsRUFBRSxFQUFFLG1DQUFtQyxDQUFDLEVBQUU7Z0JBQzFDLElBQUksRUFBRSxtQ0FBK0Q7YUFDeEUsQ0FBQTtTQUNKO0tBQ0o7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNWLE1BQU0sWUFBWSxHQUFHLG9DQUFvQyxTQUFTLGFBQWEsR0FBRyxFQUFFLENBQUM7UUFDckYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMxQixPQUFPO1lBQ0gsWUFBWSxFQUFFLFlBQVk7WUFDMUIsU0FBUyxFQUFFLHlDQUF1QixDQUFDLGVBQWU7U0FDckQsQ0FBQTtLQUNKO0FBQ0wsQ0FBQyxDQUFBO0FBbkZZLFFBQUEsOEJBQThCLGtDQW1GMUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0R5bmFtb0RCQ2xpZW50LCBHZXRJdGVtQ29tbWFuZCwgUHV0SXRlbUNvbW1hbmR9IGZyb20gXCJAYXdzLXNkay9jbGllbnQtZHluYW1vZGJcIjtcbmltcG9ydCB7XG4gICAgQ3JlYXRlUmVpbWJ1cnNlbWVudEVsaWdpYmlsaXR5SW5wdXQsXG4gICAgUmVpbWJ1cnNlbWVudEVsaWdpYmlsaXR5LFxuICAgIFJlaW1idXJzZW1lbnRFbGlnaWJpbGl0eVJlc3BvbnNlLFxuICAgIFJlaW1idXJzZW1lbnRFbGlnaWJpbGl0eVN0YXR1cyxcbiAgICBSZWltYnVyc2VtZW50c0Vycm9yVHlwZVxufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuXG4vKipcbiAqIENyZWF0ZVJlaW1idXJzZW1lbnRFbGlnaWJpbGl0eSByZXNvbHZlclxuICpcbiAqIEBwYXJhbSBmaWVsZE5hbWUgbmFtZSBvZiB0aGUgcmVzb2x2ZXIgcGF0aCBmcm9tIHRoZSBBcHBTeW5jIGV2ZW50XG4gKiBAcGFyYW0gY3JlYXRlUmVpbWJ1cnNlbWVudEVsaWdpYmlsaXR5SW5wdXQgY3JlYXRlIHJlaW1idXJzZW1lbnQgZWxpZ2liaWxpdHkgaW5wdXQgb2JqZWN0LCB1c2VkIHRvIGNyZWF0ZSBhIHJlaW1idXJzZW1lbnRcbiAqIGVsaWdpYmlsaXR5IGJhc2VkIG9uIGEgdHJpZ2dlcmVkIGNyb24gZXZlbnQuXG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIFJlaW1idXJzZW1lbnRFbGlnaWJpbGl0eVJlc3BvbnNlfVxuICovXG5leHBvcnQgY29uc3QgY3JlYXRlUmVpbWJ1cnNlbWVudEVsaWdpYmlsaXR5ID0gYXN5bmMgKGZpZWxkTmFtZTogc3RyaW5nLCBjcmVhdGVSZWltYnVyc2VtZW50RWxpZ2liaWxpdHlJbnB1dDogQ3JlYXRlUmVpbWJ1cnNlbWVudEVsaWdpYmlsaXR5SW5wdXQpOiBQcm9taXNlPFJlaW1idXJzZW1lbnRFbGlnaWJpbGl0eVJlc3BvbnNlPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLy8gaW5pdGlhbGl6aW5nIHRoZSBEeW5hbW9EQiBkb2N1bWVudCBjbGllbnRcbiAgICAgICAgY29uc3QgZHluYW1vRGJDbGllbnQgPSBuZXcgRHluYW1vREJDbGllbnQoe3JlZ2lvbjogcmVnaW9ufSk7XG5cbiAgICAgICAgLy8gdXBkYXRlIHRoZSB0aW1lc3RhbXBzIGFjY29yZGluZ2x5XG4gICAgICAgIGNvbnN0IGNyZWF0ZWRBdCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICAgICAgY3JlYXRlUmVpbWJ1cnNlbWVudEVsaWdpYmlsaXR5SW5wdXQuY3JlYXRlZEF0ID0gY3JlYXRlUmVpbWJ1cnNlbWVudEVsaWdpYmlsaXR5SW5wdXQuY3JlYXRlZEF0ID8gY3JlYXRlUmVpbWJ1cnNlbWVudEVsaWdpYmlsaXR5SW5wdXQuY3JlYXRlZEF0IDogY3JlYXRlZEF0O1xuICAgICAgICBjcmVhdGVSZWltYnVyc2VtZW50RWxpZ2liaWxpdHlJbnB1dC51cGRhdGVkQXQgPSBjcmVhdGVSZWltYnVyc2VtZW50RWxpZ2liaWxpdHlJbnB1dC51cGRhdGVkQXQgPyBjcmVhdGVSZWltYnVyc2VtZW50RWxpZ2liaWxpdHlJbnB1dC51cGRhdGVkQXQgOiBjcmVhdGVkQXQ7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIGNoZWNrIHRvIHNlZSBpZiB0aGUgcmVpbWJ1cnNlbWVudCBlbGlnaWJpbGl0eSBhbHJlYWR5IGV4aXN0cyBpbiB0aGUgREIuIEFsdGhvdWdoIHRoaXMgaXMgYSB2ZXJ5IHJhcmUgc2l0dWF0aW9uLCBzaW5jZSB3ZSBoYXZlIHNvIG1hbnkgcmVzaWxpZW50XG4gICAgICAgICAqIG1ldGhvZHMgKHN1Y2ggYXMgRGVhZC1MZXR0ZXItUXVldWUsIHJldHJpZXMsIGV0Yy4pIHdlIHdhbnQgdG8gcHV0IGEgc2FmZWd1YXJkIGFyb3VuZCBkdXBsaWNhdGVzIGV2ZW4gaGVyZS5cbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IHByZUV4aXN0aW5nUmVpbWJ1cnNlbWVudEVsaWdpYmlsaXR5ID0gYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgR2V0SXRlbUNvbW1hbmQoe1xuICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5SRUlNQlVSU0VNRU5UX0VMSUdJQklMSVRZX1RBQkxFISxcbiAgICAgICAgICAgIEtleToge1xuICAgICAgICAgICAgICAgIGlkOiB7XG4gICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZVJlaW1idXJzZW1lbnRFbGlnaWJpbGl0eUlucHV0LmlkXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogd2UncmUgbm90IGludGVyZXN0ZWQgaW4gZ2V0dGluZyBhbGwgdGhlIGRhdGEgZm9yIHRoaXMgY2FsbCwganVzdCB0aGUgbWluaW11bSBmb3IgdXMgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdGhpcyBpcyBhIGR1cGxpY2F0ZSBvciBub3RcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBAbGluayBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L2RldmVsb3Blcmd1aWRlL1Jlc2VydmVkV29yZHMuaHRtbFxuICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2FtYXpvbmR5bmFtb2RiL2xhdGVzdC9kZXZlbG9wZXJndWlkZS9FeHByZXNzaW9ucy5FeHByZXNzaW9uQXR0cmlidXRlTmFtZXMuaHRtbFxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBQcm9qZWN0aW9uRXhwcmVzc2lvbjogJyNpZGYnLFxuICAgICAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzOiB7XG4gICAgICAgICAgICAgICAgJyNpZGYnOiAnaWQnXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcblxuICAgICAgICAvLyBpZiB0aGVyZSBpcyBhbiBpdGVtIHJldHJpZXZlZCwgdGhlbiB3ZSBuZWVkIHRvIGNoZWNrIGl0cyBjb250ZW50c1xuICAgICAgICBpZiAocHJlRXhpc3RpbmdSZWltYnVyc2VtZW50RWxpZ2liaWxpdHkgJiYgcHJlRXhpc3RpbmdSZWltYnVyc2VtZW50RWxpZ2liaWxpdHkuSXRlbSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBpZiB0aGVyZSBpcyBhIHByZS1leGlzdGluZyByZWltYnVyc2VtZW50IGVsaWdpYmlsaXR5IHdpdGggdGhlIHNhbWUgcHJpbWFyeSBrZXksXG4gICAgICAgICAgICAgKiB0aGVuIHdlIGNhbm5vdCBkdXBsaWNhdGUgdGhhdCwgc28gd2Ugd2lsbCByZXR1cm4gYW4gZXJyb3IuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBEdXBsaWNhdGUgcmVpbWJ1cnNlbWVudCBlbGlnaWJpbGl0eSBmb3VuZCFgO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFJlaW1idXJzZW1lbnRzRXJyb3JUeXBlLkR1cGxpY2F0ZU9iamVjdEZvdW5kXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBzdG9yZSB0aGUgcmVpbWJ1cnNlbWVudCBlbGlnaWJpbGl0eSBvYmplY3RcbiAgICAgICAgICAgIGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IFB1dEl0ZW1Db21tYW5kKHtcbiAgICAgICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LlJFSU1CVVJTRU1FTlRfRUxJR0lCSUxJVFlfVEFCTEUhLFxuICAgICAgICAgICAgICAgIEl0ZW06IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZVJlaW1idXJzZW1lbnRFbGlnaWJpbGl0eUlucHV0LmlkXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGVsaWdpYmlsaXR5U3RhdHVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVSZWltYnVyc2VtZW50RWxpZ2liaWxpdHlJbnB1dC5lbGlnaWJpbGl0eVN0YXR1cyBhcyBSZWltYnVyc2VtZW50RWxpZ2liaWxpdHlTdGF0dXNcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEF0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVSZWltYnVyc2VtZW50RWxpZ2liaWxpdHlJbnB1dC5jcmVhdGVkQXQhXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRBdDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlUmVpbWJ1cnNlbWVudEVsaWdpYmlsaXR5SW5wdXQudXBkYXRlZEF0IVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSByZWltYnVyc2VtZW50IGVsaWdpYmlsaXR5IG9iamVjdFxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBpZDogY3JlYXRlUmVpbWJ1cnNlbWVudEVsaWdpYmlsaXR5SW5wdXQuaWQsXG4gICAgICAgICAgICAgICAgZGF0YTogY3JlYXRlUmVpbWJ1cnNlbWVudEVsaWdpYmlsaXR5SW5wdXQgYXMgUmVpbWJ1cnNlbWVudEVsaWdpYmlsaXR5XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nICR7ZmllbGROYW1lfSBtdXRhdGlvbiAke2Vycn1gO1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICBlcnJvclR5cGU6IFJlaW1idXJzZW1lbnRzRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICB9XG4gICAgfVxufVxuIl19