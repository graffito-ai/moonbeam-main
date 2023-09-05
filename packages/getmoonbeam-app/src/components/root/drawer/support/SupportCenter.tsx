import 'react-native-get-random-values';
import React, {useEffect, useState} from "react";
import {SafeAreaView, ScrollView, StyleSheet, View} from "react-native";
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

/**
 * SupportCenter component.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component
 */
export const SupportCenter = ({navigation}: SupportCenterProps) => {
    // constants used to keep track of local component state
    const [isReady, setIsReady] = useState<boolean>(true);
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
    const [supportModalVisible, setSupportModalVisible] = useState<boolean>(false);
    const [supportModalMessage, setSupportModalMessage] = useState<string>('');
    const [supportModalButtonMessage, setSupportModalButtonMessage] = useState<string>('');
    // constants used to keep track of shared states
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

                    console.log('Message sent!');
                    setSupportModalMessage('Thank you for your inquiry! One of our team members will get back to you shortly!');
                    setSupportModalButtonMessage('Dismiss');
                    setSupportModalVisible(true);
                    break;
                case 'unknown':
                    // release the loader on button press
                    setIsReady(true);

                    console.log('Unknown error has occurred while attempting to send a message!');
                    setSupportModalMessage('An unexpected error occurred while attempting to contact our team');
                    setSupportModalButtonMessage('Retry');
                    setSupportModalVisible(true);
                    break;
                case 'cancelled':
                    // release the loader on button press
                    setIsReady(true);

                    console.log('Message was cancelled!');
                    setSupportModalMessage('It looks like you cancelled your inquiry to our team! If you do need help, please ensure that you send your message beforehand!');
                    setSupportModalButtonMessage('Ok');
                    setSupportModalVisible(true);
                    break;
            }
        } else {
            // release the loader on button press
            setIsReady(true);

            // there's no SMS available on this device
            console.log('no SMS available');
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
                                                await contactSupport();
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
