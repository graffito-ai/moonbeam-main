import React, {useEffect} from "react";
// @ts-ignore
import MoonbeamProfilePlaceholder from "../../../../../../../../assets/art/moonbeam-profile-placeholder.png";
import {Image, Text, View} from "react-native";
import {styles} from "../../../../../../styles/roundups.module";
// @ts-ignore
import MoonbeamBankLinking from "../../../../../../../assets/moonbeam-bank-linking-step.png";
// @ts-ignore
import MoonbeamLinking1 from "../../../../../../../assets/moonbeam-bank-linking-1.png";
// @ts-ignore
import MoonbeamLinking2 from "../../../../../../../assets/moonbeam-bank-linking-2.png";
// @ts-ignore
import MoonbeamLinking3 from "../../../../../../../assets/moonbeam-bank-linking-3.png";
// @ts-ignore
import MoonbeamLinking4 from "../../../../../../../assets/moonbeam-bank-linking-4.png";

/**
 * AccountLinkingSummaryStep component.
 *
 * @constructor constructor for the component.
 */
export const AccountLinkingSummaryStep = () => {
    // constants used to keep track of local component state

    // constants used to keep track of shared states


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
                source={MoonbeamBankLinking}
                resizeMode={"contain"}
            />
            <Text
                numberOfLines={1}
                style={styles.accountChoiceTitle}>
                {"Choose a Checking Account"}
            </Text>
            <Text
                numberOfLines={3}
                style={styles.bankLinkingSubTitle}>
                {"This account will be used for depositing your savings and withdrawing your roundups."}
            </Text>
            <View style={styles.roundupsOverviewBox}>
                <View style={styles.overviewItemView}>
                    <Image
                        style={styles.overviewIcon}
                        source={MoonbeamLinking1}
                        resizeMethod={"scale"}
                        resizeMode={"contain"}
                    />
                    <Text
                        numberOfLines={2}
                        style={styles.bankLinkingOverviewItemText}>
                        {"Make sure your have your bank\ninformation handy."}
                    </Text>
                </View>
                <View style={styles.overviewItemView}>
                    <Image
                        style={styles.overviewIcon}
                        source={MoonbeamLinking2}
                        resizeMethod={"scale"}
                        resizeMode={"contain"}
                    />
                    <Text
                        numberOfLines={2}
                        style={styles.bankLinkingOverviewItemText}>
                        {"Connect securely with Plaid.\nYour data is fully encrypted."}
                    </Text>
                </View>
                <View style={styles.overviewItemView}>
                    <Image
                        style={styles.overviewIcon}
                        source={MoonbeamLinking3}
                        resizeMethod={"scale"}
                        resizeMode={"contain"}
                    />
                    <Text
                        numberOfLines={2}
                        style={styles.bankLinkingOverviewItemText}>
                        {"We do not have access to\nyour bank login information."}
                    </Text>
                </View>
                <View style={styles.overviewItemView}>
                    <Image
                        style={styles.overviewIcon}
                        source={MoonbeamLinking4}
                        resizeMethod={"scale"}
                        resizeMode={"contain"}
                    />
                    <Text
                        numberOfLines={2}
                        style={styles.bankLinkingOverviewItemText}>
                        {"We won't start moving money\nuntil you authorize it."}
                    </Text>
                </View>
            </View>
        </>
    );
}
