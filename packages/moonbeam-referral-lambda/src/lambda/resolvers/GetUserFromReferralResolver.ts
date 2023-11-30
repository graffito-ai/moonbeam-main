import {
    CRC32,
    MoonbeamClient,
    ReferralErrorType,
    UserForNotificationReminderResponse,
    UserFromReferralInput,
    UserFromReferralResponse
} from "@moonbeam/moonbeam-models";

/**
 * GetUserFromReferral resolver
 *
 * @param userFromReferralInput the input needed to retrieve a user's details from a referral code
 * @param fieldName name of the resolver path from the AppSync event
 * @returns {@link Promise} of {@link UserFromReferralResponse}
 */
export const getUserFromReferral = async (fieldName: string, userFromReferralInput: UserFromReferralInput): Promise<UserFromReferralResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        /**
         * retrieve the list of all existent users from our Cognito user pool
         *
         * first, initialize the Moonbeam Client API here, in order to call the appropriate endpoints for this handler
         */
        const moonbeamClient = new MoonbeamClient(process.env.ENV_NAME!, region);
        const allRegisteredUsersResponse: UserForNotificationReminderResponse = await moonbeamClient.getAllUsersForNotificationReminders();

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
        const crc32 = new CRC32();

        // check to see if the get all users call was successful or not
        if (allRegisteredUsersResponse && !allRegisteredUsersResponse.errorMessage && !allRegisteredUsersResponse.errorType &&
            allRegisteredUsersResponse.data && allRegisteredUsersResponse.data.length !== 0) {

            // filter the users retrieved based on the last name, first letter of the first name and the CRC32(custom:userId) operation
            const matchedUserIds: string[] = [];
            allRegisteredUsersResponse.data.forEach(registeredUserData =>
                registeredUserData !== null &&
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
                        ? ReferralErrorType.NoneOrAbsent
                        : ReferralErrorType.DuplicateObjectFound
                }
            } else {
                // filter out and return the matched user (should only be 1)
                return {
                    data: matchedUserIds[0]
                };
            }
        } else {
            const errorMessage = `Retrieving all users through the getAllUsersForNotificationReminders call failed`;
            console.log(errorMessage);

            return {
                errorMessage: errorMessage,
                errorType: ReferralErrorType.UnexpectedError
            }
        }
    } catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: ReferralErrorType.UnexpectedError
        };
    }
}
