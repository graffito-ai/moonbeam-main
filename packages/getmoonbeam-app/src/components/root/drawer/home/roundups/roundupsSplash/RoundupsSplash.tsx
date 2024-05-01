import React, {useEffect, useState} from 'react';
import {RoundupsSplashProps} from "../../../../../../models/props/RoundupsProps";
import {styles} from "../../../../../../styles/roundups.module";
import {Image, Text, TouchableOpacity, View} from "react-native";
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Icon} from "@rneui/base";
import {
    isPlaidLinkInitiatedState,
    isRoundupsSplashReadyState,
    roundupsActiveState, roundupsSplashStepNumberState
} from "../../../../../../recoil/RoundupsAtom";
import {useRecoilState, useResetRecoilState} from "recoil";
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
import MoonbeamLinking1 from "../../../../../../../assets/moonbeam-bank-linking-1.png";
// @ts-ignore
import MoonbeamLinking2 from "../../../../../../../assets/moonbeam-bank-linking-2.png";
// @ts-ignore
import MoonbeamLinking3 from "../../../../../../../assets/moonbeam-bank-linking-3.png";
// @ts-ignore
import MoonbeamLinking4 from "../../../../../../../assets/moonbeam-bank-linking-4.png";
// @ts-ignore
import MoonbeamRoundupsStep1 from "../../../../../../../assets/moonbeam-roundups-step1.png";
// @ts-ignore
import MoonbeamRoundupsStep2 from "../../../../../../../assets/moonbeam-roundups-step2.png";
// @ts-ignore
import MoonbeamRoundupsStep3 from "../../../../../../../assets/moonbeam-roundups-step3.png";
// @ts-ignore
import MoonbeamRoundupsStep4 from "../../../../../../../assets/moonbeam-roundups-step4.png";
// @ts-ignore
import MoonbeamBankLinking from "../../../../../../../assets/moonbeam-bank-linking-step.png";
// @ts-ignore
import MoonbeamDeltaOneMembership from "../../../../../../../assets/moonbeam-delta-one-membership.png"
import GestureRecognizer from 'react-native-swipe-gestures';
import {Paragraph} from "react-native-paper";
import {AccountLinkingStep} from "./AccountLinkingStep";
import {Spinner} from "../../../../../common/Spinner";
import {splashStatusState} from "../../../../../../recoil/SplashAtom";
import {SplashScreen} from "../../../../../common/Splash";
import {PlaidLinkingSessionStep} from "./PlaidLinkingSessionStep";

