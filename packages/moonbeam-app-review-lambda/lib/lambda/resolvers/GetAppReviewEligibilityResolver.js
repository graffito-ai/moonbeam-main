"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppReviewEligibility = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * GetAppReviewEligibility resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getAppReviewEligibilityInput the input passed in, used to retrieve a user's
 * eligibility in terms of App Store reviews.
 *
 * @returns {@link Promise} of {@link GetAppReviewEligibilityResponse}
 */
const getAppReviewEligibility = async (fieldName, getAppReviewEligibilityInput) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // initializing the DynamoDB document client
        const dynamoDbClient = new client_dynamodb_1.DynamoDBClient({ region: region });
        /**
         * check to see if there is an existing App Review for the user.
         */
        const preExistingAppReview = getAppReviewEligibilityInput.id && await dynamoDbClient.send(new client_dynamodb_1.GetItemCommand({
            TableName: process.env.APP_REVIEW_TABLE,
            Key: {
                id: {
                    S: getAppReviewEligibilityInput.id
                }
            }
        }));
        /**
         * if there is an item retrieved, then evaluate whether the user is eligible given the information retrieved.
         * Otherwise, just return that the user is eligible for a new App Review, given that they do not have one associated with them.
         */
        if (preExistingAppReview && preExistingAppReview.Item) {
            /**
             * we establish that a user is eligible for a new App Review, if the updatedAt date/time of an existent
             * App Review record for a user, is at least 3 months from today's date/time.
             *
             * first retrieve the retrieved record's updatedAt timestamp.
             */
            const preExistingUpdateAtDate = new Date(preExistingAppReview.Item.updatedAt.S);
            // get today's date/time
            const dateNow = new Date();
            // compare today's date with the pre-existing record's updateAt timestamp
            var months;
            months = (dateNow.getFullYear() - preExistingUpdateAtDate.getFullYear()) * 12;
            months -= preExistingUpdateAtDate.getMonth();
            months += dateNow.getMonth();
            months = months <= 0 ? 0 : months;
            // 3 months is the cutoff for receiving another App Review notification
            if (months > 3) {
                const message = `User ${getAppReviewEligibilityInput.id} has not received done App Review in the past 3 months. User is therefore ELIGIBLE`;
                console.log(message);
                return {
                    data: true
                };
            }
            else {
                const message = `User ${getAppReviewEligibilityInput.id} has already received done App Review in the past 3 months. User is therefore NOT ELIGIBLE`;
                console.log(message);
                return {
                    data: false
                };
            }
        }
        else {
            const message = `No App Review associated with user ${getAppReviewEligibilityInput.id}. User is therefore ELIGIBLE!`;
            console.log(message);
            return {
                data: true
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
exports.getAppReviewEligibility = getAppReviewEligibility;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0QXBwUmV2aWV3RWxpZ2liaWxpdHlSZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL0dldEFwcFJldmlld0VsaWdpYmlsaXR5UmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsOERBQXdFO0FBQ3hFLCtEQUltQztBQUVuQzs7Ozs7Ozs7R0FRRztBQUNJLE1BQU0sdUJBQXVCLEdBQUcsS0FBSyxFQUFFLFNBQWlCLEVBQUUsNEJBQTBELEVBQTRDLEVBQUU7SUFDckssSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2Qyw0Q0FBNEM7UUFDNUMsTUFBTSxjQUFjLEdBQUcsSUFBSSxnQ0FBYyxDQUFDLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7UUFFNUQ7O1dBRUc7UUFDSCxNQUFNLG9CQUFvQixHQUFHLDRCQUE0QixDQUFDLEVBQUUsSUFBSSxNQUFNLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxnQ0FBYyxDQUFDO1lBQ3pHLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFpQjtZQUN4QyxHQUFHLEVBQUU7Z0JBQ0QsRUFBRSxFQUFFO29CQUNBLENBQUMsRUFBRSw0QkFBNEIsQ0FBQyxFQUFFO2lCQUNyQzthQUNKO1NBQ0osQ0FBQyxDQUFDLENBQUM7UUFFSjs7O1dBR0c7UUFDSCxJQUFJLG9CQUFvQixJQUFJLG9CQUFvQixDQUFDLElBQUksRUFBRTtZQUNuRDs7Ozs7ZUFLRztZQUNILE1BQU0sdUJBQXVCLEdBQUcsSUFBSSxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFFLENBQUMsQ0FBQztZQUVqRix3QkFBd0I7WUFDeEIsTUFBTSxPQUFPLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztZQUUzQix5RUFBeUU7WUFDekUsSUFBSSxNQUFNLENBQUM7WUFDWCxNQUFNLEdBQUcsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLEdBQUcsdUJBQXVCLENBQUMsV0FBVyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDOUUsTUFBTSxJQUFJLHVCQUF1QixDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQzdDLE1BQU0sSUFBSSxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDN0IsTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO1lBQ2xDLHVFQUF1RTtZQUN2RSxJQUFJLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ1osTUFBTSxPQUFPLEdBQUcsUUFBUSw0QkFBNEIsQ0FBQyxFQUFFLG9GQUFvRixDQUFDO2dCQUM1SSxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUNyQixPQUFPO29CQUNILElBQUksRUFBRSxJQUFJO2lCQUNiLENBQUE7YUFDSjtpQkFBTTtnQkFDSCxNQUFNLE9BQU8sR0FBRyxRQUFRLDRCQUE0QixDQUFDLEVBQUUsNEZBQTRGLENBQUM7Z0JBQ3BKLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3JCLE9BQU87b0JBQ0gsSUFBSSxFQUFFLEtBQUs7aUJBQ2QsQ0FBQTthQUNKO1NBQ0o7YUFBTTtZQUNILE1BQU0sT0FBTyxHQUFHLHNDQUFzQyw0QkFBNEIsQ0FBQyxFQUFFLCtCQUErQixDQUFDO1lBQ3JILE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDckIsT0FBTztnQkFDSCxJQUFJLEVBQUUsSUFBSTthQUNiLENBQUM7U0FDTDtLQUNKO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDVixNQUFNLFlBQVksR0FBRyxvQ0FBb0MsU0FBUyxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ2xGLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUIsT0FBTztZQUNILFlBQVksRUFBRSxZQUFZO1lBQzFCLFNBQVMsRUFBRSxvQ0FBa0IsQ0FBQyxlQUFlO1NBQ2hELENBQUM7S0FDTDtBQUNMLENBQUMsQ0FBQTtBQXZFWSxRQUFBLHVCQUF1QiwyQkF1RW5DIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtEeW5hbW9EQkNsaWVudCwgR2V0SXRlbUNvbW1hbmR9IGZyb20gXCJAYXdzLXNkay9jbGllbnQtZHluYW1vZGJcIjtcbmltcG9ydCB7XG4gICAgQXBwUmV2aWV3RXJyb3JUeXBlLFxuICAgIEdldEFwcFJldmlld0VsaWdpYmlsaXR5SW5wdXQsXG4gICAgR2V0QXBwUmV2aWV3RWxpZ2liaWxpdHlSZXNwb25zZVxufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuXG4vKipcbiAqIEdldEFwcFJldmlld0VsaWdpYmlsaXR5IHJlc29sdmVyXG4gKlxuICogQHBhcmFtIGZpZWxkTmFtZSBuYW1lIG9mIHRoZSByZXNvbHZlciBwYXRoIGZyb20gdGhlIEFwcFN5bmMgZXZlbnRcbiAqIEBwYXJhbSBnZXRBcHBSZXZpZXdFbGlnaWJpbGl0eUlucHV0IHRoZSBpbnB1dCBwYXNzZWQgaW4sIHVzZWQgdG8gcmV0cmlldmUgYSB1c2VyJ3NcbiAqIGVsaWdpYmlsaXR5IGluIHRlcm1zIG9mIEFwcCBTdG9yZSByZXZpZXdzLlxuICpcbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgR2V0QXBwUmV2aWV3RWxpZ2liaWxpdHlSZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IGdldEFwcFJldmlld0VsaWdpYmlsaXR5ID0gYXN5bmMgKGZpZWxkTmFtZTogc3RyaW5nLCBnZXRBcHBSZXZpZXdFbGlnaWJpbGl0eUlucHV0OiBHZXRBcHBSZXZpZXdFbGlnaWJpbGl0eUlucHV0KTogUHJvbWlzZTxHZXRBcHBSZXZpZXdFbGlnaWJpbGl0eVJlc3BvbnNlPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLy8gaW5pdGlhbGl6aW5nIHRoZSBEeW5hbW9EQiBkb2N1bWVudCBjbGllbnRcbiAgICAgICAgY29uc3QgZHluYW1vRGJDbGllbnQgPSBuZXcgRHluYW1vREJDbGllbnQoe3JlZ2lvbjogcmVnaW9ufSk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIGNoZWNrIHRvIHNlZSBpZiB0aGVyZSBpcyBhbiBleGlzdGluZyBBcHAgUmV2aWV3IGZvciB0aGUgdXNlci5cbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IHByZUV4aXN0aW5nQXBwUmV2aWV3ID0gZ2V0QXBwUmV2aWV3RWxpZ2liaWxpdHlJbnB1dC5pZCAmJiBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBHZXRJdGVtQ29tbWFuZCh7XG4gICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LkFQUF9SRVZJRVdfVEFCTEUhLFxuICAgICAgICAgICAgS2V5OiB7XG4gICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgUzogZ2V0QXBwUmV2aWV3RWxpZ2liaWxpdHlJbnB1dC5pZFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBpZiB0aGVyZSBpcyBhbiBpdGVtIHJldHJpZXZlZCwgdGhlbiBldmFsdWF0ZSB3aGV0aGVyIHRoZSB1c2VyIGlzIGVsaWdpYmxlIGdpdmVuIHRoZSBpbmZvcm1hdGlvbiByZXRyaWV2ZWQuXG4gICAgICAgICAqIE90aGVyd2lzZSwganVzdCByZXR1cm4gdGhhdCB0aGUgdXNlciBpcyBlbGlnaWJsZSBmb3IgYSBuZXcgQXBwIFJldmlldywgZ2l2ZW4gdGhhdCB0aGV5IGRvIG5vdCBoYXZlIG9uZSBhc3NvY2lhdGVkIHdpdGggdGhlbS5cbiAgICAgICAgICovXG4gICAgICAgIGlmIChwcmVFeGlzdGluZ0FwcFJldmlldyAmJiBwcmVFeGlzdGluZ0FwcFJldmlldy5JdGVtKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIHdlIGVzdGFibGlzaCB0aGF0IGEgdXNlciBpcyBlbGlnaWJsZSBmb3IgYSBuZXcgQXBwIFJldmlldywgaWYgdGhlIHVwZGF0ZWRBdCBkYXRlL3RpbWUgb2YgYW4gZXhpc3RlbnRcbiAgICAgICAgICAgICAqIEFwcCBSZXZpZXcgcmVjb3JkIGZvciBhIHVzZXIsIGlzIGF0IGxlYXN0IDMgbW9udGhzIGZyb20gdG9kYXkncyBkYXRlL3RpbWUuXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogZmlyc3QgcmV0cmlldmUgdGhlIHJldHJpZXZlZCByZWNvcmQncyB1cGRhdGVkQXQgdGltZXN0YW1wLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBjb25zdCBwcmVFeGlzdGluZ1VwZGF0ZUF0RGF0ZSA9IG5ldyBEYXRlKHByZUV4aXN0aW5nQXBwUmV2aWV3Lkl0ZW0udXBkYXRlZEF0LlMhKTtcblxuICAgICAgICAgICAgLy8gZ2V0IHRvZGF5J3MgZGF0ZS90aW1lXG4gICAgICAgICAgICBjb25zdCBkYXRlTm93ID0gbmV3IERhdGUoKTtcblxuICAgICAgICAgICAgLy8gY29tcGFyZSB0b2RheSdzIGRhdGUgd2l0aCB0aGUgcHJlLWV4aXN0aW5nIHJlY29yZCdzIHVwZGF0ZUF0IHRpbWVzdGFtcFxuICAgICAgICAgICAgdmFyIG1vbnRocztcbiAgICAgICAgICAgIG1vbnRocyA9IChkYXRlTm93LmdldEZ1bGxZZWFyKCkgLSBwcmVFeGlzdGluZ1VwZGF0ZUF0RGF0ZS5nZXRGdWxsWWVhcigpKSAqIDEyO1xuICAgICAgICAgICAgbW9udGhzIC09IHByZUV4aXN0aW5nVXBkYXRlQXREYXRlLmdldE1vbnRoKCk7XG4gICAgICAgICAgICBtb250aHMgKz0gZGF0ZU5vdy5nZXRNb250aCgpO1xuICAgICAgICAgICAgbW9udGhzID0gbW9udGhzIDw9IDAgPyAwIDogbW9udGhzO1xuICAgICAgICAgICAgLy8gMyBtb250aHMgaXMgdGhlIGN1dG9mZiBmb3IgcmVjZWl2aW5nIGFub3RoZXIgQXBwIFJldmlldyBub3RpZmljYXRpb25cbiAgICAgICAgICAgIGlmIChtb250aHMgPiAzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9IGBVc2VyICR7Z2V0QXBwUmV2aWV3RWxpZ2liaWxpdHlJbnB1dC5pZH0gaGFzIG5vdCByZWNlaXZlZCBkb25lIEFwcCBSZXZpZXcgaW4gdGhlIHBhc3QgMyBtb250aHMuIFVzZXIgaXMgdGhlcmVmb3JlIEVMSUdJQkxFYDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiB0cnVlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gYFVzZXIgJHtnZXRBcHBSZXZpZXdFbGlnaWJpbGl0eUlucHV0LmlkfSBoYXMgYWxyZWFkeSByZWNlaXZlZCBkb25lIEFwcCBSZXZpZXcgaW4gdGhlIHBhc3QgMyBtb250aHMuIFVzZXIgaXMgdGhlcmVmb3JlIE5PVCBFTElHSUJMRWA7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cobWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogZmFsc2VcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gYE5vIEFwcCBSZXZpZXcgYXNzb2NpYXRlZCB3aXRoIHVzZXIgJHtnZXRBcHBSZXZpZXdFbGlnaWJpbGl0eUlucHV0LmlkfS4gVXNlciBpcyB0aGVyZWZvcmUgRUxJR0lCTEUhYDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKG1lc3NhZ2UpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBkYXRhOiB0cnVlXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyAke2ZpZWxkTmFtZX0gcXVlcnkgJHtlcnJ9YDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBBcHBSZXZpZXdFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH07XG4gICAgfVxufVxuIl19