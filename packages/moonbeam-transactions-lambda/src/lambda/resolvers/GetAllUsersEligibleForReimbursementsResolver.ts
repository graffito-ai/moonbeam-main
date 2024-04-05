import {NotificationReminderErrorType, MoonbeamClient, UserForNotificationReminderResponse} from "@moonbeam/moonbeam-models";

/**
 * GetAllUsersEligibleForReimbursements resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @returns {@link Promise} of {@link UserForNotificationReminderResponse}
 */
export const getAllUsersEligibleForReimbursements = async (fieldName: string): Promise<UserForNotificationReminderResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        /**
         * retrieve the list of all existent users, eligible for reimbursements
         *
         * first, initialize the Moonbeam Client API here, in order to call the appropriate endpoints for this handler
         */
        const moonbeamClient = new MoonbeamClient(process.env.ENV_NAME!, region);
        const usersEligibleForReimbursementsResponse: UserForNotificationReminderResponse = await moonbeamClient.getAllUsersEligibleForReimbursements();

        // check to see if the get all users eligible for reimbursements call was successful or not
        if (usersEligibleForReimbursementsResponse && !usersEligibleForReimbursementsResponse.errorMessage && !usersEligibleForReimbursementsResponse.errorType &&
            usersEligibleForReimbursementsResponse.data && usersEligibleForReimbursementsResponse.data.length !== 0) {
            // return all the users eligible for reimbursements accordingly
            return {
                data: usersEligibleForReimbursementsResponse.data
            };
        } else {
            const errorMessage = `Retrieving all users through the getAllUsersEligibleForReimbursements call failed`;
            console.log(errorMessage);

            return {
                errorMessage: errorMessage,
                errorType: NotificationReminderErrorType.UnexpectedError
            }
        }
    } catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: NotificationReminderErrorType.UnexpectedError
        };
    }
}
