import type {NativeStackScreenProps} from '@react-navigation/native-stack';

/**
 * The default list of params, to be used across the Dashboard Controller stack props.
 */
export type DashboardControllerStackParamList = {
    Dashboard: {},
    TransactionsController: {},
    ReimbursementsController: {}
};

// the Dashboard component props, within the Dashboard Controller stack
export type DashboardProps = NativeStackScreenProps<DashboardControllerStackParamList, 'Dashboard'>;
// the TransactionsController component props, within the Dashboard Controller stack
export type TransactionsControllerProps = NativeStackScreenProps<DashboardControllerStackParamList, 'TransactionsController'>;
// the ReimbursementsController component props, within the Dashboard Controller stack
export type ReimbursementsControllerProps = NativeStackScreenProps<DashboardControllerStackParamList, 'ReimbursementsController'>;


