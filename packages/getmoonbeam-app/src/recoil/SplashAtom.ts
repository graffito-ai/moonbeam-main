import {atom} from "recoil";

/**
 * Atom used to keep track of the splash status state, to be used for displaying a splash
 * screen after.
 */
const splashStatusState = atom({
    key: "splashStatusState",
    default: {
        splashTitle: "",
        splashDescription: "",
        splashButtonText: "",
        splashArtSource: require(''),
        withButton: true
    }
});

/**
 * Export all atoms and/or selectors
 */
export {
    splashStatusState
};
