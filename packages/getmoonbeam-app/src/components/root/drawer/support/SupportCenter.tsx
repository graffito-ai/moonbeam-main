import 'react-native-get-random-values';
import React, {useEffect, useState} from "react";
import {Image, Linking, Platform, SafeAreaView, ScrollView, StyleSheet, View} from "react-native";
import {Dialog, Divider, List, Portal, Text} from "react-native-paper";
import {styles} from "../../../../styles/supportCenter.module";
import {useRecoilState} from "recoil";
import {drawerSwipeState} from "../../../../recoil/AppDrawerAtom";
import {SupportCenterProps} from "../../../../models/props/SupportProps";
import {commonStyles} from '../../../../styles/common.module';
import * as SMS from "expo-sms";
import {Spinner} from "../../../common/Spinner";
import {Button} from "@rneui/base";
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';
import * as Contacts from "expo-contacts";
import {fetchFile} from "../../../../utils/File";
// @ts-ignore
import MoonbeamPreferencesIOS from "../../../../../assets/art/moonbeam-preferences-ios.jpg";
// @ts-ignore
import MoonbeamPreferencesAndroid from "../../../../../assets/art/moonbeam-preferences-android.jpg";
import {userIsAuthenticatedState} from "../../../../recoil/AuthAtom";
import {logEvent} from "../../../../utils/AppSync";
import {LoggingLevel} from "@moonbeam/moonbeam-models";

/**
 * SupportCenter component.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component
 */
