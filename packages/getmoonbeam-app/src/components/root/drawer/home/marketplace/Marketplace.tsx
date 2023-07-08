import React, {useEffect} from 'react';
import {View} from "react-native";
import {MarketplaceProps} from "../../../../../models/props/HomeProps";
import {Text} from "react-native-paper";
import {useRecoilState} from "recoil";
import {appDrawerHeaderShownState, customBannerShown, drawerSwipeState} from "../../../../../recoil/AppDrawerAtom";

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
    const [, setDrawerSwipeEnabled] = useRecoilState(drawerSwipeState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // set the app drawer status accordingly ,custom banner visibility and drawer swipe actions accordingly
        if (navigation.getState().index === 1) {
            setAppDrawerHeaderShown(false);
            setBannerShown(true);
            setDrawerSwipeEnabled(false);
        }
    }, [navigation.getState()]);

    // return the component for the Marketplace page
    return (
        <View style={{backgroundColor: '#313030', width: '100%', height: '100%'}}>
            <Text>Marketplace</Text>
        </View>
    );
};
