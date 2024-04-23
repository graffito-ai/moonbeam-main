import React, {useEffect} from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {RoundupsDashboardProps} from "../../../../../../../models/props/RoundupsHomeProps";
import {styles} from "../../../../../../../styles/roundupsDashboard.module";
import {RoundupsBottomDashboard} from "./RoundupsBottomDashboard";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {Icon} from "@rneui/base";
// @ts-ignore
import MoonbeamRoundupsCashOut from "../../../../../../../../assets/moonbeam-roundups-cashout.png";
// @ts-ignore
import MoonbeamRoundupsObjectives from "../../../../../../../../assets/moonbeam-roundups-objectives.png";
// @ts-ignore
import MoonbeamRoundupsNoObjectives from "../../../../../../../../assets/moonbeam-roundups-no-objectives.png";

/**
 * RoundupsDashboard component.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const RoundupsDashboard = ({navigation}: RoundupsDashboardProps) => {
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

    // return the component for the RoundupsDashboard page
    return (
        <>
            <SafeAreaView style={styles.dashboardView}>
                <View style={styles.topView}>
                    <Text
                        style={styles.savingsText}>{"Total Savings\n"}
                        <Text style={styles.savingsAmountText}> {"$ 0.00"}</Text>
                    </Text>
                    <TouchableOpacity
                        onPress={() => {
                            // ToDo: Go to the referral screen
                        }}
                        style={styles.referralButton}>
                        <Text style={styles.referralButtonText}>
                            Get $100
                        </Text>
                    </TouchableOpacity>
                    <Icon
                        style={styles.roundupAccountsIcon}
                        type={"material-community"}
                        name={"bank-outline"}
                        size={hp(3.75)}
                        color={'#FFFFFF'}
                        onPress={async () => {

                        }}
                    />
                </View>
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
                    <View style={{
                        top: hp(0.25),
                        alignSelf: 'center',
                        width: wp(97),
                        height: hp(17),
                        backgroundColor: '#313030',
                        flexDirection: 'row',
                        borderRadius: 18
                    }}>
                        <Image
                            style={styles.roundupsNoObjectivesImage}
                            source={MoonbeamRoundupsNoObjectives}/>
                        <View style={{top: hp(4.25), left: wp(6)}}>
                            <Text
                                numberOfLines={2}
                                style={styles.noRoundupObjectivesText}>
                                You don't have any Objectives set-up yet!
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
                    </View>
                </View>
                <RoundupsBottomDashboard setSelectedTransaction={null}/>
            </SafeAreaView>
        </>
    );
};
