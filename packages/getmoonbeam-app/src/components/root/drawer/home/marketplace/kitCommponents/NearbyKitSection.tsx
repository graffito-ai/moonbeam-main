import React, {useEffect} from 'react';
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {MarketplaceStackParamList} from "../../../../../../models/props/MarketplaceProps";

/**
 * NearbyKitSection component.
 *
 * @param props properties to be passed into the component
 * @constructor constructor for the component.
 */
export const NearbyKitSection = (props: {
    navigation: NativeStackNavigationProp<MarketplaceStackParamList, 'Kit'>
}) => {

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
    }, []);

    // return the component for the NearbyKitSection page
    return (
        <>
        </>
    );
};
