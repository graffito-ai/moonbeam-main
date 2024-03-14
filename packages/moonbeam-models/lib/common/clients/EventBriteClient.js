"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBriteClient = void 0;
const BaseAPIClient_1 = require("./BaseAPIClient");
const GraphqlExports_1 = require("../GraphqlExports");
const Constants_1 = require("../Constants");
const axios_1 = __importDefault(require("axios"));
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
            let result = {
                createdAt: createEventSeriesInput.createdAt,
                title: "",
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
                    const createEventSeriesResponse = await axios_1.default.get(requestUrl, {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${eventBriteAuthToken}`
                        },
                        timeout: 15000,
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
                            }
                            else {
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
                                        const newEvent = {
                                            title: returnedEvent["name"]["text"],
                                            description: returnedEvent["summary"],
                                            eventLogoUrlBg: returnedEvent["logo"]["original"]["url"],
                                            eventLogoUrlSm: returnedEvent["logo"]["url"],
                                            externalEventID: returnedEvent["id"],
                                            id: (0, uuid_1.v4)(),
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
                                        };
                                        // add the newly created event in the list of events to be returned with the Event Series
                                        eventList.push(newEvent);
                                    }
                                }
                                else {
                                    // unexpected events series structure, return an error
                                    const errorMessage = `Unexpected structure received for Event from the EventsSeries call for series ${createEventSeriesInput.externalSeriesID}`;
                                    console.log(errorMessage);
                                    hasErrors = true;
                                    hasNext = false;
                                }
                            });
                        }
                        else {
                            // unexpected events series structure, return an error
                            const errorMessage = `Unexpected structure received from the EventsSeries call for series ${createEventSeriesInput.externalSeriesID}`;
                            console.log(errorMessage);
                            hasErrors = true;
                            hasNext = false;
                        }
                    }
                    else {
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
                }
                catch (error) {
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
                    }
                    else {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXZlbnRCcml0ZUNsaWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tb24vY2xpZW50cy9FdmVudEJyaXRlQ2xpZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLG1EQUE4QztBQUM5QyxzREFPMkI7QUFDM0IsNENBQXVDO0FBQ3ZDLGtEQUEwQjtBQUMxQiwrQkFBa0M7QUFFbEM7O0dBRUc7QUFDSCxNQUFhLGdCQUFpQixTQUFRLDZCQUFhO0lBRS9DOzs7OztPQUtHO0lBQ0gsWUFBWSxXQUFtQixFQUFFLE1BQWM7UUFDM0MsS0FBSyxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRUQ7Ozs7Ozs7OztPQVNHO0lBQ0gsS0FBSyxDQUFDLGdDQUFnQyxDQUFDLHNCQUE4QztRQUNqRiwrQ0FBK0M7UUFDL0MsTUFBTSxZQUFZLEdBQUcsNEJBQTRCLENBQUM7UUFFbEQsSUFBSTtZQUNBLHVIQUF1SDtZQUN2SCxNQUFNLENBQUMsaUJBQWlCLEVBQUUsbUJBQW1CLENBQUMsR0FBRyxNQUFNLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxxQkFBUyxDQUFDLGdCQUFnQixDQUFDLHNCQUFzQixDQUFDLENBQUM7WUFFM0ksNEVBQTRFO1lBQzVFLElBQUksaUJBQWlCLEtBQUssSUFBSSxJQUFJLGlCQUFpQixDQUFDLE1BQU0sS0FBSyxDQUFDO2dCQUM1RCxtQkFBbUIsS0FBSyxJQUFJLElBQUksbUJBQW1CLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDbEUsTUFBTSxZQUFZLEdBQUcsbURBQW1ELENBQUM7Z0JBQ3pFLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBRTFCLE9BQU87b0JBQ0gsWUFBWSxFQUFFLFlBQVk7b0JBQzFCLFNBQVMsRUFBRSxnQ0FBZSxDQUFDLGVBQWU7aUJBQzdDLENBQUM7YUFDTDtZQUVEOzs7ZUFHRztZQUNILElBQUksVUFBVSxH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T0FBTyxFQUFFLENBQUM7d0JBQzFKLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7d0JBRTFCLFNBQVMsR0FBRyxJQUFJLENBQUM7d0JBQ2pCLE9BQU8sR0FBRyxLQUFLLENBQUM7cUJBQ25CO2lCQUNKO2FBQ0o7WUFFRCxrR0FBa0c7WUFDbEcsSUFBSSxDQUFDLFNBQVMsRUFBRTtnQkFDWix1Q0FBdUM7Z0JBQ3ZDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQztnQkFFakQsZ0NBQWdDO2dCQUNoQyxPQUFPO29CQUNILElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQztpQkFDakIsQ0FBQTthQUNKO2lCQUFNO2dCQUNILHVFQUF1RTtnQkFDdkUsTUFBTSxZQUFZLEdBQUcsdURBQXVELHNCQUFzQixDQUFDLGdCQUFnQixHQUFHLENBQUM7Z0JBQ3ZILE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBRTFCLE9BQU87b0JBQ0gsWUFBWSxFQUFFLFlBQVk7b0JBQzFCLFNBQVMsRUFBRSxnQ0FBZSxDQUFDLGVBQWU7aUJBQzdDLENBQUM7YUFDTDtTQUNKO1FBQUMsT0FBTyxHQUFHLEVBQUU7WUFDVixNQUFNLFlBQVksR0FBRyx5RkFBeUYsWUFBWSxFQUFFLENBQUM7WUFDN0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFlBQVksSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBRXRDLE9BQU87Z0JBQ0gsWUFBWSxFQUFFLFlBQVk7Z0JBQzFCLFNBQVMsRUFBRSxnQ0FBZSxDQUFDLGVBQWU7YUFDN0MsQ0FBQztTQUNMO0lBQ0wsQ0FBQztDQUNKO0FBalFELDRDQWlRQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QmFzZUFQSUNsaWVudH0gZnJvbSBcIi4vQmFzZUFQSUNsaWVudFwiO1xuaW1wb3J0IHtcbiAgICBDcmVhdGVFdmVudFNlcmllc0lucHV0LFxuICAgIEV2ZW50LFxuICAgIEV2ZW50U2VyaWVzLFxuICAgIEV2ZW50U2VyaWVzUmVzcG9uc2UsXG4gICAgRXZlbnRTZXJpZXNTdGF0dXMsXG4gICAgRXZlbnRzRXJyb3JUeXBlXG59IGZyb20gXCIuLi9HcmFwaHFsRXhwb3J0c1wiO1xuaW1wb3J0IHtDb25zdGFudHN9IGZyb20gXCIuLi9Db25zdGFudHNcIjtcbmltcG9ydCBheGlvcyBmcm9tIFwiYXhpb3NcIjtcbmltcG9ydCB7djQgYXMgdXVpZHY0fSBmcm9tICd1dWlkJztcblxuLyoqXG4gKiBDbGFzcyB1c2VkIGFzIHRoZSBiYXNlL2dlbmVyaWMgY2xpZW50IGZvciBhbGwgRXZlbnRCcml0ZSBjYWxscy5cbiAqL1xuZXhwb3J0IGNsYXNzIEV2ZW50QnJpdGVDbGllbnQgZXh0ZW5kcyBCYXNlQVBJQ2xpZW50IHtcblxuICAgIC8qKlxuICAgICAqIEdlbmVyaWMgY29uc3RydWN0b3IgZm9yIHRoZSBjbGllbnQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZW52aXJvbm1lbnQgdGhlIEFXUyBlbnZpcm9ubWVudCBwYXNzZWQgaW4gZnJvbSB0aGUgTGFtYmRhIHJlc29sdmVyLlxuICAgICAqIEBwYXJhbSByZWdpb24gdGhlIEFXUyByZWdpb24gcGFzc2VkIGluIGZyb20gdGhlIExhbWJkYSByZXNvbHZlci5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlbnZpcm9ubWVudDogc3RyaW5nLCByZWdpb246IHN0cmluZykge1xuICAgICAgICBzdXBlcihyZWdpb24sIGVudmlyb25tZW50KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIGNyZWF0ZSBhIG5ldyBldmVudCBzZXJpZXMgZm9yIGEgcGFydGljdWxhciBvcmdhbml6YXRpb24sIGJ5IGV4dHJhY3RpbmdcbiAgICAgKiB0aGUgYXBwcm9wcmlhdGUgZXZlbnRzIGluZm9ybWF0aW9uIGZyb20gRXZlbnRCcml0ZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBjcmVhdGVFdmVudFNlcmllc0lucHV0IGlucHV0IHBhc3NlZCBpbiwgd2hpY2ggd2lsbCBiZSB1c2VkIGluIGNyZWF0aW5nIGEgbmV3IGV2ZW50IHNlcmllc1xuICAgICAqIGFuZCBpbXBsaWNpdGx5IGZpbGxpbmcgaW4gdGhlIGFwcHJvcHJpYXRlIG1pc3NpbmcgaW5mb3JtYXRpb24gdmlhIHRoZSBFdmVudEJyaXRlIEFQSSBjYWxsLlxuICAgICAqXG4gICAgICogQHJldHVybnMgYSB7QGxpbmsgRXZlbnRTZXJpZXNSZXNwb25zZX0sIHJlcHJlc2VudGluZyB0aGUgbmV3bHkgY3JlYXRlZCBldmVudCBzZXJpZXMgdG8gYmUgc3RvcmVkLFxuICAgICAqIG9idGFpbmVkIGZyb20gdGhlIEV2ZW50QnJpdGUgQVBJIGNhbGwsIGFsb25nc2lkZSB3aXRoIHRoZSBpbmZvcm1hdGlvbiBwYXNzZWQgaW4uXG4gICAgICovXG4gICAgYXN5bmMgY3JlYXRlRXZlbnRTZXJpZXNGb3JPcmdhbml6YXRpb24oY3JlYXRlRXZlbnRTZXJpZXNJbnB1dDogQ3JlYXRlRXZlbnRTZXJpZXNJbnB1dCk6IFByb21pc2U8RXZlbnRTZXJpZXNSZXNwb25zZT4ge1xuICAgICAgICAvLyBlYXNpbHkgaWRlbnRpZmlhYmxlIEFQSSBlbmRwb2ludCBpbmZvcm1hdGlvblxuICAgICAgICBjb25zdCBlbmRwb2ludEluZm8gPSAnR0VUIC9zZXJpZXMgRXZlbnRCcml0ZSBBUEknO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgQVBJIEtleSBhbmQgQmFzZSBVUkwsIG5lZWRlZCBpbiBvcmRlciB0byBtYWtlIHRoZSBQT1NUIHNlbmQgbW9iaWxlIHB1c2ggbm90aWZpY2F0aW9uIHRocm91Z2ggdGhlIGNsaWVudFxuICAgICAgICAgICAgY29uc3QgW2V2ZW50QnJpdGVCYXNlVXJsLCBldmVudEJyaXRlQXV0aFRva2VuXSA9IGF3YWl0IHN1cGVyLnJldHJpZXZlU2VydmljZUNyZWRlbnRpYWxzKENvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLkVWRU5UQlJJVEVfU0VDUkVUX05BTUUpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgd2Ugb2J0YWluZWQgYW55IGludmFsaWQgc2VjcmV0IHZhbHVlcyBmcm9tIHRoZSBjYWxsIGFib3ZlXG4gICAgICAgICAgICBpZiAoZXZlbnRCcml0ZUJhc2VVcmwgPT09IG51bGwgfHwgZXZlbnRCcml0ZUJhc2VVcmwubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgZXZlbnRCcml0ZUF1dGhUb2tlbiA9PT0gbnVsbCB8fCBldmVudEJyaXRlQXV0aFRva2VuLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IFwiSW52YWxpZCBTZWNyZXRzIG9idGFpbmVkIGZvciBFdmVudEJyaXRlIEFQSSBjYWxsIVwiO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBFdmVudHNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBiYXNlZCBvbiB0aGUgT3JnYW5pemF0aW9uIG5hbWUgYW5kIEV2ZW50IFNlcmllcyBJRCBwYXNzZWQgaW4sIGF1dG8tZGV0ZWN0IGlmIHRoZXJlIGFyZSBtb3JlIHRoYW4gMSBwYWdlcyB3aXRoIGV2ZW50cyB0byBiZSByZXR1cm5lZFxuICAgICAgICAgICAgICogZm9yIHRoaXMgcGFydGljdWxhciBzZXJpZXMsIGFuZCBpZiBzbywgY2FsbCB0aGUgRXZlbnRCcml0ZSBBUEkgYWNjb3JkaW5nbHksIGluIG9yZGVyIHRvIHJldHJpZXZlIGFuZCB1c2UgZWFjaCBFdmVudCBwYWdlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBsZXQgcGFnZU51bWJlciA9IDE7IC8vIHN0YXJ0aW5nIGF0IHBhZ2UgMVxuICAgICAgICAgICAgbGV0IGhhc05leHQ6IGJvb2xlYW4gPSB0cnVlOyAvLyBmbGFnIHRvIGRyaXZlIHRoZSBwYWdpbmF0aW9uIGNhbGxzXG4gICAgICAgICAgICBsZXQgY29udGludWF0aW9uVG9rZW46IHN0cmluZyA9IFwiXCI7IC8vIHRva2VuIHRvIGJlIHVzZWQgaW4gY2FzZSB3ZSBnZXQgYSBjb250aW51YXRpb24gdG9rZW4gcmV0dXJuZWQgZm9yIHBhZ2luYXRpb24gcHVycG9zZXNcbiAgICAgICAgICAgIGxldCBoYXNFcnJvcnM6IGJvb2xlYW4gPSBmYWxzZTsgLy8gZmxhZyB0byBoaWdobGlnaHQgd2hldGhlciBhbnkgb2YgdGhlIGV2ZW50cyBjYWxscyBpbiB0aGlzIHNlcmllcyBoYXZlIGhhZCBlcnJvcnMgd2hpbGUgYmVpbmcgY2FsbGVkXG4gICAgICAgICAgICBjb25zdCBldmVudExpc3Q6IEV2ZW50W10gPSBbXTsgLy8gbGlzdCBvZiBFdmVudHMgZm9yIHNlcmllc1xuICAgICAgICAgICAgLy8gcmVzdWx0IHRvIGJlIHJldHVybmVkXG4gICAgICAgICAgICBsZXQgcmVzdWx0OiBFdmVudFNlcmllcyA9IHtcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IGNyZWF0ZUV2ZW50U2VyaWVzSW5wdXQuY3JlYXRlZEF0ISxcbiAgICAgICAgICAgICAgICB0aXRsZTogXCJcIixcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJcIixcbiAgICAgICAgICAgICAgICBldmVudHM6IFtdLFxuICAgICAgICAgICAgICAgIGV4dGVybmFsT3JnSUQ6IFwiXCIsXG4gICAgICAgICAgICAgICAgZXh0ZXJuYWxTZXJpZXNJRDogY3JlYXRlRXZlbnRTZXJpZXNJbnB1dC5leHRlcm5hbFNlcmllc0lEISxcbiAgICAgICAgICAgICAgICBpZDogdXVpZHY0KCksXG4gICAgICAgICAgICAgICAgbmFtZTogY3JlYXRlRXZlbnRTZXJpZXNJbnB1dC5uYW1lLFxuICAgICAgICAgICAgICAgIHNlcmllc0xvZ29VcmxCZzogXCJcIixcbiAgICAgICAgICAgICAgICBzZXJpZXNMb2dvVXJsU206IFwiXCIsXG4gICAgICAgICAgICAgICAgc3RhdHVzOiBFdmVudFNlcmllc1N0YXR1cy5BY3RpdmUsXG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0OiBjcmVhdGVFdmVudFNlcmllc0lucHV0LnVwZGF0ZWRBdCFcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHdoaWxlIChoYXNOZXh0ICYmICFoYXNFcnJvcnMpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgRXhlY3V0aW5nIEV2ZW50IGNhbGxzIGZvciBFdmVudCBTZXJpZXMgSUQgJHtjcmVhdGVFdmVudFNlcmllc0lucHV0LmV4dGVybmFsU2VyaWVzSUR9LCBmb3IgcGFnZSAke3BhZ2VOdW1iZXJ9YCk7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBQT1NUIC9zZXJpZXMve2V2ZW50U2VyaWVzSUR9L2V2ZW50cz90aW1lX2ZpbHRlcj1jdXJyZW50X2Z1dHVyZSZwYWdlPXtwYWdlTnVtYmVyfSZwYWdlX3NpemU9e3BhZ2VTaXplfSZvcmRlcl9ieT17b3JkZXJCeX1cbiAgICAgICAgICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly93d3cuZXZlbnRicml0ZS5jb20vcGxhdGZvcm0vYXBpIy9yZWZlcmVuY2UvZXZlbnQvdXBkYXRlL2xpc3QtZXZlbnRzLWJ5LXNlcmllc1xuICAgICAgICAgICAgICAgICAgICAgKlxuICAgICAgICAgICAgICAgICAgICAgKiBidWlsZCB0aGUgRXZlbnRCcml0ZSBBUEkgcmVxdWVzdCBib2R5IHRvIGJlIHBhc3NlZCBpbiwgYW5kIHBlcmZvcm0gYSBHRVQgdG8gaXQgd2l0aCB0aGUgYXBwcm9wcmlhdGUgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICogd2UgaW1wbHkgdGhhdCBpZiB0aGUgQVBJIGRvZXMgbm90IHJlc3BvbmQgaW4gMTUgc2Vjb25kcywgdGhlbiB3ZSBhdXRvbWF0aWNhbGx5IGNhdGNoIHRoYXQsIGFuZCByZXR1cm4gYW5cbiAgICAgICAgICAgICAgICAgICAgICogZXJyb3IgZm9yIGEgYmV0dGVyIGN1c3RvbWVyIGV4cGVyaWVuY2UuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXF1ZXN0VXJsID0gY29udGludWF0aW9uVG9rZW4gIT09IFwiXCJcbiAgICAgICAgICAgICAgICAgICAgICAgID8gYCR7ZXZlbnRCcml0ZUJhc2VVcmx9L3Nlcmllcy8ke2NyZWF0ZUV2ZW50U2VyaWVzSW5wdXQuZXh0ZXJuYWxTZXJpZXNJRH0vZXZlbnRzP3RpbWVfZmlsdGVyPWN1cnJlbnRfZnV0dXJlJnBhZ2U9JHtwYWdlTnVtYmVyfSZwYWdlX3NpemU9MjAwJm9yZGVyX2J5PXN0YXJ0X2FzYyZjb250aW51YXRpb249JHtjb250aW51YXRpb25Ub2tlbn1gXG4gICAgICAgICAgICAgICAgICAgICAgICA6IGAke2V2ZW50QnJpdGVCYXNlVXJsfS9zZXJpZXMvJHtjcmVhdGVFdmVudFNlcmllc0lucHV0LmV4dGVybmFsU2VyaWVzSUR9L2V2ZW50cz90aW1lX2ZpbHRlcj1jdXJyZW50X2Z1dHVyZSZwYWdlPSR7cGFnZU51bWJlcn0mcGFnZV9zaXplPTIwMCZvcmRlcl9ieT1zdGFydF9hc2NgO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjcmVhdGVFdmVudFNlcmllc1Jlc3BvbnNlID0gYXdhaXQgYXhpb3MuZ2V0KHJlcXVlc3RVcmwsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkF1dGhvcml6YXRpb25cIjogYEJlYXJlciAke2V2ZW50QnJpdGVBdXRoVG9rZW59YFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDE1MDAwLCAvLyBpbiBtaWxsaXNlY29uZHMgaGVyZVxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZTogJ0V2ZW50QnJpdGUgQVBJIHRpbWVkIG91dCBhZnRlciAxNTAwMG1zISdcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gY2hlY2sgaWYgdGhpcyBjYWxsIHdhcyBzdWNjZXNzZnVsIG9yIG5vdFxuICAgICAgICAgICAgICAgICAgICBpZiAoY3JlYXRlRXZlbnRTZXJpZXNSZXNwb25zZS5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBpZiB3ZSByZWFjaGVkIHRoaXMsIHRoZW4gd2UgYXNzdW1lIHRoYXQgYSAyeHggcmVzcG9uc2UgY29kZSB3YXMgcmV0dXJuZWQuXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBjaGVjayB0aGUgY29udGVudHMgb2YgdGhlIHJlc3BvbnNlLCBhbmQgYWN0IGFwcHJvcHJpYXRlbHkuXG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjcmVhdGVFdmVudFNlcmllc1Jlc3BvbnNlLmRhdGEgJiYgY3JlYXRlRXZlbnRTZXJpZXNSZXNwb25zZS5kYXRhW1wicGFnaW5hdGlvblwiXSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlRXZlbnRTZXJpZXNSZXNwb25zZS5kYXRhW1wicGFnaW5hdGlvblwiXVtcInBhZ2VfbnVtYmVyXCJdICE9PSB1bmRlZmluZWQgJiYgY3JlYXRlRXZlbnRTZXJpZXNSZXNwb25zZS5kYXRhW1wicGFnaW5hdGlvblwiXVtcInBhZ2VfbnVtYmVyXCJdID09PSBwYWdlTnVtYmVyICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlRXZlbnRTZXJpZXNSZXNwb25zZS5kYXRhW1wicGFnaW5hdGlvblwiXVtcInBhZ2VfY291bnRcIl0gIT09IHVuZGVmaW5lZCAmJiBjcmVhdGVFdmVudFNlcmllc1Jlc3BvbnNlLmRhdGFbXCJwYWdpbmF0aW9uXCJdW1wiaGFzX21vcmVfaXRlbXNcIl0gIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZUV2ZW50U2VyaWVzUmVzcG9uc2UuZGF0YVtcImV2ZW50c1wiXSAhPT0gdW5kZWZpbmVkICYmIGNyZWF0ZUV2ZW50U2VyaWVzUmVzcG9uc2UuZGF0YVtcImV2ZW50c1wiXS5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzZWUgaWYgd2UgbmVlZCBtb3JlIHRoYW4gb25lIGNhbGwsIGZvciBwYWdpbmF0aW9uIHB1cnBvc2VzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKChjcmVhdGVFdmVudFNlcmllc1Jlc3BvbnNlLmRhdGFbXCJwYWdpbmF0aW9uXCJdW1wicGFnZV9jb3VudFwiXSAhPT0gMSB8fCBjcmVhdGVFdmVudFNlcmllc1Jlc3BvbnNlLmRhdGFbXCJwYWdpbmF0aW9uXCJdW1wiaGFzX21vcmVfaXRlbXNcIl0gPT0gdHJ1ZSkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlRXZlbnRTZXJpZXNSZXNwb25zZS5kYXRhW1wicGFnaW5hdGlvblwiXVtcImNvbnRpbnVhdGlvblwiXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc05leHQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51YXRpb25Ub2tlbiA9IGNyZWF0ZUV2ZW50U2VyaWVzUmVzcG9uc2UuZGF0YVtcInBhZ2luYXRpb25cIl1bXCJjb250aW51YXRpb25cIl07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2VOdW1iZXIgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNOZXh0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVhdGlvblRva2VuID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBsb29wIHRocm91Z2ggZWFjaCBldmVudCBpbiB0aGUgbGlzdCBvZiBldmVudHMgdG8gYmUgcmV0dXJuZWQsIGFuZCBtYWtlIHN1cmUgdGhhdCB3ZSBjYW4gYnVpbGQgb3VyIGludGVybmFsIGV2ZW50cyBzdHJ1Y3R1cmUgYWNjb3JkaW5nbHlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAhaGFzRXJyb3JzICYmIGNyZWF0ZUV2ZW50U2VyaWVzUmVzcG9uc2UuZGF0YVtcImV2ZW50c1wiXS5mb3JFYWNoKHJldHVybmVkRXZlbnQgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjaGVjayBmb3IgYSB2YWxpZCBpbmNvbWluZyBldmVudCBzdHJ1Y3R1cmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJldHVybmVkRXZlbnQgIT09IHVuZGVmaW5lZCAmJiByZXR1cm5lZEV2ZW50ICE9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5lZEV2ZW50W1wibmFtZVwiXSAhPT0gdW5kZWZpbmVkICYmIHJldHVybmVkRXZlbnRbXCJuYW1lXCJdW1widGV4dFwiXSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5lZEV2ZW50W1wiZGVzY3JpcHRpb25cIl0gIT09IHVuZGVmaW5lZCAmJiByZXR1cm5lZEV2ZW50W1wiZGVzY3JpcHRpb25cIl1bXCJ0ZXh0XCJdICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybmVkRXZlbnRbXCJzdGFydFwiXSAhPT0gdW5kZWZpbmVkICYmIHJldHVybmVkRXZlbnRbXCJzdGFydFwiXVtcInRpbWV6b25lXCJdICE9PSB1bmRlZmluZWQgJiYgcmV0dXJuZWRFdmVudFtcInN0YXJ0XCJdW1wibG9jYWxcIl0gIT09IHVuZGVmaW5lZCAmJiByZXR1cm5lZEV2ZW50W1wic3RhcnRcIl1bXCJ1dGNcIl0gIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuZWRFdmVudFtcImVuZFwiXSAhPT0gdW5kZWZpbmVkICYmIHJldHVybmVkRXZlbnRbXCJlbmRcIl1bXCJ0aW1lem9uZVwiXSAhPT0gdW5kZWZpbmVkICYmIHJldHVybmVkRXZlbnRbXCJlbmRcIl1bXCJsb2NhbFwiXSAhPT0gdW5kZWZpbmVkICYmIHJldHVybmVkRXZlbnRbXCJlbmRcIl1bXCJ1dGNcIl0gIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuZWRFdmVudFtcIm9yZ2FuaXphdGlvbl9pZFwiXSAhPT0gdW5kZWZpbmVkICYmIHJldHVybmVkRXZlbnRbXCJpZFwiXSAhPT0gdW5kZWZpbmVkICYmIHJldHVybmVkRXZlbnRbXCJzdGF0dXNcIl0gIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuZWRFdmVudFtcInN1bW1hcnlcIl0gIT09IHVuZGVmaW5lZCAmJiByZXR1cm5lZEV2ZW50W1widXJsXCJdICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybmVkRXZlbnRbXCJsb2dvXCJdICE9PSB1bmRlZmluZWQgJiYgcmV0dXJuZWRFdmVudFtcImxvZ29cIl1bXCJvcmlnaW5hbFwiXSAhPT0gdW5kZWZpbmVkICYmIHJldHVybmVkRXZlbnRbXCJsb2dvXCJdW1wib3JpZ2luYWxcIl1bXCJ1cmxcIl0gIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuZWRFdmVudFtcImxvZ29cIl1bXCJ1cmxcIl0gIT09IHVuZGVmaW5lZCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhZGQgYW55IG1pc3NpbmcgRXZlbnQgU2VyaWVzIG9iamVjdCBwcm9wZXJ0aWVzLCBpZiBuZWVkZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC50aXRsZSA9IHJlc3VsdC50aXRsZSAhPT0gXCJcIiA/IHJlc3VsdC50aXRsZSA6IHJldHVybmVkRXZlbnRbXCJuYW1lXCJdW1widGV4dFwiXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5kZXNjcmlwdGlvbiA9IHJlc3VsdC5kZXNjcmlwdGlvbiAhPT0gXCJcIiA/IHJlc3VsdC5kZXNjcmlwdGlvbiA6IHJldHVybmVkRXZlbnRbXCJkZXNjcmlwdGlvblwiXVtcInRleHRcIl07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQuZXh0ZXJuYWxPcmdJRCA9IHJlc3VsdC5leHRlcm5hbE9yZ0lEICE9PSBcIlwiID8gcmVzdWx0LmV4dGVybmFsT3JnSUQgOiByZXR1cm5lZEV2ZW50W1wib3JnYW5pemF0aW9uX2lkXCJdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnNlcmllc0xvZ29VcmxCZyA9IHJlc3VsdC5zZXJpZXNMb2dvVXJsQmcgIT09IFwiXCIgPyByZXN1bHQuc2VyaWVzTG9nb1VybEJnIDogcmV0dXJuZWRFdmVudFtcImxvZ29cIl1bXCJvcmlnaW5hbFwiXVtcInVybFwiXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5zZXJpZXNMb2dvVXJsU20gPSByZXN1bHQuc2VyaWVzTG9nb1VybFNtICE9PSBcIlwiID8gcmVzdWx0LnNlcmllc0xvZ29VcmxTbSA6IHJldHVybmVkRXZlbnRbXCJsb2dvXCJdW1widXJsXCJdO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBidWlsZCB0aGUgbmV3IEV2ZW50IG9iamVjdCB0byBiZSBhZGRlZCBpbiB0aGUgc2VyaWVzIChvbmx5IGZvciBsaXZlIGV2ZW50cylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXR1cm5lZEV2ZW50W1wic3RhdHVzXCJdID09PSBcImxpdmVcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld0V2ZW50OiBFdmVudCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IHJldHVybmVkRXZlbnRbXCJuYW1lXCJdW1widGV4dFwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHJldHVybmVkRXZlbnRbXCJzdW1tYXJ5XCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudExvZ29VcmxCZzogcmV0dXJuZWRFdmVudFtcImxvZ29cIl1bXCJvcmlnaW5hbFwiXVtcInVybFwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRMb2dvVXJsU206IHJldHVybmVkRXZlbnRbXCJsb2dvXCJdW1widXJsXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlcm5hbEV2ZW50SUQ6IHJldHVybmVkRXZlbnRbXCJpZFwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHV1aWR2NCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWdpc3RyYXRpb25Vcmw6IHJldHVybmVkRXZlbnRbXCJ1cmxcIl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0VGltZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZXpvbmU6IHJldHVybmVkRXZlbnRbXCJzdGFydFwiXVtcInRpbWV6b25lXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRzQXRMb2NhbDogbmV3IERhdGUocmV0dXJuZWRFdmVudFtcInN0YXJ0XCJdW1wibG9jYWxcIl0pLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFydHNBdFVUQzogbmV3IERhdGUocmV0dXJuZWRFdmVudFtcInN0YXJ0XCJdW1widXRjXCJdKS50b0lTT1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuZFRpbWU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWV6b25lOiByZXR1cm5lZEV2ZW50W1wiZW5kXCJdW1widGltZXpvbmVcIl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmRzQXRMb2NhbDogbmV3IERhdGUocmV0dXJuZWRFdmVudFtcImVuZFwiXVtcImxvY2FsXCJdKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5kc0F0VVRDOiBuZXcgRGF0ZShyZXR1cm5lZEV2ZW50W1wiZW5kXCJdW1widXRjXCJdKS50b0lTT1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWRkIHRoZSBuZXdseSBjcmVhdGVkIGV2ZW50IGluIHRoZSBsaXN0IG9mIGV2ZW50cyB0byBiZSByZXR1cm5lZCB3aXRoIHRoZSBFdmVudCBTZXJpZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudExpc3QucHVzaChuZXdFdmVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB1bmV4cGVjdGVkIGV2ZW50cyBzZXJpZXMgc3RydWN0dXJlLCByZXR1cm4gYW4gZXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIHN0cnVjdHVyZSByZWNlaXZlZCBmb3IgRXZlbnQgZnJvbSB0aGUgRXZlbnRzU2VyaWVzIGNhbGwgZm9yIHNlcmllcyAke2NyZWF0ZUV2ZW50U2VyaWVzSW5wdXQuZXh0ZXJuYWxTZXJpZXNJRH1gO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzRXJyb3JzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc05leHQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB1bmV4cGVjdGVkIGV2ZW50cyBzZXJpZXMgc3RydWN0dXJlLCByZXR1cm4gYW4gZXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBzdHJ1Y3R1cmUgcmVjZWl2ZWQgZnJvbSB0aGUgRXZlbnRzU2VyaWVzIGNhbGwgZm9yIHNlcmllcyAke2NyZWF0ZUV2ZW50U2VyaWVzSW5wdXQuZXh0ZXJuYWxTZXJpZXNJRH1gO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNFcnJvcnMgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc05leHQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYW5kIHRoZSBzZXJ2ZXIgcmVzcG9uZGVkIHdpdGggYSBzdGF0dXMgY29kZVxuICAgICAgICAgICAgICAgICAgICAgICAgICogdGhhdCBmYWxscyBvdXQgb2YgdGhlIHJhbmdlIG9mIDJ4eC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vbiAyeHh4IHJlc3BvbnNlIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBFdmVudEJyaXRlIEFQSSwgd2l0aCBzdGF0dXMgJHtjcmVhdGVFdmVudFNlcmllc1Jlc3BvbnNlLnN0YXR1c30sIGFuZCByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGNyZWF0ZUV2ZW50U2VyaWVzUmVzcG9uc2UuZGF0YSl9YDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIHdlIGdldCBhIDQwNCwgZm9yIEV2ZW50QnJpdGUgdGhpcyBtZWFucyB0aGF0IGFuIEV2ZW50IHNhbGUgaXMgYWJvdXQgdG8gY2xvc2UsIHdoaWNoIGlzIG5vdCBhbiBlcnJvciBpbiBpdHNlbGZcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjcmVhdGVFdmVudFNlcmllc1Jlc3BvbnNlLnN0YXR1cyAhPT0gNDA0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzRXJyb3JzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGhhc05leHQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycm9yLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGFuZCB0aGUgc2VydmVyIHJlc3BvbmRlZCB3aXRoIGEgc3RhdHVzIGNvZGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIHRoYXQgZmFsbHMgb3V0IG9mIHRoZSByYW5nZSBvZiAyeHguXG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm9uIDJ4eHggcmVzcG9uc2Ugd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IEV2ZW50QnJpdGUgQVBJLCB3aXRoIHN0YXR1cyAke2Vycm9yLnJlc3BvbnNlLnN0YXR1c30sIGFuZCByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGVycm9yLnJlc3BvbnNlLmRhdGEpfWA7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiB3ZSBnZXQgYSA0MDQsIGZvciBFdmVudEJyaXRlIHRoaXMgbWVhbnMgdGhhdCBhbiBFdmVudCBzYWxlIGlzIGFib3V0IHRvIGNsb3NlLCB3aGljaCBpcyBub3QgYW4gZXJyb3IgaW4gaXRzZWxmXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyb3IucmVzcG9uc2Uuc3RhdHVzICE9PSA0MDQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNFcnJvcnMgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaGFzTmV4dCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoZXJyb3IucmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBidXQgbm8gcmVzcG9uc2Ugd2FzIHJlY2VpdmVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBgZXJyb3IucmVxdWVzdGAgaXMgYW4gaW5zdGFuY2Ugb2YgWE1MSHR0cFJlcXVlc3QgaW4gdGhlIGJyb3dzZXIgYW5kIGFuIGluc3RhbmNlIG9mXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiAgaHR0cC5DbGllbnRSZXF1ZXN0IGluIG5vZGUuanMuXG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm8gcmVzcG9uc2UgcmVjZWl2ZWQgd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IEV2ZW50QnJpdGUgQVBJLCBmb3IgcmVxdWVzdCAke2Vycm9yLnJlcXVlc3R9YDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGhhc0Vycm9ycyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBoYXNOZXh0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBTb21ldGhpbmcgaGFwcGVuZWQgaW4gc2V0dGluZyB1cCB0aGUgcmVxdWVzdCB0aGF0IHRyaWdnZXJlZCBhbiBFcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgc2V0dGluZyB1cCB0aGUgcmVxdWVzdCBmb3IgdGhlICR7ZW5kcG9pbnRJbmZvfSBFdmVudEJyaXRlIEFQSSwgJHsoZXJyb3IgJiYgZXJyb3IubWVzc2FnZSkgJiYgZXJyb3IubWVzc2FnZX1gO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaGFzRXJyb3JzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhc05leHQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gaWYgdGhlcmUgYXJlIG5vIGVycm9ycyBmcm9tIHRoZSBldmVudCBjYWxscywgdGhlbiBwcm9jZWVkIHdpdGggYnVpbGRpbmcgdGhhdCBvYmplY3QgYWNjb3JkaW5nbHlcbiAgICAgICAgICAgIGlmICghaGFzRXJyb3JzKSB7XG4gICAgICAgICAgICAgICAgLy8gYWRkIHRoZSBldmVudHMgdG8gdGhlIGxpc3Qgb2YgZXZlbnRzXG4gICAgICAgICAgICAgICAgcmVzdWx0LmV2ZW50cyA9IFsuLi5yZXN1bHQuZXZlbnRzLCAuLi5ldmVudExpc3RdO1xuXG4gICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBvYmplY3QgYWNjb3JkaW5nbHlcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiBbcmVzdWx0XVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gU29tZXRoaW5nIGhhcHBlbmVkIGluIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgdGhhdCB0cmlnZ2VyZWQgYW4gRXJyb3JcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSByZXRyaWV2aW5nIGV2ZW50cyBmb3Igc2VyaWVzICR7Y3JlYXRlRXZlbnRTZXJpZXNJbnB1dC5leHRlcm5hbFNlcmllc0lEfSFgO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBFdmVudHNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBpbml0aWF0aW5nIHRoZSBFdmVudEJyaXRlIEV2ZW50cyBTZXJpZXMgcmV0cmlldmFsIGNhbGwgdGhyb3VnaCAke2VuZHBvaW50SW5mb31gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfSAke2Vycn1gKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IEV2ZW50c0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=