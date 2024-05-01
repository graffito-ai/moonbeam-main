import React, {useEffect, useState} from "react";
import {useRecoilState} from "recoil";
import {plaidLinkingSessionState} from "../../../../../../recoil/RoundupsAtom";
import {SafeAreaView} from "react-native-safe-area-context";
import * as WebBrowser from 'expo-web-browser';
import {Text} from "react-native";

/**
 * PlaidLinkingSessionStep component.
 *
 * @constructor constructor for the component.
 */
export const PlaidLinkingSessionStep = () => {
    // constants used to keep track of local component state
    const [result, setResult] = useState<WebBrowser.WebBrowserResult | null>(null);
    // constants used to keep track of shared states
    const [plaidLinkingSession,] = useRecoilState(plaidLinkingSessionState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        result === null && WebBrowser.openBrowserAsync(plaidLinkingSession!.hosted_link_url).then(result => {
            setResult(result);
        });
        if (result) {
            console.log(JSON.stringify(result));
        }
    }, [result]);

    // return the component for the PlaidLinkingSessionStep, part of the RoundupsSplash page
    return (
        <>
            <SafeAreaView edges={['right', 'left']}
                          style={{flex: 1}}>
                <Text>{result && JSON.stringify(result)}</Text>
            </SafeAreaView>
        </>
    );
}
