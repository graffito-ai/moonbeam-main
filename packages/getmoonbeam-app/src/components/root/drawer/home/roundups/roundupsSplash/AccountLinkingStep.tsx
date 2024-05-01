import React, {useEffect} from "react";
// @ts-ignore
import MoonbeamProfilePlaceholder from "../../../../../../../../assets/art/moonbeam-profile-placeholder.png";
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
import {Image, Text, View} from "react-native";
import {styles} from "../../../../../../styles/roundups.module";
import {useRecoilState} from "recoil";
import {
    isPlaidLinkInitiatedState,
    isRoundupsSplashReadyState,
    plaidLinkingSessionState,
    roundupsSplashStepNumberState
} from "../../../../../../recoil/RoundupsAtom";
import {currentUserInformation} from "../../../../../../recoil/AuthAtom";
import {initiatePlaidLinkingSession} from "../../../../../../utils/AppSync";
import {splashStatusState} from "../../../../../../recoil/SplashAtom";
// @ts-ignore
import MoonbeamErrorImage from "../../../../../../../assets/art/moonbeam-error.png";

/**
 * AccountLinkingSummaryStep component.
 *
 * @constructor constructor for the component.
 */
export const AccountLinkingStep = () => {
    // constants used to keep track of local component state

    // constants used to keep track of shared states
    const [plaidLinkingSession, setPlaidLinkingSession] = useRecoilState(plaidLinkingSessionState);
    const [, setRoundupsSplashStepNumber] = useRecoilState(roundupsSplashStepNumberState);
    const [, setIsReady] = useRecoilState(isRoundupsSplashReadyState);
    const [splashState, setSplashState] = useRecoilState(splashStatusState);
    const [userInformation,] = useRecoilState(currentUserInformation);
    const [isPlaidLinkInitiated, setIsPlaidLinkInitiated] = useRecoilState(isPlaidLinkInitiatedState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // if this flag is active, then we know we have to kickstart the linking step
        if (isPlaidLinkInitiated && plaidLinkingSession === null && splashState.splashTitle !== `Houston we got a problem!`) {
            setIsReady(false);

            // then, initialize the Plaid Linking session in order to obtain the hosted_link
            initiatePlaidLinkingSession(userInformation["custom:userId"], userInformation["given_name"], userInformation["family_name"],
                userInformation["email"], userInformation["birthdate"], userInformation["phone_number"], userInformation["address"]["formatted"],
                `https://app.moonbeam.vet/sandbox-plaid-redirect`).then(plaidLinkingSessionResponse => {
                // if there were any errors in the linking session creation, then display a Splash prompting the user to try again
                if (plaidLinkingSessionResponse && !plaidLinkingSessionResponse.errorMessage &&
                    plaidLinkingSessionResponse.data !== undefined && plaidLinkingSessionResponse.data !== null) {
                    // set the PLaid Linking Hosted Session URL, from the data obtained
                    setPlaidLinkingSession(plaidLinkingSessionResponse.data);
                    // we will change the step back to normal, and increase the roundups splash step number accordingly
                    setRoundupsSplashStepNumber(7);
                    setIsPlaidLinkInitiated(false);
                    setIsReady(true);
                } else {
                    // we will change the step back to normal, and set the Splash screen to an error which is handled in the parent container
                    setIsPlaidLinkInitiated(false);
                    setIsReady(true);
                    setSplashState({
                        splashTitle: `Houston we got a problem!`,
                        splashDescription: `There was an error while initializing your Bank linking session.`,
                        splashButtonText: `Try Again`,
                        splashArtSource: MoonbeamErrorImage
                    })
                }
            });
        }
    }, [isPlaidLinkInitiated, plaidLinkingSession, splashState]);

    // return the component for the AccountLinkingStep, part of the RoundupsSplash page
    return (
        <>
            {
                !isPlaidLinkInitiated &&
                <>
                    <Image
                        style={styles.deltaOneImage}
                        source={MoonbeamBankLinking}
                        resizeMode={"contain"}
                    />
                    <Text
                        numberOfLines={1}
                        style={styles.bankLinkingTitle}>
                        Link your Bank Account
                    </Text>
                    <Text
                        numberOfLines={3}
                        style={styles.bankLinkingSubTitle}>
                        {"You will need to connect a Checking Account to save more with Moonbeam. It only takes a few minutes."}
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
                                {"Make sure you have your bank\ninformation handy."}
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
            }
        </>
    );
}
