import React, {useEffect, useMemo, useRef, useState} from 'react';
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {MarketplaceStackParamList} from "../../../../../../models/props/MarketplaceProps";
import {Platform, TouchableOpacity, View} from "react-native";
import {styles} from '../../../../../../styles/kit.module';
import {ActivityIndicator, Card, List, Text} from "react-native-paper";
import {useRecoilState, useRecoilValue} from "recoil";
import {
    currentActiveKitState,
    nearbyElectronicsCategorizedOffersListState,
    nearbyElectronicsCategorizedOffersPageNumberState,
    nearbyEntertainmentCategorizedOffersListState,
    nearbyEntertainmentCategorizedOffersPageNumberState,
    nearbyFoodCategorizedOffersListState,
    nearbyFoodCategorizedOffersPageNumberState,
    nearbyHealthAndBeautyCategorizedOffersListState,
    nearbyHealthAndBeautyCategorizedOffersPageNumberState,
    nearbyHomeCategorizedOffersListState,
    nearbyHomeCategorizedOffersPageNumberState,
    nearbyKitListIsExpandedState,
    nearbyOfficeAndBusinessCategorizedOffersListState,
    nearbyOfficeAndBusinessCategorizedOffersPageNumberState,
    nearbyRetailCategorizedOffersListState,
    nearbyRetailCategorizedOffersPageNumberState,
    nearbyServicesAndSubscriptionsCategorizedOffersListState,
    nearbyServicesAndSubscriptionsCategorizedOffersPageNumberState,
    noNearbyElectronicsCategorizedOffersToLoadState,
    noNearbyEntertainmentCategorizedOffersToLoadState,
    noNearbyFoodCategorizedOffersToLoadState,
    noNearbyHealthAndBeautyCategorizedOffersToLoadState,
    noNearbyHomeCategorizedOffersToLoadState,
    noNearbyOfficeAndBusinessCategorizedOffersToLoadState,
    noNearbyRetailCategorizedOffersToLoadState,
    noNearbyServicesAndSubscriptionsCategorizedOffersToLoadState,
    offersNearUserLocationFlagState,
    onlineKitListIsExpandedState, storeOfferPhysicalLocationState,
    storeOfferState,
    uniqueNearbyElectronicsOffersListState,
    uniqueNearbyEntertainmentOffersListState,
    uniqueNearbyFoodOffersListState,
    uniqueNearbyHealthAndBeautyOffersListState,
    uniqueNearbyHomeOffersListState,
    uniqueNearbyOfficeAndBusinessOffersListState,
    uniqueNearbyRetailOffersListState,
    uniqueNearbyServicesAndSubscriptionsOffersListState
} from "../../../../../../recoil/StoreOfferAtom";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {DataProvider, LayoutProvider, RecyclerListView} from "recyclerlistview";
import {Offer, OfferCategory, RewardType} from '@moonbeam/moonbeam-models';
import {Image} from "expo-image";
// @ts-ignore
import MoonbeamPlaceholderImage from "../../../../../../../assets/art/moonbeam-store-placeholder.png";
import {moonbeamKits} from "../storeComponents/KitsSection";
import {retrieveCategorizedOffersNearby} from "../../../../../../utils/AppSync";
// @ts-ignore
import MoonbeamNoOffersKit from "../../../../../../../assets/art/moonbeam-no-offers-kit.png";
import {currentUserInformation} from "../../../../../../recoil/AuthAtom";
import {currentUserLocationState} from "../../../../../../recoil/RootAtom";
import {getDistance} from "geolib";

/**
 * NearbyKitSection component.
 *
 * @param props properties to be passed into the component
 * @constructor constructor for the component.
 */
