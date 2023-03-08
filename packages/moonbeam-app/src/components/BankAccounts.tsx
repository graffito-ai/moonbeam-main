import 'react-native-get-random-values';
import React, {useEffect} from "react";
import {Dimensions, SafeAreaView, View} from "react-native";
import {commonStyles} from "../styles/common.module";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {Button, Text, Divider} from "react-native-paper";
import {styles} from "../styles/bankAccounts.module";
// @ts-ignore
import FriendReferral from '../../assets/refer-friend.png';
import {BankAccountsProps} from "../models/SettingsStackProps";

/**
 * Home BankAccounts component.
 */
export const BankAccounts = ({}: BankAccountsProps) => {
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

    }, []);

    // return the component for the Bank Accounts page
    return (
        <SafeAreaView style={[commonStyles.rowContainer, commonStyles.androidSafeArea]}>
            <KeyboardAwareScrollView
                enableOnAndroid={true}
                scrollEnabled={true}
                persistentScrollbar={false}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps={'handled'}>
                <View style={styles.mainView}>
                    <View style={styles.titleView}>
                        <Text style={styles.mainTitle}>Bank Accounts</Text>
                    </View>
                    <View style={styles.content}>
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
                    </View>
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}
