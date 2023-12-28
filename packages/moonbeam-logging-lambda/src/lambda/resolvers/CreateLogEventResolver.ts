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
 * @param fieldName name of the resolver path from the AppSync event
 * @param createLogEventInput logging input object, used to post a new log event.
 * @returns {@link Promise} of {@link LoggingResponse}
 */
export const createLogEvent = async (fieldName: string, createLogEventInput: CreateLogEventInput): Promise<LoggingResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // retrieving the frontend log group name
        const frontendLogGroupName = process.env.MOONBEAM_FRONTEND_LOG_GROUP_NAME!;

        // initialize the CloudWatch client
        const cloudWatchClient = new CloudWatchLogsClient({
            region: region
        });

        // get today's date in the format of YYYY-MM-DD in order to use that format in the log stream's name
        const dateToday = new Date();
        const logStreamNameDate = `${dateToday.getFullYear()}-${dateToday.getMonth() + 1}-${dateToday.getDate()}`;
        const logStreamName = `moonbeam-frontend-${logStreamNameDate}`;

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
        let alreadyExistent: boolean = false;
        if (describeLogStreamsCommandOutput.logStreams !== undefined && describeLogStreamsCommandOutput.logStreams.length !== 0) {
            /**
             * if there are log streams associated with the frontend log group, then search through them to see if there
             * is a log stream for today's date, and then modify the flag accordingly.
             */
            describeLogStreamsCommandOutput.logStreams.forEach(stream => {
                if (stream.logStreamName !== undefined && stream.logStreamName.includes(logStreamNameDate)) {
                    console.log(`Skipping the creation of a log stream for today, since it's already existent ${stream.logStreamName}`);
                    alreadyExistent = true;
                }
            });
        }

        /**
         * if we need to create a new log stream, do so accordingly and then push the log event in it,
         * otherwise proceed by pushing the log event in it.
         */
        if (!alreadyExistent) {
            const createLogStreamCommandOutput: CreateLogStreamCommandOutput = await cloudWatchClient.send(new CreateLogStreamCommand({
                    logGroupName: frontendLogGroupName,
                    logStreamName: logStreamName
                })
            );
            // check to make sure that the log stream creation was successful
            if (createLogStreamCommandOutput.$metadata.httpStatusCode === undefined || createLogStreamCommandOutput.$metadata.httpStatusCode !== 200) {
                const errorMessage = `Error while creating the new log stream for the log event`;
                console.log(`${errorMessage} - ${createLogStreamCommandOutput.$metadata.httpStatusCode}`);
                return {
                    errorMessage: errorMessage,
                    errorType: LoggingErrorType.UnexpectedError
                }
            }
        }

        // proceed by pushing the log event into the log stream
        const putLogEventsCommandOutput: PutLogEventsCommandOutput = await cloudWatchClient.send(new PutLogEventsCommand({
                logGroupName: frontendLogGroupName,
                logStreamName: logStreamName,
                logEvents: [
                    {
                        timestamp: Date.parse(new Date().toISOString()),
                        message: `[${createLogEventInput.logLevel}] - ${createLogEventInput.message}`
                    }
                ]
            })
        );
        if (putLogEventsCommandOutput.$metadata.httpStatusCode !== undefined && putLogEventsCommandOutput.$metadata.httpStatusCode === 200) {
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
    } catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: LoggingErrorType.UnexpectedError
        }
    }
}
