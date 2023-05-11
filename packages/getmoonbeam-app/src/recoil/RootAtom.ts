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
const initialAuthenticationRender = atom({
   key: "initialAuthenticationRender",
   default: true
});

const onLayoutRootView = atom({
    key: 'onLayoutRootView',
    default: () => Promise<void>
})

/**
 * Export all atoms and/or selectors
 */
export {currentUserInformation, initialAuthenticationRender, onLayoutRootView}
