import { CardLinkResponse, CreateCardLinkInput } from "@moonbeam/moonbeam-models";
/**
 * CreateCardLink resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param createCardLinkInput card link input object, used to create a card link object and/or add a new card to
 * an existing linking object
 * @returns {@link Promise} of {@link CardLinkResponse}
 */
export declare const createCardLink: (fieldName: string, createCardLinkInput: CreateCardLinkInput) => Promise<CardLinkResponse>;