export const SupportCenter = ({navigation}: SupportCenterProps) => {
    // constants used to keep track of local component state
    const [permissionsModalVisible, setPermissionsModalVisible] = useState<boolean>(false);
    const [permissionsModalCustomMessage, setPermissionsModalCustomMessage] = useState<string>("");
    const [permissionsInstructionsCustomMessage, setPermissionsInstructionsCustomMessage] = useState<string>("");
    const [isReady, setIsReady] = useState<boolean>(true);
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
    const [supportModalVisible, setSupportModalVisible] = useState<boolean>(false);
    const [supportModalMessage, setSupportModalMessage] = useState<string>('');
    const [supportModalButtonMessage, setSupportModalButtonMessage] = useState<string>('');
    // constants used to keep track of shared states
    const [userIsAuthenticated, ] = useRecoilState(userIsAuthenticatedState);
    const [, setDrawerSwipeEnabled] = useRecoilState(drawerSwipeState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // enable the swipe for the drawer
        setDrawerSwipeEnabled(true);
    }, []);

    /**
     * Function used to add the support number to the user's contacts,
     * in order to ensure a better experience when they message support.
     *
     * Note: Right now, this does not check for duplicate contacts. We
     * can do that later.
     *
     * @return a {@link Promise} of a {@link Boolean} flag representing whether
     * the appropriate permissions and support contact were added in the contact
     * book.
     */
    const addSupportToContacts = async (): Promise<boolean> => {
        const {status} = await Contacts.requestPermissionsAsync();
        if (status === 'granted') {
            // fetch the URI for the image to be retrieved from CloudFront
            // retrieving the document link from either local cache, or from storage
            const [returnFlag, shareURI] = await fetchFile('contact-icon.png', false, false, true);
            if (!returnFlag || shareURI === null) {
                const message = `Unable to download contact icon file!`;
                console.log(message);
                await logEvent(message, LoggingLevel.Warning, userIsAuthenticated);

                return false;
            } else {
                // create a new contact for Moonbeam Support chat
                const contact = {
                    [Contacts.Fields.Name]: 'Moonbeam 🪖',
                    [Contacts.Fields.FirstName]: 'Moonbeam 🪖',
                    [Contacts.Fields.ContactType]: Contacts.ContactTypes.Company,
                    [Contacts.Fields.Birthday]: {
                        day: 4,
                        month: 6,
                        year: 1776
                    },
                    [Contacts.Fields.ImageAvailable]: true,
                    [Contacts.Fields.Image]: {
                        uri: shareURI
                    },
                    [Contacts.Fields.Emails]: [
                        {
                            label: 'Moonbeam Support Email',
                            email: 'info@moonbeam.vet',
                            isPrimary: true
                        }
                    ],
                    [Contacts.Fields.PhoneNumbers]: [
                        {
                            label: 'Moonbeam Support Phone Number',
                            countryCode: '+1',
                            number: '2107446222',
                            isPrimary: true
                        }
                    ],
                    [Contacts.Fields.UrlAddresses]: [
                        {
                            label: 'Moonbeam Website',
                            url: 'https://www.getmoonbeam.vet'
                        }
                    ]
                }
                // add a new contact for our Support chat
                // @ts-ignore
                await Contacts.addContactAsync(contact);
                return true;
            }
        } else {
            const errorMessage = `Permission to access contacts was not granted!`;
            console.log(errorMessage);
            await logEvent(errorMessage, LoggingLevel.Warning, userIsAuthenticated);

            setPermissionsModalCustomMessage(errorMessage);
            setPermissionsInstructionsCustomMessage(Platform.OS === 'ios'
                ? "In order to easily contact our team and store our customer service number in your Contacts, go to Settings -> Moonbeam Finance, and allow Contacts access by tapping on the \'Contacts\' option."
                : "In order to easily contact our team and store our customer service number in your Contacts, go to Settings -> Apps -> Moonbeam Finance -> Permissions, and allow Contacts access by tapping on the \"Contacts\" option.");
            setPermissionsModalVisible(true);
            return false;
        }
    }

    /**
     * Function used to contact support, via the native messaging application.
     */
    const contactSupport = async (): Promise<void> => {
        // set a loader on button press
        setIsReady(false);

        const isAvailable = await SMS.isAvailableAsync();
        if (isAvailable) {
            // customize the SMS message below
            const result = await SMS.sendSMSAsync(
                ['210-744-6222'],
                'Hello I would like some help with: ',
                {}
            );
            // switch based on the result received from the async SMS action
            switch (result.result) {
                case 'sent':
                    // release the loader on button press
                    setIsReady(true);

                    const message = 'Message sent!';
                    console.log(message);
                    await logEvent(message, LoggingLevel.Info, userIsAuthenticated);

                    setSupportModalMessage('Thank you for your inquiry! One of our team members will get back to you shortly!');
                    setSupportModalButtonMessage('Dismiss');
                    setSupportModalVisible(true);
                    break;
                case 'unknown':
                    // release the loader on button press
                    setIsReady(true);

                    const errorMessage = 'Unknown error has occurred while attempting to send a message!';
                    console.log(errorMessage);
                    await logEvent(errorMessage, LoggingLevel.Error, userIsAuthenticated);

                    setSupportModalMessage('An unexpected error occurred while attempting to contact our team');
                    setSupportModalButtonMessage('Retry');
                    setSupportModalVisible(true);
                    break;
                case 'cancelled':
                    // release the loader on button press
                    setIsReady(true);

                    const cancelledMessage = 'Message was cancelled!';
                    console.log(cancelledMessage);
                    await logEvent(cancelledMessage, LoggingLevel.Warning, userIsAuthenticated);

                    setSupportModalMessage('It looks like you cancelled your inquiry to our team! If you do need help, please ensure that you send your message beforehand!');
                    setSupportModalButtonMessage('Ok');
                    setSupportModalVisible(true);
                    break;
            }
        } else {
            // release the loader on button press
            setIsReady(true);

            // there's no SMS available on this device
            const message = 'no SMS available';
            console.log(message);
            await logEvent(message, LoggingLevel.Warning, userIsAuthenticated);

            setSupportModalMessage('Messaging not available on this platform!');
            setSupportModalButtonMessage('Retry');
            setSupportModalVisible(true);
        }
    }

    // return the component for the SupportCenter page
    return (
        <>
            {
                !isReady ?
                    <Spinner loadingSpinnerShown={loadingSpinnerShown} setLoadingSpinnerShown={setLoadingSpinnerShown}/>
                    :
                    <>
                        <Portal>
                            <Dialog style={commonStyles.permissionsDialogStyle} visible={permissionsModalVisible}
                                    onDismiss={() => setPermissionsModalVisible(false)}>
                                <Dialog.Title
                                    style={commonStyles.dialogTitle}>{'Permissions not granted!'}</Dialog.Title>
                                <Dialog.Content>
                                    <Text
                                        style={commonStyles.dialogParagraph}>{permissionsModalCustomMessage}</Text>
                                </Dialog.Content>
                                <Image source={
                                    Platform.OS === 'ios'
                                        ? MoonbeamPreferencesIOS
                                        : MoonbeamPreferencesAndroid
                                }
                                       style={commonStyles.permissionsDialogImage}/>
                                <Dialog.Content>
                                    <Text
                                        style={commonStyles.dialogParagraphInstructions}>{permissionsInstructionsCustomMessage}</Text>
                                </Dialog.Content>
                                <Dialog.Actions style={{alignSelf: 'center', flexDirection: 'column'}}>
                                    <Button buttonStyle={commonStyles.dialogButton}
                                            titleStyle={commonStyles.dialogButtonText}
                                            onPress={async () => {
                                                // go to the appropriate settings page depending on the OS
                                                if (Platform.OS === 'ios') {
                                                    await Linking.openURL("app-settings:");
                                                } else {
                                                    await Linking.openSettings();
                                                }
                                                setPermissionsModalVisible(false);
                                            }}>
                                        {"Go to App Settings"}
                                    </Button>
                                    <Button buttonStyle={commonStyles.dialogButtonSkip}
                                            titleStyle={commonStyles.dialogButtonSkipText}
                                            onPress={async () => {
                                                setPermissionsModalVisible(false);
                                                await contactSupport();
                                            }}>
                                        {"Skip"}
                                    </Button>
                                </Dialog.Actions>
                            </Dialog>
                        </Portal>
                        <Portal>
                            <Dialog style={commonStyles.dialogStyle} visible={supportModalVisible}
                                    onDismiss={() => setSupportModalVisible(false)}>
                                <Dialog.Icon icon="alert" color={"#F2FF5D"}
                                             size={hp(10)}/>
                                <Dialog.Title
                                    style={commonStyles.dialogTitle}>{supportModalButtonMessage === 'Retry' ? 'We hit a snag!' : ('Dismiss' ? 'Great' : 'Heads up')}</Dialog.Title>
                                <Dialog.Content>
                                    <Text
                                        style={commonStyles.dialogParagraph}>{supportModalMessage}</Text>
                                </Dialog.Content>
                                <Dialog.Actions>
                                    <Button buttonStyle={commonStyles.dialogButton}
                                            titleStyle={commonStyles.dialogButtonText}
                                            onPress={() => {
                                                setSupportModalVisible(false);
                                            }}>
                                        {supportModalButtonMessage}
                                    </Button>
                                </Dialog.Actions>
                            </Dialog>
                        </Portal>
                        <SafeAreaView style={commonStyles.rowContainer}>
                            <View style={[styles.supportContentView, StyleSheet.absoluteFill]}>
                                <ScrollView scrollEnabled={false}
                                            persistentScrollbar={false}
                                            showsVerticalScrollIndicator={false}
                                            keyboardShouldPersistTaps={'handled'}>
                                    <List.Section style={styles.listSectionView}>
                                        <List.Subheader
                                            style={styles.subHeaderTitle}>Get Help</List.Subheader>
                                        <Divider style={styles.divider}/>
                                        <Divider style={styles.divider}/>
                                        <List.Item
                                            rippleColor={'transparent'}
                                            style={styles.supportItemStyle}
                                            titleStyle={styles.supportItemTitle}
                                            descriptionStyle={styles.supportItemDescription}
                                            titleNumberOfLines={2}
                                            descriptionNumberOfLines={3}
                                            title={'Contact'}
                                            description={`Wanna ask us to dinner? Slide into our DMs.`}
                                            onPress={async () => {
                                                addSupportToContacts().then(async contactsFlag => {
                                                    contactsFlag && await contactSupport();
                                                });
                                            }}
                                            left={() => <List.Icon color={'#F2FF5D'} icon="message"/>}
                                            right={() => <List.Icon style={{left: hp(1)}}
                                                                    color={'#F2FF5D'} icon="chevron-right"/>}
                                        />
                                    </List.Section>
                                    <List.Section style={styles.listSectionView}>
                                        <List.Subheader
                                            style={styles.subHeaderTitle}>Knowledge Base</List.Subheader>
                                        <Divider style={styles.divider}/>
                                        <Divider style={styles.divider}/>
                                        <List.Item
                                            rippleColor={'transparent'}
                                            style={styles.supportItemStyle}
                                            titleStyle={styles.supportItemTitle}
                                            descriptionStyle={styles.supportItemDescription}
                                            titleNumberOfLines={2}
                                            descriptionNumberOfLines={3}
                                            title={'FAQ'}
                                            description={`Got questions? We got answers.`}
                                            onPress={async () => {
                                                // go to the FAQ page
                                                navigation.navigate('FAQ', {});
                                            }}
                                            left={() => <List.Icon color={'#F2FF5D'}
                                                                   icon="frequently-asked-questions"/>}
                                            right={() => <List.Icon style={{left: hp(1)}}
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
