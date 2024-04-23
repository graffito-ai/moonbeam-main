import React, {useEffect, useState} from 'react';
import {RoundupsSplashProps} from "../../../../../../models/props/RoundupsProps";
import {styles} from "../../../../../../styles/roundups.module";
import {Image, Text, TouchableOpacity, View} from "react-native";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Icon} from "@rneui/base";
import {roundupsActiveState} from "../../../../../../recoil/RoundupsAtom";
import {useRecoilState} from "recoil";
import {
    bottomBarNavigationState,
    bottomTabNeedsShowingState,
    bottomTabShownState
} from "../../../../../../recoil/HomeAtom";
import {appDrawerHeaderShownState, customBannerShown, drawerSwipeState} from "../../../../../../recoil/AppDrawerAtom";
// @ts-ignore
import RoundupsSplash1 from "../../../../../../../assets/moonbeam-roundups-splash-1.png";
// @ts-ignore
import MoonbeamRoundupsOverview1 from "../../../../../../../assets/moonbeam-roundups-overview-1.png";
// @ts-ignore
import MoonbeamRoundupsOverview2 from "../../../../../../../assets/moonbeam-roundups-overview-2.png";
// @ts-ignore
import MoonbeamRoundupsOverview3 from "../../../../../../../assets/moonbeam-roundups-overview-3.png";
// @ts-ignore
import MoonbeamRoundupsOverview4 from "../../../../../../../assets/moonbeam-roundups-overview-4.png";
// @ts-ignore
import MoonbeamRoundupsStep1 from "../../../../../../../assets/moonbeam-roundups-step1.png";
// @ts-ignore
import MoonbeamRoundupsStep2 from "../../../../../../../assets/moonbeam-roundups-step2.png";
// @ts-ignore
import MoonbeamRoundupsStep3 from "../../../../../../../assets/moonbeam-roundups-step3.png";
// @ts-ignore
import MoonbeamRoundupsStep4 from "../../../../../../../assets/moonbeam-roundups-step4.png";

