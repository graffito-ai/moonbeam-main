import React, {useEffect, useRef, useState} from "react";
import {Image, SafeAreaView, StyleSheet, TouchableOpacity, View} from "react-native";
import {Text} from "react-native-paper";
import {styles} from "../../../../../../styles/dashboard.module";
import MapView, {Marker, PROVIDER_GOOGLE} from "react-native-maps";
import * as Location from 'expo-location';
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';

/**
 * Interface to be used for determining the location of transaction
 * store, to be used when displaying it on a map
 */
interface TransactionStoreLocation {
    latitude: number,
    longitude: number,
    latitudeDelta: number,
    longitudeDelta: number
}

 /**
 * TransactionsBottomSheet component.
 *
 * @param props component properties to be passed in.
 * @constructor constructor for the component.
 */
export const TransactionsBottomSheet = (props: {
    brandName: string,
    brandImage: string,
    transactionStoreAddress?: string,
    transactionOnlineAddress?: string,
    transactionAmount: string,
    transactionDiscountAmount: string,
    transactionStatus: string,
    transactionTimestamp: string
}) => {
    // constants used to keep track of local component state
    const [transactionStoreGeoLocation, setTransactionStoreGeoLocation] = useState<TransactionStoreLocation | null>(null);
    const mapViewRef = useRef(null);
    const discountPercentage = `${Math.round((Number(props.transactionDiscountAmount) / Number(props.transactionAmount)) * 100)}%`;

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        mapViewRef && mapViewRef.current && !transactionStoreGeoLocation && props.transactionStoreAddress && retrieveStoreGeolocation();
    }, [transactionStoreGeoLocation, mapViewRef]);

    // retrieve the geolocation (latitude and longitude of the store which the transaction was made at)
    const retrieveStoreGeolocation = async (): Promise<void> => {
        // first retrieve the necessary permissions for location purposes
        const foregroundPermissionStatus = await Location.requestForegroundPermissionsAsync();
        // const backgroundPermissionStatus = await Location.requestBackgroundPermissionsAsync(); || backgroundPermissionStatus.status !== 'granted'
        if (foregroundPermissionStatus.status !== 'granted') {
            console.log(`Necessary location permissions not granted`);
        } else {
            const geoLocationArray = await Location.geocodeAsync(props.transactionStoreAddress!, {
                useGoogleMaps: true
            });
            console.log(geoLocationArray);
            /**
             * get the first location point in the array of geolocation returned, since we will have the full address of the store,
             * which will result in a 100% accuracy for 1 location match
             */
            const geoLocation = geoLocationArray[0];

            // building the transaction store geolocation object
            let transactionStoreGeoLocation: TransactionStoreLocation | null = null;
            if (geoLocation) {
                // set the store location details accordingly
                transactionStoreGeoLocation = {
                    latitude: geoLocation.latitude!,
                    longitude: geoLocation.longitude!,
                    latitudeDelta: 0.001,
                    longitudeDelta: 0.003
                }

                // go to the current region on the map, based on the retrieved store location
                // @ts-ignore
                mapViewRef && mapViewRef.current && mapViewRef.current.animateToRegion({
                    latitude: transactionStoreGeoLocation.latitude,
                    longitude: transactionStoreGeoLocation.longitude,
                    latitudeDelta: transactionStoreGeoLocation.latitudeDelta,
                    longitudeDelta: transactionStoreGeoLocation.longitudeDelta,
                }, 0);
            }
            setTransactionStoreGeoLocation(transactionStoreGeoLocation);
        }
    }


    // return the component for the TransactionsBottomSheet, part of the Dashboard page
    return (
        <>
            <SafeAreaView
                // @ts-ignore
                style={[StyleSheet.absoluteFill, styles.transactionParentView, props.transactionOnlineAddress && {backgroundColor: '#5B5A5A'}]}>
                <View style={styles.transactionBrandDetailsView}>
                    <Text style={styles.transactionBrandName}>
                        {props.brandName}
                    </Text>
                    <View style={styles.transactionDetailsView}>
                        <Image resizeMethod={"scale"}
                               resizeMode={'contain'}
                               style={styles.transactionBrandImage}
                               source={{
                                   uri: props.brandImage,
                                   height: hp(10),
                                   width: wp(15)
                               }}
                        />
                        <View style={styles.brandDetailsView}>
                            <Text style={styles.transactionDiscountAmount}>
                                {`$ ${props.transactionDiscountAmount}`}
                                <Text style={styles.transactionAmountLabel}> Earned</Text>
                            </Text>
                            <Text style={styles.transactionAddress}>
                                {
                                    props.transactionStoreAddress
                                        ? `In Person Purchase`
                                        : `Online Purchase`
                                }
                            </Text>
                        </View>
                        <View style={styles.transactionAmountsView}>
                            <Text style={styles.transactionStatusLabel}>
                                {props.transactionStatus}
                            </Text>
                            <Text style={styles.transactionTimestamp}>
                                {new Date(Number(props.transactionTimestamp)).toLocaleDateString()}
                            </Text>
                            <Text style={styles.transactionPrice}>
                                {discountPercentage} Off
                            </Text>
                        </View>
                    </View>
                </View>
                {
                    props.transactionStoreAddress &&
                    <View style={styles.transactionMapView}>
                        <MapView
                            provider={PROVIDER_GOOGLE}
                            userInterfaceStyle={'dark'}
                            zoomControlEnabled={true}
                            ref={mapViewRef}
                            style={[StyleSheet.absoluteFillObject, {borderRadius: 30}]}
                        >
                            {
                                transactionStoreGeoLocation &&
                                <Marker
                                    onPress={async () => {
                                        await retrieveStoreGeolocation();
                                    }}
                                    coordinate={{
                                        latitude: transactionStoreGeoLocation.latitude!,
                                        longitude: transactionStoreGeoLocation.longitude!
                                    }}
                                >
                                    <TouchableOpacity onPress={async () => {
                                        await retrieveStoreGeolocation();
                                    }}>
                                        {/*<View style={styles.mapTooltipArrow}/>*/}
                                        <View style={styles.mapTooltip}>
                                            {/*<View style={styles.mapTooltipArrowOverlay}/>*/}
                                            <View style={styles.mapTooltipSquare}/>
                                        </View>
                                        <View
                                            style={styles.toolTipDetailsView}>
                                            <Image style={styles.toolTipImageDetail}
                                                   resizeMethod={"scale"}
                                                   resizeMode={'cover'}
                                                   source={{
                                                       uri: props.brandImage,
                                                       height: hp(2.5),
                                                       width: wp(6)
                                                   }}
                                            />
                                            <Text style={styles.toolTipImagePrice}>
                                                {discountPercentage} Off
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                </Marker>
                            }
                        </MapView>
                    </View>
                }
            </SafeAreaView>
        </>
    );
}
