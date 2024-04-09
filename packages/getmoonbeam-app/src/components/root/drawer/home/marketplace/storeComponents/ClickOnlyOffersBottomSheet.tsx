import React, {useEffect} from "react";
import {SafeAreaView, Text, TouchableOpacity, View} from "react-native";
import {Image} from 'expo-image';
import {styles} from "../../../../../../styles/clickOnlyOffersBottomSheet.module";
import {useRecoilState} from "recoil";
import {showClickOnlyBottomSheetState, storeOfferState} from "../../../../../../recoil/StoreOfferAtom";
// @ts-ignore
import MoonbeamPlaceholderImage from "../../../../../../../assets/art/moonbeam-store-placeholder.png";
import {Divider} from "@rneui/base";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {MarketplaceStackParamList} from "../../../../../../models/props/MarketplaceProps";
import {widthPercentageToDP as wp} from "react-native-responsive-screen";
import {cardLinkingStatusState} from "../../../../../../recoil/AppDrawerAtom";
// @ts-ignore
import CardLinkingImage from "../../../../../../../assets/art/moonbeam-card-linking.png";
import {
    bottomBarNavigationState,
    bottomTabNeedsShowingState,
    bottomTabShownState
} from "../../../../../../recoil/HomeAtom";


/**
 * ClickOnlyOffersBottomSheet component.
 *
 * @param props component properties to be passed in.
 * @constructor constructor for the component.
 */
export const ClickOnlyOffersBottomSheet = (props: {
    navigation: NativeStackNavigationProp<MarketplaceStackParamList, 'Store'> |
        NativeStackNavigationProp<MarketplaceStackParamList, 'Kit'>
}) => {
    // constants used to keep track of local component state

    // constants used to keep track of shared states
    const [storeOfferClicked,] = useRecoilState(storeOfferState);
    const [isCardLinked,] = useRecoilState(cardLinkingStatusState);
    const [bottomBarNavigation,] = useRecoilState(bottomBarNavigationState);
    const [, setBottomTabShown] = useRecoilState(bottomTabShownState);
    const [, setBottomTabNeedsShowing] = useRecoilState(bottomTabNeedsShowingState);
    const [, setShowClickOnlyBottomSheet] = useRecoilState(showClickOnlyBottomSheetState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
    }, []);

    // return the component for the ClickOnlyOffersBottomSheet, part of the Dashboard page
    return (
        <>
            {
                storeOfferClicked !== null && isCardLinked &&
                <SafeAreaView>
                    <View style={styles.topTitleView}>
                        <View style={styles.brandLogoBackground}>
                            {/*@ts-ignore*/}
                            <Image source={{uri: storeOfferClicked!.brandLogoSm!}}
                                   style={styles.brandLogo}
                                   placeholder={MoonbeamPlaceholderImage}
                                   placeholderContentFit={'contain'}
                                   contentFit={'contain'}
                                   transition={1000}
                                   cachePolicy={'memory-disk'}
                            />
                        </View>
                        <View style={{width: wp(75), alignSelf: 'center'}}>
                            <Text
                                numberOfLines={2}
                                style={styles.topTitle}>
                                {/*@ts-ignore*/}
                                {`How can I redeem this exclusive offer ?`}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.contentView}>
                        <Text
                            numberOfLines={2}
                            style={styles.contentDisclaimerNumber}
                        >
                            {"➊.     "}
                            <Text
                                numberOfLines={2}
                                style={styles.contentDisclaimer}
                            >
                                Offer is only available while shopping in the Moonbeam app.
                            </Text>
                        </Text>
                        <Divider
                            style={[styles.divider]}/>
                        <Text
                            numberOfLines={2}
                            style={styles.contentDisclaimerNumber}
                        >
                            {"➋.    "}
                            <Text
                                numberOfLines={2}
                                style={styles.contentDisclaimer}
                            >
                                You must complete your purchase using your linked card.
                            </Text>
                        </Text>
                        <Divider
                            style={[styles.divider]}/>
                        <Text
                            numberOfLines={2}
                            style={styles.contentDisclaimerNumber}
                        >
                            {"➌.    "}
                            <Text
                                numberOfLines={2}
                                style={styles.contentDisclaimer}
                            >
                                Your offer discount status might take up to 30 days to post.
                            </Text>
                        </Text>

                        <TouchableOpacity
                            style={styles.continueButton}
                            onPress={async () => {
                                // go to the OfferDetails component
                                // @ts-ignore
                                props.navigation.navigate('StoreOffer', {
                                    bottomTabNeedsShowingFlag: true
                                });
                            }}
                        >
                            <Text style={styles.continueButtonContentStyle}>Continue</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            }
            {
                !isCardLinked &&
                <SafeAreaView>
                    <View style={styles.topTitleView}>
                        <View style={styles.unlinkedBrandLogoBackground}>
                            {/*@ts-ignore*/}
                            <Image source={CardLinkingImage}
                                   style={styles.unlinkedBrandLogo}
                                   contentFit={'contain'}
                                   cachePolicy={'memory-disk'}
                            />
                        </View>
                        <View style={{width: wp(75), alignSelf: 'center'}}>
                            <Text
                                numberOfLines={2}
                                style={styles.unlinkedTopTitle}>
                                {/*@ts-ignore*/}
                                {`Link your card to access offers!`}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.unlinkedContentView}>
                        <Text
                            numberOfLines={2}
                            style={styles.contentDisclaimerNumber}
                        >
                            {"➊.     "}
                            <Text
                                numberOfLines={2}
                                style={styles.contentDisclaimer}
                            >
                                Offer details and discounts available once you link your card in the Wallet.
                            </Text>
                        </Text>
                        <Divider
                            style={[styles.divider]}/>
                        <Text
                            numberOfLines={2}
                            style={styles.contentDisclaimerNumber}
                        >
                            {"➋.    "}
                            <Text
                                numberOfLines={2}
                                style={styles.contentDisclaimer}
                            >
                                We do not store your card information. It is encrypted and stored in a Card Vault.
                            </Text>
                        </Text>
                        <Divider
                            style={[styles.divider]}/>
                        <Text
                            numberOfLines={2}
                            style={styles.contentDisclaimerNumber}
                        >
                            {"➌.    "}
                            <Text
                                numberOfLines={2}
                                style={styles.contentDisclaimer}
                            >
                                We currently accept any Visa and Mastercard, debit or credit card.
                            </Text>
                        </Text>
                        <TouchableOpacity
                            style={styles.unlinkedContinueButton}
                            onPress={async () => {
                                setBottomTabShown(true);

                                // show the bottom bar
                                setBottomTabNeedsShowing(true);

                                // go to the Wallet component
                                // @ts-ignore
                                bottomBarNavigation && bottomBarNavigation!.navigate('Cards', {});

                                // hide the bottom sheet
                                setShowClickOnlyBottomSheet(false);
                            }}
                        >
                            <Text style={styles.continueButtonContentStyle}>Link Now</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            }
        </>
    );
}
