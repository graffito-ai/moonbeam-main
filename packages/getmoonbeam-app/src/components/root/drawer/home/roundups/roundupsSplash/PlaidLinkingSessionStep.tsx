import React, {useEffect, useState} from "react";
import {useRecoilState, useResetRecoilState} from "recoil";
import {
    isPlaidLinkInitiatedState,
    plaidLinkingSessionState,
    roundupsSplashStepNumberState
} from "../../../../../../recoil/RoundupsAtom";
import {SafeAreaView} from "react-native-safe-area-context";
import {Text} from "react-native";
import * as WebBrowser from 'expo-web-browser';
import {appUrlState} from "../../../../../../recoil/AuthAtom";

/**
 * PlaidLinkingSessionStep component.
 *
 * @constructor constructor for the component.
 */
export const PlaidLinkingSessionStep = () => {
    // constants used to keep track of local component state
    const [result, setResult] = useState<WebBrowser.WebBrowserResult | null>(null);
    // constants used to keep track of shared states
    const [appUrl,] = useRecoilState(appUrlState);
    const [, setRoundupsSplashStepNumber] = useRecoilState(roundupsSplashStepNumberState);
    const [plaidLinkingSession,] = useRecoilState(plaidLinkingSessionState);
    const plaidLinkingSessionReset = useResetRecoilState(plaidLinkingSessionState);
    const [, setIsPlaidLinkInitiated] = useRecoilState(isPlaidLinkInitiatedState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // initialize the web browser with the Hosted Link session URL if the result is null
        result === null && WebBrowser.openBrowserAsync(plaidLinkingSession!.hosted_link_url!, {
            dismissButtonStyle: 'cancel'
        }).then(result => {
            setResult(result);
        });
        // if the result is not null, then the Hosted Link session is already initialized
        if (result !== null) {
            // if the browser is dismissed or cancelled
            if (result.type === 'cancel') {
                // go back a step if we cancel or dismiss
                setRoundupsSplashStepNumber(6);
                setIsPlaidLinkInitiated(false);
                plaidLinkingSessionReset();
            }
        }
        // handle Plaid redirects
        if (appUrl.includes('plaidRedirect')) {
            // go forward a step to capture the Plaid data accordingly
            setRoundupsSplashStepNumber(8);
        }
    }, [result, appUrl]);

    // return the component for the PlaidLinkingSessionStep, part of the RoundupsSplash page
    return (
        <>
            <SafeAreaView edges={['right', 'left']}
                          style={{flex: 1}}>
                <Text>{result !== null && JSON.stringify(result)}</Text>
            </SafeAreaView>
        </>
    );
}