export const NearbyKitSection = (props: {
    navigation: NativeStackNavigationProp<MarketplaceStackParamList, 'Kit'>
}) => {
    // constants used to keep track of local component state
    const nearbyListView = useRef();
    const [kitName, setKitName] = useState<string>('Kit');
    const [numberOfNearbyOffers, setNumberOfNearbyOffers] = useState<number>(0);
    const [noNearbyOffersToLoad, setNoNearbyOffersToLoad] = useState<boolean | null>(null);
    const [nearbyOfferList, setNearbyOfferList] = useState<Offer[]>([]);
    const [deDuplicatedNearbyOfferList, setDeduplicatedNearbyOfferList] = useState<Offer[]>([]);
    const [verticalListLoading, setVerticalListLoading] = useState<boolean>(false);
    const [nearbyOffersSpinnerShown, setNearbyOffersSpinnerShown] = useState<boolean>(false);
    const [dataProvider, setDataProvider] = useState<DataProvider | null>(null);
    const [layoutProvider, setLayoutProvider] = useState<LayoutProvider | null>(null);

    // constants used to keep track of shared states
    const [onlineKitListExpanded, setIsOnlineKitListExpanded] = useRecoilState(onlineKitListIsExpandedState);
    const [nearbyKitListExpanded, setIsNearbyKitListExpanded] = useRecoilState(nearbyKitListIsExpandedState);
    const [, setStoreOfferClicked] = useRecoilState(storeOfferState);
    const [currentActiveKit,] = useRecoilState(currentActiveKitState);
    const [userInformation,] = useRecoilState(currentUserInformation);
    const [currentUserLocation, setCurrentUserLocation] = useRecoilState(currentUserLocationState);
    const [, setOffersNearUserLocationFlag] = useRecoilState(offersNearUserLocationFlagState);
    const [nearbyFoodCategorizedPageNumber, setNearbyFoodCategorizedPageNumber] = useRecoilState(nearbyFoodCategorizedOffersPageNumberState);
    const [nearbyRetailCategorizedPageNumber, setNearbyRetailCategorizedPageNumber] = useRecoilState(nearbyRetailCategorizedOffersPageNumberState);
    const [nearbyEntertainmentCategorizedPageNumber, setNearbyEntertainmentCategorizedPageNumber] = useRecoilState(nearbyEntertainmentCategorizedOffersPageNumberState);
    const [nearbyElectronicsCategorizedPageNumber, setNearbyElectronicsCategorizedPageNumber] = useRecoilState(nearbyElectronicsCategorizedOffersPageNumberState);
    const [nearbyHomeCategorizedPageNumber, setNearbyHomeCategorizedPageNumber] = useRecoilState(nearbyHomeCategorizedOffersPageNumberState);
    const [nearbyHealthAndBeautyCategorizedPageNumber, setNearbyHealthAndBeautyCategorizedPageNumber] = useRecoilState(nearbyHealthAndBeautyCategorizedOffersPageNumberState);
    const [nearbyOfficeAndBusinessCategorizedPageNumber, setNearbyOfficeAndBusinessCategorizedPageNumber] = useRecoilState(nearbyOfficeAndBusinessCategorizedOffersPageNumberState);
    const [nearbyServicesAndSubscriptionsCategorizedPageNumber, setNearbyServicesAndSubscriptionsCategorizedPageNumber] = useRecoilState(nearbyServicesAndSubscriptionsCategorizedOffersPageNumberState);
    const [noNearbyFoodCategorizedOffersToLoad, setNoNearbyFoodCategorizedOffersToLoad] = useRecoilState(noNearbyFoodCategorizedOffersToLoadState);
    const [noNearbyRetailCategorizedOffersToLoad, setNoNearbyRetailCategorizedOffersToLoad] = useRecoilState(noNearbyRetailCategorizedOffersToLoadState);
    const [noNearbyEntertainmentCategorizedOffersToLoad, setNoNearbyEntertainmentCategorizedOffersToLoad] = useRecoilState(noNearbyEntertainmentCategorizedOffersToLoadState);
    const [noNearbyElectronicsCategorizedOffersToLoad, setNoNearbyElectronicsCategorizedOffersToLoad] = useRecoilState(noNearbyElectronicsCategorizedOffersToLoadState);
    const [noNearbyHomeCategorizedOffersToLoad, setNoNearbyHomeCategorizedOffersToLoad] = useRecoilState(noNearbyHomeCategorizedOffersToLoadState);
    const [noNearbyHealthAndBeautyCategorizedOffersToLoad, setNoNearbyHealthAndBeautyCategorizedOffersToLoad] = useRecoilState(noNearbyHealthAndBeautyCategorizedOffersToLoadState);
    const [noNearbyOfficeAndBusinessCategorizedOffersToLoad, setNoNearbyOfficeAndBusinessCategorizedOffersToLoad] = useRecoilState(noNearbyOfficeAndBusinessCategorizedOffersToLoadState);
    const [noNearbyServicesAndSubscriptionsCategorizedOffersToLoad, setNoNearbyServicesAndSubscriptionsCategorizedOffersToLoad] = useRecoilState(noNearbyServicesAndSubscriptionsCategorizedOffersToLoadState);
    const [nearbyFoodCategorizedOfferList, setNearbyFoodCategorizedOfferList] = useRecoilState(nearbyFoodCategorizedOffersListState);
    const [nearbyRetailCategorizedOfferList, setNearbyRetailCategorizedOfferList] = useRecoilState(nearbyRetailCategorizedOffersListState);
    const [nearbyEntertainmentCategorizedOfferList, setNearbyEntertainmentCategorizedOfferList] = useRecoilState(nearbyEntertainmentCategorizedOffersListState);
    const [nearbyElectronicsCategorizedOfferList, setNearbyElectronicsCategorizedOfferList] = useRecoilState(nearbyElectronicsCategorizedOffersListState);
    const [nearbyHomeCategorizedOfferList, setNearbyHomeCategorizedOfferList] = useRecoilState(nearbyHomeCategorizedOffersListState);
    const [nearbyHealthAndBeautyCategorizedOfferList, setNearbyHealthAndBeautyCategorizedOfferList] = useRecoilState(nearbyHealthAndBeautyCategorizedOffersListState);
    const [nearbyOfficeAndBusinessCategorizedOfferList, setNearbyOfficeAndBusinessCategorizedOfferList] = useRecoilState(nearbyOfficeAndBusinessCategorizedOffersListState);
    const [nearbyServicesAndSubscriptionsCategorizedOfferList, setNearbyServicesAndSubscriptionsCategorizedOfferList] = useRecoilState(nearbyServicesAndSubscriptionsCategorizedOffersListState);
    const uniqueNearbyFoodOffersList = useRecoilValue(uniqueNearbyFoodOffersListState);
    const uniqueNearbyRetailOffersList = useRecoilValue(uniqueNearbyRetailOffersListState);
    const uniqueNearbyEntertainmentOffersList = useRecoilValue(uniqueNearbyEntertainmentOffersListState);
    const uniqueNearbyElectronicsOffersList = useRecoilValue(uniqueNearbyElectronicsOffersListState);
    const uniqueNearbyHomeOffersList = useRecoilValue(uniqueNearbyHomeOffersListState);
    const uniqueNearbyHealthAndBeautyOffersList = useRecoilValue(uniqueNearbyHealthAndBeautyOffersListState);
    const uniqueNearbyOfficeAndBusinessOffersList = useRecoilValue(uniqueNearbyOfficeAndBusinessOffersListState);
    const uniqueNearbyServicesAndSubscriptionsOffersList = useRecoilValue(uniqueNearbyServicesAndSubscriptionsOffersListState);
    const [, setStoreOfferPhysicalLocation] = useRecoilState(storeOfferPhysicalLocationState);

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

            // set the nearby offer list, according to the type of kit that's active
            switch (currentActiveKit as OfferCategory) {
                case OfferCategory.Food:
                    setDeduplicatedNearbyOfferList(uniqueNearbyFoodOffersList);
                    setNearbyOfferList(nearbyFoodCategorizedOfferList);
                    setNoNearbyOffersToLoad(noNearbyFoodCategorizedOffersToLoad);
                    break;
                case OfferCategory.Retail:
                    setDeduplicatedNearbyOfferList(uniqueNearbyRetailOffersList);
                    setNearbyOfferList(nearbyRetailCategorizedOfferList);
                    setNoNearbyOffersToLoad(noNearbyRetailCategorizedOffersToLoad);
                    break;
                case OfferCategory.Entertainment:
                    setDeduplicatedNearbyOfferList(uniqueNearbyEntertainmentOffersList);
                    setNearbyOfferList(nearbyEntertainmentCategorizedOfferList);
                    setNoNearbyOffersToLoad(noNearbyEntertainmentCategorizedOffersToLoad);
                    break;
                case OfferCategory.Electronics:
                    setDeduplicatedNearbyOfferList(uniqueNearbyElectronicsOffersList);
                    setNearbyOfferList(nearbyElectronicsCategorizedOfferList);
                    setNoNearbyOffersToLoad(noNearbyElectronicsCategorizedOffersToLoad);
                    break;
                case OfferCategory.Home:
                    setDeduplicatedNearbyOfferList(uniqueNearbyHomeOffersList);
                    setNearbyOfferList(nearbyHomeCategorizedOfferList);
                    setNoNearbyOffersToLoad(noNearbyHomeCategorizedOffersToLoad);
                    break;
                case OfferCategory.HealthAndBeauty:
                    setDeduplicatedNearbyOfferList(uniqueNearbyHealthAndBeautyOffersList);
                    setNearbyOfferList(nearbyHealthAndBeautyCategorizedOfferList);
                    setNoNearbyOffersToLoad(noNearbyHealthAndBeautyCategorizedOffersToLoad);
                    break;
                case OfferCategory.OfficeAndBusiness:
                    setDeduplicatedNearbyOfferList(uniqueNearbyOfficeAndBusinessOffersList);
                    setNearbyOfferList(nearbyOfficeAndBusinessCategorizedOfferList);
                    setNoNearbyOffersToLoad(noNearbyOfficeAndBusinessCategorizedOffersToLoad);
                    break;
                case OfferCategory.ServicesAndSubscriptions:
                    setDeduplicatedNearbyOfferList(uniqueNearbyServicesAndSubscriptionsOffersList);
                    setNearbyOfferList(nearbyServicesAndSubscriptionsCategorizedOfferList);
                    setNoNearbyOffersToLoad(noNearbyServicesAndSubscriptionsCategorizedOffersToLoad);
                    break;
                default:
                    break;
            }
        }

        // update the list data providers if we are loading more offers accordingly
        if (verticalListLoading) {
            setDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(deDuplicatedNearbyOfferList));
            setVerticalListLoading(false);
            setNearbyOffersSpinnerShown(false);
        }
        // populate the online offer data provider and list view
        if ((nearbyOfferList && nearbyOfferList.length > 0 && layoutProvider === null && dataProvider === null)) {
            setDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(deDuplicatedNearbyOfferList.slice(0, 2)));
            setLayoutProvider(new LayoutProvider(
                _ => 0,
                (_, dim) => {
                    dim.width = wp(33);
                    dim.height = hp(25);
                }
            ));
        }
    }, [currentActiveKit, dataProvider, layoutProvider, deDuplicatedNearbyOfferList, verticalListLoading,
        uniqueNearbyFoodOffersList, uniqueNearbyRetailOffersList, uniqueNearbyEntertainmentOffersList, uniqueNearbyElectronicsOffersList,
        uniqueNearbyHomeOffersList, uniqueNearbyHealthAndBeautyOffersList, uniqueNearbyOfficeAndBusinessOffersList, uniqueNearbyServicesAndSubscriptionsOffersList,
        nearbyFoodCategorizedOfferList, nearbyRetailCategorizedOfferList, nearbyEntertainmentCategorizedOfferList, nearbyElectronicsCategorizedOfferList,
        nearbyHomeCategorizedOfferList, nearbyHealthAndBeautyCategorizedOfferList, nearbyOfficeAndBusinessCategorizedOfferList, nearbyServicesAndSubscriptionsCategorizedOfferList]);

    /**
     * Function used to populate the rows containing the nearby offers data.
     *
     * @param type row type to be passed in
     * @param data data to be passed in for the row
     * @param index row index
     *
     * @return a {@link JSX.Element} or an {@link Array} of {@link JSX.Element} representing the
     * React node and/or nodes containing the nearby offers.
     */
    const renderNearbyRowData = useMemo(() => (_type: string | number, data: Offer, index: number): JSX.Element | JSX.Element[] => {
        // flag to determine whether there are any offers shown at all - so we can display the empty message otherwise
        let offersShown = false;

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

        // offer listing
        if (deDuplicatedNearbyOfferList.length !== 0) {
            offersShown = true;
            return physicalLocation !== '' ? (
                <>
                    {
                        index === 0
                            ?
                            <>
                                <View style={{flexDirection: 'column'}}>
                                    <Card style={styles.kitOfferCard}
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
                                          }}>
                                        <Card.Content>
                                            <List.Icon color={'#F2FF5D'}
                                                       icon="chevron-right"
                                                       style={{alignSelf: 'flex-end', top: hp(1.5)}}/>
                                            <View style={{flexDirection: 'row', bottom: hp(1.5)}}>
                                                <Image
                                                    style={styles.kitOfferLogo}
                                                    source={{
                                                        uri: data.brandLogoSm!,
                                                    }}
                                                    placeholder={MoonbeamPlaceholderImage}
                                                    placeholderContentFit={'fill'}
                                                    contentFit={'fill'}
                                                    transition={1000}
                                                    cachePolicy={'none'}
                                                />
                                                <View style={{flexDirection: 'column', bottom: hp(1.5)}}>
                                                    <Text numberOfLines={1}
                                                          style={styles.kitOfferName}>{data.brandDba}</Text>
                                                    <Text numberOfLines={1} style={styles.kitOfferBenefitsView}>
                                                        <Text style={styles.kitOfferBenefit}>
                                                            {data.reward!.type! === RewardType.RewardPercent
                                                                ? `${data.reward!.value}%`
                                                                : `$${data.reward!.value}`}
                                                        </Text>
                                                        {" Off "}
                                                    </Text>
                                                    <Text numberOfLines={1} style={styles.kitOfferDistance}>
                                                        {`${calculatedDistance} miles away`}
                                                    </Text>
                                                </View>
                                            </View>
                                        </Card.Content>
                                    </Card>
                                </View>
                            </>
                            :
                            <Card style={styles.kitOfferCard}
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
                                  }}>
                                <Card.Content>
                                    <List.Icon color={'#F2FF5D'}
                                               icon="chevron-right"
                                               style={{alignSelf: 'flex-end', top: hp(1.5)}}/>
                                    <View style={{flexDirection: 'row', bottom: hp(1.5)}}>
                                        <Image
                                            style={styles.kitOfferLogo}
                                            source={{
                                                uri: data.brandLogoSm!,
                                            }}
                                            placeholder={MoonbeamPlaceholderImage}
                                            placeholderContentFit={'fill'}
                                            contentFit={'fill'}
                                            transition={1000}
                                            cachePolicy={'none'}
                                        />
                                        <View style={{flexDirection: 'column', bottom: hp(1.5)}}>
                                            <Text numberOfLines={1}
                                                  style={styles.kitOfferName}>{data.brandDba}</Text>
                                            <Text numberOfLines={1} style={styles.kitOfferBenefitsView}>
                                                <Text style={styles.kitOfferBenefit}>
                                                    {data.reward!.type! === RewardType.RewardPercent
                                                        ? `${data.reward!.value}%`
                                                        : `$${data.reward!.value}`}
                                                </Text>
                                                {" Off "}
                                            </Text>
                                            <Text numberOfLines={1} style={styles.kitOfferDistance}>
                                                {`${calculatedDistance} miles away`}
                                            </Text>
                                        </View>
                                    </View>
                                </Card.Content>
                            </Card>
                    }
                </>
            ): <></>
        }

        // filtered no offers to be displayed
        if (!offersShown) {
            return (
                <Card style={styles.kitOfferCard}>
                    <Card.Content>
                        <View style={{flexDirection: 'row'}}>
                            <Text
                                style={[styles.kitNoOffersName, {color: '#F2FF5D'}]}>{`No Nearby ${kitName} Offers Available`}</Text>
                        </View>
                    </Card.Content>
                </Card>
            )
        }

        return (<></>);
    }, [nearbyOfferList, deDuplicatedNearbyOfferList]);

    // return the component for the NearbyKitSection page
    return (
        <>
            {
                deDuplicatedNearbyOfferList.length !== 0 && nearbyOfferList.length !== 0 &&
                <View style={[
                    styles.kitOffersView,
                    !nearbyKitListExpanded ? {height: hp(30), top: hp(2)} : {height: hp(100)},
                    onlineKitListExpanded && {display: 'none'}]}>
                    {
                        <>
                            <View style={styles.kitOffersTitleView}>
                                {
                                    nearbyKitListExpanded &&
                                    <Text style={styles.kitOffersTitleMain}>
                                        {`Nearby Offers`}
                                    </Text>
                                }
                                <TouchableOpacity
                                    style={styles.moreButton}
                                    onPress={() => {
                                        console.log('button pressed');
                                        if (!nearbyKitListExpanded) {
                                            // display all nearby loaded in the list
                                            setVerticalListLoading(true);
                                            setIsOnlineKitListExpanded(false);
                                            setIsNearbyKitListExpanded(true);
                                        } else {
                                            setDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(deDuplicatedNearbyOfferList.slice(0, 2)));
                                            setLayoutProvider(new LayoutProvider(
                                                _ => 0,
                                                (_, dim) => {
                                                    dim.width = wp(33);
                                                    dim.height = hp(25);
                                                }
                                            ));
                                            setVerticalListLoading(false);
                                            setNearbyOffersSpinnerShown(false);
                                            setIsNearbyKitListExpanded(false);
                                        }
                                    }}
                                >
                                    <Text
                                        style={styles.moreButtonText}>{nearbyKitListExpanded ? 'See Less' : 'See All'}</Text>
                                </TouchableOpacity>
                            </View>
                            {
                                deDuplicatedNearbyOfferList && nearbyOfferList &&
                                deDuplicatedNearbyOfferList.length !== 0 && nearbyOfferList.length !== 0 && dataProvider !== null && layoutProvider !== null &&
                                <RecyclerListView
                                    // @ts-ignore
                                    ref={nearbyListView}
                                    style={{
                                        width: wp(100),
                                        right: wp(1)
                                    }}
                                    layoutProvider={layoutProvider!}
                                    dataProvider={dataProvider!}
                                    rowRenderer={renderNearbyRowData}
                                    isHorizontal={false}
                                    forceNonDeterministicRendering={true}
                                    renderFooter={() => {
                                        return (
                                            nearbyOffersSpinnerShown && nearbyKitListExpanded ?
                                                <>
                                                    <View
                                                        style={{
                                                            width: wp(100),
                                                            alignSelf: 'center'
                                                        }}/>
                                                    <Card
                                                        style={[styles.loadCard,
                                                            {
                                                                width: wp(100),
                                                                height: hp(10),
                                                                bottom: hp(2)
                                                            }
                                                        ]}>
                                                        <Card.Content>
                                                            <View style={{flexDirection: 'column'}}>
                                                                <View style={{
                                                                    flexDirection: 'row'
                                                                }}>
                                                                    <View>
                                                                        <ActivityIndicator
                                                                            style={{
                                                                                alignSelf: 'center',
                                                                                top: hp(2),
                                                                                left: wp(40)
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

                                        console.log(noNearbyOffersToLoad);

                                        // if there are items to load
                                        if (nearbyKitListExpanded && !noNearbyOffersToLoad && currentActiveKit !== null) {
                                            // set the loader
                                            setNearbyOffersSpinnerShown(true);
                                            // retrieving more nearby offers
                                            switch (currentActiveKit as OfferCategory) {
                                                case OfferCategory.Food:
                                                    const additionalFoodOffersToLoad = await retrieveCategorizedOffersNearby(nearbyFoodCategorizedPageNumber, setNearbyFoodCategorizedPageNumber,
                                                        userInformation, setOffersNearUserLocationFlag, currentUserLocation, setCurrentUserLocation, numberOfNearbyOffers,
                                                        setNumberOfNearbyOffers, currentActiveKit);
                                                    (additionalFoodOffersToLoad === null || additionalFoodOffersToLoad.length === 0) && setNoNearbyFoodCategorizedOffersToLoad(true);
                                                    additionalFoodOffersToLoad !== null && setNearbyFoodCategorizedOfferList(oldNearbyOffers => {
                                                        return [...oldNearbyOffers, ...additionalFoodOffersToLoad]
                                                    });
                                                    break;
                                                case OfferCategory.Retail:
                                                    const additionalRetailOffersToLoad = await retrieveCategorizedOffersNearby(nearbyRetailCategorizedPageNumber, setNearbyRetailCategorizedPageNumber,
                                                        userInformation, setOffersNearUserLocationFlag, currentUserLocation, setCurrentUserLocation, numberOfNearbyOffers,
                                                        setNumberOfNearbyOffers, currentActiveKit);
                                                    (additionalRetailOffersToLoad === null || additionalRetailOffersToLoad.length === 0) && setNoNearbyRetailCategorizedOffersToLoad(true);
                                                    additionalRetailOffersToLoad !== null && setNearbyRetailCategorizedOfferList(oldNearbyOffers => {
                                                        return [...oldNearbyOffers, ...additionalRetailOffersToLoad]
                                                    });
                                                    break;
                                                case OfferCategory.Entertainment:
                                                    const additionalEntertainmentOffersToLoad = await retrieveCategorizedOffersNearby(nearbyEntertainmentCategorizedPageNumber, setNearbyEntertainmentCategorizedPageNumber,
                                                        userInformation, setOffersNearUserLocationFlag, currentUserLocation, setCurrentUserLocation, numberOfNearbyOffers,
                                                        setNumberOfNearbyOffers, currentActiveKit);
                                                    (additionalEntertainmentOffersToLoad === null || additionalEntertainmentOffersToLoad.length === 0) && setNoNearbyEntertainmentCategorizedOffersToLoad(true);
                                                    additionalEntertainmentOffersToLoad !== null && setNearbyEntertainmentCategorizedOfferList(oldNearbyOffers => {
                                                        return [...oldNearbyOffers, ...additionalEntertainmentOffersToLoad]
                                                    });
                                                    break;
                                                case OfferCategory.Electronics:
                                                    const additionalElectronicsOffersToLoad = await retrieveCategorizedOffersNearby(nearbyElectronicsCategorizedPageNumber, setNearbyElectronicsCategorizedPageNumber,
                                                        userInformation, setOffersNearUserLocationFlag, currentUserLocation, setCurrentUserLocation, numberOfNearbyOffers,
                                                        setNumberOfNearbyOffers, currentActiveKit);
                                                    (additionalElectronicsOffersToLoad === null || additionalElectronicsOffersToLoad.length === 0) && setNoNearbyElectronicsCategorizedOffersToLoad(true);
                                                    additionalElectronicsOffersToLoad !== null && setNearbyElectronicsCategorizedOfferList(oldNearbyOffers => {
                                                        return [...oldNearbyOffers, ...additionalElectronicsOffersToLoad]
                                                    });
                                                    break;
                                                case OfferCategory.Home:
                                                    const additionalHomeOffersToLoad = await retrieveCategorizedOffersNearby(nearbyHomeCategorizedPageNumber, setNearbyHomeCategorizedPageNumber,
                                                        userInformation, setOffersNearUserLocationFlag, currentUserLocation, setCurrentUserLocation, numberOfNearbyOffers,
                                                        setNumberOfNearbyOffers, currentActiveKit);
                                                    (additionalHomeOffersToLoad === null || additionalHomeOffersToLoad.length === 0) && setNoNearbyHomeCategorizedOffersToLoad(true);
                                                    additionalHomeOffersToLoad !== null && setNearbyHomeCategorizedOfferList(oldNearbyOffers => {
                                                        return [...oldNearbyOffers, ...additionalHomeOffersToLoad]
                                                    });
                                                    break;
                                                case OfferCategory.HealthAndBeauty:
                                                    const additionalHealthAndBeautyOffersToLoad = await retrieveCategorizedOffersNearby(nearbyHealthAndBeautyCategorizedPageNumber, setNearbyHealthAndBeautyCategorizedPageNumber,
                                                        userInformation, setOffersNearUserLocationFlag, currentUserLocation, setCurrentUserLocation, numberOfNearbyOffers,
                                                        setNumberOfNearbyOffers, currentActiveKit);
                                                    (additionalHealthAndBeautyOffersToLoad === null || additionalHealthAndBeautyOffersToLoad.length === 0) && setNoNearbyHealthAndBeautyCategorizedOffersToLoad(true);
                                                    additionalHealthAndBeautyOffersToLoad !== null && setNearbyHealthAndBeautyCategorizedOfferList(oldNearbyOffers => {
                                                        return [...oldNearbyOffers, ...additionalHealthAndBeautyOffersToLoad]
                                                    });
                                                    break;
                                                case OfferCategory.OfficeAndBusiness:
                                                    const additionalOfficeAndBusinessOffersToLoad = await retrieveCategorizedOffersNearby(nearbyOfficeAndBusinessCategorizedPageNumber, setNearbyOfficeAndBusinessCategorizedPageNumber,
                                                        userInformation, setOffersNearUserLocationFlag, currentUserLocation, setCurrentUserLocation, numberOfNearbyOffers,
                                                        setNumberOfNearbyOffers, currentActiveKit);
                                                    (additionalOfficeAndBusinessOffersToLoad === null || additionalOfficeAndBusinessOffersToLoad.length === 0) && setNoNearbyOfficeAndBusinessCategorizedOffersToLoad(true);
                                                    additionalOfficeAndBusinessOffersToLoad !== null && setNearbyOfficeAndBusinessCategorizedOfferList(oldNearbyOffers => {
                                                        return [...oldNearbyOffers, ...additionalOfficeAndBusinessOffersToLoad]
                                                    });
                                                    break;
                                                case OfferCategory.ServicesAndSubscriptions:
                                                    const additionalServicesAndSubscriptionsOffersToLoad = await retrieveCategorizedOffersNearby(nearbyServicesAndSubscriptionsCategorizedPageNumber, setNearbyServicesAndSubscriptionsCategorizedPageNumber,
                                                        userInformation, setOffersNearUserLocationFlag, currentUserLocation, setCurrentUserLocation, numberOfNearbyOffers,
                                                        setNumberOfNearbyOffers, currentActiveKit);
                                                    (additionalServicesAndSubscriptionsOffersToLoad === null || additionalServicesAndSubscriptionsOffersToLoad.length === 0) && setNoNearbyServicesAndSubscriptionsCategorizedOffersToLoad(true);
                                                    additionalServicesAndSubscriptionsOffersToLoad !== null && setNearbyServicesAndSubscriptionsCategorizedOfferList(oldNearbyOffers => {
                                                        return [...oldNearbyOffers, ...additionalServicesAndSubscriptionsOffersToLoad]
                                                    });
                                                    break;
                                                default:
                                                    break;
                                            }
                                            setVerticalListLoading(true);
                                            // this makes the scrolling seem infinite - we artificially scroll up a little, so we have enough time to load
                                            // @ts-ignore
                                            nearbyListView.current?.scrollToIndex(deDuplicatedNearbyOfferList.length - 2);
                                        } else {
                                            setVerticalListLoading(true);
                                            console.log(`Maximum number of categorized nearby offers reached for category ${currentActiveKit} ${deDuplicatedNearbyOfferList.length}`);
                                        }
                                    }}
                                    scrollViewProps={{
                                        scrollEnabled: nearbyKitListExpanded,
                                        pagingEnabled: "true",
                                        decelerationRate: "fast",
                                        snapToAlignment: "start",
                                        persistentScrollbar: false,
                                        showsVerticalScrollIndicator: false,
                                        showsHorizontalScrollIndicator: false
                                    }}
                                />
                            }
                        </>
                    }
                </View>
            }
        </>
    );
};
