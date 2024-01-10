import {Linking, SafeAreaView, ScrollView, StyleSheet, View} from "react-native";
import {Dialog, Divider, List, Portal, Switch, Text} from "react-native-paper";
import React, {useEffect, useState} from "react";
import {SettingsListProps} from "../../../../models/props/SettingsProps";
import {commonStyles} from "../../../../styles/common.module";
import {styles} from "../../../../styles/settingsList.module";
// @ts-ignore
import FaceIDIcon from '../../../../../assets/face-id-icon.png';
import {useRecoilState} from "recoil";
import {currentUserInformation, userIsAuthenticatedState} from "../../../../recoil/AuthAtom";
import {Spinner} from "../../../common/Spinner";
import {API, graphqlOperation} from "aws-amplify";
import {deleteCard, LoggingLevel} from "@moonbeam/moonbeam-models";
import {cardLinkingStatusState, drawerSwipeState} from "../../../../recoil/AppDrawerAtom";
// @ts-ignore
import CardLinkingImage from "../../../../../assets/art/moonbeam-card-linking.png";
// @ts-ignore
import MoonbeamBiometrics from "../../../../../assets/art/moonbeam-biometrics.png";
import {customBannerState} from "../../../../recoil/CustomBannerAtom";
import {Button} from "@rneui/base";
import {bottomBarNavigationState, drawerNavigationState} from "../../../../recoil/HomeAtom";
import {goToProfileSettingsState} from "../../../../recoil/Settings";
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';
import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";
import {logEvent} from "../../../../utils/AppSync";

/**
 * SettingsList component
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component
 */
