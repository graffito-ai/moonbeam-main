import React, {useEffect, useMemo, useRef, useState} from "react";
import {styles} from "../../../../../../styles/store.module";
import {Linking, Platform, StyleSheet, TouchableOpacity, View} from "react-native";
import {Marker, PROVIDER_GOOGLE, Region} from "react-native-maps";
import {useRecoilState, useRecoilValue} from "recoil";
import {currentUserLocationState} from "../../../../../../recoil/RootAtom";
import {Card, Dialog, Portal, Text} from "react-native-paper";
import {commonStyles} from "../../../../../../styles/common.module";
// @ts-ignore
import MoonbeamPreferencesIOS from "../../../../../../../assets/art/moonbeam-preferences-ios.jpg";
// @ts-ignore
import MoonbeamPreferencesAndroid from "../../../../../../../assets/art/moonbeam-preferences-android.jpg";
import {Button as ModalButton} from "@rneui/base/dist/Button/Button";
import * as Location from "expo-location";
import {LocationObject} from "expo-location";
import {
    currentActiveKitState,
    locationServicesButtonState,
    nearbyOffersListForFullScreenMapState, nearbyOffersSpinnerShownState, numberOfFailedHorizontalMapOfferCallsState,
    reloadNearbyDueToPermissionsChangeState, storeNavigationState,
    storeOfferPhysicalLocationState,
    storeOfferState,
    uniqueNearbyOffersListForFullScreenMapState
} from "../../../../../../recoil/StoreOfferAtom";
// @ts-ignore
import MoonbeamLocationServices from "../../../../../../../assets/art/moonbeam-location-services-1.png";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {currentUserInformation, userIsAuthenticatedState} from "../../../../../../recoil/AuthAtom";
import {Image, ImageBackground} from "expo-image";
// @ts-ignore
import MoonbeamPlaceholderImage from "../../../../../../../assets/art/moonbeam-store-placeholder.png";
// @ts-ignore
import MoonbeamPinImage from "../../../../../../../assets/pin-shape.png"
import MapView from "react-native-map-clustering";
import {LoggingLevel, RewardType} from "@moonbeam/moonbeam-models";
import {getDistance} from "geolib";
import {Spinner} from "../../../../../common/Spinner";
import {logEvent, retrieveOffersNearbyForMap} from "../../../../../../utils/AppSync";
import {bottomTabShownState} from "../../../../../../recoil/HomeAtom";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {MarketplaceStackParamList} from "../../../../../../models/props/MarketplaceProps";

/**
 * FullScreenMap component.
 *
 * @param props properties to be passed into the component
 * @constructor constructor for the component.
 */
