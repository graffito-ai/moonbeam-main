import React, {useEffect} from "react";
import {FidelisPartner, Offer, RewardType} from "@moonbeam/moonbeam-models";
import {Card, Paragraph, Text} from "react-native-paper";
import {styles} from "../../../../../../styles/store.module";
import {ScrollView, TouchableOpacity, View} from "react-native";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {MarketplaceStackParamList} from "../../../../../../models/props/MarketplaceProps";
import {useRecoilState} from "recoil";
import {storeOfferState} from "../../../../../../recoil/StoreOfferAtom";
import {Image} from 'expo-image';
// @ts-ignore
import MoonbeamPlaceholderImage from "../../../../../../../assets/art/moonbeam-store-placeholder.png";

/**
 * FidelisSection component.
 *
 * @param props properties to be passed into the component
 * @constructor constructor for the component.
 */
export const FidelisSection = (props: {
    fidelisPartnerList: FidelisPartner[],
    navigation: NativeStackNavigationProp<MarketplaceStackParamList, 'Store'>,
    nearbyOfferList: Offer[],
    areNearbyOffersReady: boolean
}) => {
    // constants used to keep track of shared states
    const [, setStoreOfferClicked] = useRecoilState(storeOfferState);

    /**
     * Function used to populate the Fidelis partners.
     *
     * @return a {@link React.ReactNode} or {@link React.ReactNode[]} representing the
     * React node and/or nodes, representing the Fidelis partners.
     */
    const populateFidelisPartners = (): React.ReactNode | React.ReactNode[] => {
        let results: React.ReactNode[] = [];
        let fidelisPartnerNumber = 0;
        if (props.fidelisPartnerList.length !== 0) {
            for (const fidelisPartner of props.fidelisPartnerList) {
                // retrieve appropriate offer for partner (everyday)
                let offer: Offer | null = null;
                for (const matchedOffer of fidelisPartner.offers) {
                    if (matchedOffer!.title!.includes("Military Discount")) {
                        offer = matchedOffer!;
                        break;
                    }
                }
                const subtitle =
                    offer!.reward!.type! === RewardType.RewardPercent
                        ? `Starting at ${offer!.reward!.value}% Off`
                        : `Starting at $${offer!.reward!.value} Off`;

                offer && results.push(
                    <>
                        <Card
                            style={styles.featuredPartnerCard}>
                            <Card.Content>
                                <View style={{flexDirection: 'column'}}>
                                    <View style={{
                                        flexDirection: 'row',
                                        marginTop: hp(1)
                                    }}>
                                        <View>
                                            <Card.Title
                                                title={
                                                    <Text style={styles.featuredPartnerCardTitle}>
                                                        {`${fidelisPartner.brandName}\n`}
                                                        <Text style={styles.featuredPartnerCardSubtitle}>
                                                            {subtitle}
                                                        </Text>
                                                    </Text>
                                                }
                                                titleStyle={styles.featuredPartnerCardTitleMain}
                                                titleNumberOfLines={10}/>
                                            <TouchableOpacity
                                                style={styles.viewOfferButton}
                                                onPress={() => {
                                                    // set the clicked offer/partner accordingly
                                                    setStoreOfferClicked(fidelisPartner);
                                                    props.navigation.navigate('StoreOffer', {})
                                                }}
                                            >
                                                {/*@ts-ignore*/}
                                                <Text style={styles.viewOfferButtonContent}>
                                                    {fidelisPartner.numberOfOffers === 1 ? 'View Offer' : 'View Offers'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                        <View>
                                            <Image
                                                style={styles.featuredPartnerCardCover}
                                                source={{
                                                    uri: fidelisPartner.offers[0]!.brandLogoSm!
                                                }}
                                                placeholder={MoonbeamPlaceholderImage}
                                                placeholderContentFit={'contain'}
                                                contentFit={'contain'}
                                                transition={1000}
                                                cachePolicy={'memory-disk'}
                                            />
                                        </View>
                                    </View>
                                    <Paragraph
                                        style={styles.featuredPartnerCardParagraph}
                                    >
                                        {fidelisPartner.offers[0]!.brandStubCopy!}
                                    </Paragraph>
                                </View>
                            </Card.Content>
                        </Card>
                        <View
                            style={{width: fidelisPartnerNumber === props.fidelisPartnerList.length - 1 ? wp(10) : wp(5)}}/>

                    </>
                );
                fidelisPartnerNumber += 1;
            }
        }
        return results;
    }

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
    }, []);

    // return the component for the FidelisSection page
    return (
        <>
            <View style={styles.featuredPartnersView}>
                <Text style={styles.featuredPartnersTitleMain}>
                    <Text style={styles.featuredPartnersTitle}>
                        Fidelis Partner Offers
                    </Text>{`   🎖`}️
                </Text>
                <ScrollView
                    style={[styles.featuredPartnersScrollView,
                        props.nearbyOfferList.length === 0 && props.areNearbyOffersReady && {left: -wp(0.5)}]}
                    horizontal={true}
                    decelerationRate={"fast"}
                    snapToInterval={wp(70) + wp(20)}
                    snapToAlignment={"center"}
                    scrollEnabled={true}
                    persistentScrollbar={false}
                    showsHorizontalScrollIndicator={false}>
                    {
                        populateFidelisPartners()
                    }
                </ScrollView>
            </View>
        </>
    );
};
