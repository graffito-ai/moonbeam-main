import {atom} from "recoil";

/**
 * Atom used to keep track of the root Branch Universal Object
 * State, to be used across the app (BUO).
 */
const branchRootUniversalObjectState = atom<Object | null>({
    key: 'branchRootUniversalObjectState',
    default: null
});

/**
 * Atom used to keep track of the referral code usually obtained
 * through a deep-link coming from Branch Universal Link.
 */
const referralCodeState =  atom<string>({
    key: 'referralCodeState',
    default: ""
});

/**
 * Export all atoms and/or selectors
 */
export {
    branchRootUniversalObjectState,
    referralCodeState
}
