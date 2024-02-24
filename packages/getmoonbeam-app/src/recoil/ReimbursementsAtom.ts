import {atom, selector} from "recoil";
import {Reimbursement} from "@moonbeam/moonbeam-models";

/**
 * Atom used to keep track of the state of the reimbursements bottom sheet
 * for the Reimbursement Summary component/pages (meaning if it will be shown or not).
 */
const reimbursementBottomSheetShownState = atom<boolean>({
    key: "reimbursementBottomSheetShownState",
    default: false
});

/**
 * Atom used to keep track of the state of the reimbursements data
 * for a particular user.
 */
const reimbursementDataState = atom<Reimbursement[]>({
    key: "reimbursementDataState",
    default: []
});

/**
 * A selector used to keep track of any updated to the reimbursementsDataState, and sort that
 * list according to the timestamp, in descending order.
 *
 * This will also round reimbursements amount, to two digits only.
 */
const sortedReimbursementsDataState = selector<Reimbursement[]>({
    key: 'sortedReimbursementsDataState',
    get: ({get}) => {
        const reimbursementsDataList = get(reimbursementDataState);
        // only consider each reimbursement's  amount up to two digits, and do not include duplicates (it happens on re-renders not due to the backend)
        reimbursementsDataList.forEach(reimbursement => {
            reimbursement.amount = Number(reimbursement.amount.toFixed(2));
        });
        // sort reimbursements by timestamp and ensure that there are no duplicates
        return reimbursementsDataList
            .filter((v, i, a) => a.findIndex(v2 => (v2.reimbursementId === v.reimbursementId)) === i)
            .slice().sort((a, b) => b.timestamp - a.timestamp);
    }
});

/**
 * A selector used to keep track of any PENDING reimbursements for a
 * particular user.
 */
const pendingReimbursementsDataState = selector<Reimbursement[]>({
    key: 'pendingReimbursementsDataState',
    get: ({get}) => {
        const reimbursementDataList = get(sortedReimbursementsDataState);
        // only consider each PENDING reimbursement transaction
        return reimbursementDataList.filter(reimbursement => reimbursement.status === 'PENDING');
    }
});

/**
 * A selector used to keep track of any PROCESSED reimbursements for a
 * particular user.
 */
const processedReimbursementsDataState = selector<Reimbursement[]>({
    key: 'processedReimbursementsDataState',
    get: ({get}) => {
        const reimbursementDataList = get(sortedReimbursementsDataState);
        // only consider each PROCESSED reimbursement transaction
        return reimbursementDataList.filter(reimbursement => reimbursement.status === 'PROCESSED');
    }
});

/**
 * Atom used to keep track of the state of the card choice dropdown state.
 */
const cardChoiceDropdownOpenState = atom<boolean>({
    key: "cardChoiceDropdownOpenState",
    default: false
});

/**
 * Atom used to keep track of the state of the card choice dropdown value.
 */
const cardChoiceDropdownValueState = atom<string>({
    key: "cardChoiceDropdownValueState",
    default: ""
});

/**
 * Atom used to keep track of whether the reimbursements controller is ready
 * or not.
 */
const isReimbursementsControllerReadyState = atom<boolean>({
   key: "isReimbursementsControllerReadyState",
   default: false
});

/**
 * Export all atoms and/or selectors
 */
export {
    reimbursementBottomSheetShownState,
    reimbursementDataState,
    pendingReimbursementsDataState,
    processedReimbursementsDataState,
    cardChoiceDropdownOpenState,
    cardChoiceDropdownValueState,
    sortedReimbursementsDataState,
    isReimbursementsControllerReadyState
};
