import { CardResponse, DeleteCardInput } from "@moonbeam/moonbeam-models";
/**
 * DeleteCard resolver
 *
 * @param deleteCardInput card link input object, used to delete/unlink a card object from an existing user/
 * card linked object.
 * @returns {@link Promise} of {@link CardResponse}
 */
export declare const deleteCard: (deleteCardInput: DeleteCardInput) => Promise<CardResponse>;
