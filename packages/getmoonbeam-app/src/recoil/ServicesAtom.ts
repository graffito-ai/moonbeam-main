import {Event, EventSeries, Partner} from "@moonbeam/moonbeam-models";
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
 * Atom used to keep track of the Service Partner state, to be used for displaying a Service
 * Partner detailed page.
 */
const servicePartnerState = atom<Partner | null>({
    key: "servicePartnerState",
    default: null
});

/**
 * Atom used to keep track of the Calendar Event state, to be used for displaying an Event Series'
 * detailed page.
 */
const calendarEventState = atom<(Event & { eventGroup: boolean }) | null>({
    key: "calendarEventState",
    default: null
});

const eventToRegisterState = atom<Event | null>({
    key: "eventToRegisterState",
    default: null
});


/**
 * A selector used to keep track of any updates to the sortedUpcomingEventsDataState, and sort that
 * list according to the createdAt time, in descending order.
 */
const sortedUpcomingEventsDataState = selector<(Event & { eventGroup: boolean })[]>({
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
        const allEventsToFilterWithFlag: (Event & { eventGroup: boolean })[] = [];
        let index: number = 0;
        let lastGroupEventDate: string = "";

        /**
         * Sort the upcoming events by their creation date and ensure that there are no duplicates.
         * Add a flag specifying whether the event is the start of an event grouping (events on the same
         * date), or not.
         */
        allEventsToFilter
            .filter(event => Date.parse(new Date().toISOString()) <= Date.parse(new Date(event.startTime.startsAtUTC).toISOString()))
            .sort((a, b) => Date.parse(new Date(a.startTime.startsAtUTC).toISOString()) - Date.parse(new Date(b.startTime.startsAtUTC).toISOString())).forEach(event => {
            const currentEventDate = new Date(event.startTime.startsAtUTC).toLocaleDateString([], {
                weekday: "short",
                month: "short",
                day: "numeric"
            });
            // for the first index we always want to start a new group
            if (index === 0) {
                allEventsToFilterWithFlag.push({
                    ...event,
                    eventGroup: true
                });
            } else {
                allEventsToFilterWithFlag.push({
                    ...event,
                    eventGroup: lastGroupEventDate.trim() !== currentEventDate.trim()
                });
            }
            index += 1;
            lastGroupEventDate = currentEventDate;
        });

        // return the sorted upcoming events
        return allEventsToFilterWithFlag;
    }
});

/**
 * A selector used to keep track of how many groups of events we have (used for display purposes.
 */
const numberOfEventGroupsState = selector<number>({
    key: 'numberOfEventGroupsState',
    get: ({get}) => {
        const sortedUpcomingEvents = get(sortedUpcomingEventsDataState);

        // get the number of groups
        let numberOfEventGroups = 0;
        sortedUpcomingEvents.forEach(sortedUpcomingEvent => {
            if (sortedUpcomingEvent.eventGroup) {
                numberOfEventGroups += 1;
            }
        })

        // return the number of event groups
        return numberOfEventGroups;
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
    numberOfEventGroupsState,
    eventToRegisterState,
    servicePartnerState,
    calendarEventState,
    sortedUpcomingEventsDataState,
    sortedServicePartnersDataState,
    sortedEventSeriesDataState,
    servicePartnersDataState,
    eventSeriesDataState
};
