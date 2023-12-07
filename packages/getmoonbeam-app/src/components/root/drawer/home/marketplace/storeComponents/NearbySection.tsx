import React, {useEffect, useMemo, useRef, useState} from "react";
import {ActivityIndicator, Card, Paragraph, Portal, Text} from "react-native-paper";
import {styles} from "../../../../../../styles/store.module";
import {Image, Platform, ScrollView, TouchableOpacity, View} from "react-native";
import {Offer, RewardType} from "@moonbeam/moonbeam-models";
import {Avatar} from "@rneui/base";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {MarketplaceStackParamList} from "../../../../../../models/props/MarketplaceProps";
import {useRecoilState, useRecoilValue} from "recoil";
import {
    locationServicesButtonState,
    nearbyOffersListState,
    nearbyOffersSpinnerShownState,
    noNearbyOffersToLoadState, numberOfOffersWithin25MilesState,
    numberOfOffersWithin5MilesState,
    storeOfferPhysicalLocationState,
    storeOfferState,
    toggleViewPressedState,
    uniqueNearbyOffersListState,
    verticalSectionActiveState
} from "../../../../../../recoil/StoreOfferAtom";
import {currentUserInformation} from "../../../../../../recoil/AuthAtom";
import {Image as ExpoImage} from 'expo-image';
// @ts-ignore
import MoonbeamLocationServices from "../../../../../../../assets/art/moonbeam-location-services-1.png";
// @ts-ignore
import MoonbeamOffersLoading from "../../../../../../../assets/art/moonbeam-offers-loading.png";
// @ts-ignore
import MoonbeamPlaceholderImage from "../../../../../../../assets/art/moonbeam-store-placeholder.png";
import {DataProvider, LayoutProvider, RecyclerListView} from "recyclerlistview";
import {MapHorizontalSection} from "./MapHorizontalSection";
import {getDistance} from "geolib";
import {currentUserLocationState} from "../../../../../../recoil/RootAtom";

/**
 * NearbySection component.
 *
 * @param props properties to be passed into the component
 * @constructor constructor for the component.
 */
