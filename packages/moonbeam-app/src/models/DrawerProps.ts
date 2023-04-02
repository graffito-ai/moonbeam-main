import {NativeStackScreenProps} from "@react-navigation/native-stack";
import React from "react";

/**
 * The default list of params, to be used across all sidebar stack props.
 */
export type DrawerPropsParamList = {
    Dashboard: {
        currentUserInformation: any;
    },
    ["Bank Accounts"]: {
        oauthStateId?: string;
        currentUserInformation: any;
        setIsDrawerHeaderShown: React.Dispatch<React.SetStateAction<boolean>>;
    },
    ["Card Services"]: {},
    Documents: {
        setIsDrawerHeaderShown: React.Dispatch<React.SetStateAction<boolean>>;
    },
    Settings: {
        oauthStateId?: string;
        currentUserInformation: any;
    },
    Support: {
        setIsDrawerHeaderShown: React.Dispatch<React.SetStateAction<boolean>>;
    }
};

// the Dashboard component props, within the sidebar stack
export type DashboardProps = NativeStackScreenProps<DrawerPropsParamList, 'Dashboard'>
// the Support component props, within the sidebar stack
export type SupportProps = NativeStackScreenProps<DrawerPropsParamList, 'Support'>
// the Settings component props, within the sidebar stack
export type SettingsProps = NativeStackScreenProps<DrawerPropsParamList, 'Settings'>
// the Bank Accounts component props, within the sidebar stack
export type BankAccountsProps = NativeStackScreenProps<DrawerPropsParamList, 'Bank Accounts'>
// the Documents component props, within the sidebar stack
export type DocumentsProps = NativeStackScreenProps<DrawerPropsParamList, 'Documents'>
