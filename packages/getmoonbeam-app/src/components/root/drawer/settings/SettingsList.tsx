import {Dimensions, SafeAreaView, ScrollView, StyleSheet, View} from "react-native";
import {Dialog, Divider, List, Portal, Text} from "react-native-paper";
import React, {useEffect, useState} from "react";
import {SettingsListProps} from "../../../../models/props/SettingsProps";
import {commonStyles} from "../../../../styles/common.module";
import {styles} from "../../../../styles/settingsList.module";
// @ts-ignore
import FaceIDIcon from '../../../../../assets/face-id-icon.png';
import {useRecoilState} from "recoil";
import {appLinkedURLState, currentUserInformation} from "../../../../recoil/AuthAtom";
import {Spinner} from "../../../common/Spinner";
import {API, graphqlOperation} from "aws-amplify";
import {deleteCard} from "@moonbeam/moonbeam-models";
import * as Linking from 'expo-linking';
import {cardLinkingStatusState, drawerSwipeState} from "../../../../recoil/AppDrawerAtom";
// @ts-ignore
import CardLinkingImage from "../../../../../assets/art/moonbeam-card-linking.png";
import {customBannerState} from "../../../../recoil/CustomBannerAtom";
import {deviceTypeState} from "../../../../recoil/RootAtom";
import * as Device from "expo-device";
import {DeviceType} from "expo-device";
import {Button} from "@rneui/base";

/**
 * SettingsList component
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component
 */
