import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from "react";
import { ReferralStatus } from '.';

/**
 * The default list of params, to be used across all root stack props.
 */
export type RootStackParamList = {
    SignIn: {
        initialRender: boolean;
        onLayoutRootView?: () => Promise<void>;
    },
    SignUp: {
        initialRender: boolean;
        setSignUpBackButtonVisible?: React.Dispatch<React.SetStateAction<boolean>>;
        onLayoutRootView?: () => Promise<void>;
        referralId?: string;
    },
    EmailVerify: {
        username: string;
        referralId?: string;
        status?: ReferralStatus;
        _version?: string;
    },
    ForgotPassword: {
        initialRender: boolean;
    },
    Dashboard: {
        currentUserInformation: any
    }
};

// the SignIn component props, within the root stack
export type SignInProps = NativeStackScreenProps<RootStackParamList, 'SignIn'>
// the SignUp component props, within the root stack
export type SignUpProps = NativeStackScreenProps<RootStackParamList, 'SignUp'>
// the EmailVerify component props, within the root stack
export type EmailVerifyProps = NativeStackScreenProps<RootStackParamList, 'EmailVerify'>
// the ForgotPassword component props, within the root stack
export type ForgotPasswordProps = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>
// the Dashboard component props, within the root stack
export type DashboardProps = NativeStackScreenProps<RootStackParamList, 'Dashboard'>