export const FullScreenMap = (props: {
    navigation: NativeStackNavigationProp<MarketplaceStackParamList, 'Store'>
}) => {
    // constants used to keep track of local component state
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
    const [adjustedMapLoading, setIsAdjustedMapLoading] = useState<boolean>(false);
    const [mapIsDisplayed, setIsMapDisplayed] = useState<boolean>(false);
    const [permissionsModalVisible, setPermissionsModalVisible] = useState<boolean>(false);
    const [permissionsModalCustomMessage, setPermissionsModalCustomMessage] = useState<string>("");
    const [permissionsInstructionsCustomMessage, setPermissionsInstructionsCustomMessage] = useState<string>("");
    const mapViewRef = useRef(null);
    const [currentMapRegion, setCurrentMapRegion] = useState<Region>({
        latitude: 0,
        longitude: 0,
        longitudeDelta: 0,
        latitudeDelta: 0
    });
    const [loadedCoordinates, setLoadedCoordinates] = useState<Region>({
        latitude: 0,
        longitude: 0,
        longitudeDelta: 0,
        latitudeDelta: 0
    });
    const [regionChangedInitially, setRegionChangedInitially] = useState<boolean>(false);
    const [canSearchForAdditionalOffers, setCanSearchForAdditionalOffers] = useState<boolean>(false);
    // constants used to keep track of shared states
    const [userIsAuthenticated, ] = useRecoilState(userIsAuthenticatedState);
    const [numberOfFailedHorizontalMapOfferCalls, setNumberOfFailedHorizontalMapOfferCalls] = useRecoilState(numberOfFailedHorizontalMapOfferCallsState);
    const [storeNavigation,] = useRecoilState(storeNavigationState);
    const [, setCurrentActiveKit] = useRecoilState(currentActiveKitState);
    const [, setReloadNearbyDueToPermissionsChange] = useRecoilState(reloadNearbyDueToPermissionsChangeState);
    const [, setNearbyOffersSpinnerShown] = useRecoilState(nearbyOffersSpinnerShownState);
    const [, setStoreOfferPhysicalLocation] = useRecoilState(storeOfferPhysicalLocationState);
    const [, setStoreOfferClicked] = useRecoilState(storeOfferState);
    const [bottomTabShown, setBottomTabShown] = useRecoilState(bottomTabShownState);
    const [, setNearbyOffersListForFullScreenMap] = useRecoilState(nearbyOffersListForFullScreenMapState);
    const [userInformation,] = useRecoilState(currentUserInformation);
    const [locationServicesButton, setLocationServicesButton] = useRecoilState(locationServicesButtonState);
    const uniqueNearbyOffersListForFullScreenMap = useRecoilValue(uniqueNearbyOffersListForFullScreenMapState);
    const [currentUserLocation, setCurrentUserLocation] = useRecoilState(currentUserLocationState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        if (bottomTabShown) {
            setBottomTabShown(false);
        }
        if (mapViewRef && mapViewRef.current && currentUserLocation !== null && !mapIsDisplayed) {
            displayMapMarkersWithinMap();
            displayMapWithOffers().then(updatedMapRegion => {
                setLoadingSpinnerShown(false);
                setCurrentMapRegion(updatedMapRegion);
                setIsMapDisplayed(true);

                // go to the current region on the map, based on the updated map region
                // @ts-ignore
                mapViewRef && mapViewRef.current && mapViewRef.current.animateToRegion({
                    latitude: updatedMapRegion.latitude,
                    longitude: updatedMapRegion.longitude,
                    latitudeDelta: updatedMapRegion.latitudeDelta,
                    longitudeDelta: updatedMapRegion.longitudeDelta,
                }, 0);
            });
            setTimeout(() => {
                setCanSearchForAdditionalOffers(true);
            }, 500);
        }
    }, [currentUserLocation, mapIsDisplayed, mapViewRef, bottomTabShown, canSearchForAdditionalOffers]);

    /**
     * Function used to retrieve the user's location and animate/move the full screen map
     * to that specific position.
     * This can be used to animate the map to the initial position, or to an adjusted position
     * dictated by the users.
     *
     * @returns a {@link Region} representing the specific region to display on the map
     */
    const displayMapWithOffers = async (): Promise<Region> => {
        // first retrieve the necessary permissions for location purposes
        const foregroundPermissionStatus = await Location.requestForegroundPermissionsAsync();
        if (foregroundPermissionStatus.status !== 'granted') {
            const errorMessage = `Permission to access location was not granted!`;
            console.log(errorMessage);
            await logEvent(errorMessage, LoggingLevel.Warning, userIsAuthenticated);

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

                // replace the known coordinates to the current location
                setLoadedCoordinates({
                    latitude: currentUserLocation!.coords.latitude,
                    longitude: currentUserLocation!.coords.longitude,
                    longitudeDelta: 0,
                    latitudeDelta: 0
                });

                // go to the current location on the map, based on the retrieved user location
                return {
                    latitude: currentUserLocation!.coords.latitude,
                    longitude: currentUserLocation!.coords.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.02
                }
            } else {
                // add the current location in the list of known coordinates, for which we already loaded offers for
                setLoadedCoordinates({
                    latitude: currentUserLocation!.coords.latitude,
                    longitude: currentUserLocation!.coords.longitude,
                    longitudeDelta: 0,
                    latitudeDelta: 0
                });

                // go to the current location on the map, based on the retrieved user location
                return {
                    latitude: currentUserLocation!.coords.latitude,
                    longitude: currentUserLocation!.coords.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.02
                };
            }
        }
    }

    /**
     * Function used to display offers on the map, depending on where the user is on the map, from a latitude and longitude
     * perspective. We start with the current user location, and move from there, depending on how a user moves on the map.
     *
     * @returns a {@link JSX.Element[]} representing an array of the Map Markers to display, containing the offers
     * information
     */
    const displayMapMarkersWithinMap = useMemo(() => (): JSX.Element[] => {
        const markers: JSX.Element[] = [];

        // for each unique offer, build a Map Marker to return specifying the offer percentage
        for (let i = 0; i < uniqueNearbyOffersListForFullScreenMap.length; i++) {
            // get the physical location of this offer alongside its coordinates
            let physicalLocation: string = '';
            let storeLatitude: number = 0;
            let storeLongitude: number = 0;
            uniqueNearbyOffersListForFullScreenMap[i] && uniqueNearbyOffersListForFullScreenMap[i].storeDetails !== undefined &&
            uniqueNearbyOffersListForFullScreenMap[i].storeDetails !== null && uniqueNearbyOffersListForFullScreenMap[i].storeDetails!.forEach(store => {
                /**
                 * there are many possible stores with physical locations.
                 * We want to get the one closest (within 5-7 miles from the user,
                 * which is equivalent to approximately 10 km, which is 10000 meters)
                 */
                if (physicalLocation === '' && store !== null && store!.isOnline === false && store!.distance !== null &&
                    store!.distance !== undefined && store!.distance! <= 10000) {
                    // set the store's coordinates accordingly
                    storeLatitude = store!.geoLocation !== undefined && store!.geoLocation !== null &&
                    store!.geoLocation!.latitude !== null && store!.geoLocation!.latitude !== undefined
                        ? store!.geoLocation!.latitude! : 0;
                    storeLongitude = store!.geoLocation !== undefined && store!.geoLocation !== null &&
                    store!.geoLocation!.longitude !== null && store!.geoLocation!.longitude !== undefined
                        ? store!.geoLocation!.longitude! : 0;

                    // Olive needs to get better at displaying the address. For now, we will do this input sanitization
                    if (store!.address1 !== undefined && store!.address1 !== null && store!.address1!.length !== 0 &&
                        store!.city !== undefined && store!.city !== null && store!.city!.length !== 0 &&
                        store!.state !== undefined && store!.state !== null && store!.state!.length !== 0 &&
                        store!.postCode !== undefined && store!.postCode !== null && store!.postCode!.length !== 0) {
                        physicalLocation =
                            (store!.address1!.toLowerCase().includes(store!.city!.toLowerCase())
                                && store!.address1!.toLowerCase().includes(store!.state!.toLowerCase())
                                && store!.address1!.toLowerCase().includes(store!.postCode!.toLowerCase()))
                                ? store!.address1!
                                : `${store!.address1!}, ${store!.city!}, ${store!.state!}, ${store!.postCode!}`;
                    } else {
                        physicalLocation = store!.address1!;
                    }
                }
            });

            // add this Map Marker for the store belonging to this unique offer, if there are valid coordinates retrieved from it
            storeLatitude !== 0 && storeLongitude !== 0 && markers.push(
                <Marker
                    onPress={async () => {
                        // set the clicked offer/partner accordingly
                        setStoreOfferClicked(uniqueNearbyOffersListForFullScreenMap[i]);
                        // set the clicked offer physical location
                        setStoreOfferPhysicalLocation({
                            latitude: storeLatitude,
                            longitude: storeLongitude,
                            latitudeDelta: 0,
                            longitudeDelta: 0,
                            addressAsString: physicalLocation
                        });
                        // @ts-ignore
                        props.navigation.navigate('StoreOffer', {});
                    }}
                    tappable={true}
                    key={uniqueNearbyOffersListForFullScreenMap[i].id}
                    coordinate={{
                        latitude: storeLatitude,
                        longitude: storeLongitude
                    }}
                >
                    <TouchableOpacity onPress={async () => {
                        // set the clicked offer/partner accordingly
                        setStoreOfferClicked(uniqueNearbyOffersListForFullScreenMap[i]);
                        // set the clicked offer physical location
                        setStoreOfferPhysicalLocation({
                            latitude: storeLatitude,
                            longitude: storeLongitude,
                            latitudeDelta: 0,
                            longitudeDelta: 0,
                            addressAsString: physicalLocation
                        });
                        // @ts-ignore
                        props.navigation.navigate('StoreOffer', {});
                    }}>
                        <ImageBackground
                            style={styles.toolTipMain}
                            source={MoonbeamPinImage}
                            contentFit={'contain'}
                            cachePolicy={'memory-disk'}
                        >
                            <View style={{flexDirection: 'row', width: wp(25)}}>
                                <Image
                                    style={styles.toolTipImageDetail}
                                    source={{
                                        uri: uniqueNearbyOffersListForFullScreenMap[i].brandLogoSm!
                                    }}
                                    placeholder={MoonbeamPlaceholderImage}
                                    placeholderContentFit={'contain'}
                                    contentFit={'contain'}
                                    transition={1000}
                                    cachePolicy={'memory-disk'}
                                />
                                <Text style={styles.toolTipImagePrice}>
                                    {uniqueNearbyOffersListForFullScreenMap[i]!.reward!.type! === RewardType.RewardPercent
                                        ? `${uniqueNearbyOffersListForFullScreenMap[i]!.reward!.value}%`
                                        : `$${uniqueNearbyOffersListForFullScreenMap[i]!.reward!.value}`}
                                    {" Off "}
                                </Text>
                            </View>
                        </ImageBackground>
                    </TouchableOpacity>
                </Marker>
            );
        }
        return markers;
    }, [uniqueNearbyOffersListForFullScreenMap]);

    // return the component for the FullScreenMap page
    return (
        <>

            <Portal>
                <Dialog style={[commonStyles.permissionsDialogStyle, {bottom: hp(6)}]}
                        visible={permissionsModalVisible}
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
                                             // go back
                                             setCurrentActiveKit(null);
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
            {
                locationServicesButton ?
                    <Card
                        style={styles.fullScreenMapLoadingCard}>
                        <Card.Content>
                            <View
                                style={styles.fullScreenMapServicesEnableView}>
                                <Image
                                    style={styles.fullScreenMapServicesImage}
                                    source={MoonbeamLocationServices}
                                    contentFit={'contain'}
                                    cachePolicy={'memory-disk'}
                                />
                                <TouchableOpacity
                                    style={styles.fullScreenMapServicesButton}
                                    onPress={
                                        async () => {
                                            const errorMessage = `Permission to access location was not granted!`;
                                            console.log(errorMessage);
                                            await logEvent(errorMessage, LoggingLevel.Warning, userIsAuthenticated);

                                            setPermissionsModalCustomMessage(errorMessage);
                                            setPermissionsInstructionsCustomMessage(Platform.OS === 'ios'
                                                ? "In order to display the offers near you on a map, go to Settings -> Moonbeam Finance, and allow Location Services access by tapping on the \'Location\' option."
                                                : "In order to display the offers near you on a map, go to Settings -> Apps -> Moonbeam Finance -> Permissions, and allow Location Services access by tapping on the \"Location\" option.");
                                            setPermissionsModalVisible(true);
                                        }
                                    }
                                >
                                    <Text
                                        style={styles.fullScreenMapServicesButtonText}>{'Enable'}</Text>
                                </TouchableOpacity>
                                <Text
                                    style={styles.fullScreenMapServicesEnableWarningMessage}>
                                    Display offers nearby on a map, by enabling Location Service
                                    permissions!
                                </Text>
                            </View>
                        </Card.Content>
                    </Card>
                    :
                    <Portal.Host>
                        <View style={styles.fullMapView}>
                            {
                                currentUserLocation !== null &&
                                <View style={styles.fullMapInnerView}>
                                    {
                                        loadingSpinnerShown &&
                                        <Spinner paddingForSpinner={true}
                                                 loadingSpinnerShown={loadingSpinnerShown}
                                                 setLoadingSpinnerShown={setLoadingSpinnerShown}/>
                                    }
                                    {
                                        Platform.OS === 'android' ?
                                            <View style={{overflow: 'hidden', borderRadius: 30}}>
                                                <MapView
                                                    initialRegion={currentMapRegion}
                                                    animationEnabled={true}
                                                    clusteringEnabled={true}
                                                    clusterColor={'#313030'}
                                                    clusterFontFamily={'Raleway-Medium'}
                                                    clusterTextColor={'#F2FF5D'}
                                                    ref={mapViewRef}
                                                    provider={PROVIDER_GOOGLE}
                                                    userInterfaceStyle={'light'}
                                                    userLocationCalloutEnabled={true}
                                                    showsUserLocation={true}
                                                    zoomControlEnabled={true}
                                                    pitchEnabled={true}
                                                    zoomTapEnabled={true}
                                                    rotateEnabled={true}
                                                    toolbarEnabled={true}
                                                    showsScale={true}
                                                    showsBuildings={true}
                                                    showsIndoors={true}
                                                    showsMyLocationButton={!canSearchForAdditionalOffers}
                                                    onRegionChangeComplete={(async (region, _) => {
                                                        setCurrentMapRegion(region);
                                                        if (!regionChangedInitially) {
                                                            setRegionChangedInitially(true);
                                                        } else {
                                                            /**
                                                             *  check to see if we already loaded offers for these coordinates. We load 1,000 offers within 20 km of a particular set of coordinates.
                                                             *  Therefore, we calculate the distance between the current region's coordinates and the sets of coordinates for which we already loaded
                                                             *  offers for, and if that distance exceeds that 20 km or 10 miles for all loaded coordinates, then we load new offers accordingly
                                                             */
                                                            let toLoad = false;
                                                            let calculatedDistance = getDistance({
                                                                latitude: region.latitude,
                                                                longitude: region.longitude
                                                            }, {
                                                                latitude: loadedCoordinates.latitude,
                                                                longitude: loadedCoordinates.longitude
                                                            }, 1);
                                                            // the accuracy above is in meters, so we are calculating it up to miles where 1 mile = 1609.34 meters
                                                            calculatedDistance = Math.round((calculatedDistance / 1609.34) * 100) / 100;

                                                            /**
                                                             * Olive messes up the distances, so if we go more than 2.5 miles outside a known coordinate pair,
                                                             * we need to search again (even though we did 20km/10miles before), because we only draw markers for a distance of approximately 10 miles.
                                                             */
                                                            if (calculatedDistance >= 2.5) {
                                                                toLoad = true;
                                                            }
                                                            if (calculatedDistance < 2.5) {
                                                                toLoad = false;
                                                            }

                                                            // only animate and load more offers based on a user's adjusted position on the map, if this is not already in progress
                                                            if (!adjustedMapLoading && toLoad) {
                                                                setCanSearchForAdditionalOffers(true);
                                                            } else {
                                                                setCanSearchForAdditionalOffers(false);
                                                            }
                                                        }
                                                    })}
                                                    style={[
                                                        {height: '100%', width: '100%'},
                                                        {borderRadius: 30, backgroundColor: '#313030'}]}
                                                >
                                                    {
                                                        displayMapMarkersWithinMap()
                                                    }
                                                </MapView>
                                            </View> :
                                            <MapView
                                                initialRegion={currentMapRegion}
                                                animationEnabled={true}
                                                clusteringEnabled={true}
                                                clusterColor={'#313030'}
                                                clusterFontFamily={'Raleway-Medium'}
                                                clusterTextColor={'#F2FF5D'}
                                                ref={mapViewRef}
                                                provider={PROVIDER_GOOGLE}
                                                userInterfaceStyle={'light'}
                                                userLocationCalloutEnabled={true}
                                                showsUserLocation={true}
                                                zoomControlEnabled={true}
                                                pitchEnabled={true}
                                                zoomTapEnabled={true}
                                                rotateEnabled={true}
                                                toolbarEnabled={true}
                                                showsScale={true}
                                                showsBuildings={true}
                                                showsIndoors={true}
                                                showsMyLocationButton={!canSearchForAdditionalOffers}
                                                onRegionChangeComplete={(async (region, _) => {
                                                    setCurrentMapRegion(region);
                                                    if (!regionChangedInitially) {
                                                        setRegionChangedInitially(true);
                                                    } else {
                                                        /**
                                                         *  check to see if we already loaded offers for these coordinates. We load 1,000 offers within 20 km of a particular set of coordinates.
                                                         *  Therefore, we calculate the distance between the current region's coordinates and the sets of coordinates for which we already loaded
                                                         *  offers for, and if that distance exceeds that 20 km or 10 miles for all loaded coordinates, then we load new offers accordingly
                                                         */
                                                        let toLoad = false;
                                                        let calculatedDistance = getDistance({
                                                            latitude: region.latitude,
                                                            longitude: region.longitude
                                                        }, {
                                                            latitude: loadedCoordinates.latitude,
                                                            longitude: loadedCoordinates.longitude
                                                        }, 1);
                                                        // the accuracy above is in meters, so we are calculating it up to miles where 1 mile = 1609.34 meters
                                                        calculatedDistance = Math.round((calculatedDistance / 1609.34) * 100) / 100;

                                                        /**
                                                         * Olive messes up the distances, so if we go more than 2.5 miles outside a known coordinate pair,
                                                         * we need to search again (even though we did 20km/10miles before), because we only draw markers for a distance of approximately 10 miles.
                                                         */
                                                        if (calculatedDistance >= 2.5) {
                                                            toLoad = true;
                                                        }
                                                        if (calculatedDistance < 2.5) {
                                                            toLoad = false;
                                                        }

                                                        // only animate and load more offers based on a user's adjusted position on the map, if this is not already in progress
                                                        if (!adjustedMapLoading && toLoad) {
                                                            setCanSearchForAdditionalOffers(true);
                                                        } else {
                                                            setCanSearchForAdditionalOffers(false);
                                                        }
                                                    }
                                                })}
                                                style={[
                                                    StyleSheet.absoluteFillObject,
                                                    {borderRadius: 30, backgroundColor: '#313030'}]}
                                            >
                                                {
                                                    displayMapMarkersWithinMap()
                                                }
                                            </MapView>
                                    }
                                    {
                                        canSearchForAdditionalOffers &&
                                        <TouchableOpacity
                                            style={styles.searchButton}
                                            onPress={async () => {
                                                setIsAdjustedMapLoading(true);
                                                setLoadingSpinnerShown(true);
                                                setCanSearchForAdditionalOffers(false);
                                                // retrieves additional offers to display and draw additional map markers in the map
                                                retrieveOffersNearbyForMap(
                                                    numberOfFailedHorizontalMapOfferCalls, setNumberOfFailedHorizontalMapOfferCalls,
                                                    userInformation, currentUserLocation,
                                                    setCurrentUserLocation, undefined, undefined,
                                                    true, currentMapRegion.latitude, currentMapRegion.longitude).then(additionalOffers => {
                                                    if (additionalOffers !== null && additionalOffers.length > 0) {
                                                        // add the new coordinates in the list of coordinates
                                                        setLoadedCoordinates({
                                                            latitude: currentMapRegion.latitude,
                                                            longitude: currentMapRegion.longitude,
                                                            longitudeDelta: 0,
                                                            latitudeDelta: 0
                                                        });
                                                        setNearbyOffersListForFullScreenMap(oldNearbyOfferList => {
                                                            return [...oldNearbyOfferList, ...additionalOffers!]
                                                        });
                                                        displayMapMarkersWithinMap();
                                                        setIsAdjustedMapLoading(false);
                                                        setLoadingSpinnerShown(false);
                                                    } else {
                                                        setIsAdjustedMapLoading(false);
                                                        setLoadingSpinnerShown(false);
                                                    }
                                                })
                                            }}
                                        >
                                            <Text style={styles.searchButtonContentStyle}>Search additional offers
                                                here</Text>
                                        </TouchableOpacity>
                                    }
                                </View>
                            }
                        </View>
                    </Portal.Host>
            }
        </>
    );
};
