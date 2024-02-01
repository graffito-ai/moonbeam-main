import React, {useEffect, useRef, useState} from 'react';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {StoreProps} from "../../../../../models/props/MarketplaceProps";
import {Spinner} from '../../../../common/Spinner';
import {Image, Linking, Platform, ScrollView, TouchableOpacity, View} from "react-native";
import {commonStyles} from "../../../../../styles/common.module";
import {Button, Dialog, Portal, Text} from 'react-native-paper';
import {styles} from '../../../../../styles/store.module';
import {Button as ModalButton} from '@rneui/base';
import * as Location from "expo-location";
import {LocationObject} from "expo-location";
import {
    CountryCode,
    FidelisPartner,
    getFidelisPartners,
    getOffers, LoggingLevel,
    Offer,
    OfferAvailability,
    OfferFilter,
    OfferState,
    RedemptionType
} from "@moonbeam/moonbeam-models";
import {API, graphqlOperation} from "aws-amplify";
import {
    currentUserInformation,
    marketplaceAmplifyCacheState,
    userIsAuthenticatedState
} from "../../../../../recoil/AuthAtom";
import {useRecoilState} from "recoil";
// @ts-ignore
import MoonbeamOffersLoading from '../../../../../../assets/art/moonbeam-offers-loading.png';
// @ts-ignore
import MoonbeamLocationServices from "../../../../../../assets/art/moonbeam-location-services-1.png";
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';
// @ts-ignore
import MoonbeamPreferencesIOS from "../../../../../../assets/art/moonbeam-preferences-ios.jpg";
// @ts-ignore
import MoonbeamPreferencesAndroid from "../../../../../../assets/art/moonbeam-preferences-android.jpg";
import {VerticalOffers} from "./storeComponents/VerticalOffers";
import {FidelisSection} from "./storeComponents/FidelisSection";
import {NearbySection} from "./storeComponents/NearbySection";
import {OnlineSection} from "./storeComponents/OnlineSection";
import {SearchSection} from "./storeComponents/SearchSection";
import {
    clickOnlyOnlineOffersListState,
    clickOnlyOnlineOffersPageNumberState,
    fidelisPartnerListState,
    locationServicesButtonState,
    nearbyOffersListState,
    nearbyOffersPageNumberState,
    nearbyOffersSpinnerShownState,
    noClickOnlyOnlineOffersToLoadState, noFilteredOffersToLoadState,
    noNearbyOffersToLoadState,
    noOnlineOffersToLoadState,
    offersNearUserLocationFlagState,
    onlineOffersListState,
    onlineOffersPageNumberState,
    reloadNearbyDueToPermissionsChangeState,
    showClickOnlyBottomSheetState,
    storeNavigationState,
    toggleViewPressedState, verticalSectionActiveState
} from "../../../../../recoil/StoreOfferAtom";
import {currentUserLocationState} from "../../../../../recoil/RootAtom";
import {KitsSection} from "./storeComponents/KitsSection";
import {FullScreenMap} from "./storeComponents/FullScreenMap";
import {ClickOnlyOnlineSection} from "./storeComponents/ClickOnlyOnlineSection";
import BottomSheet from "@gorhom/bottom-sheet";
import {bottomTabShownState} from "../../../../../recoil/HomeAtom";
import {ClickOnlyOffersBottomSheet} from "./storeComponents/ClickOnlyOffersBottomSheet";
import {logEvent} from "../../../../../utils/AppSync";

