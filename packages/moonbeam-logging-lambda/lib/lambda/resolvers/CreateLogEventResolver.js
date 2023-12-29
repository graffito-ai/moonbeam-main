"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLogStream = exports.pushLogEvent = exports.createLogEvent = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const client_cloudwatch_logs_1 = require("@aws-sdk/client-cloudwatch-logs");
/**
 * CreateLogEvent resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param createLogEventInput logging input object, used to post a new log event.
 * @returns {@link Promise} of {@link LoggingResponse}
 */
const createLogEvent = async (fieldName, createLogEventInput) => {
    // get today's date in the format of YYYY-MM-DD in order to use that format in the log stream's name
    const dateToday = new Date();
    const logStreamNameDate = `${dateToday.getFullYear()}-${dateToday.getMonth() + 1}-${dateToday.getDate()}`;
    const logStreamName = `moonbeam-frontend-${logStreamNameDate}`;
    try {
        // retrieve the current function region
        const region = process.env.AWS_REGION;
        // retrieve the frontend log group name
        const frontendLogGroupName = process.env.MOONBEAM_FRONTEND_LOG_GROUP_NAME;
        // initialize the CloudWatch client
        const cloudWatchClient = new client_cloudwatch_logs_1.CloudWatchLogsClient({
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
        const describeLogStreamsCommandOutput = await cloudWatchClient.send(new client_cloudwatch_logs_1.DescribeLogStreamsCommand({
            logGroupName: frontendLogGroupName,
            orderBy: client_cloudwatch_logs_1.OrderBy.LastEventTime
        }));
        // define a flag used to highlight whether there is a log stream associated with today's date or not
        if (describeLogStreamsCommandOutput.logStreams !== undefined && describeLogStreamsCommandOutput.logStreams.length !== 0) {
            /**
             * if there are log streams associated with the frontend log group, then search through them to see if there
             * is a log stream for today's date, and then modify the flag accordingly.
             */
            let alreadyExistent = false;
            describeLogStreamsCommandOutput.logStreams.forEach(stream => {
                if (stream.logStreamName !== undefined && stream.logStreamName.includes(logStreamNameDate)) {
                    console.log(`Skipping the creation of a log stream for today, since it's already existent ${stream.logStreamName}`);
                    alreadyExistent = true;
                }
            });
            if (!alreadyExistent) {
                // if there is no log stream, then create one, and then push the log event into it.
                const logStreamCreationFlag = await (0, exports.createLogStream)(cloudWatchClient, frontendLogGroupName, logStreamName);
                // make sure the log stream creation was successful
                if (logStreamCreationFlag) {
                    // push the new log event into the stream
                    const pushLogEventFlag = await (0, exports.pushLogEvent)(createLogEventInput, cloudWatchClient, frontendLogGroupName, logStreamName);
                    // make sure that the log event push was successful
                    if (pushLogEventFlag) {
                        console.log(`Log event successfully published`);
                        return {
                            data: moonbeam_models_1.LoggingAcknowledgmentType.Successful
                        };
                    }
                    else {
                        const errorMessage = `Error while pushing a new log event into the ${logStreamName} log stream`;
                        console.log(errorMessage);
                        return {
                            data: moonbeam_models_1.LoggingAcknowledgmentType.Error,
                            errorMessage: errorMessage,
                            errorType: moonbeam_models_1.LoggingErrorType.UnexpectedError
                        };
                    }
                }
                else {
                    // return an error in case the log stream creation was not successful
                    const errorMessage = `Error while creating the new log stream for the log event`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: moonbeam_models_1.LoggingErrorType.UnexpectedError
                    };
                }
            }
            else {
                // if there is a log stream, then push the log event into it.
                const pushLogEventFlag = await (0, exports.pushLogEvent)(createLogEventInput, cloudWatchClient, frontendLogGroupName, logStreamName);
                // make sure that the log event push was successful
                if (pushLogEventFlag) {
                    console.log(`Log event successfully published`);
                    return {
                        data: moonbeam_models_1.LoggingAcknowledgmentType.Successful
                    };
                }
                else {
                    const errorMessage = `Error while pushing a new log event into the ${logStreamName} log stream`;
                    console.log(errorMessage);
                    return {
                        data: moonbeam_models_1.LoggingAcknowledgmentType.Error,
                        errorMessage: errorMessage,
                        errorType: moonbeam_models_1.LoggingErrorType.UnexpectedError
                    };
                }
            }
        }
        else {
            // if there are no log stream associated to the frontend log group, then create one, and then push the log event into it.
            const logStreamCreationFlag = await (0, exports.createLogStream)(cloudWatchClient, frontendLogGroupName, logStreamName);
            // make sure the log stream creation was successful
            if (logStreamCreationFlag) {
                // push the new log event into the stream
                const pushLogEventFlag = await (0, exports.pushLogEvent)(createLogEventInput, cloudWatchClient, frontendLogGroupName, logStreamName);
                // make sure that the log event push was successful
                if (pushLogEventFlag) {
                    console.log(`Log event successfully published`);
                    return {
                        data: moonbeam_models_1.LoggingAcknowledgmentType.Successful
                    };
                }
                else {
                    const errorMessage = `Error while pushing a new log event into the ${logStreamName} log stream`;
                    console.log(errorMessage);
                    return {
                        data: moonbeam_models_1.LoggingAcknowledgmentType.Error,
                        errorMessage: errorMessage,
                        errorType: moonbeam_models_1.LoggingErrorType.UnexpectedError
                    };
                }
            }
            else {
                // return an error in case the log stream creation was not successful
                const errorMessage = `Error while creating the new log stream for the log event`;
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: moonbeam_models_1.LoggingErrorType.UnexpectedError
                };
            }
        }
    }
    catch (err) {
        // retrieve the current function region
        const region = process.env.AWS_REGION;
        // initialize the CloudWatch client
        const cloudWatchClient = new client_cloudwatch_logs_1.CloudWatchLogsClient({
            region: region
        });
        // retrieve the frontend log group name
        const frontendLogGroupName = process.env.MOONBEAM_FRONTEND_LOG_GROUP_NAME;
        // make sure that there is no resource already existent exception, and if there is then just push the event in the log stream
        // @ts-ignore
        if (err.code && err.code === 'ResourceAlreadyExistsException' && err.message && err.message.contains('The specified log stream already exists')) {
            // push the new log event into the stream
            const pushLogEventFlag = await (0, exports.pushLogEvent)(createLogEventInput, cloudWatchClient, frontendLogGroupName, logStreamName);
            // make sure that the log event push was successful
            if (pushLogEventFlag) {
                console.log(`Log event successfully published`);
                return {
                    data: moonbeam_models_1.LoggingAcknowledgmentType.Successful
                };
            }
            else {
                const errorMessage = `Error while pushing a new log event into the ${logStreamName} log stream`;
                console.log(errorMessage);
                return {
                    data: moonbeam_models_1.LoggingAcknowledgmentType.Error,
                    errorMessage: errorMessage,
                    errorType: moonbeam_models_1.LoggingErrorType.UnexpectedError
                };
            }
        }
        else {
            const errorMessage = `Unexpected error while executing ${fieldName} mutation ${err}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.LoggingErrorType.UnexpectedError
            };
        }
    }
};
exports.createLogEvent = createLogEvent;
/**
 * Function used to push a log event into a particular log stream, belonging to a log group.
 *
 * @param createLogEventInput the log event input containing all the information associated to the newly
 * created log event
 * @param cloudWatchClient the cloudwatch client used to push a new log event
 * @param logGroupName the log group name containing the log stream that will house the newly pushed log event into
 * @param logStreamName the log stream name used to push a new log event into
 */
const pushLogEvent = async (createLogEventInput, cloudWatchClient, logGroupName, logStreamName) => {
    // proceed by pushing the log event into the log stream
    const putLogEventsCommandOutput = await cloudWatchClient.send(new client_cloudwatch_logs_1.PutLogEventsCommand({
        logGroupName: logGroupName,
        logStreamName: logStreamName,
        logEvents: [
            {
                timestamp: Date.parse(new Date().toISOString()),
                message: `[${createLogEventInput.logLevel}] - ${createLogEventInput.message}`
            }
        ]
    }));
    return putLogEventsCommandOutput.$metadata.httpStatusCode !== undefined && putLogEventsCommandOutput.$metadata.httpStatusCode === 200;
};
exports.pushLogEvent = pushLogEvent;
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
const createLogStream = async (cloudWatchClient, logGroupName, logStreamName) => {
    const createLogStreamCommandOutput = await cloudWatchClient.send(new client_cloudwatch_logs_1.CreateLogStreamCommand({
        logGroupName: logGroupName,
        logStreamName: logStreamName
    }));
    // check to make sure that the log stream creation was successful
    return !(createLogStreamCommandOutput.$metadata.httpStatusCode === undefined || createLogStreamCommandOutput.$metadata.httpStatusCode !== 200);
};
exports.createLogStream = createLogStream;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRlTG9nRXZlbnRSZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL0NyZWF0ZUxvZ0V2ZW50UmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0RBS21DO0FBQ25DLDRFQVN5QztBQUV6Qzs7Ozs7O0dBTUc7QUFDSSxNQUFNLGNBQWMsR0FBRyxLQUFLLEVBQUUsU0FBaUIsRUFBRSxtQkFBd0MsRUFBNEIsRUFBRTtJQUMxSCxvR0FBb0c7SUFDcEcsTUFBTSxTQUFTLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztJQUM3QixNQUFNLGlCQUFpQixHQUFHLEdBQUcsU0FBUyxDQUFDLFdBQVcsRUFBRSxJQUFJLFNBQVMsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLElBQUksU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUM7SUFDMUcsTUFBTSxhQUFhLEdBQUcscUJBQXFCLGlCQUFpQixFQUFFLENBQUM7SUFFL0QsSUFBSTtRQUNBLHVDQUF1QztRQUN2QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2Qyx1Q0FBdUM7UUFDdkMsTUFBTSxvQkFBb0IsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGdDQUFpQyxDQUFDO1FBRTNFLG1DQUFtQztRQUNuQyxNQUFNLGdCQUFnQixHQUFHLElBQUksNkNBQW9CLENBQUM7WUFDOUMsTUFBTSxFQUFFLE1BQU07U0FDakIsQ0FBQyxDQUFDO1FBRUg7Ozs7Ozs7V0FPRztRQUNILE1BQU0sK0JBQStCLEdBQW9DLE1BQU0sZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksa0RBQXlCLENBQUM7WUFDM0gsWUFBWSxFQUFFLG9CQUFvQjtZQUNsQyxPQUFPLEVBQUUsZ0NBQU8sQ0FBQyxhQUFhO1NBQ2pDLENBQUMsQ0FDTCxDQUFDO1FBQ0Ysb0dBQW9HO1FBQ3BHLElBQUksK0JBQStCLENB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ZWF0ZUxvZ0V2ZW50SW5wdXQsXG4gICAgTG9nZ2luZ0Fja25vd2xlZGdtZW50VHlwZSxcbiAgICBMb2dnaW5nRXJyb3JUeXBlLFxuICAgIExvZ2dpbmdSZXNwb25zZVxufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuaW1wb3J0IHtcbiAgICBDbG91ZFdhdGNoTG9nc0NsaWVudCxcbiAgICBDcmVhdGVMb2dTdHJlYW1Db21tYW5kLFxuICAgIENyZWF0ZUxvZ1N0cmVhbUNvbW1hbmRPdXRwdXQsXG4gICAgRGVzY3JpYmVMb2dTdHJlYW1zQ29tbWFuZCxcbiAgICBEZXNjcmliZUxvZ1N0cmVhbXNDb21tYW5kT3V0cHV0LFxuICAgIE9yZGVyQnksXG4gICAgUHV0TG9nRXZlbnRzQ29tbWFuZCxcbiAgICBQdXRMb2dFdmVudHNDb21tYW5kT3V0cHV0XG59IGZyb20gXCJAYXdzLXNkay9jbGllbnQtY2xvdWR3YXRjaC1sb2dzXCI7XG5cbi8qKlxuICogQ3JlYXRlTG9nRXZlbnQgcmVzb2x2ZXJcbiAqXG4gKiBAcGFyYW0gZmllbGROYW1lIG5hbWUgb2YgdGhlIHJlc29sdmVyIHBhdGggZnJvbSB0aGUgQXBwU3luYyBldmVudFxuICogQHBhcmFtIGNyZWF0ZUxvZ0V2ZW50SW5wdXQgbG9nZ2luZyBpbnB1dCBvYmplY3QsIHVzZWQgdG8gcG9zdCBhIG5ldyBsb2cgZXZlbnQuXG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIExvZ2dpbmdSZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IGNyZWF0ZUxvZ0V2ZW50ID0gYXN5bmMgKGZpZWxkTmFtZTogc3RyaW5nLCBjcmVhdGVMb2dFdmVudElucHV0OiBDcmVhdGVMb2dFdmVudElucHV0KTogUHJvbWlzZTxMb2dnaW5nUmVzcG9uc2U+ID0+IHtcbiAgICAvLyBnZXQgdG9kYXkncyBkYXRlIGluIHRoZSBmb3JtYXQgb2YgWVlZWS1NTS1ERCBpbiBvcmRlciB0byB1c2UgdGhhdCBmb3JtYXQgaW4gdGhlIGxvZyBzdHJlYW0ncyBuYW1lXG4gICAgY29uc3QgZGF0ZVRvZGF5ID0gbmV3IERhdGUoKTtcbiAgICBjb25zdCBsb2dTdHJlYW1OYW1lRGF0ZSA9IGAke2RhdGVUb2RheS5nZXRGdWxsWWVhcigpfS0ke2RhdGVUb2RheS5nZXRNb250aCgpICsgMX0tJHtkYXRlVG9kYXkuZ2V0RGF0ZSgpfWA7XG4gICAgY29uc3QgbG9nU3RyZWFtTmFtZSA9IGBtb29uYmVhbS1mcm9udGVuZC0ke2xvZ1N0cmVhbU5hbWVEYXRlfWA7XG5cbiAgICB0cnkge1xuICAgICAgICAvLyByZXRyaWV2ZSB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLy8gcmV0cmlldmUgdGhlIGZyb250ZW5kIGxvZyBncm91cCBuYW1lXG4gICAgICAgIGNvbnN0IGZyb250ZW5kTG9nR3JvdXBOYW1lID0gcHJvY2Vzcy5lbnYuTU9PTkJFQU1fRlJPTlRFTkRfTE9HX0dST1VQX05BTUUhO1xuXG4gICAgICAgIC8vIGluaXRpYWxpemUgdGhlIENsb3VkV2F0Y2ggY2xpZW50XG4gICAgICAgIGNvbnN0IGNsb3VkV2F0Y2hDbGllbnQgPSBuZXcgQ2xvdWRXYXRjaExvZ3NDbGllbnQoe1xuICAgICAgICAgICAgcmVnaW9uOiByZWdpb25cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIGZpcnN0IGNoZWNrIHRvIHNlZSBpZiB0aGVyZSBpcyBhIGxvZ2dpbmcgc3RyZWFtIGNyZWF0ZWQgZm9yIHRoZSBjdXJyZW50IGRheS5cbiAgICAgICAgICogSWYgdGhlcmUgaXMgbm9uZSwgdGhlbiBjcmVhdGUgYSBsb2dnaW5nIHN0cmVhbSBmaXJzdCwgYmVmb3JlIGxvZ2dpbmcgYW55IGV2ZW50cy5cbiAgICAgICAgICpcbiAgICAgICAgICogVGhlIGxpbWl0IGZvciB0aGUgbnVtYmVyIG9mIHN0cmVhbXMgcmV0dXJuZWQgaXMgNTAsIGhvd2V2ZXIsIHNpbmNlIHdlIG9yZGVyIHRoZVxuICAgICAgICAgKiBzdHJlYW1zIGJ5IHRoZSBsYXN0IGxvZyBldmVudCB0aW1lLCB0aGVuIHdlIGFyZSBjb3ZlcmVkIGluIHRoaXMgc2NlbmFyaW8gdG8gYmUgc3VyZVxuICAgICAgICAgKiB0aGF0IHRoZSBtb3N0IHJlY2VudCA1MCBsb2cgc3RyZWFtcywgb3JkZXJlZCBieSB0aGVpciBsb2dzJyBsYXN0IGV2ZW50IHRpbWVzIGFyZSByZXR1cm5lZC5cbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IGRlc2NyaWJlTG9nU3RyZWFtc0NvbW1hbmRPdXRwdXQ6IERlc2NyaWJlTG9nU3RyZWFtc0NvbW1hbmRPdXRwdXQgPSBhd2FpdCBjbG91ZFdhdGNoQ2xpZW50LnNlbmQobmV3IERlc2NyaWJlTG9nU3RyZWFtc0NvbW1hbmQoe1xuICAgICAgICAgICAgICAgIGxvZ0dyb3VwTmFtZTogZnJvbnRlbmRMb2dHcm91cE5hbWUsXG4gICAgICAgICAgICAgICAgb3JkZXJCeTogT3JkZXJCeS5MYXN0RXZlbnRUaW1lXG4gICAgICAgICAgICB9KVxuICAgICAgICApO1xuICAgICAgICAvLyBkZWZpbmUgYSBmbGFnIHVzZWQgdG8gaGlnaGxpZ2h0IHdoZXRoZXIgdGhlcmUgaXMgYSBsb2cgc3RyZWFtIGFzc29jaWF0ZWQgd2l0aCB0b2RheSdzIGRhdGUgb3Igbm90XG4gICAgICAgIGlmIChkZXNjcmliZUxvZ1N0cmVhbXNDb21tYW5kT3V0cHV0LmxvZ1N0cmVhbXMgIT09IHVuZGVmaW5lZCAmJiBkZXNjcmliZUxvZ1N0cmVhbXNDb21tYW5kT3V0cHV0LmxvZ1N0cmVhbXMubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIGlmIHRoZXJlIGFyZSBsb2cgc3RyZWFtcyBhc3NvY2lhdGVkIHdpdGggdGhlIGZyb250ZW5kIGxvZyBncm91cCwgdGhlbiBzZWFyY2ggdGhyb3VnaCB0aGVtIHRvIHNlZSBpZiB0aGVyZVxuICAgICAgICAgICAgICogaXMgYSBsb2cgc3RyZWFtIGZvciB0b2RheSdzIGRhdGUsIGFuZCB0aGVuIG1vZGlmeSB0aGUgZmxhZyBhY2NvcmRpbmdseS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgbGV0IGFscmVhZHlFeGlzdGVudDogYm9vbGVhbiA9IGZhbHNlO1xuICAgICAgICAgICAgZGVzY3JpYmVMb2dTdHJlYW1zQ29tbWFuZE91dHB1dC5sb2dTdHJlYW1zLmZvckVhY2goc3RyZWFtID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoc3RyZWFtLmxvZ1N0cmVhbU5hbWUgIT09IHVuZGVmaW5lZCAmJiBzdHJlYW0ubG9nU3RyZWFtTmFtZS5pbmNsdWRlcyhsb2dTdHJlYW1OYW1lRGF0ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFNraXBwaW5nIHRoZSBjcmVhdGlvbiBvZiBhIGxvZyBzdHJlYW0gZm9yIHRvZGF5LCBzaW5jZSBpdCdzIGFscmVhZHkgZXhpc3RlbnQgJHtzdHJlYW0ubG9nU3RyZWFtTmFtZX1gKTtcbiAgICAgICAgICAgICAgICAgICAgYWxyZWFkeUV4aXN0ZW50ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaWYgKCFhbHJlYWR5RXhpc3RlbnQpIHtcbiAgICAgICAgICAgICAgICAvLyBpZiB0aGVyZSBpcyBubyBsb2cgc3RyZWFtLCB0aGVuIGNyZWF0ZSBvbmUsIGFuZCB0aGVuIHB1c2ggdGhlIGxvZyBldmVudCBpbnRvIGl0LlxuICAgICAgICAgICAgICAgIGNvbnN0IGxvZ1N0cmVhbUNyZWF0aW9uRmxhZyA9IGF3YWl0IGNyZWF0ZUxvZ1N0cmVhbShjbG91ZFdhdGNoQ2xpZW50LCBmcm9udGVuZExvZ0dyb3VwTmFtZSwgbG9nU3RyZWFtTmFtZSk7XG5cbiAgICAgICAgICAgICAgICAvLyBtYWtlIHN1cmUgdGhlIGxvZyBzdHJlYW0gY3JlYXRpb24gd2FzIHN1Y2Nlc3NmdWxcbiAgICAgICAgICAgICAgICBpZiAobG9nU3RyZWFtQ3JlYXRpb25GbGFnKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHB1c2ggdGhlIG5ldyBsb2cgZXZlbnQgaW50byB0aGUgc3RyZWFtXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHB1c2hMb2dFdmVudEZsYWcgPSBhd2FpdCBwdXNoTG9nRXZlbnQoY3JlYXRlTG9nRXZlbnRJbnB1dCwgY2xvdWRXYXRjaENsaWVudCwgZnJvbnRlbmRMb2dHcm91cE5hbWUsIGxvZ1N0cmVhbU5hbWUpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIG1ha2Ugc3VyZSB0aGF0IHRoZSBsb2cgZXZlbnQgcHVzaCB3YXMgc3VjY2Vzc2Z1bFxuICAgICAgICAgICAgICAgICAgICBpZiAocHVzaExvZ0V2ZW50RmxhZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYExvZyBldmVudCBzdWNjZXNzZnVsbHkgcHVibGlzaGVkYCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IExvZ2dpbmdBY2tub3dsZWRnbWVudFR5cGUuU3VjY2Vzc2Z1bFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYEVycm9yIHdoaWxlIHB1c2hpbmcgYSBuZXcgbG9nIGV2ZW50IGludG8gdGhlICR7bG9nU3RyZWFtTmFtZX0gbG9nIHN0cmVhbWA7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBMb2dnaW5nQWNrbm93bGVkZ21lbnRUeXBlLkVycm9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTG9nZ2luZ0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiBhbiBlcnJvciBpbiBjYXNlIHRoZSBsb2cgc3RyZWFtIGNyZWF0aW9uIHdhcyBub3Qgc3VjY2Vzc2Z1bFxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgRXJyb3Igd2hpbGUgY3JlYXRpbmcgdGhlIG5ldyBsb2cgc3RyZWFtIGZvciB0aGUgbG9nIGV2ZW50YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBMb2dnaW5nRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBpZiB0aGVyZSBpcyBhIGxvZyBzdHJlYW0sIHRoZW4gcHVzaCB0aGUgbG9nIGV2ZW50IGludG8gaXQuXG4gICAgICAgICAgICAgICAgY29uc3QgcHVzaExvZ0V2ZW50RmxhZyA9IGF3YWl0IHB1c2hMb2dFdmVudChjcmVhdGVMb2dFdmVudElucHV0LCBjbG91ZFdhdGNoQ2xpZW50LCBmcm9udGVuZExvZ0dyb3VwTmFtZSwgbG9nU3RyZWFtTmFtZSk7XG5cbiAgICAgICAgICAgICAgICAvLyBtYWtlIHN1cmUgdGhhdCB0aGUgbG9nIGV2ZW50IHB1c2ggd2FzIHN1Y2Nlc3NmdWxcbiAgICAgICAgICAgICAgICBpZiAocHVzaExvZ0V2ZW50RmxhZykge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgTG9nIGV2ZW50IHN1Y2Nlc3NmdWxseSBwdWJsaXNoZWRgKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IExvZ2dpbmdBY2tub3dsZWRnbWVudFR5cGUuU3VjY2Vzc2Z1bFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYEVycm9yIHdoaWxlIHB1c2hpbmcgYSBuZXcgbG9nIGV2ZW50IGludG8gdGhlICR7bG9nU3RyZWFtTmFtZX0gbG9nIHN0cmVhbWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBMb2dnaW5nQWNrbm93bGVkZ21lbnRUeXBlLkVycm9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IExvZ2dpbmdFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBpZiB0aGVyZSBhcmUgbm8gbG9nIHN0cmVhbSBhc3NvY2lhdGVkIHRvIHRoZSBmcm9udGVuZCBsb2cgZ3JvdXAsIHRoZW4gY3JlYXRlIG9uZSwgYW5kIHRoZW4gcHVzaCB0aGUgbG9nIGV2ZW50IGludG8gaXQuXG4gICAgICAgICAgICBjb25zdCBsb2dTdHJlYW1DcmVhdGlvbkZsYWcgPSBhd2FpdCBjcmVhdGVMb2dTdHJlYW0oY2xvdWRXYXRjaENsaWVudCwgZnJvbnRlbmRMb2dHcm91cE5hbWUsIGxvZ1N0cmVhbU5hbWUpO1xuXG4gICAgICAgICAgICAvLyBtYWtlIHN1cmUgdGhlIGxvZyBzdHJlYW0gY3JlYXRpb24gd2FzIHN1Y2Nlc3NmdWxcbiAgICAgICAgICAgIGlmIChsb2dTdHJlYW1DcmVhdGlvbkZsYWcpIHtcbiAgICAgICAgICAgICAgICAvLyBwdXNoIHRoZSBuZXcgbG9nIGV2ZW50IGludG8gdGhlIHN0cmVhbVxuICAgICAgICAgICAgICAgIGNvbnN0IHB1c2hMb2dFdmVudEZsYWcgPSBhd2FpdCBwdXNoTG9nRXZlbnQoY3JlYXRlTG9nRXZlbnRJbnB1dCwgY2xvdWRXYXRjaENsaWVudCwgZnJvbnRlbmRMb2dHcm91cE5hbWUsIGxvZ1N0cmVhbU5hbWUpO1xuXG4gICAgICAgICAgICAgICAgLy8gbWFrZSBzdXJlIHRoYXQgdGhlIGxvZyBldmVudCBwdXNoIHdhcyBzdWNjZXNzZnVsXG4gICAgICAgICAgICAgICAgaWYgKHB1c2hMb2dFdmVudEZsYWcpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYExvZyBldmVudCBzdWNjZXNzZnVsbHkgcHVibGlzaGVkYCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBMb2dnaW5nQWNrbm93bGVkZ21lbnRUeXBlLlN1Y2Nlc3NmdWxcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBFcnJvciB3aGlsZSBwdXNoaW5nIGEgbmV3IGxvZyBldmVudCBpbnRvIHRoZSAke2xvZ1N0cmVhbU5hbWV9IGxvZyBzdHJlYW1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogTG9nZ2luZ0Fja25vd2xlZGdtZW50VHlwZS5FcnJvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBMb2dnaW5nRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyByZXR1cm4gYW4gZXJyb3IgaW4gY2FzZSB0aGUgbG9nIHN0cmVhbSBjcmVhdGlvbiB3YXMgbm90IHN1Y2Nlc3NmdWxcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgRXJyb3Igd2hpbGUgY3JlYXRpbmcgdGhlIG5ldyBsb2cgc3RyZWFtIGZvciB0aGUgbG9nIGV2ZW50YDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IExvZ2dpbmdFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIC8vIHJldHJpZXZlIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OITtcblxuICAgICAgICAvLyBpbml0aWFsaXplIHRoZSBDbG91ZFdhdGNoIGNsaWVudFxuICAgICAgICBjb25zdCBjbG91ZFdhdGNoQ2xpZW50ID0gbmV3IENsb3VkV2F0Y2hMb2dzQ2xpZW50KHtcbiAgICAgICAgICAgIHJlZ2lvbjogcmVnaW9uXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIHJldHJpZXZlIHRoZSBmcm9udGVuZCBsb2cgZ3JvdXAgbmFtZVxuICAgICAgICBjb25zdCBmcm9udGVuZExvZ0dyb3VwTmFtZSA9IHByb2Nlc3MuZW52Lk1PT05CRUFNX0ZST05URU5EX0xPR19HUk9VUF9OQU1FITtcblxuICAgICAgICAvLyBtYWtlIHN1cmUgdGhhdCB0aGVyZSBpcyBubyByZXNvdXJjZSBhbHJlYWR5IGV4aXN0ZW50IGV4Y2VwdGlvbiwgYW5kIGlmIHRoZXJlIGlzIHRoZW4ganVzdCBwdXNoIHRoZSBldmVudCBpbiB0aGUgbG9nIHN0cmVhbVxuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIGlmIChlcnIuY29kZSAmJiBlcnIuY29kZSA9PT0gJ1Jlc291cmNlQWxyZWFkeUV4aXN0c0V4Y2VwdGlvbicgJiYgZXJyLm1lc3NhZ2UgJiYgZXJyLm1lc3NhZ2UuY29udGFpbnMoJ1RoZSBzcGVjaWZpZWQgbG9nIHN0cmVhbSBhbHJlYWR5IGV4aXN0cycpKSB7XG4gICAgICAgICAgICAvLyBwdXNoIHRoZSBuZXcgbG9nIGV2ZW50IGludG8gdGhlIHN0cmVhbVxuICAgICAgICAgICAgY29uc3QgcHVzaExvZ0V2ZW50RmxhZyA9IGF3YWl0IHB1c2hMb2dFdmVudChjcmVhdGVMb2dFdmVudElucHV0LCBjbG91ZFdhdGNoQ2xpZW50LCBmcm9udGVuZExvZ0dyb3VwTmFtZSwgbG9nU3RyZWFtTmFtZSk7XG5cbiAgICAgICAgICAgIC8vIG1ha2Ugc3VyZSB0aGF0IHRoZSBsb2cgZXZlbnQgcHVzaCB3YXMgc3VjY2Vzc2Z1bFxuICAgICAgICAgICAgaWYgKHB1c2hMb2dFdmVudEZsYWcpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgTG9nIGV2ZW50IHN1Y2Nlc3NmdWxseSBwdWJsaXNoZWRgKTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiBMb2dnaW5nQWNrbm93bGVkZ21lbnRUeXBlLlN1Y2Nlc3NmdWxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBFcnJvciB3aGlsZSBwdXNoaW5nIGEgbmV3IGxvZyBldmVudCBpbnRvIHRoZSAke2xvZ1N0cmVhbU5hbWV9IGxvZyBzdHJlYW1gO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogTG9nZ2luZ0Fja25vd2xlZGdtZW50VHlwZS5FcnJvcixcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTG9nZ2luZ0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyAke2ZpZWxkTmFtZX0gbXV0YXRpb24gJHtlcnJ9YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTG9nZ2luZ0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB1c2VkIHRvIHB1c2ggYSBsb2cgZXZlbnQgaW50byBhIHBhcnRpY3VsYXIgbG9nIHN0cmVhbSwgYmVsb25naW5nIHRvIGEgbG9nIGdyb3VwLlxuICpcbiAqIEBwYXJhbSBjcmVhdGVMb2dFdmVudElucHV0IHRoZSBsb2cgZXZlbnQgaW5wdXQgY29udGFpbmluZyBhbGwgdGhlIGluZm9ybWF0aW9uIGFzc29jaWF0ZWQgdG8gdGhlIG5ld2x5XG4gKiBjcmVhdGVkIGxvZyBldmVudFxuICogQHBhcmFtIGNsb3VkV2F0Y2hDbGllbnQgdGhlIGNsb3Vkd2F0Y2ggY2xpZW50IHVzZWQgdG8gcHVzaCBhIG5ldyBsb2cgZXZlbnRcbiAqIEBwYXJhbSBsb2dHcm91cE5hbWUgdGhlIGxvZyBncm91cCBuYW1lIGNvbnRhaW5pbmcgdGhlIGxvZyBzdHJlYW0gdGhhdCB3aWxsIGhvdXNlIHRoZSBuZXdseSBwdXNoZWQgbG9nIGV2ZW50IGludG9cbiAqIEBwYXJhbSBsb2dTdHJlYW1OYW1lIHRoZSBsb2cgc3RyZWFtIG5hbWUgdXNlZCB0byBwdXNoIGEgbmV3IGxvZyBldmVudCBpbnRvXG4gKi9cbmV4cG9ydCBjb25zdCBwdXNoTG9nRXZlbnQgPSBhc3luYyAoY3JlYXRlTG9nRXZlbnRJbnB1dDogQ3JlYXRlTG9nRXZlbnRJbnB1dCwgY2xvdWRXYXRjaENsaWVudDogQ2xvdWRXYXRjaExvZ3NDbGllbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ0dyb3VwTmFtZTogc3RyaW5nLCBsb2dTdHJlYW1OYW1lOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgICAvLyBwcm9jZWVkIGJ5IHB1c2hpbmcgdGhlIGxvZyBldmVudCBpbnRvIHRoZSBsb2cgc3RyZWFtXG4gICAgY29uc3QgcHV0TG9nRXZlbnRzQ29tbWFuZE91dHB1dDogUHV0TG9nRXZlbnRzQ29tbWFuZE91dHB1dCA9IGF3YWl0IGNsb3VkV2F0Y2hDbGllbnQuc2VuZChuZXcgUHV0TG9nRXZlbnRzQ29tbWFuZCh7XG4gICAgICAgICAgICBsb2dHcm91cE5hbWU6IGxvZ0dyb3VwTmFtZSxcbiAgICAgICAgICAgIGxvZ1N0cmVhbU5hbWU6IGxvZ1N0cmVhbU5hbWUsXG4gICAgICAgICAgICBsb2dFdmVudHM6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5wYXJzZShuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkpLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBgWyR7Y3JlYXRlTG9nRXZlbnRJbnB1dC5sb2dMZXZlbH1dIC0gJHtjcmVhdGVMb2dFdmVudElucHV0Lm1lc3NhZ2V9YFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfSlcbiAgICApO1xuICAgIHJldHVybiBwdXRMb2dFdmVudHNDb21tYW5kT3V0cHV0LiRtZXRhZGF0YS5odHRwU3RhdHVzQ29kZSAhPT0gdW5kZWZpbmVkICYmIHB1dExvZ0V2ZW50c0NvbW1hbmRPdXRwdXQuJG1ldGFkYXRhLmh0dHBTdGF0dXNDb2RlID09PSAyMDA7XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdXNlZCB0byBjcmVhdGUgYSBuZXcgbG9nIHN0cmVhbS5cbiAqXG4gKiBAcGFyYW0gY2xvdWRXYXRjaENsaWVudCB0aGUgY2xvdWR3YXRjaCBjbGllbnQgdXNlZCB0byBjcmVhdGUgYSBuZXcgbG9nIHN0cmVhbS5cbiAqIEBwYXJhbSBsb2dHcm91cE5hbWUgdGhlIG5hbWUgb2YgdGhlIGxvZyBncm91cCB0byBjb250YWluIHRoZSBuZXdseSBjcmVhdGVkIGxvZyBzdHJlYW0uXG4gKiBAcGFyYW0gbG9nU3RyZWFtTmFtZSB0aGUgbmFtZSBvZiB0aGUgbmV3bHkgY3JlYXRlZCBsb2cgc3RyZWFtXG4gKlxuICogQHJldHVybiBhIHtAbGluayBQcm9taXNlfSBvZiBhIHtAbGluayBib29sZWFufSByZXByZXNlbnRpbmcgYSBmbGFnXG4gKiBoaWdobGlnaHRpbmcgd2hldGhlciB0aGUgbG9nIHN0cmVhbSB3YXMgc3VjY2Vzc2Z1bGx5IGNyZWF0ZWQgb3Igbm90LlxuICovXG5leHBvcnQgY29uc3QgY3JlYXRlTG9nU3RyZWFtID0gYXN5bmMgKGNsb3VkV2F0Y2hDbGllbnQ6IENsb3VkV2F0Y2hMb2dzQ2xpZW50LCBsb2dHcm91cE5hbWU6IHN0cmluZywgbG9nU3RyZWFtTmFtZTogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgY29uc3QgY3JlYXRlTG9nU3RyZWFtQ29tbWFuZE91dHB1dDogQ3JlYXRlTG9nU3RyZWFtQ29tbWFuZE91dHB1dCA9IGF3YWl0IGNsb3VkV2F0Y2hDbGllbnQuc2VuZChuZXcgQ3JlYXRlTG9nU3RyZWFtQ29tbWFuZCh7XG4gICAgICAgICAgICBsb2dHcm91cE5hbWU6IGxvZ0dyb3VwTmFtZSxcbiAgICAgICAgICAgIGxvZ1N0cmVhbU5hbWU6IGxvZ1N0cmVhbU5hbWVcbiAgICAgICAgfSlcbiAgICApO1xuICAgIC8vIGNoZWNrIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSBsb2cgc3RyZWFtIGNyZWF0aW9uIHdhcyBzdWNjZXNzZnVsXG4gICAgcmV0dXJuICEoY3JlYXRlTG9nU3RyZWFtQ29tbWFuZE91dHB1dC4kbWV0YWRhdGEuaHR0cFN0YXR1c0NvZGUgPT09IHVuZGVmaW5lZCB8fCBjcmVhdGVMb2dTdHJlYW1Db21tYW5kT3V0cHV0LiRtZXRhZGF0YS5odHRwU3RhdHVzQ29kZSAhPT0gMjAwKTtcbn1cbiJdfQ==