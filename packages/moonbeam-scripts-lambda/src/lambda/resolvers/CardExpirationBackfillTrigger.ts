/**
 * Function used to handle the back-fill of the all the cards'
 * expiration dates.
 *
 * @returns a {@link Promise} of {@link void}, since the EventBridger
 * event trigger, will execute a cron job and not return anything.
 */
export const triggerCardExpirationBackFill = async (): Promise<void> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        /**
         * The overall card expiration data back-fill cron triggering, will be made up of the following steps:
         *
         * 1) Call the getEligibleLinkedUsers Moonbeam AppSync API, in order to get all the users which have
         * linked cards.
         *
         * 2) For each user, loop through their linked cards (up to 3 at the moment), and call the getCardDetails
         * Olive API, in order to retrieve the card's expiration date.
         *
         * 3) Call the updateCard Moonbeam AppSync API, in order to update the expiration date for each one of those
         * cards internally.
         */

    } catch (error) {
        /**
         * no need for further actions, since this error will be logged and nothing will execute further.
         * in the future we might need some alerts and metrics emitting here
         */
        console.log(`Unexpected error while processing the card expiration back-fill cron event ${error}`);
    }
}