export const SettingsList = ({navigation}: SettingsListProps) => {
    // constants used to keep track of local component state
    const [isReady, setIsReady] = useState<boolean>(true);
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
    const [optionTitle, setOptionTitle] = useState<string>('');
    const [optionDescription, setOptionDescription] = useState<string>('');
    const [optionIcon, setOptionIcon] = useState<string>('');
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [modalCustomMessage, setModalCustomMessage] = useState<string>("");
    const [modalButtonMessage, setModalButtonMessage] = useState<string>("");
    // constants used to keep track of shared states
    const [userInformation, setUserInformation] = useRecoilState(currentUserInformation);
    const [, setCardLinkingStatus] = useRecoilState(cardLinkingStatusState);
    const [, setBannerState] = useRecoilState(customBannerState);
    const [, setDrawerSwipeEnabled] = useRecoilState(drawerSwipeState);
    const [deviceType, setDeviceType] = useRecoilState(deviceTypeState);
    const [appURL,] = useRecoilState(appLinkedURLState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // since deep-linking sometimes does not work on first-render, use the global App URL to re-route to appropriate screen
        if (appURL.length !== 0 && appURL.includes('profile')) {
            navigation.navigate('Profile', {});
        }

        // check and set the type of device, to be used throughout the app
        Device.getDeviceTypeAsync().then(deviceType => {
            setDeviceType(deviceType);
        });

        // enable the swipe for the drawer
        setDrawerSwipeEnabled(true);

        // check if a member has already been deactivated or never completed the linked card process
        if (userInformation["linkedCard"] && userInformation["linkedCard"]["cards"].length !== 0) {
            // set the opt-out information accordingly
            setOptionTitle('Opt Out');
            setOptionDescription('You will automatically be opted out of all the cashback programs that you enrolled into, and your card will be un-linked.');
            setOptionIcon('credit-card-remove-outline');
        } else {
            // set the opt-out information accordingly
            setOptionTitle("Opt-In");
            setOptionDescription("You can re-opt to the available cashback programs, by linking your favorite Visa or MasterCard card!");
            setOptionIcon('credit-card-plus-outline');
        }
    }, [userInformation["linkedCard"], deviceType, appURL]);

    /**
     * Function used to handle the opt-out action, from the settings list
     * option press.
     *
     * @param userId uniquely generated user identifier.
     * @param memberId member id obtained from Olive during the signup process.
     * @param cardId card id obtained from Olive during the signup and/or card addition process.
     */
    const optOut = async (userId: string, memberId: string, cardId: string): Promise<void> => {
        try {
            // set a loader on button press
            setIsReady(false);

            // call the internal delete card API
            const deleteCardResult = await API.graphql(graphqlOperation(deleteCard, {
                deleteCardInput: {
                    id: userId,
                    memberId: memberId,
                    cardId: cardId
                }
            }));

            // retrieve the data block from the response
            // @ts-ignore
            const responseData = deleteCardResult ? deleteCardResult.data : null;

            // check if there are any errors in the returned response
            if (responseData && responseData.deleteCard.errorMessage === null) {
                // release the loader on button press
                setIsReady(true);

                // set the user information object's card list accordingly
                setUserInformation({
                    ...userInformation,
                    linkedCard: {
                        ...userInformation["linkedCard"],
                        cards: []
                    }
                });

                // change the card linking status
                setCardLinkingStatus(false);

                // set the custom banner state for future screens accordingly
                setBannerState({
                    bannerVisibilityState: cardLinkingStatusState,
                    bannerMessage: "You currently do not have a linked card to your Moonbeam account. In order to see more dashboard details, you will need to have a card in your wallet. Get started now!",
                    bannerButtonLabel: "Link Now",
                    bannerButtonLabelActionSource: "home/wallet",
                    bannerArtSource: CardLinkingImage,
                    dismissing: false
                });

                // show modal confirmation
                setModalCustomMessage("You have successfully been opted out!");
                setModalButtonMessage("Ok");
                setModalVisible(true);
            } else {
                // release the loader on button press
                setIsReady(true);
                console.log(`Unexpected error while opting member out of the program through the delete card API ${JSON.stringify(deleteCardResult)}`);

                // show modal error
                setModalCustomMessage("Unexpected error while opting out!");
                setModalButtonMessage("Try Again");
                setModalVisible(true);
            }
        } catch (error) {
            // release the loader on button press
            setIsReady(true);
            console.log(`Unexpected error while attempting to opt a member out of the programs through the delete card API ${JSON.stringify(error)} ${error}`);

            // show modal error
            setModalCustomMessage("Unexpected error while opting out!");
            setModalButtonMessage("Try Again");
            setModalVisible(true);
        }
    }


    // return the component for the SettingsList page
    return (
        <>
            {!isReady ?
                <Spinner loadingSpinnerShown={loadingSpinnerShown} setLoadingSpinnerShown={setLoadingSpinnerShown}/>
                :
                <>
                    <Portal>
                        <Dialog style={commonStyles.dialogStyle} visible={modalVisible}
                                onDismiss={() => setModalVisible(false)}>
                            <Dialog.Icon icon="alert" color={"#F2FF5D"}
                                         size={Dimensions.get('window').height / 14}/>
                            <Dialog.Content>
                                <Text
                                    style={commonStyles.dialogParagraph}>{modalCustomMessage}</Text>
                            </Dialog.Content>
                            <Dialog.Actions>
                                <Button buttonStyle={commonStyles.dialogButton}
                                        titleStyle={commonStyles.dialogButtonText}
                                        onPress={() => {
                                            setModalVisible(false);
                                        }}>
                                    {modalButtonMessage}
                                </Button>
                            </Dialog.Actions>
                        </Dialog>
                    </Portal>
                    <SafeAreaView style={commonStyles.rowContainer}>
                        <View style={[styles.settingsContentView, StyleSheet.absoluteFill]}>
                            <ScrollView scrollEnabled={true}
                                        persistentScrollbar={false}
                                        showsVerticalScrollIndicator={false}
                                        keyboardShouldPersistTaps={'handled'}>
                                <List.Section style={styles.listSectionView}>
                                    <List.Subheader
                                        style={deviceType === DeviceType.TABLET ? styles.subHeaderTitleTablet : styles.subHeaderTitle}>Account
                                        Management</List.Subheader>
                                    <Divider style={styles.divider}/>
                                    <Divider style={styles.divider}/>
                                    <List.Item
                                        style={styles.settingsItemStyle}
                                        titleStyle={styles.settingsItemTitle}
                                        descriptionStyle={styles.settingsItemDescription}
                                        titleNumberOfLines={10}
                                        descriptionNumberOfLines={10}
                                        title="Edit Profile"
                                        description='View and edit your basic information, such as email, phone number, name or address.'
                                        left={() => <List.Icon color={'#F2FF5D'} icon="clipboard-account-outline"/>}
                                        right={() => <List.Icon style={{left: Dimensions.get('window').width / 60}}
                                                                color={'#F2FF5D'} icon="chevron-right"/>}
                                        onPress={async () => {
                                            // go to the Profile screen
                                            await Linking.openURL(Linking.createURL(`settings/profile`));
                                        }}
                                    />
                                    <Divider style={[styles.divider, {backgroundColor: '#313030'}]}/>
                                    <Divider style={[styles.divider, {backgroundColor: '#313030'}]}/>
                                    <List.Item
                                        style={styles.settingsItemStyle}
                                        titleStyle={styles.settingsItemTitle}
                                        descriptionStyle={styles.settingsItemDescription}
                                        titleNumberOfLines={10}
                                        descriptionNumberOfLines={10}
                                        title="Change Password"
                                        description='Forgot your password? Change it so you can continue to securely access your account.'
                                        left={() => <List.Icon color={'#F2FF5D'} icon="lock-check"/>}
                                        right={() => <List.Icon style={{left: Dimensions.get('window').width / 60}}
                                                                color={'#F2FF5D'} icon={FaceIDIcon}/>}
                                    />
                                </List.Section>
                                <List.Section style={styles.listSectionView}>
                                    <List.Subheader
                                        style={deviceType === DeviceType.TABLET ? styles.subHeaderTitleTablet : styles.subHeaderTitle}>Wallet
                                        Management</List.Subheader>
                                    <Divider style={styles.divider}/>
                                    <Divider style={styles.divider}/>
                                    <List.Item
                                        style={styles.settingsItemStyle}
                                        titleStyle={styles.settingsItemTitle}
                                        descriptionStyle={styles.settingsItemDescription}
                                        titleNumberOfLines={10}
                                        descriptionNumberOfLines={10}
                                        title={optionTitle}
                                        description={optionDescription}
                                        left={() => <List.Icon color={'#F2FF5D'} icon={optionIcon}/>}
                                        right={() => <List.Icon style={{left: Dimensions.get('window').width / 60}}
                                                                color={'#F2FF5D'} icon={FaceIDIcon}/>}
                                        onPress={async () => {
                                            // check if a member has already been deactivated or never completed the linked card process
                                            if (userInformation["linkedCard"] && userInformation["linkedCard"]["cards"].length !== 0) {
                                                // there's a need to deactivate
                                                await optOut(
                                                    userInformation["custom:userId"],
                                                    userInformation["linkedCard"]["memberId"],
                                                    userInformation["linkedCard"]["cards"][0]["id"]
                                                );
                                            } else {
                                                // there's no need for deactivation, so go to the Card linking screen
                                                await Linking.openURL(Linking.createURL(`home/wallet`));
                                            }
                                        }}
                                    />
                                </List.Section>
                                <List.Section style={styles.listSectionView}>
                                    <List.Subheader
                                        style={deviceType === DeviceType.TABLET ? styles.subHeaderTitleTablet : styles.subHeaderTitle}>Security
                                        and Privacy</List.Subheader>
                                    <Divider style={styles.divider}/>
                                    <Divider style={styles.divider}/>
                                    <List.Item
                                        style={styles.settingsItemStyle}
                                        titleStyle={styles.settingsItemTitle}
                                        descriptionStyle={styles.settingsItemDescription}
                                        titleNumberOfLines={10}
                                        descriptionNumberOfLines={10}
                                        title="Face ID"
                                        description='Enhance your login experience, by enabling Face ID.'
                                        left={() => <List.Icon color={'#F2FF5D'} icon="emoticon"/>}
                                        right={() => <List.Icon style={{left: Dimensions.get('window').width / 60}}
                                                                color={'#F2FF5D'} icon="chevron-right"/>}
                                    />
                                    <Divider style={[styles.divider, {backgroundColor: '#313030'}]}/>
                                    <Divider style={[styles.divider, {backgroundColor: '#313030'}]}/>
                                    <List.Item
                                        style={styles.settingsItemStyle}
                                        titleStyle={styles.settingsItemTitle}
                                        descriptionStyle={styles.settingsItemDescription}
                                        titleNumberOfLines={10}
                                        descriptionNumberOfLines={10}
                                        title="Two-Factor Authentication"
                                        description='Secure your account even further, with two-step verification.'
                                        left={() => <List.Icon color={'#F2FF5D'} icon="lock"/>}
                                        right={() => <List.Icon style={{left: Dimensions.get('window').width / 60}}
                                                                color={'#F2FF5D'} icon="chevron-right"/>}
                                    />
                                    <Divider style={[styles.divider, {backgroundColor: '#313030'}]}/>
                                    <Divider style={[styles.divider, {backgroundColor: '#313030'}]}/>
                                    <List.Item
                                        style={styles.settingsItemStyle}
                                        titleStyle={styles.settingsItemTitle}
                                        descriptionStyle={styles.settingsItemDescription}
                                        titleNumberOfLines={10}
                                        descriptionNumberOfLines={10}
                                        title="Notification Preferences"
                                        description='Manage your notification and marketing settings.'
                                        left={() => <List.Icon color={'#F2FF5D'} icon="bell-alert"/>}
                                        right={() => <List.Icon style={{left: Dimensions.get('window').width / 60}}
                                                                color={'#F2FF5D'} icon="chevron-right"/>}
                                    />
                                </List.Section>
                            </ScrollView>
                        </View>
                    </SafeAreaView>
                </>
            }
        </>
    );
}
