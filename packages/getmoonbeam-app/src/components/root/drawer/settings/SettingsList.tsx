import {Dimensions, SafeAreaView, ScrollView, StyleSheet, View} from "react-native";
import {Divider, List} from "react-native-paper";
import React, {useEffect} from "react";
import {SettingsListProps} from "../../../../models/props/SettingsProps";
import {commonStyles} from "../../../../styles/common.module";
import {styles} from "../../../../styles/settingsList.module";
// @ts-ignore
import FaceIDIcon from '../../../../../assets/face-id-icon.png';

/**
 * SettingsList component
 *
 * @constructor constructor for the component
 */
export const SettingsList = ({}: SettingsListProps) => {

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
    }, []);

    // return the component for the SettingsList page
    return (
        <>
            {
                <SafeAreaView style={commonStyles.rowContainer}>
                    <View style={[styles.settingsContentView, StyleSheet.absoluteFill]}>
                        <ScrollView scrollEnabled={true}
                                    persistentScrollbar={false}
                                    showsVerticalScrollIndicator={false}
                                    keyboardShouldPersistTaps={'handled'}>
                            <List.Section style={styles.listSectionView}>
                                <List.Subheader style={styles.subHeaderTitle}>Account Management</List.Subheader>
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
                                    right={() => <List.Icon style={{left: Dimensions.get('window').width/60}} color={'#F2FF5D'} icon="chevron-right"/>}
                                />
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
                                    right={() => <List.Icon style={{left: Dimensions.get('window').width/60}} color={'#F2FF5D'} icon={FaceIDIcon}/>}
                                />
                            </List.Section>
                            <List.Section style={styles.listSectionView}>
                                <List.Subheader style={styles.subHeaderTitle}>Wallet Management</List.Subheader>
                                <Divider style={styles.divider}/>
                                <Divider style={styles.divider}/>
                                <List.Item
                                    style={styles.settingsItemStyle}
                                    titleStyle={styles.settingsItemTitle}
                                    descriptionStyle={styles.settingsItemDescription}
                                    titleNumberOfLines={10}
                                    descriptionNumberOfLines={10}
                                    title="Opt Out"
                                    description='You will automatically be opted out of all the cashback programs that you enrolled into, and your card will be un-linked.'
                                    left={() => <List.Icon color={'#F2FF5D'} icon="credit-card-remove-outline"/>}
                                    right={() => <List.Icon style={{left: Dimensions.get('window').width/60}} color={'#F2FF5D'} icon={FaceIDIcon}/>}
                                />
                            </List.Section>
                            <List.Section style={styles.listSectionView}>
                                <List.Subheader style={styles.subHeaderTitle}>Security and Privacy</List.Subheader>
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
                                    right={() => <List.Icon style={{left: Dimensions.get('window').width/60}} color={'#F2FF5D'} icon="chevron-right"/>}
                                />
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
                                    right={() => <List.Icon style={{left: Dimensions.get('window').width/60}} color={'#F2FF5D'} icon="chevron-right"/>}
                                />
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
                                    right={() => <List.Icon style={{left: Dimensions.get('window').width/60}} color={'#F2FF5D'} icon="chevron-right"/>}
                                />
                            </List.Section>
                        </ScrollView>
                    </View>
                </SafeAreaView>
            }
        </>
    );
}
