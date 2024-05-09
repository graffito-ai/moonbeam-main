import React, {useEffect, useState} from "react";
import {useRecoilState, useResetRecoilState} from "recoil";
import {
    isPlaidLinkInitiatedState,
    plaidLinkingSessionState,
    roundupsSplashStepNumberState
} from "../../../../../../recoil/RoundupsAtom";
import * as WebBrowser from 'expo-web-browser';
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {SafeAreaView} from "react-native-safe-area-context";
import {Text} from "react-native";

/**
 * PlaidLinkingSessionStep component.
 *
 * @constructor constructor for the component.
 */
export const PlaidLinkingSessionStep = () => {
    // constants used to keep track of local component state
    const [result, setResult] = useState<WebBrowser.WebBrowserAuthSessionResult | WebBrowser.WebBrowserResult | null>(null);
    // constants used to keep track of shared states
    const [, setRoundupsSplashStepNumber] = useRecoilState(roundupsSplashStepNumberState);
    const [plaidLinkingSession,] = useRecoilState(plaidLinkingSessionState);
    const plaidLinkSessionReset = useResetRecoilState(plaidLinkingSessionState);
    const [, setIsPlaidLinkInitiated] = useRecoilState(isPlaidLinkInitiatedState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        if (result === null) {
            WebBrowser.openAuthSessionAsync(plaidLinkingSession!.hosted_link_url!, `moonbeamfin://plaidRedirect`).then(result => {
                setResult(result);
            });
        }
        if (result !== null) {
            // @ts-ignore
            if (result.url && result.url === 'moonbeamfin://plaidRedirect') {
                setIsPlaidLinkInitiated(false);
                plaidLinkSessionReset();
                setRoundupsSplashStepNumber(8);
            } else if (result.type === WebBrowser.WebBrowserResultType.CANCEL) {
                setIsPlaidLinkInitiated(false);
                plaidLinkSessionReset();
                setRoundupsSplashStepNumber(6);
            }
        }
    }, [result]);

    // return the component for the PlaidLinkingSessionStep, part of the RoundupsSplash page
    return (
        <>
            <SafeAreaView edges={['right', 'left']}
                          style={{height: hp(92), width: wp(95)}}>
                <Text>{result && JSON.stringify(result)}</Text>
            </SafeAreaView>
        </>
    );
}
