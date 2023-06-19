import {atom} from "recoil";

/**
 * Atom used to keep track of the state of the header state
 * for the App Drawer (meaning if it will be shown or not).
 */
const appDrawerHeaderShownState = atom({
    key: "appDrawerHeaderShownState",
    default: false
});

/**
 * Atom used to keep track of the Application Wall step number
 */
const appWallStepNumber = atom({
    key: "appWallStepNumber",
    default: 0
});

/**
 * Atom used to keep track of whether additional documentation is needed in the Application Wall, in
 * order to verify military eligibility.
 */
const additionalAppWallDocumentationNeeded = atom({
    key: "additionalAppWallDocumentationNeeded",
    default: false
});

/**
 * Atom used to keep track of the military verification specific, additional documentation errors, in
 * the Application Wall.
 */
const additionalAppWallDocumentationErrors = atom({
    key: "additionalAppWallDocumentationErrors",
    default: []
});

/**
 * Atom used to keep track of the card-linking status, so that we can determine whether we show
 * the card linking banner or not.
 */
const cardLinkingStatusState = atom({
    key: "cardLinkingStatusState",
    default: false
});

/**
 * Export all atoms and/or selectors
 */
export {
    appDrawerHeaderShownState,
    appWallStepNumber,
    additionalAppWallDocumentationNeeded,
    additionalAppWallDocumentationErrors,
    cardLinkingStatusState
};
