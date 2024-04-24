import React, {useEffect} from "react";
import {Image, Text, TouchableOpacity, View} from "react-native";
import {styles} from "../../../../../../../styles/roundupsDashboard.module";
// @ts-ignore
import MoonbeamRoundupsCashOut from "../../../../../../../../assets/moonbeam-roundups-cashout.png";
// @ts-ignore
import MoonbeamRoundupsObjectives from "../../../../../../../../assets/moonbeam-roundups-objectives.png";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
// @ts-ignore
import MoonbeamRoundupsNoObjectives from "../../../../../../../../assets/moonbeam-roundups-no-objectives.png";
import {useRecoilState} from "recoil";
import {showRoundupTransactionBottomSheetState} from "../../../../../../../recoil/DashboardAtom";

/**
 * RoundupsTopDashboard component.
 *
 * @constructor constructor for the component.
 */
export const RoundupsTopDashboard = () => {
    // constants used to keep track of local component state

    // constants used to keep track of shared states
    const [showRoundupTransactionsBottomSheet, ] = useRecoilState(showRoundupTransactionBottomSheetState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {

    }, []);

    // return the component for the RoundupsTopDashboard, part of the Dashboard page
    return (
        <>
            <View
                style={[
                    showRoundupTransactionsBottomSheet && {pointerEvents: "none"},
                    showRoundupTransactionsBottomSheet && {
                        backgroundColor: 'black', opacity: 0.75
                    },
                    {flex: 1}
                ]}
            >
                <View style={styles.roundupsTopButtonView}>
                    <TouchableOpacity
                        onPress={() => {

                        }}
                        style={styles.roundupsTopLeftButton}>
                        <Image
                            style={styles.roundupsTopButtonImage}
                            source={MoonbeamRoundupsCashOut}/>
                        <Text style={styles.roundupsTopButtonText}>
                            Transfer
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {

                        }}
                        style={styles.roundupsTopRightButton}>
                        <Image
                            style={styles.roundupsTopButtonImage}
                            source={MoonbeamRoundupsObjectives}/>
                        <Text style={styles.roundupsTopButtonText}>
                            Objectives
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={{
                    top: hp(0.5),
                    height: hp(22),
                    width: wp(100),
                    flexDirection: 'column',
                }}>
                    <Text style={{
                        fontSize: hp(2.35),
                        textAlign: 'left',
                        fontFamily: 'Changa-Medium',
                        color: '#FFFFFF',
                        alignSelf: 'flex-start',
                        left: wp(4)
                    }}>
                        Status
                    </Text>
                    <TouchableOpacity style={[styles.roundupsSavingsStatusView, showRoundupTransactionsBottomSheet && {height: hp(26.3)}]}>
                        <Image
                            style={styles.roundupsNoObjectivesImage}
                            source={MoonbeamRoundupsNoObjectives}/>
                        <View style={styles.roundupsSavingsStatusText}>
                            <Text
                                numberOfLines={2}
                                style={styles.noRoundupObjectivesText}>
                                You don't have any Objectives set up yet!
                            </Text>
                            <TouchableOpacity
                                style={styles.objectivesGetStartedButton}
                                onPress={() => {

                                }}
                            >
                                <Text
                                    style={styles.objectivesGetStartedButtonText}>{"Get Started"}</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </>
    );
}