export const SettingsList = ({navigation}: SettingsListProps) => {
    // constants used to keep track of local component state
    const [biometricsEnabled, setBiometricsEnabled] = useState<boolean>(false);
    const [biometricsType, setBiometricsType] = useState<string>('Enhanced Security');
    const [isReady, setIsReady] = useState<boolean>(true);
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
    const [cardOptionTitle, setCardOptionTitle] = useState<string>('');
    const [cardOptionDescription, setCardOptionDescription] = useState<string>('');
    const [cardOptionIcon, setCardOptionIcon] = useState<string>('');
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [modalCustomMessage, setModalCustomMessage] = useState<string>("");
    const [modalButtonMessage, setModalButtonMessage] = useState<string>("");
    // constants used to keep track of shared states
    const [userIsAuthenticated,] = useRecoilState(userIsAuthenticatedState);
    const [goToProfileSettings,] = useRecoilState(goToProfileSettingsState);
    const [drawerNavigation,] = useRecoilState(drawerNavigationState);
    const [bottomBarNavigation,] = useRecoilState(bottomBarNavigationState);
    const [userInformation, setUserInformation] = useRecoilState(currentUserInformation);
    const [, setCardLinkingStatus] = useRecoilState(cardLinkingStatusState);
    const [, setBannerState] = useRecoilState(customBannerState);
    const [, setDrawerSwipeEnabled] = useRecoilState(drawerSwipeState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // redirect the appropriate screen through linking
        goToProfileSettings && navigation.navigate('Profile', {});

        // enable the swipe for the drawer
        setDrawerSwipeEnabled(true);

        // check if a member has already been deactivated or never completed the linked card process
        if (userInformation["linkedCard"] && userInformation["linkedCard"]["cards"].length !== 0) {
            // set the opt-out information accordingly
            setCardOptionTitle('Opt Out');
            setCardOptionDescription('Are you sure you want to opt-out of all our sweet discount programs?');
            setCardOptionIcon('credit-card-remove-outline');
        } else {
            // set the opt-out information accordingly
            setCardOptionTitle("Opt-In");
            setCardOptionDescription("Click this button to opt-in to all our sweet discount programs!");
            setCardOptionIcon('credit-card-plus-outline');
        }
        // retrieve the type of Biometrics available from the SecureStore
        SecureStore.getItemAsync(`biometrics-type`, {
            requireAuthentication: false // we don't need this to be under authentication, so we can check at login
        }).then(biometricsType => {
            const message = `Type of authentication enabled on device ${biometricsType}`;
            console.log(message);
            logEvent(message, LoggingLevel.Info, userIsAuthenticated).then(() => {
            });

            setBiometricsType('Enhanced Security');
            // check to see if biometrics are enabled or not
            SecureStore.getItemAsync(`biometrics-enabled`, {
                requireAuthentication: false // we don't need this to be under authentication, so we can check at login
            }).then(biometricsEnabled => {
                if (biometricsEnabled !== null && biometricsEnabled.length !== 0 && biometricsEnabled !== '0') {
                    setBiometricsEnabled(true);
                } else {
                    setBiometricsEnabled(false);
                }
            });
        });
    }, [goToProfileSettings, userInformation["linkedCard"]]);

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
                    bannerMessage: "You do not have a linked card. You will need to have a card in your wallet to see more details.",
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
                const message = `Unexpected error while opting member out of the program through the delete card API ${JSON.stringify(deleteCardResult)}`;
                console.log(message);
                await logEvent(message, LoggingLevel.Error, userIsAuthenticated);

                // show modal error
                setModalCustomMessage("Unexpected error while opting out!");
                setModalButtonMessage("Try Again");
                setModalVisible(true);
            }
        } catch (error) {
            // release the loader on button press
            setIsReady(true);
            const message = `Unexpected error while attempting to opt a member out of the programs through the delete card API ${JSON.stringify(error)} ${error}`;
            console.log(message);
            await logEvent(message, LoggingLevel.Error, userIsAuthenticated);

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
                                         size={hp(10)}/>
                            <Dialog.Title
                                style={commonStyles.dialogTitle}>{modalButtonMessage === 'Try Again' ? 'We hit a snag!' : 'Great'}</Dialog.Title>
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
                                        keyboardShouldPersistTaps={'handled'}
                                        contentContainerStyle={{paddingBottom: hp(10)}}>
                                <List.Section style={styles.listSectionView}>
                                    <List.Subheader
                                        style={styles.subHeaderTitle}>Account
                                        Management</List.Subheader>
                                    <Divider style={styles.divider}/>
                                    <Divider style={styles.divider}/>
                                    <List.Item
                                        rippleColor={'transparent'}
                                        style={styles.settingsItemStyle}
                                        titleStyle={styles.settingsItemTitle}
                                        descriptionStyle={styles.settingsItemDescription}
                                        titleNumberOfLines={10}
                                        descriptionNumberOfLines={10}
                                        title="Edit Profile"
                                        description='We know you’re not “basic,” but this is where you edit your basic information.'
                                        left={() => <List.Icon color={'#F2FF5D'} icon="clipboard-account-outline"/>}
                                        right={() => <List.Icon style={{left: hp(1)}}
                                                                color={'#F2FF5D'} icon="chevron-right"/>}
                                        onPress={() => {
                                            // go to the Profile screen
                                            navigation.navigate('Profile', {});
                                        }}
                                    />
                                    <Divider style={[styles.divider, {backgroundColor: '#313030'}]}/>
                                    <Divider style={[styles.divider, {backgroundColor: '#313030'}]}/>
                                    <List.Item
                                        rippleColor={'transparent'}
                                        style={styles.settingsItemStyle}
                                        titleStyle={styles.settingsItemTitle}
                                        descriptionStyle={styles.settingsItemDescription}
                                        titleNumberOfLines={10}
                                        descriptionNumberOfLines={10}
                                        title="Change Password"
                                        description='Keep this one a secret, bro. We don’t even wanna know.'
                                        left={() => <List.Icon color={'#F2FF5D'} icon="lock-check"/>}
                                        right={() => <List.Icon style={{left: hp(1)}}
                                                                color={'#F2FF5D'} icon="chevron-right"/>}
                                        onPress={() => {
                                            // go to the Profile screen
                                            navigation.navigate('ResetPassword', {});
                                        }}
                                    />
                                    <Divider style={[styles.divider, {backgroundColor: '#313030'}]}/>
                                    <Divider style={[styles.divider, {backgroundColor: '#313030'}]}/>
                                    <List.Item
                                        rippleColor={'transparent'}
                                        style={styles.settingsItemStyle}
                                        titleStyle={styles.settingsItemTitle}
                                        descriptionStyle={styles.settingsItemDescription}
                                        titleNumberOfLines={10}
                                        descriptionNumberOfLines={10}
                                        title="Delete Account"
                                        description='WARNING: This button will initiate self-destruction.'
                                        left={() => <List.Icon color={'#F2FF5D'} icon="hand-wave"/>}
                                        right={() => <List.Icon style={{left: hp(1)}}
                                                                color={'#F2FF5D'} icon="chevron-right"/>}
                                        onPress={() => {
                                            // go to Account Deletion Typeform
                                            const accountDeletionUrl = 'https://moonbeam-vet.typeform.com/to/sl9nxMru?typeform-source=www.moonbeam.vet'
                                            Linking.canOpenURL(accountDeletionUrl).then(async supported => {
                                                if (supported) {
                                                    Linking.openURL(accountDeletionUrl).then(() => {
                                                    });
                                                } else {
                                                    const message = `Don't know how to open URI: ${accountDeletionUrl}`;
                                                    console.log(message);
                                                    await logEvent(message, LoggingLevel.Warning, userIsAuthenticated);
                                                }
                                            });
                                        }}
                                    />
                                </List.Section>
                                <List.Section style={styles.listSectionView}>
                                    <List.Subheader
                                        style={styles.subHeaderTitle}>Wallet
                                        Management</List.Subheader>
                                    <Divider style={styles.divider}/>
                                    <Divider style={styles.divider}/>
                                    <List.Item
                                        rippleColor={'transparent'}
                                        style={styles.settingsItemStyle}
                                        titleStyle={styles.settingsItemTitle}
                                        descriptionStyle={styles.settingsItemDescription}
                                        titleNumberOfLines={10}
                                        descriptionNumberOfLines={10}
                                        title={cardOptionTitle}
                                        description={cardOptionDescription}
                                        left={() => <List.Icon color={'#F2FF5D'} icon={cardOptionIcon}/>}
                                        right={() => <List.Icon style={{left: hp(1)}}
                                                                color={'#F2FF5D'} icon="chevron-right"/>}
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
                                                bottomBarNavigation && bottomBarNavigation!.navigate('Cards', {});
                                                drawerNavigation && drawerNavigation!.navigate('Home', {});
                                            }
                                        }}
                                    />
                                </List.Section>
                                <List.Section style={styles.listSectionView}>
                                    <List.Subheader
                                        style={styles.subHeaderTitle}>Security & Privacy</List.Subheader>
                                    <Divider style={styles.divider}/>
                                    <Divider style={styles.divider}/>
                                    <List.Item
                                        disabled={true}
                                        rippleColor={'transparent'}
                                        style={styles.settingsItemStyle}
                                        titleStyle={styles.settingsItemTitle}
                                        descriptionStyle={styles.settingsItemDescription}
                                        titleNumberOfLines={10}
                                        descriptionNumberOfLines={10}
                                        title={`${biometricsType}`}
                                        description={
                                            biometricsEnabled
                                                ? `Disable authentication through Biometrics or PIN/Pattern.`
                                                : `Enabling authentication through Biometrics or PIN/Pattern.`
                                        }
                                        left={() =>
                                            <List.Icon
                                                color={'#F2FF5D'}
                                                icon={'passport-biometric'}
                                            />}
                                        right={() =>
                                            <Switch
                                                thumbColor={biometricsEnabled ? '#313030' : '#F2FF5D'}
                                                trackColor={{true: '#F2FF5D', false: '#313030'}}
                                                ios_backgroundColor={biometricsEnabled ? '#F2FF5D' : '#313030'}
                                                style={styles.biometricsToggleSwitch}
                                                value={biometricsEnabled}
                                                onValueChange={async (value) => {
                                                    // enable the biometrics authentication set up
                                                    if (value) {
                                                        // authenticate using the chosen authentication option
                                                        const localAuthenticationResult: LocalAuthentication.LocalAuthenticationResult = await LocalAuthentication.authenticateAsync({
                                                            promptMessage: 'Use your biometrics or FingerPrint/TouchID to authenticate with Moonbeam!',
                                                        });
                                                        // check if the authentication was successful or not
                                                        if (localAuthenticationResult.success) {
                                                            const message = 'successfully opted in to set up biometrics';
                                                            console.log(message);
                                                            await logEvent(message, LoggingLevel.Info, userIsAuthenticated);

                                                            // we will store the user's biometrics preferences.
                                                            await SecureStore.setItemAsync(`biometrics-enabled`, '1', {
                                                                requireAuthentication: false // we don't need this to be under authentication, so we can check at login
                                                            });
                                                            setBiometricsEnabled(value);
                                                        } else {
                                                            const message = 'failed to opt in to set up biometrics';
                                                            console.log(message);
                                                            await logEvent(message, LoggingLevel.Error, userIsAuthenticated);
                                                        }
                                                    } else {
                                                        // disable the biometrics authentication set up
                                                        await SecureStore.setItemAsync(`biometrics-enabled`, '0', {
                                                            requireAuthentication: false // we don't need this to be under authentication, so we can check at login
                                                        });
                                                        setBiometricsEnabled(value);
                                                    }

                                                }}
                                            />
                                        }
                                        onPress={async () => {
                                            // do nothing
                                        }}
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
