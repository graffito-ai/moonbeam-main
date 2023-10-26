import React, {useEffect, useMemo, useRef, useState} from "react";
import {styles} from "../../../../../../styles/kit.module";
import {Linking, Platform, StyleSheet, TouchableOpacity, View} from "react-native";
import {useRecoilState, useRecoilValue} from "recoil";
import {currentUserLocationState} from "../../../../../../recoil/RootAtom";
import {Marker, PROVIDER_GOOGLE, Region} from "react-native-maps";
import * as Location from "expo-location";
import {LocationObject} from "expo-location";
import {
    currentActiveKitState, fullScreenKitMapActiveState,
    locationServicesButtonState,
    nearbyKitListIsExpandedState, nearbyOffersSpinnerShownState,
    numberOfElectronicsCategorizedOffersWithin25MilesState,
    numberOfEntertainmentCategorizedOffersWithin25MilesState,
    numberOfFoodCategorizedOffersWithin25MilesState,
    numberOfHealthAndBeautyCategorizedOffersWithin25MilesState,
    numberOfHomeCategorizedOffersWithin25MilesState,
    numberOfOfficeAndBusinessCategorizedOffersWithin25MilesState,
    numberOfRetailCategorizedOffersWithin25MilesState,
    numberOfServicesAndSubscriptionsCategorizedOffersWithin25MilesState,
    onlineKitListIsExpandedState, reloadNearbyDueToPermissionsChangeState, storeNavigationState,
    uniqueNearbyElectronicsOffersListState,
    uniqueNearbyEntertainmentOffersListState,
    uniqueNearbyFoodOffersListState,
    uniqueNearbyHealthAndBeautyOffersListState,
    uniqueNearbyHomeOffersListState,
    uniqueNearbyOfficeAndBusinessOffersListState,
    uniqueNearbyRetailOffersListState,
    uniqueNearbyServicesAndSubscriptionsOffersListState
} from "../../../../../../recoil/StoreOfferAtom";
import {Image} from "expo-image";
// @ts-ignore
import MoonbeamPlaceholderImage from "../../../../../../../assets/art/moonbeam-store-placeholder.png";
import {Card, Dialog, Portal, Text} from "react-native-paper";
import {Offer, OfferCategory, RewardType} from "@moonbeam/moonbeam-models";
// @ts-ignore
import MoonbeamPinImage from "../../../../../../../assets/pin-shape.png";
import MapView from "react-native-map-clustering";
import {Spinner} from "../../../../../common/Spinner";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {MarketplaceStackParamList} from "../../../../../../models/props/MarketplaceProps";
import {moonbeamKits} from "../storeComponents/KitsSection";
// @ts-ignore
import MoonbeamNoOffersKit from "../../../../../../../assets/art/moonbeam-no-offers-kit.png";
// @ts-ignore
import MoonbeamLocationServices from "../../../../../../../assets/art/moonbeam-location-services-1.png";
import {heightPercentageToDP as hp} from "react-native-responsive-screen";
import {commonStyles} from "../../../../../../styles/common.module";
// @ts-ignore
import MoonbeamPreferencesIOS from "../../../../../../../assets/art/moonbeam-preferences-ios.jpg";
// @ts-ignore
import MoonbeamPreferencesAndroid from "../../../../../../../assets/art/moonbeam-preferences-android.jpg";
import {Button as ModalButton} from "@rneui/base/dist/Button/Button";
import {bottomTabShownState} from "../../../../../../recoil/HomeAtom";

/**
 * MapHorizontalSection component.
 *
 * @param props properties to be passed into the component
 * @constructor constructor for the component.
 */
