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
            allRegisteredUsersResponse.data.forEach(registeredUserData => registeredUserData !== null &&
                registeredUserData.lastName.toLowerCase() === referralCodeLastNamePart.toLowerCase() &&
                registeredUserData.firstName.toLowerCase().charAt(0) === referralCodeFirstNamePart.toLowerCase() &&
                crc32.str(registeredUserData.id).toString().split('-')[1] === referralCodeNumberPart &&
                matchedUserIds.push(registeredUserData.id));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0VXNlckZyb21SZWZlcnJhbFJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvR2V0VXNlckZyb21SZWZlcnJhbFJlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsK0RBTW1DO0FBQ25DLDhDQUFnQztBQUVoQzs7Ozs7O0dBTUc7QUFDSSxNQUFNLG1CQUFtQixHQUFHLEtBQUssRUFBRSxTQUFpQixFQUFFLHFCQUE0QyxFQUFxQyxFQUFFO0lBQzVJLElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkM7Ozs7V0FJRztRQUNILE1BQU0sY0FBYyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN6RSxNQUFNLDBCQUEwQixHQUF3QyxNQUFNLGNBQWMsQ0FBQyxtQ0FBbUMsRUFBRSxDQUFDO1FBRW5JOzs7Ozs7O1dBT0c7UUFDSCxNQUFNLGlCQUFpQixHQUFHLHFCQUFxQixDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDL0UsTUFBTSx3QkFBd0IsR0FBRyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0RCxNQUFNLHlCQUF5QixHQUFHLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZELE1BQU0sc0JBQXNCLEdBQUcsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFcEQsK0RBQStEO1FBQy9ELElBQUksMEJBQTBCLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxZQUFZLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxTQUFTO1lBQy9HLDBCQUEwQixDQUFDLElBQUksSUFBSSwwQkFBMEIsQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUVqRiwySEFBMkg7WUFDM0gsTUFBTSxjQUFjLEdBQWEsRUFBRSxDQUFDO1lBQ3BDLDBCQUEwQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUN6RCxrQkFBa0IsS0FBSyxJQUFJO2dCQUMzQixrQkFBa0IsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLEtBQUssd0JBQXdCLENBQUMsV0FBVyxFQUFFO2dCQUNwRixrQkFBa0IsQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLHlCQUF5QixDQUFDLFdBQVcsRUFBRTtnQkFDaEcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssc0JBQXNCO2dCQUNwRixjQUFjLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFaEQsMEdBQTBHO1lBQzFHLElBQUksY0FBYyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQzdCLE1BQU0sWUFBWSxHQUFHLGNBQWMsQ0FBQyxNQUFNLEtBQUssQ0FBQztvQkFDNUMsQ0FBQyxDQUFDLDJDQUEyQyxxQkFBcUIsQ0FBQyxZQUFZLEVBQUU7b0JBQ2pGLENBQUMsQ0FBQyxxREFBcUQscUJBQXFCLENBQUMsWUFBWSxFQUFFLENBQUM7Z0JBQ2hHLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBRTFCLE9BQU87b0JBQ0gsWUFBWSxFQUFFLFlBQVk7b0JBQzFCLFNBQVMsRUFBRSxjQUFjLENBQUMsTUFBTSxLQUFLLENBQUM7d0JBQ2xDLENBQUMsQ0FBQyxtQ0FBaUIsQ0FBQyxZQUFZO3dCQUNoQyxDQUFDLENBQUMsbUNBQWlCLENBQUMsb0JBQW9CO2lCQUMvQyxDQUFBO2FBQ0o7aUJBQU07Z0JBQ0gsNERBQTREO2dCQUM1RCxPQUFPO29CQUNILElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDO2lCQUMxQixDQUFDO2FBQ0w7U0FDSjthQUFNO1lBQ0gsTUFBTSxZQUFZLEdBQUcsa0ZBQWtGLENBQUM7WUFDeEcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUUxQixPQUFPO2dCQUNILFlBQVksRUFBRSxZQUFZO2dCQUMxQixTQUFTLEVBQUUsbUNBQWlCLENBQUMsZUFBZTthQUMvQyxDQUFBO1NBQ0o7S0FDSjtJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1YsTUFBTSxZQUFZLEdBQUcsb0NBQW9DLFNBQVMsVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNsRixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzFCLE9BQU87WUFDSCxZQUFZLEVBQUUsWUFBWTtZQUMxQixTQUFTLEVBQUUsbUNBQWlCLENBQUMsZUFBZTtTQUMvQyxDQUFDO0tBQ0w7QUFDTCxDQUFDLENBQUE7QUEzRVksUUFBQSxtQkFBbUIsdUJBMkUvQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gICAgTW9vbmJlYW1DbGllbnQsXG4gICAgUmVmZXJyYWxFcnJvclR5cGUsXG4gICAgVXNlckZvck5vdGlmaWNhdGlvblJlbWluZGVyUmVzcG9uc2UsXG4gICAgVXNlckZyb21SZWZlcnJhbElucHV0LFxuICAgIFVzZXJGcm9tUmVmZXJyYWxSZXNwb25zZVxufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuaW1wb3J0ICogYXMgY3JjMzIgZnJvbSAnY3JjLTMyJztcblxuLyoqXG4gKiBHZXRVc2VyRnJvbVJlZmVycmFsIHJlc29sdmVyXG4gKlxuICogQHBhcmFtIHVzZXJGcm9tUmVmZXJyYWxJbnB1dCB0aGUgaW5wdXQgbmVlZGVkIHRvIHJldHJpZXZlIGEgdXNlcidzIGRldGFpbHMgZnJvbSBhIHJlZmVycmFsIGNvZGVcbiAqIEBwYXJhbSBmaWVsZE5hbWUgbmFtZSBvZiB0aGUgcmVzb2x2ZXIgcGF0aCBmcm9tIHRoZSBBcHBTeW5jIGV2ZW50XG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIFVzZXJGcm9tUmVmZXJyYWxSZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IGdldFVzZXJGcm9tUmVmZXJyYWwgPSBhc3luYyAoZmllbGROYW1lOiBzdHJpbmcsIHVzZXJGcm9tUmVmZXJyYWxJbnB1dDogVXNlckZyb21SZWZlcnJhbElucHV0KTogUHJvbWlzZTxVc2VyRnJvbVJlZmVycmFsUmVzcG9uc2U+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OITtcblxuICAgICAgICAvKipcbiAgICAgICAgICogcmV0cmlldmUgdGhlIGxpc3Qgb2YgYWxsIGV4aXN0ZW50IHVzZXJzIGZyb20gb3VyIENvZ25pdG8gdXNlciBwb29sXG4gICAgICAgICAqXG4gICAgICAgICAqIGZpcnN0LCBpbml0aWFsaXplIHRoZSBNb29uYmVhbSBDbGllbnQgQVBJIGhlcmUsIGluIG9yZGVyIHRvIGNhbGwgdGhlIGFwcHJvcHJpYXRlIGVuZHBvaW50cyBmb3IgdGhpcyBoYW5kbGVyXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBtb29uYmVhbUNsaWVudCA9IG5ldyBNb29uYmVhbUNsaWVudChwcm9jZXNzLmVudi5FTlZfTkFNRSEsIHJlZ2lvbik7XG4gICAgICAgIGNvbnN0IGFsbFJlZ2lzdGVyZWRVc2Vyc1Jlc3BvbnNlOiBVc2VyRm9yTm90aWZpY2F0aW9uUmVtaW5kZXJSZXNwb25zZSA9IGF3YWl0IG1vb25iZWFtQ2xpZW50LmdldEFsbFVzZXJzRm9yTm90aWZpY2F0aW9uUmVtaW5kZXJzKCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIHNwbGl0IHRoZSByZWZlcnJhbCBjb2RlLCBpbiBvcmRlciB0byBleHRyYWN0IHRoZSBsYXN0IG5hbWUsIGZpcnN0IGluaXRpYWwgb2YgZmlyc3QgbmFtZSBhbG9uZ3NpZGUgd2l0aCB0aGUgcmFuZG9tbHkgZ2VuZXJhdGVkIGNvZGVcbiAgICAgICAgICpcbiAgICAgICAgICogUmVtZW1iZXIgdGhhdCBvdXIgcmVmZXJyYWwgY29kZXMgaGF2ZSB0aGUgZm9sbG93aW5nIGZvcm1hdDpcbiAgICAgICAgICogYHtsYXN0TmFtZX0te2ZpcnN0SW5pdGlhbE9mRmlyc3ROYW1lfS17OExldHRlckNvZGV9XG4gICAgICAgICAqXG4gICAgICAgICAqIFRoZSB7OExldHRlckNvZGV9IGlzIG9idGFpbmVkIGJ5IGRvaW5nIHRha2luZyB0aGUgdXNlcidzIGN1c3RvbTp1c2VySWQgYW5kIGRvaW5nIGEgQ1JDMzIoY3VzdG9tOnVzZXJJZCkgb3BlcmF0aW9uLlxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgcmVmZXJyYWxDb2RlUGFydHMgPSB1c2VyRnJvbVJlZmVycmFsSW5wdXQucmVmZXJyYWxDb2RlLnRyaW0oKS5zcGxpdCgnLScpO1xuICAgICAgICBjb25zdCByZWZlcnJhbENvZGVMYXN0TmFtZVBhcnQgPSByZWZlcnJhbENvZGVQYXJ0c1swXTtcbiAgICAgICAgY29uc3QgcmVmZXJyYWxDb2RlRmlyc3ROYW1lUGFydCA9IHJlZmVycmFsQ29kZVBhcnRzWzFdO1xuICAgICAgICBjb25zdCByZWZlcnJhbENvZGVOdW1iZXJQYXJ0ID0gcmVmZXJyYWxDb2RlUGFydHNbMl07XG5cbiAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSBnZXQgYWxsIHVzZXJzIGNhbGwgd2FzIHN1Y2Nlc3NmdWwgb3Igbm90XG4gICAgICAgIGlmIChhbGxSZWdpc3RlcmVkVXNlcnNSZXNwb25zZSAmJiAhYWxsUmVnaXN0ZXJlZFVzZXJzUmVzcG9uc2UuZXJyb3JNZXNzYWdlICYmICFhbGxSZWdpc3RlcmVkVXNlcnNSZXNwb25zZS5lcnJvclR5cGUgJiZcbiAgICAgICAgICAgIGFsbFJlZ2lzdGVyZWRVc2Vyc1Jlc3BvbnNlLmRhdGEgJiYgYWxsUmVnaXN0ZXJlZFVzZXJzUmVzcG9uc2UuZGF0YS5sZW5ndGggIT09IDApIHtcblxuICAgICAgICAgICAgLy8gZmlsdGVyIHRoZSB1c2VycyByZXRyaWV2ZWQgYmFzZWQgb24gdGhlIGxhc3QgbmFtZSwgZmlyc3QgbGV0dGVyIG9mIHRoZSBmaXJzdCBuYW1lIGFuZCB0aGUgQ1JDMzIoY3VzdG9tOnVzZXJJZCkgb3BlcmF0aW9uXG4gICAgICAgICAgICBjb25zdCBtYXRjaGVkVXNlcklkczogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICAgIGFsbFJlZ2lzdGVyZWRVc2Vyc1Jlc3BvbnNlLmRhdGEuZm9yRWFjaChyZWdpc3RlcmVkVXNlckRhdGEgPT5cbiAgICAgICAgICAgICAgICByZWdpc3RlcmVkVXNlckRhdGEgIT09IG51bGwgJiZcbiAgICAgICAgICAgICAgICByZWdpc3RlcmVkVXNlckRhdGEubGFzdE5hbWUudG9Mb3dlckNhc2UoKSA9PT0gcmVmZXJyYWxDb2RlTGFzdE5hbWVQYXJ0LnRvTG93ZXJDYXNlKCkgJiZcbiAgICAgICAgICAgICAgICByZWdpc3RlcmVkVXNlckRhdGEuZmlyc3ROYW1lLnRvTG93ZXJDYXNlKCkuY2hhckF0KDApID09PSByZWZlcnJhbENvZGVGaXJzdE5hbWVQYXJ0LnRvTG93ZXJDYXNlKCkgJiZcbiAgICAgICAgICAgICAgICBjcmMzMi5zdHIocmVnaXN0ZXJlZFVzZXJEYXRhLmlkKS50b1N0cmluZygpLnNwbGl0KCctJylbMV0gPT09IHJlZmVycmFsQ29kZU51bWJlclBhcnQgJiZcbiAgICAgICAgICAgICAgICBtYXRjaGVkVXNlcklkcy5wdXNoKHJlZ2lzdGVyZWRVc2VyRGF0YS5pZCkpO1xuXG4gICAgICAgICAgICAvLyBpZiB0aGVyZSBpcyBub3Qgb25seSAxIG1hdGNoZWQgdXNlciwgdGhlbiB3ZSB3aWxsIHJldHVybiBhbiBlcnJvciBiZWNhdXNlIHdlIG5lZWQgb25seSAxIG1hdGNoIHBlciBjYWxsXG4gICAgICAgICAgICBpZiAobWF0Y2hlZFVzZXJJZHMubGVuZ3RoICE9PSAxKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gbWF0Y2hlZFVzZXJJZHMubGVuZ3RoID09PSAwXG4gICAgICAgICAgICAgICAgICAgID8gYE5vIG1hdGNoZWQgdXNlciBmb3VuZCBmb3IgcmVmZXJyYWwgY29kZSAke3VzZXJGcm9tUmVmZXJyYWxJbnB1dC5yZWZlcnJhbENvZGV9YFxuICAgICAgICAgICAgICAgICAgICA6IGBNb3JlIHRoYW4gMSBtYXRjaGVkIHVzZXJzIGZvdW5kIGZvciByZWZlcnJhbCBjb2RlICR7dXNlckZyb21SZWZlcnJhbElucHV0LnJlZmVycmFsQ29kZX1gO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBtYXRjaGVkVXNlcklkcy5sZW5ndGggPT09IDBcbiAgICAgICAgICAgICAgICAgICAgICAgID8gUmVmZXJyYWxFcnJvclR5cGUuTm9uZU9yQWJzZW50XG4gICAgICAgICAgICAgICAgICAgICAgICA6IFJlZmVycmFsRXJyb3JUeXBlLkR1cGxpY2F0ZU9iamVjdEZvdW5kXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBmaWx0ZXIgb3V0IGFuZCByZXR1cm4gdGhlIG1hdGNoZWQgdXNlciAoc2hvdWxkIG9ubHkgYmUgMSlcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiBtYXRjaGVkVXNlcklkc1swXVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgUmV0cmlldmluZyBhbGwgdXNlcnMgdGhyb3VnaCB0aGUgZ2V0QWxsVXNlcnNGb3JOb3RpZmljYXRpb25SZW1pbmRlcnMgY2FsbCBmYWlsZWRgO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFJlZmVycmFsRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyAke2ZpZWxkTmFtZX0gcXVlcnkgJHtlcnJ9YDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBSZWZlcnJhbEVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgfTtcbiAgICB9XG59XG4iXX0=