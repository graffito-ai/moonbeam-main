import React, {useEffect, useMemo, useState} from "react";
import {FidelisPartner, Offer, RewardType} from "@moonbeam/moonbeam-models";
import {Card, Paragraph, Text} from "react-native-paper";
import {styles} from "../../../../../../styles/store.module";
import {TouchableOpacity, View} from "react-native";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {MarketplaceStackParamList} from "../../../../../../models/props/MarketplaceProps";
import {useRecoilState} from "recoil";
import {
    fidelisPartnerListState, showClickOnlyBottomSheetState,
    storeOfferPhysicalLocationState,
    storeOfferState
} from "../../../../../../recoil/StoreOfferAtom";
import {Image} from 'expo-image';
// @ts-ignore
import MoonbeamPlaceholderImage from "../../../../../../../assets/art/moonbeam-store-placeholder.png";
// @ts-ignore
import MoonbeamVeteranOwnedBadgeImage from "../../../../../../../assets/art/moonbeam-veteran-owned-badge.png";
import {DataProvider, LayoutProvider, RecyclerListView} from "recyclerlistview";
import {getDistance} from "geolib";
import {currentUserLocationState} from "../../../../../../recoil/RootAtom";
import {cardLinkingStatusState} from "../../../../../../recoil/AppDrawerAtom";
import {BlurView} from "expo-blur";

/**
 * FidelisSection component.
 *
 * @param props properties to be passed into the component
 * @constructor constructor for the component.
 */
