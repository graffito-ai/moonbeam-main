import type {NativeStackScreenProps} from '@react-navigation/native-stack';

/**
 * The default list of params, to be used across the Roundups stack props.
 */
export type RoundupsStackParamList = {
    RoundupsSplash: {},
    RoundupsHome: {}
};

// the RoundupsSplash component props, within the Roundups stack
export type RoundupsSplashProps = NativeStackScreenProps<RoundupsStackParamList, 'RoundupsSplash'>;
// the RoundupsHome component props, within the Roundups stack
export type RoundupsHomeProps = NativeStackScreenProps<RoundupsStackParamList, 'RoundupsHome'>;
