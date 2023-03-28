import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from "react";

/**
 * The default list of params, to be used across all Support derived stack props.
 */
export type SupportStackParamList = {
    SupportCenter: {
        setIsDrawerHeaderShown: React.Dispatch<React.SetStateAction<boolean>>
    },
    FAQ: {
        setIsDrawerHeaderShown: React.Dispatch<React.SetStateAction<boolean>>
    }
};

// the SettingsList component props, within the Home stack
export type SupportCenterProps = NativeStackScreenProps<SupportStackParamList, 'SupportCenter'>
// the FAQ component props, within the Home stack
export type FAQProps = NativeStackScreenProps<SupportStackParamList, 'FAQ'>