export const FidelisSection = (props: {
    navigation: NativeStackNavigationProp<MarketplaceStackParamList, 'Store'>,
    areNearbyOffersReady: boolean
}) => {
    // constants used to keep track of local component state
    const [dataProvider, setDataProvider] = useState<DataProvider | null>(null);
    const [layoutProvider, setLayoutProvider] = useState<LayoutProvider | null>(null);
    // constants used to keep track of shared states
    const [currentUserLocation,] = useRecoilState(currentUserLocationState);
    const [fidelisPartnerList,] = useRecoilState(fidelisPartnerListState);
    const [, setStoreOfferClicked] = useRecoilState(storeOfferState);
    const [, setStoreOfferPhysicalLocation] = useRecoilState(storeOfferPhysicalLocationState);
    const [isCardLinked,] = useRecoilState(cardLinkingStatusState);
    const [, setShowClickOnlyBottomSheet] = useRecoilState(showClickOnlyBottomSheetState);

    /**
     * Function used to populate the rows containing the Fidelis partners data.
     *
     * @param type row type to be passed in
     * @param data data to be passed in for the row
     * @param index row index
     *
     * @return a {@link React.JSX.Element} or an {@link Array} of {@link React.JSX.Element} representing the
     * React node and/or nodes containing the Fidelis partner offers.
     */
        // @ts-ignore
    const renderRowData = useMemo(() => (type: string | number, data: FidelisPartner, index: number): React.JSX.Element | React.JSX.Element[] => {
            if (fidelisPartnerList !== undefined && fidelisPartnerList !== null && fidelisPartnerList.length !== 0) {
                /**
                 * We return a type of card for Fidelis offers nearby (within 50 miles).
                 * DO NOT display Fidelis offers that are not nearby.
                 *
                 * We display all online Fidelis offers.
                 */
                let offer: Offer | null = null;
                for (const matchedOffer of data.offers) {
                    if (matchedOffer!.title!.includes("Military Discount") || matchedOffer!.title!.includes("Veterans")) {
                        offer = matchedOffer!;
                        break;
                    }
                }
                const subtitle = (offer!.reward!.type! === RewardType.RewardPercent
                        ? `Starting at ${offer!.reward!.value}% Off`
                        : `Starting at $${offer!.reward!.value} Off`);
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
                        return (
                            <>
                                <>
                                    <Card
                                        style={styles.featuredPartnerCard}>
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
                                                        {
                                                            isCardLinked &&
                                                            <Card.Title
                                                                style={{alignSelf: 'flex-start', right: wp(1.5)}}
                                                                title={
                                                                    <Text style={styles.featuredPartnerCardTitle}>
                                                                        {`${data.brandName}\n`}
                                                                        <Text
                                                                            style={styles.featuredPartnerCardSubtitle}>
                                                                            {subtitle}
                                                                        </Text>
                                                                    </Text>
                                                                }
                                                                titleStyle={styles.featuredPartnerCardTitleMain}
                                                                titleNumberOfLines={10}/>
                                                        }
                                                        {
                                                            !isCardLinked &&
                                                            <>
                                                                <Paragraph
                                                                    style={[styles.featuredPartnerCardSubtitleUnlinked, {}]}
                                                                >
                                                                    {subtitle}
                                                                </Paragraph>
                                                                <BlurView intensity={20}
                                                                          style={styles.unlinkedFeaturedPartnerCardSubtitle}/>
                                                                <Card.Title
                                                                    style={{alignSelf: 'flex-start', right: wp(1.5)}}
                                                                    title={
                                                                        <Text style={styles.unlinkedFeaturedPartnerCardTitle}>
                                                                            {`${data.brandName}\n`}
                                                                        </Text>
                                                                    }
                                                                    titleStyle={styles.featuredPartnerCardTitleMain}
                                                                    titleNumberOfLines={10}/>
                                                            </>
                                                        }
                                                        <Paragraph
                                                            numberOfLines={5}
                                                            style={ !isCardLinked ? styles.unlinkedFeaturedPartnerCardParagraph : styles.featuredPartnerCardParagraph}
                                                        >
                                                            {data.offers[0]!.brandStubCopy!}
                                                        </Paragraph>
                                                        {
                                                            calculatedDistance !== 0 &&
                                                            <Paragraph
                                                                numberOfLines={1}
                                                                style={!isCardLinked ? styles.unlinkedNearbyOfferCardDistanceParagraph : styles.nearbyOfferCardDistanceParagraph}
                                                            >
                                                                {`📌 ${calculatedDistance} miles away`}
                                                            </Paragraph>
                                                        }
                                                    </View>
                                                    <View style={{
                                                        flexDirection: 'column',
                                                        justifyContent: 'space-between',
                                                        left: wp(2)
                                                    }}>
                                                        <View style={styles.featuredPartnerCardCoverBackground}>
                                                            <Image
                                                                style={styles.featuredPartnerCardCover}
                                                                source={{
                                                                    uri: data.offers[0]!.brandLogoSm!
                                                                }}
                                                                placeholder={MoonbeamPlaceholderImage}
                                                                placeholderContentFit={'contain'}
                                                                contentFit={'contain'}
                                                                transition={1000}
                                                                cachePolicy={'memory-disk'}
                                                            />
                                                        </View>
                                                        <TouchableOpacity
                                                            style={styles.viewOfferButton}
                                                            onPress={() => {
                                                                /**
                                                                 * if the user is card linked, then go to the appropriate offer, depending on the offer
                                                                 * displayed, otherwise, display the click only bottom sheet but with the appropriate
                                                                 * params to essentially highlight that offers cannot be viewed without a linked card.
                                                                 */
                                                                if (!isCardLinked) {
                                                                    // show the click only bottom sheet
                                                                    setShowClickOnlyBottomSheet(true);
                                                                } else {
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
                                                                }
                                                            }}
                                                        >
                                                            {/*@ts-ignore*/}
                                                            <Text style={styles.viewOfferButtonContent}>
                                                                {data.numberOfOffers === 1 ? 'View Offer' : 'View Offers'}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                                {
                                                    data.veteranOwned &&
                                                    <Image
                                                        style={styles.veteranOwnedBadge}
                                                        source={MoonbeamVeteranOwnedBadgeImage}
                                                        placeholder={MoonbeamVeteranOwnedBadgeImage}
                                                        placeholderContentFit={'contain'}
                                                        contentFit={'contain'}
                                                        transition={1000}
                                                        cachePolicy={'memory-disk'}
                                                    />
                                                }
                                            </View>
                                        </Card.Content>
                                    </Card>
                                </>
                            </>
                        );
                    } else if (physicalLocation !== '' && calculatedDistance > 50) {
                        // we need this for Android purposes
                        return (<View style={{backgroundColor: 'transparent', width: wp(0), height: hp(30)}}></View>);
                    } else {
                        return (
                            <>
                                <Card
                                    style={styles.featuredPartnerCard}>
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
                                                    {
                                                        isCardLinked &&
                                                        <Card.Title
                                                            style={{alignSelf: 'flex-start', right: wp(1.5)}}
                                                            title={
                                                                <Text style={styles.featuredPartnerCardTitle}>
                                                                    {`${data.brandName}\n`}
                                                                    <Text
                                                                        style={styles.featuredPartnerCardSubtitle}>
                                                                        {subtitle}
                                                                    </Text>
                                                                </Text>
                                                            }
                                                            titleStyle={styles.featuredPartnerCardTitleMain}
                                                            titleNumberOfLines={10}/>
                                                    }
                                                    {
                                                        !isCardLinked &&
                                                        <>
                                                            <Paragraph
                                                                style={[styles.featuredPartnerCardSubtitleUnlinked, {}]}
                                                            >
                                                                {subtitle}
                                                            </Paragraph>
                                                            <BlurView intensity={20}
                                                                      style={styles.unlinkedFeaturedPartnerCardSubtitle}/>
                                                            <Card.Title
                                                                style={{alignSelf: 'flex-start', right: wp(1.5)}}
                                                                title={
                                                                    <Text style={styles.unlinkedFeaturedPartnerCardTitle}>
                                                                        {`${data.brandName}\n`}
                                                                    </Text>
                                                                }
                                                                titleStyle={styles.featuredPartnerCardTitleMain}
                                                                titleNumberOfLines={10}/>
                                                        </>
                                                    }
                                                    <Paragraph
                                                        style={ !isCardLinked ? styles.unlinkedFeaturedPartnerCardParagraph : styles.featuredPartnerCardParagraph}
                                                    >
                                                        {data.offers[0]!.brandStubCopy!}
                                                    </Paragraph>
                                                </View>
                                                <View style={{
                                                    flexDirection: 'column',
                                                    justifyContent: 'space-between',
                                                    left: wp(2)
                                                }}>
                                                    <View style={styles.featuredPartnerCardCoverBackground}>
                                                        <Image
                                                            style={styles.featuredPartnerCardCover}
                                                            source={{
                                                                uri: data.offers[0]!.brandLogoSm!
                                                            }}
                                                            placeholder={MoonbeamPlaceholderImage}
                                                            placeholderContentFit={'contain'}
                                                            contentFit={'contain'}
                                                            transition={1000}
                                                            cachePolicy={'memory-disk'}
                                                        />
                                                    </View>
                                                    <TouchableOpacity
                                                        style={styles.viewOfferButton}
                                                        onPress={() => {
                                                            /**
                                                             * if the user is card linked, then go to the appropriate offer, depending on the offer
                                                             * displayed, otherwise, display the click only bottom sheet but with the appropriate
                                                             * params to essentially highlight that offers cannot be viewed without a linked card.
                                                             */
                                                            if (!isCardLinked) {
                                                                // show the click only bottom sheet
                                                                setShowClickOnlyBottomSheet(true);
                                                            } else {
                                                                // set the clicked offer/partner accordingly
                                                                setStoreOfferClicked(data);
                                                                // @ts-ignore
                                                                props.navigation.navigate('StoreOffer', {
                                                                    bottomTabNeedsShowingFlag: true
                                                                });
                                                            }
                                                        }}
                                                    >
                                                        {/*@ts-ignore*/}
                                                        <Text style={styles.viewOfferButtonContent}>
                                                            {data.numberOfOffers === 1 ? 'View Offer' : 'View Offers'}
                                                        </Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                            {
                                                data.veteranOwned &&
                                                <Image
                                                    style={!isCardLinked ? styles.unlinkedVeteranOwnedBadge : styles.veteranOwnedBadge}
                                                    source={MoonbeamVeteranOwnedBadgeImage}
                                                    placeholder={MoonbeamVeteranOwnedBadgeImage}
                                                    placeholderContentFit={'contain'}
                                                    contentFit={'contain'}
                                                    transition={1000}
                                                    cachePolicy={'memory-disk'}
                                                />
                                            }
                                        </View>
                                    </Card.Content>
                                </Card>
                            </>
                        );
                    }
                }
            } else {
                return (<></>);
            }
        }, [fidelisPartnerList]);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        if (fidelisPartnerList !== undefined && fidelisPartnerList !== null &&
            fidelisPartnerList.length > 0 && layoutProvider === null && dataProvider === null) {
            setDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(fidelisPartnerList));
            setLayoutProvider(new LayoutProvider(
                _ => 0,
                (_, dim) => {
                    dim.width = wp(85);
                    dim.height = hp(30);
                }
            ));
        }
    }, [dataProvider, layoutProvider, fidelisPartnerList]);

    // return the component for the FidelisSection page
    return (
        <>
            <View style={styles.featuredPartnersView}>
                <View style={styles.featuredPartnerTitleView}>
                    <Text style={styles.featuredPartnersTitleMain}>
                        <Text style={styles.featuredPartnersTitle}>
                            Fidelis Partner Offers
                        </Text>
                        {/*{`   🎖`}️*/}
                    </Text>
                    <Text
                        style={[styles.featuredPartnersTitleSub, {left: wp(6)}]}>
                        {`Better discounts from exclusive brands`}
                    </Text>
                </View>
                {
                    dataProvider !== null && layoutProvider !== null &&
                    <RecyclerListView
                        style={styles.featuredPartnersScrollView}
                        layoutProvider={layoutProvider!}
                        dataProvider={dataProvider!}
                        rowRenderer={renderRowData}
                        isHorizontal={true}
                        forceNonDeterministicRendering={true}
                        scrollViewProps={{
                            decelerationRate: "fast",
                            snapToInterval: wp(90),
                            snapToAlignment: "center",
                            persistentScrollbar: false,
                            showsHorizontalScrollIndicator: false
                        }}
                    />
                }
            </View>
        </>
    );
};
