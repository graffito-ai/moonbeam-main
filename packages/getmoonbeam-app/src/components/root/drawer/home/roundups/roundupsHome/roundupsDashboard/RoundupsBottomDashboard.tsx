import React, {useEffect} from "react";
// @ts-ignore
import MoonbeamStorePlaceholder from "../../../../../../../assets/art/moonbeam-store-placeholder.png";
import {MoonbeamTransaction} from "@moonbeam/moonbeam-models";
import {styles} from "../../../../../../../styles/roundupsDashboard.module";
import {Platform, ScrollView, View} from "react-native";
import {heightPercentageToDP as hp} from "react-native-responsive-screen";
import {List} from "react-native-paper";
import {Divider} from "@rneui/base";

/**
 * RoundupsBottomDashboard component.
 *
 * @param props component properties to be passed in.
 * @constructor constructor for the component.
 */
export const RoundupsBottomDashboard = (props: {
    setSelectedTransaction: React.Dispatch<React.SetStateAction<MoonbeamTransaction | null>> | null,
}) => {
    // constants used to keep track of shared states


    /**
     * Function used to filter transactional data and return the roundups transactions.
     *
     * @return {@link React.ReactNode} or {@link React.ReactNode[]}
     */
    const filterRoundupTransactions = (): React.ReactNode | React.ReactNode[] => {
        let results: React.ReactNode[] = [];

        return results;
    }

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
    }, []);

    // return the component for the RoundupsBottomDashboard, part of the Dashboard page
    return (
        <>
            {
                <View style={[styles.bottomView, Platform.OS === 'android' && {
                    borderTopColor: '#0000000D',
                    borderLeftColor: '#0000000D',
                    borderRightColor: '#0000000D',
                    borderTopWidth: hp(0.65),
                    borderLeftWidth: hp(0.65),
                    borderRightWidth: hp(0.65)
                }]}>
                    <List.Subheader style={styles.subHeaderTitle}>
                        Savings Activity
                    </List.Subheader>
                    <Divider
                        style={[styles.mainDivider, {backgroundColor: '#FFFFFF'}]}/>
                    <ScrollView
                        scrollEnabled={true}
                        persistentScrollbar={false}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps={'handled'}
                        contentContainerStyle={styles.individualTransactionContainer}
                    >
                        <List.Section>
                            {filterRoundupTransactions()}
                        </List.Section>
                    </ScrollView>
                </View>
            }
        </>
    );
}
