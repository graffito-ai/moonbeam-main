"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBriteClient = void 0;
const BaseAPIClient_1 = require("./BaseAPIClient");
const GraphqlExports_1 = require("../GraphqlExports");
const Constants_1 = require("../Constants");
const index_1 = __importDefault(require("axios/index"));
const uuid_1 = require("uuid");
/**
 * Class used as the base/generic client for all EventBrite calls.
 */
class EventBriteClient extends BaseAPIClient_1.BaseAPIClient {
    /**
     * Generic constructor for the client.
     *
     * @param environment the AWS environment passed in from the Lambda resolver.
     * @param region the AWS region passed in from the Lambda resolver.
     */
    constructor(environment, region) {
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
    async createEventSeriesForOrganization(createEventSeriesInput) {
        // easily identifiable API endpoint information
        const endpointInfo = 'GET /series EventBrite API';
        try {
            // retrieve the API Key and Base URL, needed in order to make the POST send mobile push notification through the client
            const [eventBriteBaseUrl, eventBriteAuthToken] = await super.retrieveServiceCredentials(Constants_1.Constants.AWSPairConstants.EVENTBRITE_SECRET_NAME);
            // check to see if we obtained any invalid secret values from the call above
            if (eventBriteBaseUrl === null || eventBriteBaseUrl.length === 0 ||
                eventBriteAuthToken === null || eventBriteAuthToken.length === 0) {
                const errorMessage = "Invalid Secrets obtained for EventBrite API call!";
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: GraphqlExports_1.EventsErrorType.UnexpectedError
                };
            }
            /**
             * based on the Organization name and Event Series ID passed in, auto-detect if there are more than 1 pages with events to be returned
             * for this particular series, and if so, call the EventBrite API accordingly, in order to retrieve and use each Event page.
             */
            let pageNumber = 1; // starting at page 1
            let hasNext = true; // flag to drive the pagination calls
            let continuationToken = ""; // token to be used in case we get a continuation token returned for pagination purposes
            let hasErrors = false; // flag to highlight whether any of the events calls in this series have had errors while being called
            const eventList = []; // list of Events for series
            // result to be returned
            const result = {
                createdAt: createEventSeriesInput.createdAt,
                description: "",
                events: [],
                externalOrgID: "",
                externalSeriesID: createEventSeriesInput.externalSeriesID,
                id: (0, uuid_1.v4)(),
                name: createEventSeriesInput.name,
                seriesLogoUrlBg: "",
                seriesLogoUrlSm: "",
                status: GraphqlExports_1.EventSeriesStatus.Active,
                updatedAt: createEventSeriesInput.updatedAt
            };
            while (hasNext) {
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
                index_1.default.get(requestUrl, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${eventBriteAuthToken}`
                    },
                    timeout: 15000,
                    timeoutErrorMessage: 'EventBrite API timed out after 15000ms!'
                }).then(createEventSeriesResponse => {
                    console.log(`${endpointInfo} response ${JSON.stringify(createEventSeriesResponse.data)}`);
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
                        }
                        else {
                            hasNext = false;
                            continuationToken = "";
                        }
                        // loop through each event in the list of events to be returned, and make sure that we can build our internal events structure accordingly
                        createEventSeriesResponse.data["events"].forEach(returnedEvent => {
                            // check for a valid incoming event structure
                            if (returnedEvent !== undefined && returnedEvent !== null &&
                                returnedEvent["name"] !== undefined && returnedEvent["name"]["text"] !== undefined &&
                                returnedEvent["description"] !== undefined && returnedEvent["description"]["text"] !== undefined &&
                                returnedEvent["start"] !== undefined && returnedEvent["start"]["timezone"] !== undefined && returnedEvent["start"]["local"] !== undefined && returnedEvent["start"]["utc"] !== undefined &&
                                returnedEvent["end"] !== undefined && returnedEvent["end"]["timezone"] !== undefined && returnedEvent["end"]["local"] !== undefined && returnedEvent["end"]["utc"] !== undefined &&
                                returnedEvent["organization_id"] !== undefined && returnedEvent["id"] !== undefined && returnedEvent["status"] !== undefined && returnedEvent["status"] !== "live" &&
                                returnedEvent["summary"] !== undefined && returnedEvent["url"] !== undefined &&
                                returnedEvent["logo"] !== undefined && returnedEvent["logo"]["original"] !== undefined && returnedEvent["logo"]["original"]["url"] !== undefined &&
                                returnedEvent["logo"]["url"] !== undefined) {
                                // add any missing Event Series object properties, if needed
                                result.description = result.description !== "" ? result.description : returnedEvent["description"];
                                result.externalOrgID = result.externalOrgID !== "" ? result.externalOrgID : returnedEvent["organization_id"];
                                result.seriesLogoUrlBg = result.seriesLogoUrlBg !== "" ? result.seriesLogoUrlBg : returnedEvent["logo"]["original"]["url"];
                                result.seriesLogoUrlSm = result.seriesLogoUrlSm !== "" ? result.seriesLogoUrlSm : returnedEvent["logo"]["url"];
                                // build the new Event object to be added in the series
                                const newEvent = {
                                    description: returnedEvent["summary"],
                                    eventLogoUrlBg: returnedEvent["logo"]["original"]["url"],
                                    eventLogoUrlSm: returnedEvent["logo"]["url"],
                                    externalEventID: returnedEvent["id"],
                                    id: (0, uuid_1.v4)(),
                                    registrationUrl: returnedEvent["url"],
                                    startTime: {
                                        timezone: returnedEvent["start"]["timezone"],
                                        startsAtLocal: returnedEvent["start"]["local"],
                                        startsAtUTC: returnedEvent["start"]["utc"]
                                    },
                                    endTime: {
                                        timezone: returnedEvent["end"]["timezone"],
                                        startsAtLocal: returnedEvent["end"]["local"],
                                        startsAtUTC: returnedEvent["end"]["utc"]
                                    }
                                };
                                // add the newly created event in the list of events to be returned with the Event Series
                                eventList.push(newEvent);
                            }
                            else {
                                // unexpected events series structure, return an error
                                const errorMessage = `Unexpected structure received for Event from the EventsSeries call for series ${createEventSeriesInput.externalSeriesID}`;
                                console.log(errorMessage);
                                hasErrors = true;
                            }
                        });
                    }
                    else {
                        // unexpected events series structure, return an error
                        const errorMessage = `Unexpected structure received from the EventsSeries call for series ${createEventSeriesInput.externalSeriesID}`;
                        console.log(errorMessage);
                        hasErrors = true;
                    }
                }).catch(error => {
                    if (error.response) {
                        /**
                         * The request was made and the server responded with a status code
                         * that falls out of the range of 2xx.
                         */
                        const errorMessage = `Non 2xxx response while calling the ${endpointInfo} EventBrite API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
                        console.log(errorMessage);
                        hasErrors = true;
                    }
                    else if (error.request) {
                        /**
                         * The request was made but no response was received
                         * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                         *  http.ClientRequest in node.js.
                         */
                        const errorMessage = `No response received while calling the ${endpointInfo} EventBrite API, for request ${error.request}`;
                        console.log(errorMessage);
                        hasErrors = true;
                    }
                    else {
                        // Something happened in setting up the request that triggered an Error
                        const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} EventBrite API, ${(error && error.message) && error.message}`;
                        console.log(errorMessage);
                        hasErrors = true;
                    }
                });
            }
            // if there are no errors from the event calls, and there are events to be populated in the end object, then proceed with building that object accordingly
            if (!hasErrors && eventList.length !== 0) {
                // add the event list in the final event series object to be returned
                result.events = [...result.events, ...eventList];
                // return the object accordingly
                return {
                    data: result
                };
            }
            else {
                // Something happened in setting up the request that triggered an Error
                const errorMessage = `Unexpected error while retrieving events for series ${createEventSeriesInput.externalSeriesID}!`;
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: GraphqlExports_1.EventsErrorType.UnexpectedError
                };
            }
        }
        catch (err) {
            const errorMessage = `Unexpected error while initiating the EventBrite Events Series retrieval call through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.EventsErrorType.UnexpectedError
            };
        }
    }
}
exports.EventBriteClient = EventBriteClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXZlbnRCcml0ZUNsaWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tb24vY2xpZW50cy9FdmVudEJyaXRlQ2xpZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLG1EQUE4QztBQUM5QyxzREFPMkI7QUFDM0IsNENBQXVDO0FBQ3ZDLHdEQUFnQztBQUNoQywrQkFBa0M7QUFFbEM7O0dBRUc7QUFDSCxNQUFhLGdCQUFpQixTQUFRLDZCQUFhO0lBRS9DOzs7OztPQUtHO0lBQ0gsWUFBWSxXQUFtQixFQUFFLE1BQWM7UUFDM0MsS0FBSyxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRUQ7Ozs7Ozs7OztPQVNHO0lBQ0gsS0FBSyxDQUFDLGdDQUFnQyxDQUFDLHNCQUE4QztRQUNqRiwrQ0FBK0M7UUFDL0MsTUFBTSxZQUFZLEdBQUcsNEJBQTRCLENBQUM7UUFFbEQsSUFBSTtZQUNBLHVIQUF1SDtZQUN2SCxNQUFNLENBQUMsaUJBQWlCLEVBQUUsbUJBQW1CLENBQUMsR0FBRyxNQUFNLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxxQkFBUyxDQUFDLGdCQUFnQixDQUFDLHNCQUFzQixDQUFDLENBQUM7WUFFM0ksNEVBQTRFO1lBQzVFLElBQUksaUJBQWlCLEtBQUssSUFBSSxJQUFJLGlCQUFpQixDQUFDLE1BQU0sS0FBSyxDQUFDO2dCQUM1RCxtQkFBbUIsS0FBSyxJQUFJLElBQUksbUJBQW1CLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDbEUsTUFBTSxZQUFZLEdBQUcsbURBQW1ELENBQUM7Z0JBQ3pFLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBRTFCLE9BQU87b0JBQ0gsWUFBWSxFQUFFLFlBQVk7b0JBQzFCLFNBQVMsRUFBRSxnQ0FBZSxDQUFDLGVBQWU7aUJBQzdDLENBQUM7YUFDTDtZQUVEOzs7ZUFHRztZQUNILElBQUksVUFBVSxH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LElBQUksQ0FBQyxLQUFLLFNBQVMsSUFBSSxhQUFhLENBQUMsUUFBUSxDQUFDLEtBQUssU0FBUyxJQUFJLGFBQWEsQ0FBQyxRQUFRLENBQUMsS0FBSyxNQUFNO2dDQUNsSyxhQUFhLENBQUMsU0FBUyxDQUFDLEtBQUssU0FBUyxJQUFJLGFBQWEsQ0FBQyxLQUFLLENBQUMsS0FBSyxTQUFTO2dDQUM1RSxhQUFhLENBQUMsTUFBTSxDQUFDLEtBQUssU0FBUyxJQUFJLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxVQUFVLENBQUMsS0FBSyxTQUFTLElBQUksYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLFNBQVM7Z0NBQ2hKLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxTQUFTLEVBQUU7Z0NBQzVDLDREQUE0RDtnQ0FDNUQsTUFBTSxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUMsV0FBVyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxDQUFDO2dDQUNuRyxNQUFNLENBQUMsYUFBYSxHQUFHLE1BQU0sQ0FBQyxhQUFhLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQztnQ0FDN0csTUFBTSxDQUFDLGVBQWUsR0FBRyxNQUFNLENBQUMsZUFBZSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dDQUMzSCxNQUFNLENBQUMsZUFBZSxHQUFHLE1BQU0sQ0FBQyxlQUFlLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFD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LDBKQUEwSjtZQUMxSixJQUFJLENBQUMsU0FBUyxJQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUN0QyxxRUFBcUU7Z0JBQ3JFLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQztnQkFFakQsZ0NBQWdDO2dCQUNoQyxPQUFPO29CQUNILElBQUksRUFBRSxNQUFNO2lCQUNmLENBQUE7YUFDSjtpQkFBTTtnQkFDSCx1RUFBdUU7Z0JBQ3ZFLE1BQU0sWUFBWSxHQUFHLHVEQUF1RCxzQkFBc0IsQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDO2dCQUN2SCxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUUxQixPQUFPO29CQUNILFlBQVksRUFBRSxZQUFZO29CQUMxQixTQUFTLEVBQUUsZ0NBQWUsQ0FBQyxlQUFlO2lCQUM3QyxDQUFDO2FBQ0w7U0FDSjtRQUFDLE9BQU8sR0FBRyxFQUFFO1lBQ1YsTUFBTSxZQUFZLEdBQUcseUZBQXlGLFlBQVksRUFBRSxDQUFDO1lBQzdILE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxZQUFZLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQztZQUV0QyxPQUFPO2dCQUNILFlBQVksRUFBRSxZQUFZO2dCQUMxQixTQUFTLEVBQUUsZ0NBQWUsQ0FBQyxlQUFlO2FBQzdDLENBQUM7U0FDTDtJQUNMLENBQUM7Q0FDSjtBQTFORCw0Q0EwTkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0Jhc2VBUElDbGllbnR9IGZyb20gXCIuL0Jhc2VBUElDbGllbnRcIjtcbmltcG9ydCB7XG4gICAgQ3JlYXRlRXZlbnRTZXJpZXNJbnB1dCxcbiAgICBFdmVudCxcbiAgICBFdmVudFNlcmllcyxcbiAgICBFdmVudFNlcmllc1Jlc3BvbnNlLFxuICAgIEV2ZW50U2VyaWVzU3RhdHVzLFxuICAgIEV2ZW50c0Vycm9yVHlwZVxufSBmcm9tIFwiLi4vR3JhcGhxbEV4cG9ydHNcIjtcbmltcG9ydCB7Q29uc3RhbnRzfSBmcm9tIFwiLi4vQ29uc3RhbnRzXCI7XG5pbXBvcnQgYXhpb3MgZnJvbSBcImF4aW9zL2luZGV4XCI7XG5pbXBvcnQge3Y0IGFzIHV1aWR2NH0gZnJvbSAndXVpZCc7XG5cbi8qKlxuICogQ2xhc3MgdXNlZCBhcyB0aGUgYmFzZS9nZW5lcmljIGNsaWVudCBmb3IgYWxsIEV2ZW50QnJpdGUgY2FsbHMuXG4gKi9cbmV4cG9ydCBjbGFzcyBFdmVudEJyaXRlQ2xpZW50IGV4dGVuZHMgQmFzZUFQSUNsaWVudCB7XG5cbiAgICAvKipcbiAgICAgKiBHZW5lcmljIGNvbnN0cnVjdG9yIGZvciB0aGUgY2xpZW50LlxuICAgICAqXG4gICAgICogQHBhcmFtIGVudmlyb25tZW50IHRoZSBBV1MgZW52aXJvbm1lbnQgcGFzc2VkIGluIGZyb20gdGhlIExhbWJkYSByZXNvbHZlci5cbiAgICAgKiBAcGFyYW0gcmVnaW9uIHRoZSBBV1MgcmVnaW9uIHBhc3NlZCBpbiBmcm9tIHRoZSBMYW1iZGEgcmVzb2x2ZXIuXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZW52aXJvbm1lbnQ6IHN0cmluZywgcmVnaW9uOiBzdHJpbmcpIHtcbiAgICAgICAgc3VwZXIocmVnaW9uLCBlbnZpcm9ubWVudCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdXNlZCB0byBjcmVhdGUgYSBuZXcgZXZlbnQgc2VyaWVzIGZvciBhIHBhcnRpY3VsYXIgb3JnYW5pemF0aW9uLCBieSBleHRyYWN0aW5nXG4gICAgICogdGhlIGFwcHJvcHJpYXRlIGV2ZW50cyBpbmZvcm1hdGlvbiBmcm9tIEV2ZW50QnJpdGUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gY3JlYXRlRXZlbnRTZXJpZXNJbnB1dCBpbnB1dCBwYXNzZWQgaW4sIHdoaWNoIHdpbGwgYmUgdXNlZCBpbiBjcmVhdGluZyBhIG5ldyBldmVudCBzZXJpZXNcbiAgICAgKiBhbmQgaW1wbGljaXRseSBmaWxsaW5nIGluIHRoZSBhcHByb3ByaWF0ZSBtaXNzaW5nIGluZm9ybWF0aW9uIHZpYSB0aGUgRXZlbnRCcml0ZSBBUEkgY2FsbC5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIGEge0BsaW5rIEV2ZW50U2VyaWVzUmVzcG9uc2V9LCByZXByZXNlbnRpbmcgdGhlIG5ld2x5IGNyZWF0ZWQgZXZlbnQgc2VyaWVzIHRvIGJlIHN0b3JlZCxcbiAgICAgKiBvYnRhaW5lZCBmcm9tIHRoZSBFdmVudEJyaXRlIEFQSSBjYWxsLCBhbG9uZ3NpZGUgd2l0aCB0aGUgaW5mb3JtYXRpb24gcGFzc2VkIGluLlxuICAgICAqL1xuICAgIGFzeW5jIGNyZWF0ZUV2ZW50U2VyaWVzRm9yT3JnYW5pemF0aW9uKGNyZWF0ZUV2ZW50U2VyaWVzSW5wdXQ6IENyZWF0ZUV2ZW50U2VyaWVzSW5wdXQpOiBQcm9taXNlPEV2ZW50U2VyaWVzUmVzcG9uc2U+IHtcbiAgICAgICAgLy8gZWFzaWx5IGlkZW50aWZpYWJsZSBBUEkgZW5kcG9pbnQgaW5mb3JtYXRpb25cbiAgICAgICAgY29uc3QgZW5kcG9pbnRJbmZvID0gJ0dFVCAvc2VyaWVzIEV2ZW50QnJpdGUgQVBJJztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIEFQSSBLZXkgYW5kIEJhc2UgVVJMLCBuZWVkZWQgaW4gb3JkZXIgdG8gbWFrZSB0aGUgUE9TVCBzZW5kIG1vYmlsZSBwdXNoIG5vdGlmaWNhdGlvbiB0aHJvdWdoIHRoZSBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IFtldmVudEJyaXRlQmFzZVVybCwgZXZlbnRCcml0ZUF1dGhUb2tlbl0gPSBhd2FpdCBzdXBlci5yZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyhDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5FVkVOVEJSSVRFX1NFQ1JFVF9OQU1FKTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHdlIG9idGFpbmVkIGFueSBpbnZhbGlkIHNlY3JldCB2YWx1ZXMgZnJvbSB0aGUgY2FsbCBhYm92ZVxuICAgICAgICAgICAgaWYgKGV2ZW50QnJpdGVCYXNlVXJsID09PSBudWxsIHx8IGV2ZW50QnJpdGVCYXNlVXJsLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIGV2ZW50QnJpdGVBdXRoVG9rZW4gPT09IG51bGwgfHwgZXZlbnRCcml0ZUF1dGhUb2tlbi5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBcIkludmFsaWQgU2VjcmV0cyBvYnRhaW5lZCBmb3IgRXZlbnRCcml0ZSBBUEkgY2FsbCFcIjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogRXZlbnRzRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogYmFzZWQgb24gdGhlIE9yZ2FuaXphdGlvbiBuYW1lIGFuZCBFdmVudCBTZXJpZXMgSUQgcGFzc2VkIGluLCBhdXRvLWRldGVjdCBpZiB0aGVyZSBhcmUgbW9yZSB0aGFuIDEgcGFnZXMgd2l0aCBldmVudHMgdG8gYmUgcmV0dXJuZWRcbiAgICAgICAgICAgICAqIGZvciB0aGlzIHBhcnRpY3VsYXIgc2VyaWVzLCBhbmQgaWYgc28sIGNhbGwgdGhlIEV2ZW50QnJpdGUgQVBJIGFjY29yZGluZ2x5LCBpbiBvcmRlciB0byByZXRyaWV2ZSBhbmQgdXNlIGVhY2ggRXZlbnQgcGFnZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgbGV0IHBhZ2VOdW1iZXIgPSAxOyAvLyBzdGFydGluZyBhdCBwYWdlIDFcbiAgICAgICAgICAgIGxldCBoYXNOZXh0OiBib29sZWFuID0gdHJ1ZTsgLy8gZmxhZyB0byBkcml2ZSB0aGUgcGFnaW5hdGlvbiBjYWxsc1xuICAgICAgICAgICAgbGV0IGNvbnRpbnVhdGlvblRva2VuOiBzdHJpbmcgPSBcIlwiOyAvLyB0b2tlbiB0byBiZSB1c2VkIGluIGNhc2Ugd2UgZ2V0IGEgY29udGludWF0aW9uIHRva2VuIHJldHVybmVkIGZvciBwYWdpbmF0aW9uIHB1cnBvc2VzXG4gICAgICAgICAgICBsZXQgaGFzRXJyb3JzOiBib29sZWFuID0gZmFsc2U7IC8vIGZsYWcgdG8gaGlnaGxpZ2h0IHdoZXRoZXIgYW55IG9mIHRoZSBldmVudHMgY2FsbHMgaW4gdGhpcyBzZXJpZXMgaGF2ZSBoYWQgZXJyb3JzIHdoaWxlIGJlaW5nIGNhbGxlZFxuICAgICAgICAgICAgY29uc3QgZXZlbnRMaXN0OiBFdmVudFtdID0gW107IC8vIGxpc3Qgb2YgRXZlbnRzIGZvciBzZXJpZXNcbiAgICAgICAgICAgIC8vIHJlc3VsdCB0byBiZSByZXR1cm5lZFxuICAgICAgICAgICAgY29uc3QgcmVzdWx0OiBFdmVudFNlcmllcyA9IHtcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IGNyZWF0ZUV2ZW50U2VyaWVzSW5wdXQuY3JlYXRlZEF0ISxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJcIixcbiAgICAgICAgICAgICAgICBldmVudHM6IFtdLFxuICAgICAgICAgICAgICAgIGV4dGVybmFsT3JnSUQ6IFwiXCIsXG4gICAgICAgICAgICAgICAgZXh0ZXJuYWxTZXJpZXNJRDogY3JlYXRlRXZlbnRTZXJpZXNJbnB1dC5leHRlcm5hbFNlcmllc0lELFxuICAgICAgICAgICAgICAgIGlkOiB1dWlkdjQoKSxcbiAgICAgICAgICAgICAgICBuYW1lOiBjcmVhdGVFdmVudFNlcmllc0lucHV0Lm5hbWUsXG4gICAgICAgICAgICAgICAgc2VyaWVzTG9nb1VybEJnOiBcIlwiLFxuICAgICAgICAgICAgICAgIHNlcmllc0xvZ29VcmxTbTogXCJcIixcbiAgICAgICAgICAgICAgICBzdGF0dXM6IEV2ZW50U2VyaWVzU3RhdHVzLkFjdGl2ZSxcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXQ6IGNyZWF0ZUV2ZW50U2VyaWVzSW5wdXQudXBkYXRlZEF0IVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgd2hpbGUgKGhhc05leHQpIHtcbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiBQT1NUIC9zZXJpZXMve2V2ZW50U2VyaWVzSUR9L2V2ZW50cz90aW1lX2ZpbHRlcj1jdXJyZW50X2Z1dHVyZSZwYWdlPXtwYWdlTnVtYmVyfSZwYWdlX3NpemU9e3BhZ2VTaXplfSZvcmRlcl9ieT17b3JkZXJCeX1cbiAgICAgICAgICAgICAgICAgKiBAbGluayBodHRwczovL3d3dy5ldmVudGJyaXRlLmNvbS9wbGF0Zm9ybS9hcGkjL3JlZmVyZW5jZS9ldmVudC91cGRhdGUvbGlzdC1ldmVudHMtYnktc2VyaWVzXG4gICAgICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAgICAgKiBidWlsZCB0aGUgRXZlbnRCcml0ZSBBUEkgcmVxdWVzdCBib2R5IHRvIGJlIHBhc3NlZCBpbiwgYW5kIHBlcmZvcm0gYSBHRVQgdG8gaXQgd2l0aCB0aGUgYXBwcm9wcmlhdGUgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAgICAgKiB3ZSBpbXBseSB0aGF0IGlmIHRoZSBBUEkgZG9lcyBub3QgcmVzcG9uZCBpbiAxNSBzZWNvbmRzLCB0aGVuIHdlIGF1dG9tYXRpY2FsbHkgY2F0Y2ggdGhhdCwgYW5kIHJldHVybiBhblxuICAgICAgICAgICAgICAgICAqIGVycm9yIGZvciBhIGJldHRlciBjdXN0b21lciBleHBlcmllbmNlLlxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlcXVlc3RVcmwgPSBjb250aW51YXRpb25Ub2tlbiAhPT0gXCJcIlxuICAgICAgICAgICAgICAgICAgICA/IGAke2V2ZW50QnJpdGVCYXNlVXJsfS9zZXJpZXMvJHtjcmVhdGVFdmVudFNlcmllc0lucHV0LmV4dGVybmFsU2VyaWVzSUR9L2V2ZW50cz90aW1lX2ZpbHRlcj1jdXJyZW50X2Z1dHVyZSZwYWdlPSR7cGFnZU51bWJlcn0mcGFnZV9zaXplPTIwMCZvcmRlcl9ieT1zdGFydF9hc2MmY29udGludWF0aW9uPSR7Y29udGludWF0aW9uVG9rZW59YFxuICAgICAgICAgICAgICAgICAgICA6IGAke2V2ZW50QnJpdGVCYXNlVXJsfS9zZXJpZXMvJHtjcmVhdGVFdmVudFNlcmllc0lucHV0LmV4dGVybmFsU2VyaWVzSUR9L2V2ZW50cz90aW1lX2ZpbHRlcj1jdXJyZW50X2Z1dHVyZSZwYWdlPSR7cGFnZU51bWJlcn0mcGFnZV9zaXplPTIwMCZvcmRlcl9ieT1zdGFydF9hc2NgO1xuICAgICAgICAgICAgICAgIGF4aW9zLmdldChyZXF1ZXN0VXJsLCB7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJBdXRob3JpemF0aW9uXCI6IGBCZWFyZXIgJHtldmVudEJyaXRlQXV0aFRva2VufWBcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdGltZW91dDogMTUwMDAsIC8vIGluIG1pbGxpc2Vjb25kcyBoZXJlXG4gICAgICAgICAgICAgICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2U6ICdFdmVudEJyaXRlIEFQSSB0aW1lZCBvdXQgYWZ0ZXIgMTUwMDBtcyEnXG4gICAgICAgICAgICAgICAgfSkudGhlbihjcmVhdGVFdmVudFNlcmllc1Jlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGNyZWF0ZUV2ZW50U2VyaWVzUmVzcG9uc2UuZGF0YSl9YCk7XG5cbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIGlmIHdlIHJlYWNoZWQgdGhpcywgdGhlbiB3ZSBhc3N1bWUgdGhhdCBhIDJ4eCByZXNwb25zZSBjb2RlIHdhcyByZXR1cm5lZC5cbiAgICAgICAgICAgICAgICAgICAgICogY2hlY2sgdGhlIGNvbnRlbnRzIG9mIHRoZSByZXNwb25zZSwgYW5kIGFjdCBhcHByb3ByaWF0ZWx5LlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgaWYgKGNyZWF0ZUV2ZW50U2VyaWVzUmVzcG9uc2UuZGF0YSAmJiBjcmVhdGVFdmVudFNlcmllc1Jlc3BvbnNlLmRhdGFbXCJwYWdpbmF0aW9uXCJdICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZUV2ZW50U2VyaWVzUmVzcG9uc2UuZGF0YVtcInBhZ2luYXRpb25cIl1bXCJwYWdlX251bWJlclwiXSAhPT0gdW5kZWZpbmVkICYmIGNyZWF0ZUV2ZW50U2VyaWVzUmVzcG9uc2UuZGF0YVtcInBhZ2luYXRpb25cIl1bXCJwYWdlX251bWJlclwiXSA9PT0gcGFnZU51bWJlciAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlRXZlbnRTZXJpZXNSZXNwb25zZS5kYXRhW1wicGFnaW5hdGlvblwiXVtcInBhZ2VfY291bnRcIl0gIT09IHVuZGVmaW5lZCAmJiBjcmVhdGVFdmVudFNlcmllc1Jlc3BvbnNlLmRhdGFbXCJwYWdpbmF0aW9uXCJdW1wiaGFzX21vcmVfaXRlbXNcIl0gIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlRXZlbnRTZXJpZXNSZXNwb25zZS5kYXRhW1wiZXZlbnRzXCJdICE9PSB1bmRlZmluZWQgJiYgY3JlYXRlRXZlbnRTZXJpZXNSZXNwb25zZS5kYXRhW1wiZXZlbnRzXCJdLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2VlIGlmIHdlIG5lZWQgbW9yZSB0aGFuIG9uZSBjYWxsLCBmb3IgcGFnaW5hdGlvbiBwdXJwb3Nlc1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKChjcmVhdGVFdmVudFNlcmllc1Jlc3BvbnNlLmRhdGFbXCJwYWdpbmF0aW9uXCJdW1wicGFnZV9jb3VudFwiXSAhPT0gMSB8fCBjcmVhdGVFdmVudFNlcmllc1Jlc3BvbnNlLmRhdGFbXCJwYWdpbmF0aW9uXCJdW1wiaGFzX21vcmVfaXRlbXNcIl0gPT0gdHJ1ZSkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVFdmVudFNlcmllc1Jlc3BvbnNlLmRhdGFbXCJwYWdpbmF0aW9uXCJdW1wiY29udGludWF0aW9uXCJdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNOZXh0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51YXRpb25Ub2tlbiA9IGNyZWF0ZUV2ZW50U2VyaWVzUmVzcG9uc2UuZGF0YVtcInBhZ2luYXRpb25cIl1bXCJjb250aW51YXRpb25cIl07XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc05leHQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51YXRpb25Ub2tlbiA9IFwiXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGxvb3AgdGhyb3VnaCBlYWNoIGV2ZW50IGluIHRoZSBsaXN0IG9mIGV2ZW50cyB0byBiZSByZXR1cm5lZCwgYW5kIG1ha2Ugc3VyZSB0aGF0IHdlIGNhbiBidWlsZCBvdXIgaW50ZXJuYWwgZXZlbnRzIHN0cnVjdHVyZSBhY2NvcmRpbmdseVxuICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlRXZlbnRTZXJpZXNSZXNwb25zZS5kYXRhW1wiZXZlbnRzXCJdLmZvckVhY2gocmV0dXJuZWRFdmVudCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2hlY2sgZm9yIGEgdmFsaWQgaW5jb21pbmcgZXZlbnQgc3RydWN0dXJlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJldHVybmVkRXZlbnQgIT09IHVuZGVmaW5lZCAmJiByZXR1cm5lZEV2ZW50ICE9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybmVkRXZlbnRbXCJuYW1lXCJdICE9PSB1bmRlZmluZWQgJiYgcmV0dXJuZWRFdmVudFtcIm5hbWVcIl1bXCJ0ZXh0XCJdICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuZWRFdmVudFtcImRlc2NyaXB0aW9uXCJdICE9PSB1bmRlZmluZWQgJiYgcmV0dXJuZWRFdmVudFtcImRlc2NyaXB0aW9uXCJdW1widGV4dFwiXSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybmVkRXZlbnRbXCJzdGFydFwiXSAhPT0gdW5kZWZpbmVkICYmIHJldHVybmVkRXZlbnRbXCJzdGFydFwiXVtcInRpbWV6b25lXCJdICE9PSB1bmRlZmluZWQgJiYgcmV0dXJuZWRFdmVudFtcInN0YXJ0XCJdW1wibG9jYWxcIl0gIT09IHVuZGVmaW5lZCAmJiByZXR1cm5lZEV2ZW50W1wic3RhcnRcIl1bXCJ1dGNcIl0gIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5lZEV2ZW50W1wiZW5kXCJdICE9PSB1bmRlZmluZWQgJiYgcmV0dXJuZWRFdmVudFtcImVuZFwiXVtcInRpbWV6b25lXCJdICE9PSB1bmRlZmluZWQgJiYgcmV0dXJuZWRFdmVudFtcImVuZFwiXVtcImxvY2FsXCJdICE9PSB1bmRlZmluZWQgJiYgcmV0dXJuZWRFdmVudFtcImVuZFwiXVtcInV0Y1wiXSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybmVkRXZlbnRbXCJvcmdhbml6YXRpb25faWRcIl0gIT09IHVuZGVmaW5lZCAmJiByZXR1cm5lZEV2ZW50W1wiaWRcIl0gIT09IHVuZGVmaW5lZCAmJiByZXR1cm5lZEV2ZW50W1wic3RhdHVzXCJdICE9PSB1bmRlZmluZWQgJiYgcmV0dXJuZWRFdmVudFtcInN0YXR1c1wiXSAhPT0gXCJsaXZlXCIgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuZWRFdmVudFtcInN1bW1hcnlcIl0gIT09IHVuZGVmaW5lZCAmJiByZXR1cm5lZEV2ZW50W1widXJsXCJdICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuZWRFdmVudFtcImxvZ29cIl0gIT09IHVuZGVmaW5lZCAmJiByZXR1cm5lZEV2ZW50W1wibG9nb1wiXVtcIm9yaWdpbmFsXCJdICE9PSB1bmRlZmluZWQgJiYgcmV0dXJuZWRFdmVudFtcImxvZ29cIl1bXCJvcmlnaW5hbFwiXVtcInVybFwiXSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybmVkRXZlbnRbXCJsb2dvXCJdW1widXJsXCJdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWRkIGFueSBtaXNzaW5nIEV2ZW50IFNlcmllcyBvYmplY3QgcHJvcGVydGllcywgaWYgbmVlZGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5kZXNjcmlwdGlvbiA9IHJlc3VsdC5kZXNjcmlwdGlvbiAhPT0gXCJcIiA/IHJlc3VsdC5kZXNjcmlwdGlvbiA6IHJldHVybmVkRXZlbnRbXCJkZXNjcmlwdGlvblwiXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LmV4dGVybmFsT3JnSUQgPSByZXN1bHQuZXh0ZXJuYWxPcmdJRCAhPT0gXCJcIiA/IHJlc3VsdC5leHRlcm5hbE9yZ0lEIDogcmV0dXJuZWRFdmVudFtcIm9yZ2FuaXphdGlvbl9pZFwiXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnNlcmllc0xvZ29VcmxCZyA9IHJlc3VsdC5zZXJpZXNMb2dvVXJsQmcgIT09IFwiXCIgPyByZXN1bHQuc2VyaWVzTG9nb1VybEJnIDogcmV0dXJuZWRFdmVudFtcImxvZ29cIl1bXCJvcmlnaW5hbFwiXVtcInVybFwiXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnNlcmllc0xvZ29VcmxTbSA9IHJlc3VsdC5zZXJpZXNMb2dvVXJsU20gIT09IFwiXCIgPyByZXN1bHQuc2VyaWVzTG9nb1VybFNtIDogcmV0dXJuZWRFdmVudFtcImxvZ29cIl1bXCJ1cmxcIl07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYnVpbGQgdGhlIG5ldyBFdmVudCBvYmplY3QgdG8gYmUgYWRkZWQgaW4gdGhlIHNlcmllc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdFdmVudDogRXZlbnQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogcmV0dXJuZWRFdmVudFtcInN1bW1hcnlcIl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudExvZ29VcmxCZzogcmV0dXJuZWRFdmVudFtcImxvZ29cIl1bXCJvcmlnaW5hbFwiXVtcInVybFwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50TG9nb1VybFNtOiByZXR1cm5lZEV2ZW50W1wibG9nb1wiXVtcInVybFwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVybmFsRXZlbnRJRDogcmV0dXJuZWRFdmVudFtcImlkXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHV1aWR2NCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVnaXN0cmF0aW9uVXJsOiByZXR1cm5lZEV2ZW50W1widXJsXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRUaW1lOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZXpvbmU6IHJldHVybmVkRXZlbnRbXCJzdGFydFwiXVtcInRpbWV6b25lXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0c0F0TG9jYWw6IHJldHVybmVkRXZlbnRbXCJzdGFydFwiXVtcImxvY2FsXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0c0F0VVRDOiByZXR1cm5lZEV2ZW50W1wic3RhcnRcIl1bXCJ1dGNcIl1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmRUaW1lOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZXpvbmU6IHJldHVybmVkRXZlbnRbXCJlbmRcIl1bXCJ0aW1lem9uZVwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFydHNBdExvY2FsOiByZXR1cm5lZEV2ZW50W1wiZW5kXCJdW1wibG9jYWxcIl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRzQXRVVEM6IHJldHVybmVkRXZlbnRbXCJlbmRcIl1bXCJ1dGNcIl1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhZGQgdGhlIG5ld2x5IGNyZWF0ZWQgZXZlbnQgaW4gdGhlIGxpc3Qgb2YgZXZlbnRzIHRvIGJlIHJldHVybmVkIHdpdGggdGhlIEV2ZW50IFNlcmllc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudExpc3QucHVzaChuZXdFdmVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdW5leHBlY3RlZCBldmVudHMgc2VyaWVzIHN0cnVjdHVyZSwgcmV0dXJuIGFuIGVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIHN0cnVjdHVyZSByZWNlaXZlZCBmb3IgRXZlbnQgZnJvbSB0aGUgRXZlbnRzU2VyaWVzIGNhbGwgZm9yIHNlcmllcyAke2NyZWF0ZUV2ZW50U2VyaWVzSW5wdXQuZXh0ZXJuYWxTZXJpZXNJRH1gO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc0Vycm9ycyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB1bmV4cGVjdGVkIGV2ZW50cyBzZXJpZXMgc3RydWN0dXJlLCByZXR1cm4gYW4gZXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIHN0cnVjdHVyZSByZWNlaXZlZCBmcm9tIHRoZSBFdmVudHNTZXJpZXMgY2FsbCBmb3Igc2VyaWVzICR7Y3JlYXRlRXZlbnRTZXJpZXNJbnB1dC5leHRlcm5hbFNlcmllc0lEfWA7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBoYXNFcnJvcnMgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyb3IucmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYW5kIHRoZSBzZXJ2ZXIgcmVzcG9uZGVkIHdpdGggYSBzdGF0dXMgY29kZVxuICAgICAgICAgICAgICAgICAgICAgICAgICogdGhhdCBmYWxscyBvdXQgb2YgdGhlIHJhbmdlIG9mIDJ4eC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vbiAyeHh4IHJlc3BvbnNlIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBFdmVudEJyaXRlIEFQSSwgd2l0aCBzdGF0dXMgJHtlcnJvci5yZXNwb25zZS5zdGF0dXN9LCBhbmQgcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShlcnJvci5yZXNwb25zZS5kYXRhKX1gO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaGFzRXJyb3JzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5yZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGJ1dCBubyByZXNwb25zZSB3YXMgcmVjZWl2ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIGBlcnJvci5yZXF1ZXN0YCBpcyBhbiBpbnN0YW5jZSBvZiBYTUxIdHRwUmVxdWVzdCBpbiB0aGUgYnJvd3NlciBhbmQgYW4gaW5zdGFuY2Ugb2ZcbiAgICAgICAgICAgICAgICAgICAgICAgICAqICBodHRwLkNsaWVudFJlcXVlc3QgaW4gbm9kZS5qcy5cbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vIHJlc3BvbnNlIHJlY2VpdmVkIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBFdmVudEJyaXRlIEFQSSwgZm9yIHJlcXVlc3QgJHtlcnJvci5yZXF1ZXN0fWA7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBoYXNFcnJvcnMgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gU29tZXRoaW5nIGhhcHBlbmVkIGluIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgdGhhdCB0cmlnZ2VyZWQgYW4gRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgZm9yIHRoZSAke2VuZHBvaW50SW5mb30gRXZlbnRCcml0ZSBBUEksICR7KGVycm9yICYmIGVycm9yLm1lc3NhZ2UpICYmIGVycm9yLm1lc3NhZ2V9YDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGhhc0Vycm9ycyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gaWYgdGhlcmUgYXJlIG5vIGVycm9ycyBmcm9tIHRoZSBldmVudCBjYWxscywgYW5kIHRoZXJlIGFyZSBldmVudHMgdG8gYmUgcG9wdWxhdGVkIGluIHRoZSBlbmQgb2JqZWN0LCB0aGVuIHByb2NlZWQgd2l0aCBidWlsZGluZyB0aGF0IG9iamVjdCBhY2NvcmRpbmdseVxuICAgICAgICAgICAgaWYgKCFoYXNFcnJvcnMgJiYgZXZlbnRMaXN0Lmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgICAgIC8vIGFkZCB0aGUgZXZlbnQgbGlzdCBpbiB0aGUgZmluYWwgZXZlbnQgc2VyaWVzIG9iamVjdCB0byBiZSByZXR1cm5lZFxuICAgICAgICAgICAgICAgIHJlc3VsdC5ldmVudHMgPSBbLi4ucmVzdWx0LmV2ZW50cywgLi4uZXZlbnRMaXN0XTtcblxuICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgb2JqZWN0IGFjY29yZGluZ2x5XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogcmVzdWx0XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBTb21ldGhpbmcgaGFwcGVuZWQgaW4gc2V0dGluZyB1cCB0aGUgcmVxdWVzdCB0aGF0IHRyaWdnZXJlZCBhbiBFcnJvclxuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHJldHJpZXZpbmcgZXZlbnRzIGZvciBzZXJpZXMgJHtjcmVhdGVFdmVudFNlcmllc0lucHV0LmV4dGVybmFsU2VyaWVzSUR9IWA7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IEV2ZW50c0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGluaXRpYXRpbmcgdGhlIEV2ZW50QnJpdGUgRXZlbnRzIFNlcmllcyByZXRyaWV2YWwgY2FsbCB0aHJvdWdoICR7ZW5kcG9pbnRJbmZvfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7ZXJyfWApO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogRXZlbnRzRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==