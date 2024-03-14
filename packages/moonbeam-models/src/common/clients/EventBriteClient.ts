import {BaseAPIClient} from "./BaseAPIClient";
import {
    CreateEventSeriesInput,
    Event,
    EventSeries,
    EventSeriesResponse,
    EventSeriesStatus,
    EventsErrorType
} from "../GraphqlExports";
import {Constants} from "../Constants";
import axios from "axios";
import {v4 as uuidv4} from 'uuid';

/**
 * Class used as the base/generic client for all EventBrite calls.
 */
export class EventBriteClient extends BaseAPIClient {

    /**
     * Generic constructor for the client.
     *
     * @param environment the AWS environment passed in from the Lambda resolver.
     * @param region the AWS region passed in from the Lambda resolver.
     */
    constructor(environment: string, region: string) {
        super(region, environment);
    }

    /**
     * Function used to create a new event series for a particular organization, by extracting
     * the appropriate events information from EventBrite.
     *
     * @param createEventSeriesInput input passed in, which will be used in creating a new event series
     * and implicitly filling in the appropriate missing information via the EventBrite API call.
     *
     * @returns a {@link EventSeriesResponse}, representing the newly created event series to be stored,
     * obtained from the EventBrite API call, alongside with the information passed in.
     */
    async createEventSeriesForOrganization(createEventSeriesInput: CreateEventSeriesInput): Promise<EventSeriesResponse> {
        // easily identifiable API endpoint information
        const endpointInfo = 'GET /series EventBrite API';

        try {
            // retrieve the API Key and Base URL, needed in order to make the POST send mobile push notification through the client
            const [eventBriteBaseUrl, eventBriteAuthToken] = await super.retrieveServiceCredentials(Constants.AWSPairConstants.EVENTBRITE_SECRET_NAME);

            // check to see if we obtained any invalid secret values from the call above
            if (eventBriteBaseUrl === null || eventBriteBaseUrl.length === 0 ||
                eventBriteAuthToken === null || eventBriteAuthToken.length === 0) {
                const errorMessage = "Invalid Secrets obtained for EventBrite API call!";
                console.log(errorMessage);

                return {
                    errorMessage: errorMessage,
                    errorType: EventsErrorType.UnexpectedError
                };
            }

            /**
             * based on the Organization name and Event Series ID passed in, auto-detect if there are more than 1 pages with events to be returned
             * for this particular series, and if so, call the EventBrite API accordingly, in order to retrieve and use each Event page.
             */
            let pageNumber = 1; // starting at page 1
            let hasNext: boolean = true; // flag to drive the pagination calls
            let continuationToken: string = ""; // token to be used in case we get a continuation token returned for pagination purposes
            let hasErrors: boolean = false; // flag to highlight whether any of the events calls in this series have had errors while being called
            const eventList: Event[] = []; // list of Events for series
            // result to be returned
            let result: EventSeries = {
                createdAt: createEventSeriesInput.createdAt!,
                title: "",
                description: "",
                events: [],
                externalOrgID: "",
                externalSeriesID: createEventSeriesInput.externalSeriesID!,
                id: uuidv4(),
                name: createEventSeriesInput.name,
                seriesLogoUrlBg: "",
                seriesLogoUrlSm: "",
                status: EventSeriesStatus.Active,
                updatedAt: createEventSeriesInput.updatedAt!
            }
            while (hasNext && !hasErrors) {
                try {
                    console.log(`Executing Event calls for Event Series ID ${createEventSeriesInput.externalSeriesID}, for page ${pageNumber}`);
                    /**
                     * POST /series/{eventSeriesID}/events?time_filter=current_future&page={pageNumber}&page_size={pageSize}&order_by={orderBy}
                     * @link https://www.eventbrite.com/platform/api#/reference/event/update/list-events-by-series
                     *
                     * build the EventBrite API request body to be passed in, and perform a GET to it with the appropriate information
                     * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
                     * error for a better customer experience.
                     */
                    const requestUrl = continuationToken !== ""
                        ? `${eventBriteBaseUrl}/series/${createEventSeriesInput.externalSeriesID}/events?time_filter=current_future&page=${pageNumber}&page_size=200&order_by=start_asc&continuation=${continuationToken}`
                        : `${eventBriteBaseUrl}/series/${createEventSeriesInput.externalSeriesID}/events?time_filter=current_future&page=${pageNumber}&page_size=200&order_by=start_asc`;
                    const createEventSeriesResponse = await axios.get(requestUrl, {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${eventBriteAuthToken}`
                        },
                        timeout: 15000, // in milliseconds here
                        timeoutErrorMessage: 'EventBrite API timed out after 15000ms!'
                    });

                    // check if this call was successful or not
                    if (createEventSeriesResponse.status === 200) {
                        /**
                         * if we reached this, then we assume that a 2xx response code was returned.
                         * check the contents of the response, and act appropriately.
                         */
                        if (createEventSeriesResponse.data && createEventSeriesResponse.data["pagination"] !== undefined &&
                            createEventSeriesResponse.data["pagination"]["page_number"] !== undefined && createEventSeriesResponse.data["pagination"]["page_number"] === pageNumber &&
                            createEventSeriesResponse.data["pagination"]["page_count"] !== undefined && createEventSeriesResponse.data["pagination"]["has_more_items"] !== undefined &&
                            createEventSeriesResponse.data["events"] !== undefined && createEventSeriesResponse.data["events"].length !== 0) {
                            // see if we need more than one call, for pagination purposes
                            if ((createEventSeriesResponse.data["pagination"]["page_count"] !== 1 || createEventSeriesResponse.data["pagination"]["has_more_items"] == true) &&
                                createEventSeriesResponse.data["pagination"]["continuation"] !== undefined) {
                                hasNext = true;
                                continuationToken = createEventSeriesResponse.data["pagination"]["continuation"];
                                pageNumber += 1;
                            } else {
                                hasNext = false;
                                continuationToken = "";
                            }

                            // loop through each event in the list of events to be returned, and make sure that we can build our internal events structure accordingly
                            !hasErrors && createEventSeriesResponse.data["events"].forEach(returnedEvent => {
                                // check for a valid incoming event structure
                                if (returnedEvent !== undefined && returnedEvent !== null &&
                                    returnedEvent["name"] !== undefined && returnedEvent["name"]["text"] !== undefined &&
                                    returnedEvent["description"] !== undefined && returnedEvent["description"]["text"] !== undefined &&
                                    returnedEvent["start"] !== undefined && returnedEvent["start"]["timezone"] !== undefined && returnedEvent["start"]["local"] !== undefined && returnedEvent["start"]["utc"] !== undefined &&
                                    returnedEvent["end"] !== undefined && returnedEvent["end"]["timezone"] !== undefined && returnedEvent["end"]["local"] !== undefined && returnedEvent["end"]["utc"] !== undefined &&
                                    returnedEvent["organization_id"] !== undefined && returnedEvent["id"] !== undefined && returnedEvent["status"] !== undefined &&
                                    returnedEvent["summary"] !== undefined && returnedEvent["url"] !== undefined &&
                                    returnedEvent["logo"] !== undefined && returnedEvent["logo"]["original"] !== undefined && returnedEvent["logo"]["original"]["url"] !== undefined &&
                                    returnedEvent["logo"]["url"] !== undefined) {

                                    // add any missing Event Series object properties, if needed
                                    result.title = result.title !== "" ? result.title : returnedEvent["name"]["text"];
                                    result.description = result.description !== "" ? result.description : returnedEvent["description"]["text"];
                                    result.externalOrgID = result.externalOrgID !== "" ? result.externalOrgID : returnedEvent["organization_id"];
                                    result.seriesLogoUrlBg = result.seriesLogoUrlBg !== "" ? result.seriesLogoUrlBg : returnedEvent["logo"]["original"]["url"];
                                    result.seriesLogoUrlSm = result.seriesLogoUrlSm !== "" ? result.seriesLogoUrlSm : returnedEvent["logo"]["url"];

                                    // build the new Event object to be added in the series (only for live events)
                                    if (returnedEvent["status"] === "live") {
                                        const newEvent: Event = {
                                            title: returnedEvent["name"]["text"],
                                            description: returnedEvent["summary"],
                                            eventLogoUrlBg: returnedEvent["logo"]["original"]["url"],
                                            eventLogoUrlSm: returnedEvent["logo"]["url"],
                                            externalEventID: returnedEvent["id"],
                                            id: uuidv4(),
                                            registrationUrl: returnedEvent["url"],
                                            startTime: {
                                                timezone: returnedEvent["start"]["timezone"],
                                                startsAtLocal: new Date(returnedEvent["start"]["local"]).toISOString(),
                                                startsAtUTC: new Date(returnedEvent["start"]["utc"]).toISOString()
                                            },
                                            endTime: {
                                                timezone: returnedEvent["end"]["timezone"],
                                                endsAtLocal: new Date(returnedEvent["end"]["local"]).toISOString(),
                                                endsAtUTC: new Date(returnedEvent["end"]["utc"]).toISOString()
                                            }
                                        }
                                        // add the newly created event in the list of events to be returned with the Event Series
                                        eventList.push(newEvent);
                                    }
                                } else {
                                    // unexpected events series structure, return an error
                                    const errorMessage = `Unexpected structure received for Event from the EventsSeries call for series ${createEventSeriesInput.externalSeriesID}`;
                                    console.log(errorMessage);

                                    hasErrors = true;
                                    hasNext = false;
                                }
                            });
                        } else {
                            // unexpected events series structure, return an error
                            const errorMessage = `Unexpected structure received from the EventsSeries call for series ${createEventSeriesInput.externalSeriesID}`;
                            console.log(errorMessage);

                            hasErrors = true;
                            hasNext = false;
                        }
                    } else {
                        /**
                         * The request was made and the server responded with a status code
                         * that falls out of the range of 2xx.
                         */
                        const errorMessage = `Non 2xxx response while calling the ${endpointInfo} EventBrite API, with status ${createEventSeriesResponse.status}, and response ${JSON.stringify(createEventSeriesResponse.data)}`;
                        console.log(errorMessage);

                        // if we get a 404, for EventBrite this means that an Event sale is about to close, which is not an error in itself
                        if (createEventSeriesResponse.status !== 404) {
                            hasErrors = true;
                        }
                        hasNext = false;
                    }
                } catch (error) {
                    // @ts-ignore
                    if (error.response) {
                        /**
                         * The request was made and the server responded with a status code
                         * that falls out of the range of 2xx.
                         */
                            // @ts-ignore
                        const errorMessage = `Non 2xxx response while calling the ${endpointInfo} EventBrite API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
                        console.log(errorMessage);

                        // if we get a 404, for EventBrite this means that an Event sale is about to close, which is not an error in itself
                        // @ts-ignore
                        if (error.response.status !== 404) {
                            hasErrors = true;
                        }
                        hasNext = false;
                    }
                    // @ts-ignore
                    else if (error.request) {
                        /**
                         * The request was made but no response was received
                         * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                         *  http.ClientRequest in node.js.
                         */
                            // @ts-ignore
                        const errorMessage = `No response received while calling the ${endpointInfo} EventBrite API, for request ${error.request}`;
                        console.log(errorMessage);

                        hasErrors = true;
                        hasNext = false;
                    } else {
                        // Something happened in setting up the request that triggered an Error
                        // @ts-ignore
                        const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} EventBrite API, ${(error && error.message) && error.message}`;
                        console.log(errorMessage);

                        hasErrors = true;
                        hasNext = false;
                    }
                }
            }

            // if there are no errors from the event calls, then proceed with building that object accordingly
            if (!hasErrors) {
                // add the events to the list of events
                result.events = [...result.events, ...eventList];

                // return the object accordingly
                return {
                    data: [result]
                }
            } else {
                // Something happened in setting up the request that triggered an Error
                const errorMessage = `Unexpected error while retrieving events for series ${createEventSeriesInput.externalSeriesID}!`;
                console.log(errorMessage);

                return {
                    errorMessage: errorMessage,
                    errorType: EventsErrorType.UnexpectedError
                };
            }
        } catch (err) {
            const errorMessage = `Unexpected error while initiating the EventBrite Events Series retrieval call through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);

            return {
                errorMessage: errorMessage,
                errorType: EventsErrorType.UnexpectedError
            };
        }
    }
}
