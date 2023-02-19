import type {NativeStackScreenProps} from '@react-navigation/native-stack';

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
    },
    EmailVerify: {
        username: string;
    },
    ForgotPassword: {
        initialRender: boolean;
    },
    Dashboard: {

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