export const MapHorizontalKitSection = (props: {
    navigation: NativeStackNavigationProp<MarketplaceStackParamList, 'Kit'>
}) => {
    // constants used to keep track of local component state
    const [permissionsModalVisible, setPermissionsModalVisible] = useState<boolean>(false);
    const [permissionsModalCustomMessage, setPermissionsModalCustomMessage] = useState<string>("");
    const [permissionsInstructionsCustomMessage, setPermissionsInstructionsCustomMessage] = useState<string>("");
    const [kitName, setKitName] = useState<string>('Kit');
    const [uniqueNearbyOffersListForMainHorizontalMap, setUniqueNearbyOffersListForMainHorizontalMap] = useState<Offer[]>([]);
    const [numberOfNearbyCategorizedOffers, setNumberOfNearbyCategorizedOffers] = useState<number>(0);
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
    const [mapIsDisplayed, setIsMapDisplayed] = useState<boolean>(false);
    const mapViewRef = useRef(null);
    const [currentMapRegion, setCurrentMapRegion] = useState<Region>({
        latitude: 0,
        longitude: 0,
        longitudeDelta: 0,
        latitudeDelta: 0
    });
    // constants used to keep track of shared states
    const [, setFullScreenKitMapActive] = useRecoilState(fullScreenKitMapActiveState);
    const [, setNearbyOffersSpinnerShown] = useRecoilState(nearbyOffersSpinnerShownState);
    const [, setReloadNearbyDueToPermissionsChange] = useRecoilState(reloadNearbyDueToPermissionsChangeState);
    const [locationServicesButton, setLocationServicesButton] = useRecoilState(locationServicesButtonState);
    const [onlineKitListExpanded,] = useRecoilState(onlineKitListIsExpandedState);
    const [nearbyKitListExpanded,] = useRecoilState(nearbyKitListIsExpandedState);
    const [currentActiveKit, setCurrentActiveKit] = useRecoilState(currentActiveKitState);
    const [, setOnlineKitListExpanded] = useRecoilState(onlineKitListIsExpandedState);
    const [, setNearbyKitListExpanded] = useRecoilState(nearbyKitListIsExpandedState);
    const [, setBottomTabShown] = useRecoilState(bottomTabShownState);
    const [storeNavigation,] = useRecoilState(storeNavigationState);
    const [numberOfFoodOffersWithin25Miles, setNumberOfFoodOffersWitin25Miles] = useRecoilState(numberOfFoodCategorizedOffersWithin25MilesState);
    const [numberOfRetailOffersWithin25Miles, setNumberOfRetailOffersWithin25Miles] = useRecoilState(numberOfRetailCategorizedOffersWithin25MilesState);
    const [numberOfEntertainmentOffersWithin25Miles, setNumberOfEntertainmentOffersWithin25Miles] = useRecoilState(numberOfEntertainmentCategorizedOffersWithin25MilesState);
    const [numberOfElectronicsOffersWithin25Miles, setNumberOfElectronicsOffersWithin25Miles] = useRecoilState(numberOfElectronicsCategorizedOffersWithin25MilesState);
    const [numberOfHomeOffersWithin25Miles, setNumberOfHomeOffersWithin25Miles] = useRecoilState(numberOfHomeCategorizedOffersWithin25MilesState);
    const [numberOfHealthAndBeautyOffersWithin25Miles, setNumberOfHealthAndBeautyOffersWithin25Miles] = useRecoilState(numberOfHealthAndBeautyCategorizedOffersWithin25MilesState);
    const [numberOfOfficeAndBusinessOffersWithin25Miles, setNumberOfOfficeAndBusinessOffersWithin25Miles] = useRecoilState(numberOfOfficeAndBusinessCategorizedOffersWithin25MilesState);
    const [numberOfServicesAndSubscriptionsOffersWithin25Miles, setNumberOfServicesAndSubscriptionsOffersWithin25Miles] = useRecoilState(numberOfServicesAndSubscriptionsCategorizedOffersWithin25MilesState);
    const uniqueNearbyFoodOffersList = useRecoilValue(uniqueNearbyFoodOffersListState);
    const uniqueNearbyRetailOffersList = useRecoilValue(uniqueNearbyRetailOffersListState);
    const uniqueNearbyEntertainmentOffersList = useRecoilValue(uniqueNearbyEntertainmentOffersListState);
    const uniqueNearbyElectronicsOffersList = useRecoilValue(uniqueNearbyElectronicsOffersListState);
    const uniqueNearbyHomeOffersList = useRecoilValue(uniqueNearbyHomeOffersListState);
    const uniqueNearbyHealthAndBeautyOffersList = useRecoilValue(uniqueNearbyHealthAndBeautyOffersListState);
    const uniqueNearbyOfficeAndBusinessOffersList = useRecoilValue(uniqueNearbyOfficeAndBusinessOffersListState);
    const uniqueNearbyServicesAndSubscriptionsOffersList = useRecoilValue(uniqueNearbyServicesAndSubscriptionsOffersListState);
    const [currentUserLocation, setCurrentUserLocation] = useRecoilState(currentUserLocationState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // set the kit title, according to the user selected option
        if (currentActiveKit !== null) {
            if (kitName === 'Kit') {
                const filteredKit = moonbeamKits.filter(kit => kit.type === currentActiveKit);
                filteredKit.length === 1 && setKitName(filteredKit[0].secondaryTitle.toString());
            }

            // set the online offer list, according to the type of kit that's active
            switch (currentActiveKit as OfferCategory) {
                case OfferCategory.Food:
                    setNumberOfNearbyCategorizedOffers(numberOfFoodOffersWithin25Miles);
                    setUniqueNearbyOffersListForMainHorizontalMap(uniqueNearbyFoodOffersList);
                    break;
                case OfferCategory.Retail:
                    setNumberOfNearbyCategorizedOffers(numberOfRetailOffersWithin25Miles);
                    setUniqueNearbyOffersListForMainHorizontalMap(uniqueNearbyRetailOffersList);
                    break;
                case OfferCategory.Entertainment:
                    setNumberOfNearbyCategorizedOffers(numberOfEntertainmentOffersWithin25Miles);
                    setUniqueNearbyOffersListForMainHorizontalMap(uniqueNearbyEntertainmentOffersList);
                    break;
                case OfferCategory.Electronics:
                    setNumberOfNearbyCategorizedOffers(numberOfElectronicsOffersWithin25Miles);
                    setUniqueNearbyOffersListForMainHorizontalMap(uniqueNearbyElectronicsOffersList);
                    break;
                case OfferCategory.Home:
                    setNumberOfNearbyCategorizedOffers(numberOfHomeOffersWithin25Miles);
                    setUniqueNearbyOffersListForMainHorizontalMap(uniqueNearbyHomeOffersList);
                    break;
                case OfferCategory.HealthAndBeauty:
                    setNumberOfNearbyCategorizedOffers(numberOfHealthAndBeautyOffersWithin25Miles);
                    setUniqueNearbyOffersListForMainHorizontalMap(uniqueNearbyHealthAndBeautyOffersList);
                    break;
                case OfferCategory.OfficeAndBusiness:
                    setNumberOfNearbyCategorizedOffers(numberOfOfficeAndBusinessOffersWithin25Miles);
                    setUniqueNearbyOffersListForMainHorizontalMap(uniqueNearbyOfficeAndBusinessOffersList);
                    break;
                case OfferCategory.ServicesAndSubscriptions:
                    setNumberOfNearbyCategorizedOffers(numberOfServicesAndSubscriptionsOffersWithin25Miles);
                    setUniqueNearbyOffersListForMainHorizontalMap(uniqueNearbyServicesAndSubscriptionsOffersList);
                    break;
                default:
                    break;
            }
        }
        if (uniqueNearbyOffersListForMainHorizontalMap.length !== 0 || numberOfNearbyCategorizedOffers !== 0) {
            setLoadingSpinnerShown(false);
        }
        if (mapViewRef && mapViewRef.current && currentUserLocation !== null && !mapIsDisplayed) {
            displayMapWithOffers().then(updatedMapRegion => {
                setCurrentMapRegion(updatedMapRegion);
                setIsMapDisplayed(true);
            });
        }
    }, [currentActiveKit, currentUserLocation, mapIsDisplayed, mapViewRef, uniqueNearbyOffersListForMainHorizontalMap, numberOfNearbyCategorizedOffers,
        numberOfFoodOffersWithin25Miles, numberOfRetailOffersWithin25Miles, numberOfEntertainmentOffersWithin25Miles, numberOfElectronicsOffersWithin25Miles,
        numberOfHomeOffersWithin25Miles, numberOfHealthAndBeautyOffersWithin25Miles, numberOfOfficeAndBusinessOffersWithin25Miles,
        numberOfServicesAndSubscriptionsOffersWithin25Miles, uniqueNearbyFoodOffersList, uniqueNearbyRetailOffersList, uniqueNearbyEntertainmentOffersList,
        uniqueNearbyElectronicsOffersList, uniqueNearbyHomeOffersList, uniqueNearbyHealthAndBeautyOffersList, uniqueNearbyOfficeAndBusinessOffersList,
        uniqueNearbyServicesAndSubscriptionsOffersList]);

    /**
     * Function used to retrieve the user's location and animate/move the horizontal map to that position
     *
     * @returns a {@link Region} representing the specific region to display on the map
     */
    const displayMapWithOffers = async (): Promise<Region> => {
        // first retrieve the necessary permissions for location purposes
        const foregroundPermissionStatus = await Location.requestForegroundPermissionsAsync();
        if (foregroundPermissionStatus.status !== 'granted') {
            const errorMessage = `Permission to access location was not granted!`;
            console.log(errorMessage);
            return {
                latitude: 0,
                longitude: 0,
                latitudeDelta: 0,
                longitudeDelta: 0
            }
        } else {
            if (currentUserLocation === null) {
                const lastKnownPositionAsync: LocationObject | null = await Location.getLastKnownPositionAsync();
                setCurrentUserLocation(lastKnownPositionAsync !== null ? lastKnownPositionAsync : await Location.getCurrentPositionAsync());

                // go to the current location on the map, based on the retrieved user location
                return {
                    latitude: currentUserLocation!.coords.latitude,
                    longitude: currentUserLocation!.coords.longitude,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.01,
                };
            } else {
                // go to the current location on the map, based on the retrieved user location
                return {
                    latitude: currentUserLocation!.coords.latitude,
                    longitude: currentUserLocation!.coords.longitude,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.01,
                }
            }
        }
    }

    /**
     * Function used to display some offers (about 10 based on what we decide in the AppSync.ts file) in the main horizontal map,
     * so that we can get users excited about the offers, and they eventually click on the Full Screen Map view.
     *
     * @returns a {@link JSX.Element[]} representing an array of the Map Markers to display, containing the offers
     * information
     */
    const displayMapMarkersWithinMap = useMemo(() => (): JSX.Element[] => {
        const results: JSX.Element[] = [];

        // for each unique offer, build a Map Marker to return specifying the offer percentage
        for (let i = 0; i < uniqueNearbyOffersListForMainHorizontalMap.length && i !== 10; i++) {
            // get the location coordinates of this offer
            let storeLatitude: number = 0;
            let storeLongitude: number = 0;
            uniqueNearbyOffersListForMainHorizontalMap[i] && uniqueNearbyOffersListForMainHorizontalMap[i].storeDetails !== undefined &&
            uniqueNearbyOffersListForMainHorizontalMap[i].storeDetails !== null && uniqueNearbyOffersListForMainHorizontalMap[i].storeDetails!.forEach(store => {
                /**
                 * there are many possible stores with physical locations.
                 * We want to get the one closest (within 5-7 miles from the user,
                 * which is equivalent to approximately 10 km, which is 10000 meters)
                 */
                if (store !== null &&
                    store!.isOnline === false && store!.distance !== null && store!.distance !== undefined
                    && store!.distance! <= 10000) {
                    // set the store's coordinates accordingly
                    storeLatitude = store!.geoLocation !== undefined && store!.geoLocation !== null &&
                    store!.geoLocation!.latitude !== null && store!.geoLocation!.latitude !== undefined
                        ? store!.geoLocation!.latitude! : 0;
                    storeLongitude = store!.geoLocation !== undefined && store!.geoLocation !== null &&
                    store!.geoLocation!.longitude !== null && store!.geoLocation!.longitude !== undefined
                        ? store!.geoLocation!.longitude! : 0;
                }
            });

            // add this Map Marker for the store belonging to this unique offer, if there are valid coordinates retrieved from it
            storeLatitude !== 0 && storeLongitude !== 0 && results.push(
                <>
                    <Marker
                        key={uniqueNearbyOffersListForMainHorizontalMap[i].id}
                        coordinate={{
                            latitude: storeLatitude,
                            longitude: storeLongitude
                        }}
                    >
                        <Image
                            style={styles.toolTipMain}
                            source={MoonbeamPinImage}
                            contentFit={'contain'}
                            transition={1000}
                            cachePolicy={'memory-disk'}
                        >
                            <Image
                                style={styles.toolTipImageDetail}
                                source={{
                                    uri: uniqueNearbyOffersListForMainHorizontalMap[i].brandLogoSm!
                                }}
                                placeholder={MoonbeamPlaceholderImage}
                                placeholderContentFit={'contain'}
                                contentFit={'contain'}
                                transition={1000}
                                cachePolicy={'memory-disk'}
                            />
                            <Text style={styles.toolTipImagePrice}>
                                {uniqueNearbyOffersListForMainHorizontalMap[i]!.reward!.type! === RewardType.RewardPercent
                                    ? `${uniqueNearbyOffersListForMainHorizontalMap[i]!.reward!.value}%`
                                    : `$${uniqueNearbyOffersListForMainHorizontalMap[i]!.reward!.value}`}
                                {" Off "}
                            </Text>
                        </Image>
                    </Marker>
                </>
            )
        }
        return results;
    }, [uniqueNearbyOffersListForMainHorizontalMap]);

    // return the component for the MapHorizontalKitSection page
    return (
        <>
            <Portal>
                <Dialog style={[commonStyles.permissionsDialogStyle, {height: hp(75), bottom: hp(1)}]} visible={permissionsModalVisible}
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
                            style={[commonStyles.dialogParagraphInstructions, {fontSize: hp(1.5), marginBottom: hp(1)}]}>{permissionsInstructionsCustomMessage}</Text>
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
                                             // go back
                                             setCurrentActiveKit(null);
                                             setOnlineKitListExpanded(false);
                                             setNearbyKitListExpanded(false);
                                             setBottomTabShown(true);
                                             storeNavigation && storeNavigation.navigate('Store', {});
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
            <View style={(locationServicesButton || (uniqueNearbyOffersListForMainHorizontalMap.length == 0 || numberOfNearbyCategorizedOffers === 0)) ? {bottom: hp(16)} : {bottom: hp(26)}}>
                {
                    !onlineKitListExpanded && !nearbyKitListExpanded &&
                    <View style={styles.onlineKitOffersTitleView}>
                        <Text style={styles.onlineKitOffersTitleMain}>
                            {`Near You`}
                        </Text>
                        <TouchableOpacity
                            style={styles.moreButton}
                            disabled={locationServicesButton}
                            onPress={() => {
                                setFullScreenKitMapActive(true);
                            }}
                        >
                            <Text
                                style={[styles.moreButtonText, locationServicesButton && {color: '#D9D9D9'}]}>{'View Map'}</Text>
                        </TouchableOpacity>
                    </View>
                }
                {locationServicesButton && !onlineKitListExpanded && !nearbyKitListExpanded ?
                    <Card style={styles.nearbyLoadingOfferCard}>
                        <Card.Content>
                            <View
                                style={styles.locationServicesEnableView}>
                                <Image
                                    style={styles.locationServicesImage}
                                    source={MoonbeamLocationServices}/>
                                <TouchableOpacity
                                    style={styles.locationServicesButton}
                                    onPress={
                                        async () => {
                                            const errorMessage = `Permission to access location was not granted!`;
                                            console.log(errorMessage);

                                            setPermissionsModalCustomMessage(errorMessage);
                                            setPermissionsInstructionsCustomMessage(Platform.OS === 'ios'
                                                ? `In order to display ${kitName} offers near your location, go to Settings -> Moonbeam Finance, and allow Location Services access by tapping on the \'Location\' option.`
                                                : `In order to display ${kitName} near your location, go to Settings -> Apps -> Moonbeam Finance -> Permissions, and allow Location Services access by tapping on the \"Location\" option.`);
                                            setPermissionsModalVisible(true);
                                        }
                                    }
                                >
                                    <Text
                                        style={styles.locationServicesButtonText}>{'Enable'}</Text>
                                </TouchableOpacity>
                                <Text
                                    style={styles.locationServicesEnableWarningMessage}>
                                    {`Display ${kitName} offers nearby, by enabling Location Service permissions!`}
                                </Text>
                            </View>
                        </Card.Content>
                    </Card>
                    :
                    (uniqueNearbyOffersListForMainHorizontalMap.length == 0 || numberOfNearbyCategorizedOffers === 0)  && !onlineKitListExpanded && !nearbyKitListExpanded
                        ?
                        <Card style={styles.nearbyLoadingOfferCard}>
                            <Card.Content>
                                <View
                                    style={[styles.locationServicesEnableView, {height: hp(23)}]}>
                                    <Image
                                        style={styles.noOffersKitImage}
                                        source={MoonbeamNoOffersKit}/>
                                    <Text
                                        style={[styles.locationServicesEnableWarningMessage, {color: '#F2FF5D', fontSize: hp(2.2), top: hp(1)}]}>
                                        {`No ${kitName} offers nearby!`}
                                    </Text>
                                </View>
                            </Card.Content>
                        </Card>
                        :
                    currentUserLocation !== null && !nearbyKitListExpanded && !onlineKitListExpanded &&
                    <View style={styles.mapHorizontalView}>
                        <View style={styles.mapHorizontalMapView}>
                            <Portal.Host>
                                {
                                    loadingSpinnerShown &&
                                    <Spinner paddingForSpinner={true}
                                             loadingSpinnerShown={loadingSpinnerShown}
                                             setLoadingSpinnerShown={setLoadingSpinnerShown}/>
                                }
                                <MapView
                                    onPress={() => {
                                        setFullScreenKitMapActive(true);
                                    }}
                                    initialRegion={currentMapRegion}
                                    clusteringEnabled={true}
                                    clusterColor={'#313030'}
                                    clusterFontFamily={'Raleway-Medium'}
                                    clusterTextColor={'#F2FF5D'}
                                    provider={PROVIDER_GOOGLE}
                                    userInterfaceStyle={'light'}
                                    ref={mapViewRef}
                                    userLocationCalloutEnabled={true}
                                    showsUserLocation={true}
                                    zoomControlEnabled={false}
                                    pitchEnabled={false}
                                    rotateEnabled={false}
                                    scrollEnabled={false}
                                    zoomEnabled={false}
                                    style={[StyleSheet.absoluteFillObject, {borderRadius: 10}]}
                                >
                                    {
                                        displayMapMarkersWithinMap()
                                    }
                                </MapView>
                            </Portal.Host>
                        </View>
                    </View>
                }
            </View>
        </>
    );
};
