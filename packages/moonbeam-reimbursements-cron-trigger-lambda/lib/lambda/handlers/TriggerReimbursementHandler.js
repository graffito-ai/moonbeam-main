"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerReimbursementHandler = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * Function used to handle incoming reimbursement trigger, by first
 * swifting through the list of users with linked cards (whom we can
 * pay out), and sending a message for each of them, to the reimbursement
 * producer that will initiate the reimbursement process.
 */
const triggerReimbursementHandler = async () => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        /**
         * The overall reimbursement cron triggering, will be made up of the following steps:
         *
         * 1) Call the getEligibleLinkedUsers Moonbeam AppSync API endpoint, to retrieve a list of eligible users
         * 2) Call the reimbursementsAcknowledgment Moonbeam API Gateway endpoint, to kick off the reimbursements
         *    process.
         */
        // first initialize the Moonbeam Client API here, in order to call the appropriate endpoints for this resolver
        const moonbeamClient = new moonbeam_models_1.MoonbeamClient(process.env.ENV_NAME, region);
        // execute the eligible members retrieval call
        const response = await moonbeamClient.getEligibleLinkedUsers();
        // check to see if the eligible member details call was executed successfully
        if (response && !response.errorMessage && !response.errorType && response.data && response.data.length !== 0) {
            // loop through all the retrieved eligible linked users
            for (const eligibleLinkedUser of response.data) {
                // ensure that all the information is available.
                if (eligibleLinkedUser.id && eligibleLinkedUser.id.length !== 0 && eligibleLinkedUser.memberId && eligibleLinkedUser.memberId.length !== 0 &&
                    eligibleLinkedUser.cardId && eligibleLinkedUser.cardId.length !== 0) {
                    // execute the reimbursements acknowledgment call
                    const response = await moonbeamClient.reimbursementsAcknowledgment(eligibleLinkedUser);
                    // check to see if the reimbursements acknowledgment call was executed successfully
                    if (response.statusCode === 202) {
                        console.log(`Successfully acknowledged reimbursement for user - ${eligibleLinkedUser.id}!`);
                    }
                    else {
                        /**
                         * for any users for which the reimbursement has not been acknowledged, do nothing other than logging the errors
                         * for the ones for which this info is not, do nothing other than logging the errors.
                         */
                        const errorMessage = `Unexpected response structure returned from the reimbursements acknowledgment call!`;
                        console.log(`${errorMessage} ${response && JSON.stringify(response)}`);
                    }
                }
                else {
                    /**
                     * for the ones for which this info is not, do nothing other than logging the errors.
                     * in the future we might need some alerts and metrics emitting here
                     */
                    console.log(`Unexpected eligible linked user structure returned ${JSON.stringify(eligibleLinkedUser)}`);
                }
            }
        }
        else {
            /**
             * if there are any errors encountered while retrieving the eligible members,
             * then do nothing, other than logging the errors
             */
            const errorMessage = `Unexpected response structure returned from the get eligible linked members call!`;
            console.log(`${errorMessage} ${response && JSON.stringify(response)}`);
        }
    }
    catch (error) {
        /**
         * no need for further actions, since this error will be logged and nothing will execute further.
         * in the future we might need some alerts and metrics emitting here
         */
        console.log(`Unexpected error while processing reimbursement cron event ${error}`);
    }
};
exports.triggerReimbursementHandler = triggerReimbursementHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVHJpZ2dlclJlaW1idXJzZW1lbnRIYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9oYW5kbGVycy9UcmlnZ2VyUmVpbWJ1cnNlbWVudEhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0RBQXNGO0FBR3RGOzs7OztHQUtHO0FBQ0ksTUFBTSwyQkFBMkIsR0FBRyxLQUFLLElBQW1CLEVBQUU7SUFDakUsSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2Qzs7Ozs7O1dBTUc7UUFDQyw4R0FBOEc7UUFDbEgsTUFBTSxjQUFjLEdBQUcsSUFBSSxnQ0FBYyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3pFLDhDQUE4QztRQUM5QyxNQUFNLFFBQVEsR0FBZ0MsTUFBTSxjQUFjLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztRQUU1Riw2RUFBNkU7UUFDN0UsSUFBSSxRQUFRLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsSUFBSSxRQUFRLENBQUMsSUFBSSxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUMxRyx1REFBdUQ7WUFDdkQsS0FBSyxNQUFNLGtCQUFrQixJQUFJLFFBQVEsQ0FBQyxJQUFLLEVBQUU7Z0JBQzdDLGdEQUFnRDtnQkFDaEQsSUFBSSxrQkFBbUIsQ0FBQyxFQUFFLElBQUksa0JBQW1CLENBQUMsRUFBRSxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksa0JBQW1CLENBQUMsUUFBUSxJQUFJLGtCQUFtQixDQUFDLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQztvQkFDMUksa0JBQW1CLENBQUMsTUFBTSxJQUFJLGtCQUFtQixDQUFDLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO29CQUV2RSxpREFBaUQ7b0JBQ2pELE1BQU0sUUFBUSxHQUEwQixNQUFNLGNBQWMsQ0FBQyw0QkFBNEIsQ0FBQyxrQkFBbUIsQ0FBQyxDQUFDO29CQUUvRyxtRkFBbUY7b0JBQ25GLElBQUksUUFBUSxDQUFDLFVBQVUsS0FBSyxHQUFHLEVBQUU7d0JBQzdCLE9BQU8sQ0FBQyxHQUFHLENBQUMsc0RBQXNELGtCQUFtQixDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7cUJBQ2hHO3lCQUFNO3dCQUNIOzs7MkJBR0c7d0JBQ0gsTUFBTSxZQUFZLEdBQUcscUZBQXFGLENBQUM7d0JBQzNHLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxZQUFZLElBQUksUUFBUSxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO3FCQUMxRTtpQkFDSjtxQkFBTTtvQkFDSDs7O3VCQUdHO29CQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsc0RBQXNELElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQzNHO2FBQ0o7U0FDSjthQUFNO1lBQ0g7OztlQUdHO1lBQ0gsTUFBTSxZQUFZLEdBQUcsbUZBQW1GLENBQUM7WUFDekcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFlBQVksSUFBSSxRQUFRLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDMUU7S0FDSjtJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ1o7OztXQUdHO1FBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyw4REFBOEQsS0FBSyxFQUFFLENBQUMsQ0FBQztLQUN0RjtBQUNMLENBQUMsQ0FBQTtBQTlEWSxRQUFBLDJCQUEyQiwrQkE4RHZDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtFbGlnaWJsZUxpbmtlZFVzZXJzUmVzcG9uc2UsIE1vb25iZWFtQ2xpZW50fSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuaW1wb3J0IHtBUElHYXRld2F5UHJveHlSZXN1bHR9IGZyb20gXCJhd3MtbGFtYmRhXCI7XG5cbi8qKlxuICogRnVuY3Rpb24gdXNlZCB0byBoYW5kbGUgaW5jb21pbmcgcmVpbWJ1cnNlbWVudCB0cmlnZ2VyLCBieSBmaXJzdFxuICogc3dpZnRpbmcgdGhyb3VnaCB0aGUgbGlzdCBvZiB1c2VycyB3aXRoIGxpbmtlZCBjYXJkcyAod2hvbSB3ZSBjYW5cbiAqIHBheSBvdXQpLCBhbmQgc2VuZGluZyBhIG1lc3NhZ2UgZm9yIGVhY2ggb2YgdGhlbSwgdG8gdGhlIHJlaW1idXJzZW1lbnRcbiAqIHByb2R1Y2VyIHRoYXQgd2lsbCBpbml0aWF0ZSB0aGUgcmVpbWJ1cnNlbWVudCBwcm9jZXNzLlxuICovXG5leHBvcnQgY29uc3QgdHJpZ2dlclJlaW1idXJzZW1lbnRIYW5kbGVyID0gYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgb3ZlcmFsbCByZWltYnVyc2VtZW50IGNyb24gdHJpZ2dlcmluZywgd2lsbCBiZSBtYWRlIHVwIG9mIHRoZSBmb2xsb3dpbmcgc3RlcHM6XG4gICAgICAgICAqXG4gICAgICAgICAqIDEpIENhbGwgdGhlIGdldEVsaWdpYmxlTGlua2VkVXNlcnMgTW9vbmJlYW0gQXBwU3luYyBBUEkgZW5kcG9pbnQsIHRvIHJldHJpZXZlIGEgbGlzdCBvZiBlbGlnaWJsZSB1c2Vyc1xuICAgICAgICAgKiAyKSBDYWxsIHRoZSByZWltYnVyc2VtZW50c0Fja25vd2xlZGdtZW50IE1vb25iZWFtIEFQSSBHYXRld2F5IGVuZHBvaW50LCB0byBraWNrIG9mZiB0aGUgcmVpbWJ1cnNlbWVudHNcbiAgICAgICAgICogICAgcHJvY2Vzcy5cbiAgICAgICAgICovXG4gICAgICAgICAgICAvLyBmaXJzdCBpbml0aWFsaXplIHRoZSBNb29uYmVhbSBDbGllbnQgQVBJIGhlcmUsIGluIG9yZGVyIHRvIGNhbGwgdGhlIGFwcHJvcHJpYXRlIGVuZHBvaW50cyBmb3IgdGhpcyByZXNvbHZlclxuICAgICAgICBjb25zdCBtb29uYmVhbUNsaWVudCA9IG5ldyBNb29uYmVhbUNsaWVudChwcm9jZXNzLmVudi5FTlZfTkFNRSEsIHJlZ2lvbik7XG4gICAgICAgIC8vIGV4ZWN1dGUgdGhlIGVsaWdpYmxlIG1lbWJlcnMgcmV0cmlldmFsIGNhbGxcbiAgICAgICAgY29uc3QgcmVzcG9uc2U6IEVsaWdpYmxlTGlua2VkVXNlcnNSZXNwb25zZSA9IGF3YWl0IG1vb25iZWFtQ2xpZW50LmdldEVsaWdpYmxlTGlua2VkVXNlcnMoKTtcblxuICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIGVsaWdpYmxlIG1lbWJlciBkZXRhaWxzIGNhbGwgd2FzIGV4ZWN1dGVkIHN1Y2Nlc3NmdWxseVxuICAgICAgICBpZiAocmVzcG9uc2UgJiYgIXJlc3BvbnNlLmVycm9yTWVzc2FnZSAmJiAhcmVzcG9uc2UuZXJyb3JUeXBlICYmIHJlc3BvbnNlLmRhdGEgJiYgcmVzcG9uc2UuZGF0YS5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgIC8vIGxvb3AgdGhyb3VnaCBhbGwgdGhlIHJldHJpZXZlZCBlbGlnaWJsZSBsaW5rZWQgdXNlcnNcbiAgICAgICAgICAgIGZvciAoY29uc3QgZWxpZ2libGVMaW5rZWRVc2VyIG9mIHJlc3BvbnNlLmRhdGEhKSB7XG4gICAgICAgICAgICAgICAgLy8gZW5zdXJlIHRoYXQgYWxsIHRoZSBpbmZvcm1hdGlvbiBpcyBhdmFpbGFibGUuXG4gICAgICAgICAgICAgICAgaWYgKGVsaWdpYmxlTGlua2VkVXNlciEuaWQgJiYgZWxpZ2libGVMaW5rZWRVc2VyIS5pZC5sZW5ndGggIT09IDAgJiYgZWxpZ2libGVMaW5rZWRVc2VyIS5tZW1iZXJJZCAmJiBlbGlnaWJsZUxpbmtlZFVzZXIhLm1lbWJlcklkLmxlbmd0aCAhPT0gMCAmJlxuICAgICAgICAgICAgICAgICAgICBlbGlnaWJsZUxpbmtlZFVzZXIhLmNhcmRJZCAmJiBlbGlnaWJsZUxpbmtlZFVzZXIhLmNhcmRJZC5sZW5ndGggIT09IDApIHtcblxuICAgICAgICAgICAgICAgICAgICAvLyBleGVjdXRlIHRoZSByZWltYnVyc2VtZW50cyBhY2tub3dsZWRnbWVudCBjYWxsXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlOiBBUElHYXRld2F5UHJveHlSZXN1bHQgPSBhd2FpdCBtb29uYmVhbUNsaWVudC5yZWltYnVyc2VtZW50c0Fja25vd2xlZGdtZW50KGVsaWdpYmxlTGlua2VkVXNlciEpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgcmVpbWJ1cnNlbWVudHMgYWNrbm93bGVkZ21lbnQgY2FsbCB3YXMgZXhlY3V0ZWQgc3VjY2Vzc2Z1bGx5XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXNDb2RlID09PSAyMDIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBTdWNjZXNzZnVsbHkgYWNrbm93bGVkZ2VkIHJlaW1idXJzZW1lbnQgZm9yIHVzZXIgLSAke2VsaWdpYmxlTGlua2VkVXNlciEuaWR9IWApO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBmb3IgYW55IHVzZXJzIGZvciB3aGljaCB0aGUgcmVpbWJ1cnNlbWVudCBoYXMgbm90IGJlZW4gYWNrbm93bGVkZ2VkLCBkbyBub3RoaW5nIG90aGVyIHRoYW4gbG9nZ2luZyB0aGUgZXJyb3JzXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBmb3IgdGhlIG9uZXMgZm9yIHdoaWNoIHRoaXMgaW5mbyBpcyBub3QsIGRvIG5vdGhpbmcgb3RoZXIgdGhhbiBsb2dnaW5nIHRoZSBlcnJvcnMuXG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tIHRoZSByZWltYnVyc2VtZW50cyBhY2tub3dsZWRnbWVudCBjYWxsIWA7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7cmVzcG9uc2UgJiYgSlNPTi5zdHJpbmdpZnkocmVzcG9uc2UpfWApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIGZvciB0aGUgb25lcyBmb3Igd2hpY2ggdGhpcyBpbmZvIGlzIG5vdCwgZG8gbm90aGluZyBvdGhlciB0aGFuIGxvZ2dpbmcgdGhlIGVycm9ycy5cbiAgICAgICAgICAgICAgICAgICAgICogaW4gdGhlIGZ1dHVyZSB3ZSBtaWdodCBuZWVkIHNvbWUgYWxlcnRzIGFuZCBtZXRyaWNzIGVtaXR0aW5nIGhlcmVcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBVbmV4cGVjdGVkIGVsaWdpYmxlIGxpbmtlZCB1c2VyIHN0cnVjdHVyZSByZXR1cm5lZCAke0pTT04uc3RyaW5naWZ5KGVsaWdpYmxlTGlua2VkVXNlcil9YCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBpZiB0aGVyZSBhcmUgYW55IGVycm9ycyBlbmNvdW50ZXJlZCB3aGlsZSByZXRyaWV2aW5nIHRoZSBlbGlnaWJsZSBtZW1iZXJzLFxuICAgICAgICAgICAgICogdGhlbiBkbyBub3RoaW5nLCBvdGhlciB0aGFuIGxvZ2dpbmcgdGhlIGVycm9yc1xuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSB0aGUgZ2V0IGVsaWdpYmxlIGxpbmtlZCBtZW1iZXJzIGNhbGwhYDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtyZXNwb25zZSAmJiBKU09OLnN0cmluZ2lmeShyZXNwb25zZSl9YCk7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAvKipcbiAgICAgICAgICogbm8gbmVlZCBmb3IgZnVydGhlciBhY3Rpb25zLCBzaW5jZSB0aGlzIGVycm9yIHdpbGwgYmUgbG9nZ2VkIGFuZCBub3RoaW5nIHdpbGwgZXhlY3V0ZSBmdXJ0aGVyLlxuICAgICAgICAgKiBpbiB0aGUgZnV0dXJlIHdlIG1pZ2h0IG5lZWQgc29tZSBhbGVydHMgYW5kIG1ldHJpY3MgZW1pdHRpbmcgaGVyZVxuICAgICAgICAgKi9cbiAgICAgICAgY29uc29sZS5sb2coYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgcHJvY2Vzc2luZyByZWltYnVyc2VtZW50IGNyb24gZXZlbnQgJHtlcnJvcn1gKTtcbiAgICB9XG59XG4iXX0=