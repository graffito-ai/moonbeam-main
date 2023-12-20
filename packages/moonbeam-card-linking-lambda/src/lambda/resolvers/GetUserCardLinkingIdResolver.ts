import {
    CardLinkErrorType,
    GetUserCardLinkingIdInput,
    GetUserCardLinkingIdResponse,
    OliveClient
} from "@moonbeam/moonbeam-models";

/**
 * GetEligibleLinkedUsers resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getUserCardLinkingIdInput input containing the Moonbeam internal ID, used to
 * retrieve a user's card linking ID.
 * @returns {@link Promise} of {@link GetUserCardLinkingIdResponse}
 */
export const getUserCardLinkingId = async (fieldName: string, getUserCardLinkingIdInput: GetUserCardLinkingIdInput): Promise<GetUserCardLinkingIdResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        /**
         * retrieve the member details for a card-linked member with an external member id representing
         * the Moonbeam internal ID, in order to retrieve the card linking ID.
         *
         * first, initialize the Olive Client API here, in order to call the appropriate endpoints for this handler
         */
        const oliveClient = new OliveClient(process.env.ENV_NAME!, region);
        const userCardLinkingIdResponse: GetUserCardLinkingIdResponse = await oliveClient.getUserCardLinkingId(getUserCardLinkingIdInput);

        // check to see if the get user card linking ID call was successful or not
        if (userCardLinkingIdResponse && !userCardLinkingIdResponse.errorMessage && !userCardLinkingIdResponse.errorType &&
            userCardLinkingIdResponse.data && userCardLinkingIdResponse.data.length !== 0) {
            // return the external/user's card linking id accordingly
            return {
                data: userCardLinkingIdResponse.data
            }
        } else {
            // check if there are no users matched for that Moonbeam internal ID, and return the appropriate error
            if (userCardLinkingIdResponse.errorType === CardLinkErrorType.NoneOrAbsent) {
                console.log(userCardLinkingIdResponse.errorMessage);

                return {
                    errorMessage: userCardLinkingIdResponse.errorMessage,
                    errorType: userCardLinkingIdResponse.errorType
                }
            } else {
                const errorMessage = `Retrieving member details through the getUserCardLinkingId call failed`;
                console.log(errorMessage);

                return {
                    errorMessage: errorMessage,
                    errorType: CardLinkErrorType.UnexpectedError
                }
            }
        }
    } catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: CardLinkErrorType.UnexpectedError
        };
    }
}
