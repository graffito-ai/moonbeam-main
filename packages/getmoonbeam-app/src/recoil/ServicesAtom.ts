import {EventSeries, Partner} from "@moonbeam/moonbeam-models";
import {atom} from "recoil";

/**
 * Atom used to keep track of the Service Partner data retrieved.
 */
const servicePartnersDataState = atom<Partner[]>({
    key: "servicePartnersDataState",
    default: []
});

/**
 * Atom used to keep track of the Event Series data retrieved.
 */
const eventSeriesDataState = atom<EventSeries[]>({
    key: "eventSeriesDataState",
    default: []
});

/**
 * Export all atoms and/or selectors
 */
export {
    servicePartnersDataState,
    eventSeriesDataState
};
