import {atom, selector} from "recoil";
import {
    MoonbeamRoundupTransaction,
    MoonbeamTransaction,
    RoundupTransactionsStatus,
    TransactionsStatus
} from "@moonbeam/moonbeam-models";

/**
 * Atom used to keep track of the state of the daily earnings summary confetti.
 */
const showDailySummaryConfettiState = atom<boolean>({
    key: 'showDailySummaryConfettiState',
    default: false
});

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
 * Atom used to keep track of the state of the roundup transactions bottom sheet.
 */
const showRoundupTransactionBottomSheetState = atom<boolean>({
    key: 'showRoundupTransactionBottomSheetState',
    default: false
});

/**
 * Atom used to keep track of the state of the roundup transactional data for
 * a particular user.
 */
const roundupsTransactionDataState = atom<MoonbeamRoundupTransaction[]>({
    key: 'roundupsTransactionDataState',
    default: []
});

/**
 * A selector used to keep track of any updated to the roundupsTransactionDataState, and sort that
 * list according to the timestamp, in descending order.
 *
 * This will also round down the roundup amount, to two digits only.
 */
const sortedRoundupTransactionDataState = selector<MoonbeamRoundupTransaction[]>({
    key: 'sortedRoundupTransactionDataState',
    get: ({get}) => {
        const roundupTransactionDataList = get(roundupsTransactionDataState);
        // only consider each transaction's roundup amount up to two digits, and do not include duplicates (it happens on re-renders not due to the backend)
        roundupTransactionDataList.forEach(transaction => {
            transaction.pendingRoundupAmount = Number(transaction.pendingRoundupAmount.toFixed(2));
            transaction.availableRoundupAmount = Number(transaction.availableRoundupAmount.toFixed(2));
            transaction.creditedRoundupAmount = Number(transaction.creditedRoundupAmount.toFixed(2));
        });
        // sort transactions by timestamp and ensure that there are no duplicates
        return roundupTransactionDataList
            .filter((v, i, a) => a.findIndex(v2 => (v2.transactionId === v.transactionId)) === i)
            .slice().sort((a, b) => b.timestamp - a.timestamp);
    }
});

/**
 * A selector used to keep track of the current balance, made up of the total Pending/Available or Credited amount
 * in each roundup transaction obtained for the user.
 */
const lifetimeRoundupSavingsState = selector<number>({
    key: 'lifetimeRoundupSavingsState',
    get: ({get}) => {
        const roundupTransactionDataList = get(roundupsTransactionDataState);
        // the lifetime roundups savings balance
        let lifetimeRoundupsSavingsBalance = 0;

        /**
         * consider the pending, available or credited amounts for roundups transactions, that will
         * be included in the lifetime  roundup savings total.
         */
        roundupTransactionDataList
            .filter((v, i, a) => a.findIndex(v2 => (v2.transactionId === v.transactionId)) === i)
            .forEach(transaction => {
                if (transaction.transactionStatus === RoundupTransactionsStatus.Pending) {
                    lifetimeRoundupsSavingsBalance += transaction.pendingRoundupAmount !== 0
                        ? Number(transaction.pendingRoundupAmount.toFixed(2))
                        : 0;
                } else if (transaction.transactionStatus === RoundupTransactionsStatus.Processed) {
                    lifetimeRoundupsSavingsBalance += transaction.availableRoundupAmount !== 0
                        ? Number(transaction.availableRoundupAmount.toFixed(2))
                        : 0;
                } else if (transaction.transactionStatus === RoundupTransactionsStatus.Credited) {
                    lifetimeRoundupsSavingsBalance += transaction.creditedRoundupAmount !== 0
                        ? Number(transaction.creditedRoundupAmount.toFixed(2))
                        : 0;
                }
            });
        // return the lifetime savings amount
        return Number(lifetimeRoundupsSavingsBalance.toFixed(2));
    },
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
        const transactionDataList = get(sortedTransactionDataState);

        // the pending amounts representing the current balance (to be paid to the user)
        let currentBalance = 0;

        /**
         * ONLY look at transactions that are in a PROCESSED or FUNDED state (essentially that were funded
         * from our merchants' or Olive's side, and are about to be credited back to the customer)
         *
         * only consider each transaction's reward amount equal to the pending amount that will
         * be included in the current balance total.
         */
        transactionDataList
                    .filter((v,i,a)=>a.findIndex(v2=>(v2.transactionId===v.transactionId))===i)
                    .forEach(transaction => {
                        if (transaction.transactionStatus === TransactionsStatus.Processed || transaction.transactionStatus === TransactionsStatus.Funded) {
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
        const transactionDataList = get(sortedTransactionDataState);
        // the pending + credited amounts representing the lifetime savings balance
        let lifetimeSavingsBalance = 0;

        /**
         * ONLY look at transactions that are in PENDING, PROCESSED, FUNDED, FRONTED or CREDITED state
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
    roundupsTransactionDataState,
    sortedRoundupTransactionDataState,
    lifetimeRoundupSavingsState,
    showRoundupTransactionBottomSheetState,
    currentBalanceState,
    lifetimeSavingsState,
    showWalletBottomSheetState,
    transactionDataState,
    sortedTransactionDataState,
    showTransactionBottomSheetState,
    showDailySummaryConfettiState
};
