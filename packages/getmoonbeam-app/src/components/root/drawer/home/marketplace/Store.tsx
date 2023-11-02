import React, {useEffect, useState} from 'react';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {StoreProps} from "../../../../../models/props/MarketplaceProps";
import {Spinner} from '../../../../common/Spinner';
import {Image, Linking, Platform, ScrollView, View} from "react-native";
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
    getOffers,
    Offer,
    OfferAvailability,
    OfferFilter,
    OfferState,
    RedemptionType
} from "@moonbeam/moonbeam-models";
import {API, graphqlOperation} from "aws-amplify";
import {currentUserInformation, marketplaceAmplifyCacheState} from "../../../../../recoil/AuthAtom";
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
    fidelisPartnerListState,
    locationServicesButtonState,
    nearbyOffersListState,
    nearbyOffersPageNumberState,
    nearbyOffersSpinnerShownState,
    noNearbyOffersToLoadState,
    noOnlineOffersToLoadState,
    offersNearUserLocationFlagState,
    onlineOffersListState,
    onlineOffersPageNumberState,
    reloadNearbyDueToPermissionsChangeState, storeNavigationState,
    toggleViewPressedState
} from "../../../../../recoil/StoreOfferAtom";
import {currentUserLocationState} from "../../../../../recoil/RootAtom";
import {KitsSection} from "./storeComponents/KitsSection";
import {FullScreenMap} from "./storeComponents/FullScreenMap";

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
    const [filteredOffersSpinnerShown, setFilteredOffersSpinnerShown] = useState<boolean>(false);
    const [noFilteredOffersAvailable, setNoFilteredOffersAvailable] = useState<boolean>(false);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [shouldCacheImages, setShouldCacheImages] = useState<boolean>(true);
    // constants used to keep track of shared states
    const [fidelisPartnerList, setFidelisPartnerList] = useRecoilState(fidelisPartnerListState);
    const [, setStoreNavigationState] = useRecoilState(storeNavigationState);
    const [currentUserLocation, setCurrentUserLocation] = useRecoilState(currentUserLocationState);
    const [toggleViewPressed,] = useRecoilState(toggleViewPressedState);
    const [, setNearbyOffersSpinnerShown] = useRecoilState(nearbyOffersSpinnerShownState);
    const [, setReloadNearbyDueToPermissionsChange] = useRecoilState(reloadNearbyDueToPermissionsChangeState);
    const [locationServicesButton, setLocationServicesButton] = useRecoilState(locationServicesButtonState);
    const [nearbyOfferList, setNearbyOfferList] = useRecoilState(nearbyOffersListState);
    const [onlineOfferList, setOnlineOfferList] = useRecoilState(onlineOffersListState);
    const [marketplaceCache,] = useRecoilState(marketplaceAmplifyCacheState);
    const [userInformation,] = useRecoilState(currentUserInformation);
    const [nearbyOffersPageNumber, setNearbyOffersPageNumber] = useRecoilState(nearbyOffersPageNumberState);
    const [onlineOffersPageNumber, setOnlineOffersPageNumber] = useRecoilState(onlineOffersPageNumberState);
    const [, setNoOnlineOffersToLoad] = useRecoilState(noOnlineOffersToLoadState);
    const [, setNoNearbyOffersToLoad] = useRecoilState(noNearbyOffersToLoadState);
    const [offersNearUserLocationFlag, setOffersNearUserLocationFlag] = useRecoilState(offersNearUserLocationFlagState);

    /**
     * Function used to retrieve the list of preferred (Fidelis) partners
     * and their offers, that we will display in the first category of the
     * marketplace.
     *
     * @returns a {@link Promise} of {@link void} since this function will set the
     * React state of the preferred partners.
     */
    const retrieveFidelisPartnerList = async (): Promise<void> => {
        try {
            // call the getFidelisPartners API
            const fidelisPartnersResult = await API.graphql(graphqlOperation(getFidelisPartners));

            // retrieve the data block from the response
            // @ts-ignore
            const responseData = fidelisPartnersResult ? fidelisPartnersResult.data : null;

            // check if there are any errors in the returned response
            if (responseData && responseData.getFidelisPartners.errorMessage === null) {
                // retrieve the array of Fidelis partners from the API call
                const fidelisPartners: FidelisPartner[] = responseData.getFidelisPartners.data;

                // ensure that there is at least one featured partner in the list
                if (fidelisPartners.length > 0) {
                    // const fidelisPartnersSorted = fidelisPartners.sort(dynamicSort("brandName"));
                    setFidelisPartnerList(fidelisPartners);

                    // set the cache appropriately
                    marketplaceCache && marketplaceCache!.setItem(`${userInformation["custom:userId"]}-fidelisPartners`, fidelisPartners);
                } else {
                    console.log(`No Fidelis partners to display ${JSON.stringify(fidelisPartnersResult)}`);
                    setModalVisible(true);
                }
            } else {
                console.log(`Unexpected error while retrieving Fidelis partner offers ${JSON.stringify(fidelisPartnersResult)}`);
                setModalVisible(true);
            }
        } catch (error) {
            console.log(`Unexpected error while attempting to retrieve the Fidelis partner offers ${JSON.stringify(error)} ${error}`);
            setModalVisible(true);
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
                if (onlineOffers.length > 0) {
                    // increase the page number
                    setOnlineOffersPageNumber(onlineOffersPageNumber + 1);

                    // push any old offers into the list to return
                    setOnlineOfferList(oldOnlineOfferList => {
                        return [...oldOnlineOfferList, ...onlineOffers];
                    });
                } else {
                    console.log(`No online offers to display ${JSON.stringify(onlineOffersResult)}`);
                    /**
                     * if there are no more online offers to load, then this is not an error,
                     * otherwise display an error.
                     */
                    if (onlineOfferList.length === 0) {
                        setModalVisible(true);
                    } else {
                        // set the online offers to load flag
                        setNoOnlineOffersToLoad(true);
                    }
                }
            } else {
                console.log(`Unexpected error while retrieving online offers ${JSON.stringify(onlineOffersResult)}`);
                setModalVisible(true);
            }
        } catch (error) {
            console.log(`Unexpected error while attempting to retrieve online offers ${JSON.stringify(error)} ${error}`);
            setModalVisible(true);
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
                console.log('offers near user home are cached');

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
                    console.log(`Unable to retrieve user's home location's geolocation ${address}`);
                    setAreNearbyOffersReady(true);
                    setNearbyOffersSpinnerShown(false);
                } else {
                    setAreNearbyOffersReady(true);
                    setNearbyOffersSpinnerShown(false);
                }
            } else {
                console.log('offers near user home are not cached, or page number is not 1');
                // first retrieve the necessary geolocation information based on the user's home address
                const geoLocationArray = await Location.geocodeAsync(address);
                /**
                 * get the first location point in the array of geolocation returned
                 */
                const geoLocation = geoLocationArray && geoLocationArray.length !== 0 ? geoLocationArray[0] : null;
                if (!geoLocation) {
                    console.log(`Unable to retrieve user's home location's geolocation ${address}`);
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
                        if (nearbyOffers.length > 0) {
                            // if the page number is 1, then cache the first page of offers near user home
                            nearbyOffersPageNumber === 1 && marketplaceCache && marketplaceCache!.setItem(`${userInformation["custom:userId"]}-offerNearUserHome`, nearbyOffers);

                            // increase page number
                            setNearbyOffersPageNumber(nearbyOffersPageNumber + 1);

                            // push any old offers into the list to return
                            setOnlineOfferList(oldNearbyOfferList => {
                                return [...oldNearbyOfferList, ...nearbyOffers];
                            });

                            // set the nearby user location flag
                            setOffersNearUserLocationFlag(true);

                            setAreNearbyOffersReady(true);
                            setNearbyOffersSpinnerShown(false);
                        } else {
                            console.log(`No offers near user's home location to display ${JSON.stringify(nearbyOffersResult)}`);
                            setAreNearbyOffersReady(true);
                            setNearbyOffersSpinnerShown(false);
                            /**
                             * if there are no more nearby offers to load, then this is not an error,
                             * otherwise display an error.
                             */
                            if (nearbyOfferList.length === 0) {
                                setModalVisible(true);
                            } else {
                                setNearbyOffersSpinnerShown(false);
                                // set the no nearby offers to load flag
                                setNoNearbyOffersToLoad(true);
                            }
                        }
                    } else {
                        console.log(`Unexpected error while retrieving offers near user's home location ${JSON.stringify(nearbyOffersResult)}`);
                        setModalVisible(true);
                        setAreNearbyOffersReady(true);
                        setNearbyOffersSpinnerShown(false);
                    }
                }
            }

        } catch (error) {
            console.log(`Unexpected error while attempting to retrieve offers near user's home location ${JSON.stringify(error)} ${error}`);
            setModalVisible(true);
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
                        if (nearbyOffers.length > 0) {
                            // increase page number
                            setNearbyOffersPageNumber(nearbyOffersPageNumber + 1);

                            // push any old offers into the list to return
                            setNearbyOfferList(nearbyOfferList.concat(nearbyOffers));

                            setAreNearbyOffersReady(true);
                            setNearbyOffersSpinnerShown(false);
                        } else {
                            console.log(`No nearby offers to display ${JSON.stringify(nearbyOffersResult)}`);
                            /**
                             * if there are no more nearby offers to load, then do not fall back
                             * otherwise fall back to the offers near users' home address.
                             */
                            if (nearbyOfferList.length === 0 || offersNearUserLocationFlag) {
                                userInformation["address"] && userInformation["address"]["formatted"] && await retrieveOffersNearLocation(userInformation["address"]["formatted"]);
                            } else {
                                setNearbyOffersSpinnerShown(false);
                                // set the no nearby offers to load flag
                                setNoNearbyOffersToLoad(true);
                            }
                        }
                    } else {
                        console.log(`Unexpected error while retrieving nearby offers ${JSON.stringify(nearbyOffersResult)}`);
                        setModalVisible(true);
                        setAreNearbyOffersReady(true);
                        setNearbyOffersSpinnerShown(false);
                    }
                } else {
                    console.log(`Unable to retrieve the current user's location coordinates!`);
                    setModalVisible(true);
                    setAreNearbyOffersReady(true);
                    setNearbyOffersSpinnerShown(false);
                }
            }
        } catch (error) {
            console.log(`Unexpected error while attempting to retrieve nearby offers ${JSON.stringify(error)} ${error}`);

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
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        setStoreNavigationState(navigation);
        // load the Fidelis partners with their offers
        const loadFidelisData = async (): Promise<void> => {
            // check to see if we have cached Fidelis Partners. If we do, we don't need to retrieve them again for a week.
            if (marketplaceCache && await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-fidelisPartners`) !== null) {
                console.log('Fidelis Partners are cached');
                setFidelisPartnerList(await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-fidelisPartners`));
            } else {
                console.log('Fidelis Partners are not cached');
                await retrieveFidelisPartnerList();
            }
        }

        // load the Fidelis partners if their list is empty
        fidelisPartnerList.length === 0 && loadFidelisData().then(_ => {
        });

        // make sure to stop loading the store when we have a list of Fidelis partners and at least 7 online offers
        if (fidelisPartnerList.length !== 0 && onlineOfferList.length !== 0) {
            // release the loader on button press
            !isReady && setIsReady(true);
        }
    }, [fidelisPartnerList, onlineOfferList, marketplaceCache]);

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
                            keyboardShouldPersistTaps={'handled'}
                        >
                            <View style={[styles.mainView]}>
                                <SearchSection
                                    setNoFilteredOffersAvailable={setNoFilteredOffersAvailable}
                                    setModalVisible={setModalVisible}
                                    setShouldCacheImages={setShouldCacheImages}
                                    setFilteredOffersSpinnerShown={setFilteredOffersSpinnerShown}
                                />
                                <View style={{
                                    height: hp(1),
                                    backgroundColor: '#313030'
                                }}/>
                                <View style={styles.content}>
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
                                                        <KitsSection
                                                            navigation={navigation}
                                                        />
                                                        <FidelisSection
                                                            navigation={navigation}
                                                            areNearbyOffersReady={areNearbyOffersReady}
                                                        />
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
                                                        noFilteredOffersAvailable={noFilteredOffersAvailable}
                                                        shouldCacheImages={shouldCacheImages}
                                                        fidelisPartnerList={fidelisPartnerList}
                                                        filteredOffersSpinnerShown={filteredOffersSpinnerShown}
                                                        setFilteredOffersSpinnerShown={setFilteredOffersSpinnerShown}
                                                        retrieveOnlineOffersList={retrieveOnlineOffersList}
                                                        offersNearUserLocationFlag={offersNearUserLocationFlag}
                                                        retrieveNearbyOffersList={retrieveNearbyOffersList}
                                                        retrieveOffersNearLocation={retrieveOffersNearLocation}
                                                        setNoFilteredOffersAvailable={setNoFilteredOffersAvailable}
                                                    />
                                                </Portal.Host>
                                                :
                                                <Portal.Host>
                                                    <FullScreenMap
                                                        navigation={navigation}
                                                    />
                                                </Portal.Host>
                                    }
                                </View>
                            </View>
                        </KeyboardAwareScrollView>
                    </>
            }
        </>
    )
        ;
};
