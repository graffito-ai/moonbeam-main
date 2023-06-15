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
 * Export all atoms and/or selectors
 */
export {
    appWallStepNumber,
    bottomTabShownState
};
