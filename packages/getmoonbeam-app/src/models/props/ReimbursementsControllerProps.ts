import type {NativeStackScreenProps} from '@react-navigation/native-stack';

/**
 * The default list of params, to be used across the Reimbursements Controller stack props.
 */
export type ReimbursementsControllerStackParamList = {
    ReimbursementsSummary: {},
    NewReimbursement: {}
};

// the Reimbursements Summary component props, within the Reimbursements Controller stack
export type ReimbursementsSummaryProps = NativeStackScreenProps<ReimbursementsControllerStackParamList, 'ReimbursementsSummary'>;
// the New Reimbursement Summary component props, within the Reimbursements Controller stack
export type NewReimbursementProps = NativeStackScreenProps<ReimbursementsControllerStackParamList, 'NewReimbursement'>;


