import {atom} from "recoil";
import {FidelisPartner, Offer} from "@moonbeam/moonbeam-models";

/**
 * Atom used to keep track of the store offer/partner state, to be used for displaying an offer/partner
 * detailed screen.
 */
const storeOfferState = atom<Offer | FidelisPartner | null>({
    key: "storeOfferState",
    default: null
});

/**
 * Atom used to keep track of the store offer/partner physical location (if any), to be used for displaying
 * an offer/partner detailed screen.
 */
const storeOfferPhysicalLocationState = atom<string>({
    key: "storeOfferPhysicalLocationState",
    default: ''
})

/**
 * Export all atoms and/or selectors
 */
export {
    storeOfferState,
    storeOfferPhysicalLocationState
};
