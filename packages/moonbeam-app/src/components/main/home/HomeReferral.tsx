import 'react-native-get-random-values';
import {HomeReferralProps} from "../../../models/HomeStackProps";
import React, {useEffect, useState} from "react";
import {Image, ImageBackground, SafeAreaView, Share, View} from "react-native";
import {commonStyles} from "../../../styles/common.module";
import {Button, Modal, Portal, Text, IconButton} from "react-native-paper";
import {styles} from "../../../styles/homeReferral.module";
// @ts-ignore
import FriendReferral from '../../../../assets/refer-friend.png';
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
        // set the user information
        !currentUserName && setCurrentUserEmail(route.params.currentUserInformation["email"].toLowerCase());
        !currentUserEmail && setCurrentUserName(route.params.currentUserInformation["name"]);

        // hide the bottom tab navigation
        route.params.setBottomTabNavigationShown(false);
    }, [route.name]);

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
                // create a referral object in the list of referrals
                const createsReferral = await API.graphql(graphqlOperation(createReferral, {
                    createReferralInput:
                        {
                            id: referralId,
                            inviteeEmail: "",
                            inviterEmail: currentUserEmail,
                            inviterName: currentUserName,
                            offerType: OfferType.WelcomeReferralBonus,
                            statusInviter: ReferralStatus.Initiated,
                            statusInvitee: ReferralStatus.Initiated,
                            status: ReferralStatus.Initiated
                        }
                }));
                // @ts-ignore
                if (createsReferral && createsReferral.data.createReferral.errorMessage === null) {
                    setReferralModalVisible(true);
                    setIsErrorModal(false);
                    setModalMessage("Successfully shared invite!");
                } else {
                    console.log(`Unexpected error while creating referral for invite: ${JSON.stringify(createsReferral)}`);
                    setReferralModalVisible(true);
                    setIsErrorModal(true);
                    // @ts-ignore
                    setModalMessage(`Unexpected error while creating referral!`);
                }
            } else if (result.action === Share.dismissedAction) {
                // dismissed
            }
        } catch (error) {
            console.log(`Unexpected error while sharing invite: ${JSON.stringify(error)}`);
            setReferralModalVisible(true);
            setIsErrorModal(true);
            // @ts-ignore
            setModalMessage(`Unexpected error while sharing invitation!`);
        }
    }

    // return the component for the Home Referral page
    return (
        <SafeAreaView style={[commonStyles.rowContainer, commonStyles.androidSafeArea]}>
            <ImageBackground
                style={commonStyles.image}
                imageStyle={{
                    resizeMode: 'stretch'
                }}
                source={require('../../../../assets/forgot-password-background.png')}>
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
                                if (isErrorModal) {
                                    setReferralModalVisible(false)
                                } else {
                                    route.params.setBottomTabNavigationShown(true)
                                    navigation.goBack();
                                }
                            }}>
                            {isErrorModal ? `Try Again` : `Dismiss`}
                        </Button>
                    </Modal>
                </Portal>
                <View style={styles.mainView}>
                    <IconButton
                        icon="close"
                        iconColor={"#313030"}
                        size={30}
                        style={styles.dismissIcon}
                        onPress={() => {
                            route.params.setBottomTabNavigationShown(true);
                            navigation.goBack();
                        }}
                    />
                    <View style={styles.messageView}>
                        <Text style={styles.messageTitle}>Refer a Friend</Text>
                        <Text style={styles.messageSubtitle}>in order to earn 10,000 Points</Text>
                    </View>
                    <View>
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
        </SafeAreaView>
    );
}
