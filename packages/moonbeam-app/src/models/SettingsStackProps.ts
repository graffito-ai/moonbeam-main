import type {NativeStackScreenProps} from '@react-navigation/native-stack';

/**
 * The default list of params, to be used across all Settings derived stack props.
 */
export type SettingsStackParamList = {
    SettingsList: {
        currentUserInformation: any;
    },
    // DocumentViewer: {
    //     name: string,
    //     privacyFlag: boolean,
    //     setIsHeaderShown?: React.Dispatch<React.SetStateAction<boolean>>;
    //     setBottomTabNavigationShown?: React.Dispatch<React.SetStateAction<boolean>>;
    // }
};

// the SettingsList component props, within the Home stack
export type SettingsListProps = NativeStackScreenProps<SettingsStackParamList, 'SettingsList'>


