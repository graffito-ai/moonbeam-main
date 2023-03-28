import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from "react";

/**
 * The default list of params, to be used across all Home derived stack props.
 */
export type HomeStackParamList = {
    HomeDash: {
        currentUserInformation?: any;
        pointValueRedeemed?: number;
        setCurrentScreenKey?: React.Dispatch<React.SetStateAction<string>>;
        setIsDrawerOpen?: React.Dispatch<React.SetStateAction<boolean>>;
    },
    HomeReferral: {
        setBottomTabNavigationShown: React.Dispatch<React.SetStateAction<boolean>>;
        currentUserInformation: any;
    }
};

// the HomeDash component props, within the Home stack
export type HomeDashProps = NativeStackScreenProps<HomeStackParamList, 'HomeDash'>
// the HomeReferral component props, within the Home stack
export type HomeReferralProps = NativeStackScreenProps<HomeStackParamList, 'HomeReferral'>

