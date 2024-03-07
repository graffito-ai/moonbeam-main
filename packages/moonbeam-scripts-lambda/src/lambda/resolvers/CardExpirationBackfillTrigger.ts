import {EligibleLinkedUsersResponse, MoonbeamClient, OliveClient, CardDetailsResponse} from "@moonbeam/moonbeam-models";

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
         *
         * First initialize all the clients that we will need in order to make these API calls
         */
        const moonbeamClient = new MoonbeamClient(process.env.ENV_NAME!, region);
        const oliveClient = new OliveClient(process.env.ENV_NAME!, region);

        // 1) Call the getEligibleLinkedUsers Moonbeam AppSync API endpoint
        const linkedUsersResponse: EligibleLinkedUsersResponse = await moonbeamClient.getEligibleLinkedUsers();

        // check to see if the get eligible linked user call was successful or not.
        if (linkedUsersResponse !== null && linkedUsersResponse !== undefined && !linkedUsersResponse.errorMessage
            && !linkedUsersResponse.errorType && linkedUsersResponse.data && linkedUsersResponse.data.length !== 0) {
            const failedUpdates: string[] = [];

            for (const linkedUser of linkedUsersResponse.data) {
                // make sure that we have appropriately formatted retrieved linked users
                if (linkedUser !== null) {
                    for (const cardId of linkedUser.cardIds) {
                        if (cardId !== null) {
                            // call the getCardDetails Olive API, in order to retrieve the card's expiration date.
                            const expirationDateResponse: CardDetailsResponse = await oliveClient.getCardDetails(cardId);

                            // check to see if the get card details call was successful or not.
                            if (expirationDateResponse !== null && expirationDateResponse !== undefined &&
                                !expirationDateResponse.errorMessage && !expirationDateResponse.errorType &&
                                expirationDateResponse.data && expirationDateResponse.data.length !== 0) {

                                // 3) Call the updateCard Moonbeam AppSync API, to update the expiration date for each card
                                const updatedDetailsResponse: EligibleLinkedUsersResponse = await moonbeamClient.updateCardDetails({
                                    cardId: cardId,
                                    id: linkedUser.id,
                                    memberId: linkedUser.memberId,
                                    expirationDate: expirationDateResponse.data
                                });

                                // check to see if the update details call was successful or not.
                                if (updatedDetailsResponse !== null && updatedDetailsResponse !== undefined &&
                                    !updatedDetailsResponse.errorMessage && !updatedDetailsResponse.errorType &&
                                    updatedDetailsResponse.data) {
                                    // do nothing here but log a successfully updated card
                                    console.log(`Card ${cardId} successfully updated!`);
                                } else {
                                    /**
                                     * do not stop updating the other cards' expiration dates, just take note of what has not been
                                     * updated successfully
                                     */
                                    failedUpdates.push(`${linkedUser.id} | ${linkedUser.memberId} | ${cardId}`);
                                }
                            } else {
                                /**
                                 * do not stop updating the other cards' expiration dates, just take note of what has not been
                                 * updated successfully
                                 */
                                failedUpdates.push(`${linkedUser.id} | ${linkedUser.memberId} | ${cardId}`);
                            }
                        }
                    }
                }
            }

            // print all the failed updates accordingly
            if (failedUpdates.length !== 0) {
                console.log(`------------------FAILED CARD UPDATES------------------`);
                failedUpdates.forEach(failedUpdate => {
                    console.log(`${failedUpdate}\n`);
                });
                console.log(`-------------------------------------------------------`);
            } else {
                console.log(`All cards successfully updated!`);
            }
        } else {
            /**
             * no need for further actions, since this error will be logged and nothing will execute further.
             * in the future we might need some alerts and metrics emitting here.
             */
            console.log(`Linked users retrieval through GET linked users call failed`);
        }
    } catch (error) {
        /**
         * no need for further actions, since this error will be logged and nothing will execute further.
         * in the future we might need some alerts and metrics emitting here.
         */
        console.log(`Unexpected error while processing the card expiration back-fill cron event ${error}`);
    }
}
