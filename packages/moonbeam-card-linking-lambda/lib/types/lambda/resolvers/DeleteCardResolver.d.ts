import { CardResponse, DeleteCardInput } from "@moonbeam/moonbeam-models";
/**
 * DeleteCard resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param deleteCardInput delete card input object, used to delete/unlink a card object from an existing user/
 * card linked object.
 * @returns {@link Promise} of {@link CardResponse}
 */
export declare const deleteCard: (fieldName: string, deleteCardInput: DeleteCardInput) => Promise<CardResponse>;
