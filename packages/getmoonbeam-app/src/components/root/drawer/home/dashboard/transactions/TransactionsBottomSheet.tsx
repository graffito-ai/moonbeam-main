import React, {useEffect, useRef, useState} from "react";
import {Linking, Platform, SafeAreaView, StyleSheet, TouchableOpacity, View} from "react-native";
import {ActivityIndicator, Dialog, Portal, Text} from "react-native-paper";
import {styles} from "../../../../../../styles/dashboard.module";
import MapView, {Marker, PROVIDER_GOOGLE} from "react-native-maps";
import * as Location from 'expo-location';
// @ts-ignore
import MoonbeamLocationServices from "../../../../../../../assets/art/moonbeam-location-services-1.png";
import {commonStyles} from "../../../../../../styles/common.module";
// @ts-ignore
import MoonbeamPreferencesIOS from "../../../../../../../assets/art/moonbeam-preferences-ios.jpg";
// @ts-ignore
import MoonbeamPreferencesAndroid from "../../../../../../../assets/art/moonbeam-preferences-android.jpg";
import {Button} from "@rneui/base";
import {showTransactionBottomSheetState} from "../../../../../../recoil/DashboardAtom";
import {useRecoilState} from "recoil";
// @ts-ignore
import MoonbeamPlaceholderImage from "../../../../../../../assets/art/moonbeam-store-placeholder.png";
// @ts-ignore
import MoonbeamPinImage from "../../../../../../../assets/pin-shape.png";
import {Image} from "expo-image";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {userIsAuthenticatedState} from "../../../../../../recoil/AuthAtom";
import {geocodeAsync, logEvent} from "../../../../../../utils/AppSync";
import {LoggingLevel, OsType, TransactionType} from "@moonbeam/moonbeam-models";

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
    transactionTimestamp: string,
    transactionType: TransactionType
}) => {
    // constants used to keep track of local component state
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(false);
    const [permissionsModalVisible, setPermissionsModalVisible] = useState<boolean>(false);
    const [permissionsModalCustomMessage, setPermissionsModalCustomMessage] = useState<string>("");
    const [permissionsInstructionsCustomMessage, setPermissionsInstructionsCustomMessage] = useState<string>("");
    const [locationServicesButton, setLocationServicesButton] = useState<boolean>(false);
    const [transactionStoreGeoLocation, setTransactionStoreGeoLocation] = useState<TransactionStoreLocation | null>(null);
    const mapViewRef = useRef(null);
    const discountPercentage = `${Math.round((Number(props.transactionDiscountAmount) / Number(props.transactionAmount)) * 100)}%`;
    // constants used to keep track of shared states
    const [userIsAuthenticated,] = useRecoilState(userIsAuthenticatedState);
    const [, setShowTransactionBottomSheet] = useRecoilState(showTransactionBottomSheetState);

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
        setLoadingSpinnerShown(true);
        // first retrieve the necessary permissions for location purposes
        const foregroundPermissionStatus = await Location.requestForegroundPermissionsAsync();
        if (foregroundPermissionStatus.status !== 'granted') {
            const errorMessage = `Permission to access location was not granted!`;
            console.log(errorMessage);
            await logEvent(errorMessage, LoggingLevel.Warning, userIsAuthenticated);

            setLocationServicesButton(true);
            setLoadingSpinnerShown(false);
        } else {
            const geoLocationArray = await geocodeAsync(props.transactionStoreAddress!, Platform.OS === 'ios' ? OsType.Ios : OsType.Android);
            /**
             * get the first location point in the array of geolocation returned, since we will have the full address of the store,
             * which will result in a 100% accuracy for 1 location match
             */
            const geoLocation = geoLocationArray[0];

            // building the transaction store geolocation object
            let transactionStoreGeoLocation: TransactionStoreLocation | null = null;
            if (geoLocation) {
                setLoadingSpinnerShown(false);
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
            setShowTransactionBottomSheet(true);
        }
    }

    // return the component for the TransactionsBottomSheet, part of the Dashboard page
    return (
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
                        <Button buttonStyle={commonStyles.dialogButton}
                                titleStyle={commonStyles.dialogButtonText}
                                onPress={async () => {
                                    // go to the appropriate settings page depending on the OS
                                    if (Platform.OS === 'ios') {
                                        await Linking.openURL("app-settings:");
                                    } else {
                                        await Linking.openSettings();
                                    }
                                    setPermissionsModalVisible(false);
                                    setShowTransactionBottomSheet(false);
                                }}>
                            {"Go to App Settings"}
                        </Button>
                        <Button buttonStyle={commonStyles.dialogButtonSkip}
                                titleStyle={commonStyles.dialogButtonSkipText}
                                onPress={async () => {
                                    setPermissionsModalVisible(false);
                                    setShowTransactionBottomSheet(false);
                                }}>
                            {"Skip"}
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
            <SafeAreaView
                // @ts-ignore
                style={[StyleSheet.absoluteFill, styles.transactionParentView, props.transactionOnlineAddress && {backgroundColor: '#5B5A5A'}]}>
                <View style={styles.transactionBrandDetailsView}>
                    {
                        (props.transactionType !== TransactionType.OliveIneligibleMatched && props.transactionType !== TransactionType.OliveIneligibleUnmatched)
                            ? <>
                                <Text style={styles.transactionBrandName}>
                                    {props.brandName}
                                </Text>
                                <View style={styles.transactionDetailsView}>
                                    <View style={styles.transactionBrandImageBackground}>
                                        <Image
                                            style={styles.transactionBrandImage}
                                            source={{
                                                uri: props.brandImage,
                                            }}
                                            placeholder={MoonbeamPlaceholderImage}
                                            placeholderContentFit={'contain'}
                                            contentFit={'contain'}
                                            transition={1000}
                                            cachePolicy={'memory-disk'}
                                        />
                                    </View>
                                    <View style={styles.brandDetailsView}>
                                        <Text style={styles.transactionDiscountAmount}>
                                            {`$ ${props.transactionDiscountAmount}`}
                                            <Text style={styles.transactionAmountLabel}> Earned</Text>
                                        </Text>
                                        <Text style={styles.transactionAddress}>
                                            {
                                                props.transactionStoreAddress
                                                    ? `In-Person Purchase`
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
                            </>
                            : <>
                                <Text style={styles.transactionBrandName}>
                                    {'Unqualified merchant cashback'}
                                </Text>
                                <View style={styles.transactionDetailsView}>
                                    <View style={styles.transactionBrandImageBackground}>
                                        <Image
                                            style={styles.transactionBrandImage}
                                            source={{
                                                uri: props.brandImage,
                                            }}
                                            placeholder={MoonbeamPlaceholderImage}
                                            placeholderContentFit={'contain'}
                                            contentFit={'contain'}
                                            transition={1000}
                                            cachePolicy={'memory-disk'}
                                        />
                                    </View>
                                    <View style={styles.brandDetailsView}>
                                        <Text style={styles.transactionDiscountAmount}>
                                            {`$ ${props.transactionDiscountAmount}`}
                                            <Text style={styles.transactionAmountLabel}> Earned</Text>
                                        </Text>
                                        <Text style={styles.transactionAddress}>
                                            {
                                                `Courtesy Cashback`
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
                                    </View>
                                </View>
                            </>
                    }
                </View>
                {
                    (props.transactionType !== TransactionType.OliveIneligibleMatched && props.transactionType !== TransactionType.OliveIneligibleUnmatched) &&
                    <>
                        {
                            locationServicesButton
                                ?
                                <>
                                    <View style={styles.locationServicesEnableView}>
                                        <Image style={styles.locationServicesImage} source={MoonbeamLocationServices}/>
                                        <TouchableOpacity
                                            style={styles.locationServicesButton}
                                            onPress={
                                                async () => {
                                                    const errorMessage = `Permission to access location was not granted!`;
                                                    console.log(errorMessage);
                                                    await logEvent(errorMessage, LoggingLevel.Warning, userIsAuthenticated);

                                                    setPermissionsModalCustomMessage(errorMessage);
                                                    setPermissionsInstructionsCustomMessage(Platform.OS === 'ios'
                                                        ? "In order to display the exact locations of your in-person transactions, go to Settings -> Moonbeam Finance, and allow Location Services access by tapping on the \'Location\' option."
                                                        : "In order to display the exact locations of your in-person transactions, go to Settings -> Apps -> Moonbeam Finance -> Permissions, and allow Location Services access by tapping on the \"Location\" option.");
                                                    setPermissionsModalVisible(true);
                                                }
                                            }
                                        >
                                            <Text
                                                style={styles.locationServicesButtonText}>{'Enable'}</Text>
                                        </TouchableOpacity>
                                        <Text style={styles.locationServicesEnableWarningMessage}>
                                            Display transaction location, by enabling Location Service permissions!
                                        </Text>
                                    </View>
                                </>
                                :
                                <>
                                    {
                                        loadingSpinnerShown &&
                                        <ActivityIndicator
                                            style={{top: hp(15), marginBottom: hp(-6), zIndex: 10}}
                                            animating={true} color={'#313030'}
                                            size={wp(13)}/>
                                    }
                                    {
                                        props.transactionStoreAddress &&
                                        <View style={styles.transactionMapView}>
                                            <MapView
                                                provider={PROVIDER_GOOGLE}
                                                userInterfaceStyle={'dark'}
                                                zoomControlEnabled={true}
                                                ref={mapViewRef}
                                                style={[StyleSheet.absoluteFillObject, {borderRadius: 30, zIndex: 5}]}
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
                                                        <TouchableOpacity
                                                            style={styles.toolTipTouchableView}
                                                            onPress={async () => {
                                                                await retrieveStoreGeolocation();
                                                            }}>
                                                            <View style={styles.toolTipView}>
                                                                <Image
                                                                    style={styles.toolTipImageDetail}
                                                                    source={{
                                                                        uri: props.brandImage
                                                                    }}
                                                                    placeholder={MoonbeamPlaceholderImage}
                                                                    placeholderContentFit={'contain'}
                                                                    contentFit={'contain'}
                                                                    transition={1000}
                                                                    cachePolicy={'memory-disk'}
                                                                />
                                                                <Text style={styles.toolTipImagePrice}>
                                                                    {`${discountPercentage} Off `}
                                                                </Text>
                                                            </View>
                                                            {
                                                                Platform.OS === 'android' ?
                                                                    <>
                                                                        <View style={styles.triangleContainer}>
                                                                            <View style={styles.toolTipTriangle}/>
                                                                        </View>
                                                                        <View
                                                                            style={[styles.triangleContainer, {bottom: hp(0.3)}]}>
                                                                            <View
                                                                                style={styles.toolTipTriangleOutside}/>
                                                                        </View>
                                                                    </> :
                                                                    <>
                                                                        <View style={styles.triangleContainer}>
                                                                            <View style={styles.toolTipTriangle}/>
                                                                            <View
                                                                                style={[styles.toolTipTriangleOutside, {top: hp(0.3)}]}/>
                                                                        </View>
                                                                    </>
                                                            }
                                                        </TouchableOpacity>
                                                    </Marker>
                                                }
                                            </MapView>
                                        </View>
                                    }
                                </>
                        }
                    </>
                }
            </SafeAreaView>
        </>
    );
}
