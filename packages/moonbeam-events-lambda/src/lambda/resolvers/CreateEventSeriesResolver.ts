import {
    CreateEventSeriesInput,
    EventBriteClient, EventSeries,
    EventSeriesResponse,
    EventsErrorType
} from "@moonbeam/moonbeam-models";
import {DynamoDBClient, GetItemCommand, PutItemCommand} from "@aws-sdk/client-dynamodb";
import {EventSeriesByOrganization} from "@moonbeam/moonbeam-models";

/**
 * CreateEventSeries resolver
 *
 * @param createEventSeriesInput the input needed to create a new event series
 * @param fieldName name of the resolver path from the AppSync event
 * @returns {@link Promise} of {@link EventSeriesResponse}
 */
export const createEventSeries = async (fieldName: string, createEventSeriesInput: CreateEventSeriesInput): Promise<EventSeriesResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the DynamoDB document client
        const dynamoDbClient = new DynamoDBClient({region: region});

        // update the timestamps accordingly and the id of the potentially newly created Event Series
        const createdAt = new Date().toISOString();
        createEventSeriesInput.createdAt = createEventSeriesInput.createdAt ? createEventSeriesInput.createdAt : createdAt;
        createEventSeriesInput.updatedAt = createEventSeriesInput.updatedAt ? createEventSeriesInput.updatedAt : createdAt;

        // go through the list of Series IDs for a particular named organization passed in
        if (EventSeriesByOrganization.has(createEventSeriesInput.name)) {
            // result to be returned in the form of all Event Series for a particular Organization/Partner
            const result: EventSeries[] = [];

            // constants to keep track of errors
            let hasErrors: boolean = false;

            // for each Series ID for the identified organization, part of the internal list that we have, execute the process below
            const seriesIds: string[] = EventSeriesByOrganization.get(createEventSeriesInput.name)!;
            for (const seriesId of seriesIds) {
                // set the external series id accordingly
                createEventSeriesInput.externalSeriesID = seriesId;

                /**
                 * check to see if the Event Service already exists in the DB.
                 */
                const preExistingEventSeries = await dynamoDbClient.send(new GetItemCommand({
                    TableName: process.env.EVENT_SERIES_TABLE!,
                    Key: {
                        name: {
                            S: createEventSeriesInput.name
                        },
                        externalSeriesID: {
                            S: createEventSeriesInput.externalSeriesID
                        }
                    },
                    /**
                     * we're not interested in getting all the data for this call, just the minimum for us to determine whether this is a duplicate or not
                     *
                     * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html
                     * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ExpressionAttributeNames.html
                     */
                    ProjectionExpression: '#name, #extSId',
                    ExpressionAttributeNames: {
                        '#name': 'name',
                        '#extSId': 'externalSeriesID'
                    }
                }));

                // if there is an item retrieved, then we return an error
                if (preExistingEventSeries && preExistingEventSeries.Item) {
                    /**
                     * if there is a pre-existing Event Series partner with the same name and external series ID as the one inputted,
                     * then we cannot duplicate that, so we will return an error.
                     */
                    const errorMessage = `Duplicate Event Series found!`;
                    console.log(errorMessage);

                    hasErrors = true;
                } else {
                    // initialize the EventBrite client used for making appropriate API calls
                    const eventBriteClient = new EventBriteClient(process.env.ENV_NAME!, region);

                    // retrieve events for the Event Series via an EventBrite API Call
                    const eventSeriesCreationResponse: EventSeriesResponse = await eventBriteClient.createEventSeriesForOrganization(createEventSeriesInput);

                    // make sure that the Event Series EventBrite events retrieval call was successful
                    if ((eventSeriesCreationResponse.errorMessage === undefined || eventSeriesCreationResponse.errorMessage === null) &&
                        (eventSeriesCreationResponse.errorType === undefined || eventSeriesCreationResponse.errorType === null) &&
                        eventSeriesCreationResponse.data !== undefined && eventSeriesCreationResponse.data!.length === 1 &&
                        eventSeriesCreationResponse.data![0] !== undefined && eventSeriesCreationResponse.data![0] !== null &&
                        eventSeriesCreationResponse.data![0]!.events !== undefined && eventSeriesCreationResponse.data![0]!.events.length !== 0) {
                        // create the events array, obtained from the EventBrite call
                        const eventsList: any[] = [];
                        eventSeriesCreationResponse.data![0]!.events.forEach(event => {
                            if (event !== null) {
                                eventsList.push({
                                    M: {
                                        id: {
                                            S: event.id
                                        },
                                        externalEventID: {
                                            S: event.externalEventID
                                        },
                                        title: {
                                            S: event.title
                                        },
                                        description: {
                                            S: event.description
                                        },
                                        registrationUrl: {
                                            S: event.registrationUrl
                                        },
                                        eventLogoUrlBg: {
                                            S: event.eventLogoUrlBg
                                        },
                                        eventLogoUrlSm: {
                                            S: event.eventLogoUrlSm
                                        },
                                        startTime: {
                                            M: {
                                                startsAtLocal: {
                                                    S: event.startTime.startsAtLocal
                                                },
                                                startsAtUTC: {
                                                    S: event.startTime.startsAtUTC
                                                },
                                                timezone: {
                                                    S: event.startTime.timezone
                                                },
                                            }
                                        },
                                        endTime: {
                                            M: {
                                                endsAtLocal: {
                                                    S: event.endTime.startsAtLocal
                                                },
                                                startsAtUTC: {
                                                    S: event.endTime.startsAtUTC
                                                },
                                                timezone: {
                                                    S: event.endTime.timezone
                                                },
                                            }
                                        }
                                    }
                                });
                            }
                        });

                        // store the Event Series object
                        await dynamoDbClient.send(new PutItemCommand({
                            TableName: process.env.EVENT_SERIES_TABLE!,
                            Item: {
                                name: {
                                    S: createEventSeriesInput.name
                                },
                                id: {
                                    S: eventSeriesCreationResponse.data![0]!.id
                                },
                                externalOrgID: {
                                    S: eventSeriesCreationResponse.data![0]!.externalOrgID
                                },
                                externalSeriesID: {
                                    S: createEventSeriesInput.externalSeriesID
                                },
                                title: {
                                    S: eventSeriesCreationResponse.data![0]!.title
                                },
                                description: {
                                    S: eventSeriesCreationResponse.data![0]!.description
                                },
                                status: {
                                    S: eventSeriesCreationResponse.data![0]!.status
                                },
                                createdAt: {
                                    S: createEventSeriesInput.createdAt!
                                },
                                updatedAt: {
                                    S: createEventSeriesInput.updatedAt!
                                },
                                seriesLogoUrlBg: {
                                    S: eventSeriesCreationResponse.data![0]!.seriesLogoUrlBg
                                },
                                seriesLogoUrlSm: {
                                    S: eventSeriesCreationResponse.data![0]!.seriesLogoUrlSm
                                },
                                events: {
                                    L: eventsList
                                }
                            }
                        }));

                        // push the Events Series response in the list of Events Series to be returned
                        result.push(eventSeriesCreationResponse.data![0]!);
                    } else {
                        const errorMessage = `Unexpected error while retrieving Events for Events Series ${createEventSeriesInput.name} ${createEventSeriesInput.externalSeriesID}`;
                        console.log(errorMessage);

                        // if there are no events in the event series, then do not store it
                        hasErrors = !(eventSeriesCreationResponse.data !== undefined && eventSeriesCreationResponse.data!.length === 1 &&
                            eventSeriesCreationResponse.data![0] !== undefined && eventSeriesCreationResponse.data![0] !== null &&
                            eventSeriesCreationResponse.data![0]!.events !== undefined && eventSeriesCreationResponse.data![0]!.events.length === 0);
                    }
                }
            }

            // ensure that we only return if there are no errors
            if (!hasErrors) {
                // return the Events Series object
                return {
                    data: result
                }
            } else {
                const errorMessage = `Unexpected errors while retrieving Event Series for Organization ${createEventSeriesInput.name}`;
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: EventsErrorType.UnexpectedError
                }
            }
        } else {
            const errorMessage = `No Event Series IDs found for passed in Organization ${createEventSeriesInput.name}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: EventsErrorType.NoneOrAbsent
            }
        }
    } catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: EventsErrorType.UnexpectedError
        }
    }
}
