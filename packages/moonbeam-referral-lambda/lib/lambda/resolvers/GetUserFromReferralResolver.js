"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserFromReferral = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
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
        // initialize the CRC32 client in order to compute a checksum hash of the user id (custom:userId)
        const crc32 = new moonbeam_models_1.CRC32();
        // check to see if the get all users call was successful or not
        if (allRegisteredUsersResponse && !allRegisteredUsersResponse.errorMessage && !allRegisteredUsersResponse.errorType &&
            allRegisteredUsersResponse.data && allRegisteredUsersResponse.data.length !== 0) {
            // filter the users retrieved based on the last name, first letter of the first name and the CRC32(custom:userId) operation
            const matchedUserIds = [];
            allRegisteredUsersResponse.data.forEach(registeredUserData => registeredUserData !== null &&
                registeredUserData.lastName.toLowerCase() === referralCodeLastNamePart.toLowerCase() &&
                registeredUserData.firstName.toLowerCase().charAt(0) === referralCodeFirstNamePart.toLowerCase() &&
                crc32.calculate(registeredUserData.id).toString() === referralCodeNumberPart &&
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0VXNlckZyb21SZWZlcnJhbFJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvR2V0VXNlckZyb21SZWZlcnJhbFJlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtEQU9tQztBQUVuQzs7Ozs7O0dBTUc7QUFDSSxNQUFNLG1CQUFtQixHQUFHLEtBQUssRUFBRSxTQUFpQixFQUFFLHFCQUE0QyxFQUFxQyxFQUFFO0lBQzVJLElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkM7Ozs7V0FJRztRQUNILE1BQU0sY0FBYyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN6RSxNQUFNLDBCQUEwQixHQUF3QyxNQUFNLGNBQWMsQ0FBQyxtQ0FBbUMsRUFBRSxDQUFDO1FBRW5JOzs7Ozs7O1dBT0c7UUFDSCxNQUFNLGlCQUFpQixHQUFHLHFCQUFxQixDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDL0UsTUFBTSx3QkFBd0IsR0FBRyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0RCxNQUFNLHlCQUF5QixHQUFHLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZELE1BQU0sc0JBQXNCLEdBQUcsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFcEQsaUdBQWlHO1FBQ2pHLE1BQU0sS0FBSyxHQUFHLElBQUksdUJBQUssRUFBRSxDQUFDO1FBRTFCLCtEQUErRDtRQUMvRCxJQUFJLDBCQUEwQixJQUFJLENBQUMsMEJBQTBCLENBQUMsWUFBWSxJQUFJLENBQUMsMEJBQTBCLENBQUMsU0FBUztZQUMvRywwQkFBMEIsQ0FBQyxJQUFJLElBQUksMEJBQTBCLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFFakYsMkhBQTJIO1lBQzNILE1BQU0sY0FBYyxHQUFhLEVBQUUsQ0FBQztZQUNwQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FDekQsa0JBQWtCLEtBQUssSUFBSTtnQkFDM0Isa0JBQWtCLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxLQUFLLHdCQUF3QixDQUFDLFdBQVcsRUFBRTtnQkFDcEYsa0JBQWtCLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyx5QkFBeUIsQ0FBQyxXQUFXLEVBQUU7Z0JBQ2hHLEtBQUssQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUFDLENBQUMsUUFBUSxFQUFFLEtBQUssc0JBQXNCO2dCQUM1RSxjQUFjLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFaEQsMEdBQTBHO1lBQzFHLElBQUksY0FBYyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQzdCLE1BQU0sWUFBWSxHQUFHLGNBQWMsQ0FBQyxNQUFNLEtBQUssQ0FBQztvQkFDNUMsQ0FBQyxDQUFDLDJDQUEyQyxxQkFBcUIsQ0FBQyxZQUFZLEVBQUU7b0JBQ2pGLENBQUMsQ0FBQyxxREFBcUQscUJBQXFCLENBQUMsWUFBWSxFQUFFLENBQUM7Z0JBQ2hHLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBRTFCLE9BQU87b0JBQ0gsWUFBWSxFQUFFLFlBQVk7b0JBQzFCLFNBQVMsRUFBRSxjQUFjLENBQUMsTUFBTSxLQUFLLENBQUM7d0JBQ2xDLENBQUMsQ0FBQyxtQ0FBaUIsQ0FBQyxZQUFZO3dCQUNoQyxDQUFDLENBQUMsbUNBQWlCLENBQUMsb0JBQW9CO2lCQUMvQyxDQUFBO2FBQ0o7aUJBQU07Z0JBQ0gsNERBQTREO2dCQUM1RCxPQUFPO29CQUNILElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDO2lCQUMxQixDQUFDO2FBQ0w7U0FDSjthQUFNO1lBQ0gsTUFBTSxZQUFZLEdBQUcsa0ZBQWtGLENBQUM7WUFDeEcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUUxQixPQUFPO2dCQUNILFlBQVksRUFBRSxZQUFZO2dCQUMxQixTQUFTLEVBQUUsbUNBQWlCLENBQUMsZUFBZTthQUMvQyxDQUFBO1NBQ0o7S0FDSjtJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1YsTUFBTSxZQUFZLEdBQUcsb0NBQW9DLFNBQVMsVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNsRixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzFCLE9BQU87WUFDSCxZQUFZLEVBQUUsWUFBWTtZQUMxQixTQUFTLEVBQUUsbUNBQWlCLENBQUMsZUFBZTtTQUMvQyxDQUFDO0tBQ0w7QUFDTCxDQUFDLENBQUE7QUE5RVksUUFBQSxtQkFBbUIsdUJBOEUvQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gICAgQ1JDMzIsXG4gICAgTW9vbmJlYW1DbGllbnQsXG4gICAgUmVmZXJyYWxFcnJvclR5cGUsXG4gICAgVXNlckZvck5vdGlmaWNhdGlvblJlbWluZGVyUmVzcG9uc2UsXG4gICAgVXNlckZyb21SZWZlcnJhbElucHV0LFxuICAgIFVzZXJGcm9tUmVmZXJyYWxSZXNwb25zZVxufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuXG4vKipcbiAqIEdldFVzZXJGcm9tUmVmZXJyYWwgcmVzb2x2ZXJcbiAqXG4gKiBAcGFyYW0gdXNlckZyb21SZWZlcnJhbElucHV0IHRoZSBpbnB1dCBuZWVkZWQgdG8gcmV0cmlldmUgYSB1c2VyJ3MgZGV0YWlscyBmcm9tIGEgcmVmZXJyYWwgY29kZVxuICogQHBhcmFtIGZpZWxkTmFtZSBuYW1lIG9mIHRoZSByZXNvbHZlciBwYXRoIGZyb20gdGhlIEFwcFN5bmMgZXZlbnRcbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgVXNlckZyb21SZWZlcnJhbFJlc3BvbnNlfVxuICovXG5leHBvcnQgY29uc3QgZ2V0VXNlckZyb21SZWZlcnJhbCA9IGFzeW5jIChmaWVsZE5hbWU6IHN0cmluZywgdXNlckZyb21SZWZlcnJhbElucHV0OiBVc2VyRnJvbVJlZmVycmFsSW5wdXQpOiBQcm9taXNlPFVzZXJGcm9tUmVmZXJyYWxSZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiByZXRyaWV2ZSB0aGUgbGlzdCBvZiBhbGwgZXhpc3RlbnQgdXNlcnMgZnJvbSBvdXIgQ29nbml0byB1c2VyIHBvb2xcbiAgICAgICAgICpcbiAgICAgICAgICogZmlyc3QsIGluaXRpYWxpemUgdGhlIE1vb25iZWFtIENsaWVudCBBUEkgaGVyZSwgaW4gb3JkZXIgdG8gY2FsbCB0aGUgYXBwcm9wcmlhdGUgZW5kcG9pbnRzIGZvciB0aGlzIGhhbmRsZXJcbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IG1vb25iZWFtQ2xpZW50ID0gbmV3IE1vb25iZWFtQ2xpZW50KHByb2Nlc3MuZW52LkVOVl9OQU1FISwgcmVnaW9uKTtcbiAgICAgICAgY29uc3QgYWxsUmVnaXN0ZXJlZFVzZXJzUmVzcG9uc2U6IFVzZXJGb3JOb3RpZmljYXRpb25SZW1pbmRlclJlc3BvbnNlID0gYXdhaXQgbW9vbmJlYW1DbGllbnQuZ2V0QWxsVXNlcnNGb3JOb3RpZmljYXRpb25SZW1pbmRlcnMoKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogc3BsaXQgdGhlIHJlZmVycmFsIGNvZGUsIGluIG9yZGVyIHRvIGV4dHJhY3QgdGhlIGxhc3QgbmFtZSwgZmlyc3QgaW5pdGlhbCBvZiBmaXJzdCBuYW1lIGFsb25nc2lkZSB3aXRoIHRoZSByYW5kb21seSBnZW5lcmF0ZWQgY29kZVxuICAgICAgICAgKlxuICAgICAgICAgKiBSZW1lbWJlciB0aGF0IG91ciByZWZlcnJhbCBjb2RlcyBoYXZlIHRoZSBmb2xsb3dpbmcgZm9ybWF0OlxuICAgICAgICAgKiBge2xhc3ROYW1lfS17Zmlyc3RJbml0aWFsT2ZGaXJzdE5hbWV9LXs4TGV0dGVyQ29kZX1cbiAgICAgICAgICpcbiAgICAgICAgICogVGhlIHs4TGV0dGVyQ29kZX0gaXMgb2J0YWluZWQgYnkgZG9pbmcgdGFraW5nIHRoZSB1c2VyJ3MgY3VzdG9tOnVzZXJJZCBhbmQgZG9pbmcgYSBDUkMzMihjdXN0b206dXNlcklkKSBvcGVyYXRpb24uXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCByZWZlcnJhbENvZGVQYXJ0cyA9IHVzZXJGcm9tUmVmZXJyYWxJbnB1dC5yZWZlcnJhbENvZGUudHJpbSgpLnNwbGl0KCctJyk7XG4gICAgICAgIGNvbnN0IHJlZmVycmFsQ29kZUxhc3ROYW1lUGFydCA9IHJlZmVycmFsQ29kZVBhcnRzWzBdO1xuICAgICAgICBjb25zdCByZWZlcnJhbENvZGVGaXJzdE5hbWVQYXJ0ID0gcmVmZXJyYWxDb2RlUGFydHNbMV07XG4gICAgICAgIGNvbnN0IHJlZmVycmFsQ29kZU51bWJlclBhcnQgPSByZWZlcnJhbENvZGVQYXJ0c1syXTtcblxuICAgICAgICAvLyBpbml0aWFsaXplIHRoZSBDUkMzMiBjbGllbnQgaW4gb3JkZXIgdG8gY29tcHV0ZSBhIGNoZWNrc3VtIGhhc2ggb2YgdGhlIHVzZXIgaWQgKGN1c3RvbTp1c2VySWQpXG4gICAgICAgIGNvbnN0IGNyYzMyID0gbmV3IENSQzMyKCk7XG5cbiAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSBnZXQgYWxsIHVzZXJzIGNhbGwgd2FzIHN1Y2Nlc3NmdWwgb3Igbm90XG4gICAgICAgIGlmIChhbGxSZWdpc3RlcmVkVXNlcnNSZXNwb25zZSAmJiAhYWxsUmVnaXN0ZXJlZFVzZXJzUmVzcG9uc2UuZXJyb3JNZXNzYWdlICYmICFhbGxSZWdpc3RlcmVkVXNlcnNSZXNwb25zZS5lcnJvclR5cGUgJiZcbiAgICAgICAgICAgIGFsbFJlZ2lzdGVyZWRVc2Vyc1Jlc3BvbnNlLmRhdGEgJiYgYWxsUmVnaXN0ZXJlZFVzZXJzUmVzcG9uc2UuZGF0YS5sZW5ndGggIT09IDApIHtcblxuICAgICAgICAgICAgLy8gZmlsdGVyIHRoZSB1c2VycyByZXRyaWV2ZWQgYmFzZWQgb24gdGhlIGxhc3QgbmFtZSwgZmlyc3QgbGV0dGVyIG9mIHRoZSBmaXJzdCBuYW1lIGFuZCB0aGUgQ1JDMzIoY3VzdG9tOnVzZXJJZCkgb3BlcmF0aW9uXG4gICAgICAgICAgICBjb25zdCBtYXRjaGVkVXNlcklkczogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICAgIGFsbFJlZ2lzdGVyZWRVc2Vyc1Jlc3BvbnNlLmRhdGEuZm9yRWFjaChyZWdpc3RlcmVkVXNlckRhdGEgPT5cbiAgICAgICAgICAgICAgICByZWdpc3RlcmVkVXNlckRhdGEgIT09IG51bGwgJiZcbiAgICAgICAgICAgICAgICByZWdpc3RlcmVkVXNlckRhdGEubGFzdE5hbWUudG9Mb3dlckNhc2UoKSA9PT0gcmVmZXJyYWxDb2RlTGFzdE5hbWVQYXJ0LnRvTG93ZXJDYXNlKCkgJiZcbiAgICAgICAgICAgICAgICByZWdpc3RlcmVkVXNlckRhdGEuZmlyc3ROYW1lLnRvTG93ZXJDYXNlKCkuY2hhckF0KDApID09PSByZWZlcnJhbENvZGVGaXJzdE5hbWVQYXJ0LnRvTG93ZXJDYXNlKCkgJiZcbiAgICAgICAgICAgICAgICBjcmMzMi5jYWxjdWxhdGUocmVnaXN0ZXJlZFVzZXJEYXRhLmlkKS50b1N0cmluZygpID09PSByZWZlcnJhbENvZGVOdW1iZXJQYXJ0ICYmXG4gICAgICAgICAgICAgICAgbWF0Y2hlZFVzZXJJZHMucHVzaChyZWdpc3RlcmVkVXNlckRhdGEuaWQpKTtcblxuICAgICAgICAgICAgLy8gaWYgdGhlcmUgaXMgbm90IG9ubHkgMSBtYXRjaGVkIHVzZXIsIHRoZW4gd2Ugd2lsbCByZXR1cm4gYW4gZXJyb3IgYmVjYXVzZSB3ZSBuZWVkIG9ubHkgMSBtYXRjaCBwZXIgY2FsbFxuICAgICAgICAgICAgaWYgKG1hdGNoZWRVc2VySWRzLmxlbmd0aCAhPT0gMSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IG1hdGNoZWRVc2VySWRzLmxlbmd0aCA9PT0gMFxuICAgICAgICAgICAgICAgICAgICA/IGBObyBtYXRjaGVkIHVzZXIgZm91bmQgZm9yIHJlZmVycmFsIGNvZGUgJHt1c2VyRnJvbVJlZmVycmFsSW5wdXQucmVmZXJyYWxDb2RlfWBcbiAgICAgICAgICAgICAgICAgICAgOiBgTW9yZSB0aGFuIDEgbWF0Y2hlZCB1c2VycyBmb3VuZCBmb3IgcmVmZXJyYWwgY29kZSAke3VzZXJGcm9tUmVmZXJyYWxJbnB1dC5yZWZlcnJhbENvZGV9YDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogbWF0Y2hlZFVzZXJJZHMubGVuZ3RoID09PSAwXG4gICAgICAgICAgICAgICAgICAgICAgICA/IFJlZmVycmFsRXJyb3JUeXBlLk5vbmVPckFic2VudFxuICAgICAgICAgICAgICAgICAgICAgICAgOiBSZWZlcnJhbEVycm9yVHlwZS5EdXBsaWNhdGVPYmplY3RGb3VuZFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gZmlsdGVyIG91dCBhbmQgcmV0dXJuIHRoZSBtYXRjaGVkIHVzZXIgKHNob3VsZCBvbmx5IGJlIDEpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogbWF0Y2hlZFVzZXJJZHNbMF1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFJldHJpZXZpbmcgYWxsIHVzZXJzIHRocm91Z2ggdGhlIGdldEFsbFVzZXJzRm9yTm90aWZpY2F0aW9uUmVtaW5kZXJzIGNhbGwgZmFpbGVkYDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBSZWZlcnJhbEVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgJHtmaWVsZE5hbWV9IHF1ZXJ5ICR7ZXJyfWA7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgIGVycm9yVHlwZTogUmVmZXJyYWxFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH07XG4gICAgfVxufVxuIl19