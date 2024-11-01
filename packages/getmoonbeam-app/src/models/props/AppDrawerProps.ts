import {NativeStackScreenProps} from "@react-navigation/native-stack";

/**
 * The default list of params, to be used across the App Drawer stack props.
 */
export type AppDrawerStackParamList = {
    Home: {},
    Documents: {},
    Settings: {},
    Support: {},
    AppWall: {},
    DocumentsViewer: {
        name: string;
        privacyFlag: boolean;
        appDrawerFlag: boolean;
    },
    Referral: {},
    Reimbursements: {}
};

/**
 * the Home component props, within the AppDrawer stack.
 *
 * This represents a bottom bar navigation that will enable navigating throughout different pages
 * of the application. This will be complementing the AppDrawer, and together are going to be the
 * main two components of our application which are going to drive all pages and navigation to/from.
 */
export type HomeProps = NativeStackScreenProps<AppDrawerStackParamList, 'Home'>
// the Documents component props, within the AppDrawer stack
export type DocumentsProps = NativeStackScreenProps<AppDrawerStackParamList, 'Documents'>
// the Settings component props, within the AppDrawer stack
export type SettingsProps = NativeStackScreenProps<AppDrawerStackParamList, 'Settings'>
// the Support component props, within the AppDrawer stack
export type SupportProps = NativeStackScreenProps<AppDrawerStackParamList, 'Support'>
// the AppWall component props, within the AppDrawer stack
export type AppWallProps = NativeStackScreenProps<AppDrawerStackParamList, 'AppWall'>
// the Documents Viewer component props, within the AppDrawer stack
export type AppDrawerDocumentsViewerProps = NativeStackScreenProps<AppDrawerStackParamList, 'DocumentsViewer'>
// the Referral Component props, within the AppDrawer stack
export type ReferralProps = NativeStackScreenProps<AppDrawerStackParamList, 'Referral'>
// the Reimbursements Component props, within the AppDrawer stack
export type ReimbursementsProps = NativeStackScreenProps<AppDrawerStackParamList, 'Reimbursements'>