export const NearbySection = (props: {
    navigation: NativeStackNavigationProp<MarketplaceStackParamList, 'Store'>,
    retrieveOffersNearLocation: (string) => Promise<void>,
    retrieveNearbyOffersList: () => Promise<void>,
    offersNearUserLocationFlag: boolean,
    setPermissionsModalCustomMessage: React.Dispatch<React.SetStateAction<string>>,
    setPermissionsInstructionsCustomMessage: React.Dispatch<React.SetStateAction<string>>,
    areNearbyOffersReady: boolean,
    setPermissionsModalVisible: React.Dispatch<React.SetStateAction<boolean>>
}) => {
    // constants used to keep track of local component state
    const nearbyListView = useRef();
    const [horizontalListLoading, setHorizontalListLoading] = useState<boolean>(false);
    const [dataProvider, setDataProvider] = useState<DataProvider | null>(null);
    const [layoutProvider, setLayoutProvider] = useState<LayoutProvider | null>(null);
    // constants used to keep track of shared states
    const [numberOfOffersWithin5Miles,] = useRecoilState(numberOfOffersWithin5MilesState);
    const [numberOfOffersWithin25Miles,] = useRecoilState(numberOfOffersWithin25MilesState);
    const [currentUserLocation,] = useRecoilState(currentUserLocationState);
    const [, setToggleViewPressed] = useRecoilState(toggleViewPressedState);
    const [, setWhichVerticalSectionActive] = useRecoilState(verticalSectionActiveState);
    const deDuplicatedNearbyOfferList = useRecoilValue(uniqueNearbyOffersListState);
    const [nearbyOfferList,] = useRecoilState(nearbyOffersListState);
    const [locationServicesButton,] = useRecoilState(locationServicesButtonState);
    const [, setStoreOfferClicked] = useRecoilState(storeOfferState);
    const [, setStoreOfferPhysicalLocation] = useRecoilState(storeOfferPhysicalLocationState);
    const [userInformation,] = useRecoilState(currentUserInformation);
    const [noNearbyOffersToLoad,] = useRecoilState(noNearbyOffersToLoadState);
    const [nearbyOffersSpinnerShown, setNearbyOffersSpinnerShown] = useRecoilState(nearbyOffersSpinnerShownState);

    /**
     * Function used to populate the rows containing the nearby offer data.
     *
     * @param type row type to be passed in
     * @param data data to be passed in for the row
     * @param index row index
     *
     * @return a {@link JSX.Element} or an {@link Array} of {@link JSX.Element} representing the
     * React node and/or nodes containing the nearby offer data.
     */
    const renderRowData = useMemo(() => (_type: string | number, data: Offer, index: number): JSX.Element | JSX.Element[] => {
        if (nearbyOfferList.length !== 0) {
            // get the physical location of this offer alongside its coordinates
            let physicalLocation: string = '';
            let storeLatitude: number = 0;
            let storeLongitude: number = 0;
            data && data.storeDetails !== undefined && data.storeDetails !== null && data.storeDetails!.forEach(store => {
                /**
                 * there are many possible stores with physical locations.
                 * We want to get the one closest (within 25 miles from the user,
                 * which is equivalent to approximately 50 km, which is 50000 meters)
                 */
                if (physicalLocation === '' && store !== null &&
                    store!.isOnline === false && store!.distance !== null && store!.distance !== undefined
                    && store!.distance! <= 50000) {
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

            // calculate the distance between the location of the store displayed and the user's current location (in miles)
            let calculatedDistance = currentUserLocation !== null && storeLatitude !== 0 && storeLongitude !== 0 ? getDistance({
                latitude: storeLatitude,
                longitude: storeLongitude
            }, {
                latitude: currentUserLocation.coords.latitude,
                longitude: currentUserLocation.coords.longitude
            }, 1) : 0;
            // the accuracy above is in meters, so we are calculating it up to miles where 1 mile = 1609.34 meters
            calculatedDistance = Math.round((calculatedDistance / 1609.34) * 100) / 100

            // only get the true nearby offers (since this is an Olive bug
            return physicalLocation !== '' ? (
                <>
                    {
                        <>
                            <Card
                                style={styles.nearbyOfferCard}>
                                <Card.Content>
                                    <View style={{flexDirection: 'column'}}>
                                        <View style={{
                                            flexDirection: 'row',
                                            width: wp(75),
                                            justifyContent: 'space-between'
                                        }}>
                                            <View style={{
                                                flexDirection: 'column',
                                                justifyContent: 'space-between',
                                                right: wp(2)
                                            }}>
                                                <Card.Title
                                                    style={{alignSelf: 'flex-start', right: wp(1.5)}}
                                                    title={
                                                        <Text style={styles.nearbyOfferCardTitle}>
                                                            {`${data.brandDba}\n`}
                                                            <Text style={styles.nearbyOfferCardSubtitle}>
                                                                {data.reward!.type! === RewardType.RewardPercent
                                                                    ? `${data.reward!.value}% Off`
                                                                    : `$${data.reward!.value} Off`}
                                                            </Text>
                                                        </Text>
                                                    }
                                                    titleStyle={styles.nearbyOfferCardTitleMain}
                                                    titleNumberOfLines={2}/>
                                                <Paragraph
                                                    numberOfLines={3}
                                                    style={styles.nearbyOfferCardParagraph}
                                                >
                                                    {`📌 ${physicalLocation}`}
                                                </Paragraph>
                                                {
                                                    calculatedDistance !== 0 &&
                                                    <Paragraph
                                                        numberOfLines={1}
                                                        style={styles.nearbyOfferCardDistanceParagraph}
                                                    >
                                                        {`${calculatedDistance} miles away`}
                                                    </Paragraph>
                                                }
                                            </View>
                                            <View style={{
                                                flexDirection: 'column',
                                                justifyContent: 'space-between',
                                                left: wp(2)
                                            }}>
                                                <ExpoImage
                                                    style={styles.nearbyOfferCardCover}
                                                    source={{
                                                        uri: data.brandLogoSm!
                                                    }}
                                                    placeholder={MoonbeamPlaceholderImage}
                                                    placeholderContentFit={'contain'}
                                                    contentFit={'contain'}
                                                    transition={1000}
                                                    cachePolicy={'memory-disk'}
                                                />
                                                <TouchableOpacity
                                                    style={styles.viewOfferButton}
                                                    onPress={() => {
                                                        // set the clicked offer/partner accordingly
                                                        setStoreOfferClicked(data);
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
                                                >
                                                    {/*@ts-ignore*/}
                                                    <Text style={styles.viewOfferButtonContent}>View
                                                        Offer</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                </Card.Content>
                            </Card>
                            <View
                                style={{width: index === nearbyOfferList.length - 1 ? wp(10) : wp(5)}}/>
                        </>
                    }
                </>
            ) : <></>;
        } else {
            return (<></>);
        }
    }, [nearbyOfferList]);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // update the list data providers if we are loading more offers accordingly
        if (horizontalListLoading) {
            setDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(deDuplicatedNearbyOfferList));
            setHorizontalListLoading(false);
            setNearbyOffersSpinnerShown(false);

            // setTimeout(() => {
            //     setDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(deDuplicatedNearbyOfferList));
            //     setHorizontalListLoading(false);
            //     setNearbyOffersSpinnerShown(false);
            // }, 3000);
        }

        // populate the nearby offer data provider and list view
        if (nearbyOfferList.length > 0 && layoutProvider === null && dataProvider === null) {
            setDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(deDuplicatedNearbyOfferList));
            setLayoutProvider(new LayoutProvider(
                _ => 0,
                (_, dim) => {
                    dim.width = wp(85);
                    dim.height = hp(27);
                }
            ));
        }
    }, [dataProvider, layoutProvider, nearbyOfferList, horizontalListLoading]);

    // return the component for the NearbySection page
    return (
        <>
            {
                locationServicesButton ?
                    <>
                        <View
                            style={styles.nearbyOffersView}>
                            <View style={styles.nearbyOffersTitleView}>
                                <View
                                    style={styles.nearbyOffersLeftTitleView}>
                                    <Text
                                        style={[styles.nearbyLoadingOffersTitleMain]}>
                                        <Text
                                            style={styles.nearbyLoadingOffersTitle}>
                                            {'Offers near you'}
                                        </Text>
                                        {/*{`   🌎️`}*/}
                                    </Text>
                                </View>
                            </View>
                            <ScrollView
                                style={styles.nearbyOffersScrollView}
                                horizontal={true}
                                decelerationRate={"fast"}
                                snapToAlignment={"start"}
                                scrollEnabled={true}
                                persistentScrollbar={false}
                                showsHorizontalScrollIndicator={false}>
                                {
                                    <>
                                        <Card
                                            style={styles.nearbyLoadingOfferCard}>
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

                                                                props.setPermissionsModalCustomMessage(errorMessage);
                                                                props.setPermissionsInstructionsCustomMessage(Platform.OS === 'ios'
                                                                    ? "In order to display the offers near your location, go to Settings -> Moonbeam Finance, and allow Location Services access by tapping on the \'Location\' option."
                                                                    : "In order to display the offers near your location, go to Settings -> Apps -> Moonbeam Finance -> Permissions, and allow Location Services access by tapping on the \"Location\" option.");
                                                                props.setPermissionsModalVisible(true);
                                                            }
                                                        }
                                                    >
                                                        <Text
                                                            style={styles.locationServicesButtonText}>{'Enable'}</Text>
                                                    </TouchableOpacity>
                                                    <Text
                                                        style={styles.locationServicesEnableWarningMessage}>
                                                        Display offers nearby, by enabling Location Service permissions!
                                                    </Text>
                                                </View>
                                            </Card.Content>
                                        </Card>
                                    </>
                                }
                            </ScrollView>
                        </View>
                    </> :
                    nearbyOfferList.length < 6 &&
                    <>
                        <View
                            style={styles.nearbyOffersView}>
                            <View style={styles.nearbyOffersTitleView}>
                                <View
                                    style={styles.nearbyOffersLeftTitleView}>
                                    <Text
                                        style={[styles.nearbyLoadingOffersTitleMain]}>
                                        <Text
                                            style={styles.nearbyLoadingOffersTitle}>
                                            {'Retrieving offers near you...'}
                                        </Text>
                                        {/*{`   🌎️`}*/}
                                    </Text>
                                </View>
                            </View>
                            <ScrollView
                                style={styles.nearbyOffersScrollView}
                                horizontal={true}
                                decelerationRate={"fast"}
                                snapToAlignment={"start"}
                                scrollEnabled={true}
                                persistentScrollbar={false}
                                showsHorizontalScrollIndicator={false}>
                                {
                                    <>
                                        <Card
                                            style={styles.nearbyLoadingOfferCard}>
                                            <Card.Content>
                                                <View
                                                    style={{flexDirection: 'column'}}>
                                                    <ActivityIndicator
                                                        style={{top: hp(10), right: wp(7)}}
                                                        animating={true}
                                                        color={'#F2FF5D'}
                                                        size={hp(6)}
                                                    />
                                                </View>
                                                <Avatar
                                                    containerStyle={styles.nearbyLoadingOfferCardCover}
                                                    imageProps={{
                                                        resizeMode: 'contain'
                                                    }}
                                                    source={MoonbeamOffersLoading}
                                                />
                                            </Card.Content>
                                        </Card>
                                    </>
                                }
                            </ScrollView>
                        </View>
                    </>
            }
            {
                nearbyOfferList.length >= 6 &&
                <>
                    <View style={styles.nearbyOffersView}>
                        <View style={styles.nearbyOffersTitleView}>
                            <View style={styles.nearbyOffersLeftTitleView}>
                                <Text
                                    style={[styles.nearbyOffersTitleMain, props.offersNearUserLocationFlag && {left: wp(6)}]}>
                                    <Text
                                        style={styles.nearbyOffersTitle}>
                                        {!props.offersNearUserLocationFlag
                                            ? 'Offers near you'
                                            : `Offers in ${userInformation["address"]["formatted"].split(',')[1].trimStart().trimEnd()}`}
                                    </Text>
                                    {/*{`   🌎️`}*/}
                                </Text>
                                <Text
                                    style={[styles.nearbyOffersTitleSub, props.offersNearUserLocationFlag && {left: wp(6)}]}>
                                    {`${numberOfOffersWithin5Miles} offers within 5 miles`}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => {
                                setToggleViewPressed('map');
                            }}>
                                <Text
                                    style={styles.mapHorizontalViewTitleButton}
                                    onPress={() => {
                                        setToggleViewPressed('map');
                                    }}>
                                    View Map
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <Portal.Host>
                            <MapHorizontalSection/>
                            <View style={{top: hp(1.5), height: hp(5)}}>
                                <Text
                                    style={[styles.nearbyOffersForMapTitleSub, props.offersNearUserLocationFlag && {left: wp(6)}]}>
                                    {`${numberOfOffersWithin25Miles} offers within 25 miles`}
                                </Text>
                                <TouchableOpacity onPress={() => {
                                    setToggleViewPressed('vertical');
                                    // set the active vertical section manually
                                    setWhichVerticalSectionActive('nearby');
                                }}>
                                    <Text
                                        style={styles.nearbyOffersTitleButton}>
                                        See All
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            {
                                dataProvider !== null && layoutProvider !== null &&
                                <RecyclerListView
                                    // @ts-ignore
                                    ref={nearbyListView}
                                    style={styles.nearbyOffersScrollView}
                                    layoutProvider={layoutProvider!}
                                    dataProvider={dataProvider!}
                                    rowRenderer={renderRowData}
                                    isHorizontal={true}
                                    forceNonDeterministicRendering={true}
                                    renderFooter={() => {
                                        return (
                                            horizontalListLoading || nearbyOffersSpinnerShown ?
                                                <>
                                                    <View
                                                        style={{width: wp(20)}}/>
                                                    <Card
                                                        style={[styles.loadCard, {marginTop: hp(4)}]}>
                                                        <Card.Content>
                                                            <View style={{flexDirection: 'column'}}>
                                                                <View style={{
                                                                    flexDirection: 'row'
                                                                }}>
                                                                    <View style={{top: hp(3)}}>
                                                                        <ActivityIndicator
                                                                            style={{
                                                                                right: wp(15)
                                                                            }}
                                                                            animating={true}
                                                                            color={'#F2FF5D'}
                                                                            size={hp(5)}
                                                                        />

                                                                    </View>
                                                                </View>
                                                            </View>
                                                        </Card.Content>
                                                    </Card>
                                                </> : <></>
                                        )
                                    }}
                                    {
                                        ...(Platform.OS === 'ios') ?
                                            {onEndReachedThreshold: 0} :
                                            {onEndReachedThreshold: 1}
                                    }
                                    onEndReached={async () => {
                                        console.log(`End of list reached. Trying to refresh more items.`);

                                        // if there are items to load
                                        if (!noNearbyOffersToLoad) {
                                            // set the loader
                                            setNearbyOffersSpinnerShown(true);
                                            // retrieving more offers (nearby or near user's location)
                                            !props.offersNearUserLocationFlag
                                                ? await props.retrieveNearbyOffersList()
                                                : await props.retrieveOffersNearLocation(userInformation["address"]["formatted"]);
                                            setHorizontalListLoading(true);
                                            // this makes the scrolling seem infinite - we artificially scroll up a little, so we have enough time to load
                                            // @ts-ignore
                                            nearbyListView.current?.scrollToIndex(deDuplicatedNearbyOfferList.length - 2);
                                        } else {
                                            console.log(`Maximum number of nearby offers reached ${deDuplicatedNearbyOfferList.length}`);
                                        }
                                    }}
                                    scrollViewProps={{
                                        decelerationRate: "fast",
                                        snapToInterval: wp(70) + wp(20),
                                        snapToAlignment: "center",
                                        persistentScrollbar: false,
                                        showsHorizontalScrollIndicator: false
                                    }}
                                />
                            }

                            {/*<View style={{height: hp(40), width: wp(100), bottom: hp(2)}}>*/}


                            {/*</View>*/}
                        </Portal.Host>
                    </View>
                </>
            }
        </>
    );
};
