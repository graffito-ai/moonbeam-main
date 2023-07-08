import {atom} from "recoil";

/**
 * Atom used to keep track of the state of the header state
 * for the App Drawer (meaning if it will be shown or not).
 */
const appDrawerHeaderShownState = atom({
    key: "appDrawerHeaderShownState",
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
 * Atom used to keep track of the card-linking status, so that we can determine whether we show
 * the card linking banner or not.
 */
const cardLinkingStatusState = atom({
    key: "cardLinkingStatusState",
    default: false
});

/**
 * Atom used to keep track of a flag, indicating whether the banner will be shown or not. In some cases,
 * even if a banner is shown, we don't want to display it for some screens.
 */
const customBannerShown = atom({
    key: "customBannerShown",
    default: false
});

/**
 * Atom used to keep track of a flag, indicating whether the AppDrawer can open via a swipe from different
 * Home screens.
 */
const drawerSwipeState = atom({
   key: 'drawerSwipeState',
   default: true
});

/**
 * Atom used to keep track of the profile picture URI, retrieved from storage.
 */
const profilePictureURIState = atom({
    key: 'profilePictureURIState',
    default: ""
});

/**
 * Atom used to keep track of whether a custom app drawer style should be activated for when
 * the dashboard screen is active.
 */
const drawerDashboardState = atom({
    key: 'drawerDashboardState',
    default: false
});

/**
 * Export all atoms and/or selectors
 */
export {
    drawerDashboardState,
    appDrawerHeaderShownState,
    appWallStepNumber,
    additionalAppWallDocumentationNeeded,
    additionalAppWallDocumentationErrors,
    cardLinkingStatusState,
    customBannerShown,
    drawerSwipeState,
    profilePictureURIState
};
