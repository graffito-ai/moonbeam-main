import {atom} from "recoil";

/**
 * Atom used to keep track of whether the code verification
 * sheet is shown or not.
 */
const codeVerificationSheetShown = atom({
    key: "codeVerificationSheetShown",
    default: false
});

/**
 * Atom used to keep track of whether the code has been
 * verified or not.
 */
const codeVerifiedState = atom({
    key: "codeVerifiedState",
    default: false
});

/**
 * Export all atoms and/or selectors
 */
export {
    codeVerificationSheetShown,
    codeVerifiedState
};
