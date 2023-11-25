import React, {useEffect} from "react";
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

/**
 * Referral component.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const Referral = ({navigation}: ReferralProps) => {
    // constants used to keep track of local component state

    // constants used to keep track of shared states
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
        if (navigation.getState().index === 4) {
            appDrawerHeaderShown && setAppDrawerHeaderShown(false);
            drawerSwipeEnabled && setDrawerSwipeEnabled(false);
        }
    }, [appDrawerHeaderShown, drawerSwipeEnabled, navigation.getState()]);


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
                            {"Win a $200\nAmazon Gift Card"}
                        </Text>
                        <Text style={styles.referralContentMessageTitleValidity}>
                            {"offer valid until 12/31/2023"}
                        </Text>
                        <Text style={styles.referralContentMessageSubtitle}>
                            {"Take advantage of your member code, and share it with your friends. Once they sign up for an account and link a card, you will both earn a chance at winning a $200 gift card.\n"}
                            <TouchableOpacity>
                                <Text style={styles.referralContentMessageSubtitleHighlighted}>
                                    Learn More
                                </Text>
                            </TouchableOpacity>
                        </Text>
                    </View>
                </View>
            </View>
        </>
    );
}
