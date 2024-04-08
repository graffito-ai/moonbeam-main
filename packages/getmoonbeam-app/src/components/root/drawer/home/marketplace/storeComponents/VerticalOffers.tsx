import React, {useEffect, useMemo, useRef, useState} from "react";
import {FidelisPartner, LoggingLevel, Offer, OfferStore, RedemptionType, RewardType} from "@moonbeam/moonbeam-models";
import {ActivityIndicator, Card, Divider, FAB, List, Portal, Text} from "react-native-paper";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {styles} from "../../../../../../styles/store.module";
import {useRecoilState, useRecoilValue} from "recoil";
import {
    filteredByDiscountPressedState,
    filteredOffersListState,
    filtersActiveState,
    noClickOnlyOnlineOffersToLoadState,
    noFilteredOffersToLoadState,
    noNearbyOffersToLoadState,
    noOnlineOffersToLoadState,
    searchQueryState,
    showClickOnlyBottomSheetState,
    storeOfferPhysicalLocationState,
    storeOfferState,
    toggleViewPressedState,
    uniqueClickOnlyOnlineOffersListState,
    uniqueFilteredOffersListState,
    uniqueNearbyOffersListState,
    uniqueOnlineOffersListState,
    verticalSectionActiveState
} from "../../../../../../recoil/StoreOfferAtom";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {MarketplaceStackParamList} from "../../../../../../models/props/MarketplaceProps";
import {
    currentUserInformation,
    filteredOffersSpinnerShownState,
    userIsAuthenticatedState
} from "../../../../../../recoil/AuthAtom";
import {Image} from 'expo-image';
// @ts-ignore
import MoonbeamPlaceholderImage from "../../../../../../../assets/art/moonbeam-store-placeholder.png";
import {DataProvider, LayoutProvider, RecyclerListView} from "recyclerlistview";
import {Keyboard, Platform, TouchableOpacity, View} from "react-native";
import {getDistance} from "geolib";
import {currentUserLocationState} from "../../../../../../recoil/RootAtom";
import {logEvent, searchQueryExecute} from "../../../../../../utils/AppSync";
import {Icon} from "@rneui/base";
import {cardLinkingStatusState} from "../../../../../../recoil/AppDrawerAtom";

/**
 * VerticalOffers component.
 *
 * @param props properties to be passed into the component
 * @constructor constructor for the component.
 */
