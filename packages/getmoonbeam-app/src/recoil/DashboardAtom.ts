import {atom, selector} from "recoil";
import {MoonbeamTransaction} from "@moonbeam/moonbeam-models";

/**
 * Atom used to keep track of the state of the transactional data
 * for a particular user.
 */
const transactionDataState = atom<MoonbeamTransaction[]>({
    key: "transactionDataState",
    default: []
});

/**
 * Atom used to keep track of the state of the transactions bottom sheet.
 */
const showTransactionBottomSheetState = atom<boolean>({
    key: 'showTransactionBottomSheetState',
    default: false
});

/**
 * Atom used to keep track of the state of the wallet bottom sheet.
 */
const showWalletBottomSheetState = atom<boolean>({
    key: 'showWalletBottomSheetState',
    default: false
});

/**
 * A selector used to keep track of any updated to the transactionDataState, and sort that
 * list according to the timestamp, in descending order.
 *
 * This will also round down the discount amount, to two digits only.
 */
const sortedTransactionDataState = selector<MoonbeamTransaction[]>({
    key: 'sortedTransactionDataState',
    get: ({get}) => {
        const transactionDataList = get(transactionDataState);
        transactionDataList.forEach(transaction => {transaction.rewardAmount = Number(transaction.rewardAmount.toFixed(2))});
        return transactionDataList.slice().sort((a, b) => b.timestamp - a.timestamp);
    },
});

/**
 * Export all atoms and/or selectors
 */
export {
    showWalletBottomSheetState,
    transactionDataState,
    sortedTransactionDataState,
    showTransactionBottomSheetState
};
