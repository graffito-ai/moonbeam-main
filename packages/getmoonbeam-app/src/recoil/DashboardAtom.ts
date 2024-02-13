import {atom, selector} from "recoil";
import {MoonbeamTransaction, TransactionsStatus} from "@moonbeam/moonbeam-models";

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
        // only consider each transaction's reward amount up to two digits, and do not include duplicates (it happens on re-renders not due to the backend)
        transactionDataList.forEach(transaction => {
            transaction.rewardAmount = Number(transaction.rewardAmount.toFixed(2));
        });
        // sort transactions by timestamp and ensure that there are no duplicates
        return transactionDataList
            .filter((v, i, a) => a.findIndex(v2 => (v2.transactionId === v.transactionId)) === i)
            .slice().sort((a, b) => b.timestamp - a.timestamp);
    }
});

/**
 * A selector used to keep track of the current balance, made up of the total Pending amounts
 * in each transaction obtained for the user.
 */
const currentBalanceState = selector<number>({
    key: 'currentBalanceState',
    get: ({get}) => {
        // @ts-ignore
        const transactionDataList = get(transactionDataState);

        // the pending amounts representing the current balance (to be paid to the user)
        let currentBalance = 0;

        /**
         * ONLY look at transactions that are in a PROCESSED state (essentially that were funded
         * from our merchants' or Olive's side, and are about to be credited back to the customer)
         *
         * only consider each transaction's reward amount equal to the pending amount that will
         * be included in the current balance total.
         */
        transactionDataList
                    .filter((v,i,a)=>a.findIndex(v2=>(v2.transactionId===v.transactionId))===i)
                    .forEach(transaction => {
                        if (transaction.transactionStatus === TransactionsStatus.Processed) {
                            currentBalance += Number(transaction.pendingCashbackAmount.toFixed(2));
                        }
        });
        // return the current balance amount
        return Number(currentBalance.toFixed(2));
    },
});

/**
 * A selector used to keep track of the current balance, made up of the total Pending as well as
 * Credited amounts in each transaction obtained for the user.
 */
const lifetimeSavingsState = selector<number>({
    key: 'lifetimeSavingsState',
    get: ({get}) => {
        const transactionDataList = get(transactionDataState);
        // the pending + credited amounts representing the lifetime savings balance
        let lifetimeSavingsBalance = 0;

        /**
         * ONLY look at transactions that are in PENDING, PROCESSED or CREDITED state
         * (do not look at REJECTED).
         *
         * consider the pending and credited amounts for transactions, that will
         * be included in the lifetime savings total.
         */
        transactionDataList
            .filter((v, i, a) => a.findIndex(v2 => (v2.transactionId === v.transactionId)) === i)
            .forEach(transaction => {
                if (transaction.transactionStatus !== TransactionsStatus.Rejected) {
                    lifetimeSavingsBalance += transaction.pendingCashbackAmount !== 0
                        ? Number(transaction.pendingCashbackAmount.toFixed(2))
                        : Number(transaction.creditedCashbackAmount.toFixed(2));
                }
            });
        // return the lifetime savings amount
        return Number(lifetimeSavingsBalance.toFixed(2));
    },
});

/**
 * Export all atoms and/or selectors
 */
export {
    currentBalanceState,
    lifetimeSavingsState,
    showWalletBottomSheetState,
    transactionDataState,
    sortedTransactionDataState,
    showTransactionBottomSheetState
};
