import {EligibleLinkedUsersResponse, MoonbeamClient} from "@moonbeam/moonbeam-models";
import {APIGatewayProxyResult} from "aws-lambda";

/**
 * Function used to handle incoming reimbursement trigger, by first
 * swifting through the list of users with linked cards (whom we can
 * pay out), and sending a message for each of them, to the reimbursement
 * producer that will initiate the reimbursement process.
 */
export const triggerReimbursementHandler = async (): Promise<void> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        /**
         * The overall reimbursement cron triggering, will be made up of the following steps:
         *
         * 1) Call the getEligibleLinkedUsers Moonbeam AppSync API endpoint, to retrieve a list of eligible users
         * 2) Call the reimbursementsAcknowledgment Moonbeam API Gateway endpoint, to kick off the reimbursements
         *    process.
         */
            // first initialize the Moonbeam Client API here, in order to call the appropriate endpoints for this resolver
        const moonbeamClient = new MoonbeamClient(process.env.ENV_NAME!, region);
        // execute the eligible members retrieval call
        const response: EligibleLinkedUsersResponse = await moonbeamClient.getEligibleLinkedUsers();

        // check to see if the eligible member details call was executed successfully
        if (response && !response.errorMessage && !response.errorType && response.data && response.data.length !== 0) {
            // loop through all the retrieved eligible linked users
            for (const eligibleLinkedUser of response.data!) {
                // ensure that all the information is available.
                if (eligibleLinkedUser!.id && eligibleLinkedUser!.id.length !== 0 && eligibleLinkedUser!.memberId && eligibleLinkedUser!.memberId.length !== 0 &&
                    eligibleLinkedUser!.cardId && eligibleLinkedUser!.cardId.length !== 0) {

                    // execute the reimbursements acknowledgment call
                    const response: APIGatewayProxyResult = await moonbeamClient.reimbursementsAcknowledgment(eligibleLinkedUser!);

                    // check to see if the reimbursements acknowledgment call was executed successfully
                    if (response.statusCode === 202) {
                        console.log(`Successfully acknowledged reimbursement for user - ${eligibleLinkedUser!.id}!`);
                    } else {
                        /**
                         * for any users for which the reimbursement has not been acknowledged, do nothing other than logging the errors
                         * for the ones for which this info is not, do nothing other than logging the errors.
                         */
                        const errorMessage = `Unexpected response structure returned from the reimbursements acknowledgment call!`;
                        console.log(`${errorMessage} ${response && JSON.stringify(response)}`);
                    }
                } else {
                    /**
                     * for the ones for which this info is not, do nothing other than logging the errors.
                     * in the future we might need some alerts and metrics emitting here
                     */
                    console.log(`Unexpected eligible linked user structure returned ${JSON.stringify(eligibleLinkedUser)}`);
                }
            }
        } else {
            /**
             * if there are any errors encountered while retrieving the eligible members,
             * then do nothing, other than logging the errors
             */
            const errorMessage = `Unexpected response structure returned from the get eligible linked members call!`;
            console.log(`${errorMessage} ${response && JSON.stringify(response)}`);
        }
    } catch (error) {
        /**
         * no need for further actions, since this error will be logged and nothing will execute further.
         * in the future we might need some alerts and metrics emitting here
         */
        console.log(`Unexpected error while processing reimbursement cron event ${error}`);
    }
}
