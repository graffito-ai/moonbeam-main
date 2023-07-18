import type {NativeStackScreenProps} from '@react-navigation/native-stack';

/**
 * The default list of params, to be used across the Settings stack props.
 */
export type SettingsStackParamList = {
    SettingsList: {},
    Profile: {}
};

// the SettingsList component props, within the Settings stack
export type SettingsListProps = NativeStackScreenProps<SettingsStackParamList, 'SettingsList'>;
// the Profile component props, within the Settings stack
export type ProfileProps = NativeStackScreenProps<SettingsStackParamList, 'Profile'>;
