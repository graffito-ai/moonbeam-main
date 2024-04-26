import {atom} from "recoil";

/**
 * Atom used to keep track of the Roundups Activation data retrieved.
 */
const roundupsActiveState = atom<boolean>({
    key: "roundupsActiveState",
    default: false
});

const isPlaidLinkInitiatedState = atom<boolean>({
    key: "isPlaidLinkInitiatedState",
    default: false
})

/**
 * Export all atoms and/or selectors
 */
export {
    isPlaidLinkInitiatedState,
    roundupsActiveState
};
