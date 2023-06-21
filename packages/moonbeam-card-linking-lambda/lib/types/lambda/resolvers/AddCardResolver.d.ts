import { AddCardInput, CardLinkResponse } from "@moonbeam/moonbeam-models";
/**
 * AddCard resolver
 *
 * @param addCardInput add card input object, used to add/link a card object to an existing user/
 * card linked object.
 * @returns {@link Promise} of {@link CardResponse}
 */
export declare const addCard: (addCardInput: AddCardInput) => Promise<CardLinkResponse>;
