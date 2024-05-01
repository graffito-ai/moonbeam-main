import {atom} from "recoil";
import {PlaidLinkingSession} from "@moonbeam/moonbeam-models";

/**
 * Atom used to keep track of the Roundups Activation data retrieved.
 */
const roundupsActiveState = atom<boolean>({
    key: "roundupsActiveState",
    default: false
});

/**
 * Atom used to keep track of whether the Plaid Linking session is
 * initiated or not
 */
const isPlaidLinkInitiatedState = atom<boolean>({
    key: "isPlaidLinkInitiatedState",
    default: false
});

/**
 * Atom used to keep track of whether the roundups splash is ready
 * or not.
 */
const isRoundupsSplashReadyState = atom<boolean>({
    key: "isRoundupsSplashReadyState",
    default: true
});

/**
 * Atom used to keep track of the Hosted Session Link of the
 * Plaid Linking session, initiated by the user.
 */
const plaidLinkingSessionState = atom<PlaidLinkingSession | null>({
    key: "plaidLinkingSessionState",
    default: null
});

/**
 * Atom used to keep track of the roundups splash step number.
 */
const roundupsSplashStepNumberState = atom<number>({
    key: "roundupsSplashStepNumberState",
    default: 0
});

/**
 * Export all atoms and/or selectors
 */
export {
    roundupsSplashStepNumberState,
    plaidLinkingSessionState,
    isRoundupsSplashReadyState,
    isPlaidLinkInitiatedState,
    roundupsActiveState
};
