import type {NativeStackScreenProps} from '@react-navigation/native-stack';

/**
 * The default list of params, to be used across the Settings stack props.
 */
export type SettingsStackParamList = {
    SettingsList: {}
};

// the SettingsList component props, within the Home stack
export type SettingsListProps = NativeStackScreenProps<SettingsStackParamList, 'SettingsList'>;
