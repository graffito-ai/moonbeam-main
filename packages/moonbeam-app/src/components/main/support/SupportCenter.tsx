import 'react-native-get-random-values';
import React, {useEffect, useState} from "react";
import {Dimensions, SafeAreaView, Text, TouchableHighlight, View} from "react-native";
import {commonStyles} from "../../../styles/common.module";
import {Button, Divider, List, Modal, Portal} from "react-native-paper";
import {styles} from "../../../styles/supportCenter.module";
import {SupportCenterProps} from '../../../models/SupportStackProps';
import * as SMS from 'expo-sms';

/**
 * SupportCenter component.
 */
export const SupportCenter = ({route, navigation}: SupportCenterProps) => {
    // state driven key-value pairs for UI related elements
    const [supportModalVisible, setSupportModalVisible] = useState<boolean>(false);
    const [supportModalMessage, setSupportModalMessage] = useState<string>('');
    const [supportModalButtonMessage, setSupportModalButtonMessage] = useState<string>('');
    const [isSupportModalError, setIsSupportModalError] = useState<boolean>(false);

    // state driven key-value pairs for any specific data values

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        route.params.setIsDrawerHeaderShown(true);
    }, [route]);

    /**
     * Function used to contact support, via the native messaging application.
     * It will also add the Moonbeam customer service number in the list of Contacts.
     */
    const contactSupport = async () => {
        const isAvailable = await SMS.isAvailableAsync();
        if (isAvailable) {
            // do your SMS stuff here
            const result = await SMS.sendSMSAsync(
                ['210-744-6222'],
                'Hello I would like some help with: ',
                {}
            );
            switch (result.result) {
                case 'sent':
                    console.log('Message sent!');
                    setSupportModalMessage('Thank you for your inquiry! One of our team members will get back to you shortly!');
                    setSupportModalButtonMessage('Dismiss');
                    setIsSupportModalError(false);
                    setSupportModalVisible(true);
                    break;
                case 'unknown':
                    console.log('Unknown error has occurred while attempting to send a message!');
                    setSupportModalMessage('An unexpected error occurred while attempting to contact our team');
                    setSupportModalButtonMessage('Retry');
                    setIsSupportModalError(true);
                    setSupportModalVisible(true);
                    break;
                case 'cancelled':
                    console.log('Message was cancelled!');
                    setSupportModalMessage('It looks like you cancelled your inquiry to our team! If you do need help, please ensure that you send your message beforehand!');
                    setSupportModalButtonMessage('Dismiss');
                    setIsSupportModalError(false);
                    setSupportModalVisible(true);
                    break;
            }
        } else {
            // there's no SMS available on this device
            console.log('no SMS available');
            setSupportModalMessage('Messaging not available on this platform!');
            setSupportModalButtonMessage('Dismiss');
            setIsSupportModalError(true);
            setSupportModalVisible(true);
        }
    }

    // return the component for the SupportCenter page
    return (
        <SafeAreaView style={[commonStyles.rowContainer, commonStyles.androidSafeArea]}>
            <Portal>
                <Modal dismissable={false} visible={supportModalVisible}
                       onDismiss={() => setSupportModalVisible(false)}
                       contentContainerStyle={styles.modalContainer}>
                    <Text style={styles.modalParagraph}>{supportModalMessage}</Text>
                    <Button
                        uppercase={false}
                        style={[styles.modalButton, isSupportModalError ? {borderColor: 'red'} : {borderColor: 'grey'}]}
                        {...!isSupportModalError && {
                            icon: 'redo-variant',
                            textColor: 'grey',
                            buttonColor: '#f2f2f2'
                        }}
                        {...isSupportModalError && {
                            icon: 'close-box',
                            textColor: 'red',
                            buttonColor: '#f2f2f2'
                        }}
                        mode="outlined"
                        labelStyle={{fontSize: 15}}
                        onPress={async () => {
                            setSupportModalVisible(false);
                        }}>
                        {supportModalButtonMessage}
                    </Button>
                </Modal>
            </Portal>
            <View>
                <View style={[styles.mainView]}>
                    <View style={styles.titleView}>
                        <Text style={styles.mainTitle}>Support Center</Text>
                    </View>
                    <View style={styles.content}>
                        <List.Section style={styles.listSectionView}>
                            <List.Subheader style={styles.subHeaderTitle}>Help</List.Subheader>
                            <Divider
                                style={[commonStyles.divider, {width: Dimensions.get('window').width / 1.15}]}/>
                            <TouchableHighlight
                                onPress={async () => {
                                    await contactSupport();
                                }}
                                underlayColor="transparent">
                                <List.Item
                                    style={styles.supportItemStyle}
                                    titleStyle={styles.supportItemTitle}
                                    descriptionStyle={styles.supportItemDetails}
                                    titleNumberOfLines={2}
                                    descriptionNumberOfLines={3}
                                    title={'Contact'}
                                    description={`You will be redirected to a live agent whom will be able to answer your questions.`}
                                    left={() =>
                                        <List.Icon color={'#2A3779'} icon="message"/>}
                                    right={() =>
                                        <List.Icon color={'#2A3779'} icon="chevron-right"/>}
                                />
                            </TouchableHighlight>
                        </List.Section>
                        <List.Section style={styles.listSectionView}>
                            <List.Subheader style={styles.subHeaderTitle}>Knowledge Base</List.Subheader>
                            <Divider
                                style={[commonStyles.divider, {width: Dimensions.get('window').width / 1.15}]}/>
                            <TouchableHighlight
                                onPress={() => {
                                    navigation.navigate('FAQ', {
                                        setIsDrawerHeaderShown: route.params.setIsDrawerHeaderShown
                                    });
                                }}
                                underlayColor="transparent">
                                <List.Item
                                    style={styles.supportItemStyle}
                                    titleStyle={styles.supportItemTitle}
                                    descriptionStyle={styles.supportItemDetails}
                                    titleNumberOfLines={2}
                                    descriptionNumberOfLines={3}
                                    title={'FAQ'}
                                    description={`Access our most frequently asked questions and answers.`}
                                    left={() =>
                                        <List.Icon color={'#2A3779'} icon="frequently-asked-questions"/>}
                                    right={() =>
                                        <List.Icon color={'#2A3779'} icon="chevron-right"/>}
                                />
                            </TouchableHighlight>
                        </List.Section>
                    </View>
                </View>
                <View style={styles.bottomView}>
                    <Divider style={[commonStyles.divider, {width: Dimensions.get('window').width}]}/>
                    <Button
                        onPress={async () => {
                        }}
                        uppercase={false}
                        style={styles.helpButton}
                        textColor={"#f2f2f2"}
                        buttonColor={"#2A3779"}
                        mode="outlined"
                        labelStyle={{fontSize: 18}}
                        icon={"timeline-help"}>
                        Get more help
                    </Button>
                    <View style={styles.bottomTextView}>
                        <Text numberOfLines={3} style={styles.bottomText}>Get more help by
                            <Text numberOfLines={2} style={styles.bottomTextButton}
                                  onPress={() => {
                                  }}> leaving feedback or engaging with our team</Text>
                        </Text>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}
