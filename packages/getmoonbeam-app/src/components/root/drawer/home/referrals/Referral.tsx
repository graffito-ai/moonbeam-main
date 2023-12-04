import React, {useEffect, useState} from "react";
import {ReferralProps} from "../../../../../models/props/AppDrawerProps";
import {useRecoilState} from "recoil";
import {appDrawerHeaderShownState, drawerSwipeState} from "../../../../../recoil/AppDrawerAtom";
import {Text, TouchableOpacity, View} from "react-native";
import {Icon} from "@rneui/base";
import {heightPercentageToDP as hp} from "react-native-responsive-screen";
import {styles} from "../../../../../styles/referral.module";
import {Image} from 'expo-image';
// @ts-ignore
import MoonbeamContentReferral from "../../../../../../assets/art/moonbeam-referral-gifts.png";
import {currentUserInformation} from "../../../../../recoil/AuthAtom";
import * as crc32 from 'crc-32';
import Share, {Social} from "react-native-share";

/**
 * Referral component.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const Referral = ({navigation}: ReferralProps) => {
    // constants used to keep track of local component state
    const [userReferralCode, setUserReferralCode] = useState<string>("");

    // constants used to keep track of shared states
    const [userInformation,] = useRecoilState(currentUserInformation);
    const [appDrawerHeaderShown, setAppDrawerHeaderShown] = useRecoilState(appDrawerHeaderShownState);
    const [drawerSwipeEnabled, setDrawerSwipeEnabled] = useRecoilState(drawerSwipeState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        userReferralCode.length === 0 &&
        setUserReferralCode(`${userInformation["family_name"].toUpperCase()}-${userInformation["given_name"].charAt(0).toUpperCase()}-${crc32.str(userInformation["custom:userId"]).toString().split('-')[1]}`);

        if (navigation.getState().index === 4) {
            appDrawerHeaderShown && setAppDrawerHeaderShown(false);
            drawerSwipeEnabled && setDrawerSwipeEnabled(false);
        }
    }, [userReferralCode, appDrawerHeaderShown, drawerSwipeEnabled, navigation.getState()]);

    // return the component for the Referral page
    return (
        <>
            <View style={styles.mainReferralView}>
                <Icon
                    name={'close'}
                    size={hp(4.5)}
                    color={'#FFFFFF'}
                    style={styles.closeIcon}
                    onPress={async () => {
                        setAppDrawerHeaderShown(true);
                        setDrawerSwipeEnabled(true);
                        navigation.goBack();
                    }}
                />
                <View style={styles.contentView}>
                    <Image
                        style={styles.referralMainImage}
                        source={MoonbeamContentReferral}
                        placeholderContentFit={'contain'}
                        contentFit={'contain'}
                        cachePolicy={'memory-disk'}
                    />
                    <View style={styles.referralContentMessageView}>
                        <Text style={styles.referralContentMessageTitle}>
                            {"Win a $100\nAmazon Gift Card"}
                        </Text>
                        <Text style={styles.referralContentMessageTitleValidity}>
                            {"Next drawing on 12/18/2023"}
                        </Text>
                        <Text style={styles.referralContentMessageSubtitle}>
                            {"Share your member code with your friends. Once they sign up for an account and link a card, you will both earn a chance at winning a $100 gift card.\n\n"}
                        </Text>
                    </View>
                    {/*<TouchableOpacity*/}
                    {/*    style={styles.referralCodeView}*/}
                    {/*    onPress={() => {*/}
                    {/*    }}*/}
                    {/*>*/}
                    {/*    <View style={styles.referralCodeInnerView}>*/}
                    {/*        <Icon*/}
                    {/*            name={'content-copy'}*/}
                    {/*            size={hp(3)}*/}
                    {/*            color={'#F2FF5D'}*/}
                    {/*            onPress={async () => {*/}

                    {/*            }}*/}
                    {/*        />*/}
                    {/*        <Text style={styles.referralCode}>*/}
                    {/*            {`${userInformation["family_name"].toUpperCase()}-${userInformation["given_name"].charAt(0).toUpperCase()}-${crc32.str(userInformation["custom:userId"]).toString().split('-')[1]}`}*/}
                    {/*        </Text>*/}
                    {/*    </View>*/}
                    {/*</TouchableOpacity>*/}
                    <TouchableOpacity
                        style={styles.shareButton}
                        onPress={
                            async () => {
                                // share the code with other apps
                                try {
                                    await Share.shareSingle({
                                        message: 'Here\'s my personal invite code for you to join Moonbeam, the first automatic military discounts platform!\nRegister for an account, link your Visa or MasterCard and earn a chance at a $100 Amazon Gift card.\n',
                                        title: 'Fight Bad Guys, Get Money! 🪖🪖🪖',
                                        url: 'https://www.moonbeam.vet',
                                        social: Social.Facebook,
                                        subject: 'Get Moonbeam - The First Automatic Military Discounts Platform',
                                        email: 'Here\'s my personal invite code for you to join Moonbeam, the first automatic military discounts platform!\nRegister for an account, link your Visa or MasterCard and earn a chance at a $100 Amazon Gift card.\n'
                                    });
                                } catch (error) {
                                    console.error(`Error sharing referral code ${error}`);
                                }
                            }
                        }
                    >
                        <Icon
                            name={'ios-share'}
                            size={hp(2.3)}
                            color={'#1e1e21'}
                            onPress={async () => {

                            }}
                        />
                        <Text style={styles.shareButtonText}>Share Code</Text>
                    </TouchableOpacity>
                    <Text style={styles.referralContentMessageSubtitleHighlighted}>
                        Increase your chances of winning with unlimited referrals
                    </Text>
                </View>
            </View>
        </>
    );
}
