import {atom} from "recoil";

/**
 * Atom used to keep track of the status of the card linking to be shared across the wallet, in
 * order to be able to display a confirmation message and close the external Olive linking pop-up/
 * bottom sheet.
 */
const cardLinkingBottomSheetState = atom({
    key: "cardLinkingBottomSheetState",
    default: false
});

/**
 * Atom used to keep track of the index of the selected card, as it appears in the list of cards.
 */
const selectedCardIndexState = atom<number>({
    key: "selectedCardIndexState",
    default: 0
});

/**
 * Export all atoms and/or selectors
 */
export {
    cardLinkingBottomSheetState,
    selectedCardIndexState
};
