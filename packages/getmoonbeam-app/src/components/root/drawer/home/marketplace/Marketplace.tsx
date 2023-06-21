import React, {useEffect} from 'react';
import {View} from "react-native";
import {MarketplaceProps} from "../../../../../models/props/HomeProps";
import {Text} from "react-native-paper";
import {useRecoilState} from "recoil";
import {appDrawerHeaderShownState, customBannerShown} from "../../../../../recoil/AppDrawerAtom";

/**
 * Marketplace component.
 *
 * @param props component properties to be passed in.
 * @constructor constructor for the component.
 */
export const Marketplace = ({navigation}: MarketplaceProps) => {
    // constants used to keep track of shared states
    const [, setAppDrawerHeaderShown] = useRecoilState(appDrawerHeaderShownState);
    const [, setBannerShown] = useRecoilState(customBannerShown);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // set the app drawer status accordingly && set the custom banner visibility accordingly
        if (navigation.getState().index === 1) {
            setAppDrawerHeaderShown(true);
            setBannerShown(true);
        }
    }, [navigation.getState()]);

    // return the component for the Marketplace page
    return (
        <View style={{backgroundColor: '#313030', width: '100%', height: '100%'}}>
            <Text>Marketplace</Text>
        </View>
    );
};
