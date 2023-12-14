import {atom, selector} from "recoil";
import {FidelisPartner, Offer, OfferCategory} from "@moonbeam/moonbeam-models";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";

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
 * Atom used to keep track of the page number for the nearby food offers, that we left off at, so next time
 * we load more nearby offers, we know where to start from.
 */
const nearbyFoodCategorizedOffersPageNumberState = atom<number>({
    key: "nearbyFoodCategorizedOffersPageNumberState",
    default: 1
});

/**
 * Atom used to keep track of the page number for the nearby retail offers, that we left off at, so next time
 * we load more nearby offers, we know where to start from.
 */
const nearbyRetailCategorizedOffersPageNumberState = atom<number>({
    key: "nearbyRetailCategorizedOffersPageNumberState",
    default: 1
});

/**
 * Atom used to keep track of the page number for the nearby entertainment offers, that we left off at, so next time
 * we load more nearby offers, we know where to start from.
 */
const nearbyEntertainmentCategorizedOffersPageNumberState = atom<number>({
    key: "nearbyEntertainmentCategorizedOffersPageNumberState",
    default: 1
});

/**
 * Atom used to keep track of the page number for the nearby electronics offers, that we left off at, so next time
 * we load more nearby offers, we know where to start from.
 */
const nearbyElectronicsCategorizedOffersPageNumberState = atom<number>({
    key: "nearbyElectronicsCategorizedOffersPageNumberState",
    default: 1
});

/**
 * Atom used to keep track of the page number for the nearby home offers, that we left off at, so next time
 * we load more nearby offers, we know where to start from.
 */
const nearbyHomeCategorizedOffersPageNumberState = atom<number>({
    key: "nearbyHomeCategorizedOffersPageNumberState",
    default: 1
});

/**
 * Atom used to keep track of the page number for the nearby health and beauty offers, that we left off at, so next time
 * we load more nearby offers, we know where to start from.
 */
const nearbyHealthAndBeautyCategorizedOffersPageNumberState = atom<number>({
    key: "nearbyHealthAndBeautyCategorizedOffersPageNumberState",
    default: 1
});

/**
 * Atom used to keep track of the page number for the nearby office and business offers, that we left off at, so next time
 * we load more nearby offers, we know where to start from.
 */
const nearbyOfficeAndBusinessCategorizedOffersPageNumberState = atom<number>({
    key: "nearbyOfficeAndBusinessCategorizedOffersPageNumberState",
    default: 1
});

/**
 * Atom used to keep track of the page number for the nearby services and subscriptions offers, that we left off at, so next time
 * we load more nearby offers, we know where to start from.
 */
