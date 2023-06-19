import { CardLinkResponse, GetCardLinkInput } from "@moonbeam/moonbeam-models";
/**
 * GetCardLink resolver
 *
 * @param getCardLinkInput card link input used for the linking object to be retrieved
 * @returns {@link Promise} of {@link CardLinkResponse}
 */
export declare const getCardLink: (getCardLinkInput: GetCardLinkInput) => Promise<CardLinkResponse>;
