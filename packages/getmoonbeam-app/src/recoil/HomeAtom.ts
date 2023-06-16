import {atom} from "recoil";

/**
 * Atom used to keep track of the state of the bottom tab
 * for the Home components/pages (meaning if it will be shown or not).
 */
const bottomTabShownState = atom({
    key: "bottomTabShownState",
    default: true
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
 * Export all atoms and/or selectors
 */
export {
    appWallStepNumber,
    bottomTabShownState,
    additionalAppWallDocumentationNeeded,
    additionalAppWallDocumentationErrors
};
