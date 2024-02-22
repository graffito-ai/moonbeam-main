import {atom, selector} from "recoil";
import {Reimbursement} from "../components/root/drawer/home/dashboard/reimbursements/ReimbursementsSummary";
import {CardType} from "@moonbeam/moonbeam-models";

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
    default: [
        {
            id: 'd062ba64-e7ab-4ddb-addc-d7424e1a1980',
            timestamp: 1705280633000,
            status: 'PROCESSED',
            amount: 35.98,
            cardId: 'e8b005d4-77c6-40e8-16b0-08dc113119af',
            cardLast4: '8999',
            cardType: CardType.Visa,
            transactions: []
        }
    ]
});

/**
 * A selector used to keep track of any PENDING reimbursements for a
 * particular user.
 */
const pendingReimbursementsDataState = selector<Reimbursement[]>({
    key: 'pendingReimbursementsDataState',
    get: ({get}) => {
        const reimbursementDataList = get(reimbursementDataState);
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
        const reimbursementDataList = get(reimbursementDataState);
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
 * Export all atoms and/or selectors
 */
export {
    reimbursementBottomSheetShownState,
    reimbursementDataState,
    pendingReimbursementsDataState,
    processedReimbursementsDataState,
    cardChoiceDropdownOpenState,
    cardChoiceDropdownValueState
};
