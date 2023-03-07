import 'react-native-get-random-values';
import {HomeReferralProps} from "../models/HomeStackProps";
import React, {useEffect, useState} from "react";
import {Image, ImageBackground, SafeAreaView, Share, View} from "react-native";
import {commonStyles} from "../styles/common.module";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {Button, Modal, Portal, Text} from "react-native-paper";
import {styles} from "../styles/homeReferral.module";
// @ts-ignore
import FriendReferral from '../../assets/refer-friend.png';
import {API, graphqlOperation} from "aws-amplify";
import * as Linking from "expo-linking";
import {v4 as uuidv4} from 'uuid';
import {createReferral, OfferType, ReferralStatus} from '@moonbeam/moonbeam-models';

/**
 * Home Referral component.
 */
export const HomeReferral = ({navigation, route}: HomeReferralProps) => {
    // state driven key-value pairs for UI related elements
    const [referralModalVisible, setReferralModalVisible] = useState<boolean>(false);
    const [isErrorModal, setIsErrorModal] = useState<boolean>(false);
    const [modalMessage, setModalMessage] = useState<string>("");

    // state driven key-value pairs for any specific data values
    const [currentUserName, setCurrentUserName] = useState<string>();
    const [currentUserEmail, setCurrentUserEmail] = useState<string>();

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        setCurrentUserEmail(route.params.currentUserInformation["email"].toLowerCase());
        setCurrentUserName(route.params.currentUserInformation["name"]);
    }, []);

    /**
     * Function used to be trigger once a user presses on the `Share Invite` button.
     *
     * @param referralId the unique id of the referral
     */
    const shareInviteAction = async (referralId: string) => {
        try {
            const result = await Share.share({
                message:
                    `${currentUserName} is inviting you to join the Moonbeam Alpha card program, specifically tailored for veterans like you.\nA new member reward of 10,000 Points is waiting for you, once you get approved for the card.\nFollow the link below to continue:\n\n${Linking.createURL('/')}signup/${referralId}`,
            });
            if (result.action === Share.sharedAction) {
                try {
                    // create a timestamp to keep track of when the referral was created and last updated
                    const createdAt = new Date().toISOString();

                    // create a referral object in the list of referrals
                    const createsReferral = await API.graphql(graphqlOperation(createReferral, {
                        createInput:
                            {
                                id: referralId,
                                inviteeEmail: "",
                                inviterEmail: currentUserEmail,
                                inviterName: currentUserName,
                                offerType: OfferType.WelcomeReferralBonus,
                                statusInviter: ReferralStatus.Initiated,
                                statusInvitee: ReferralStatus.Initiated,
                                status: ReferralStatus.Initiated,
                                updatedAt: createdAt,
                                createdAt: createdAt
                            }
                    }));
                    // @ts-ignore
                    if (createsReferral && createsReferral.data.createReferral.errorMessage === null) {
                        setReferralModalVisible(true);
                        setIsErrorModal(false);
                        setModalMessage("Successfully shared invite!");
                    } else {
                        setReferralModalVisible(true);
                        setIsErrorModal(true);
                        // @ts-ignore
                        setModalMessage(error.message ? error.message : `Unexpected error while creating referral!`);
                        console.log(`Unexpected error while creating referral for invite: ${createsReferral}`);
                    }
                } catch (error) {
                    setReferralModalVisible(true);
                    setIsErrorModal(true);
                    // @ts-ignore
                    setModalMessage(error.message ? error.message : `Unexpected error for referral!`);
                    console.log(`Unexpected error while creating referral for invite: ${JSON.stringify(error)}`);
                }

                // if (result.activityType) {
                //     // shared with activity type of result.activityType
                // } else {
                //     // shared
                // }
            } else if (result.action === Share.dismissedAction) {
                // dismissed
            }
        } catch (error) {
            setReferralModalVisible(true);
            setIsErrorModal(true);
            // @ts-ignore
            setModalMessage(error.message ? error.message : `Unexpected error while sharing invitation!`);
            console.log(`Unexpected error while sharing invite: ${JSON.stringify(error)}`);
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
                    <Portal>
                        <Modal dismissable={false} visible={referralModalVisible}
                               onDismiss={() => setReferralModalVisible(false)}
                               contentContainerStyle={[styles.modalContainer, isErrorModal ? {borderColor: 'red'} : {borderColor: 'green'}]}>
                            <Text style={styles.modalParagraph}>{modalMessage}</Text>
                            <Button
                                uppercase={false}
                                style={[styles.modalButton, isErrorModal ? {borderColor: 'red'} : {borderColor: 'green'}]}
                                {...!isErrorModal && {
                                    textColor: 'green',
                                    buttonColor: '#f2f2f2'
                                }}
                                {...isErrorModal && {
                                    icon: 'redo-variant',
                                    textColor: 'red',
                                    buttonColor: '#f2f2f2'
                                }}
                                mode="outlined"
                                labelStyle={{fontSize: 15}}
                                onPress={() => {
                                    isErrorModal ? setReferralModalVisible(false) : navigation.goBack();
                                }}>
                                {isErrorModal ? `Try Again` : `Dismiss`}
                            </Button>
                        </Modal>
                    </Portal>
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
                                await shareInviteAction(uuidv4())
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