/**
 * RoundupsSplash component.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const RoundupsSplash = ({navigation}: RoundupsSplashProps) => {
    // constants used to keep track of local component state
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
    // constants used to keep track of shared states
    const [roundupsSplashStepNumber, setRoundupsSplashStepNumber] = useRecoilState(roundupsSplashStepNumberState);
    const [areRoundupsActive,] = useRecoilState(roundupsActiveState);
    const [bottomBarNavigation,] = useRecoilState(bottomBarNavigationState);
    const [, setAppDrawerHeaderShown] = useRecoilState(appDrawerHeaderShownState);
    const [, setDrawerSwipeEnabled] = useRecoilState(drawerSwipeState);
    const [, setBannerShown] = useRecoilState(customBannerShown);
    const [, setBottomTabShown] = useRecoilState(bottomTabShownState);
    const [, setBottomTabNeedsShowing] = useRecoilState(bottomTabNeedsShowingState);
    const [isReady,] = useRecoilState(isRoundupsSplashReadyState);
    const [, setAreRoundupsActive] = useRecoilState(roundupsActiveState);
    const [, setIsPlaidLinkInitiated] = useRecoilState(isPlaidLinkInitiatedState);
    const [splashState,] = useRecoilState(splashStatusState);
    const splashStateReset = useResetRecoilState(splashStatusState);

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
            {
                !isReady ?
                    <Spinner loadingSpinnerShown={loadingSpinnerShown} setLoadingSpinnerShown={setLoadingSpinnerShown}/>
                    :
                    <SafeAreaView style={[styles.roundupsSplashView, roundupsSplashStepNumber === 7 && {backgroundColor: 'white'}]}>
                        {
                            (splashState.splashTitle !== undefined && splashState.splashTitle !== "" && splashState.splashDescription !== undefined &&
                                splashState.splashDescription !== "" && splashState.splashArtSource !== undefined && splashState.splashArtSource !== "" &&
                                splashState.splashTitle === `Houston we got a problem!` &&
                                splashState.splashDescription === `There was an error while initializing your Bank linking session.`)
                                ?
                                <>
                                    <SplashScreen
                                        //@ts-ignore
                                        splashArtSource={splashState.splashArtSource}
                                        splashButtonText={splashState.splashButtonText}
                                        splashTitle={splashState.splashTitle}
                                        splashDescription={splashState.splashDescription}
                                    />
                                    <TouchableOpacity
                                        style={styles.splashButtonDismiss}
                                        onPress={async () => {
                                            /**
                                             * dismiss Splash screen by resetting the splash state
                                             * and setting the plaid initiation flag && session URL accordingly
                                             */
                                            splashStateReset();
                                            setIsPlaidLinkInitiated(false);
                                        }}
                                    >
                                        <Text
                                            style={styles.splashButtonDismissText}>{splashState.splashButtonText}</Text>
                                    </TouchableOpacity>
                                </>
                                :
                                <GestureRecognizer
                                    onSwipeLeft={() => {
                                        // increase the step number all the way to Step 6
                                        if (roundupsSplashStepNumber < 5) {
                                            setRoundupsSplashStepNumber(roundupsSplashStepNumber + 1);
                                        }
                                    }}
                                    onSwipeRight={() => {
                                        // decrease the step number all the way to Step 0, besides for last Step
                                        if (roundupsSplashStepNumber > 0 && roundupsSplashStepNumber < 5) {
                                            setRoundupsSplashStepNumber(roundupsSplashStepNumber - 1);
                                        }
                                    }}
                                    style={{flex: 1}}
                                >
                                    {
                                        roundupsSplashStepNumber !== 7 &&
                                        <TouchableOpacity style={styles.closeIcon}>
                                            <Icon
                                                type={roundupsSplashStepNumber < 6 ? "antdesign" : "feather"}
                                                name={roundupsSplashStepNumber < 6 ? "close" : "chevron-left"}
                                                size={hp(4.15)}
                                                color={'#FFFFFF'}
                                                onPress={async () => {
                                                    // for Steps prior to Step 6, we just allow users to go back to the Home Screen
                                                    if (roundupsSplashStepNumber < 6) {
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
                                                    }
                                                    // for Steps after Step 6, we will just allow users to go one step back
                                                    if (roundupsSplashStepNumber >= 6) {
                                                        setRoundupsSplashStepNumber(roundupsSplashStepNumber - 1);
                                                    }
                                                }}
                                            />
                                        </TouchableOpacity>
                                    }
                                    {
                                        roundupsSplashStepNumber < 5 &&
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
                                            <View
                                                style={roundupsSplashStepNumber === 5 ? styles.roundupsSplashStepActive : styles.roundupsSplashStepInactive}/>
                                        </View>
                                    }
                                    <View style={styles.roundupsContentView}>
                                        {
                                            roundupsSplashStepNumber === 0 &&
                                            <>
                                                <Text
                                                    numberOfLines={1}
                                                    style={styles.roundupsSplashMainTitle}>
                                                    Savings Objectives
                                                </Text>
                                                <Image
                                                    style={styles.roundupsSplash1}
                                                    source={RoundupsSplash1}
                                                    resizeMode={"contain"}
                                                />
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
                                                    <Text
                                                        style={styles.roundupsStepContentTextHighlighted}>Pro-tip: </Text>
                                                    Select a checking account that is linked to your debit card in
                                                    order to save
                                                    more!
                                                </Text>
                                                <Image
                                                    style={styles.roundupsStepImage}
                                                    source={MoonbeamRoundupsStep1}
                                                    resizeMode={"contain"}
                                                />
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
                                                    source={MoonbeamRoundupsStep2}
                                                    resizeMode={"contain"}
                                                />
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
                                                    source={MoonbeamRoundupsStep3}
                                                    resizeMode={"contain"}
                                                />
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
                                                    source={MoonbeamRoundupsStep4}
                                                    resizeMode={"contain"}
                                                />
                                            </>
                                        }
                                        {
                                            roundupsSplashStepNumber === 5 &&
                                            <>
                                                <Image
                                                    style={styles.deltaOneImage}
                                                    source={MoonbeamDeltaOneMembership}
                                                    resizeMode={"contain"}
                                                />
                                                <Text
                                                    numberOfLines={1}
                                                    style={styles.deltaOneTitle}>
                                                    Delta One
                                                </Text>
                                                <Text
                                                    numberOfLines={1}
                                                    style={styles.deltaOnePrice}>
                                                    $2.99/month
                                                </Text>
                                                <Text
                                                    numberOfLines={1}
                                                    style={styles.deltaOnePerksTitle}>
                                                    First 30 days free!
                                                </Text>
                                                <View style={styles.deltaOnePerksView}>
                                                    <View style={styles.deltaOneIndividualPerk}>
                                                        <Text
                                                            numberOfLines={1}
                                                            style={styles.firstClassPerk}>
                                                            ✅ Seamless savings through Auto-Renewal.
                                                        </Text>
                                                    </View>
                                                    <View style={[styles.deltaOneIndividualPerk, {bottom: hp(5)}]}>
                                                        <Text
                                                            numberOfLines={1}
                                                            style={styles.firstClassPerk}>
                                                            ✅ Get notified when your trial ends.
                                                        </Text>
                                                    </View>
                                                    <View
                                                        style={[styles.deltaOneIndividualPerk, {bottom: hp(9.5)}]}>
                                                        <Text
                                                            numberOfLines={1}
                                                            style={styles.firstClassPerk}>
                                                            ✅ No upfront charges. Cancel anytime.
                                                        </Text>
                                                    </View>
                                                </View>
                                            </>
                                        }
                                        {
                                            roundupsSplashStepNumber === 6 &&
                                            <AccountLinkingStep/>
                                        }
                                        {
                                            roundupsSplashStepNumber === 7 &&
                                            <PlaidLinkingSessionStep/>
                                        }
                                        {/*{*/}
                                        {/*    roundupsSplashStepNumber === 8 &&*/}
                                        {/*    <AccountLinkingSummaryStep/>*/}
                                        {/*}*/}
                                    </View>
                                    {
                                        (roundupsSplashStepNumber === 5 || roundupsSplashStepNumber === 6 || roundupsSplashStepNumber === 8) &&
                                        <View style={styles.roundupsSplashDisclaimerView}>
                                            <Paragraph
                                                numberOfLines={roundupsSplashStepNumber === 5 ? 2 : 5}
                                                style={styles.roundupsSplashDisclaimerText}>
                                                {
                                                    roundupsSplashStepNumber === 5
                                                        ? "Moonbeam will deduct a $2.99 monthly membership fee after your free trial ends, from your connected account."
                                                        : roundupsSplashStepNumber === 6
                                                            ? "Backed by FDIC-insured Plaid partner banks"
                                                            : `I agree that starting ${new Date(new Date().setDate(new Date().getDate() + 30)).toLocaleDateString()} Moonbeam will deduct a $2.99/month fee for my Delta One plan from the linked billing account, which can be found on my Accounts page. Cancel anytime from the Accounts page.`
                                                }
                                            </Paragraph>
                                        </View>
                                    }
                                    {
                                        roundupsSplashStepNumber !== 7 &&
                                        <TouchableOpacity
                                            style={styles.getStartedButton}
                                            onPress={() => {
                                                // go straight to Step 6
                                                if (roundupsSplashStepNumber < 5) {
                                                    setRoundupsSplashStepNumber(5);
                                                }
                                                // once we get past Step 5, we have manual steps that we follow
                                                if (roundupsSplashStepNumber >= 5) {
                                                    /**
                                                     * For Step 6, we want to set the Plaid Link initiation flag to true,
                                                     * so we can initialize Plaid Link accordingly inside the appropriate Step's component
                                                     */
                                                    if (roundupsSplashStepNumber === 6) {
                                                        setIsPlaidLinkInitiated(true);

                                                        // // navigate to the RoundupsHome screen
                                                        // navigation.navigate('RoundupsHome', {});
                                                        // // set the Roundups activation state accordingly
                                                        // setAreRoundupsActive(true);
                                                    } else {
                                                        // increase the step number for all steps accordingly
                                                        setRoundupsSplashStepNumber(roundupsSplashStepNumber + 1);
                                                    }
                                                }
                                            }}
                                        >
                                            <Text
                                                style={styles.getStartedButtonText}>{roundupsSplashStepNumber === 5
                                                ? "Start your 30 day trial"
                                                : roundupsSplashStepNumber === 6
                                                    ? "Link your Bank"
                                                    : roundupsSplashStepNumber === 8
                                                        ? "Proceed with Account"
                                                        : "Get Started"}</Text>
                                        </TouchableOpacity>
                                    }
                                </GestureRecognizer>
                        }
                    </SafeAreaView>
            }
        </>
    );
};
