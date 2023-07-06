import { CardLinkResponse, GetCardLinkInput } from "@moonbeam/moonbeam-models";
/**
 * GetCardLink resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getCardLinkInput card link input used for the linking object to be retrieved
 * @returns {@link Promise} of {@link CardLinkResponse}
 */
export declare const getCardLink: (fieldName: string, getCardLinkInput: GetCardLinkInput) => Promise<CardLinkResponse>;
