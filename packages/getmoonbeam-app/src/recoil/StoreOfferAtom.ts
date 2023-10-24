import {atom, selector} from "recoil";
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
const storeOfferPhysicalLocationState = atom<{
    latitude: number,
    longitude: number,
    latitudeDelta: number,
    longitudeDelta: number,
    addressAsString: string
}>({
    key: "storeOfferPhysicalLocationState",
    default: {
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0,
        longitudeDelta: 0,
        addressAsString: ''
    }
});

/**
 * Atom used to keep track of the page number for the nearby offers, that we left off at, so next time
 * we load more nearby offers, we know where to start from.
 */
const nearbyOffersPageNumberState = atom<number>({
    key: "nearbyOffersPageNumberState",
    default: 1
});

/**
 * Atom used to keep track of the page number for the premier nearby offers, that we left off at, so next time
 * we load more nearby offers, we know where to start from.
 */
const premierNearbyOffersPageNumberState = atom<number>({
    key: "premierNearbyOffersPageNumberState",
    default: 1
});

/**
 * Atom used to keep track of the page number for the online offers, that we left off at, so next time
 * we load more nearby offers, we know where to start from.
 */
const onlineOffersPageNumberState = atom<number>({
    key: "onlineOffersPageNumberState",
    default: 1
});

/**
 * Atom used to keep track of the page number for the premier online offers, that we left off at, so next time
 * we load more nearby offers, we know where to start from.
 */
