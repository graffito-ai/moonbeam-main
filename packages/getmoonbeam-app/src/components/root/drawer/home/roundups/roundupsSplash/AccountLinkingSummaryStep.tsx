import React, {useEffect} from "react";
// @ts-ignore
import MoonbeamProfilePlaceholder from "../../../../../../../../assets/art/moonbeam-profile-placeholder.png";
import {Image, Text, View} from "react-native";
import {styles} from "../../../../../../styles/roundups.module";
// @ts-ignore
import MoonbeamAccountSummary from "../../../../../../../assets/moonbeam-account-summary-step.png";
import {useRecoilState} from "recoil";
import {linkedBankingItemsState} from "../../../../../../recoil/RoundupsAtom";
// @ts-ignore
import MoonbeamLinking1 from "../../../../../../../assets/moonbeam-bank-linking-1.png";

/**
 * AccountLinkingSummaryStep component.
 *
 * @constructor constructor for the component.
 */
export const AccountLinkingSummaryStep = () => {
    // constants used to keep track of local component state

    // constants used to keep track of shared states
    const [linkedBankingItems, ] = useRecoilState(linkedBankingItemsState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
    }, []);

    // return the component for the AccountLinkingSummaryStep, part of the RoundupsSplash page
    return (
        <>
            <Image
                style={styles.deltaOneImage}
                source={MoonbeamAccountSummary}
                resizeMode={"contain"}
            />
            <Text
                numberOfLines={1}
                style={styles.accountChoiceTitle}>
                {"Confirm your Account"}
            </Text>
            <Text
                numberOfLines={3}
                style={styles.bankLinkingSubTitle}>
                {"This linked account will be used for\ndeposits and withdrawals."}
            </Text>
            <View style={styles.roundupsOverviewBox}>
                <View style={styles.bankingAccountSummaryView}>
                    <Image
                        style={styles.bankingAccountItemIcon}
                        source={MoonbeamLinking1}
                        resizeMethod={"scale"}
                        resizeMode={"contain"}
                    />
                    <View style={styles.bankingAccountItemTextView}>
                        <Text
                            numberOfLines={1}
                            style={styles.bankingAccountItemTitleText}>
                            {/*@ts-ignore*/}
                            {`${linkedBankingItems[0].name}${linkedBankingItems[0].accounts[0].accountOfficialName}`}
                        </Text>
                        <Text
                            numberOfLines={1}
                            style={styles.bankingAccountItemText}>
                            {/*@ts-ignore*/}
                            {`${linkedBankingItems[0].accounts[0].accountOfficialName}${linkedBankingItems[0].accounts[0].accountOfficialName}`}
                        </Text>
                    </View>
                </View>
            </View>
        </>
    );
}
