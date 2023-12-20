"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserCardLinkingId = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * GetEligibleLinkedUsers resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getUserCardLinkingIdInput input containing the Moonbeam internal ID, used to
 * retrieve a user's card linking ID.
 * @returns {@link Promise} of {@link GetUserCardLinkingIdResponse}
 */
const getUserCardLinkingId = async (fieldName, getUserCardLinkingIdInput) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        /**
         * retrieve the member details for a card-linked member with an external member id representing
         * the Moonbeam internal ID, in order to retrieve the card linking ID.
         *
         * first, initialize the Olive Client API here, in order to call the appropriate endpoints for this handler
         */
        const oliveClient = new moonbeam_models_1.OliveClient(process.env.ENV_NAME, region);
        const userCardLinkingIdResponse = await oliveClient.getUserCardLinkingId(getUserCardLinkingIdInput);
        // check to see if the get user card linking ID call was successful or not
        if (userCardLinkingIdResponse && !userCardLinkingIdResponse.errorMessage && !userCardLinkingIdResponse.errorType &&
            userCardLinkingIdResponse.data && userCardLinkingIdResponse.data.length !== 0) {
            // return the external/user's card linking id accordingly
            return {
                data: userCardLinkingIdResponse.data
            };
        }
        else {
            // check if there are no users matched for that Moonbeam internal ID, and return the appropriate error
            if (userCardLinkingIdResponse.errorType === moonbeam_models_1.CardLinkErrorType.NoneOrAbsent) {
                console.log(userCardLinkingIdResponse.errorMessage);
                return {
                    errorMessage: userCardLinkingIdResponse.errorMessage,
                    errorType: userCardLinkingIdResponse.errorType
                };
            }
            else {
                const errorMessage = `Retrieving member details through the getUserCardLinkingId call failed`;
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: moonbeam_models_1.CardLinkErrorType.UnexpectedError
                };
            }
        }
    }
    catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: moonbeam_models_1.CardLinkErrorType.UnexpectedError
        };
    }
};
exports.getUserCardLinkingId = getUserCardLinkingId;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0VXNlckNhcmRMaW5raW5nSWRSZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL0dldFVzZXJDYXJkTGlua2luZ0lkUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0RBS21DO0FBRW5DOzs7Ozs7O0dBT0c7QUFDSSxNQUFNLG9CQUFvQixHQUFHLEtBQUssRUFBRSxTQUFpQixFQUFFLHlCQUFvRCxFQUF5QyxFQUFFO0lBQ3pKLElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkM7Ozs7O1dBS0c7UUFDSCxNQUFNLFdBQVcsR0FBRyxJQUFJLDZCQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDbkUsTUFBTSx5QkFBeUIsR0FBaUMsTUFBTSxXQUFXLENBQUMsb0JBQW9CLENBQUMseUJBQXlCLENBQUMsQ0FBQztRQUVsSSwwRUFBMEU7UUFDMUUsSUFBSSx5QkFBeUIsSUFBSSxDQUFDLHlCQUF5QixDQUFDLFlBQVksSUFBSSxDQUFDLHlCQUF5QixDQUFDLFNBQVM7WUFDNUcseUJBQXlCLENBQUMsSUFBSSxJQUFJLHlCQUF5QixDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQy9FLHlEQUF5RDtZQUN6RCxPQUFPO2dCQUNILElBQUksRUFBRSx5QkFBeUIsQ0FBQyxJQUFJO2FBQ3ZDLENBQUE7U0FDSjthQUFNO1lBQ0gsc0dBQXNHO1lBQ3RHLElBQUkseUJBQXlCLENBQUMsU0FBUyxLQUFLLG1DQUFpQixDQUFDLFlBQVksRUFBRTtnQkFDeEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFFcEQsT0FBTztvQkFDSCxZQUFZLEVBQUUseUJBQXlCLENBQUMsWUFBWTtvQkFDcEQsU0FBUyxFQUFFLHlCQUF5QixDQUFDLFNBQVM7aUJBQ2pELENBQUE7YUFDSjtpQkFBTTtnQkFDSCxNQUFNLFlBQVksR0FBRyx3RUFBd0UsQ0FBQztnQkFDOUYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFFMUIsT0FBTztvQkFDSCxZQUFZLEVBQUUsWUFBWTtvQkFDMUIsU0FBUyxFQUFFLG1DQUFpQixDQUFDLGVBQWU7aUJBQy9DLENBQUE7YUFDSjtTQUNKO0tBQ0o7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNWLE1BQU0sWUFBWSxHQUFHLG9DQUFvQyxTQUFTLFVBQVUsR0FBRyxFQUFFLENBQUM7UUFDbEYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMxQixPQUFPO1lBQ0gsWUFBWSxFQUFFLFlBQVk7WUFDMUIsU0FBUyxFQUFFLG1DQUFpQixDQUFDLGVBQWU7U0FDL0MsQ0FBQztLQUNMO0FBQ0wsQ0FBQyxDQUFBO0FBaERZLFFBQUEsb0JBQW9CLHdCQWdEaEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICAgIENhcmRMaW5rRXJyb3JUeXBlLFxuICAgIEdldFVzZXJDYXJkTGlua2luZ0lkSW5wdXQsXG4gICAgR2V0VXNlckNhcmRMaW5raW5nSWRSZXNwb25zZSxcbiAgICBPbGl2ZUNsaWVudFxufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuXG4vKipcbiAqIEdldEVsaWdpYmxlTGlua2VkVXNlcnMgcmVzb2x2ZXJcbiAqXG4gKiBAcGFyYW0gZmllbGROYW1lIG5hbWUgb2YgdGhlIHJlc29sdmVyIHBhdGggZnJvbSB0aGUgQXBwU3luYyBldmVudFxuICogQHBhcmFtIGdldFVzZXJDYXJkTGlua2luZ0lkSW5wdXQgaW5wdXQgY29udGFpbmluZyB0aGUgTW9vbmJlYW0gaW50ZXJuYWwgSUQsIHVzZWQgdG9cbiAqIHJldHJpZXZlIGEgdXNlcidzIGNhcmQgbGlua2luZyBJRC5cbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgR2V0VXNlckNhcmRMaW5raW5nSWRSZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IGdldFVzZXJDYXJkTGlua2luZ0lkID0gYXN5bmMgKGZpZWxkTmFtZTogc3RyaW5nLCBnZXRVc2VyQ2FyZExpbmtpbmdJZElucHV0OiBHZXRVc2VyQ2FyZExpbmtpbmdJZElucHV0KTogUHJvbWlzZTxHZXRVc2VyQ2FyZExpbmtpbmdJZFJlc3BvbnNlPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIHJldHJpZXZlIHRoZSBtZW1iZXIgZGV0YWlscyBmb3IgYSBjYXJkLWxpbmtlZCBtZW1iZXIgd2l0aCBhbiBleHRlcm5hbCBtZW1iZXIgaWQgcmVwcmVzZW50aW5nXG4gICAgICAgICAqIHRoZSBNb29uYmVhbSBpbnRlcm5hbCBJRCwgaW4gb3JkZXIgdG8gcmV0cmlldmUgdGhlIGNhcmQgbGlua2luZyBJRC5cbiAgICAgICAgICpcbiAgICAgICAgICogZmlyc3QsIGluaXRpYWxpemUgdGhlIE9saXZlIENsaWVudCBBUEkgaGVyZSwgaW4gb3JkZXIgdG8gY2FsbCB0aGUgYXBwcm9wcmlhdGUgZW5kcG9pbnRzIGZvciB0aGlzIGhhbmRsZXJcbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IG9saXZlQ2xpZW50ID0gbmV3IE9saXZlQ2xpZW50KHByb2Nlc3MuZW52LkVOVl9OQU1FISwgcmVnaW9uKTtcbiAgICAgICAgY29uc3QgdXNlckNhcmRMaW5raW5nSWRSZXNwb25zZTogR2V0VXNlckNhcmRMaW5raW5nSWRSZXNwb25zZSA9IGF3YWl0IG9saXZlQ2xpZW50LmdldFVzZXJDYXJkTGlua2luZ0lkKGdldFVzZXJDYXJkTGlua2luZ0lkSW5wdXQpO1xuXG4gICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgZ2V0IHVzZXIgY2FyZCBsaW5raW5nIElEIGNhbGwgd2FzIHN1Y2Nlc3NmdWwgb3Igbm90XG4gICAgICAgIGlmICh1c2VyQ2FyZExpbmtpbmdJZFJlc3BvbnNlICYmICF1c2VyQ2FyZExpbmtpbmdJZFJlc3BvbnNlLmVycm9yTWVzc2FnZSAmJiAhdXNlckNhcmRMaW5raW5nSWRSZXNwb25zZS5lcnJvclR5cGUgJiZcbiAgICAgICAgICAgIHVzZXJDYXJkTGlua2luZ0lkUmVzcG9uc2UuZGF0YSAmJiB1c2VyQ2FyZExpbmtpbmdJZFJlc3BvbnNlLmRhdGEubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAvLyByZXR1cm4gdGhlIGV4dGVybmFsL3VzZXIncyBjYXJkIGxpbmtpbmcgaWQgYWNjb3JkaW5nbHlcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGF0YTogdXNlckNhcmRMaW5raW5nSWRSZXNwb25zZS5kYXRhXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBjaGVjayBpZiB0aGVyZSBhcmUgbm8gdXNlcnMgbWF0Y2hlZCBmb3IgdGhhdCBNb29uYmVhbSBpbnRlcm5hbCBJRCwgYW5kIHJldHVybiB0aGUgYXBwcm9wcmlhdGUgZXJyb3JcbiAgICAgICAgICAgIGlmICh1c2VyQ2FyZExpbmtpbmdJZFJlc3BvbnNlLmVycm9yVHlwZSA9PT0gQ2FyZExpbmtFcnJvclR5cGUuTm9uZU9yQWJzZW50KSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2codXNlckNhcmRMaW5raW5nSWRSZXNwb25zZS5lcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiB1c2VyQ2FyZExpbmtpbmdJZFJlc3BvbnNlLmVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiB1c2VyQ2FyZExpbmtpbmdJZFJlc3BvbnNlLmVycm9yVHlwZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFJldHJpZXZpbmcgbWVtYmVyIGRldGFpbHMgdGhyb3VnaCB0aGUgZ2V0VXNlckNhcmRMaW5raW5nSWQgY2FsbCBmYWlsZWRgO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nICR7ZmllbGROYW1lfSBxdWVyeSAke2Vycn1gO1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICB9O1xuICAgIH1cbn1cbiJdfQ==