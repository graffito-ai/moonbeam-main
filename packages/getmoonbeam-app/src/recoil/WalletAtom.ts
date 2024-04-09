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
 * Atom to be used in order to keep track of the click only section reload, tracked
 * when users link and unlink their cards.
 */
const clickOnlySectionReloadState = atom<boolean>({
    key: "clickOnlySectionReloadState",
    default: false
});

/**
 * Atom to be used in order to keep track of the vertical click only section reload, tracked
 * when users link and unlink their cards.
 */
const verticalClickOnlySectionReloadState = atom<boolean>({
    key: "verticalClickOnlySectionReloadState",
    default: false
});

/**
 * Atom to be used in order to keep track of the kits section reload, tracked
 * when users link and unlink their cards.
 */
const kitSectionReloadState = atom<boolean>({
    key: "kitSectionReloadState",
    default: false
});

/**
 * Atom to be used in order to keep track of the fidelis section reload, tracked
 * when users link and unlink their cards.
 */
const fidelisSectionReloadState = atom<boolean>({
    key: "fidelisSectionReloadState",
    default: false
});

/**
 * Atom to be used in order to keep track of the vertical fidelis section reload, tracked
 * when users link and unlink their cards.
 */
const verticalFidelisSectionReloadState = atom<boolean>({
    key: "verticalFidelisSectionReloadState",
    default: false
});

/**
 * Atom to be used in order to keep track of the nearby section reload, tracked
 * when users link and unlink their cards.
 */
const nearbySectionReloadState = atom<boolean>({
    key: "nearbySectionReloadState",
    default: false
});

/**
 * Atom to be used in order to keep track of the vertical nearby section reload, tracked
 * when users link and unlink their cards.
 */
const verticalNearbySectionReloadState = atom<boolean>({
    key: "verticalNearbySectionReloadState",
    default: false
});

/**
 * Atom to be used in order to keep track of the online section reload, tracked
 * when users link and unlink their cards.
 */
const onlineSectionReloadState = atom<boolean>({
    key: "onlineSectionReloadState",
    default: false
});

/**
 * Atom to be used in order to keep track of the vertical online section reload, tracked
 * when users link and unlink their cards.
 */
const verticalOnlineSectionReloadState = atom<boolean>({
    key: "verticalOnlineSectionReloadState",
    default: false
});


/**
 * Export all atoms and/or selectors
 */
export {
    cardLinkingBottomSheetState,
    selectedCardIndexState,

    clickOnlySectionReloadState,
    verticalClickOnlySectionReloadState,
    kitSectionReloadState,
    fidelisSectionReloadState,
    verticalFidelisSectionReloadState,
    nearbySectionReloadState,
    verticalNearbySectionReloadState,
    onlineSectionReloadState,
    verticalOnlineSectionReloadState
};
