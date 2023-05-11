import type {NativeStackScreenProps} from '@react-navigation/native-stack';

/**
 * The default list of params, to be used across the Authentication stack props.
 */
export type AuthenticationStackParamList = {
    SignIn: {
        initialRender: boolean
    }
    Registration: {},
    AccountRecovery: {}
};

// the SignIn component props, within the Authentication stack
export type SignInProps = NativeStackScreenProps<AuthenticationStackParamList, 'SignIn'>;
// the Registration component props, within the Authentication stack
export type RegistrationProps = NativeStackScreenProps<AuthenticationStackParamList, 'Registration'>;
// the AccountRecovery component props, within the Authentication stack
export type AccountRecoveryProps = NativeStackScreenProps<AuthenticationStackParamList, 'AccountRecovery'>;
