import {HomeReferralProps} from "../models/HomeStackProps";
import React, {useEffect, useState} from "react";
import {Image, ImageBackground, SafeAreaView, Share, View} from "react-native";
import {commonStyles} from "../styles/common.module";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {Button, Text} from "react-native-paper";
import {styles} from "../styles/homeReferral.module";
// @ts-ignore
import FriendReferral from '../../assets/refer-friend.png';
import {Auth} from "aws-amplify";
import * as Linking from "expo-linking";

/**
 * Home Referral component.
 */
export const HomeReferral = ({}: HomeReferralProps) => {
    // state driven key-value pairs for UI related elements

    // state driven key-value pairs for any specific data values
    const [currentUserName, setCurrentUserName] = useState<string>();

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        Auth.currentUserInfo().then((userInfo) => {
            setCurrentUserName(userInfo.attributes["name"]);
        });
    }, []);

    /**
     * Function used to be trigger once a user presses on the `Share Invite` button.
     */
    const shareInviteAction = async () => {
        try {
            const result = await Share.share({
                message:
                    `${currentUserName} is inviting you to join the Moonbeam Alpha card program, specifically tailored for veterans like you.\nA new member reward of 10,000 Points is waiting for you, once you get the card. ${Linking.createURL('/')}signup`,
            });
            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // shared with activity type of result.activityType
                } else {
                    // shared
                }
            } else if (result.action === Share.dismissedAction) {
                // dismissed
            }
        } catch (error: any) {
            // implement modal for error
        }
    }

    return (
        <SafeAreaView style={[commonStyles.rowContainer, commonStyles.androidSafeArea]}>
            <KeyboardAwareScrollView
                enableOnAndroid={true}
                scrollEnabled={true}
                persistentScrollbar={false}
                showsHorizontalScrollIndicator={false}
                keyboardShouldPersistTaps={'handled'}>
                <ImageBackground
                    style={commonStyles.image}
                    imageStyle={{
                        resizeMode: 'stretch'
                    }}
                    source={require('../../assets/forgot-password-background.png')}>
                    <View style={styles.mainView}>
                        <View style={styles.messageView}>
                            <Text style={styles.messageTitle}>Refer a Friend</Text>
                            <Text style={styles.messageSubtitle}>in order to earn 10,000 Points</Text>
                        </View>
                        <View style={{marginTop: '-30%'}}>
                            <Image source={FriendReferral} style={styles.referralArt}></Image>
                        </View>
                        <View style={styles.messageView}>
                            <Text style={styles.messageFooterTitle}>You have unlimited invites</Text>
                            <Text style={styles.messageFooterSubtitle}>Alpha card approval is required for each invite,
                                in order for you to earn the Points.</Text>
                        </View>
                        <Button
                            onPress={async () => {
                                await shareInviteAction()
                            }}
                            uppercase={false}
                            style={styles.referButton}
                            textColor={"#f2f2f2"}
                            buttonColor={"#2A3779"}
                            mode="outlined"
                            labelStyle={{fontSize: 18}}
                            icon={"share"}>
                            Share Invite
                        </Button>
                    </View>
                </ImageBackground>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}
