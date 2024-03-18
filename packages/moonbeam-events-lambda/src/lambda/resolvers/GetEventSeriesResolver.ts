import {
    Event,
    EventSeries,
    EventSeriesResponse,
    EventSeriesStatus,
    EventsErrorType
} from "@moonbeam/moonbeam-models";
import {AttributeValue, DynamoDBClient, QueryCommand} from "@aws-sdk/client-dynamodb";

/**
 * GetEventSeries resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @returns {@link Promise} of {@link EventSeriesResponse}
 */
export const getEventSeries = async (fieldName: string): Promise<EventSeriesResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the DynamoDB document client
        const dynamoDbClient = new DynamoDBClient({region: region});

        /**
         * the data to be retrieved from the Query Command
         * the eligible user Items returned from the Query Command, all aggregated together
         * the last evaluated key, to help with the pagination of results
         */
        let result: Record<string, AttributeValue>[] = [];
        let exclusiveStartKey, retrievedData;

        do {
            /**
             * retrieve all event series, given the global secondary index allowing us to query all event series by their
             * createdAt date, only for those event series that are ACTIVE.
             *
             * Limit of 1 MB per paginated response data (in our case 50 items). An average size for an Item is about 15,753 bytes, which means that we won't
             * need to do pagination here, since we actually retrieve all event series in a looped format, and we account for paginated responses. Even if the item size
             * increases we loop the query command depending on the last evaluated key, so we're ok not to do pagination.
             *
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.Pagination.html}
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html}
             */
            retrievedData = await dynamoDbClient.send(new QueryCommand({
                TableName: process.env.EVENT_SERIES_TABLE!,
                IndexName: `${process.env.EVENT_SERIES_CREATE_TIME_GLOBAL_INDEX!}-${process.env.ENV_NAME!}-${region}`,
                ...(exclusiveStartKey && {ExclusiveStartKey: exclusiveStartKey}),
                Limit: 50, // 50 * 15,753 bytes = 787,650 bytes = 0.788 MB (leave a margin of error here up to 1 MB)
                ExpressionAttributeNames: {
                    '#stat': 'status',
                    '#cAt': 'createdAt'
                },
                ExpressionAttributeValues: {
                    ':stat': {
                        S: EventSeriesStatus.Active
                    },
                    ':start': {
                        S: new Date(new Date().setFullYear(1979)).toISOString()
                    },
                    ":end": {
                        S: new Date().toISOString()
                    }
                },
                KeyConditionExpression: '#stat = :stat AND #cAt BETWEEN :start AND :end'
            }));

            exclusiveStartKey = retrievedData.LastEvaluatedKey;
            result = result.concat(retrievedData.Items);
        } while (retrievedData && retrievedData.Count && retrievedData.Items &&
        retrievedData.Items.length && retrievedData.Count !== 0 &&
        retrievedData.Items.length !== 0 && retrievedData.LastEvaluatedKey);

        // if there are Event Series retrieved, then return all of them accordingly
        if (result && result.length !== 0) {
            // convert the Dynamo DB data from Dynamo DB JSON format to a Moonbeam Event Series data format
            const eventSeriesData: EventSeries[] = [];

            // build up the list of events to be returned for each event series
            result.forEach(eventSeriesResult => {
                const events: Event[] = [];
                eventSeriesResult.events.L && eventSeriesResult.events.L!.forEach(event => {
                    const newEvent: Event = {
                        id: event.M!.id.S!,
                        externalEventID: event.M!.externalEventID.S!,
                        title: event.M!.title.S!,
                        description: event.M!.description.S!,
                        registrationUrl: event.M!.registrationUrl.S!,
                        eventLogoUrlBg: event.M!.eventLogoUrlBg.S!,
                        eventLogoUrlSm: event.M!.eventLogoUrlSm.S!,
                        startTime: {
                            startsAtLocal: event.M!.startTime.M!.startsAtLocal.S!,
                            startsAtUTC: event.M!.startTime.M!.startsAtUTC.S!,
                            timezone: event.M!.startTime.M!.timezone.S!
                        },
                        endTime: {
                            endsAtLocal: event.M!.endTime.M!.endsAtLocal.S!,
                            endsAtUTC: event.M!.endTime.M!.endsAtUTC.S!,
                            timezone: event.M!.endTime.M!.timezone.S!
                        }
                    }
                    events.push(newEvent);
                })
                const eventSeries: EventSeries = {
                    name: eventSeriesResult.name.S!,
                    id: eventSeriesResult.id.S!,
                    externalOrgID: eventSeriesResult.externalOrgID.S!,
                    externalSeriesID: eventSeriesResult.externalSeriesID.S!,
                    title: eventSeriesResult.title.S!,
                    description: eventSeriesResult.description.S!,
                    status: eventSeriesResult.status.S! as EventSeriesStatus,
                    createdAt: eventSeriesResult.createdAt.S!,
                    updatedAt: eventSeriesResult.updatedAt.S!,
                    seriesLogoUrlBg: eventSeriesResult.seriesLogoUrlBg.S!,
                    seriesLogoUrlSm: eventSeriesResult.seriesLogoUrlSm.S!,
                    events: events,
                };
                eventSeriesData.push(eventSeries);
            });
            // return the list of event series
            return {
                data: eventSeriesData
            }
        } else {
            const errorMessage = `No matching Event Series found!`;
            console.log(errorMessage);

            return {
                errorMessage: errorMessage,
                errorType: EventsErrorType.NoneOrAbsent
            }
        }
    } catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: EventsErrorType.UnexpectedError
        };
    }
}
