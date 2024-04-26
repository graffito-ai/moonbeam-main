import type {NativeStackScreenProps} from '@react-navigation/native-stack';

/**
 * The default list of params, to be used across the RoundupsHome stack props.
 */
export type RoundupsHomeStackParamList = {
    RoundupsDashboard: {},
    RoundupsObjectives: {},
    RoundupsAccounts: {},
    RoundupsCashOut: {},
};

// the RoundupsDashboard component props, within the RoundupsHome stack
export type RoundupsDashboardProps = NativeStackScreenProps<RoundupsHomeStackParamList, 'RoundupsDashboard'>;
// the RoundupsDashboard component props, within the RoundupsHome stack
export type RoundupsObjectivesProps = NativeStackScreenProps<RoundupsHomeStackParamList, 'RoundupsObjectives'>;
// the RoundupsAccounts component props, within the RoundupsHome stack
export type RoundupsAccountsProps = NativeStackScreenProps<RoundupsHomeStackParamList, 'RoundupsAccounts'>;
// the RoundupsCashOut/Transfer component props, within the RoundupsHome stack
export type RoundupsCashOutProps = NativeStackScreenProps<RoundupsHomeStackParamList, 'RoundupsCashOut'>;
