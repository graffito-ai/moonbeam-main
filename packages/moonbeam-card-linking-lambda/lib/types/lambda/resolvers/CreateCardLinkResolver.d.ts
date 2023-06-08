import { CardLinkResponse, CreateCardLinkInput } from "@moonbeam/moonbeam-models";
/**
 * CreateCardLink resolver
 *
 * @param createCardLinkInput card link input object, used to create a card link object and/or add a new card to
 * an existing linking object
 * @returns {@link Promise} of {@link CardLinkResponse}
 */
export declare const createCardLink: (createCardLinkInput: CreateCardLinkInput) => Promise<CardLinkResponse>;
