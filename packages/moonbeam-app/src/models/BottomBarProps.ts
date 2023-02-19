import type {NativeStackScreenProps} from '@react-navigation/native-stack';

/**
 * The default list of params, to be used across all bottom bar stack props.
 */
export type BottomBarStackParamList = {
    Home: {
        pointValueRedeemed: number
    },
    Membership: {}
    Settings: {}
};

// the Home component props, within the bottom bar stack
export type HomeTabProps = NativeStackScreenProps<BottomBarStackParamList, 'Home'>
// the Membership component props, within the bottom bar stack
export type MembershipTabProps = NativeStackScreenProps<BottomBarStackParamList, 'Membership'>
// the Settings component props, within the bottom bar stack
export type SettingsTabProps = NativeStackScreenProps<BottomBarStackParamList, 'Settings'>
