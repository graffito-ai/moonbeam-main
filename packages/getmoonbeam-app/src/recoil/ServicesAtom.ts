import {EventSeries, Partner, Event} from "@moonbeam/moonbeam-models";
import {atom, selector} from "recoil";

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
 * A selector used to keep track of any updates to the sortedUpcomingEventsDataState, and sort that
 * list according to the createdAt time, in descending order.
 */
const sortedUpcomingEventsDataState = selector<Event[]>({
    key: 'sortedUpcomingEventsDataState',
    get: ({get}) => {
        const eventSeriesDataList = get(sortedEventSeriesDataState);
        /**
         * go through all the event series and sort their events according to their createdAt time.
         * Make sure we filter out events that are past today's date and time.
         */
        const allEventsToFilter: Event[] = [];
        eventSeriesDataList.forEach(eventSeries => {
            eventSeries.events.forEach(event => {
                if (event !== null) {
                    allEventsToFilter.push(event);
                }
            });
        });
        // sort the service partners by their creation date and ensure that there are no duplicates
        return allEventsToFilter
            .filter(event => Date.parse(new Date().toISOString()) < Date.parse(new Date(event.startTime.startsAtUTC).toISOString()))
            .sort((a, b) => Date.parse(new Date(a.startTime.startsAtUTC).toISOString()) - Date.parse(new Date(b.startTime.startsAtUTC).toISOString()));
    }
});

/**
 * A selector used to keep track of any updates to the servicePartnersDataState, and sort that
 * list according to the createdAt time, in descending order.
 */
const sortedServicePartnersDataState = selector<Partner[]>({
    key: 'sortedServicePartnersDataState',
    get: ({get}) => {
        const servicePartnersDataList = get(servicePartnersDataState);
        // sort the service partners by their creation date and ensure that there are no duplicates
        return servicePartnersDataList
            .filter((v, i, a) => a.findIndex(v2 => (v2.id === v.id)) === i)
            .slice().sort((a, b) => Date.parse(new Date(b.createdAt).toISOString()) - Date.parse(new Date(a.createdAt).toISOString()));
    }
});

/**
 * A selector used to keep track of any updates to the eventSeriesDataState, and sort that
 * list according to the createdAt time, in descending order.
 */
const sortedEventSeriesDataState = selector<EventSeries[]>({
    key: 'sortedEventSeriesDataState',
    get: ({get}) => {
        const eventSeriesDataList = get(eventSeriesDataState);
        // sort the event series by their creation date and ensure that there are no duplicates
        return eventSeriesDataList
            .filter((v, i, a) => a.findIndex(v2 => (v2.id === v.id)) === i)
            .slice().sort((a, b) => Date.parse(new Date(b.createdAt).toISOString()) - Date.parse(new Date(a.createdAt).toISOString()));
    }
});

/**
 * Export all atoms and/or selectors
 */
export {
    sortedUpcomingEventsDataState,
    sortedServicePartnersDataState,
    sortedEventSeriesDataState,
    servicePartnersDataState,
    eventSeriesDataState
};
