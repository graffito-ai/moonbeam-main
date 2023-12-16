import React, {useEffect, useMemo, useRef, useState} from "react";
import {FidelisPartner, Offer, RewardType} from "@moonbeam/moonbeam-models";
import {ActivityIndicator, Card, FAB, List, Portal, Text} from "react-native-paper";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {styles} from "../../../../../../styles/store.module";
import {useRecoilState, useRecoilValue} from "recoil";
import {
    filteredByDiscountPressedState,
    filtersActiveState, noClickOnlyOnlineOffersToLoadState,
    noNearbyOffersToLoadState,
    noOnlineOffersToLoadState,
    resetSearchState,
    searchQueryState, showClickOnlyBottomSheetState,
    storeOfferPhysicalLocationState,
    storeOfferState,
    toggleViewPressedState, uniqueClickOnlyOnlineOffersListState,
    uniqueNearbyOffersListState,
    uniqueOnlineOffersListState,
    verticalSectionActiveState
} from "../../../../../../recoil/StoreOfferAtom";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {MarketplaceStackParamList} from "../../../../../../models/props/MarketplaceProps";
import {currentUserInformation} from "../../../../../../recoil/AuthAtom";
import {Image} from 'expo-image';
// @ts-ignore
import MoonbeamPlaceholderImage from "../../../../../../../assets/art/moonbeam-store-placeholder.png";
import {DataProvider, LayoutProvider, RecyclerListView} from "recyclerlistview";
import {Platform, View} from "react-native";
import {getDistance} from "geolib";
import {currentUserLocationState} from "../../../../../../recoil/RootAtom";

/**
 * VerticalOffers component.
 *
 * @param props properties to be passed into the component
 * @constructor constructor for the component.
 */
