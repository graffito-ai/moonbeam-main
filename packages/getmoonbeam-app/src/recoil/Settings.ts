import {atom} from "recoil";

/**
 * Atom used to keep track of the state of navigation for the
 * Settings navigation.
 */
const goToProfileSettingsState = atom<boolean>({
    key: "goToProfileSettingsState",
    default: false
});


/**
 * Export all atoms and/or selectors
 */
export {
    goToProfileSettingsState
};