/**
 * Store component.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const Store = ({navigation}: StoreProps) => {
    // constants used to keep track of local component state
    const [permissionsModalVisible, setPermissionsModalVisible] = useState<boolean>(false);
    const [permissionsModalCustomMessage, setPermissionsModalCustomMessage] = useState<string>("");
    const [permissionsInstructionsCustomMessage, setPermissionsInstructionsCustomMessage] = useState<string>("");
    const [areNearbyOffersReady, setAreNearbyOffersReady] = useState<boolean>(false);
    const [isReady, setIsReady] = useState<boolean>(false);
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    // constants used to keep track of shared states
    const [noFilteredOffersToLoad, ] = useRecoilState(noFilteredOffersToLoadState);
    const [whichVerticalSectionActive, ] = useRecoilState(verticalSectionActiveState);
    const [userIsAuthenticated, ] = useRecoilState(userIsAuthenticatedState);
    const [fidelisPartnerList, setFidelisPartnerList] = useRecoilState(fidelisPartnerListState);
    const [, setStoreNavigationState] = useRecoilState(storeNavigationState);
    const [currentUserLocation, setCurrentUserLocation] = useRecoilState(currentUserLocationState);
    const [toggleViewPressed,] = useRecoilState(toggleViewPressedState);
    const [, setNearbyOffersSpinnerShown] = useRecoilState(nearbyOffersSpinnerShownState);
    const [, setReloadNearbyDueToPermissionsChange] = useRecoilState(reloadNearbyDueToPermissionsChangeState);
    const [locationServicesButton, setLocationServicesButton] = useRecoilState(locationServicesButtonState);
    const [nearbyOfferList, setNearbyOfferList] = useRecoilState(nearbyOffersListState);
    const [onlineOfferList, setOnlineOfferList] = useRecoilState(onlineOffersListState);
    const [clickOnlyOnlineOfferList, setClickOnlyOnlineOfferList] = useRecoilState(clickOnlyOnlineOffersListState);
    const [marketplaceCache,] = useRecoilState(marketplaceAmplifyCacheState);
    const [userInformation,] = useRecoilState(currentUserInformation);
    const [nearbyOffersPageNumber, setNearbyOffersPageNumber] = useRecoilState(nearbyOffersPageNumberState);
    const [onlineOffersPageNumber, setOnlineOffersPageNumber] = useRecoilState(onlineOffersPageNumberState);
    const [, setNoOnlineOffersToLoad] = useRecoilState(noOnlineOffersToLoadState);
    const [clickOnlyOnlineOffersPageNumber, setClickOnlyOnlineOffersPageNumber] = useRecoilState(clickOnlyOnlineOffersPageNumberState);
    const [, setNoClickOnlyOnlineOffersToLoad] = useRecoilState(noClickOnlyOnlineOffersToLoadState);
    const [, setNoNearbyOffersToLoad] = useRecoilState(noNearbyOffersToLoadState);
    const [offersNearUserLocationFlag, setOffersNearUserLocationFlag] = useRecoilState(offersNearUserLocationFlagState);
    const [showClickOnlyBottomSheet, setShowClickOnlyBottomSheet] = useRecoilState(showClickOnlyBottomSheetState);
    const bottomSheetRef = useRef(null);
    const [, setBottomTabShown] = useRecoilState(bottomTabShownState);

    /**
     * Function used to retrieve the list of preferred (Fidelis) partners
     * and their offers, that we will display in the first category of the
     * marketplace.
     *
     * @returns a {@link Promise} of {@link void} since this function will set the
     * React state of the preferred partners.
     */
    const retrieveFidelisPartnerList = async (): Promise<void> => {
        // at most call this twice if failing (because this sometimes freezes up the marketplace)
        let retryCount = 2;
        while (retryCount > 0) {
            try {
                // call the getFidelisPartners API
                const fidelisPartnersResult = await API.graphql(graphqlOperation(getFidelisPartners));

                // retrieve the data block from the response
                // @ts-ignore
                const responseData = fidelisPartnersResult ? fidelisPartnersResult.data : null;

                // check if there are any errors in the returned response
                if (responseData !== null && responseData.getFidelisPartners.errorMessage === null) {
                    // retrieve the array of Fidelis partners from the API call
                    const fidelisPartners: FidelisPartner[] =
                        (responseData.getFidelisPartners !== undefined &&
                            responseData.getFidelisPartners !== null &&
                            responseData.getFidelisPartners.data !== undefined &&
                            responseData.getFidelisPartners.data !== null) ?
                            responseData.getFidelisPartners.data : [];

                    // ensure that there is at least one featured partner in the list
                    if (fidelisPartners !== undefined && fidelisPartners !== null && fidelisPartners.length > 0) {
                        // const fidelisPartnersSorted = fidelisPartners.sort(dynamicSort("brandName"));
                        setFidelisPartnerList(fidelisPartners);

                        // set the cache appropriately
                        marketplaceCache && marketplaceCache!.setItem(`${userInformation["custom:userId"]}-fidelisPartners`, fidelisPartners);

                        retryCount = 0;
                    } else {
                        retryCount -=1;
                        const message = `No Fidelis partners to display ${JSON.stringify(fidelisPartnersResult)}`;
                        console.log(message);
                        await logEvent(message, LoggingLevel.Warning, userIsAuthenticated);
                    }
                } else {
                    retryCount -=1;
                    const message = `Unexpected error while retrieving Fidelis partner offers ${JSON.stringify(fidelisPartnersResult)}`;
                    console.log(message);
                    await logEvent(message, LoggingLevel.Error, userIsAuthenticated);
                }
            } catch (error) {
                retryCount -=1;
                const message = `Unexpected error while attempting to retrieve the Fidelis partner offers ${JSON.stringify(error)} ${error}`;
                console.log(message);
                await logEvent(message, LoggingLevel.Error, userIsAuthenticated);
            }
        }
    }

    /**
     * Function used to retrieve the list of click-only online offers, that we will
     * display in the third category of the marketplace.
     *
     * @returns a {@link Promise} of {@link void} since this function will set the
     * React state of the click-only online offers.
     */
    const retrieveClickOnlyOnlineOffersList = async (): Promise<void> => {
        try {
            // call the getOffers API
            const clickOnlyOnlineOffersResult = await API.graphql(graphqlOperation(getOffers, {
                getOffersInput: {
                    availability: OfferAvailability.Global,
                    countryCode: CountryCode.Us,
                    filterType: OfferFilter.Online,
                    offerStates: [OfferState.Active, OfferState.Scheduled],
                    pageNumber: clickOnlyOnlineOffersPageNumber,
                    pageSize: 15, // load 15 offers
                    redemptionType: RedemptionType.Click
                }
            }));

            // retrieve the data block from the response
            // @ts-ignore
            const responseData = clickOnlyOnlineOffersResult ? clickOnlyOnlineOffersResult.data : null;

            // check if there are any errors in the returned response
            if (responseData && responseData.getOffers.errorMessage === null) {
                // retrieve the array of click-only online offers from the API call
                const clickOnlyOnlineOffers: Offer[] = responseData.getOffers.data.offers;

                // ensure that there is at least one click-only online offer in the list
                if (clickOnlyOnlineOffers !== undefined && clickOnlyOnlineOffers !== null && clickOnlyOnlineOffers.length > 0) {
                    // increase the page number
                    setClickOnlyOnlineOffersPageNumber(clickOnlyOnlineOffersPageNumber + 1);

                    // push any old offers into the list to return
                    setClickOnlyOnlineOfferList(oldClickOnlyOnlineOfferList => {
                        return [...oldClickOnlyOnlineOfferList, ...clickOnlyOnlineOffers];
                    });
                } else {
                    const message = `No click-only online offers to display ${JSON.stringify(clickOnlyOnlineOffersResult)}`;
                    console.log(message);
                    await logEvent(message, LoggingLevel.Warning, userIsAuthenticated);

                    /**
                     * if there are no more click-only online offers to load, then this is not an error,
                     * otherwise display an error.
                     */
                    if (clickOnlyOnlineOfferList !== undefined && clickOnlyOnlineOfferList !== null && clickOnlyOnlineOfferList.length === 0) {
                        // setModalVisible(true);
                    } else {
                        // set the click-only online offers to load flag
                        setNoClickOnlyOnlineOffersToLoad(true);
                    }
                }
            } else {
                const message = `Unexpected error while retrieving click-only online offers ${JSON.stringify(clickOnlyOnlineOffersResult)}`;
                console.log(message);
                await logEvent(message, LoggingLevel.Warning, userIsAuthenticated);
                // setModalVisible(true);
            }
        } catch (error) {
            const message = `Unexpected error while attempting to retrieve click-only online offers ${JSON.stringify(error)} ${error}`;
            console.log(message);
            await logEvent(message, LoggingLevel.Warning, userIsAuthenticated);
            // setModalVisible(true);
        }
    }

    /**
     * Function used to retrieve the list of online offers, that we will
     * display in the third category of the marketplace.
     *
     * @returns a {@link Promise} of {@link void} since this function will set the
     * React state of the online offers.
     */
    const retrieveOnlineOffersList = async (): Promise<void> => {
        try {
            // call the getOffers API
            const onlineOffersResult = await API.graphql(graphqlOperation(getOffers, {
                getOffersInput: {
                    availability: OfferAvailability.Global,
                    countryCode: CountryCode.Us,
                    filterType: OfferFilter.Online,
                    offerStates: [OfferState.Active, OfferState.Scheduled],
                    pageNumber: onlineOffersPageNumber,
                    pageSize: 15, // load 15 offers
                    redemptionType: RedemptionType.Cardlinked
                }
            }));

            // retrieve the data block from the response
            // @ts-ignore
            const responseData = onlineOffersResult ? onlineOffersResult.data : null;

            // check if there are any errors in the returned response
            if (responseData && responseData.getOffers.errorMessage === null) {
                // retrieve the array of online offers from the API call
                const onlineOffers: Offer[] = responseData.getOffers.data.offers;

                // ensure that there is at least one online offer in the list
                if (onlineOffers !== undefined && onlineOffers !== null && onlineOffers.length > 0) {
                    // increase the page number
                    setOnlineOffersPageNumber(onlineOffersPageNumber + 1);

                    // push any old offers into the list to return
                    setOnlineOfferList(oldOnlineOfferList => {
                        return [...oldOnlineOfferList, ...onlineOffers];
                    });
                } else {
                    const message = `No online offers to display ${JSON.stringify(onlineOffersResult)}`;
                    console.log(message);
                    await logEvent(message, LoggingLevel.Info, userIsAuthenticated);
                    /**
                     * if there are no more online offers to load, then this is not an error,
                     * otherwise display an error.
                     */
                    if (onlineOfferList !== undefined && onlineOfferList !== null && onlineOfferList.length === 0) {
                        // setModalVisible(true);
                    } else {
                        // set the online offers to load flag
                        setNoOnlineOffersToLoad(true);
                    }
                }
            } else {
                const message = `Unexpected error while retrieving online offers ${JSON.stringify(onlineOffersResult)}`;
                console.log(message);
                await logEvent(message, LoggingLevel.Error, userIsAuthenticated);
                // setModalVisible(true);
            }
        } catch (error) {
            const message = `Unexpected error while attempting to retrieve online offers ${JSON.stringify(error)} ${error}`;
            console.log(message);
            await logEvent(message, LoggingLevel.Error, userIsAuthenticated);
            // setModalVisible(true);
        }
    }

    /**
     * Function used to retrieve the list of offers near the user's home location, that we will
     * display in the second category of the marketplace (to be used as a fallback to the nearby
     * offers).
     *
     * @returns a {@link Promise} of {@link void} since this function will set the
     * React state of the offers near the user's home location.
     */
    const retrieveOffersNearLocation = async (address: string): Promise<void> => {
        try {
            // check to see if we already have these offers cached, for the first page, if we do retrieve them from cache instead
            if (onlineOffersPageNumber === 1 && marketplaceCache && await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-offerNearUserHome`) !== null) {
                const message = 'offers near user home are cached';
                console.log(message);
                await logEvent(message, LoggingLevel.Info, userIsAuthenticated);

                setNearbyOfferList(await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-offerNearUserHome`));
                // we want to increase the page number of offers near user home, since we already have the first page obtained from cache
                setNearbyOffersPageNumber(nearbyOffersPageNumber + 1);

                // set the nearby user location flag
                setOffersNearUserLocationFlag(true);

                /**
                 * get the first location point in the array of geolocation returned (based on the user's address since
                 * that was what we used when we cached these offers)
                 */
                const geoLocationArray = await Location.geocodeAsync(userInformation["address"]["formatted"]);
                const geoLocation = geoLocationArray && geoLocationArray.length !== 0 ? geoLocationArray[0] : null;
                if (!geoLocation) {
                    const message = `Unable to retrieve user's home location's geolocation ${address}`;
                    console.log(message);
                    await logEvent(message, LoggingLevel.Error, userIsAuthenticated);

                    setAreNearbyOffersReady(true);
                    setNearbyOffersSpinnerShown(false);
                } else {
                    setAreNearbyOffersReady(true);
                    setNearbyOffersSpinnerShown(false);
                }
            } else {
                const message = 'offers near user home are not cached, or page number is not 1';
                console.log(message);
                await logEvent(message, LoggingLevel.Info, userIsAuthenticated);

                // first retrieve the necessary geolocation information based on the user's home address
                const geoLocationArray = await Location.geocodeAsync(address);
                /**
                 * get the first location point in the array of geolocation returned
                 */
                const geoLocation = geoLocationArray && geoLocationArray.length !== 0 ? geoLocationArray[0] : null;
                if (!geoLocation) {
                    const message = `Unable to retrieve user's home location's geolocation ${address}`;
                    console.log(message);
                    await logEvent(message, LoggingLevel.Error, userIsAuthenticated);

                    setAreNearbyOffersReady(true);
                    setNearbyOffersSpinnerShown(false);
                } else {
                    // call the getOffers API
                    const nearbyOffersResult = await API.graphql(graphqlOperation(getOffers, {
                        getOffersInput: {
                            availability: OfferAvailability.Global,
                            countryCode: CountryCode.Us,
                            filterType: OfferFilter.Nearby,
                            offerStates: [OfferState.Active, OfferState.Scheduled],
                            pageNumber: nearbyOffersPageNumber,
                            pageSize: 15, // load 5 offers
                            radiusIncludeOnlineStores: false, // do not include online offers in nearby offers list
                            radius: 50000, // radius of 50 km (50,000 meters) roughly equal to 25 miles
                            radiusLatitude: geoLocation.latitude,
                            radiusLongitude: geoLocation.longitude,
                            redemptionType: RedemptionType.Cardlinked
                        }
                    }));

                    // retrieve the data block from the response
                    // @ts-ignore
                    const responseData = nearbyOffersResult ? nearbyOffersResult.data : null;

                    // check if there are any errors in the returned response
                    if (responseData && responseData.getOffers.errorMessage === null) {
                        // retrieve the array of nearby offers from the API call
                        const nearbyOffers: Offer[] = responseData.getOffers.data.offers;

                        // ensure that there is at least one nearby offer in the list
                        if (nearbyOffers !== undefined && nearbyOffers !== null && nearbyOffers.length > 0) {
                            // if the page number is 1, then cache the first page of offers near user home
                            nearbyOffersPageNumber === 1 && marketplaceCache && marketplaceCache!.setItem(`${userInformation["custom:userId"]}-offerNearUserHome`, nearbyOffers);

                            // increase page number
                            setNearbyOffersPageNumber(nearbyOffersPageNumber + 1);

                            // push any old offers into the list to return
                            setNearbyOfferList(oldNearbyOfferList => {
                                return [...oldNearbyOfferList, ...nearbyOffers];
                            });

                            // set the nearby user location flag
                            setOffersNearUserLocationFlag(true);

                            setAreNearbyOffersReady(true);
                            setNearbyOffersSpinnerShown(false);
                        } else {
                            const message = `No offers near user's home location to display ${JSON.stringify(nearbyOffersResult)}`;
                            console.log(message);
                            await logEvent(message, LoggingLevel.Info, userIsAuthenticated);

                            setAreNearbyOffersReady(true);
                            setNearbyOffersSpinnerShown(false);
                            /**
                             * if there are no more nearby offers to load, then this is not an error,
                             * otherwise display an error.
                             */
                            if (nearbyOfferList !== undefined && nearbyOfferList !== null && nearbyOfferList.length === 0) {
                                // setModalVisible(true);
                            } else {
                                setNearbyOffersSpinnerShown(false);
                                // set the no nearby offers to load flag
                                setNoNearbyOffersToLoad(true);
                            }
                        }
                    } else {
                        const message = `Unexpected error while retrieving offers near user's home location ${JSON.stringify(nearbyOffersResult)}`;
                        console.log(message);
                        await logEvent(message, LoggingLevel.Error, userIsAuthenticated);

                        // setModalVisible(true);
                        setAreNearbyOffersReady(true);
                        setNearbyOffersSpinnerShown(false);
                    }
                }
            }

        } catch (error) {
            const message = `Unexpected error while attempting to retrieve offers near user's home location ${JSON.stringify(error)} ${error}`;
            console.log(message);
            await logEvent(message, LoggingLevel.Error, userIsAuthenticated);

            // setModalVisible(true);
            setAreNearbyOffersReady(true);
            setNearbyOffersSpinnerShown(false);
        }
    }

    /**
     * Function used to retrieve the list of offers nearby, that we will
     * display in the second category of the marketplace.
     *
     * @returns a {@link Promise} of {@link void} since this function will set the
     * React state of the nearby offers.
     */
    const retrieveNearbyOffersList = async (): Promise<void> => {
        try {
            setAreNearbyOffersReady(false);
            setNearbyOffersSpinnerShown(true);

            // first retrieve the necessary permissions for location purposes
            const foregroundPermissionStatus = await Location.requestForegroundPermissionsAsync();
            if (foregroundPermissionStatus.status !== 'granted') {
                const errorMessage = `Permission to access location was not granted!`;
                console.log(errorMessage);
                await logEvent(errorMessage, LoggingLevel.Warning, userIsAuthenticated);
                setLocationServicesButton(true);
            } else {
                if (currentUserLocation === null) {
                    const lastKnownPositionAsync: LocationObject | null = await Location.getLastKnownPositionAsync();
                    setCurrentUserLocation(lastKnownPositionAsync !== null ? lastKnownPositionAsync : await Location.getCurrentPositionAsync());
                }

                // first retrieve the latitude and longitude of the current user
                if (currentUserLocation !== null && currentUserLocation.coords && currentUserLocation.coords.latitude && currentUserLocation.coords.longitude) {
                    // call the getOffers API
                    const nearbyOffersResult = await API.graphql(graphqlOperation(getOffers, {
                        getOffersInput: {
                            availability: OfferAvailability.Global,
                            countryCode: CountryCode.Us,
                            filterType: OfferFilter.Nearby,
                            offerStates: [OfferState.Active, OfferState.Scheduled],
                            pageNumber: nearbyOffersPageNumber,
                            pageSize: 15, // load 5 offers
                            radiusIncludeOnlineStores: false, // do not include online offers in nearby offers list
                            radius: 50000, // radius of 50 km (50,000 meters) roughly equal to 25 miles
                            radiusLatitude: currentUserLocation.coords.latitude,
                            radiusLongitude: currentUserLocation.coords.longitude,
                            redemptionType: RedemptionType.Cardlinked
                        }
                    }));

                    // retrieve the data block from the response
                    // @ts-ignore
                    const responseData = nearbyOffersResult ? nearbyOffersResult.data : null;

                    // check if there are any errors in the returned response
                    if (responseData && responseData.getOffers.errorMessage === null) {
                        // retrieve the array of nearby offers from the API call
                        const nearbyOffers: Offer[] = responseData.getOffers.data.offers;

                        // ensure that there is at least one nearby offer in the list
                        if (nearbyOffers !== undefined && nearbyOffers !== null && nearbyOffers.length > 0) {
                            // increase page number
                            setNearbyOffersPageNumber(nearbyOffersPageNumber + 1);

                            // push any old offers into the list to return
                            setNearbyOfferList(nearbyOfferList.concat(nearbyOffers));

                            setAreNearbyOffersReady(true);
                            setNearbyOffersSpinnerShown(false);
                        } else {
                            const errorMessage = `No nearby offers to display ${JSON.stringify(nearbyOffersResult)}`;
                            console.log(errorMessage);
                            await logEvent(errorMessage, LoggingLevel.Info, userIsAuthenticated);
                            /**
                             * if there are no more nearby offers to load, then do not fall back
                             * otherwise fall back to the offers near users' home address.
                             */
                            if ((nearbyOfferList !== undefined && nearbyOfferList !== null && nearbyOfferList.length === 0) || offersNearUserLocationFlag) {
                                userInformation["address"] && userInformation["address"]["formatted"] && await retrieveOffersNearLocation(userInformation["address"]["formatted"]);
                            } else {
                                setNearbyOffersSpinnerShown(false);
                                // set the no nearby offers to load flag
                                setNoNearbyOffersToLoad(true);
                            }
                        }
                    } else {
                        const errorMessage = `Unexpected error while retrieving nearby offers ${nearbyOffersResult}`;
                        console.log(errorMessage);
                        await logEvent(errorMessage, LoggingLevel.Error, userIsAuthenticated);

                        // setModalVisible(true);
                        setAreNearbyOffersReady(true);
                        setNearbyOffersSpinnerShown(false);
                    }
                } else {
                    const errorMessage = `Unable to retrieve the current user's location coordinates!`;
                    console.log(errorMessage);
                    await logEvent(errorMessage, LoggingLevel.Warning, userIsAuthenticated);

                    // setModalVisible(true);
                    setAreNearbyOffersReady(true);
                    setNearbyOffersSpinnerShown(false);
                }
            }
        } catch (error) {
            const errorMessage = `Unexpected error while attempting to retrieve nearby offers ${JSON.stringify(error)} ${error}`;
            console.log(errorMessage);
            await logEvent(errorMessage, LoggingLevel.Error, userIsAuthenticated);

            // @ts-ignore
            if (!error.code && (error.code !== 'ERR_LOCATION_INFO_PLIST' || error.code !== 'E_LOCATION_UNAVAILABLE')) {
                setModalVisible(true);
                setAreNearbyOffersReady(true);
                setNearbyOffersSpinnerShown(false);
            } else {
                // fallback to offers near their home address
                userInformation["address"] && userInformation["address"]["formatted"] && await retrieveOffersNearLocation(userInformation["address"]["formatted"]);
            }
        }
    }

    /**
     * Function used to return the contents of the store (vertical, horizontal), memoized.
     *
     * @param withoutMapRender in case of Android the map feature for when the bottom sheet shows
     * up does not load properly, therefore we will not render it.
     *
     * @returns a {@link JSX.Element[]} representing the store contents to display
     */
    const retrieveStoreContents = (withoutMapRender: boolean): JSX.Element[] => {
        const storeComponents: JSX.Element[] = [];
        storeComponents.push(
            <>
                {
                    toggleViewPressed === 'horizontal' ?
                        <ScrollView
                            scrollEnabled={true}
                            horizontal={false}
                            persistentScrollbar={false}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps={'handled'}
                            showsHorizontalScrollIndicator={false}
                        >
                            <>
                                <View style={styles.horizontalScrollView}>
                                    <ClickOnlyOnlineSection
                                        retrieveClickOnlineOffersList={retrieveClickOnlyOnlineOffersList}
                                    />
                                    <KitsSection
                                        navigation={navigation}
                                    />
                                    <FidelisSection
                                        navigation={navigation}
                                        areNearbyOffersReady={areNearbyOffersReady}
                                    />
                                    {
                                        !withoutMapRender &&
                                        <NearbySection
                                            navigation={navigation}
                                            offersNearUserLocationFlag={offersNearUserLocationFlag}
                                            retrieveNearbyOffersList={retrieveNearbyOffersList}
                                            retrieveOffersNearLocation={retrieveOffersNearLocation}
                                            areNearbyOffersReady={areNearbyOffersReady}
                                            setPermissionsInstructionsCustomMessage={setPermissionsInstructionsCustomMessage}
                                            setPermissionsModalCustomMessage={setPermissionsModalCustomMessage}
                                            setPermissionsModalVisible={setPermissionsModalVisible}
                                        />
                                    }
                                    <OnlineSection
                                        navigation={navigation}
                                        retrieveOnlineOffersList={retrieveOnlineOffersList}
                                        areNearbyOffersReady={areNearbyOffersReady}
                                        locationServicesButton={locationServicesButton}
                                    />
                                </View>
                            </>
                        </ScrollView> :
                        toggleViewPressed === 'vertical'
                            ?
                            <Portal.Host>
                                <VerticalOffers
                                    navigation={navigation}
                                    fidelisPartnerList={fidelisPartnerList}
                                    retrieveOnlineOffersList={retrieveOnlineOffersList}
                                    retrieveClickOnlineOffersList={retrieveClickOnlyOnlineOffersList}
                                    offersNearUserLocationFlag={offersNearUserLocationFlag}
                                    retrieveNearbyOffersList={retrieveNearbyOffersList}
                                    retrieveOffersNearLocation={retrieveOffersNearLocation}
                                />
                            </Portal.Host>
                            :
                            <Portal.Host>
                                {
                                    !withoutMapRender &&
                                    <FullScreenMap
                                        navigation={navigation}
                                    />
                                }
                            </Portal.Host>
                }
            </>
        );
        return storeComponents;
    }

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // manipulate the bottom sheet
        if (!showClickOnlyBottomSheet && bottomSheetRef) {
            // @ts-ignore
            bottomSheetRef.current?.close?.();
            // show the bottom tab
            setBottomTabShown(true);
        }
        if (showClickOnlyBottomSheet && bottomSheetRef) {
            // hide the bottom tab
            setBottomTabShown(false);

            // @ts-ignore
            bottomSheetRef.current?.expand?.();
        }

        setStoreNavigationState(navigation);
        // load the Fidelis partners with their offers
        const loadFidelisData = async (): Promise<void> => {
            // check to see if we have cached Fidelis Partners. If we do, we don't need to retrieve them again for a week.
            if (marketplaceCache && await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-fidelisPartners`) !== null) {
                const errorMessage = 'Fidelis Partners are cached';
                console.log(errorMessage);
                await logEvent(errorMessage, LoggingLevel.Info, userIsAuthenticated);

                setFidelisPartnerList(await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-fidelisPartners`));
            } else {
                const errorMessage = 'Fidelis Partners are not cached';
                console.log(errorMessage);
                await logEvent(errorMessage, LoggingLevel.Info, userIsAuthenticated);
                await retrieveFidelisPartnerList();
            }
        }

        // load the Fidelis partners if their list is empty
        fidelisPartnerList !== undefined && fidelisPartnerList !== null && fidelisPartnerList.length === 0 && loadFidelisData().then(_ => {
        });

        // make sure to stop loading the store when we have at least 1 Fidelis partners, online offers and click-only offers
        if (fidelisPartnerList !== undefined && fidelisPartnerList !== null && fidelisPartnerList.length !== 0 && onlineOfferList !== undefined &&
            onlineOfferList !== null && onlineOfferList.length !== 0 && clickOnlyOnlineOfferList !== undefined && clickOnlyOnlineOfferList !== null && clickOnlyOnlineOfferList.length !== 0) {
            // release the loader on button press
            !isReady && setIsReady(true);
        }
    }, [fidelisPartnerList, onlineOfferList, clickOnlyOnlineOfferList, marketplaceCache,
        showClickOnlyBottomSheet, bottomSheetRef, navigation.getState()]);

    // return the component for the Store page
    return (
        <>
            {
                !isReady ?
                    <Spinner loadingSpinnerShown={loadingSpinnerShown}
                             setLoadingSpinnerShown={setLoadingSpinnerShown}/>
                    :
                    <>
                        <Portal>
                            <Dialog style={commonStyles.permissionsDialogStyle} visible={permissionsModalVisible}
                                    onDismiss={() => setPermissionsModalVisible(false)}>
                                <Dialog.Title
                                    style={commonStyles.dialogTitle}>{'Permissions not granted!'}</Dialog.Title>
                                <Dialog.Content>
                                    <Text
                                        style={commonStyles.dialogParagraph}>{permissionsModalCustomMessage}</Text>
                                </Dialog.Content>
                                <Image source={
                                    Platform.OS === 'ios'
                                        ? MoonbeamPreferencesIOS
                                        : MoonbeamPreferencesAndroid
                                }
                                       style={commonStyles.permissionsDialogImage}/>
                                <Dialog.Content>
                                    <Text
                                        style={commonStyles.dialogParagraphInstructions}>{permissionsInstructionsCustomMessage}</Text>
                                </Dialog.Content>
                                <Dialog.Actions style={{alignSelf: 'center', flexDirection: 'column'}}>
                                    <ModalButton buttonStyle={commonStyles.dialogButton}
                                                 titleStyle={commonStyles.dialogButtonText}
                                                 onPress={async () => {
                                                     // go to the appropriate settings page depending on the OS
                                                     if (Platform.OS === 'ios') {
                                                         await Linking.openURL("app-settings:");
                                                     } else {
                                                         await Linking.openSettings();
                                                     }
                                                     setPermissionsModalVisible(false);
                                                     // force reload whole application
                                                     const foregroundPermissionStatus = await Location.requestForegroundPermissionsAsync();
                                                     if (foregroundPermissionStatus.status === 'granted') {
                                                         setLocationServicesButton(false);
                                                         setReloadNearbyDueToPermissionsChange(true);
                                                         setNearbyOffersSpinnerShown(true);
                                                     }
                                                 }}>
                                        {"Go to App Settings"}
                                    </ModalButton>
                                    <ModalButton buttonStyle={commonStyles.dialogButtonSkip}
                                                 titleStyle={commonStyles.dialogButtonSkipText}
                                                 onPress={async () => {
                                                     setPermissionsModalVisible(false);
                                                 }}>
                                        {"Skip"}
                                    </ModalButton>
                                </Dialog.Actions>
                            </Dialog>
                        </Portal>
                        <Portal>
                            <Dialog style={commonStyles.dialogStyle} visible={modalVisible}
                                    onDismiss={() => setModalVisible(false)}>
                                <Dialog.Icon icon="alert" color={"#F2FF5D"}
                                             size={hp(10)}/>
                                <Dialog.Title
                                    style={commonStyles.dialogTitle}>{'Marketplace Crashing'}</Dialog.Title>
                                <Dialog.Content>
                                    <Text
                                        style={commonStyles.dialogParagraph}>{'Unexpected error while loading offers for marketplace!'}</Text>
                                </Dialog.Content>
                                <Dialog.Actions>
                                    <Button style={commonStyles.dialogButton}
                                            labelStyle={commonStyles.dialogButtonText}
                                            onPress={() => {
                                                setModalVisible(false);
                                            }}>
                                        {'Try Again'}
                                    </Button>
                                </Dialog.Actions>
                            </Dialog>
                        </Portal>
                        <KeyboardAwareScrollView
                            scrollEnabled={false}
                            showsVerticalScrollIndicator={false}
                            enableAutomaticScroll={(Platform.OS === 'ios')}
                            contentContainerStyle={commonStyles.rowContainer}
                            keyboardShouldPersistTaps={whichVerticalSectionActive === 'search' && !noFilteredOffersToLoad ? 'always' : 'handled'}
                        >
                            <View style={[styles.mainView]}>
                                <TouchableOpacity
                                    activeOpacity={1}
                                    disabled={!showClickOnlyBottomSheet}
                                    onPress={() => setShowClickOnlyBottomSheet(false)}
                                >
                                    <View
                                        {...showClickOnlyBottomSheet && {pointerEvents: "none"}}
                                        {...showClickOnlyBottomSheet && {
                                            style: {backgroundColor: 'transparent', opacity: 0.3}
                                        }}
                                    >
                                        <SearchSection/>
                                        <View style={{
                                            height: hp(1),
                                            backgroundColor: '#313030'
                                        }}/>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={{flex: 1, flexGrow: 1}}
                                    activeOpacity={1}
                                    disabled={!showClickOnlyBottomSheet}
                                    onPress={() => setShowClickOnlyBottomSheet(false)}
                                >
                                    {
                                        <View {...showClickOnlyBottomSheet && {pointerEvents: "none"}}
                                              {...showClickOnlyBottomSheet ? {
                                                  style: {backgroundColor: 'transparent', opacity: 0.3, height: '100%', width: '100%'}
                                              } : {style: {display: 'none'}}}>
                                            {retrieveStoreContents(true)}
                                        </View>
                                    }
                                    {retrieveStoreContents(false)}
                                </TouchableOpacity>
                            </View>
                            {
                                showClickOnlyBottomSheet &&
                                <BottomSheet
                                    handleIndicatorStyle={{backgroundColor: '#F2FF5D'}}
                                    ref={bottomSheetRef}
                                    backgroundStyle={{backgroundColor: '#5B5A5A'}}
                                    enablePanDownToClose={true}
                                    index={showClickOnlyBottomSheet ? 0 : -1}
                                    snapPoints={[hp(55), hp(55)]}
                                    onChange={(index) => {
                                        setShowClickOnlyBottomSheet(index !== -1);
                                    }}
                                >
                                    {
                                        <ClickOnlyOffersBottomSheet
                                            navigation={navigation}
                                        />
                                    }
                                </BottomSheet>
                            }
                        </KeyboardAwareScrollView>
                    </>
            }
        </>
    )
        ;
};
