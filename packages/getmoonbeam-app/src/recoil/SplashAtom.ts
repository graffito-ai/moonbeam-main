import {atom} from "recoil";

/**
 * Atom used to keep track of the splash status state, to be used for displaying a splash
 * screen.
 */
const splashStatusState = atom({
    key: "splashStatusState",
    default: {
        splashTitle: "",
        splashDescription: "",
        splashButtonText: "",
        splashArtSource: require('')
    }
});

/**
 * Export all atoms and/or selectors
 */
export {
    splashStatusState
};
