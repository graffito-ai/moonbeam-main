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
});

/**
 * Atom used to keep track of the page number for the nearby offers, that we left off at, so next time
 * we load more nearby offers, we know where to start from.
 */
const nearbyOffersPageNumberState= atom<number>({
    key: "nearbyOffersPageNumberState",
    default: 1
});

/**
 * Atom used to keep track of the page number for the online offers, that we left off at, so next time
 * we load more nearby offers, we know where to start from.
 */
const onlineOffersPageNumberState= atom<number>({
    key: "onlineOffersPageNumberState",
    default: 1
});

/**
 * Atom used to keep track of the list of online offers to be displayed to the end user.
 */
const onlineOffersListState = atom<Offer[]>({
   key: "onlineOffersListState",
   default: []
});

/**
 * Atom used to keep track of the list of nearby offers to be displayed to the user.
 */
const nearbyOffersListState = atom<Offer[]>({
    key: "nearbyOffersListState",
    default: []
});

/**
 * Atom used to keep track of whether there are any more online offers to load.
 */
const noOnlineOffersToLoadState = atom<boolean>({
    key: "noOnlineOffersToLoadState",
    default: false
});

/**
 * Atom used to keep track of whether there are any more nearby offers to load.
 */
const noNearbyOffersToLoadState = atom<boolean>({
    key: "noNearbyOffersToLoadState",
    default: false
});

/**
 * Atom used to keep track of whether the nearby offers are based
 * on the user's geolocation or their home address.
 */
const offersNearUserLocationFlagState = atom<boolean>({
    key: "offersNearUserLocationFlagState",
    default: false
});

/**
 * Export all atoms and/or selectors
 */
export {
    offersNearUserLocationFlagState,
    noOnlineOffersToLoadState,
    noNearbyOffersToLoadState,
    onlineOffersListState,
    nearbyOffersListState,
    nearbyOffersPageNumberState,
    onlineOffersPageNumberState,
    storeOfferState,
    storeOfferPhysicalLocationState
};
