import React, {useEffect} from "react";
import {SafeAreaView, Text, TouchableOpacity, View} from "react-native";
import {Image} from 'expo-image';
import {styles} from "../../../../../../styles/clickOnlyOffersBottomSheet.module";
import {useRecoilState} from "recoil";
import {storeOfferState} from "../../../../../../recoil/StoreOfferAtom";
// @ts-ignore
import MoonbeamPlaceholderImage from "../../../../../../../assets/art/moonbeam-store-placeholder.png";
import {Divider} from "@rneui/base";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {MarketplaceStackParamList} from "../../../../../../models/props/MarketplaceProps";
import {widthPercentageToDP as wp} from "react-native-responsive-screen";


/**
 * ClickOnlyOffersBottomSheet component.
 *
 * @param props component properties to be passed in.
 * @constructor constructor for the component.
 */
export const ClickOnlyOffersBottomSheet = (props: {
    navigation: NativeStackNavigationProp<MarketplaceStackParamList, 'Store'> |
        NativeStackNavigationProp<MarketplaceStackParamList, 'Kit'>,
}) => {
    // constants used to keep track of local component state

    // constants used to keep track of shared states
    const [storeOfferClicked,] = useRecoilState(storeOfferState);


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
                storeOfferClicked !== null &&
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
                                props.navigation.navigate('StoreOffer', {});
                            }}
                        >
                            <Text style={styles.continueButtonContentStyle}>Continue</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            }
        </>
    );
}
