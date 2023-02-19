import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from "react";

/**
 * The default list of params, to be used across all Home derived stack props.
 */
export type HomeStackParamList = {
    HomeDash: {
        pointValueRedeemed: number,
        setCurrentScreenKey: React.Dispatch<React.SetStateAction<string>>
    },
    HomeReferral: {}
};

// the HomeDash.tsx component props, within the Home stack
export type HomeDashProps = NativeStackScreenProps<HomeStackParamList, 'HomeDash'>
// the HomeReferral component props, within the Home stack
export type HomeReferralProps = NativeStackScreenProps<HomeStackParamList, 'HomeReferral'>

