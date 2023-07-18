import type {NativeStackScreenProps} from '@react-navigation/native-stack';

/**
 * The default list of params, to be used across the Authentication stack props.
 */
export type AuthenticationStackParamList = {
    SignIn: {}
    Registration: {},
    AccountRecovery: {},
    DocumentViewer: {},
    AppDrawer: {}
};

// the SignIn component props, within the Authentication stack
export type SignInProps = NativeStackScreenProps<AuthenticationStackParamList, 'SignIn'>;
// the Registration component props, within the Authentication stack
export type RegistrationProps = NativeStackScreenProps<AuthenticationStackParamList, 'Registration'>;
// the AccountRecovery component props, within the Authentication stack
export type AccountRecoveryProps = NativeStackScreenProps<AuthenticationStackParamList, 'AccountRecovery'>;
// the Document component props, within the Authentication stack
export type DocumentViewerRootProps = NativeStackScreenProps<AuthenticationStackParamList, 'DocumentViewer'>
/**
 * the AppDrawer component props, within the Authentication stack.
 *
 * This represents the root drawer sidebar of the application, from which all pages and/or views are navigated from, upon
 * authenticated. We can think of this as the Main Controller for the application.
 */
export type AppDrawerProps = NativeStackScreenProps<AuthenticationStackParamList, 'AppDrawer'>
