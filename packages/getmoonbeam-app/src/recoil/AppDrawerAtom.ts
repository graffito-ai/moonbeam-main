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
 * Export all atoms and/or selectors
 */
export {
    appDrawerHeaderShownState
};
