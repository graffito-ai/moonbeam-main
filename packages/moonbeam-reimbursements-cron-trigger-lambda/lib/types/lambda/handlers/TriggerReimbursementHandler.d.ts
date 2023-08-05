/**
 * Function used to handle incoming reimbursement trigger, by first
 * swifting through the list of users with linked cards (whom we can
 * pay out), and sending a message for each of them, to the reimbursement
 * producer that will initiate the reimbursement process.
 */
export declare const triggerReimbursementHandler: () => Promise<void>;
