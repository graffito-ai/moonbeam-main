import React, {useEffect, useMemo, useRef, useState} from "react";
import {styles} from "../../../../../../styles/store.module";
import {Platform, StyleSheet, View} from "react-native";
import {useRecoilState, useRecoilValue} from "recoil";
import {currentUserLocationState} from "../../../../../../recoil/RootAtom";
import {Marker, PROVIDER_GOOGLE, Region} from "react-native-maps";
import * as Location from "expo-location";
import {LocationObject} from "expo-location";
import {
    showClickOnlyBottomSheetState,
    toggleViewPressedState,
    uniqueNearbyOffersListForMainHorizontalMapState
} from "../../../../../../recoil/StoreOfferAtom";
import {Image, ImageBackground} from "expo-image";
// @ts-ignore
import MoonbeamPlaceholderImage from "../../../../../../../assets/art/moonbeam-store-placeholder.png";
import {Portal, Text} from "react-native-paper";
import {LoggingLevel, RewardType} from "@moonbeam/moonbeam-models";
// @ts-ignore
import MoonbeamPinImage from "../../../../../../../assets/pin-shape.png";
import MapView from "react-native-map-clustering";
import {Spinner} from "../../../../../common/Spinner";
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {userIsAuthenticatedState} from "../../../../../../recoil/AuthAtom";
import {logEvent} from "../../../../../../utils/AppSync";

/**
 * MapHorizontalSection component.
 *
 * @constructor constructor for the component.
 */
export const MapHorizontalSection = () => {
    // constants used to keep track of local component state
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
    const [userIsAuthenticated, ] = useRecoilState(userIsAuthenticatedState);
    const [, setToggleViewPressed] = useRecoilState(toggleViewPressedState);
    const uniqueNearbyOffersListForMainHorizontalMap = useRecoilValue(uniqueNearbyOffersListForMainHorizontalMapState);
    const [currentUserLocation, setCurrentUserLocation] = useRecoilState(currentUserLocationState);
    const [showClickOnlyBottomSheet,] = useRecoilState(showClickOnlyBottomSheetState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        if (uniqueNearbyOffersListForMainHorizontalMap.length !== 0) {
            setLoadingSpinnerShown(false);
        }
        if (mapViewRef && mapViewRef.current && currentUserLocation !== null && !mapIsDisplayed) {
            displayMapWithOffers().then(updatedMapRegion => {
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
        }
    }, [currentUserLocation, mapIsDisplayed, mapViewRef, uniqueNearbyOffersListForMainHorizontalMap]);

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
        for (let i = 0; i < uniqueNearbyOffersListForMainHorizontalMap.length; i++) {
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
                        <ImageBackground
                            style={styles.toolTipMain}
                            source={MoonbeamPinImage}
                            contentFit={'contain'}
                            transition={1000}
                            cachePolicy={'memory-disk'}
                        >
                            <View style={{flexDirection: 'row', width: wp(25)}}>
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
                            </View>
                        </ImageBackground>
                    </Marker>
                </>
            )
        }
        return results;
    }, [uniqueNearbyOffersListForMainHorizontalMap]);

    // return the component for the MapHorizontalSection page
    return (
        <>
            <View style={styles.mapHorizontalView}>
                {
                    currentUserLocation !== null &&
                    <View style={styles.mapHorizontalMapView}>
                        <Portal.Host>
                            {
                                loadingSpinnerShown &&
                                <Spinner paddingForSpinner={true}
                                         loadingSpinnerShown={loadingSpinnerShown}
                                         setLoadingSpinnerShown={setLoadingSpinnerShown}/>
                            }
                            {
                                !showClickOnlyBottomSheet && Platform.OS === 'android' &&
                                <View style={{overflow: 'hidden', borderRadius: 10}}>
                                    <MapView
                                        onPress={() => {
                                            setToggleViewPressed('map');
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
                                        style={[
                                            {height: '100%', width: '100%'},
                                            {borderRadius: 10}]}
                                    >
                                        {
                                            displayMapMarkersWithinMap()
                                        }
                                    </MapView>
                                </View>
                            }
                            {
                                !showClickOnlyBottomSheet && Platform.OS !== 'android' &&
                                <MapView
                                    onPress={() => {
                                        setToggleViewPressed('map');
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
                                    style={[
                                        StyleSheet.absoluteFillObject,
                                        {borderRadius: 10}]}
                                >
                                    {
                                        displayMapMarkersWithinMap()
                                    }
                                </MapView>
                            }
                        </Portal.Host>
                    </View>
                }
            </View>
        </>
    );
};
