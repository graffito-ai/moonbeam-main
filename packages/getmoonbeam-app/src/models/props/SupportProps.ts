import type {NativeStackScreenProps} from '@react-navigation/native-stack';

/**
 * The default list of params, to be used across the Support stack props.
 */
export type SupportStackParamList = {
    SupportCenter: {},
    FAQ: {}
};

// the Support Center component props, within the Support stack
export type SupportCenterProps = NativeStackScreenProps<SupportStackParamList, 'SupportCenter'>;
// the FAQ component props, within the Support stack
export type FAQProps = NativeStackScreenProps<SupportStackParamList, 'FAQ'>;
