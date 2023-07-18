import React, {useEffect} from "react";
import {useRecoilState} from "recoil";
import {splashStatusState} from "../../../../recoil/SplashAtom";
import {SplashScreen} from "../../../common/Splash";

/**
 * CardLinkingStatusSplashStep component.
 *
 * @constructor constructor for the component.
 */
export const CardLinkingStatusSplashStep = () => {

    // constants used to keep track of shared states
    const [splashState,] = useRecoilState(splashStatusState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // perform field validations on every state change, for the specific field that is being validated

    }, []);

    // return the component for the CardLinkingStatusSplashStep, part of the Registration page
    return (
        <>
            <SplashScreen
                splashArtSource={splashState.splashArtSource}
                splashButtonText={splashState.splashButtonText}
                splashTitle={splashState.splashTitle}
                splashDescription={splashState.splashDescription}
            />
        </>
    );
}
