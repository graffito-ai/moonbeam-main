"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserFromReferral = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const crc32 = __importStar(require("crc-32"));
/**
 * GetUserFromReferral resolver
 *
 * @param userFromReferralInput the input needed to retrieve a user's details from a referral code
 * @param fieldName name of the resolver path from the AppSync event
 * @returns {@link Promise} of {@link UserFromReferralResponse}
 */
const getUserFromReferral = async (fieldName, userFromReferralInput) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        /**
         * retrieve the list of all existent users from our Cognito user pool
         *
         * first, initialize the Moonbeam Client API here, in order to call the appropriate endpoints for this handler
         */
        const moonbeamClient = new moonbeam_models_1.MoonbeamClient(process.env.ENV_NAME, region);
        const allRegisteredUsersResponse = await moonbeamClient.getAllUsersForNotificationReminders();
        /**
         * split the referral code, in order to extract the last name, first initial of first name alongside with the randomly generated code
         *
         * Remember that our referral codes have the following format:
         * `{lastName}-{firstInitialOfFirstName}-{8LetterCode}
         *
         * The {8LetterCode} is obtained by doing taking the user's custom:userId and doing a CRC32(custom:userId) operation.
         */
        const referralCodeParts = userFromReferralInput.referralCode.trim().split('-');
        const referralCodeLastNamePart = referralCodeParts[0];
        const referralCodeFirstNamePart = referralCodeParts[1];
        const referralCodeNumberPart = referralCodeParts[2];
        // check to see if the get all users call was successful or not
        if (allRegisteredUsersResponse && !allRegisteredUsersResponse.errorMessage && !allRegisteredUsersResponse.errorType &&
            allRegisteredUsersResponse.data && allRegisteredUsersResponse.data.length !== 0) {
            // filter the users retrieved based on the last name, first letter of the first name and the CRC32(custom:userId) operation
            const matchedUserIds = [];
            allRegisteredUsersResponse.data.forEach(registeredUserData => {
                let crc32CheckSumHash = "";
                if (registeredUserData !== null) {
                    crc32CheckSumHash = crc32.str(registeredUserData.id).toString().includes('-')
                        ? crc32.str(registeredUserData.id).toString().split('-')[1]
                        : crc32.str(registeredUserData.id).toString();
                }
                if (registeredUserData !== null &&
                    registeredUserData.lastName.toLowerCase() === referralCodeLastNamePart.toLowerCase() &&
                    registeredUserData.firstName.toLowerCase().charAt(0) === referralCodeFirstNamePart.toLowerCase() &&
                    crc32CheckSumHash === referralCodeNumberPart) {
                    matchedUserIds.push(registeredUserData.id);
                }
            });
            // if there is not only 1 matched user, then we will return an error because we need only 1 match per call
            if (matchedUserIds.length !== 1) {
                const errorMessage = matchedUserIds.length === 0
                    ? `No matched user found for referral code ${userFromReferralInput.referralCode}`
                    : `More than 1 matched users found for referral code ${userFromReferralInput.referralCode}`;
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: matchedUserIds.length === 0
                        ? moonbeam_models_1.ReferralErrorType.NoneOrAbsent
                        : moonbeam_models_1.ReferralErrorType.DuplicateObjectFound
                };
            }
            else {
                // filter out and return the matched user (should only be 1)
                return {
                    data: matchedUserIds[0]
                };
            }
        }
        else {
            const errorMessage = `Retrieving all users through the getAllUsersForNotificationReminders call failed`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.ReferralErrorType.UnexpectedError
            };
        }
    }
    catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: moonbeam_models_1.ReferralErrorType.UnexpectedError
        };
    }
};
exports.getUserFromReferral = getUserFromReferral;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0VXNlckZyb21SZWZlcnJhbFJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvR2V0VXNlckZyb21SZWZlcnJhbFJlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsK0RBTW1DO0FBQ25DLDhDQUFnQztBQUVoQzs7Ozs7O0dBTUc7QUFDSSxNQUFNLG1CQUFtQixHQUFHLEtBQUssRUFBRSxTQUFpQixFQUFFLHFCQUE0QyxFQUFxQyxFQUFFO0lBQzVJLElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkM7Ozs7V0FJRztRQUNILE1BQU0sY0FBYyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN6RSxNQUFNLDBCQUEwQixHQUF3QyxNQUFNLGNBQWMsQ0FBQyxtQ0FBbUMsRUFBRSxDQUFDO1FBRW5JOzs7Ozs7O1dBT0c7UUFDSCxNQUFNLGlCQUFpQixHQUFHLHFCQUFxQixDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDL0UsTUFBTSx3QkFBd0IsR0FBRyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0RCxNQUFNLHlCQUF5QixHQUFHLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZELE1BQU0sc0JBQXNCLEdBQUcsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFcEQsK0RBQStEO1FBQy9ELElBQUksMEJBQTBCLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxZQUFZLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxTQUFTO1lBQy9HLDBCQUEwQixDQUFDLElBQUksSUFBSSwwQkFBMEIsQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUVqRiwySEFBMkg7WUFDM0gsTUFBTSxjQUFjLEdBQWEsRUFBRSxDQUFDO1lBQ3BDLDBCQUEwQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsRUFBRTtnQkFDekQsSUFBSSxpQkFBaUIsR0FBRyxFQUFFLENBQUM7Z0JBQzNCLElBQUksa0JBQWtCLEtBQUssSUFBSSxFQUFFO29CQUM3QixpQkFBaUIsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUM7d0JBQ3pFLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQzNELENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO2lCQUNyRDtnQkFDRCxJQUFJLGtCQUFrQixLQUFLLElBQUk7b0JBQzNCLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsS0FBSyx3QkFBd0IsQ0FBQyxXQUFXLEVBQUU7b0JBQ3BGLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUsseUJBQXlCLENBQUMsV0FBVyxFQUFFO29CQUNoRyxpQkFBaUIsS0FBSyxzQkFBc0IsRUFBRTtvQkFDOUMsY0FBYyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsQ0FBQTtpQkFDN0M7WUFDTCxDQUFDLENBQUMsQ0FBQztZQUVILDBHQUEwRztZQUMxRyxJQUFJLGNBQWMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUM3QixNQUFNLFlBQVksR0FBRyxjQUFjLENBQUMsTUFBTSxLQUFLLENBQUM7b0JBQzVDLENBQUMsQ0FBQywyQ0FBMkMscUJBQXFCLENBQUMsWUFBWSxFQUFFO29CQUNqRixDQUFDLENBQUMscURBQXFELHFCQUFxQixDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUNoRyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUUxQixPQUFPO29CQUNILFlBQVksRUFBRSxZQUFZO29CQUMxQixTQUFTLEVBQUUsY0FBYyxDQUFDLE1BQU0sS0FBSyxDQUFDO3dCQUNsQyxDQUFDLENBQUMsbUNBQWlCLENBQUMsWUFBWTt3QkFDaEMsQ0FBQyxDQUFDLG1DQUFpQixDQUFDLG9CQUFvQjtpQkFDL0MsQ0FBQTthQUNKO2lCQUFNO2dCQUNILDREQUE0RDtnQkFDNUQsT0FBTztvQkFDSCxJQUFJLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQztpQkFDMUIsQ0FBQzthQUNMO1NBQ0o7YUFBTTtZQUNILE1BQU0sWUFBWSxHQUFHLGtGQUFrRixDQUFDO1lBQ3hHLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7WUFFMUIsT0FBTztnQkFDSCxZQUFZLEVBQUUsWUFBWTtnQkFDMUIsU0FBUyxFQUFFLG1DQUFpQixDQUFDLGVBQWU7YUFDL0MsQ0FBQTtTQUNKO0tBQ0o7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNWLE1BQU0sWUFBWSxHQUFHLG9DQUFvQyxTQUFTLFVBQVUsR0FBRyxFQUFFLENBQUM7UUFDbEYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMxQixPQUFPO1lBQ0gsWUFBWSxFQUFFLFlBQVk7WUFDMUIsU0FBUyxFQUFFLG1DQUFpQixDQUFDLGVBQWU7U0FDL0MsQ0FBQztLQUNMO0FBQ0wsQ0FBQyxDQUFBO0FBbkZZLFFBQUEsbUJBQW1CLHVCQW1GL0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICAgIE1vb25iZWFtQ2xpZW50LFxuICAgIFJlZmVycmFsRXJyb3JUeXBlLFxuICAgIFVzZXJGb3JOb3RpZmljYXRpb25SZW1pbmRlclJlc3BvbnNlLFxuICAgIFVzZXJGcm9tUmVmZXJyYWxJbnB1dCxcbiAgICBVc2VyRnJvbVJlZmVycmFsUmVzcG9uc2Vcbn0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcbmltcG9ydCAqIGFzIGNyYzMyIGZyb20gJ2NyYy0zMic7XG5cbi8qKlxuICogR2V0VXNlckZyb21SZWZlcnJhbCByZXNvbHZlclxuICpcbiAqIEBwYXJhbSB1c2VyRnJvbVJlZmVycmFsSW5wdXQgdGhlIGlucHV0IG5lZWRlZCB0byByZXRyaWV2ZSBhIHVzZXIncyBkZXRhaWxzIGZyb20gYSByZWZlcnJhbCBjb2RlXG4gKiBAcGFyYW0gZmllbGROYW1lIG5hbWUgb2YgdGhlIHJlc29sdmVyIHBhdGggZnJvbSB0aGUgQXBwU3luYyBldmVudFxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBVc2VyRnJvbVJlZmVycmFsUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBnZXRVc2VyRnJvbVJlZmVycmFsID0gYXN5bmMgKGZpZWxkTmFtZTogc3RyaW5nLCB1c2VyRnJvbVJlZmVycmFsSW5wdXQ6IFVzZXJGcm9tUmVmZXJyYWxJbnB1dCk6IFByb21pc2U8VXNlckZyb21SZWZlcnJhbFJlc3BvbnNlPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIHJldHJpZXZlIHRoZSBsaXN0IG9mIGFsbCBleGlzdGVudCB1c2VycyBmcm9tIG91ciBDb2duaXRvIHVzZXIgcG9vbFxuICAgICAgICAgKlxuICAgICAgICAgKiBmaXJzdCwgaW5pdGlhbGl6ZSB0aGUgTW9vbmJlYW0gQ2xpZW50IEFQSSBoZXJlLCBpbiBvcmRlciB0byBjYWxsIHRoZSBhcHByb3ByaWF0ZSBlbmRwb2ludHMgZm9yIHRoaXMgaGFuZGxlclxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgbW9vbmJlYW1DbGllbnQgPSBuZXcgTW9vbmJlYW1DbGllbnQocHJvY2Vzcy5lbnYuRU5WX05BTUUhLCByZWdpb24pO1xuICAgICAgICBjb25zdCBhbGxSZWdpc3RlcmVkVXNlcnNSZXNwb25zZTogVXNlckZvck5vdGlmaWNhdGlvblJlbWluZGVyUmVzcG9uc2UgPSBhd2FpdCBtb29uYmVhbUNsaWVudC5nZXRBbGxVc2Vyc0Zvck5vdGlmaWNhdGlvblJlbWluZGVycygpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBzcGxpdCB0aGUgcmVmZXJyYWwgY29kZSwgaW4gb3JkZXIgdG8gZXh0cmFjdCB0aGUgbGFzdCBuYW1lLCBmaXJzdCBpbml0aWFsIG9mIGZpcnN0IG5hbWUgYWxvbmdzaWRlIHdpdGggdGhlIHJhbmRvbWx5IGdlbmVyYXRlZCBjb2RlXG4gICAgICAgICAqXG4gICAgICAgICAqIFJlbWVtYmVyIHRoYXQgb3VyIHJlZmVycmFsIGNvZGVzIGhhdmUgdGhlIGZvbGxvd2luZyBmb3JtYXQ6XG4gICAgICAgICAqIGB7bGFzdE5hbWV9LXtmaXJzdEluaXRpYWxPZkZpcnN0TmFtZX0tezhMZXR0ZXJDb2RlfVxuICAgICAgICAgKlxuICAgICAgICAgKiBUaGUgezhMZXR0ZXJDb2RlfSBpcyBvYnRhaW5lZCBieSBkb2luZyB0YWtpbmcgdGhlIHVzZXIncyBjdXN0b206dXNlcklkIGFuZCBkb2luZyBhIENSQzMyKGN1c3RvbTp1c2VySWQpIG9wZXJhdGlvbi5cbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IHJlZmVycmFsQ29kZVBhcnRzID0gdXNlckZyb21SZWZlcnJhbElucHV0LnJlZmVycmFsQ29kZS50cmltKCkuc3BsaXQoJy0nKTtcbiAgICAgICAgY29uc3QgcmVmZXJyYWxDb2RlTGFzdE5hbWVQYXJ0ID0gcmVmZXJyYWxDb2RlUGFydHNbMF07XG4gICAgICAgIGNvbnN0IHJlZmVycmFsQ29kZUZpcnN0TmFtZVBhcnQgPSByZWZlcnJhbENvZGVQYXJ0c1sxXTtcbiAgICAgICAgY29uc3QgcmVmZXJyYWxDb2RlTnVtYmVyUGFydCA9IHJlZmVycmFsQ29kZVBhcnRzWzJdO1xuXG4gICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgZ2V0IGFsbCB1c2VycyBjYWxsIHdhcyBzdWNjZXNzZnVsIG9yIG5vdFxuICAgICAgICBpZiAoYWxsUmVnaXN0ZXJlZFVzZXJzUmVzcG9uc2UgJiYgIWFsbFJlZ2lzdGVyZWRVc2Vyc1Jlc3BvbnNlLmVycm9yTWVzc2FnZSAmJiAhYWxsUmVnaXN0ZXJlZFVzZXJzUmVzcG9uc2UuZXJyb3JUeXBlICYmXG4gICAgICAgICAgICBhbGxSZWdpc3RlcmVkVXNlcnNSZXNwb25zZS5kYXRhICYmIGFsbFJlZ2lzdGVyZWRVc2Vyc1Jlc3BvbnNlLmRhdGEubGVuZ3RoICE9PSAwKSB7XG5cbiAgICAgICAgICAgIC8vIGZpbHRlciB0aGUgdXNlcnMgcmV0cmlldmVkIGJhc2VkIG9uIHRoZSBsYXN0IG5hbWUsIGZpcnN0IGxldHRlciBvZiB0aGUgZmlyc3QgbmFtZSBhbmQgdGhlIENSQzMyKGN1c3RvbTp1c2VySWQpIG9wZXJhdGlvblxuICAgICAgICAgICAgY29uc3QgbWF0Y2hlZFVzZXJJZHM6IHN0cmluZ1tdID0gW107XG4gICAgICAgICAgICBhbGxSZWdpc3RlcmVkVXNlcnNSZXNwb25zZS5kYXRhLmZvckVhY2gocmVnaXN0ZXJlZFVzZXJEYXRhID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgY3JjMzJDaGVja1N1bUhhc2ggPSBcIlwiO1xuICAgICAgICAgICAgICAgIGlmIChyZWdpc3RlcmVkVXNlckRhdGEgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgY3JjMzJDaGVja1N1bUhhc2ggPSBjcmMzMi5zdHIocmVnaXN0ZXJlZFVzZXJEYXRhLmlkKS50b1N0cmluZygpLmluY2x1ZGVzKCctJylcbiAgICAgICAgICAgICAgICAgICAgICAgID8gY3JjMzIuc3RyKHJlZ2lzdGVyZWRVc2VyRGF0YS5pZCkudG9TdHJpbmcoKS5zcGxpdCgnLScpWzFdXG4gICAgICAgICAgICAgICAgICAgICAgICA6IGNyYzMyLnN0cihyZWdpc3RlcmVkVXNlckRhdGEuaWQpLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChyZWdpc3RlcmVkVXNlckRhdGEgIT09IG51bGwgJiZcbiAgICAgICAgICAgICAgICAgICAgcmVnaXN0ZXJlZFVzZXJEYXRhLmxhc3ROYW1lLnRvTG93ZXJDYXNlKCkgPT09IHJlZmVycmFsQ29kZUxhc3ROYW1lUGFydC50b0xvd2VyQ2FzZSgpICYmXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lzdGVyZWRVc2VyRGF0YS5maXJzdE5hbWUudG9Mb3dlckNhc2UoKS5jaGFyQXQoMCkgPT09IHJlZmVycmFsQ29kZUZpcnN0TmFtZVBhcnQudG9Mb3dlckNhc2UoKSAmJlxuICAgICAgICAgICAgICAgICAgICBjcmMzMkNoZWNrU3VtSGFzaCA9PT0gcmVmZXJyYWxDb2RlTnVtYmVyUGFydCkge1xuICAgICAgICAgICAgICAgICAgICBtYXRjaGVkVXNlcklkcy5wdXNoKHJlZ2lzdGVyZWRVc2VyRGF0YS5pZClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gaWYgdGhlcmUgaXMgbm90IG9ubHkgMSBtYXRjaGVkIHVzZXIsIHRoZW4gd2Ugd2lsbCByZXR1cm4gYW4gZXJyb3IgYmVjYXVzZSB3ZSBuZWVkIG9ubHkgMSBtYXRjaCBwZXIgY2FsbFxuICAgICAgICAgICAgaWYgKG1hdGNoZWRVc2VySWRzLmxlbmd0aCAhPT0gMSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IG1hdGNoZWRVc2VySWRzLmxlbmd0aCA9PT0gMFxuICAgICAgICAgICAgICAgICAgICA/IGBObyBtYXRjaGVkIHVzZXIgZm91bmQgZm9yIHJlZmVycmFsIGNvZGUgJHt1c2VyRnJvbVJlZmVycmFsSW5wdXQucmVmZXJyYWxDb2RlfWBcbiAgICAgICAgICAgICAgICAgICAgOiBgTW9yZSB0aGFuIDEgbWF0Y2hlZCB1c2VycyBmb3VuZCBmb3IgcmVmZXJyYWwgY29kZSAke3VzZXJGcm9tUmVmZXJyYWxJbnB1dC5yZWZlcnJhbENvZGV9YDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogbWF0Y2hlZFVzZXJJZHMubGVuZ3RoID09PSAwXG4gICAgICAgICAgICAgICAgICAgICAgICA/IFJlZmVycmFsRXJyb3JUeXBlLk5vbmVPckFic2VudFxuICAgICAgICAgICAgICAgICAgICAgICAgOiBSZWZlcnJhbEVycm9yVHlwZS5EdXBsaWNhdGVPYmplY3RGb3VuZFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gZmlsdGVyIG91dCBhbmQgcmV0dXJuIHRoZSBtYXRjaGVkIHVzZXIgKHNob3VsZCBvbmx5IGJlIDEpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogbWF0Y2hlZFVzZXJJZHNbMF1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFJldHJpZXZpbmcgYWxsIHVzZXJzIHRocm91Z2ggdGhlIGdldEFsbFVzZXJzRm9yTm90aWZpY2F0aW9uUmVtaW5kZXJzIGNhbGwgZmFpbGVkYDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBSZWZlcnJhbEVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgJHtmaWVsZE5hbWV9IHF1ZXJ5ICR7ZXJyfWA7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgIGVycm9yVHlwZTogUmVmZXJyYWxFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH07XG4gICAgfVxufVxuIl19