import {NativeStackScreenProps} from "@react-navigation/native-stack";
import React from "react";

/**
 * The default list of params, to be used across all sidebar stack props.
 */
export type DrawerPropsParamList = {
    Dashboard: {
        oauthStateId?: string;
        currentUserInformation: any;
    },
    ["Bank Accounts"]: {},
    ["Card Services"]: {},
    Documents: {},
    Settings: {},
    Support: {
        setIsDrawerHeaderShown: React.Dispatch<React.SetStateAction<boolean>>
    }
};

// the Dashboard component props, within the sidebar stack
export type DashboardProps = NativeStackScreenProps<DrawerPropsParamList, 'Dashboard'>
// the Support component props, within the sidebar stack
export type SupportProps = NativeStackScreenProps<DrawerPropsParamList, 'Support'>