/**
 * RoundupsSplash component.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const RoundupsSplash = ({navigation}: RoundupsSplashProps) => {
    // constants used to keep track of local component state
    const [roundupsSplashStepNumber, setRoundupsSplashStepNumber] = useState<number>(0);

    // constants used to keep track of shared states
    const [areRoundupsActive,] = useRecoilState(roundupsActiveState);
    const [bottomBarNavigation,] = useRecoilState(bottomBarNavigationState);
    const [, setAppDrawerHeaderShown] = useRecoilState(appDrawerHeaderShownState);
    const [, setDrawerSwipeEnabled] = useRecoilState(drawerSwipeState);
    const [, setBannerShown] = useRecoilState(customBannerShown);
    const [, setBottomTabShown] = useRecoilState(bottomTabShownState);
    const [, setBottomTabNeedsShowing] = useRecoilState(bottomTabNeedsShowingState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
    }, []);

    // return the component for the RoundupsSplash page
    return (
        <>
            <SafeAreaView style={styles.roundupsSplashView}>
                <TouchableOpacity style={styles.closeIcon}>
                    <Icon
                        type={"antdesign"}
                        name={"close"}
                        size={hp(4.15)}
                        color={'#FFFFFF'}
                        onPress={async () => {
                            // reset the step number
                            setRoundupsSplashStepNumber(0);
                            /**
                             * if the roundups product is active, then we go back to the appropriate screen in the bottom bar,
                             * otherwise we go back to the Roundups Home
                             */
                            if (areRoundupsActive) {
                                navigation.goBack();
                            } else {
                                setAppDrawerHeaderShown(true);
                                setBannerShown(true);
                                setDrawerSwipeEnabled(true);
                                setBottomTabShown(true);
                                setBottomTabNeedsShowing(true);
                                bottomBarNavigation && bottomBarNavigation.goBack();
                            }
                        }}
                    />
                </TouchableOpacity>
                <View style={styles.roundupsSplashStepView}>
                    <View
                        style={roundupsSplashStepNumber === 0 ? styles.roundupsSplashStepActive : styles.roundupsSplashStepInactive}/>
                    <View
                        style={roundupsSplashStepNumber === 1 ? styles.roundupsSplashStepActive : styles.roundupsSplashStepInactive}/>
                    <View
                        style={roundupsSplashStepNumber === 2 ? styles.roundupsSplashStepActive : styles.roundupsSplashStepInactive}/>
                    <View
                        style={roundupsSplashStepNumber === 3 ? styles.roundupsSplashStepActive : styles.roundupsSplashStepInactive}/>
                    <View
                        style={roundupsSplashStepNumber === 4 ? styles.roundupsSplashStepActive : styles.roundupsSplashStepInactive}/>
                </View>
                <View style={styles.roundupsContentView}>
                    {
                        roundupsSplashStepNumber === 0 &&
                        <>
                            <Text
                                numberOfLines={1}
                                style={styles.roundupsSplashMainTitle}>
                                Savings Objectives
                            </Text>
                            <Text
                                numberOfLines={1}
                                style={styles.roundupsOverviewBoxTitle}>
                                How this works
                            </Text>
                            <View style={styles.roundupsOverviewBox}>
                                <View style={styles.overviewItemView}>
                                    <Image
                                        style={styles.overviewIcon}
                                        source={MoonbeamRoundupsOverview1}
                                        resizeMethod={"scale"}
                                        resizeMode={"contain"}
                                    />
                                    <Text
                                        numberOfLines={1}
                                        style={styles.overviewItemText}>
                                        Enroll an account
                                    </Text>
                                </View>
                                <View style={styles.overviewItemView}>
                                    <Image
                                        style={styles.overviewIcon}
                                        source={MoonbeamRoundupsOverview2}
                                        resizeMethod={"scale"}
                                        resizeMode={"contain"}
                                    />
                                    <Text
                                        numberOfLines={1}
                                        style={styles.overviewItemText}>
                                        Set your Savings Objective
                                    </Text>
                                </View>
                                <View style={styles.overviewItemView}>
                                    <Image
                                        style={styles.overviewIcon}
                                        source={MoonbeamRoundupsOverview3}
                                        resizeMethod={"scale"}
                                        resizeMode={"contain"}
                                    />
                                    <Text
                                        numberOfLines={1}
                                        style={styles.overviewItemText}>
                                        Shop like you normally would
                                    </Text>
                                </View>
                                <View style={styles.overviewItemView}>
                                    <Image
                                        style={styles.overviewIcon}
                                        source={MoonbeamRoundupsOverview4}
                                        resizeMethod={"scale"}
                                        resizeMode={"contain"}
                                    />
                                    <Text
                                        numberOfLines={1}
                                        style={styles.overviewItemText}>
                                        Automatically save with roundups
                                    </Text>
                                </View>
                            </View>
                            <Image
                                style={styles.roundupsSplash1}
                                source={RoundupsSplash1}/>
                        </>
                    }
                    {
                        roundupsSplashStepNumber === 1 &&
                        <>
                            <Text
                                numberOfLines={1}
                                style={styles.roundupsSplashMainTitle}>
                                Link
                            </Text>
                            <Text
                                style={styles.roundupsStepContentText}>
                                {"First, link your primary bank account to Moonbeam.\n"}
                            </Text>
                            <Text
                                style={styles.roundupsStepContentText}>
                                <Text style={styles.roundupsStepContentTextHighlighted}>Pro-tip: </Text>
                                Select a checking account that is linked to your debit card in order to save more!
                            </Text>
                            <Image
                                style={styles.roundupsStepImage}
                                source={MoonbeamRoundupsStep1}/>
                        </>
                    }
                    {
                        roundupsSplashStepNumber === 2 &&
                        <>
                            <Text
                                numberOfLines={1}
                                style={styles.roundupsSplashMainTitle}>
                                Plan
                            </Text>
                            <Text
                                style={styles.roundupsStepContentText}>
                                {"Next, set a Savings Objective that will help you stay on track or select from our pre-defined objectives.\n"}
                            </Text>
                            <Image
                                style={styles.roundupsStepImage}
                                source={MoonbeamRoundupsStep2}/>
                        </>
                    }
                    {
                        roundupsSplashStepNumber === 3 &&
                        <>
                            <Text
                                numberOfLines={1}
                                style={styles.roundupsSplashMainTitle}>
                                Spend
                            </Text>
                            <Text
                                style={styles.roundupsStepContentText}>
                                {"Shop or pay off bills. Spend as you normally would and we’ll keep track of your transactions.\n"}
                            </Text>
                            <Image
                                style={styles.roundupsStepImage}
                                source={MoonbeamRoundupsStep3}/>
                        </>
                    }
                    {
                        roundupsSplashStepNumber === 4 &&
                        <>
                            <Text
                                numberOfLines={1}
                                style={styles.roundupsSplashMainTitle}>
                                Save
                            </Text>
                            <Text
                                style={styles.roundupsStepContentText}>
                                {"Finally, we’ll roundup your transactions to the nearest dollar to help meet your Savings Objective.\n"}
                            </Text>
                            <Image
                                style={styles.roundupsStepImage4}
                                source={MoonbeamRoundupsStep4}/>
                        </>
                    }
                </View>
                <View style={[{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    position: 'absolute',
                    bottom: hp(5),
                }, (roundupsSplashStepNumber === 0) ? {alignSelf: 'center'} : {alignSelf: 'center', left: wp(12)}]}>
                    {
                        (roundupsSplashStepNumber === 0) &&
                        <TouchableOpacity
                            style={styles.nextButton}
                            onPress={() => {
                                // increase the step number all the way to Step 4
                                if (roundupsSplashStepNumber < 4) {
                                    setRoundupsSplashStepNumber(roundupsSplashStepNumber + 1);
                                }
                            }}
                        >
                            <Text
                                style={styles.nextButtonText}>{"Next"}</Text>
                        </TouchableOpacity>
                    }
                    {
                        (roundupsSplashStepNumber === 1 || roundupsSplashStepNumber === 2 || roundupsSplashStepNumber === 3 || roundupsSplashStepNumber === 4) &&
                        <>
                            <TouchableOpacity
                                style={styles.buttonLeft}
                                onPress={() => {
                                    // decrease the step number all the way to Step 0
                                    if (roundupsSplashStepNumber > 0) {
                                        setRoundupsSplashStepNumber(roundupsSplashStepNumber - 1);
                                    }
                                }}
                            >
                                <Text
                                    style={styles.buttonText}>{"Previous"}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.buttonLeft}
                                onPress={() => {
                                    // increase the step number all the way to Step 5
                                    if (roundupsSplashStepNumber < 4) {
                                        setRoundupsSplashStepNumber(roundupsSplashStepNumber + 1);
                                    }
                                }}
                            >
                                <Text
                                    style={styles.buttonText}>{(roundupsSplashStepNumber === 4) ? "Get Started" : "Next"}</Text>
                            </TouchableOpacity>
                        </>
                    }
                </View>
            </SafeAreaView>
        </>
    );
};
