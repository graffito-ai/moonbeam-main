import {SettingsTabProps} from "../models/BottomBarProps";
import {Dimensions, ImageBackground, SafeAreaView, ScrollView, View} from "react-native";
import {commonStyles} from "../styles/common.module";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {styles} from "../styles/settings.module";
import {Button, Card, Divider, List, Text} from "react-native-paper";
import {Avatar} from "@rneui/base";
import React from "react";

/**
 * Settings component.
 */
export const Settings = ({}: SettingsTabProps) => {
    // state driven key-value pairs for UI related elements

    // state driven key-value pairs for any specific data values

    return (
        <SafeAreaView style={[commonStyles.rowContainer, commonStyles.androidSafeArea]}>
            <KeyboardAwareScrollView
                enableOnAndroid={true}
                scrollEnabled={true}
                keyboardShouldPersistTaps={'handled'}
            >
                <View style={styles.topBarView}>
                    <ImageBackground
                        imageStyle={{
                            resizeMode: 'contain',
                            opacity: 0.6,
                            alignSelf: 'center'
                        }}
                        source={require('../../assets/top-bar-background.png')}>
                        <View style={styles.insideBarView}>
                            <View style={{width: Dimensions.get('window').width / 3}}></View>
                            <View style={styles.dashboardColumnItemMiddle}>
                                <Text style={styles.dashboardColumnItemMiddleText}>
                                    Settings
                                </Text>
                            </View>
                            <View style={styles.dashboardColumnItemLast}>
                            </View>
                        </View>
                    </ImageBackground>
                </View>
                <View style={styles.settingsContentView}>
                    <ScrollView scrollEnabled={true}
                                persistentScrollbar={false} showsHorizontalScrollIndicator={false}>
                        <Card style={[styles.cardStyleProfileSettings, {
                            width: Dimensions.get('window').width / 1.3
                        }]} mode={'elevated'} elevation={5}>
                            <Card.Title title="Marius" subtitle="Member since '23."
                                        titleStyle={styles.cardTitleStyle} subtitleStyle={styles.cardSubtitleStyle}
                                        subtitleNumberOfLines={2}/>
                            <Card.Content>
                                <Text variant={"bodyMedium"} style={styles.cardBodyStyle}>Manage your profile, by
                                    keeping your information updated.</Text>
                                <View style={styles.profileIconImageView}>
                                    <Avatar
                                        size={100}
                                        rounded
                                        title="MA"
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

                        <List.Section style={{width: Dimensions.get('window').width}}>
                            <List.Subheader style={styles.subHeaderTitle}>Card Management</List.Subheader>
                            <Divider style={[commonStyles.divider, {width: Dimensions.get('window').width}]}/>
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
                            <Divider style={[commonStyles.divider, {width: Dimensions.get('window').width}]}/>
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
                            <Divider style={[commonStyles.divider, {width: Dimensions.get('window').width}]}/>
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
                            <Divider style={[commonStyles.divider, {width: Dimensions.get('window').width}]}/>

                            <List.Subheader style={styles.subHeaderTitle}>Payment Tools</List.Subheader>
                            <Divider style={[commonStyles.divider, {width: Dimensions.get('window').width}]}/>
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
                            />
                            <Divider style={[commonStyles.divider, {width: Dimensions.get('window').width}]}/>
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
                            <Divider style={[commonStyles.divider, {width: Dimensions.get('window').width}]}/>
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
                            <Divider style={[commonStyles.divider, {width: Dimensions.get('window').width}]}/>

                            <List.Subheader style={styles.subHeaderTitle}>Security & Privacy</List.Subheader>
                            <Divider style={[commonStyles.divider, {width: Dimensions.get('window').width}]}/>
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
                            <Divider style={[commonStyles.divider, {width: Dimensions.get('window').width}]}/>
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
                            <Divider style={[commonStyles.divider, {width: Dimensions.get('window').width}]}/>
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
                            <Divider style={[commonStyles.divider, {width: Dimensions.get('window').width}]}/>
                        </List.Section>
                    </ScrollView>
                </View>

            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}
