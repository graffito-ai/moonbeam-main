import {atom} from "recoil";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";

/**
 * Atom used to keep track of the state of the bottom tab
 * for the Home components/pages (meaning if it will be shown or not).
 */
const bottomTabShownState = atom({
    key: "bottomTabShownState",
    default: true
});

/**
 * Atom used to keep track of the bottom bar navigation.
 */
const bottomBarNavigationState = atom<NativeStackNavigationProp<any> | null>({
   key: "bottomBarNavigationState",
   default: null
});


/**
 * Atom used to keep track of the drawer navigation.
 */
const drawerNavigationState = atom<NativeStackNavigationProp<any> | null>({
    key: "drawerNavigationState",
    default: null
});

/**
 * Atom used to keep track of whether the bottom tab needs showing.
 */
const bottomTabNeedsShowingState = atom<boolean>({
    key: "bottomTabNeedsShowingState",
    default: true
});

/**
 * Atom used to keep track of whether we are navigating from the Marketplace or not.
 */
const comingFromMarketplaceState = atom<boolean>({
    key: "comingFromMarketplaceState",
    default: false
});


/**
 * Export all atoms and/or selectors
 */
export {
    comingFromMarketplaceState,
    bottomTabNeedsShowingState,
    bottomTabShownState,
    bottomBarNavigationState,
    drawerNavigationState
};
