import type {NativeStackScreenProps} from '@react-navigation/native-stack';

/**
 * The default list of params, to be used across the Dashboard Controller stack props.
 */
export type DashboardControllerStackParamList = {
    Dashboard: {},
    TransactionsController: {},
    CashbackController: {}
};

// the Dashboard component props, within the Dashboard Controller stack
export type DashboardProps = NativeStackScreenProps<DashboardControllerStackParamList, 'Dashboard'>;
// the TransactionsController component props, within the Dashboard Controller stack
export type TransactionsController = NativeStackScreenProps<DashboardControllerStackParamList, 'TransactionsController'>;
// the CashbackController component props, within the Dashboard Controller stack
export type CashbackController = NativeStackScreenProps<DashboardControllerStackParamList, 'CashbackController'>;