const nearbyServicesAndSubscriptionsCategorizedOffersPageNumberState = atom<number>({
    key: "nearbyServicesAndSubscriptionsCategorizedOffersPageNumberState",
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
 * we load more offers, we know where to start from.
 */
const onlineOffersPageNumberState = atom<number>({
    key: "onlineOffersPageNumberState",
    default: 1
});

/**
 * Atom used to keep track of the page number for the click-only online offers, that we left off at, so
 * next time we load more offers, we know where to start from.
 */
const clickOnlyOnlineOffersPageNumberState = atom<number>({
    key: "clickOnlyOnlineOffersPageNumberState",
    default: 1
});

/**
 * Atom used to keep track of the page number for the online Veterans Day offers, that we left off at, so next time
 * we load more offers, we know where to start from.
 */
const onlineVeteransDayCategorizedOffersPageNumberState = atom<number>({
    key: "onlineVeteransDayCategorizedOffersPageNumberState",
    default: 1
});

/**
 * Atom used to keep track of the page number for the online food offers, that we left off at, so next time
 * we load more offers, we know where to start from.
 */
const onlineFoodCategorizedOffersPageNumberState = atom<number>({
    key: "onlineFoodCategorizedOffersPageNumberState",
    default: 1
});

/**
 * Atom used to keep track of the page number for the online retail offers, that we left off at, so next time
 * we load more offers, we know where to start from.
 */
const onlineRetailCategorizedOffersPageNumberState = atom<number>({
    key: "onlineRetailCategorizedOffersPageNumberState",
    default: 1
});

/**
 * Atom used to keep track of the page number for the online entertainment offers, that we left off at, so next time
 * we load more offers, we know where to start from.
 */
const onlineEntertainmentCategorizedOffersPageNumberState = atom<number>({
    key: "onlineEntertainmentCategorizedOffersPageNumberState",
    default: 1
});

/**
 * Atom used to keep track of the page number for the online electronics offers, that we left off at, so next time
 * we load more offers, we know where to start from.
 */
const onlineElectronicsCategorizedOffersPageNumberState = atom<number>({
    key: "onlineElectronicsCategorizedOffersPageNumberState",
    default: 1
});

/**
 * Atom used to keep track of the page number for the online home offers, that we left off at, so next time
 * we load more offers, we know where to start from.
 */
const onlineHomeCategorizedOffersPageNumberState = atom<number>({
    key: "onlineHomeCategorizedOffersPageNumberState",
    default: 1
});

/**
 * Atom used to keep track of the page number for the online health and beauty offers, that we left off at, so next time
 * we load more offers, we know where to start from.
 */
const onlineHealthAndBeautyCategorizedOffersPageNumberState = atom<number>({
    key: "onlineHealthAndBeautyCategorizedOffersPageNumberState",
    default: 1
});

/**
 * Atom used to keep track of the page number for the online office and business offers, that we left off at, so next time
 * we load more offers, we know where to start from.
 */
const onlineOfficeAndBusinessCategorizedOffersPageNumberState = atom<number>({
    key: "onlineOfficeAndBusinessCategorizedOffersPageNumberState",
    default: 1
});

/**
 * Atom used to keep track of the page number for the online services and subscriptions offers, that we left off at, so next time
 * we load more offers, we know where to start from.
 */
const onlineServicesAndSubscriptionsCategorizedOffersPageNumberState = atom<number>({
    key: "onlineServicesAndSubscriptionsCategorizedOffersPageNumberState",
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
 * Atom used to keep track of the page number for the premier click-only online offers, that we left off at, so
 * next time we load more nearby offers, we know where to start from.
 */
const premierClickOnlyOnlineOffersPageNumberState = atom<number>({
    key: "premierClickOnlyOnlineOffersPageNumberState",
    default: 1
});

/**
 * Atom used to keep track of the list of click-only online offers to be displayed
 * to the end user.
 */
const clickOnlyOnlineOffersListState = atom<Offer[]>({
    key: "clickOnlyOnlineOffersListState",
    default: []
});

/**
 * A selector used to make sure that there are no duplicate click-only online offers
 * returned.
 */
const uniqueClickOnlyOnlineOffersListState = selector<Offer[]>({
    key: 'uniqueClickOnlyOnlineOffersListState',
    get: ({get}) => {
        const clickOnlyOnlineOfferList = get(clickOnlyOnlineOffersListState);
        if (clickOnlyOnlineOfferList === null) {
            return [];
        } else {
            // make sure that all transactions are unique based on their id
            return [...new Map(clickOnlyOnlineOfferList.map(offer =>
                [offer.id, offer])).values()];
        }
    }
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
 * Atom used to keep track of the list of online Veterans Day offers to be displayed to the end user.
 */
const onlineVeteransDayCategorizedOfferListState = atom<Offer[]>({
    key: "onlineVeteransDayCategorizedOfferListState",
    default: []
});

/**
 * A selector used to make sure that there are no duplicate online Veterans Day offers returned.
 */
const uniqueOnlineVeteransDayOffersListState = selector<Offer[]>({
    key: 'uniqueOnlineVeteransDayOffersListState',
    get: ({get}) => {
        const onlineOfferList = get(onlineVeteransDayCategorizedOfferListState);
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
 * Atom used to keep track of the list of online food offers to be displayed to the end user.
 */
const onlineFoodCategorizedOfferListState = atom<Offer[]>({
    key: "onlineFoodCategorizedOfferListState",
    default: []
});

/**
 * A selector used to make sure that there are no duplicate online food offers returned.
 */
const uniqueOnlineFoodOffersListState = selector<Offer[]>({
    key: 'uniqueOnlineFoodOffersListState',
    get: ({get}) => {
        const onlineOfferList = get(onlineFoodCategorizedOfferListState);
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
 * Atom used to keep track of the list of online retail offers to be displayed to the end user.
 */
const onlineRetailCategorizedOfferListState = atom<Offer[]>({
    key: "onlineRetailCategorizedOfferListState",
    default: []
});

/**
 * A selector used to make sure that there are no duplicate online retail offers returned.
 */
const uniqueOnlineRetailOffersListState = selector<Offer[]>({
    key: 'uniqueOnlineRetailOffersListState',
    get: ({get}) => {
        const onlineOfferList = get(onlineRetailCategorizedOfferListState);
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
 * Atom used to keep track of the list of online entertainment offers to be displayed to the end user.
 */
const onlineEntertainmentCategorizedOfferListState = atom<Offer[]>({
    key: "onlineEntertainmentCategorizedOfferListState",
    default: []
});

/**
 * A selector used to make sure that there are no duplicate online entertainment offers returned.
 */
const uniqueOnlineEntertainmentOffersListState = selector<Offer[]>({
    key: 'uniqueOnlineEntertainmentOffersListState',
    get: ({get}) => {
        const onlineOfferList = get(onlineEntertainmentCategorizedOfferListState);
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
 * Atom used to keep track of the list of online electronics offers to be displayed to the end user.
 */
const onlineElectronicsCategorizedOfferListState = atom<Offer[]>({
    key: "onlineElectronicsCategorizedOfferListState",
    default: []
});

/**
 * A selector used to make sure that there are no duplicate online electronics offers returned.
 */
const uniqueOnlineElectronicsOffersListState = selector<Offer[]>({
    key: 'uniqueOnlineElectronicsOffersListState',
    get: ({get}) => {
        const onlineOfferList = get(onlineElectronicsCategorizedOfferListState);
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
 * Atom used to keep track of the list of online home offers to be displayed to the end user.
 */
const onlineHomeCategorizedOfferListState = atom<Offer[]>({
    key: "onlineHomeCategorizedOfferListState",
    default: []
});

/**
 * A selector used to make sure that there are no duplicate online home offers returned.
 */
const uniqueOnlineHomeOffersListState = selector<Offer[]>({
    key: 'uniqueOnlineHomeOffersListState',
    get: ({get}) => {
        const onlineOfferList = get(onlineHomeCategorizedOfferListState);
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
 * Atom used to keep track of the list of online health and beauty offers to be displayed to the end user.
 */
const onlineHealthAndBeautyCategorizedOfferListState = atom<Offer[]>({
    key: "onlineHealthAndBeautyCategorizedOfferListState",
    default: []
});

/**
 * A selector used to make sure that there are no duplicate online health and beauty offers returned.
 */
const uniqueOnlineHealthAndBeautyOffersListState = selector<Offer[]>({
    key: 'uniqueOnlineHealthAndBeautyOffersListState',
    get: ({get}) => {
        const onlineOfferList = get(onlineHealthAndBeautyCategorizedOfferListState);
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
 * Atom used to keep track of the list of online office and business offers to be displayed to the end user.
 */
const onlineOfficeAndBusinessCategorizedOfferListState = atom<Offer[]>({
    key: "onlineOfficeAndBusinessCategorizedOfferListState",
    default: []
});

/**
 * A selector used to make sure that there are no duplicate online office and business offers returned.
 */
const uniqueOnlineOfficeAndBusinessOffersListState = selector<Offer[]>({
    key: 'uniqueOnlineOfficeAndBusinessOffersListState',
    get: ({get}) => {
        const onlineOfferList = get(onlineOfficeAndBusinessCategorizedOfferListState);
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
 * Atom used to keep track of the list of online services and subscriptions offers to be displayed to the end user.
 */
const onlineServicesAndSubscriptionsCategorizedOfferListState = atom<Offer[]>({
    key: "onlineServicesAndSubscriptionsCategorizedOfferListState",
    default: []
});

/**
 * A selector used to make sure that there are no duplicate online services and subscriptions offers returned.
 */
const uniqueOnlineServicesAndSubscriptionsOffersListState = selector<Offer[]>({
    key: 'uniqueOnlineServicesAndSubscriptionsOffersListState',
    get: ({get}) => {
        const onlineOfferList = get(onlineServicesAndSubscriptionsCategorizedOfferListState);
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
 * Atom used to keep track of the list of nearby food offers to be displayed to the user.
 */
const nearbyFoodCategorizedOffersListState = atom<Offer[]>({
    key: "nearbyFoodCategorizedOffersListState",
    default: []
});

/**
 * A selector used to make sure that there are no duplicate nearby food offers returned.
 */
const uniqueNearbyFoodOffersListState = selector<Offer[]>({
    key: 'uniqueNearbyFoodOffersListState',
    get: ({get}) => {
        const nearbyOfferList = get(nearbyFoodCategorizedOffersListState);
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
 * Atom used to keep track of the list of nearby retail offers to be displayed to the user.
 */
const nearbyRetailCategorizedOffersListState = atom<Offer[]>({
    key: "nearbyRetailCategorizedOffersListState",
    default: []
});

/**
 * A selector used to make sure that there are no duplicate nearby retail offers returned.
 */
const uniqueNearbyRetailOffersListState = selector<Offer[]>({
    key: 'uniqueNearbyRetailOffersListState',
    get: ({get}) => {
        const nearbyOfferList = get(nearbyRetailCategorizedOffersListState);
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
 * Atom used to keep track of the list of nearby entertainment offers to be displayed to the user.
 */
const nearbyEntertainmentCategorizedOffersListState = atom<Offer[]>({
    key: "nearbyEntertainmentCategorizedOffersListState",
    default: []
});

/**
 * A selector used to make sure that there are no duplicate nearby entertainment offers returned.
 */
const uniqueNearbyEntertainmentOffersListState = selector<Offer[]>({
    key: 'uniqueNearbyEntertainmentOffersListState',
    get: ({get}) => {
        const nearbyOfferList = get(nearbyEntertainmentCategorizedOffersListState);
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
 * Atom used to keep track of the list of nearby electronics offers to be displayed to the user.
 */
const nearbyElectronicsCategorizedOffersListState = atom<Offer[]>({
    key: "nearbyElectronicsCategorizedOffersListState",
    default: []
});

/**
 * A selector used to make sure that there are no duplicate nearby electronics offers returned.
 */
const uniqueNearbyElectronicsOffersListState = selector<Offer[]>({
    key: 'uniqueNearbyElectronicsOffersListState',
    get: ({get}) => {
        const nearbyOfferList = get(nearbyElectronicsCategorizedOffersListState);
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
 * Atom used to keep track of the list of nearby home offers to be displayed to the user.
 */
const nearbyHomeCategorizedOffersListState = atom<Offer[]>({
    key: "nearbyHomeCategorizedOffersListState",
    default: []
});

/**
 * A selector used to make sure that there are no duplicate nearby home offers returned.
 */
const uniqueNearbyHomeOffersListState = selector<Offer[]>({
    key: 'uniqueNearbyHomeOffersListState',
    get: ({get}) => {
        const nearbyOfferList = get(nearbyHomeCategorizedOffersListState);
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
 * Atom used to keep track of the list of nearby health and beauty offers to be displayed to the user.
 */
const nearbyHealthAndBeautyCategorizedOffersListState = atom<Offer[]>({
    key: "nearbyHealthAndBeautyCategorizedOffersListState",
    default: []
});

/**
 * A selector used to make sure that there are no duplicate nearby health and beauty offers returned.
 */
const uniqueNearbyHealthAndBeautyOffersListState = selector<Offer[]>({
    key: 'uniqueNearbyHealthAndBeautyOffersListState',
    get: ({get}) => {
        const nearbyOfferList = get(nearbyHealthAndBeautyCategorizedOffersListState);
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
 * Atom used to keep track of the list of nearby office and business offers to be displayed to the user.
 */
const nearbyOfficeAndBusinessCategorizedOffersListState = atom<Offer[]>({
    key: "nearbyOfficeAndBusinessCategorizedOffersListState",
    default: []
});

/**
 * A selector used to make sure that there are no duplicate nearby office and business offers returned.
 */
const uniqueNearbyOfficeAndBusinessOffersListState = selector<Offer[]>({
    key: 'uniqueNearbyOfficeAndBusinessOffersListState',
    get: ({get}) => {
        const nearbyOfferList = get(nearbyOfficeAndBusinessCategorizedOffersListState);
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
 * Atom used to keep track of the list of nearby services and subscriptions offers to be displayed to the user.
 */
const nearbyServicesAndSubscriptionsCategorizedOffersListState = atom<Offer[]>({
    key: "nearbyServicesAndSubscriptionsCategorizedOffersListState",
    default: []
});

/**
 * A selector used to make sure that there are no duplicate nearby services and subscriptions offers returned.
 */
const uniqueNearbyServicesAndSubscriptionsOffersListState = selector<Offer[]>({
    key: 'uniqueNearbyServicesAndSubscriptionsOffersListState',
    get: ({get}) => {
        const nearbyOfferList = get(nearbyServicesAndSubscriptionsCategorizedOffersListState);
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
 * Atom used to keep track of whether there are any more click-only online offers
 * to load.
 */
const noClickOnlyOnlineOffersToLoadState = atom<boolean>({
    key: "noClickOnlyOnlineOffersToLoadState",
    default: false
});

/**
 * Atom used to keep track of whether there are any more online Veterans Day offers to load.
 */
const noOnlineVeteransDayCategorizedOffersToLoadState = atom<boolean>({
    key: "noOnlineVeteransDayCategorizedOffersToLoadState",
    default: false
});

/**
 * Atom used to keep track of whether there are any more online food offers to load.
 */
const noOnlineFoodCategorizedOffersToLoadState = atom<boolean>({
    key: "noOnlineFoodCategorizedOffersToLoadState",
    default: false
});

/**
 * Atom used to keep track of whether there are any more online retail offers to load.
 */
const noOnlineRetailCategorizedOffersToLoadState = atom<boolean>({
    key: "noOnlineRetailCategorizedOffersToLoadState",
    default: false
});

/**
 * Atom used to keep track of whether there are any more online entertainment offers to load.
 */
const noOnlineEntertainmentCategorizedOffersToLoadState = atom<boolean>({
    key: "noOnlineEntertainmentCategorizedOffersToLoadState",
    default: false
});

/**
 * Atom used to keep track of whether there are any more online electronics offers to load.
 */
const noOnlineElectronicsCategorizedOffersToLoadState = atom<boolean>({
    key: "noOnlineElectronicsCategorizedOffersToLoadState",
    default: false
});

/**
 * Atom used to keep track of whether there are any more online home offers to load.
 */
const noOnlineHomeCategorizedOffersToLoadState = atom<boolean>({
    key: "noOnlineHomeCategorizedOffersToLoadState",
    default: false
});

/**
 * Atom used to keep track of whether there are any more online health and beauty offers to load.
 */
const noOnlineHealthAndBeautyCategorizedOffersToLoadState = atom<boolean>({
    key: "noOnlineHealthAndBeautyCategorizedOffersToLoadState",
    default: false
});

/**
 * Atom used to keep track of whether there are any more online office and business offers to load.
 */
const noOnlineOfficeAndBusinessCategorizedOffersToLoadState = atom<boolean>({
    key: "noOnlineOfficeAndBusinessCategorizedOffersToLoadState",
    default: false
});

/**
 * Atom used to keep track of whether there are any more online services and subscriptions offers to load.
 */
const noOnlineServicesAndSubscriptionsCategorizedOffersToLoadState = atom<boolean>({
    key: "noOnlineServicesAndSubscriptionsCategorizedOffersToLoadState",
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
 * Atom used to keep track of whether there are any more nearby food offers to load.
 */
const noNearbyFoodCategorizedOffersToLoadState = atom<boolean>({
    key: "noNearbyFoodCategorizedOffersToLoadState",
    default: false
});

/**
 * Atom used to keep track of whether there are any more nearby retail offers to load.
 */
const noNearbyRetailCategorizedOffersToLoadState = atom<boolean>({
    key: "noNearbyRetailCategorizedOffersToLoadState",
    default: false
});

/**
 * Atom used to keep track of whether there are any more nearby entertainment offers to load.
 */
const noNearbyEntertainmentCategorizedOffersToLoadState = atom<boolean>({
    key: "noNearbyEntertainmentCategorizedOffersToLoadState",
    default: false
});

/**
 * Atom used to keep track of whether there are any more nearby electronics offers to load.
 */
const noNearbyElectronicsCategorizedOffersToLoadState = atom<boolean>({
    key: "noNearbyElectronicsCategorizedOffersToLoadState",
    default: false
});

/**
 * Atom used to keep track of whether there are any more nearby home offers to load.
 */
const noNearbyHomeCategorizedOffersToLoadState = atom<boolean>({
    key: "noNearbyHomeCategorizedOffersToLoadState",
    default: false
});

/**
 * Atom used to keep track of whether there are any more nearby health and beauty offers to load.
 */
const noNearbyHealthAndBeautyCategorizedOffersToLoadState = atom<boolean>({
    key: "noNearbyHealthAndBeautyCategorizedOffersToLoadState",
    default: false
});

/**
 * Atom used to keep track of whether there are any more nearby office and business offers to load.
 */
const noNearbyOfficeAndBusinessCategorizedOffersToLoadState = atom<boolean>({
    key: "noNearbyOfficeAndBusinessCategorizedOffersToLoadState",
    default: false
});

/**
 * Atom used to keep track of whether there are any more nearby services and subscriptions offers to load.
 */
const noNearbyServicesAndSubscriptionsCategorizedOffersToLoadState = atom<boolean>({
    key: "noNearbyServicesAndSubscriptionsCategorizedOffersToLoadState",
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
const verticalSectionActiveState = atom<'fidelis' | 'online' | 'nearby' | 'click-only-online' | null>({
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
 * Atom used to keep track of the number of food offers that are within
 * 25 miles from the user.
 */

const numberOfFoodCategorizedOffersWithin25MilesState = atom<number>({
    key: "numberOfFoodCategorizedOffersWithin25MilesState",
    default: 0
});

/**
 * Atom used to keep track of the number of retail offers that are within
 * 25 miles from the user.
 */

const numberOfRetailCategorizedOffersWithin25MilesState = atom<number>({
    key: "numberOfRetailCategorizedOffersWithin25MilesState",
    default: 0
});

/**
 * Atom used to keep track of the number of entertainment offers that are within
 * 25 miles from the user.
 */

const numberOfEntertainmentCategorizedOffersWithin25MilesState = atom<number>({
    key: "numberOfEntertainmentCategorizedOffersWithin25MilesState",
    default: 0
});

/**
 * Atom used to keep track of the number of electronics offers that are within
 * 25 miles from the user.
 */

const numberOfElectronicsCategorizedOffersWithin25MilesState = atom<number>({
    key: "numberOfElectronicsCategorizedOffersWithin25MilesState",
    default: 0
});

/**
 * Atom used to keep track of the number of home offers that are within
 * 25 miles from the user.
 */

const numberOfHomeCategorizedOffersWithin25MilesState = atom<number>({
    key: "numberOfHomeCategorizedOffersWithin25MilesState",
    default: 0
});

/**
 * Atom used to keep track of the number of health and beauty offers that are within
 * 25 miles from the user.
 */

const numberOfHealthAndBeautyCategorizedOffersWithin25MilesState = atom<number>({
    key: "numberOfHealthAndBeautyCategorizedOffersWithin25MilesState",
    default: 0
});

/**
 * Atom used to keep track of the number of office and business offers that are within
 * 25 miles from the user.
 */

const numberOfOfficeAndBusinessCategorizedOffersWithin25MilesState = atom<number>({
    key: "numberOfOfficeAndBusinessCategorizedOffersWithin25MilesState",
    default: 0
});

/**
 * Atom used to keep track of the number of services and subscriptions offers that are within
 * 25 miles from the user.
 */

const numberOfServicesAndSubscriptionsCategorizedOffersWithin25MilesState = atom<number>({
    key: "numberOfServicesAndSubscriptionsCategorizedOffersWithin25MilesState",
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
 * Atom used to keep track of the number of click-only online offers.
 */
const numberOfClickOnlyOnlineOffersState = atom<number>({
    key: "numberOfClickOnlyOnlineOffersState",
    default: 0
});

/**
 * Atom used to keep track of the number of online veterans day offers.
 */
const numberOfVeteransDayCategorizedOnlineOffersState = atom<number>({
    key: "numberOfVeteransDayCategorizedOnlineOffersState",
    default: 0
});

/**
 * Atom used to keep track of the number of online food offers.
 */
const numberOfFoodCategorizedOnlineOffersState = atom<number>({
    key: "numberOfFoodCategorizedOnlineOffersState",
    default: 0
});

/**
 * Atom used to keep track of the number of online retail offers.
 */
const numberOfRetailCategorizedOnlineOffersState = atom<number>({
    key: "numberOfRetailCategorizedOnlineOffersState",
    default: 0
});

/**
 * Atom used to keep track of the number of online entertainment offers.
 */
const numberOfEntertainmentCategorizedOnlineOffersState = atom<number>({
    key: "numberOfEntertainmentCategorizedOnlineOffersState",
    default: 0
});

/**
 * Atom used to keep track of the number of online electronics offers.
 */
const numberOfElectronicsCategorizedOnlineOffersState = atom<number>({
    key: "numberOfElectronicsCategorizedOnlineOffersState",
    default: 0
});

/**
 * Atom used to keep track of the number of online home offers.
 */
const numberOfHomeCategorizedOnlineOffersState = atom<number>({
    key: "numberOfHomeCategorizedOnlineOffersState",
    default: 0
});

/**
 * Atom used to keep track of the number of online health and beauty offers.
 */
const numberOfHealthAndBeautyCategorizedOnlineOffersState = atom<number>({
    key: "numberOfHealthAndBeautyCategorizedOnlineOffersState",
    default: 0
});

/**
 * Atom used to keep track of the number of online office and business offers.
 */
const numberOfOfficeAndBusinessCategorizedOnlineOffersState = atom<number>({
    key: "numberOfOfficeAndBusinessCategorizedOnlineOffersState",
    default: 0
});

/**
 * Atom used to keep track of the number of online services and subscriptions offers.
 */
const numberOfServicesAndSubscriptionsCategorizedOnlineOffersState = atom<number>({
    key: "numberOfServicesAndSubscriptionsCategorizedOnlineOffersState",
    default: 0
});

/**
 * Atom used to keep track of the store navigation.
 */
const storeNavigationState = atom<NativeStackNavigationProp<any> | null>({
    key: "storeNavigationState",
    default: null
});

/**
 * Atom used to keep track of the current active kit, based on user input.
 */
const currentActiveKitState = atom<OfferCategory | null>({
    key: "currentActiveKitState",
    default: null
});

/**
 * Atom used to keep track of the online list kit expansion state.
 */
const onlineKitListIsExpandedState = atom<boolean>({
    key: "onlineKitListIsExpandedState",
    default: false
});

/**
 * Atom used to keep track of the nearby list kit expansion state.
 */
const nearbyKitListIsExpandedState = atom<boolean>({
    key: "nearbyKitListIsExpandedState",
    default: false
});

/**
 * Atom used to keep track of whether the full screen kit map
 * is active or not.
 */
const fullScreenKitMapActiveState = atom<boolean>({
    key: "fullScreenKitMapActiveState",
    default: false
});

/**
 * Atom used to keep track of whether there are any nearby offers available or not
 */
const noNearbyKitOffersAvailableState = atom<boolean>({
    key: "noNearbyKitOffersAvailableState",
    default: false
});

/**
 * Atom used to keep track of all Fidelis Partners loaded
 */
const fidelisPartnerListState = atom<FidelisPartner[]>({
    key: "fidelisPartnerListState",
    default: []
});

/**
 * Atom used to keep track of whether the Veterans Day kit was previously loaded
 */
const isVeteransDayKitLoadedState = atom<boolean>({
    key: "isVeteransDayKitLoadedState",
    default: false
});

/**
 * Atom used to keep track of whether the food kit was previously loaded
 */
const isFoodKitLoadedState = atom<boolean>({
    key: "isFoodKitLoadedState",
    default: false
});

/**
 * Atom used to keep track of whether the retail kit was previously loaded
 */
const isRetailKitLoadedState = atom<boolean>({
    key: "isRetailKitLoadedState",
    default: false
});

/**
 * Atom used to keep track of whether the entertainment kit was previously loaded
 */
const isEntertainmentKitLoadedState = atom<boolean>({
    key: "isEntertainmentKitLoadedState",
    default: false
});

/**
 * Atom used to keep track of whether the electronics kit was previously loaded
 */
const isElectronicsKitLoadedState = atom<boolean>({
    key: "isElectronicsKitLoadedState",
    default: false
});

/**
 * Atom used to keep track of whether the home kit was previously loaded
 */
const isHomeKitLoadedState = atom<boolean>({
    key: "isHomeKitLoadedState",
    default: false
});

/**
 * Atom used to keep track of whether the health and beauty kit was previously loaded
 */
const isHealthAndBeautyKitLoadedState = atom<boolean>({
    key: "isHealthAndBeautyKitLoadedState",
    default: false
});

/**
 * Atom used to keep track of whether the office and business kit was previously loaded
 */
const isOfficeAndBusinessKitLoadedState = atom<boolean>({
    key: "isOfficeAndBusinessKitLoadedState",
    default: false
});

/**
 * Atom used to keep track of whether the services and subscriptions kit was previously loaded
 */
const isServicesAndSubscriptionsKitLoadedState = atom<boolean>({
    key: "isServicesAndSubscriptionsKitLoadedState",
    default: false
});


/**
 * Export all atoms and/or selectors
 */
export {
    isVeteransDayKitLoadedState,
    isFoodKitLoadedState,
    isRetailKitLoadedState,
    isElectronicsKitLoadedState,
    isEntertainmentKitLoadedState,
    isHomeKitLoadedState,
    isHealthAndBeautyKitLoadedState,
    isOfficeAndBusinessKitLoadedState,
    isServicesAndSubscriptionsKitLoadedState,
    fidelisPartnerListState,
    onlineVeteransDayCategorizedOffersPageNumberState,
    noOnlineVeteransDayCategorizedOffersToLoadState,
    numberOfVeteransDayCategorizedOnlineOffersState,
    onlineVeteransDayCategorizedOfferListState,
    uniqueOnlineVeteransDayOffersListState,
    noNearbyKitOffersAvailableState,
    fullScreenKitMapActiveState,
    onlineKitListIsExpandedState,
    nearbyKitListIsExpandedState,
    currentActiveKitState,
    storeNavigationState,
    numberOfOnlineOffersState,
    numberOfFoodCategorizedOnlineOffersState,
    numberOfRetailCategorizedOnlineOffersState,
    numberOfEntertainmentCategorizedOnlineOffersState,
    numberOfElectronicsCategorizedOnlineOffersState,
    numberOfHomeCategorizedOnlineOffersState,
    numberOfHealthAndBeautyCategorizedOnlineOffersState,
    numberOfOfficeAndBusinessCategorizedOnlineOffersState,
    numberOfServicesAndSubscriptionsCategorizedOnlineOffersState,
    nearbyOffersListForFullScreenMapState,
    uniqueNearbyOffersListForFullScreenMapState,
    uniqueNearbyOffersListForMainHorizontalMapState,
    nearbyOffersListForMainHorizontalMapState,
    numberOfOffersWithin5MilesState,
    numberOfOffersWithin25MilesState,
    numberOfFoodCategorizedOffersWithin25MilesState,
    numberOfRetailCategorizedOffersWithin25MilesState,
    numberOfEntertainmentCategorizedOffersWithin25MilesState,
    numberOfElectronicsCategorizedOffersWithin25MilesState,
    numberOfHomeCategorizedOffersWithin25MilesState,
    numberOfHealthAndBeautyCategorizedOffersWithin25MilesState,
    numberOfOfficeAndBusinessCategorizedOffersWithin25MilesState,
    numberOfServicesAndSubscriptionsCategorizedOffersWithin25MilesState,
    filteredByDiscountPressedState,
    filtersActiveState,
    toggleViewPressedState,
    verticalSectionActiveState,
    searchQueryState,
    resetSearchState,
    nearbyOffersSpinnerShownState,
    reloadNearbyDueToPermissionsChangeState,
    locationServicesButtonState,
    premierNearbyOffersPageNumberState,
    premierOnlineOffersPageNumberState,
    offersNearUserLocationFlagState,
    noOnlineOffersToLoadState,
    noOnlineFoodCategorizedOffersToLoadState,
    noOnlineRetailCategorizedOffersToLoadState,
    noOnlineEntertainmentCategorizedOffersToLoadState,
    noOnlineElectronicsCategorizedOffersToLoadState,
    noOnlineHomeCategorizedOffersToLoadState,
    noOnlineHealthAndBeautyCategorizedOffersToLoadState,
    noOnlineOfficeAndBusinessCategorizedOffersToLoadState,
    noOnlineServicesAndSubscriptionsCategorizedOffersToLoadState,
    noNearbyOffersToLoadState,
    noNearbyFoodCategorizedOffersToLoadState,
    noNearbyRetailCategorizedOffersToLoadState,
    noNearbyEntertainmentCategorizedOffersToLoadState,
    noNearbyElectronicsCategorizedOffersToLoadState,
    noNearbyHomeCategorizedOffersToLoadState,
    noNearbyHealthAndBeautyCategorizedOffersToLoadState,
    noNearbyOfficeAndBusinessCategorizedOffersToLoadState,
    noNearbyServicesAndSubscriptionsCategorizedOffersToLoadState,
    onlineOffersListState,
    uniqueOnlineOffersListState,
    onlineFoodCategorizedOfferListState,
    uniqueOnlineFoodOffersListState,
    onlineRetailCategorizedOfferListState,
    uniqueOnlineRetailOffersListState,
    onlineEntertainmentCategorizedOfferListState,
    uniqueOnlineEntertainmentOffersListState,
    onlineElectronicsCategorizedOfferListState,
    uniqueOnlineElectronicsOffersListState,
    onlineHomeCategorizedOfferListState,
    uniqueOnlineHomeOffersListState,
    onlineHealthAndBeautyCategorizedOfferListState,
    uniqueOnlineHealthAndBeautyOffersListState,
    onlineOfficeAndBusinessCategorizedOfferListState,
    uniqueOnlineOfficeAndBusinessOffersListState,
    onlineServicesAndSubscriptionsCategorizedOfferListState,
    uniqueOnlineServicesAndSubscriptionsOffersListState,
    nearbyOffersListState,
    uniqueNearbyOffersListState,
    nearbyFoodCategorizedOffersListState,
    uniqueNearbyFoodOffersListState,
    nearbyRetailCategorizedOffersListState,
    uniqueNearbyRetailOffersListState,
    nearbyEntertainmentCategorizedOffersListState,
    uniqueNearbyEntertainmentOffersListState,
    nearbyElectronicsCategorizedOffersListState,
    uniqueNearbyElectronicsOffersListState,
    nearbyHomeCategorizedOffersListState,
    uniqueNearbyHomeOffersListState,
    nearbyHealthAndBeautyCategorizedOffersListState,
    uniqueNearbyHealthAndBeautyOffersListState,
    nearbyOfficeAndBusinessCategorizedOffersListState,
    uniqueNearbyOfficeAndBusinessOffersListState,
    nearbyServicesAndSubscriptionsCategorizedOffersListState,
    uniqueNearbyServicesAndSubscriptionsOffersListState,
    nearbyOffersPageNumberState,
    nearbyFoodCategorizedOffersPageNumberState,
    nearbyRetailCategorizedOffersPageNumberState,
    nearbyEntertainmentCategorizedOffersPageNumberState,
    nearbyElectronicsCategorizedOffersPageNumberState,
    nearbyHomeCategorizedOffersPageNumberState,
    nearbyHealthAndBeautyCategorizedOffersPageNumberState,
    nearbyOfficeAndBusinessCategorizedOffersPageNumberState,
    nearbyServicesAndSubscriptionsCategorizedOffersPageNumberState,
    onlineOffersPageNumberState,
    onlineFoodCategorizedOffersPageNumberState,
    onlineRetailCategorizedOffersPageNumberState,
    onlineEntertainmentCategorizedOffersPageNumberState,
    onlineElectronicsCategorizedOffersPageNumberState,
    onlineHomeCategorizedOffersPageNumberState,
    onlineHealthAndBeautyCategorizedOffersPageNumberState,
    onlineOfficeAndBusinessCategorizedOffersPageNumberState,
    onlineServicesAndSubscriptionsCategorizedOffersPageNumberState,
    storeOfferState,
    storeOfferPhysicalLocationState,
    clickOnlyOnlineOffersListState,
    uniqueClickOnlyOnlineOffersListState,
    clickOnlyOnlineOffersPageNumberState,
    premierClickOnlyOnlineOffersPageNumberState,
    noClickOnlyOnlineOffersToLoadState,
    numberOfClickOnlyOnlineOffersState
};
