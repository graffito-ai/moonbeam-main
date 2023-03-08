import 'react-native-get-random-values';
import React, {useEffect} from "react";
import {Dimensions, SafeAreaView, View} from "react-native";
import {commonStyles} from "../styles/common.module";
import {Button, Divider, List, Text} from "react-native-paper";
import {styles} from "../styles/bankAccounts.module";
// @ts-ignore
import FriendReferral from '../../assets/refer-friend.png';
import {BankAccountsProps} from "../models/SettingsStackProps";

/**
 * Home BankAccounts component.
 */
export const BankAccounts = ({route}: BankAccountsProps) => {
    // state driven key-value pairs for UI related elements

    // state driven key-value pairs for any specific data values

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        route.params.setBottomTabNavigationShown(false);
    }, []);

    // return the component for the Bank Accounts page
    return (
        <SafeAreaView style={[commonStyles.rowContainer, commonStyles.androidSafeArea]}>
            <View style={styles.mainView}>
                <View style={styles.titleView}>
                    <Text style={styles.mainTitle}>Bank Accounts</Text>
                </View>
                <View style={styles.content}>
                    <List.Section style={styles.listSectionView}>
                        <List.Subheader style={styles.subHeaderTitle}>Connected Accounts</List.Subheader>
                        <Divider style={[commonStyles.divider, {width: Dimensions.get('window').width / 1.15}]}/>
                        <List.Item
                            style={styles.bankItemStyle}
                            titleStyle={styles.bankItemTitle}
                            descriptionStyle={styles.bankItemDetails}
                            titleNumberOfLines={1}
                            descriptionNumberOfLines={2}
                            title="Hurry!"
                            description='Connect your first account below'
                            right={() => <List.Icon color={'red'} icon="exclamation"/>}
                        />
                        {/*<List.Item*/}
                        {/*    style={styles.bankItemStyle}*/}
                        {/*    titleStyle={styles.bankItemTitle}*/}
                        {/*    descriptionStyle={styles.bankItemDetails}*/}
                        {/*    titleNumberOfLines={1}*/}
                        {/*    descriptionNumberOfLines={1}*/}
                        {/*    title="Bank of America"*/}
                        {/*    description='Checking ***2107'*/}
                        {/*    left={() => <List.Icon color={'#2A3779'} icon="bank"/>}*/}
                        {/*    right={() => <List.Icon color={'#2A3779'} icon="chevron-right"/>}*/}
                        {/*/>*/}
                        {/*<Divider style={[commonStyles.divider, {width: Dimensions.get('window').width / 1.15}]}/>*/}
                        {/*<List.Item*/}
                        {/*    style={styles.bankItemStyle}*/}
                        {/*    titleStyle={styles.bankItemTitle}*/}
                        {/*    descriptionStyle={styles.bankItemDetails}*/}
                        {/*    titleNumberOfLines={1}*/}
                        {/*    descriptionNumberOfLines={1}*/}
                        {/*    title="Bank of America"*/}
                        {/*    description='Savings **4506'*/}
                        {/*    left={() => <List.Icon color={'#2A3779'} icon="bank"/>}*/}
                        {/*    right={() => <List.Icon color={'#2A3779'} icon="chevron-right"/>}*/}
                        {/*/>*/}
                        {/*<Divider style={[commonStyles.divider, {width: Dimensions.get('window').width / 1.15}]}/>*/}
                        {/*<List.Item*/}
                        {/*    style={styles.bankItemStyle}*/}
                        {/*    titleStyle={styles.bankItemTitle}*/}
                        {/*    descriptionStyle={styles.bankItemDetails}*/}
                        {/*    titleNumberOfLines={1}*/}
                        {/*    descriptionNumberOfLines={1}*/}
                        {/*    title="Wells Fargo"*/}
                        {/*    description='Saving ***2907'*/}
                        {/*    left={() => <List.Icon color={'#2A3779'} icon="bank"/>}*/}
                        {/*    right={() => <List.Icon color={'#2A3779'} icon="chevron-right"/>}*/}
                        {/*/>*/}
                    </List.Section>
                    <List.Section style={styles.listSectionView}>
                        <List.Subheader style={styles.subHeaderTitle}>Pending Accounts</List.Subheader>
                        <Divider style={[commonStyles.divider, {width: Dimensions.get('window').width / 1.15}]}/>
                        <List.Item
                            style={styles.bankItemStyle}
                            titleStyle={styles.bankItemTitle}
                            descriptionStyle={styles.bankItemDetails}
                            titleNumberOfLines={1}
                            descriptionNumberOfLines={2}
                            title="Great job!"
                            description='No accounts pending verification'
                            right={() => <List.Icon color={'green'} icon="check"/>}
                        />
                    </List.Section>
                </View>
                <View style={styles.bottomView}>
                    <Divider style={[commonStyles.divider, {width: Dimensions.get('window').width}]}/>
                    <Button
                        onPress={async () => {
                        }}
                        uppercase={false}
                        style={styles.connectButton}
                        textColor={"#f2f2f2"}
                        buttonColor={"#2A3779"}
                        mode="outlined"
                        labelStyle={{fontSize: 18}}
                        icon={"plus"}>
                        Add a new Account
                    </Button>
                    <View style={styles.bottomTextView}>
                        <Text style={styles.bottomText}>Can't connect ?
                            <Text style={styles.bottomTextButton}
                                  onPress={() => {

                                  }}> Add account manually</Text>
                        </Text>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}
