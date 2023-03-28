import {Dimensions, SafeAreaView, ScrollView, View} from "react-native";
import {commonStyles} from "../../../styles/common.module";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {styles} from "../../../styles/settingsList.module";
import {Button, Card, Divider, List, Text} from "react-native-paper";
import {Avatar} from "@rneui/base";
import React, {useEffect, useState} from "react";
import {SettingsListProps} from "../../../models/SettingsStackProps";

/**
 * Settings List component.
 */
export const SettingsList = ({route, navigation}: SettingsListProps) => {
    // state driven key-value pairs for UI related elements
    const [currentUserTitle, setCurrentUserTitle] = useState<string>("N/A");
    const [currentUserFirstName, setCurrentUserFirstName] = useState<string>("N/A");

    // state driven key-value pairs for any specific data values

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // set the title of the user's avatar in the dashboard, based on the user's information
        const secondInitial = route.params.currentUserInformation["name"].split(" ").length > 2 ? 2 : 1;
        setCurrentUserTitle(`${Array.from(route.params.currentUserInformation["name"].split(" ")[0])[0] as string}${Array.from(route.params.currentUserInformation["name"].split(" ")[secondInitial])[0] as string}`);
        setCurrentUserFirstName(`${route.params.currentUserInformation["name"].split(" ")[0]}`);
    }, []);


    // return the component for the Settings List page
    return (
        <SafeAreaView style={[commonStyles.rowContainer, commonStyles.androidSafeArea]}>
            <KeyboardAwareScrollView
                enableOnAndroid={true}
                scrollEnabled={true}
                keyboardShouldPersistTaps={'handled'}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.settingsContentView}>
                    <ScrollView scrollEnabled={true}
                                persistentScrollbar={false}
                                showsVerticalScrollIndicator={false}>
                        <Card style={[styles.cardStyleProfileSettings, {
                            width: Dimensions.get('window').width / 1.3
                        }]} mode={'elevated'} elevation={5}>
                            <Card.Title title={currentUserFirstName} subtitle="Member since '23."
                                        titleStyle={styles.cardTitleStyle} subtitleStyle={styles.cardSubtitleStyle}
                                        subtitleNumberOfLines={2}/>
                            <Card.Content>
                                <Text variant={"bodyMedium"} style={styles.cardBodyStyle}>Manage your profile, by
                                    keeping your information updated.</Text>
                                <View style={styles.profileIconImageView}>
                                    <Avatar
                                        size={100}
                                        rounded
                                        title={currentUserTitle}
                                        containerStyle={{backgroundColor: 'grey'}}
                                    ></Avatar>
                                </View>
                            </Card.Content>
                            <Button
                                uppercase={false}
                                onPress={() => {
                                }}
                                style={[{
                                    marginBottom: '5%',
                                    marginTop: '5%',
                                    alignSelf: 'center',
                                    height: Dimensions.get('window').width / 10
                                }]}
                                textColor={"#f2f2f2"}
                                buttonColor={"#2A3779"}
                                mode="outlined"
                                labelStyle={{fontSize: 13}}>
                                Edit Profile
                            </Button>
                        </Card>

                        <List.Section style={styles.listSectionView}>
                            <List.Subheader style={styles.subHeaderTitle}>Card Management</List.Subheader>
                            <Divider style={[commonStyles.divider, {width: Dimensions.get('window').width / 1.15}]}/>
                            <List.Item
                                style={styles.settingsItemStyle}
                                titleStyle={styles.settingsItemTitle}
                                descriptionStyle={styles.settingsItemDescription}
                                titleNumberOfLines={2}
                                descriptionNumberOfLines={2}
                                title="Confirm Card"
                                description='Activate your new Alpha card, and connect it to this account.'
                                left={() => <List.Icon color={'#2A3779'} icon="card-plus"/>}
                                right={() => <List.Icon color={'#2A3779'} icon="chevron-right"/>}
                            />
                            <Divider style={[commonStyles.divider, {width: Dimensions.get('window').width / 1.15}]}/>
                            <List.Item
                                style={styles.settingsItemStyle}
                                titleStyle={styles.settingsItemTitle}
                                descriptionStyle={styles.settingsItemDescription}
                                titleNumberOfLines={2}
                                descriptionNumberOfLines={2}
                                title="Replace Card"
                                description='Replace your lost, stolen, or damaged Alpha card.'
                                left={() => <List.Icon color={'#2A3779'} icon="credit-card-off-outline"/>}
                                right={() => <List.Icon color={'#2A3779'} icon="chevron-right"/>}
                            />
                            <Divider style={[commonStyles.divider, {width: Dimensions.get('window').width / 1.15}]}/>
                            <List.Item
                                style={styles.settingsItemStyle}
                                titleStyle={styles.settingsItemTitle}
                                descriptionStyle={styles.settingsItemDescription}
                                titleNumberOfLines={2}
                                descriptionNumberOfLines={2}
                                title="Lock Card"
                                description='Put a temporary lock on your Alpha card.'
                                left={() => <List.Icon color={'#2A3779'} icon="credit-card-lock"/>}
                                right={() => <List.Icon color={'#2A3779'} icon="chevron-right"/>}
                            />
                        </List.Section>
                        <List.Section style={styles.listSectionView}>
                            <List.Subheader style={styles.subHeaderTitle}>Payment Tools</List.Subheader>
                            <Divider style={[commonStyles.divider, {width: Dimensions.get('window').width / 1.15}]}/>
                            <List.Item
                                style={styles.settingsItemStyle}
                                titleStyle={styles.settingsItemTitle}
                                descriptionStyle={styles.settingsItemDescription}
                                titleNumberOfLines={2}
                                descriptionNumberOfLines={2}
                                title="Bank Accounts"
                                description='Manage your payment sources, linked to your Moonbeam Account.'
                                left={() => <List.Icon color={'#2A3779'} icon="bank"/>}
                                right={() => <List.Icon color={'#2A3779'} icon="chevron-right"/>}
                                onPress={() => {
                                    navigation.navigate('BankAccounts', {
                                        currentUserInformation: route.params.currentUserInformation,
                                        oauthStateId: undefined
                                    })
                                }}
                            />
                            <Divider style={[commonStyles.divider, {width: Dimensions.get('window').width / 1.15}]}/>
                            <List.Item
                                style={styles.settingsItemStyle}
                                titleStyle={styles.settingsItemTitle}
                                descriptionStyle={styles.settingsItemDescription}
                                titleNumberOfLines={2}
                                descriptionNumberOfLines={2}
                                title="AutoPay"
                                description='Set up automatic payments for your daily or bi-weekly balance payments.'
                                left={() => <List.Icon color={'#2A3779'} icon="autorenew"/>}
                                right={() => <List.Icon color={'#2A3779'} icon="chevron-right"/>}
                            />
                            <Divider style={[commonStyles.divider, {width: Dimensions.get('window').width / 1.15}]}/>
                            <List.Item
                                style={styles.settingsItemStyle}
                                titleStyle={styles.settingsItemTitle}
                                descriptionStyle={styles.settingsItemDescription}
                                titleNumberOfLines={2}
                                descriptionNumberOfLines={2}
                                title="Virtual Wallet & Merchants"
                                description='Add your Alpha card to your favorite Wallets & Merchants.'
                                left={() => <List.Icon color={'#2A3779'} icon="wallet"/>}
                                right={() => <List.Icon color={'#2A3779'} icon="chevron-right"/>}
                            />
                        </List.Section>
                        <List.Section style={styles.listSectionView}>
                            <List.Subheader style={styles.subHeaderTitle}>Security & Privacy</List.Subheader>
                            <Divider style={[commonStyles.divider, {width: Dimensions.get('window').width / 1.15}]}/>
                            <List.Item
                                style={styles.settingsItemStyle}
                                titleStyle={styles.settingsItemTitle}
                                descriptionStyle={styles.settingsItemDescription}
                                titleNumberOfLines={2}
                                descriptionNumberOfLines={2}
                                title="Face ID"
                                description='Enhance your login experience, by enabling Face ID.'
                                left={() => <List.Icon color={'#2A3779'} icon="emoticon"/>}
                                right={() => <List.Icon color={'#2A3779'} icon="chevron-right"/>}
                            />
                            <Divider style={[commonStyles.divider, {width: Dimensions.get('window').width / 1.15}]}/>
                            <List.Item
                                style={styles.settingsItemStyle}
                                titleStyle={styles.settingsItemTitle}
                                descriptionStyle={styles.settingsItemDescription}
                                titleNumberOfLines={2}
                                descriptionNumberOfLines={2}
                                title="Two-Factor Authentication"
                                description='Secure your account even further, with two-step verification.'
                                left={() => <List.Icon color={'#2A3779'} icon="lock"/>}
                                right={() => <List.Icon color={'#2A3779'} icon="chevron-right"/>}
                            />
                            <Divider style={[commonStyles.divider, {width: Dimensions.get('window').width / 1.15}]}/>
                            <List.Item
                                style={styles.settingsItemStyle}
                                titleStyle={styles.settingsItemTitle}
                                descriptionStyle={styles.settingsItemDescription}
                                titleNumberOfLines={2}
                                descriptionNumberOfLines={2}
                                title="Privacy Preferences"
                                description='Manage your privacy and marketing settings.'
                                left={() => <List.Icon color={'#2A3779'} icon="eye"/>}
                                right={() => <List.Icon color={'#2A3779'} icon="chevron-right"/>}
                            />
                        </List.Section>
                        <List.Section style={styles.listSectionView}>
                            <List.Subheader style={styles.subHeaderTitle}>Documents</List.Subheader>
                            <Divider style={[commonStyles.divider, {width: Dimensions.get('window').width / 1.15}]}/>
                            <List.Item
                                style={styles.settingsItemStyle}
                                titleStyle={styles.settingsItemTitle}
                                descriptionStyle={styles.settingsItemDescription}
                                titleNumberOfLines={2}
                                descriptionNumberOfLines={2}
                                title="Card member agreement"
                                description='View your Alpha card details, including your member terms.'
                                onPress={async () => {
                                    navigation.navigate('DocumentViewer', {
                                        name: 'cardAgreement.pdf',
                                        privacyFlag: true
                                    });
                                }}
                                left={() => <List.Icon color={'#2A3779'} icon="signature"/>}
                                right={() => <List.Icon color={'#2A3779'} icon="chevron-right"/>}
                            />
                            <Divider style={[commonStyles.divider, {width: Dimensions.get('window').width / 1.15}]}/>
                            <List.Item
                                style={styles.settingsItemStyle}
                                titleStyle={styles.settingsItemTitle}
                                descriptionStyle={styles.settingsItemDescription}
                                titleNumberOfLines={2}
                                descriptionNumberOfLines={2}
                                title="Terms and Conditions"
                                description='Review what was agreed upon your sign up process.'
                                onPress={async () => {
                                    navigation.navigate('DocumentViewer', {
                                        name: 'termsAndConditions.pdf',
                                        privacyFlag: false
                                    });
                                }}
                                left={() => <List.Icon color={'#2A3779'} icon="text"/>}
                                right={() => <List.Icon color={'#2A3779'} icon="chevron-right"/>}
                            />
                            <Divider style={[commonStyles.divider, {width: Dimensions.get('window').width / 1.15}]}/>
                            <List.Item
                                style={styles.settingsItemStyle}
                                titleStyle={styles.settingsItemTitle}
                                descriptionStyle={styles.settingsItemDescription}
                                titleNumberOfLines={2}
                                descriptionNumberOfLines={2}
                                title="Privacy Policy"
                                description='Get details about how we store, share and use your information.'
                                onPress={async () => {
                                    navigation.navigate('DocumentViewer', {
                                        name: 'privacyPolicy.pdf',
                                        privacyFlag: false
                                    });
                                }}
                                left={() => <List.Icon color={'#2A3779'} icon="eye-off"/>}
                                right={() => <List.Icon color={'#2A3779'} icon="chevron-right"/>}
                            />
                        </List.Section>
                    </ScrollView>
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}
