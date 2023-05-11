import {atom} from "recoil";

/**
 * Atom used to keep track of the information for the current authenticated
 * user.
 */
const currentUserInformation = atom({
    key: "currentUserInformation",
    default: {}
});

/**
 * Atom used to keep track of whether the authentication component has
 * rendered before or not.
 */
const initialAuthenticationScreen = atom({
   key: "initialAuthenticationScreen",
   default: "SignIn"
});

/**
 * Export all atoms and/or selectors
 */
export {currentUserInformation, initialAuthenticationScreen}
