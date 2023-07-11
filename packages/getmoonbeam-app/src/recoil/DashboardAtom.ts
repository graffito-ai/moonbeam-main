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
 * Atom used to keep track of the state of the transactional data
 * retrieval, in order to avoid making multiple API calls after the
 * initial load of transactions for a user.
 */
const transactionalDataRetrievedState = atom({
    key: "transactionalDataRetrievedState",
    default: false
});

/**
 * A selector used to keep track of any updated to the transactionDataState, and sort that
 * list according to the timestamp, in descending order.
 */
const sortedTransactionDataState = selector<MoonbeamTransaction[]>({
    key: 'sortedTransactionDataState',
    get: ({get}) => {
        const transactionDataList = get(transactionDataState);
        return transactionDataList.slice().sort((a, b) => b.timestamp - a.timestamp);
    },
});


/**
 * Export all atoms and/or selectors
 */
export {
    transactionDataState,
    transactionalDataRetrievedState,
    sortedTransactionDataState
};
