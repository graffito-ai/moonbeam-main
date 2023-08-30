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
 * Export all atoms and/or selectors
 */
export {
    bottomTabShownState,
    bottomBarNavigationState,
    drawerNavigationState
};
