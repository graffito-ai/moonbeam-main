import type {NativeStackScreenProps} from '@react-navigation/native-stack';

/**
 * The default list of params, to be used across all bottom bar stack props.
 */
export type BottomBarStackParamList = {
    Home: {
        setBottomTabNavigationShown: React.Dispatch<React.SetStateAction<boolean>>;
        setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
        currentUserInformation: any;
        pointValueRedeemed: number;
    },
    Membership: {
        currentUserInformation: any;
    }
    Settings: {
        oauthStateId?: string;
        setBottomTabNavigationShown: React.Dispatch<React.SetStateAction<boolean>>;
        currentUserInformation: any;
    }
};

// the Home component props, within the bottom bar stack
export type HomeTabProps = NativeStackScreenProps<BottomBarStackParamList, 'Home'>
// the Membership component props, within the bottom bar stack
export type MembershipTabProps = NativeStackScreenProps<BottomBarStackParamList, 'Membership'>
// the Settings component props, within the bottom bar stack
export type SettingsTabProps = NativeStackScreenProps<BottomBarStackParamList, 'Settings'>

