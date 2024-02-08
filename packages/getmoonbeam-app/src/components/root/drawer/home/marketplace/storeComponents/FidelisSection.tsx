import React, {useEffect, useMemo, useState} from "react";
import {FidelisPartner, Offer, RewardType} from "@moonbeam/moonbeam-models";
import {Card, Paragraph, Text} from "react-native-paper";
import {styles} from "../../../../../../styles/store.module";
import {TouchableOpacity, View} from "react-native";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {MarketplaceStackParamList} from "../../../../../../models/props/MarketplaceProps";
import {useRecoilState} from "recoil";
import {fidelisPartnerListState, storeOfferState} from "../../../../../../recoil/StoreOfferAtom";
import {Image} from 'expo-image';
// @ts-ignore
import MoonbeamPlaceholderImage from "../../../../../../../assets/art/moonbeam-store-placeholder.png";
// @ts-ignore
import MoonbeamVeteranOwnedBadgeImage from "../../../../../../../assets/art/moonbeam-veteran-owned-badge.png";
import {DataProvider, LayoutProvider, RecyclerListView} from "recyclerlistview";

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
    const [fidelisPartnerList,] = useRecoilState(fidelisPartnerListState);
    const [, setStoreOfferClicked] = useRecoilState(storeOfferState);

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
                // retrieve appropriate offer for partner (everyday)
                let offer: Offer | null = null;
                for (const matchedOffer of data.offers) {
                    if (matchedOffer!.title!.includes("Military Discount") || matchedOffer!.title!.includes("Veterans")) {
                        offer = matchedOffer!;
                        break;
                    }
                }
                const subtitle = offer!.reward!.type! === RewardType.RewardPercent
                    ? `Starting at ${offer!.reward!.value}% Off`
                    : `Starting at $${offer!.reward!.value} Off`;
                return offer !== null ? (
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
                                            <Card.Title
                                                style={{alignSelf: 'flex-start', right: wp(1.5)}}
                                                title={
                                                    <Text style={styles.featuredPartnerCardTitle}>
                                                        {`${data.brandName}\n`}
                                                        <Text style={styles.featuredPartnerCardSubtitle}>
                                                            {subtitle}
                                                        </Text>
                                                    </Text>
                                                }
                                                titleStyle={styles.featuredPartnerCardTitleMain}
                                                titleNumberOfLines={10}/>
                                            <Paragraph
                                                style={styles.featuredPartnerCardParagraph}
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
                                                    // set the clicked offer/partner accordingly
                                                    setStoreOfferClicked(data);
                                                    // @ts-ignore
                                                    props.navigation.navigate('StoreOffer', {});
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
                ) : <></>;
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