export const VerticalOffers = (props: {
    navigation: NativeStackNavigationProp<MarketplaceStackParamList, 'Store'>,
    shouldCacheImages: boolean,
    noFilteredOffersAvailable: boolean,
    fidelisPartnerList: FidelisPartner[],
    filteredOffersSpinnerShown: boolean,
    setFilteredOffersSpinnerShown: React.Dispatch<React.SetStateAction<boolean>>,
    retrieveOnlineOffersList: () => Promise<void>,
    retrieveClickOnlineOffersList: () => Promise<void>,
    offersNearUserLocationFlag: boolean,
    retrieveNearbyOffersList: () => Promise<void>,
    retrieveOffersNearLocation: (string) => Promise<void>,
    setNoFilteredOffersAvailable: React.Dispatch<React.SetStateAction<boolean>>
}) => {
    // constants used to keep track of local component state
    const nearbyListView = useRef();
    const onlineListView = useRef();
    const clickOnlyOnlineListView = useRef();
    const [offersMatched, setOffersMatched] = useState<boolean>(false);
    const [clickOnlyOnlineLoadingOffers, setClickOnlyOnlineLoadingOffers] = useState<boolean>(false);
    const [onlineLoadingOffers, setOnlineLoadingOffers] = useState<boolean>(false);
    const [nearbyLoadingOffers, setNearbyLoadingOffers] = useState<boolean>(false);
    const [verticalListLoading, setVerticalListLoading] = useState<boolean>(false);
    const [fidelisDataProvider, setFidelisDataProvider] = useState<DataProvider | null>(null);
    const [fidelisLayoutProvider, setFidelisLayoutProvider] = useState<LayoutProvider | null>(null);
    const [nearbyDataProvider, setNearbyDataProvider] = useState<DataProvider | null>(null);
    const [nearbyLayoutProvider, setNearbyLayoutProvider] = useState<LayoutProvider | null>(null);
    const [onlineDataProvider, setOnlineDataProvider] = useState<DataProvider | null>(null);
    const [onlineLayoutProvider, setOnlineLayoutProvider] = useState<LayoutProvider | null>(null);
    const [clickOnlyOnlineDataProvider, setClickOnlyOnlineDataProvider] = useState<DataProvider | null>(null);
    const [clickOnlyOnlineLayoutProvider, setClickOnlyOnlineLayoutProvider] = useState<LayoutProvider | null>(null);
    // constants used to keep track of shared states
    const [currentUserLocation,] = useRecoilState(currentUserLocationState);
    const [filteredByDiscountPressed, setFilteredByDiscountPressed] = useRecoilState(filteredByDiscountPressedState);
    const [filtersActive, setAreFiltersActive] = useRecoilState(filtersActiveState);
    const [toggleViewPressed,] = useRecoilState(toggleViewPressedState);
    const [searchQuery, setSearchQuery] = useRecoilState(searchQueryState);
    const [whichVerticalSectionActive, setWhichVerticalSectionActive] = useRecoilState(verticalSectionActiveState);
    const [resetSearch, setResetSearch] = useRecoilState(resetSearchState);
    const [, setStoreOfferPhysicalLocation] = useRecoilState(storeOfferPhysicalLocationState);
    const [noNearbyOffersToLoad,] = useRecoilState(noNearbyOffersToLoadState);
    const [noOnlineOffersToLoad,] = useRecoilState(noOnlineOffersToLoadState);
    const [noClickOnlyOnlineOffersToLoad,] = useRecoilState(noClickOnlyOnlineOffersToLoadState);
    const deDuplicatedClickOnlyOnlineOfferList = useRecoilValue(uniqueClickOnlyOnlineOffersListState);
    const deDuplicatedOnlineOfferList = useRecoilValue(uniqueOnlineOffersListState);
    const deDuplicatedNearbyOfferList = useRecoilValue(uniqueNearbyOffersListState);
    const [, setStoreOfferClicked] = useRecoilState(storeOfferState);
    const [userInformation,] = useRecoilState(currentUserInformation);
    const [, setShowClickOnlyBottomSheet] = useRecoilState(showClickOnlyBottomSheetState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // update the list data providers if we are loading more offers accordingly
        if (verticalListLoading) {
            if (whichVerticalSectionActive === 'online') {
                setOnlineDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(deDuplicatedOnlineOfferList));
                setVerticalListLoading(false);
            } else if (whichVerticalSectionActive === 'nearby') {
                setNearbyDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(deDuplicatedNearbyOfferList));
                setVerticalListLoading(false);
            } else if (whichVerticalSectionActive === 'click-only-online') {
                setNearbyDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(deDuplicatedClickOnlyOnlineOfferList));
                setVerticalListLoading(false);
            }
            // setTimeout(() => {
            //     if (whichVerticalSectionActive === 'online') {
            //         setOnlineDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(deDuplicatedOnlineOfferList));
            //         setVerticalListLoading(false);
            //         setOnlineLoadingOffers(false);
            //     } else if (whichVerticalSectionActive === 'nearby') {
            //         setNearbyDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(deDuplicatedNearbyOfferList));
            //         setVerticalListLoading(false);
            //         setNearbyLoadingOffers(false);
            //     }
            // }, whichVerticalSectionActive === 'online' ? 2000 : 3000);
        }

        // populate the click-only online offer data provider and list view
        if (deDuplicatedClickOnlyOnlineOfferList.length > 0 && clickOnlyOnlineLayoutProvider === null && clickOnlyOnlineDataProvider === null) {
            setClickOnlyOnlineDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(deDuplicatedClickOnlyOnlineOfferList));
            setClickOnlyOnlineLayoutProvider(new LayoutProvider(
                _ => 0,
                (_, dim) => {
                    dim.width = wp(100);
                    dim.height = hp(10);
                }
            ));
        }
        // populate the online offer data provider and list view
        if (deDuplicatedOnlineOfferList.length > 0 && onlineLayoutProvider === null && onlineDataProvider === null) {
            setOnlineDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(deDuplicatedOnlineOfferList));
            setOnlineLayoutProvider(new LayoutProvider(
                _ => 0,
                (_, dim) => {
                    dim.width = wp(100);
                    dim.height = hp(10);
                }
            ));
        }
        // populate the nearby offer data provider and list view
        if (deDuplicatedNearbyOfferList.length > 0 && nearbyLayoutProvider === null && nearbyDataProvider === null) {
            setNearbyDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(deDuplicatedNearbyOfferList));
            setNearbyLayoutProvider(new LayoutProvider(
                _ => 0,
                (_, dim) => {
                    dim.width = wp(100);
                    dim.height = hp(10);
                }
            ));
        }
        // populate the Fidelis offer data provider and list view
        if (props.fidelisPartnerList.length > 0 && fidelisLayoutProvider === null && fidelisDataProvider === null) {
            setFidelisDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(props.fidelisPartnerList));
            setFidelisLayoutProvider(new LayoutProvider(
                _ => 0,
                (_, dim) => {
                    dim.width = wp(100);
                    dim.height = hp(10);
                }
            ));
        }
        // handle searches accordingly
        if (searchQuery.length !== 0 && searchQuery.length >= 3) {
            const matchedFidelisPartnerList = props.fidelisPartnerList.filter(partner => partner.brandName.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchedClickOnlyOnlineOfferList = deDuplicatedClickOnlyOnlineOfferList.filter(offer => offer.brandDba !== null && offer.brandDba !== undefined && offer.brandDba.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchedOnlineOfferList = deDuplicatedOnlineOfferList.filter(offer => offer.brandDba !== null && offer.brandDba !== undefined && offer.brandDba.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchedNearbyOfferList = deDuplicatedNearbyOfferList.filter(offer => offer.brandDba !== null && offer.brandDba !== undefined && offer.brandDba.toLowerCase().includes(searchQuery.toLowerCase()));

            if (matchedFidelisPartnerList.length !== 0 && searchQuery.length >= 3 && !offersMatched) {
                setOffersMatched(true);
                setFidelisDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(matchedFidelisPartnerList));
                setWhichVerticalSectionActive('fidelis');
            }
            if (matchedClickOnlyOnlineOfferList.length !== 0 && searchQuery.length >= 3 && !offersMatched) {
                setOffersMatched(true);
                setClickOnlyOnlineDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(matchedClickOnlyOnlineOfferList));
                setWhichVerticalSectionActive('click-only-online');
            }
            if (matchedOnlineOfferList.length !== 0 && searchQuery.length >= 3 && !offersMatched) {
                setOffersMatched(true);
                setOnlineDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(matchedOnlineOfferList));
                setWhichVerticalSectionActive('online');
            }
            if (matchedNearbyOfferList.length !== 0 && searchQuery.length >= 3 && !offersMatched) {
                setOffersMatched(true);
                setNearbyDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(matchedNearbyOfferList));
                setWhichVerticalSectionActive('nearby');
            }
            if (matchedClickOnlyOnlineOfferList.length === 0 && matchedNearbyOfferList.length === 0 && matchedOnlineOfferList.length === 0 && matchedFidelisPartnerList.length === 0 && !offersMatched) {
                props.setNoFilteredOffersAvailable(true);
            }
        }
        // reset searches accordingly
        if (resetSearch) {
            whichVerticalSectionActive === 'online' ?
                setOnlineDataProvider(new DataProvider((r1, r2) => r1 !== r2)
                    .cloneWithRows(deDuplicatedOnlineOfferList))
                :
                whichVerticalSectionActive === 'click-only-online' ?
                    setClickOnlyOnlineDataProvider(new DataProvider((r1, r2) => r1 !== r2)
                        .cloneWithRows(deDuplicatedClickOnlyOnlineOfferList))
                    :
                    whichVerticalSectionActive === 'nearby'
                        ? setNearbyDataProvider(new DataProvider((r1, r2) => r1 !== r2)
                            .cloneWithRows(deDuplicatedNearbyOfferList))
                        : setFidelisDataProvider(new DataProvider((r1, r2) => r1 !== r2)
                            .cloneWithRows(props.fidelisPartnerList))
            setResetSearch(false);
            setOffersMatched(false);
        }
    }, [props.fidelisPartnerList, searchQuery,
        verticalListLoading, offersMatched, resetSearch,
        fidelisDataProvider, fidelisLayoutProvider,
        clickOnlyOnlineDataProvider, clickOnlyOnlineLayoutProvider,
        onlineDataProvider, onlineLayoutProvider,
        nearbyDataProvider, nearbyLayoutProvider,
        deDuplicatedNearbyOfferList, deDuplicatedOnlineOfferList,
        deDuplicatedClickOnlyOnlineOfferList]);

    /**
     * Function used to populate the rows containing the Fidelis offers data.
     *
     * @param type row type to be passed in
     * @param data data to be passed in for the row
     * @param index row index
     *
     * @return a {@link JSX.Element} or an {@link Array} of {@link JSX.Element} representing the
     * React node and/or nodes containing the Fidelis offers.
     */
    const renderFidelisRowData = useMemo(() => (_type: string | number, data: FidelisPartner, index: number): JSX.Element | JSX.Element[] => {
        // flag to determine whether there are any offers shown at all - so we can display the empty message otherwise
        let offersShown = false;

        // offer listing
        if (props.fidelisPartnerList.length !== 0 && !props.noFilteredOffersAvailable) {
            offersShown = true;
            // retrieve appropriate offer for partner (everyday)
            let offer: Offer | null = null;
            for (const matchedOffer of data.offers) {
                if (matchedOffer!.title!.includes("Military Discount")) {
                    offer = matchedOffer!;
                    break;
                }
            }
            return offer ? (
                <>
                    {
                        index === 0
                            ?
                            <>
                                <View style={{flexDirection: 'column'}}>
                                    <Card style={styles.verticalOffersBannerCard}>
                                        <Card.Content>
                                            <View style={{flexDirection: 'column', bottom: hp(1)}}>
                                                <Text style={styles.verticalOfferBannerName}>{'Fidelis Offers'}</Text>
                                                <Text
                                                    style={styles.verticalOfferBannerSubtitleName}>{'Preferred partners with better discounts'}</Text>
                                            </View>
                                        </Card.Content>
                                    </Card>
                                    <Card style={styles.verticalOfferCard}
                                          onPress={() => {
                                              // reset search
                                              setSearchQuery('');
                                              setOffersMatched(false);
                                              setResetSearch(true);

                                              // set the clicked offer/partner accordingly
                                              setStoreOfferClicked(data);
                                              // @ts-ignore
                                              props.navigation.navigate('StoreOffer', {});
                                          }}>
                                        <Card.Content>
                                            <List.Icon color={'#F2FF5D'}
                                                       icon="chevron-right"
                                                       style={{alignSelf: 'flex-end', top: hp(1.5)}}/>
                                            <View style={{flexDirection: 'row', bottom: hp(1.5)}}>
                                                <View style={styles.verticalOfferLogoBackground}>
                                                    <Image
                                                        style={styles.verticalOfferLogo}
                                                        source={{
                                                            uri: offer!.brandLogoSm!,
                                                        }}
                                                        placeholder={MoonbeamPlaceholderImage}
                                                        placeholderContentFit={'contain'}
                                                        contentFit={'contain'}
                                                        transition={1000}
                                                        cachePolicy={'none'}
                                                    />
                                                </View>
                                                <View style={{flexDirection: 'column', bottom: hp(1.5)}}>
                                                    <Text numberOfLines={2}
                                                          style={styles.verticalOfferName}>{data.brandName}</Text>
                                                    <Text numberOfLines={2} style={styles.verticalOfferBenefits}>
                                                        <Text style={styles.verticalOfferBenefit}>
                                                            {offer!.reward!.type! === RewardType.RewardPercent
                                                                ? `${offer!.reward!.value}%`
                                                                : `$${offer!.reward!.value}`}
                                                        </Text>
                                                        {" Off "}
                                                    </Text>
                                                </View>
                                            </View>
                                        </Card.Content>
                                    </Card>
                                </View>
                            </>
                            :
                            <Card style={styles.verticalOfferCard}
                                  onPress={() => {
                                      // reset search
                                      setSearchQuery('');
                                      setOffersMatched(false);
                                      setResetSearch(true);

                                      // set the clicked offer/partner accordingly
                                      setStoreOfferClicked(data);
                                      // @ts-ignore
                                      props.navigation.navigate('StoreOffer', {});
                                  }}>
                                <Card.Content>
                                    <List.Icon color={'#F2FF5D'}
                                               icon="chevron-right"
                                               style={{alignSelf: 'flex-end', top: hp(1.5)}}/>
                                    <View style={{flexDirection: 'row', bottom: hp(1.5)}}>
                                        <View style={styles.verticalOfferLogoBackground}>
                                            <Image
                                                style={styles.verticalOfferLogo}
                                                source={{
                                                    uri: offer!.brandLogoSm!,
                                                }}
                                                placeholder={MoonbeamPlaceholderImage}
                                                placeholderContentFit={'contain'}
                                                contentFit={'contain'}
                                                transition={1000}
                                                cachePolicy={'none'}
                                            />
                                        </View>
                                        <View style={{flexDirection: 'column', bottom: hp(1.5)}}>
                                            <Text numberOfLines={2}
                                                  style={styles.verticalOfferName}>{data.brandName}</Text>
                                            <Text numberOfLines={2} style={styles.verticalOfferBenefits}>
                                                <Text style={styles.verticalOfferBenefit}>
                                                    {offer!.reward!.type! === RewardType.RewardPercent
                                                        ? `${offer!.reward!.value}%`
                                                        : `$${offer!.reward!.value}`}
                                                </Text>
                                                {" Off "}
                                            </Text>
                                        </View>
                                    </View>
                                </Card.Content>
                            </Card>
                    }
                </>
            ) : <></>
        }

        // filtered no offers to be displayed
        if (!offersShown) {
            return (
                <Card style={styles.verticalOfferCard}>
                    <Card.Content>
                        <View style={{flexDirection: 'row'}}>
                            <Text style={[styles.verticalNoOffersName, {color: '#F2FF5D'}]}>{'No Matched Offers'}</Text>
                        </View>
                    </Card.Content>
                </Card>
            )
        }

        return (<></>);
    }, [props.fidelisPartnerList]);

    /**
     * Function used to populate the rows containing the click-only online offers data.
     *
     * @param type row type to be passed in
     * @param data data to be passed in for the row
     * @param index row index
     *
     * @return a {@link JSX.Element} or an {@link Array} of {@link JSX.Element} representing the
     * React node and/or nodes containing the click-only online offers.
     */
    const renderClickOnlyOnlineRowData = useMemo(() => (_type: string | number, data: Offer, index: number): JSX.Element | JSX.Element[] => {
        // flag to determine whether there are any offers shown at all - so we can display the empty message otherwise
        let offersShown = false;

        // offer listing
        if (deDuplicatedClickOnlyOnlineOfferList.length !== 0 && !props.noFilteredOffersAvailable) {
            offersShown = true;
            return (
                <>
                    {
                        index === 0
                            ?
                            <>
                                <View style={{flexDirection: 'column'}}>
                                    <Card style={styles.verticalOffersBannerCard}>
                                        <Card.Content>
                                            <View style={{flexDirection: 'column', bottom: hp(1)}}>
                                                <Text style={styles.verticalOfferBannerName}>{'Premier Offers'}</Text>
                                                <Text
                                                    style={styles.verticalOfferBannerSubtitleName}>{'Only available in the app'}</Text>
                                            </View>
                                        </Card.Content>
                                    </Card>
                                    <Card style={styles.verticalOfferCard}
                                          onPress={() => {
                                              // reset search
                                              setSearchQuery('');
                                              setOffersMatched(false);
                                              setResetSearch(true);

                                              // set the clicked offer/partner accordingly
                                              setStoreOfferClicked(data);
                                              // show the click only bottom sheet
                                              setShowClickOnlyBottomSheet(true);
                                          }}>
                                        <Card.Content>
                                            <List.Icon color={'#F2FF5D'}
                                                       icon="chevron-right"
                                                       style={{alignSelf: 'flex-end', top: hp(1.5)}}/>
                                            <View style={{flexDirection: 'row', bottom: hp(1.5)}}>
                                                <View style={styles.verticalOfferLogoBackground}>
                                                    <Image
                                                        style={styles.verticalOfferLogo}
                                                        source={{
                                                            uri: data.brandLogoSm!,
                                                        }}
                                                        placeholder={MoonbeamPlaceholderImage}
                                                        placeholderContentFit={'contain'}
                                                        contentFit={'contain'}
                                                        transition={1000}
                                                        cachePolicy={'none'}
                                                    />
                                                </View>
                                                <View style={{flexDirection: 'column', bottom: hp(1.5)}}>
                                                    <Text numberOfLines={2}
                                                          style={styles.verticalOfferName}>{data.brandDba}</Text>
                                                    <Text numberOfLines={2} style={styles.verticalOfferBenefits}>
                                                        <Text style={styles.verticalOfferBenefit}>
                                                            {data.reward!.type! === RewardType.RewardPercent
                                                                ? `${data.reward!.value}%`
                                                                : `$${data.reward!.value}`}
                                                        </Text>
                                                        {" Off "}
                                                    </Text>
                                                </View>
                                            </View>
                                        </Card.Content>
                                    </Card>
                                </View>
                            </>
                            :
                            <Card style={styles.verticalOfferCard}
                                  onPress={() => {
                                      // reset search
                                      setSearchQuery('');
                                      setOffersMatched(false);
                                      setResetSearch(true);

                                      // set the clicked offer/partner accordingly
                                      setStoreOfferClicked(data);
                                      // show the click only bottom sheet
                                      setShowClickOnlyBottomSheet(true);
                                  }}>
                                <Card.Content>
                                    <List.Icon color={'#F2FF5D'}
                                               icon="chevron-right"
                                               style={{alignSelf: 'flex-end', top: hp(1.5)}}/>
                                    <View style={{flexDirection: 'row', bottom: hp(1.5)}}>
                                        <View style={styles.verticalOfferLogoBackground}>
                                            <Image
                                                style={styles.verticalOfferLogo}
                                                source={{
                                                    uri: data.brandLogoSm!,
                                                }}
                                                placeholder={MoonbeamPlaceholderImage}
                                                placeholderContentFit={'contain'}
                                                contentFit={'contain'}
                                                transition={1000}
                                                cachePolicy={'none'}
                                            />
                                        </View>
                                        <View style={{flexDirection: 'column', bottom: hp(1.5)}}>
                                            <Text numberOfLines={2}
                                                  style={styles.verticalOfferName}>{data.brandDba}</Text>
                                            <Text numberOfLines={2} style={styles.verticalOfferBenefits}>
                                                <Text style={styles.verticalOfferBenefit}>
                                                    {data.reward!.type! === RewardType.RewardPercent
                                                        ? `${data.reward!.value}%`
                                                        : `$${data.reward!.value}`}
                                                </Text>
                                                {" Off "}
                                            </Text>
                                        </View>
                                    </View>
                                </Card.Content>
                            </Card>
                    }
                </>
            )
        }

        // filtered no offers to be displayed
        if (!offersShown) {
            return (
                <Card style={styles.verticalOfferCard}>
                    <Card.Content>
                        <View style={{flexDirection: 'row'}}>
                            <Text style={[styles.verticalNoOffersName, {color: '#F2FF5D'}]}>{'No Matched Offers'}</Text>
                        </View>
                    </Card.Content>
                </Card>
            )
        }

        return (<></>);
    }, [deDuplicatedClickOnlyOnlineOfferList]);

    /**
     * Function used to populate the rows containing the online offers data.
     *
     * @param type row type to be passed in
     * @param data data to be passed in for the row
     * @param index row index
     *
     * @return a {@link JSX.Element} or an {@link Array} of {@link JSX.Element} representing the
     * React node and/or nodes containing the online offers.
     */
    const renderOnlineRowData = useMemo(() => (_type: string | number, data: Offer, index: number): JSX.Element | JSX.Element[] => {
        // flag to determine whether there are any offers shown at all - so we can display the empty message otherwise
        let offersShown = false;

        // offer listing
        if (deDuplicatedOnlineOfferList.length !== 0 && !props.noFilteredOffersAvailable) {
            offersShown = true;
            return (
                <>
                    {
                        index === 0
                            ?
                            <>
                                <View style={{flexDirection: 'column'}}>
                                    <Card style={styles.verticalOffersBannerCard}>
                                        <Card.Content>
                                            <View style={{flexDirection: 'column', bottom: hp(1)}}>
                                                <Text style={styles.verticalOfferBannerName}>{'Online Offers'}</Text>
                                                <Text
                                                    style={styles.verticalOfferBannerSubtitleName}>{'Shop online or through the app'}</Text>
                                            </View>
                                        </Card.Content>
                                    </Card>
                                    <Card style={styles.verticalOfferCard}
                                          onPress={() => {
                                              // reset search
                                              setSearchQuery('');
                                              setOffersMatched(false);
                                              setResetSearch(true);

                                              // set the clicked offer/partner accordingly
                                              setStoreOfferClicked(data);
                                              // @ts-ignore
                                              props.navigation.navigate('StoreOffer', {});
                                          }}>
                                        <Card.Content>
                                            <List.Icon color={'#F2FF5D'}
                                                       icon="chevron-right"
                                                       style={{alignSelf: 'flex-end', top: hp(1.5)}}/>
                                            <View style={{flexDirection: 'row', bottom: hp(1.5)}}>
                                                <View style={styles.verticalOfferLogoBackground}>
                                                    <Image
                                                        style={styles.verticalOfferLogo}
                                                        source={{
                                                            uri: data.brandLogoSm!,
                                                        }}
                                                        placeholder={MoonbeamPlaceholderImage}
                                                        placeholderContentFit={'contain'}
                                                        contentFit={'contain'}
                                                        transition={1000}
                                                        cachePolicy={'none'}
                                                    />
                                                </View>
                                                <View style={{flexDirection: 'column', bottom: hp(1.5)}}>
                                                    <Text numberOfLines={2}
                                                          style={styles.verticalOfferName}>{data.brandDba}</Text>
                                                    <Text numberOfLines={2} style={styles.verticalOfferBenefits}>
                                                        <Text style={styles.verticalOfferBenefit}>
                                                            {data.reward!.type! === RewardType.RewardPercent
                                                                ? `${data.reward!.value}%`
                                                                : `$${data.reward!.value}`}
                                                        </Text>
                                                        {" Off "}
                                                    </Text>
                                                </View>
                                            </View>
                                        </Card.Content>
                                    </Card>
                                </View>
                            </>
                            :
                            <Card style={styles.verticalOfferCard}
                                  onPress={() => {
                                      // reset search
                                      setSearchQuery('');
                                      setOffersMatched(false);
                                      setResetSearch(true);

                                      // set the clicked offer/partner accordingly
                                      setStoreOfferClicked(data);
                                      // @ts-ignore
                                      props.navigation.navigate('StoreOffer', {});
                                  }}>
                                <Card.Content>
                                    <List.Icon color={'#F2FF5D'}
                                               icon="chevron-right"
                                               style={{alignSelf: 'flex-end', top: hp(1.5)}}/>
                                    <View style={{flexDirection: 'row', bottom: hp(1.5)}}>
                                        <View style={styles.verticalOfferLogoBackground}>
                                            <Image
                                                style={styles.verticalOfferLogo}
                                                source={{
                                                    uri: data.brandLogoSm!,
                                                }}
                                                placeholder={MoonbeamPlaceholderImage}
                                                placeholderContentFit={'contain'}
                                                contentFit={'contain'}
                                                transition={1000}
                                                cachePolicy={'none'}
                                            />
                                        </View>
                                        <View style={{flexDirection: 'column', bottom: hp(1.5)}}>
                                            <Text numberOfLines={2}
                                                  style={styles.verticalOfferName}>{data.brandDba}</Text>
                                            <Text numberOfLines={2} style={styles.verticalOfferBenefits}>
                                                <Text style={styles.verticalOfferBenefit}>
                                                    {data.reward!.type! === RewardType.RewardPercent
                                                        ? `${data.reward!.value}%`
                                                        : `$${data.reward!.value}`}
                                                </Text>
                                                {" Off "}
                                            </Text>
                                        </View>
                                    </View>
                                </Card.Content>
                            </Card>
                    }
                </>
            )
        }

        // filtered no offers to be displayed
        if (!offersShown) {
            return (
                <Card style={styles.verticalOfferCard}>
                    <Card.Content>
                        <View style={{flexDirection: 'row'}}>
                            <Text style={[styles.verticalNoOffersName, {color: '#F2FF5D'}]}>{'No Matched Offers'}</Text>
                        </View>
                    </Card.Content>
                </Card>
            )
        }

        return (<></>);
    }, [deDuplicatedOnlineOfferList]);

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
        if (deDuplicatedNearbyOfferList.length !== 0 && !props.noFilteredOffersAvailable) {
            offersShown = true;
            return physicalLocation !== '' ? (
                <>
                    {
                        index === 0
                            ?
                            <>
                                <View style={{flexDirection: 'column'}}>
                                    <Card style={styles.verticalOffersBannerCard}>
                                        <Card.Content>
                                            <View style={{flexDirection: 'column', bottom: hp(1)}}>
                                                <Text style={styles.verticalOfferBannerName}>{'Nearby Offers'}</Text>
                                                <Text
                                                    style={styles.verticalOfferBannerSubtitleName}>{'Shop & Dine Nearby'}</Text>
                                            </View>
                                        </Card.Content>
                                    </Card>
                                    <Card style={styles.verticalOfferCard}
                                          onPress={() => {
                                              // reset search
                                              setSearchQuery('');
                                              setOffersMatched(false);
                                              setResetSearch(true);

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
                                                <View style={styles.verticalOfferLogoBackground}>
                                                    <Image
                                                        style={styles.verticalOfferLogo}
                                                        source={{
                                                            uri: data.brandLogoSm!,
                                                        }}
                                                        placeholder={MoonbeamPlaceholderImage}
                                                        placeholderContentFit={'contain'}
                                                        contentFit={'contain'}
                                                        transition={1000}
                                                        cachePolicy={'none'}
                                                    />
                                                </View>
                                                <View style={{flexDirection: 'column', bottom: hp(1.5)}}>
                                                    <Text numberOfLines={1}
                                                          style={styles.verticalOfferName}>{data.brandDba}</Text>
                                                    <Text numberOfLines={1} style={styles.verticalOfferBenefits}>
                                                        <Text style={styles.verticalOfferBenefit}>
                                                            {data.reward!.type! === RewardType.RewardPercent
                                                                ? `${data.reward!.value}%`
                                                                : `$${data.reward!.value}`}
                                                        </Text>
                                                        {" Off "}
                                                    </Text>
                                                    <Text numberOfLines={1} style={styles.verticalOfferDistance}>
                                                        {`${calculatedDistance} miles away`}
                                                    </Text>
                                                </View>
                                            </View>
                                        </Card.Content>
                                    </Card>
                                </View>
                            </>
                            :
                            <Card style={styles.verticalOfferCard}
                                  onPress={() => {
                                      // reset search
                                      setSearchQuery('');
                                      setOffersMatched(false);
                                      setResetSearch(true);

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
                                        <View style={styles.verticalOfferLogoBackground}>
                                            <Image
                                                style={styles.verticalOfferLogo}
                                                source={{
                                                    uri: data.brandLogoSm!,
                                                }}
                                                placeholder={MoonbeamPlaceholderImage}
                                                placeholderContentFit={'contain'}
                                                contentFit={'contain'}
                                                transition={1000}
                                                cachePolicy={'none'}
                                            />
                                        </View>
                                        <View style={{flexDirection: 'column', bottom: hp(1.5)}}>
                                            <Text numberOfLines={1}
                                                  style={styles.verticalOfferName}>{data.brandDba}</Text>
                                            <Text numberOfLines={1} style={styles.verticalOfferBenefits}>
                                                <Text style={styles.verticalOfferBenefit}>
                                                    {data.reward!.type! === RewardType.RewardPercent
                                                        ? `${data.reward!.value}%`
                                                        : `$${data.reward!.value}`}
                                                </Text>
                                                {" Off "}
                                            </Text>
                                            <Text numberOfLines={1} style={styles.verticalOfferDistance}>
                                                {`${calculatedDistance} miles away`}
                                            </Text>
                                        </View>
                                    </View>
                                </Card.Content>
                            </Card>
                    }
                </>
            ) : <></>;
        }

        // filtered no offers to be displayed
        if (!offersShown) {
            return (
                <Card style={styles.verticalOfferCard}>
                    <Card.Content>
                        <View style={{flexDirection: 'row'}}>
                            <Text style={[styles.verticalNoOffersName, {color: '#F2FF5D'}]}>{'No Matched Offers'}</Text>
                        </View>
                    </Card.Content>
                </Card>
            )
        }

        return (<></>);
    }, [deDuplicatedNearbyOfferList]);

    /**
     * Function used to retrieve/load more click-only online offers.
     */
    const loadMoreClickOnlyOnlineOffers = async (): Promise<void> => {
        console.log('Loading more click-only online offers for vertical view.');
        // if there are items to load
        if (!noClickOnlyOnlineOffersToLoad) {
            // retrieving more click-only online offers
            await props.retrieveClickOnlineOffersList();
            setVerticalListLoading(true);
            // this makes the scrolling seem infinite - we artificially scroll up a little, so we have enough time to load
            // @ts-ignore
            clickOnlyOnlineListView.current?.scrollToIndex(deDuplicatedClickOnlyOnlineOfferList.length - 2);
        } else {
            console.log(`Maximum number of click-only online offers reached ${deDuplicatedClickOnlyOnlineOfferList.length}`);
            setVerticalListLoading(false);
        }
    }

    /**
     * Function used to retrieve/load more online offers.
     */
    const loadMoreOnlineOffers = async (): Promise<void> => {
        console.log('Loading more online offers for vertical view.');
        // if there are items to load
        if (!noOnlineOffersToLoad) {
            // retrieving more online offers
            await props.retrieveOnlineOffersList();
            setVerticalListLoading(true);
            // this makes the scrolling seem infinite - we artificially scroll up a little, so we have enough time to load
            // @ts-ignore
            onlineListView.current?.scrollToIndex(deDuplicatedOnlineOfferList.length - 2);
        } else {
            console.log(`Maximum number of online offers reached ${deDuplicatedOnlineOfferList.length}`);
            setVerticalListLoading(false);
        }
    }

    /**
     * Function used to retrieve/load more nearby offers.
     */
    const loadMoreNearbyOffers = async (): Promise<void> => {
        console.log('Loading more nearby offers for vertical view.');
        // if there are items to load
        if (!noNearbyOffersToLoad) {
            // retrieving more offers (nearby or near user's location)
            !props.offersNearUserLocationFlag
                ? await props.retrieveNearbyOffersList()
                : await props.retrieveOffersNearLocation(userInformation["address"]["formatted"]);
            setVerticalListLoading(true);
            // this makes the scrolling seem infinite - we artificially scroll up a little, so we have enough time to load
            // @ts-ignore
            nearbyListView.current?.scrollToIndex(deDuplicatedNearbyOfferList.length - 2);
        } else {
            console.log(`Maximum number of nearby offers reached ${deDuplicatedNearbyOfferList.length}`);
            setVerticalListLoading(false);
        }
    }

    // return the component for the Vertical Offers page
    return (
        <>
            {
                toggleViewPressed === 'vertical' &&
                <View style={{flex: 1}}>
                    {
                        <Portal>
                            <FAB.Group
                                fabStyle={{
                                    left: wp(2),
                                    backgroundColor: !filteredByDiscountPressed ? '#FFFFFF' : '#F2FF5D',
                                }}
                                backdropColor={'rgba(44,44,44,0.7)'}
                                open={filtersActive}
                                visible
                                icon={filteredByDiscountPressed ? 'percent' : 'filter'}
                                color={'#313030'}
                                actions={
                                    (!filteredByDiscountPressed ? [
                                        {
                                            icon: 'percent',
                                            color: '#313030',
                                            style: {
                                                backgroundColor: !filteredByDiscountPressed ? '#FFFFFF' : '#F2FF5D',
                                                left: wp(2)
                                            },
                                            labelStyle: {
                                                fontFamily: 'Saira-Bold',
                                                color: '#FFFFFF',
                                            },
                                            size: 'medium',
                                            label: 'Discount\nPercentage',
                                            onPress: () => {
                                                setSearchQuery('');
                                                setOffersMatched(false);

                                                setAreFiltersActive(false);
                                                setFilteredByDiscountPressed(true);

                                                // check for which list we're filtering depending on the active vertical section flag
                                                switch (whichVerticalSectionActive) {
                                                    case "fidelis":
                                                        /**
                                                         * filter the list appropriately
                                                         *
                                                         * first, get the Fidelis offers to filter
                                                         */
                                                        let fidelisPartnersSortedMap: Map<FidelisPartner, number> = new Map<FidelisPartner, number>();
                                                        for (const fidelisPartner of props.fidelisPartnerList) {
                                                            for (const matchedOffer of fidelisPartner.offers) {
                                                                if (matchedOffer!.title!.includes("Military Discount")) {
                                                                    // push the Fidelis Partner and the everyday offer in the map of partners to filter
                                                                    fidelisPartnersSortedMap.set(fidelisPartner, matchedOffer!.reward!.value!);
                                                                }
                                                            }
                                                        }
                                                        fidelisPartnersSortedMap = new Map([...fidelisPartnersSortedMap].sort((a, b) => b[1] - a[1]));
                                                        setFidelisDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(Array.from(fidelisPartnersSortedMap.keys())));
                                                        break;
                                                    case "nearby":
                                                        setNearbyDataProvider(new DataProvider((r1, r2) => r1 !== r2)
                                                            .cloneWithRows(deDuplicatedNearbyOfferList.slice().sort((a, b) => a.reward!.value! > b.reward!.value! ? -1 : a.reward!.value! < b.reward!.value! ? 1 : 0)));
                                                        setAreFiltersActive(false);
                                                        break;
                                                    case "online":
                                                        setOnlineDataProvider(new DataProvider((r1, r2) => r1 !== r2)
                                                            .cloneWithRows(deDuplicatedOnlineOfferList.slice().sort((a, b) => a.reward!.value! > b.reward!.value! ? -1 : a.reward!.value! < b.reward!.value! ? 1 : 0)));
                                                        setAreFiltersActive(false);
                                                        break;
                                                    case "click-only-online":
                                                        setClickOnlyOnlineDataProvider(new DataProvider((r1, r2) => r1 !== r2)
                                                            .cloneWithRows(deDuplicatedClickOnlyOnlineOfferList.slice().sort((a, b) => a.reward!.value! > b.reward!.value! ? -1 : a.reward!.value! < b.reward!.value! ? 1 : 0)));
                                                        setAreFiltersActive(false);
                                                        break;
                                                    default:
                                                        break;
                                                }
                                            },
                                        }
                                    ] : [])
                                }
                                onStateChange={() => {
                                }}
                                onPress={() => {
                                    if (filteredByDiscountPressed) {
                                        setFilteredByDiscountPressed(false);
                                        // check for which list we're filtering depending on the active vertical section flag
                                        switch (whichVerticalSectionActive) {
                                            case "fidelis":
                                                setFidelisDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(props.fidelisPartnerList));
                                                break;
                                            case "nearby":
                                                setNearbyDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(deDuplicatedNearbyOfferList));
                                                break;
                                            case "online":
                                                setOnlineDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(deDuplicatedOnlineOfferList));
                                                break;
                                            case "click-only-online":
                                                setClickOnlyOnlineDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(deDuplicatedClickOnlyOnlineOfferList));
                                                break;
                                            default:
                                                break;
                                        }
                                    } else {
                                        if (filtersActive) {
                                            setAreFiltersActive(false);
                                        }
                                        if (!filtersActive) {
                                            setAreFiltersActive(true);
                                        }
                                    }
                                }}
                            />
                        </Portal>
                    }
                    {
                        !props.filteredOffersSpinnerShown ?
                            <>
                                {
                                    props.noFilteredOffersAvailable ?
                                        <>
                                            <Card style={styles.verticalOfferCard}>
                                                <Card.Content>
                                                    <View style={{flexDirection: 'row'}}>
                                                        <Text
                                                            style={[styles.verticalNoOffersName, {color: '#F2FF5D'}]}>{'No Matched Offers'}</Text>
                                                    </View>
                                                </Card.Content>
                                            </Card>
                                        </>
                                        :
                                        <>
                                            {
                                                deDuplicatedClickOnlyOnlineOfferList.length !== 0 && whichVerticalSectionActive === 'click-only-online' &&
                                                clickOnlyOnlineDataProvider !== null && clickOnlyOnlineLayoutProvider !== null &&
                                                <>
                                                    <RecyclerListView
                                                        // @ts-ignore
                                                        ref={onlineListView}
                                                        style={{width: wp(100)}}
                                                        layoutProvider={clickOnlyOnlineLayoutProvider!}
                                                        dataProvider={clickOnlyOnlineDataProvider!}
                                                        rowRenderer={renderClickOnlyOnlineRowData}
                                                        isHorizontal={false}
                                                        forceNonDeterministicRendering={true}
                                                        renderFooter={() => {
                                                            return (
                                                                verticalListLoading || clickOnlyOnlineLoadingOffers ?
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

                                                            // if there are items to load
                                                            if (!noClickOnlyOnlineOffersToLoad) {
                                                                // set the loader
                                                                setClickOnlyOnlineLoadingOffers(true);
                                                                await loadMoreClickOnlyOnlineOffers();
                                                            } else {
                                                                console.log(`Maximum number of click-only online offers reached ${deDuplicatedClickOnlyOnlineOfferList.length}`);
                                                                setClickOnlyOnlineLoadingOffers(false);
                                                            }
                                                        }}
                                                        scrollViewProps={{
                                                            pagingEnabled: "true",
                                                            decelerationRate: "fast",
                                                            snapToAlignment: "start",
                                                            persistentScrollbar: false,
                                                            showsVerticalScrollIndicator: false,
                                                        }}
                                                    />
                                                </>
                                            }
                                            {
                                                deDuplicatedOnlineOfferList.length !== 0 && whichVerticalSectionActive === 'online' &&
                                                onlineDataProvider !== null && onlineLayoutProvider !== null &&
                                                <>
                                                    <RecyclerListView
                                                        // @ts-ignore
                                                        ref={onlineListView}
                                                        style={{width: wp(100)}}
                                                        layoutProvider={onlineLayoutProvider!}
                                                        dataProvider={onlineDataProvider!}
                                                        rowRenderer={renderOnlineRowData}
                                                        isHorizontal={false}
                                                        forceNonDeterministicRendering={true}
                                                        renderFooter={() => {
                                                            return (
                                                                verticalListLoading || onlineLoadingOffers ?
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

                                                            // if there are items to load
                                                            if (!noOnlineOffersToLoad) {
                                                                // set the loader
                                                                setOnlineLoadingOffers(true);
                                                                await loadMoreOnlineOffers();
                                                            } else {
                                                                console.log(`Maximum number of online offers reached ${deDuplicatedOnlineOfferList.length}`);
                                                                setOnlineLoadingOffers(false);
                                                            }
                                                        }}
                                                        scrollViewProps={{
                                                            pagingEnabled: "true",
                                                            decelerationRate: "fast",
                                                            snapToAlignment: "start",
                                                            persistentScrollbar: false,
                                                            showsVerticalScrollIndicator: false,
                                                        }}
                                                    />
                                                </>
                                            }
                                            {
                                                deDuplicatedNearbyOfferList.length !== 0 && whichVerticalSectionActive === 'nearby' &&
                                                nearbyDataProvider !== null && nearbyLayoutProvider !== null &&
                                                <RecyclerListView
                                                    // @ts-ignore
                                                    ref={nearbyListView}
                                                    style={{flex: 1, height: hp(50), width: wp(100)}}
                                                    layoutProvider={nearbyLayoutProvider!}
                                                    dataProvider={nearbyDataProvider!}
                                                    rowRenderer={renderNearbyRowData}
                                                    isHorizontal={false}
                                                    forceNonDeterministicRendering={true}
                                                    renderFooter={() => {
                                                        return (
                                                            verticalListLoading || nearbyLoadingOffers ?
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

                                                        // if there are items to load
                                                        if (!noNearbyOffersToLoad) {
                                                            // set the loader
                                                            setNearbyLoadingOffers(true);
                                                            await loadMoreNearbyOffers();
                                                        } else {
                                                            console.log(`Maximum number of nearby offers reached ${deDuplicatedNearbyOfferList.length}`);
                                                            setNearbyLoadingOffers(false);
                                                        }
                                                    }}
                                                    scrollViewProps={{
                                                        pagingEnabled: "true",
                                                        decelerationRate: "fast",
                                                        snapToAlignment: "start",
                                                        persistentScrollbar: false,
                                                        showsVerticalScrollIndicator: false,
                                                    }}
                                                />
                                            }
                                            {
                                                props.fidelisPartnerList.length !== 0 && whichVerticalSectionActive === 'fidelis' &&
                                                fidelisDataProvider !== null && fidelisLayoutProvider !== null &&
                                                <RecyclerListView
                                                    style={{flex: 1, height: hp(50), width: wp(100)}}
                                                    layoutProvider={fidelisLayoutProvider!}
                                                    dataProvider={fidelisDataProvider!}
                                                    rowRenderer={renderFidelisRowData}
                                                    isHorizontal={false}
                                                    forceNonDeterministicRendering={true}
                                                    onEndReached={async () => {
                                                    }}
                                                    scrollViewProps={{
                                                        pagingEnabled: "true",
                                                        decelerationRate: "fast",
                                                        snapToAlignment: "start",
                                                        persistentScrollbar: false,
                                                        showsVerticalScrollIndicator: false
                                                    }}
                                                />
                                            }
                                        </>
                                }
                            </>
                            : <>
                                <View
                                    style={{width: wp(100)}}/>
                                <Card
                                    style={[styles.loadCard, {alignSelf: 'center', left: wp(23), top: hp(15)}]}>
                                    <Card.Content>
                                        <View style={{flexDirection: 'column'}}>
                                            <View style={{
                                                flexDirection: 'row'
                                            }}>
                                                <View style={{top: hp(5)}}>
                                                    <ActivityIndicator
                                                        style={{
                                                            top: hp(2),
                                                            left: wp(10)
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
                            </>
                    }
                </View>
            }
        </>
    );
};
