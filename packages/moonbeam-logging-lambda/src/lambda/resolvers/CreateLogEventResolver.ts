import {
    CreateLogEventInput,
    LoggingAcknowledgmentType,
    LoggingErrorType,
    LoggingResponse
} from "@moonbeam/moonbeam-models";
import {
    CloudWatchLogsClient,
    CreateLogStreamCommand,
    CreateLogStreamCommandOutput,
    DescribeLogStreamsCommand,
    DescribeLogStreamsCommandOutput,
    OrderBy,
    PutLogEventsCommand,
    PutLogEventsCommandOutput
} from "@aws-sdk/client-cloudwatch-logs";

/**
 * CreateLogEvent resolver
 *
 * @param sub the sub representing the identity of the user
 * @param fieldName name of the resolver path from the AppSync event
 * @param createLogEventInput logging input object, used to post a new log event.
 * @returns {@link Promise} of {@link LoggingResponse}
 */
export const createLogEvent = async (sub: string, fieldName: string, createLogEventInput: CreateLogEventInput): Promise<LoggingResponse> => {
    // get today's date in the format of YYYY-MM-DD in order to use that format in the log stream's name
    const dateToday = new Date();
    const logStreamNameDate = `${dateToday.getFullYear()}-${dateToday.getMonth() + 1}-${dateToday.getDate()}`;
    const logStreamName = `moonbeam-frontend-${logStreamNameDate}`;

    try {
        // retrieve the current function region
        const region = process.env.AWS_REGION!;

        // retrieve the frontend log group name
        const frontendLogGroupName = process.env.MOONBEAM_FRONTEND_LOG_GROUP_NAME!;

        // initialize the CloudWatch client
        const cloudWatchClient = new CloudWatchLogsClient({
            region: region
        });

        /**
         * first check to see if there is a logging stream created for the current day.
         * If there is none, then create a logging stream first, before logging any events.
         *
         * The limit for the number of streams returned is 50, however, since we order the
         * streams by the last log event time, then we are covered in this scenario to be sure
         * that the most recent 50 log streams, ordered by their logs' last event times are returned.
         */
        const describeLogStreamsCommandOutput: DescribeLogStreamsCommandOutput = await cloudWatchClient.send(new DescribeLogStreamsCommand({
                logGroupName: frontendLogGroupName,
                orderBy: OrderBy.LastEventTime
            })
        );
        // define a flag used to highlight whether there is a log stream associated with today's date or not
        if (describeLogStreamsCommandOutput.logStreams !== undefined && describeLogStreamsCommandOutput.logStreams.length !== 0) {
            /**
             * if there are log streams associated with the frontend log group, then search through them to see if there
             * is a log stream for today's date, and then modify the flag accordingly.
             */
            let alreadyExistent: boolean = false;
            describeLogStreamsCommandOutput.logStreams.forEach(stream => {
                if (stream.logStreamName !== undefined && stream.logStreamName.includes(logStreamNameDate)) {
                    console.log(`Skipping the creation of a log stream for today, since it's already existent ${stream.logStreamName}`);
                    alreadyExistent = true;
                }
            });

            if (!alreadyExistent) {
                // if there is no log stream, then create one, and then push the log event into it.
                const logStreamCreationFlag = await createLogStream(cloudWatchClient, frontendLogGroupName, logStreamName);

                // make sure the log stream creation was successful
                if (logStreamCreationFlag) {
                    // push the new log event into the stream
                    const pushLogEventFlag = await pushLogEvent(dateToday.toISOString(), sub, createLogEventInput, cloudWatchClient, frontendLogGroupName, logStreamName);

                    // make sure that the log event push was successful
                    if (pushLogEventFlag) {
                        console.log(`Log event successfully published`);
                        return {
                            data: LoggingAcknowledgmentType.Successful
                        }
                    } else {
                        const errorMessage = `Error while pushing a new log event into the ${logStreamName} log stream`;
                        console.log(errorMessage);
                        return {
                            data: LoggingAcknowledgmentType.Error,
                            errorMessage: errorMessage,
                            errorType: LoggingErrorType.UnexpectedError
                        }
                    }
                } else {
                    // return an error in case the log stream creation was not successful
                    const errorMessage = `Error while creating the new log stream for the log event`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: LoggingErrorType.UnexpectedError
                    }
                }
            } else {
                // if there is a log stream, then push the log event into it.
                const pushLogEventFlag = await pushLogEvent(dateToday.toISOString(), sub, createLogEventInput, cloudWatchClient, frontendLogGroupName, logStreamName);

                // make sure that the log event push was successful
                if (pushLogEventFlag) {
                    console.log(`Log event successfully published`);
                    return {
                        data: LoggingAcknowledgmentType.Successful
                    }
                } else {
                    const errorMessage = `Error while pushing a new log event into the ${logStreamName} log stream`;
                    console.log(errorMessage);
                    return {
                        data: LoggingAcknowledgmentType.Error,
                        errorMessage: errorMessage,
                        errorType: LoggingErrorType.UnexpectedError
                    }
                }
            }
        } else {
            // if there are no log stream associated to the frontend log group, then create one, and then push the log event into it.
            const logStreamCreationFlag = await createLogStream(cloudWatchClient, frontendLogGroupName, logStreamName);

            // make sure the log stream creation was successful
            if (logStreamCreationFlag) {
                // push the new log event into the stream
                const pushLogEventFlag = await pushLogEvent(dateToday.toISOString(), sub, createLogEventInput, cloudWatchClient, frontendLogGroupName, logStreamName);

                // make sure that the log event push was successful
                if (pushLogEventFlag) {
                    console.log(`Log event successfully published`);
                    return {
                        data: LoggingAcknowledgmentType.Successful
                    }
                } else {
                    const errorMessage = `Error while pushing a new log event into the ${logStreamName} log stream`;
                    console.log(errorMessage);
                    return {
                        data: LoggingAcknowledgmentType.Error,
                        errorMessage: errorMessage,
                        errorType: LoggingErrorType.UnexpectedError
                    }
                }
            } else {
                // return an error in case the log stream creation was not successful
                const errorMessage = `Error while creating the new log stream for the log event`;
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: LoggingErrorType.UnexpectedError
                }
            }
        }
    } catch (err) {
        // retrieve the current function region
        const region = process.env.AWS_REGION!;

        // initialize the CloudWatch client
        const cloudWatchClient = new CloudWatchLogsClient({
            region: region
        });

        // retrieve the frontend log group name
        const frontendLogGroupName = process.env.MOONBEAM_FRONTEND_LOG_GROUP_NAME!;

        // make sure that there is no resource already existent exception, and if there is then just push the event in the log stream
        // @ts-ignore
        if (err && (JSON.stringify(err).includes('ResourceAlreadyExistsException') || JSON.stringify(err).includes('The specified log stream already exists'))) {
            // push the new log event into the stream
            const pushLogEventFlag = await pushLogEvent(dateToday.toISOString(), sub, createLogEventInput, cloudWatchClient, frontendLogGroupName, logStreamName);

            // make sure that the log event push was successful
            if (pushLogEventFlag) {
                console.log(`Log event successfully published`);
                return {
                    data: LoggingAcknowledgmentType.Successful
                }
            } else {
                const errorMessage = `Error while pushing a new log event into the ${logStreamName} log stream`;
                console.log(errorMessage);
                return {
                    data: LoggingAcknowledgmentType.Error,
                    errorMessage: errorMessage,
                    errorType: LoggingErrorType.UnexpectedError
                }
            }

        } else {
            const errorMessage = `Unexpected error while executing ${fieldName} mutation ${err}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: LoggingErrorType.UnexpectedError
            }
        }
    }
}

/**
 * Function used to push a log event into a particular log stream, belonging to a log group.
 *
 * @param eventDate date for the log event
 * @param sub the sub representing the identity of the user
 * @param createLogEventInput the log event input containing all the information associated to the newly
 * created log event
 * @param cloudWatchClient the cloudwatch client used to push a new log event
 * @param logGroupName the log group name containing the log stream that will house the newly pushed log event into
 * @param logStreamName the log stream name used to push a new log event into
 */
export const pushLogEvent = async (eventDate: string, sub: string, createLogEventInput: CreateLogEventInput, cloudWatchClient: CloudWatchLogsClient,
                                   logGroupName: string, logStreamName: string): Promise<boolean> => {
    // proceed by pushing the log event into the log stream
    const putLogEventsCommandOutput: PutLogEventsCommandOutput = await cloudWatchClient.send(new PutLogEventsCommand({
            logGroupName: logGroupName,
            logStreamName: logStreamName,
            logEvents: [
                {
                    timestamp: Date.parse(new Date().toISOString()),
                    message: `[${createLogEventInput.logLevel}]: ${sub}: ${eventDate} - ${createLogEventInput.message}`
                }
            ]
        })
    );
    return putLogEventsCommandOutput.$metadata.httpStatusCode !== undefined && putLogEventsCommandOutput.$metadata.httpStatusCode === 200;
}

/**
 * Function used to create a new log stream.
 *
 * @param cloudWatchClient the cloudwatch client used to create a new log stream.
 * @param logGroupName the name of the log group to contain the newly created log stream.
 * @param logStreamName the name of the newly created log stream
 *
 * @return a {@link Promise} of a {@link boolean} representing a flag
 * highlighting whether the log stream was successfully created or not.
 */
export const createLogStream = async (cloudWatchClient: CloudWatchLogsClient, logGroupName: string, logStreamName: string): Promise<boolean> => {
    const createLogStreamCommandOutput: CreateLogStreamCommandOutput = await cloudWatchClient.send(new CreateLogStreamCommand({
            logGroupName: logGroupName,
            logStreamName: logStreamName
        })
    );
    // check to make sure that the log stream creation was successful
    return !(createLogStreamCommandOutput.$metadata.httpStatusCode === undefined || createLogStreamCommandOutput.$metadata.httpStatusCode !== 200);
}