export const VerticalOffers = (props: {
    navigation: NativeStackNavigationProp<MarketplaceStackParamList, 'Store'>,
    fidelisPartnerList: FidelisPartner[],
    retrieveOnlineOffersList: () => Promise<void>,
    retrieveClickOnlineOffersList: () => Promise<void>,
    offersNearUserLocationFlag: boolean,
    retrieveNearbyOffersList: () => Promise<void>,
    retrieveOffersNearLocation: (string) => Promise<void>
}) => {
    // constants used to keep track of local component state
    const nearbyListView = useRef();
    const onlineListView = useRef();
    const clickOnlyOnlineListView = useRef();
    const [verticalListLoading, setVerticalListLoading] = useState<boolean>(false);
    const [clickOnlyOnlineLoadingOffers, setClickOnlyOnlineLoadingOffers] = useState<boolean>(false);
    const [onlineLoadingOffers, setOnlineLoadingOffers] = useState<boolean>(false);
    const [nearbyLoadingOffers, setNearbyLoadingOffers] = useState<boolean>(false);
    const [fidelisDataProvider, setFidelisDataProvider] = useState<DataProvider | null>(null);
    const [fidelisLayoutProvider, setFidelisLayoutProvider] = useState<LayoutProvider | null>(null);
    const [nearbyDataProvider, setNearbyDataProvider] = useState<DataProvider | null>(null);
    const [nearbyLayoutProvider, setNearbyLayoutProvider] = useState<LayoutProvider | null>(null);
    const [onlineDataProvider, setOnlineDataProvider] = useState<DataProvider | null>(null);
    const [onlineLayoutProvider, setOnlineLayoutProvider] = useState<LayoutProvider | null>(null);
    const [clickOnlyOnlineDataProvider, setClickOnlyOnlineDataProvider] = useState<DataProvider | null>(null);
    const [clickOnlyOnlineLayoutProvider, setClickOnlyOnlineLayoutProvider] = useState<LayoutProvider | null>(null);
    const [filteredOffersDataProvider, setFilteredOffersDataProvider] = useState<DataProvider | null>(null);
    const [filteredOffersLayoutProvider, setFilteredOffersLayoutProvider] = useState<LayoutProvider | null>(null);
    // constants used to keep track of shared states
    const [isCardLinked,] = useRecoilState(cardLinkingStatusState);
    const [, setFilteredOffersList] = useRecoilState(filteredOffersListState);
    const [filteredOffersSpinnerShown, setFilteredOffersSpinnerShown] = useRecoilState(filteredOffersSpinnerShownState);
    const [userIsAuthenticated,] = useRecoilState(userIsAuthenticatedState);
    const [currentUserLocation,] = useRecoilState(currentUserLocationState);
    const [filteredByDiscountPressed, setFilteredByDiscountPressed] = useRecoilState(filteredByDiscountPressedState);
    const deDuplicatedFilteredOfferList = useRecoilValue(uniqueFilteredOffersListState);
    const [filtersActive, setAreFiltersActive] = useRecoilState(filtersActiveState);
    const [toggleViewPressed,] = useRecoilState(toggleViewPressedState);
    const [searchQuery, setSearchQuery] = useRecoilState(searchQueryState);
    const [whichVerticalSectionActive,] = useRecoilState(verticalSectionActiveState);
    const [, setStoreOfferPhysicalLocation] = useRecoilState(storeOfferPhysicalLocationState);
    const [noNearbyOffersToLoad,] = useRecoilState(noNearbyOffersToLoadState);
    const [noOnlineOffersToLoad,] = useRecoilState(noOnlineOffersToLoadState);
    const [noFilteredOffersToLoad, setNoFilteredOffersToLoad] = useRecoilState(noFilteredOffersToLoadState);
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
        // if the active section is not the search section, do not show the keyboard
        if (whichVerticalSectionActive !== 'search') {
            // close keyboard if opened
            Keyboard.dismiss();
        }

        // update the list data providers if we are loading more offers accordingly
        if (verticalListLoading) {
            if (whichVerticalSectionActive === 'online') {
                setOnlineDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(deDuplicatedOnlineOfferList));
                setVerticalListLoading(false);
            } else if (whichVerticalSectionActive === 'nearby') {
                setNearbyDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(deDuplicatedNearbyOfferList));
                setVerticalListLoading(false);
            } else if (whichVerticalSectionActive === 'click-only-online') {
                setClickOnlyOnlineDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(deDuplicatedClickOnlyOnlineOfferList));
                setVerticalListLoading(false);
            }
        }
        if (filteredOffersSpinnerShown && deDuplicatedFilteredOfferList.length !== 0) {
            if (whichVerticalSectionActive === 'search') {
                setTimeout(() => {
                    setFilteredOffersSpinnerShown(false);
                    setFilteredOffersDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(deDuplicatedFilteredOfferList));
                }, 200);
            }
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
        // populate the Fidelis offer data provider and list view
        if (deDuplicatedFilteredOfferList.length > 0 && filteredOffersLayoutProvider === null && filteredOffersDataProvider === null) {
            setFilteredOffersDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(deDuplicatedFilteredOfferList));
            setFilteredOffersLayoutProvider(new LayoutProvider(
                _ => 0,
                (_, dim) => {
                    dim.width = wp(100);
                    dim.height = hp(10);
                }
            ));
        }
    }, [props.fidelisPartnerList, searchQuery,
        verticalListLoading, fidelisDataProvider,
        fidelisLayoutProvider, clickOnlyOnlineDataProvider,
        clickOnlyOnlineLayoutProvider, onlineDataProvider,
        filteredOffersLayoutProvider, filteredOffersDataProvider,
        onlineLayoutProvider, nearbyDataProvider, nearbyLayoutProvider,
        deDuplicatedNearbyOfferList, deDuplicatedOnlineOfferList,
        deDuplicatedFilteredOfferList, whichVerticalSectionActive,
        filteredOffersSpinnerShown, deDuplicatedClickOnlyOnlineOfferList, noFilteredOffersToLoad]);

    /**
     * Function used to populate the rows containing the Fidelis offers data.
     *
     * @param type row type to be passed in
     * @param data data to be passed in for the row
     * @param index row index
     *
     * @return a {@link React.JSX.Element} or an {@link Array} of {@link React.JSX.Element} representing the
     * React node and/or nodes containing the Fidelis offers.
     */
    const renderFidelisRowData = useMemo(() => (_type: string | number, data: FidelisPartner): React.JSX.Element | React.JSX.Element[] => {
        // results to be returned
        const results: React.JSX.Element[] = [];

        // flag to determine whether there are any offers shown at all - so we can display the empty message otherwise
        let offersShown = false;

        // offer listing
        if (props.fidelisPartnerList.length !== 0) {
            offersShown = true;

            /**
             * We return a type of card for Fidelis offers nearby (within 50 miles).
             * DO NOT display Fidelis offers that are not nearby.
             *
             * We display all online Fidelis offers.
             */
            let offer: Offer | null = null;
            for (const matchedOffer of data.offers) {
                if (matchedOffer!.title!.includes("Military Discount")) {
                    offer = matchedOffer!;
                    break;
                }
            }
            const subtitle = offer!.reward!.type! === RewardType.RewardPercent
                ? `${offer!.reward!.value}% Off`
                : `$${offer!.reward!.value} Off`;
            if (offer === null) {
                return (<></>);
            } else {
                /**
                 * First we determine if this offer is a Fidelis Nearby offer.
                 *
                 * Get the physical location of this offer alongside its coordinates.
                 */
                let physicalLocation: string = '';
                let storeLatitude: number = 0;
                let storeLongitude: number = 0;

                offer && offer.storeDetails !== undefined && offer.storeDetails !== null && offer.storeDetails!.forEach(store => {
                    /**
                     * retrieve store coordinates if applicable
                     */
                    if (physicalLocation === '' && store !== null && store!.isOnline === false) {
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

                // DO NOT display Fidelis offers that are not nearby (within 50 miles)
                if (physicalLocation !== '' && calculatedDistance <= 50) {
                    results.push(
                        <Card style={styles.verticalOfferCard}
                              onPress={() => {
                                  // reset any filtered offers
                                  setNoFilteredOffersToLoad(false);
                                  setFilteredOffersList([]);

                                  // reset search query
                                  setSearchQuery("");

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
                                  props.navigation.navigate('StoreOffer', {
                                      bottomTabNeedsShowingFlag: true
                                  });
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
                                                uri: offer.brandLogoSm!,
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
                                              style={styles.verticalOfferName}>{offer.brandDba}</Text>
                                        <Text numberOfLines={1} style={styles.verticalOfferBenefits}>
                                            {"Starting at "}
                                            <Text style={styles.verticalOfferBenefit}>
                                                {`${subtitle}`}
                                            </Text>
                                        </Text>
                                        <Text numberOfLines={1} style={styles.verticalOfferDistance}>
                                            {`${calculatedDistance} miles away`}
                                        </Text>
                                    </View>
                                </View>
                            </Card.Content>
                        </Card>
                    );
                } else if (physicalLocation !== '' && calculatedDistance > 50) {
                    // we need this for Android purposes
                    results.push(<View style={{backgroundColor: 'transparent', width: wp(100), height: hp(0)}}></View>);
                } else {
                    results.push(
                        <Card style={styles.verticalOfferCard}
                              onPress={() => {
                                  // reset any filtered offers
                                  setNoFilteredOffersToLoad(false);
                                  setFilteredOffersList([]);

                                  // reset search query
                                  setSearchQuery("");

                                  // set the clicked offer/partner accordingly
                                  setStoreOfferClicked(data);
                                  // @ts-ignore
                                  props.navigation.navigate('StoreOffer', {
                                      bottomTabNeedsShowingFlag: true
                                  });
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
                                            {"Starting at "}
                                            <Text style={styles.verticalOfferBenefit}>
                                                {`${subtitle}`}
                                            </Text>
                                        </Text>
                                    </View>
                                </View>
                            </Card.Content>
                        </Card>
                    );
                }
            }
        }

        // filtered no offers to be displayed
        if (!offersShown) {
            results.push(
                <Card style={styles.verticalOfferCard}>
                    <Card.Content>
                        <View style={{flexDirection: 'row'}}>
                            <Text style={[styles.verticalNoOffersName, {color: '#F2FF5D'}]}>{'No Matched Offers'}</Text>
                        </View>
                    </Card.Content>
                </Card>
            );
        }

        return (
            results
        );
    }, [props.fidelisPartnerList]);

    /**
     * Function used to populate the rows containing the click-only online offers data.
     *
     * @param type row type to be passed in
     * @param data data to be passed in for the row
     * @param index row index
     *
     * @return a {@link React.JSX.Element} or an {@link Array} of {@link React.JSX.Element} representing the
     * React node and/or nodes containing the click-only online offers.
     */
    const renderClickOnlyOnlineRowData = useMemo(() => (_type: string | number, data: Offer): React.JSX.Element | React.JSX.Element[] => {
        // flag to determine whether there are any offers shown at all - so we can display the empty message otherwise
        let offersShown = false;

        // offer listing
        if (deDuplicatedClickOnlyOnlineOfferList.length !== 0) {
            offersShown = true;
            return (
                <>
                    <Card style={styles.verticalOfferCard}
                          onPress={() => {
                              // reset any filtered offers
                              setNoFilteredOffersToLoad(false);
                              setFilteredOffersList([]);

                              // reset search query
                              setSearchQuery("");

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
     * @return a {@link React.JSX.Element} or an {@link Array} of {@link React.JSX.Element} representing the
     * React node and/or nodes containing the online offers.
     */
    const renderOnlineRowData = useMemo(() => (_type: string | number, data: Offer): React.JSX.Element | React.JSX.Element[] => {
        // flag to determine whether there are any offers shown at all - so we can display the empty message otherwise
        let offersShown = false;

        // offer listing
        if (deDuplicatedOnlineOfferList.length !== 0) {
            offersShown = true;
            return (
                <>
                    <Card style={styles.verticalOfferCard}
                          onPress={() => {
                              // reset any filtered offers
                              setNoFilteredOffersToLoad(false);
                              setFilteredOffersList([]);

                              // reset search query
                              setSearchQuery("");

                              // set the clicked offer/partner accordingly
                              setStoreOfferClicked(data);
                              // @ts-ignore
                              props.navigation.navigate('StoreOffer', {
                                  bottomTabNeedsShowingFlag: true
                              });
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
     * Function used to populate the rows containing the filtered offers data.
     *
     * @param type row type to be passed in
     * @param data data to be passed in for the row
     * @param index row index
     *
     * @return a {@link React.JSX.Element} or an {@link Array} of {@link React.JSX.Element} representing the
     * React node and/or nodes containing the filtered offers.
     */
    const renderFilteredRowData = useMemo(() => (_type: string | number, data: Offer, index: number): React.JSX.Element | React.JSX.Element[] => {
        // offer listing
        if (deDuplicatedFilteredOfferList.length !== 0) {
            // get the physical location of this offer alongside its coordinates
            let physicalLocation: string = '';
            let storeLatitude: number = 0;
            let storeLongitude: number = 0;
            // check to see if offer is nearby or online
            let isOnline = true;
            data && data.storeDetails !== undefined && data.storeDetails !== null && data.storeDetails!.forEach(store => {
                const storeDetail = store as OfferStore;
                if (storeDetail.isOnline === false) {
                    isOnline = false;
                }

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
            calculatedDistance = Math.round((calculatedDistance / 1609.34) * 100) / 100;

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
                                                <Text style={styles.verticalOfferBannerName}>{'Filtered Offers'}</Text>
                                                <Text
                                                    style={styles.verticalOfferBannerSubtitleName}>{`Search results for: `}
                                                    <Text style={styles.verticalOfferBannerSubtitleNameHighlighted}>
                                                        {`\'${searchQuery}\'`}
                                                    </Text>
                                                </Text>
                                            </View>
                                        </Card.Content>
                                    </Card>
                                    <Card style={styles.verticalOfferCard}
                                          onPress={() => {
                                              /**
                                               * depending on the type of offer (online, click-only, nearby, Fidelis),
                                               * act accordingly when something is pressed.
                                               */
                                              if (data.redemptionType !== undefined && data.redemptionType !== null) {
                                                  switch (data.redemptionType) {
                                                      case RedemptionType.Click:
                                                          // set the clicked offer/partner accordingly
                                                          setStoreOfferClicked(data);
                                                          // show the click only bottom sheet
                                                          setShowClickOnlyBottomSheet(true);

                                                          break;
                                                      case RedemptionType.All:
                                                      case RedemptionType.Cardlinked:
                                                      case RedemptionType.Mobile:
                                                          // for online offers
                                                          if (isOnline) {
                                                              // set the clicked offer/partner accordingly
                                                              setStoreOfferClicked(data);
                                                              // @ts-ignore
                                                              props.navigation.navigate('StoreOffer', {
                                                                  bottomTabNeedsShowingFlag: true
                                                              });
                                                          }
                                                          // for nearby offers
                                                          else {
                                                              // set the clicked offer/partner accordingly
                                                              setStoreOfferClicked(data);
                                                              // set the clicked offer physical location
                                                              storeLatitude !== 0 && storeLongitude !== 0 && setStoreOfferPhysicalLocation({
                                                                  latitude: storeLatitude,
                                                                  longitude: storeLongitude,
                                                                  latitudeDelta: 0,
                                                                  longitudeDelta: 0,
                                                                  addressAsString: physicalLocation
                                                              });
                                                              // @ts-ignore
                                                              props.navigation.navigate('StoreOffer', {
                                                                  bottomTabNeedsShowingFlag: true
                                                              });
                                                          }
                                                          break;
                                                      default:
                                                          break;
                                                  }
                                              }
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
                                                    {
                                                        currentUserLocation !== null && storeLatitude !== 0 && storeLongitude !== 0 &&
                                                        <Text numberOfLines={1} style={styles.verticalOfferDistance}>
                                                            {`${calculatedDistance} miles away`}
                                                        </Text>
                                                    }
                                                </View>
                                            </View>
                                        </Card.Content>
                                    </Card>
                                </View>
                            </>
                            :
                            (isOnline || (!isOnline && currentUserLocation !== null && storeLatitude !== 0 && storeLongitude !== 0)) ?
                                <Card style={styles.verticalOfferCard}
                                      onPress={() => {
                                          /**
                                           * depending on the type of offer (online, click-only, nearby, Fidelis),
                                           * act accordingly when something is pressed.
                                           */
                                          if (data.redemptionType !== undefined && data.redemptionType !== null) {
                                              switch (data.redemptionType) {
                                                  case RedemptionType.Click:
                                                      // set the clicked offer/partner accordingly
                                                      setStoreOfferClicked(data);
                                                      // show the click only bottom sheet
                                                      setShowClickOnlyBottomSheet(true);

                                                      break;
                                                  case RedemptionType.All:
                                                  case RedemptionType.Cardlinked:
                                                  case RedemptionType.Mobile:
                                                      // check to see if offer is nearby or online
                                                      let isOnline = true;
                                                      if (data.storeDetails !== undefined && data.storeDetails !== null) {
                                                          data.storeDetails.forEach(retrievedStoreDetail => {
                                                              const storeDetail = retrievedStoreDetail as OfferStore;
                                                              if (storeDetail.isOnline === false) {
                                                                  isOnline = false;
                                                              }
                                                          });
                                                      }
                                                      // for online offers
                                                      if (isOnline) {
                                                          // set the clicked offer/partner accordingly
                                                          setStoreOfferClicked(data);
                                                          // @ts-ignore
                                                          props.navigation.navigate('StoreOffer', {
                                                              bottomTabNeedsShowingFlag: true
                                                          });
                                                      }
                                                      // for nearby offers
                                                      else {
                                                          // set the clicked offer/partner accordingly
                                                          setStoreOfferClicked(data);
                                                          // set the clicked offer physical location
                                                          storeLatitude !== 0 && storeLongitude !== 0 && setStoreOfferPhysicalLocation({
                                                              latitude: storeLatitude,
                                                              longitude: storeLongitude,
                                                              latitudeDelta: 0,
                                                              longitudeDelta: 0,
                                                              addressAsString: physicalLocation
                                                          });
                                                          // @ts-ignore
                                                          props.navigation.navigate('StoreOffer', {
                                                              bottomTabNeedsShowingFlag: true
                                                          });
                                                      }
                                                      break;
                                                  default:
                                                      break;
                                              }
                                          }
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
                                                {
                                                    currentUserLocation !== null && storeLatitude !== 0 && storeLongitude !== 0 &&
                                                    <Text numberOfLines={1} style={styles.verticalOfferDistance}>
                                                        {`${calculatedDistance} miles away`}
                                                    </Text>
                                                }
                                            </View>
                                        </View>
                                    </Card.Content>
                                </Card>
                                : <></>
                    }
                </>
            )
        } else {
            return (
                <Card style={styles.verticalOfferCard}>
                    <Card.Content>
                        <View style={{flexDirection: 'row'}}>
                            <Text
                                style={[styles.verticalNoOffersName, {color: '#F2FF5D'}]}>{`No Matched Offers for \'${searchQuery}\'`}</Text>
                        </View>
                    </Card.Content>
                </Card>
            )
        }
    }, [deDuplicatedFilteredOfferList]);

    /**
     * Function used to populate the rows containing the nearby offers data.
     *
     * @param type row type to be passed in
     * @param data data to be passed in for the row
     * @param index row index
     *
     * @return a {@link React.JSX.Element} or an {@link Array} of {@link React.JSX.Element} representing the
     * React node and/or nodes containing the nearby offers.
     */
    const renderNearbyRowData = useMemo(() => (_type: string | number, data: Offer): React.JSX.Element | React.JSX.Element[] => {
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
                    <Card style={styles.verticalOfferCard}
                          onPress={() => {
                              // reset any filtered offers
                              setNoFilteredOffersToLoad(false);
                              setFilteredOffersList([]);

                              // reset search query
                              setSearchQuery("");

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
                              props.navigation.navigate('StoreOffer', {
                                  bottomTabNeedsShowingFlag: true
                              });
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
        const errorMessage = 'Loading more click-only online offers for vertical view.';
        console.log(errorMessage);
        await logEvent(errorMessage, LoggingLevel.Info, userIsAuthenticated);

        // if there are items to load
        if (!noClickOnlyOnlineOffersToLoad) {
            // retrieving more click-only online offers
            await props.retrieveClickOnlineOffersList();
            setVerticalListLoading(true);
            // this makes the scrolling seem infinite - we artificially scroll up a little, so we have enough time to load
            // @ts-ignore
            clickOnlyOnlineListView.current?.scrollToIndex(deDuplicatedClickOnlyOnlineOfferList.length - 2);
        } else {
            const errorMessage = `Maximum number of click-only online offers reached ${deDuplicatedClickOnlyOnlineOfferList.length}`;
            console.log(errorMessage);
            await logEvent(errorMessage, LoggingLevel.Info, userIsAuthenticated);

            setVerticalListLoading(false);
        }
    }

    /**
     * Function used to retrieve/load more online offers.
     */
    const loadMoreOnlineOffers = async (): Promise<void> => {
        const errorMessage = 'Loading more online offers for vertical view.';
        console.log(errorMessage);
        await logEvent(errorMessage, LoggingLevel.Info, userIsAuthenticated);

        // if there are items to load
        if (!noOnlineOffersToLoad) {
            // retrieving more online offers
            await props.retrieveOnlineOffersList();
            setVerticalListLoading(true);
            // this makes the scrolling seem infinite - we artificially scroll up a little, so we have enough time to load
            // @ts-ignore
            onlineListView.current?.scrollToIndex(deDuplicatedOnlineOfferList.length - 2);
        } else {
            const errorMessage = `Maximum number of online offers reached ${deDuplicatedOnlineOfferList.length}`;
            console.log(errorMessage);
            await logEvent(errorMessage, LoggingLevel.Info, userIsAuthenticated);

            setVerticalListLoading(false);
        }
    }

    /**
     * Function used to retrieve/load more nearby offers.
     */
    const loadMoreNearbyOffers = async (): Promise<void> => {
        const errorMessage = 'Loading more nearby offers for vertical view.';
        console.log(errorMessage);
        await logEvent(errorMessage, LoggingLevel.Info, userIsAuthenticated);

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
            const errorMessage = `Maximum number of nearby offers reached ${deDuplicatedNearbyOfferList.length}`;
            console.log(errorMessage);
            await logEvent(errorMessage, LoggingLevel.Info, userIsAuthenticated);

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
                        whichVerticalSectionActive !== 'search' &&
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
                                                // reset any filtered offers
                                                setNoFilteredOffersToLoad(false);
                                                setFilteredOffersList([]);

                                                // reset search query
                                                setSearchQuery("");

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
                        !filteredOffersSpinnerShown ?
                            <>
                                {
                                    <>
                                        {
                                            deDuplicatedClickOnlyOnlineOfferList.length !== 0 && whichVerticalSectionActive === 'click-only-online' &&
                                            clickOnlyOnlineDataProvider !== null && clickOnlyOnlineLayoutProvider !== null &&
                                            <>
                                                {
                                                    isCardLinked &&
                                                    <Card style={styles.verticalOffersBannerCard}>
                                                        <Card.Content>
                                                            <View style={{flexDirection: 'column', bottom: hp(1)}}>
                                                                <Text
                                                                    style={styles.verticalOfferBannerName}>{'Premier Offers'}</Text>
                                                                <Text
                                                                    style={styles.verticalOfferBannerSubtitleName}>{'Only available in the app'}</Text>
                                                            </View>
                                                        </Card.Content>
                                                    </Card>
                                                }
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
                                                        const errorMessage = `End of list reached. Trying to refresh more items.`;
                                                        console.log(errorMessage);
                                                        await logEvent(errorMessage, LoggingLevel.Info, userIsAuthenticated);

                                                        // if there are items to load
                                                        if (!noClickOnlyOnlineOffersToLoad) {
                                                            // set the loader
                                                            setClickOnlyOnlineLoadingOffers(true);
                                                            await loadMoreClickOnlyOnlineOffers();
                                                        } else {
                                                            const errorMessage = `Maximum number of click-only online offers reached ${deDuplicatedClickOnlyOnlineOfferList.length}`;
                                                            console.log(errorMessage);
                                                            await logEvent(errorMessage, LoggingLevel.Info, userIsAuthenticated);

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
                                                {
                                                    isCardLinked &&
                                                    <Card style={styles.verticalOffersBannerCard}>
                                                        <Card.Content>
                                                            <View style={{flexDirection: 'column', bottom: hp(1)}}>
                                                                <Text
                                                                    style={styles.verticalOfferBannerName}>{'Online Offers'}</Text>
                                                                <Text
                                                                    style={styles.verticalOfferBannerSubtitleName}>{'Shop online or through the app'}</Text>
                                                            </View>
                                                        </Card.Content>
                                                    </Card>
                                                }
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
                                                        const errorMessage = `End of list reached. Trying to refresh more items.`;
                                                        console.log(errorMessage);
                                                        await logEvent(errorMessage, LoggingLevel.Info, userIsAuthenticated);

                                                        // if there are items to load
                                                        if (!noOnlineOffersToLoad) {
                                                            // set the loader
                                                            setOnlineLoadingOffers(true);
                                                            await loadMoreOnlineOffers();
                                                        } else {
                                                            const errorMessage = `Maximum number of online offers reached ${deDuplicatedOnlineOfferList.length}`;
                                                            console.log(errorMessage);
                                                            await logEvent(errorMessage, LoggingLevel.Info, userIsAuthenticated);

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
                                            <>
                                                {
                                                    isCardLinked &&
                                                    <Card style={styles.verticalOffersBannerCard}>
                                                        <Card.Content>
                                                            <View style={{flexDirection: 'column', bottom: hp(1)}}>
                                                                <Text
                                                                    style={styles.verticalOfferBannerName}>{'Nearby Offers'}</Text>
                                                                <Text
                                                                    style={styles.verticalOfferBannerSubtitleName}>{'Shop & Dine Nearby'}</Text>
                                                            </View>
                                                        </Card.Content>
                                                    </Card>
                                                }
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
                                                        const errorMessage = `End of list reached. Trying to refresh more items.`;
                                                        console.log(errorMessage);
                                                        await logEvent(errorMessage, LoggingLevel.Info, userIsAuthenticated);

                                                        // if there are items to load
                                                        if (!noNearbyOffersToLoad) {
                                                            // set the loader
                                                            setNearbyLoadingOffers(true);
                                                            await loadMoreNearbyOffers();
                                                        } else {
                                                            const errorMessage = `Maximum number of nearby offers reached ${deDuplicatedNearbyOfferList.length}`;
                                                            console.log(errorMessage);
                                                            await logEvent(errorMessage, LoggingLevel.Info, userIsAuthenticated);

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
                                            </>
                                        }
                                        {
                                            props.fidelisPartnerList.length !== 0 && whichVerticalSectionActive === 'fidelis' &&
                                            fidelisDataProvider !== null && fidelisLayoutProvider !== null &&
                                            <>
                                                {
                                                    isCardLinked &&
                                                    <Card style={styles.verticalOffersBannerCard}>
                                                        <Card.Content>
                                                            <View style={{flexDirection: 'column', bottom: hp(1)}}>
                                                                <Text
                                                                    style={styles.verticalOfferBannerName}>{'Fidelis Offers'}</Text>
                                                                <Text
                                                                    style={styles.verticalOfferBannerSubtitleName}>{'Preferred partners with better discounts'}
                                                                </Text>
                                                            </View>
                                                        </Card.Content>
                                                    </Card>
                                                }
                                                <RecyclerListView
                                                    style={{flex: 1, height: hp(50)}}
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
                                            </>
                                        }
                                        {
                                            (deDuplicatedFilteredOfferList.length !== 0 && whichVerticalSectionActive === 'search' &&
                                                filteredOffersDataProvider !== null && filteredOffersLayoutProvider !== null && !noFilteredOffersToLoad) &&
                                            <RecyclerListView
                                                // @ts-ignore
                                                ref={nearbyListView}
                                                style={{flex: 1, height: hp(50), width: wp(100)}}
                                                layoutProvider={filteredOffersLayoutProvider!}
                                                dataProvider={filteredOffersDataProvider!}
                                                rowRenderer={renderFilteredRowData}
                                                isHorizontal={false}
                                                forceNonDeterministicRendering={true}
                                                renderFooter={() => {
                                                    return (
                                                        filteredOffersSpinnerShown ?
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
                                            deDuplicatedFilteredOfferList.length === 0 && whichVerticalSectionActive === 'search' && noFilteredOffersToLoad &&
                                            <View style={{flexDirection: 'column'}}>
                                                <Card style={styles.verticalOffersBannerCard}>
                                                    <Card.Content>
                                                        <View style={{flexDirection: 'column', bottom: hp(1)}}>
                                                            <Text
                                                                style={styles.verticalOfferBannerName}>{'Filtered Offers'}</Text>
                                                            <Text
                                                                style={styles.verticalOfferBannerSubtitleName}>{`Search results for: `}
                                                                <Text
                                                                    style={styles.verticalOfferBannerSubtitleNameHighlighted}>
                                                                    {`\'${searchQuery}\'`}
                                                                </Text>
                                                            </Text>
                                                        </View>
                                                    </Card.Content>
                                                </Card>
                                                <Card style={styles.verticalOfferCard}>
                                                    <Card.Content>
                                                        <View style={{flexDirection: 'row'}}>
                                                            <Text
                                                                style={[styles.verticalNoOffersName, {color: '#F2FF5D'}]}>{`No Matched Offers`}</Text>
                                                        </View>
                                                    </Card.Content>
                                                </Card>
                                            </View>
                                        }
                                        {
                                            deDuplicatedFilteredOfferList.length === 0 && whichVerticalSectionActive === 'search' && !noFilteredOffersToLoad &&
                                            <View
                                                style={{flexDirection: 'column'}}>
                                                <Card style={[styles.verticalOffersBannerCard, {
                                                    height: hp(100),
                                                    backgroundColor: '#1c1a1f'
                                                }]}>
                                                    <Card.Content>
                                                        <View style={{flexDirection: 'column', bottom: hp(1)}}>
                                                            <Text
                                                                style={styles.verticalOfferBannerName}>{'Search offers'}</Text>
                                                            <Text
                                                                style={styles.verticalOfferBannerSubtitleName}>{'Look for a specific brand or category.'}</Text>
                                                            {
                                                                searchQuery.length === 0 ?
                                                                    <View style={{top: hp(2)}}>
                                                                        <Divider style={styles.searchDivider}/>
                                                                        <TouchableOpacity
                                                                            style={styles.searchSuggestionView}
                                                                            onPress={async () => {
                                                                                // set the search query accordingly
                                                                                setSearchQuery('food');

                                                                                // clean any previous offers
                                                                                setFilteredOffersList([]);

                                                                                // execute the search query
                                                                                setFilteredOffersSpinnerShown(true);
                                                                                const queriedOffers =
                                                                                    (currentUserLocation !== null && currentUserLocation.coords.latitude !== null && currentUserLocation.coords.latitude !== undefined &&
                                                                                        currentUserLocation.coords.longitude !== null && currentUserLocation.coords.longitude !== undefined)
                                                                                        ? await searchQueryExecute('food', currentUserLocation.coords.latitude, currentUserLocation.coords.longitude)
                                                                                        : await searchQueryExecute('food');
                                                                                if (queriedOffers.length == 0) {
                                                                                    setNoFilteredOffersToLoad(true);
                                                                                    setFilteredOffersSpinnerShown(false);
                                                                                } else {
                                                                                    setNoFilteredOffersToLoad(false);
                                                                                    setFilteredOffersList([...queriedOffers]);
                                                                                }

                                                                                // dismiss keyboard
                                                                                Keyboard.dismiss();
                                                                            }}
                                                                        >
                                                                            <Icon name="auto-graph"
                                                                                  type={'material'}
                                                                                  style={styles.searchSuggestionLeftIcon}
                                                                                  size={hp(3.5)}
                                                                                  color={'#F2FF5D'}/>
                                                                            <Text numberOfLines={1}
                                                                                  style={styles.searchSuggestionText}>
                                                                                <Text
                                                                                    style={styles.searchSuggestionTextHighlighted}>
                                                                                    {'\'Food\''}
                                                                                </Text>
                                                                                {` in Categories`}
                                                                            </Text>
                                                                            <Icon name="arrow-right"
                                                                                  type={'octicon'}
                                                                                  style={styles.searchSuggestionRightIcon}
                                                                                  size={hp(3.5)}
                                                                                  color={'#D9D9D9'}/>
                                                                        </TouchableOpacity>
                                                                        <Divider style={styles.searchDivider}/>
                                                                        <Divider style={styles.searchDivider}/>
                                                                        <TouchableOpacity
                                                                            style={styles.searchSuggestionView}
                                                                            onPress={async () => {
                                                                                // set the search query accordingly
                                                                                setSearchQuery('Jack in the Box');

                                                                                // clean any previous offers
                                                                                setFilteredOffersList([]);

                                                                                // execute the search query
                                                                                setFilteredOffersSpinnerShown(true);
                                                                                const queriedOffers =
                                                                                    (currentUserLocation !== null && currentUserLocation.coords.latitude !== null && currentUserLocation.coords.latitude !== undefined &&
                                                                                        currentUserLocation.coords.longitude !== null && currentUserLocation.coords.longitude !== undefined)
                                                                                        ? await searchQueryExecute('Jack in the Box', currentUserLocation.coords.latitude, currentUserLocation.coords.longitude)
                                                                                        : await searchQueryExecute('Jack in the Box');
                                                                                if (queriedOffers.length == 0) {
                                                                                    setNoFilteredOffersToLoad(true);
                                                                                    setFilteredOffersSpinnerShown(false);
                                                                                } else {
                                                                                    setNoFilteredOffersToLoad(false);
                                                                                    setFilteredOffersList([...queriedOffers]);
                                                                                }

                                                                                // dismiss keyboard
                                                                                Keyboard.dismiss();
                                                                            }}
                                                                        >
                                                                            <Icon name="auto-graph"
                                                                                  type={'material'}
                                                                                  style={styles.searchSuggestionLeftIcon}
                                                                                  size={hp(3.5)}
                                                                                  color={'#F2FF5D'}/>
                                                                            <Text numberOfLines={1}
                                                                                  style={styles.searchSuggestionText}>
                                                                                <Text
                                                                                    style={styles.searchSuggestionTextHighlighted}>
                                                                                    {'\'Jack in the Box\''}
                                                                                </Text>
                                                                                {` in Brands`}
                                                                            </Text>
                                                                            <Icon name="arrow-right"
                                                                                  type={'octicon'}
                                                                                  style={styles.searchSuggestionRightIcon}
                                                                                  size={hp(3.5)}
                                                                                  color={'#D9D9D9'}/>
                                                                        </TouchableOpacity>
                                                                        <Divider style={styles.searchDivider}/>
                                                                        <Divider style={styles.searchDivider}/>
                                                                        <TouchableOpacity
                                                                            style={styles.searchSuggestionView}
                                                                            onPress={async () => {
                                                                                // set the search query accordingly
                                                                                setSearchQuery('retail');

                                                                                // clean any previous offers
                                                                                setFilteredOffersList([]);

                                                                                // execute the search query
                                                                                setFilteredOffersSpinnerShown(true);
                                                                                const queriedOffers =
                                                                                    (currentUserLocation !== null && currentUserLocation.coords.latitude !== null && currentUserLocation.coords.latitude !== undefined &&
                                                                                        currentUserLocation.coords.longitude !== null && currentUserLocation.coords.longitude !== undefined)
                                                                                        ? await searchQueryExecute('retail', currentUserLocation.coords.latitude, currentUserLocation.coords.longitude)
                                                                                        : await searchQueryExecute('retail');
                                                                                if (queriedOffers.length == 0) {
                                                                                    setNoFilteredOffersToLoad(true);
                                                                                    setFilteredOffersSpinnerShown(false);
                                                                                } else {
                                                                                    setNoFilteredOffersToLoad(false);
                                                                                    setFilteredOffersList([...queriedOffers]);
                                                                                }

                                                                                // dismiss keyboard
                                                                                Keyboard.dismiss();
                                                                            }}
                                                                        >
                                                                            <Icon name="auto-graph"
                                                                                  type={'material'}
                                                                                  style={styles.searchSuggestionLeftIcon}
                                                                                  size={hp(3.5)}
                                                                                  color={'#F2FF5D'}/>
                                                                            <Text numberOfLines={1}
                                                                                  style={styles.searchSuggestionText}>
                                                                                <Text
                                                                                    style={styles.searchSuggestionTextHighlighted}>
                                                                                    {'\'Retail\''}
                                                                                </Text>
                                                                                {` in Categories`}
                                                                            </Text>
                                                                            <Icon name="arrow-right"
                                                                                  type={'octicon'}
                                                                                  style={styles.searchSuggestionRightIcon}
                                                                                  size={hp(3.5)}
                                                                                  color={'#D9D9D9'}/>
                                                                        </TouchableOpacity>
                                                                        <Divider style={styles.searchDivider}/>
                                                                    </View>
                                                                    :
                                                                    <View style={{top: hp(2)}}>
                                                                        <Divider style={styles.searchDivider}/>
                                                                        <TouchableOpacity
                                                                            style={styles.searchSuggestionView}
                                                                            onPress={async () => {
                                                                                // clean any previous offers
                                                                                setFilteredOffersList([]);

                                                                                // execute the search query
                                                                                setFilteredOffersSpinnerShown(true);
                                                                                const queriedOffers =
                                                                                    (currentUserLocation !== null && currentUserLocation.coords.latitude !== null && currentUserLocation.coords.latitude !== undefined &&
                                                                                        currentUserLocation.coords.longitude !== null && currentUserLocation.coords.longitude !== undefined)
                                                                                        ? await searchQueryExecute(searchQuery, currentUserLocation.coords.latitude, currentUserLocation.coords.longitude)
                                                                                        : await searchQueryExecute(searchQuery);
                                                                                if (queriedOffers.length == 0) {
                                                                                    setNoFilteredOffersToLoad(true);
                                                                                    setFilteredOffersSpinnerShown(false);
                                                                                } else {
                                                                                    setNoFilteredOffersToLoad(false);
                                                                                    setFilteredOffersList([...queriedOffers]);
                                                                                }

                                                                                // dismiss keyboard
                                                                                Keyboard.dismiss();
                                                                            }}
                                                                        >
                                                                            <Icon name="search"
                                                                                  type={'material'}
                                                                                  style={styles.searchSuggestionLeftIcon}
                                                                                  size={hp(3.5)}
                                                                                  color={'#F2FF5D'}/>
                                                                            <Text numberOfLines={1}
                                                                                  style={styles.searchSuggestionTextHighlighted}>
                                                                                <Text
                                                                                    style={styles.searchSuggestionText}>
                                                                                    {'Lookup:  '}
                                                                                </Text>
                                                                                {`\'${searchQuery}\'`}
                                                                            </Text>
                                                                            <Icon name="arrow-right"
                                                                                  type={'octicon'}
                                                                                  style={styles.searchSuggestionRightIcon}
                                                                                  size={hp(3.5)}
                                                                                  color={'#D9D9D9'}/>
                                                                        </TouchableOpacity>
                                                                        <Divider style={styles.searchDivider}/>
                                                                    </View>
                                                            }
                                                        </View>
                                                    </Card.Content>
                                                </Card>
                                            </View>
                                        }
                                    </>
                                }
                            </>
                            : <>
                                <View
                                    style={{width: wp(100), alignSelf: 'center', right: wp(10)}}>
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

                            </>
                    }
                </View>
            }
        </>
    );
};
