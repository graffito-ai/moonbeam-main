import {atom} from "recoil";
import {Faq} from "@moonbeam/moonbeam-models";

/**
 * Atom used to keep track of the FAQS state, to be used for displaying
 * the FAQ screen.
 */
const faqListState = atom<Faq[]>({
    key: "faqListState",
    default: []
});

/**
 * Export all atoms and/or selectors
 */
export {
    faqListState
};