const premierOnlineOffersPageNumberState = atom<number>({
    key: "premierOnlineOffersPageNumberState",
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
 * A selector used to make sure that there are no duplicate online offers returned.
 */
const uniqueOnlineOffersListState = selector<Offer[]>({
    key: 'uniqueOnlineOffersListState',
    get: ({get}) => {
        const onlineOfferList = get(onlineOffersListState);
        if (onlineOfferList === null) {
            return [];
        } else {
            // make sure that all transactions are unique based on their id
            return [...new Map(onlineOfferList.map(offer =>
                [offer.id, offer])).values()];
        }
    }
});

/**
 * Atom used to keep track of the list of nearby offers to be displayed to the user.
 */
const nearbyOffersListState = atom<Offer[]>({
    key: "nearbyOffersListState",
    default: []
});

/**
 * Atom used to keep track of the list of nearby offers used for the horizontal
 * main map.
 */
const nearbyOffersListForMainHorizontalMapState = atom<Offer[]>({
    key: "nearbyOffersListForMainHorizontalMapState",
    default: []
});

/**
 * Atom used to keep track of the list of nearby offers used for the full screen
 * main map.
 */
const nearbyOffersListForFullScreenMapState = atom<Offer[]>({
    key: "nearbyOffersListForFullScreenMapState",
    default: []
});

/**
 * A selector used to make sure that there are no duplicate nearby offers returned
 * for the full screen main map.
 */
const uniqueNearbyOffersListForFullScreenMapState = selector<Offer[]>({
    key: 'uniqueNearbyOffersListForFullScreenMapState',
    get: ({get}) => {
        const nearbyOfferList = get(nearbyOffersListForFullScreenMapState);
        if (nearbyOfferList === null) {
            return [];
        } else {
            // make sure that all transactions are unique based on their id
            return [...new Map(nearbyOfferList.map(offer =>
                [offer.id, offer])).values()];
        }
    }
});

/**
 * A selector used to make sure that there are no duplicate nearby offers returned
 * for the horizontal main map.
 */
const uniqueNearbyOffersListForMainHorizontalMapState = selector<Offer[]>({
    key: 'uniqueNearbyOffersListForMainHorizontalMapState',
    get: ({get}) => {
        const nearbyOfferList = get(nearbyOffersListForMainHorizontalMapState);
        if (nearbyOfferList === null) {
            return [];
        } else {
            // make sure that all transactions are unique based on their id
            return [...new Map(nearbyOfferList.map(offer =>
                [offer.id, offer])).values()];
        }
    }
});

/**
 * A selector used to make sure that there are no duplicate nearby offers returned.
 */
const uniqueNearbyOffersListState = selector<Offer[]>({
    key: 'uniqueNearbyOffersListState',
    get: ({get}) => {
        const nearbyOfferList = get(nearbyOffersListState);
        if (nearbyOfferList === null) {
            return [];
        } else {
            // make sure that all transactions are unique based on their id
            return [...new Map(nearbyOfferList.map(offer =>
                [offer.id, offer])).values()];
        }
    }
});

/**
 * Atom used to handle the filter by discount.
 */
const filteredByDiscountPressedState = atom<boolean>({
    key: 'filteredByDiscountPressedState',
    default: false
});

/**
 * Atom used to keep track of whether the FAB filter should be open or not.
 */
const filtersActiveState = atom<boolean>({
    key: 'filtersActiveState',
    default: false
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
 * Atom used to keep track of whether the permissions button is displayed in the marketplace
 * or not.
 */
const locationServicesButtonState = atom<boolean>({
    key: "locationServicesButtonState",
    default: false
});

/**
 * Atom used to keep track of whether the nearby locations need to be reloaded or not, depending on
 * if the permissions button has been pressed/enabled or not.
 */
const reloadNearbyDueToPermissionsChangeState = atom<boolean>({
    key: "reloadNearbyDueToPermissionsChangeState",
    default: false
});

/**
 * Atom used to keep track of whether the nearby offers spinner is shown or not.
 */
const nearbyOffersSpinnerShownState = atom<boolean>({
    key: "nearbyOffersSpinnerShownState",
    default: false
});

/**
 * Atom used to keep track of whether a search should be reset or not
 */
const resetSearchState = atom<boolean>({
    key: "resetSearchState",
    default: false
});

/**
 * Atom used to keep track of the top toggle in the store
 */
const toggleViewPressedState = atom<'horizontal' | 'vertical' | 'map' | null>({
    key: "toggleViewPressedState",
    default: 'horizontal'
});

/**
 * Atom used to keep track of the vertical view toggle in the store
 */
const verticalSectionActiveState = atom<'fidelis' | 'online' | 'nearby' | null>({
    key: "verticalSectionActiveState",
    default: 'online'
});

/**
 * Atom used to keep track of the search query from the store
 */
const searchQueryState = atom<string>({
    key: "searchQueryState",
    default: ''
});

/**
 * Atom used to keep track of the number of offers that are within
 * 25 miles from the user.
 */

const numberOfOffersWithin25MilesState = atom<number>({
    key: "numberOfOffersWithin25MilesState",
    default: 0
});

/**
 * Atom used to keep track of the number of offers that are within
 * 5 miles from the user.
 */
const numberOfOffersWithin5MilesState = atom<number>({
    key: "numberOfOffersWithin5MilesState",
    default: 0
});

/**
 * Atom used to keep track of the number of online offers.
 */
const numberOfOnlineOffersState = atom<number>({
    key: "numberOfOnlineOffersState",
    default: 0
});

/**
 * Export all atoms and/or selectors
 */
export {
    numberOfOnlineOffersState,
    nearbyOffersListForFullScreenMapState,
    uniqueNearbyOffersListForFullScreenMapState,
    uniqueNearbyOffersListForMainHorizontalMapState,
    nearbyOffersListForMainHorizontalMapState,
    numberOfOffersWithin5MilesState,
    numberOfOffersWithin25MilesState,
    filteredByDiscountPressedState,
    filtersActiveState,
    toggleViewPressedState,
    verticalSectionActiveState,
    searchQueryState,
    resetSearchState,
    uniqueOnlineOffersListState,
    uniqueNearbyOffersListState,
    nearbyOffersSpinnerShownState,
    reloadNearbyDueToPermissionsChangeState,
    locationServicesButtonState,
    premierNearbyOffersPageNumberState,
    premierOnlineOffersPageNumberState,
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
