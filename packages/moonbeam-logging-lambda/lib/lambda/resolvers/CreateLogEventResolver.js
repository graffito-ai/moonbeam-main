"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLogStream = exports.pushLogEvent = exports.createLogEvent = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const client_cloudwatch_logs_1 = require("@aws-sdk/client-cloudwatch-logs");
/**
 * CreateLogEvent resolver
 *
 * @param sub the sub representing the identity of the user
 * @param fieldName name of the resolver path from the AppSync event
 * @param createLogEventInput logging input object, used to post a new log event.
 * @returns {@link Promise} of {@link LoggingResponse}
 */
const createLogEvent = async (sub, fieldName, createLogEventInput) => {
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
                    const pushLogEventFlag = await (0, exports.pushLogEvent)(dateToday.toISOString(), sub, createLogEventInput, cloudWatchClient, frontendLogGroupName, logStreamName);
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
                const pushLogEventFlag = await (0, exports.pushLogEvent)(dateToday.toISOString(), sub, createLogEventInput, cloudWatchClient, frontendLogGroupName, logStreamName);
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
                const pushLogEventFlag = await (0, exports.pushLogEvent)(dateToday.toISOString(), sub, createLogEventInput, cloudWatchClient, frontendLogGroupName, logStreamName);
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
            const pushLogEventFlag = await (0, exports.pushLogEvent)(dateToday.toISOString(), sub, createLogEventInput, cloudWatchClient, frontendLogGroupName, logStreamName);
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
 * @param eventDate date for the log event
 * @param sub the sub representing the identity of the user
 * @param createLogEventInput the log event input containing all the information associated to the newly
 * created log event
 * @param cloudWatchClient the cloudwatch client used to push a new log event
 * @param logGroupName the log group name containing the log stream that will house the newly pushed log event into
 * @param logStreamName the log stream name used to push a new log event into
 */
const pushLogEvent = async (eventDate, sub, createLogEventInput, cloudWatchClient, logGroupName, logStreamName) => {
    // proceed by pushing the log event into the log stream
    const putLogEventsCommandOutput = await cloudWatchClient.send(new client_cloudwatch_logs_1.PutLogEventsCommand({
        logGroupName: logGroupName,
        logStreamName: logStreamName,
        logEvents: [
            {
                timestamp: Date.parse(new Date().toISOString()),
                message: `[${createLogEventInput.logLevel}]: ${sub}: ${eventDate} - ${createLogEventInput.message}`
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRlTG9nRXZlbnRSZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL0NyZWF0ZUxvZ0V2ZW50UmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0RBS21DO0FBQ25DLDRFQVN5QztBQUV6Qzs7Ozs7OztHQU9HO0FBQ0ksTUFBTSxjQUFjLEdBQUcsS0FBSyxFQUFFLEdBQVcsRUFBRSxTQUFpQixFQUFFLG1CQUF3QyxFQUE0QixFQUFFO0lBQ3ZJLG9HQUFvRztJQUNwRyxNQUFNLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0lBQzdCLE1BQU0saUJBQWlCLEdBQUcsR0FBRyxTQUFTLENBQUMsV0FBVyxFQUFFLElBQUksU0FBUyxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsSUFBSSxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQztJQUMxRyxNQUFNLGFBQWEsR0FBRyxxQkFBcUIsaUJBQWlCLEVBQUUsQ0FBQztJQUUvRCxJQUFJO1FBQ0EsdUNBQXVDO1FBQ3ZDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVyxDQUFDO1FBRXZDLHVDQUF1QztRQUN2QyxNQUFNLG9CQUFvQixHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0NBQWlDLENBQUM7UUFFM0UsbUNBQW1DO1FBQ25DLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSw2Q0FBb0IsQ0FBQztZQUM5QyxNQUFNLEVBQUUsTUFBTTtTQUNqQixDQUFDLENBQUM7UUFFSDs7Ozs7OztXQU9HO1FBQ0gsTUFBTSwrQkFBK0IsR0FBb0MsTUFBTSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxrREFBeUIsQ0FBQztZQUMzSCxZQUFZLEVBQUUsb0JBQW9CO1lBQ2xDLE9BQU8sRUFBRSxnQ0FBTyxDQUFDLGFBQWE7U0FDakMsQ0FBQyxDQUNMLENBQUM7UUFDRixvR0FBb0c7UUFDcEcsSUFB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Q0YsaUVBQWlFO0lBQ2pFLE9BQU8sQ0FBQyxDQUFDLDRCQUE0QixDQUFDLFNBQVMsQ0FBQyxjQUFjLEtBQUssU0FBUyxJQUFJLDRCQUE0QixDQUFDLFNBQVMsQ0FBQyxjQUFjLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDbkosQ0FBQyxDQUFBO0FBUlksUUFBQSxlQUFlLG1CQVEzQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gICAgQ3JlYXRlTG9nRXZlbnRJbnB1dCxcbiAgICBMb2dnaW5nQWNrbm93bGVkZ21lbnRUeXBlLFxuICAgIExvZ2dpbmdFcnJvclR5cGUsXG4gICAgTG9nZ2luZ1Jlc3BvbnNlXG59IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5pbXBvcnQge1xuICAgIENsb3VkV2F0Y2hMb2dzQ2xpZW50LFxuICAgIENyZWF0ZUxvZ1N0cmVhbUNvbW1hbmQsXG4gICAgQ3JlYXRlTG9nU3RyZWFtQ29tbWFuZE91dHB1dCxcbiAgICBEZXNjcmliZUxvZ1N0cmVhbXNDb21tYW5kLFxuICAgIERlc2NyaWJlTG9nU3RyZWFtc0NvbW1hbmRPdXRwdXQsXG4gICAgT3JkZXJCeSxcbiAgICBQdXRMb2dFdmVudHNDb21tYW5kLFxuICAgIFB1dExvZ0V2ZW50c0NvbW1hbmRPdXRwdXRcbn0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1jbG91ZHdhdGNoLWxvZ3NcIjtcblxuLyoqXG4gKiBDcmVhdGVMb2dFdmVudCByZXNvbHZlclxuICpcbiAqIEBwYXJhbSBzdWIgdGhlIHN1YiByZXByZXNlbnRpbmcgdGhlIGlkZW50aXR5IG9mIHRoZSB1c2VyXG4gKiBAcGFyYW0gZmllbGROYW1lIG5hbWUgb2YgdGhlIHJlc29sdmVyIHBhdGggZnJvbSB0aGUgQXBwU3luYyBldmVudFxuICogQHBhcmFtIGNyZWF0ZUxvZ0V2ZW50SW5wdXQgbG9nZ2luZyBpbnB1dCBvYmplY3QsIHVzZWQgdG8gcG9zdCBhIG5ldyBsb2cgZXZlbnQuXG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIExvZ2dpbmdSZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IGNyZWF0ZUxvZ0V2ZW50ID0gYXN5bmMgKHN1Yjogc3RyaW5nLCBmaWVsZE5hbWU6IHN0cmluZywgY3JlYXRlTG9nRXZlbnRJbnB1dDogQ3JlYXRlTG9nRXZlbnRJbnB1dCk6IFByb21pc2U8TG9nZ2luZ1Jlc3BvbnNlPiA9PiB7XG4gICAgLy8gZ2V0IHRvZGF5J3MgZGF0ZSBpbiB0aGUgZm9ybWF0IG9mIFlZWVktTU0tREQgaW4gb3JkZXIgdG8gdXNlIHRoYXQgZm9ybWF0IGluIHRoZSBsb2cgc3RyZWFtJ3MgbmFtZVxuICAgIGNvbnN0IGRhdGVUb2RheSA9IG5ldyBEYXRlKCk7XG4gICAgY29uc3QgbG9nU3RyZWFtTmFtZURhdGUgPSBgJHtkYXRlVG9kYXkuZ2V0RnVsbFllYXIoKX0tJHtkYXRlVG9kYXkuZ2V0TW9udGgoKSArIDF9LSR7ZGF0ZVRvZGF5LmdldERhdGUoKX1gO1xuICAgIGNvbnN0IGxvZ1N0cmVhbU5hbWUgPSBgbW9vbmJlYW0tZnJvbnRlbmQtJHtsb2dTdHJlYW1OYW1lRGF0ZX1gO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmUgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8vIHJldHJpZXZlIHRoZSBmcm9udGVuZCBsb2cgZ3JvdXAgbmFtZVxuICAgICAgICBjb25zdCBmcm9udGVuZExvZ0dyb3VwTmFtZSA9IHByb2Nlc3MuZW52Lk1PT05CRUFNX0ZST05URU5EX0xPR19HUk9VUF9OQU1FITtcblxuICAgICAgICAvLyBpbml0aWFsaXplIHRoZSBDbG91ZFdhdGNoIGNsaWVudFxuICAgICAgICBjb25zdCBjbG91ZFdhdGNoQ2xpZW50ID0gbmV3IENsb3VkV2F0Y2hMb2dzQ2xpZW50KHtcbiAgICAgICAgICAgIHJlZ2lvbjogcmVnaW9uXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBmaXJzdCBjaGVjayB0byBzZWUgaWYgdGhlcmUgaXMgYSBsb2dnaW5nIHN0cmVhbSBjcmVhdGVkIGZvciB0aGUgY3VycmVudCBkYXkuXG4gICAgICAgICAqIElmIHRoZXJlIGlzIG5vbmUsIHRoZW4gY3JlYXRlIGEgbG9nZ2luZyBzdHJlYW0gZmlyc3QsIGJlZm9yZSBsb2dnaW5nIGFueSBldmVudHMuXG4gICAgICAgICAqXG4gICAgICAgICAqIFRoZSBsaW1pdCBmb3IgdGhlIG51bWJlciBvZiBzdHJlYW1zIHJldHVybmVkIGlzIDUwLCBob3dldmVyLCBzaW5jZSB3ZSBvcmRlciB0aGVcbiAgICAgICAgICogc3RyZWFtcyBieSB0aGUgbGFzdCBsb2cgZXZlbnQgdGltZSwgdGhlbiB3ZSBhcmUgY292ZXJlZCBpbiB0aGlzIHNjZW5hcmlvIHRvIGJlIHN1cmVcbiAgICAgICAgICogdGhhdCB0aGUgbW9zdCByZWNlbnQgNTAgbG9nIHN0cmVhbXMsIG9yZGVyZWQgYnkgdGhlaXIgbG9ncycgbGFzdCBldmVudCB0aW1lcyBhcmUgcmV0dXJuZWQuXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBkZXNjcmliZUxvZ1N0cmVhbXNDb21tYW5kT3V0cHV0OiBEZXNjcmliZUxvZ1N0cmVhbXNDb21tYW5kT3V0cHV0ID0gYXdhaXQgY2xvdWRXYXRjaENsaWVudC5zZW5kKG5ldyBEZXNjcmliZUxvZ1N0cmVhbXNDb21tYW5kKHtcbiAgICAgICAgICAgICAgICBsb2dHcm91cE5hbWU6IGZyb250ZW5kTG9nR3JvdXBOYW1lLFxuICAgICAgICAgICAgICAgIG9yZGVyQnk6IE9yZGVyQnkuTGFzdEV2ZW50VGltZVxuICAgICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICAgICAgLy8gZGVmaW5lIGEgZmxhZyB1c2VkIHRvIGhpZ2hsaWdodCB3aGV0aGVyIHRoZXJlIGlzIGEgbG9nIHN0cmVhbSBhc3NvY2lhdGVkIHdpdGggdG9kYXkncyBkYXRlIG9yIG5vdFxuICAgICAgICBpZiAoZGVzY3JpYmVMb2dTdHJlYW1zQ29tbWFuZE91dHB1dC5sb2dTdHJlYW1zICE9PSB1bmRlZmluZWQgJiYgZGVzY3JpYmVMb2dTdHJlYW1zQ29tbWFuZE91dHB1dC5sb2dTdHJlYW1zLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBpZiB0aGVyZSBhcmUgbG9nIHN0cmVhbXMgYXNzb2NpYXRlZCB3aXRoIHRoZSBmcm9udGVuZCBsb2cgZ3JvdXAsIHRoZW4gc2VhcmNoIHRocm91Z2ggdGhlbSB0byBzZWUgaWYgdGhlcmVcbiAgICAgICAgICAgICAqIGlzIGEgbG9nIHN0cmVhbSBmb3IgdG9kYXkncyBkYXRlLCBhbmQgdGhlbiBtb2RpZnkgdGhlIGZsYWcgYWNjb3JkaW5nbHkuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGxldCBhbHJlYWR5RXhpc3RlbnQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICAgICAgICAgIGRlc2NyaWJlTG9nU3RyZWFtc0NvbW1hbmRPdXRwdXQubG9nU3RyZWFtcy5mb3JFYWNoKHN0cmVhbSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHN0cmVhbS5sb2dTdHJlYW1OYW1lICE9PSB1bmRlZmluZWQgJiYgc3RyZWFtLmxvZ1N0cmVhbU5hbWUuaW5jbHVkZXMobG9nU3RyZWFtTmFtZURhdGUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBTa2lwcGluZyB0aGUgY3JlYXRpb24gb2YgYSBsb2cgc3RyZWFtIGZvciB0b2RheSwgc2luY2UgaXQncyBhbHJlYWR5IGV4aXN0ZW50ICR7c3RyZWFtLmxvZ1N0cmVhbU5hbWV9YCk7XG4gICAgICAgICAgICAgICAgICAgIGFscmVhZHlFeGlzdGVudCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmICghYWxyZWFkeUV4aXN0ZW50KSB7XG4gICAgICAgICAgICAgICAgLy8gaWYgdGhlcmUgaXMgbm8gbG9nIHN0cmVhbSwgdGhlbiBjcmVhdGUgb25lLCBhbmQgdGhlbiBwdXNoIHRoZSBsb2cgZXZlbnQgaW50byBpdC5cbiAgICAgICAgICAgICAgICBjb25zdCBsb2dTdHJlYW1DcmVhdGlvbkZsYWcgPSBhd2FpdCBjcmVhdGVMb2dTdHJlYW0oY2xvdWRXYXRjaENsaWVudCwgZnJvbnRlbmRMb2dHcm91cE5hbWUsIGxvZ1N0cmVhbU5hbWUpO1xuXG4gICAgICAgICAgICAgICAgLy8gbWFrZSBzdXJlIHRoZSBsb2cgc3RyZWFtIGNyZWF0aW9uIHdhcyBzdWNjZXNzZnVsXG4gICAgICAgICAgICAgICAgaWYgKGxvZ1N0cmVhbUNyZWF0aW9uRmxhZykge1xuICAgICAgICAgICAgICAgICAgICAvLyBwdXNoIHRoZSBuZXcgbG9nIGV2ZW50IGludG8gdGhlIHN0cmVhbVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwdXNoTG9nRXZlbnRGbGFnID0gYXdhaXQgcHVzaExvZ0V2ZW50KGRhdGVUb2RheS50b0lTT1N0cmluZygpLCBzdWIsIGNyZWF0ZUxvZ0V2ZW50SW5wdXQsIGNsb3VkV2F0Y2hDbGllbnQsIGZyb250ZW5kTG9nR3JvdXBOYW1lLCBsb2dTdHJlYW1OYW1lKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBtYWtlIHN1cmUgdGhhdCB0aGUgbG9nIGV2ZW50IHB1c2ggd2FzIHN1Y2Nlc3NmdWxcbiAgICAgICAgICAgICAgICAgICAgaWYgKHB1c2hMb2dFdmVudEZsYWcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBMb2cgZXZlbnQgc3VjY2Vzc2Z1bGx5IHB1Ymxpc2hlZGApO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBMb2dnaW5nQWNrbm93bGVkZ21lbnRUeXBlLlN1Y2Nlc3NmdWxcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBFcnJvciB3aGlsZSBwdXNoaW5nIGEgbmV3IGxvZyBldmVudCBpbnRvIHRoZSAke2xvZ1N0cmVhbU5hbWV9IGxvZyBzdHJlYW1gO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogTG9nZ2luZ0Fja25vd2xlZGdtZW50VHlwZS5FcnJvcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IExvZ2dpbmdFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gYW4gZXJyb3IgaW4gY2FzZSB0aGUgbG9nIHN0cmVhbSBjcmVhdGlvbiB3YXMgbm90IHN1Y2Nlc3NmdWxcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYEVycm9yIHdoaWxlIGNyZWF0aW5nIHRoZSBuZXcgbG9nIHN0cmVhbSBmb3IgdGhlIGxvZyBldmVudGA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTG9nZ2luZ0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gaWYgdGhlcmUgaXMgYSBsb2cgc3RyZWFtLCB0aGVuIHB1c2ggdGhlIGxvZyBldmVudCBpbnRvIGl0LlxuICAgICAgICAgICAgICAgIGNvbnN0IHB1c2hMb2dFdmVudEZsYWcgPSBhd2FpdCBwdXNoTG9nRXZlbnQoZGF0ZVRvZGF5LnRvSVNPU3RyaW5nKCksIHN1YiwgY3JlYXRlTG9nRXZlbnRJbnB1dCwgY2xvdWRXYXRjaENsaWVudCwgZnJvbnRlbmRMb2dHcm91cE5hbWUsIGxvZ1N0cmVhbU5hbWUpO1xuXG4gICAgICAgICAgICAgICAgLy8gbWFrZSBzdXJlIHRoYXQgdGhlIGxvZyBldmVudCBwdXNoIHdhcyBzdWNjZXNzZnVsXG4gICAgICAgICAgICAgICAgaWYgKHB1c2hMb2dFdmVudEZsYWcpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYExvZyBldmVudCBzdWNjZXNzZnVsbHkgcHVibGlzaGVkYCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBMb2dnaW5nQWNrbm93bGVkZ21lbnRUeXBlLlN1Y2Nlc3NmdWxcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBFcnJvciB3aGlsZSBwdXNoaW5nIGEgbmV3IGxvZyBldmVudCBpbnRvIHRoZSAke2xvZ1N0cmVhbU5hbWV9IGxvZyBzdHJlYW1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogTG9nZ2luZ0Fja25vd2xlZGdtZW50VHlwZS5FcnJvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBMb2dnaW5nRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gaWYgdGhlcmUgYXJlIG5vIGxvZyBzdHJlYW0gYXNzb2NpYXRlZCB0byB0aGUgZnJvbnRlbmQgbG9nIGdyb3VwLCB0aGVuIGNyZWF0ZSBvbmUsIGFuZCB0aGVuIHB1c2ggdGhlIGxvZyBldmVudCBpbnRvIGl0LlxuICAgICAgICAgICAgY29uc3QgbG9nU3RyZWFtQ3JlYXRpb25GbGFnID0gYXdhaXQgY3JlYXRlTG9nU3RyZWFtKGNsb3VkV2F0Y2hDbGllbnQsIGZyb250ZW5kTG9nR3JvdXBOYW1lLCBsb2dTdHJlYW1OYW1lKTtcblxuICAgICAgICAgICAgLy8gbWFrZSBzdXJlIHRoZSBsb2cgc3RyZWFtIGNyZWF0aW9uIHdhcyBzdWNjZXNzZnVsXG4gICAgICAgICAgICBpZiAobG9nU3RyZWFtQ3JlYXRpb25GbGFnKSB7XG4gICAgICAgICAgICAgICAgLy8gcHVzaCB0aGUgbmV3IGxvZyBldmVudCBpbnRvIHRoZSBzdHJlYW1cbiAgICAgICAgICAgICAgICBjb25zdCBwdXNoTG9nRXZlbnRGbGFnID0gYXdhaXQgcHVzaExvZ0V2ZW50KGRhdGVUb2RheS50b0lTT1N0cmluZygpLCBzdWIsIGNyZWF0ZUxvZ0V2ZW50SW5wdXQsIGNsb3VkV2F0Y2hDbGllbnQsIGZyb250ZW5kTG9nR3JvdXBOYW1lLCBsb2dTdHJlYW1OYW1lKTtcblxuICAgICAgICAgICAgICAgIC8vIG1ha2Ugc3VyZSB0aGF0IHRoZSBsb2cgZXZlbnQgcHVzaCB3YXMgc3VjY2Vzc2Z1bFxuICAgICAgICAgICAgICAgIGlmIChwdXNoTG9nRXZlbnRGbGFnKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBMb2cgZXZlbnQgc3VjY2Vzc2Z1bGx5IHB1Ymxpc2hlZGApO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogTG9nZ2luZ0Fja25vd2xlZGdtZW50VHlwZS5TdWNjZXNzZnVsXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgRXJyb3Igd2hpbGUgcHVzaGluZyBhIG5ldyBsb2cgZXZlbnQgaW50byB0aGUgJHtsb2dTdHJlYW1OYW1lfSBsb2cgc3RyZWFtYDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IExvZ2dpbmdBY2tub3dsZWRnbWVudFR5cGUuRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTG9nZ2luZ0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gcmV0dXJuIGFuIGVycm9yIGluIGNhc2UgdGhlIGxvZyBzdHJlYW0gY3JlYXRpb24gd2FzIG5vdCBzdWNjZXNzZnVsXG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYEVycm9yIHdoaWxlIGNyZWF0aW5nIHRoZSBuZXcgbG9nIHN0cmVhbSBmb3IgdGhlIGxvZyBldmVudGA7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBMb2dnaW5nRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAvLyByZXRyaWV2ZSB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLy8gaW5pdGlhbGl6ZSB0aGUgQ2xvdWRXYXRjaCBjbGllbnRcbiAgICAgICAgY29uc3QgY2xvdWRXYXRjaENsaWVudCA9IG5ldyBDbG91ZFdhdGNoTG9nc0NsaWVudCh7XG4gICAgICAgICAgICByZWdpb246IHJlZ2lvblxuICAgICAgICB9KTtcblxuICAgICAgICAvLyByZXRyaWV2ZSB0aGUgZnJvbnRlbmQgbG9nIGdyb3VwIG5hbWVcbiAgICAgICAgY29uc3QgZnJvbnRlbmRMb2dHcm91cE5hbWUgPSBwcm9jZXNzLmVudi5NT09OQkVBTV9GUk9OVEVORF9MT0dfR1JPVVBfTkFNRSE7XG5cbiAgICAgICAgLy8gbWFrZSBzdXJlIHRoYXQgdGhlcmUgaXMgbm8gcmVzb3VyY2UgYWxyZWFkeSBleGlzdGVudCBleGNlcHRpb24sIGFuZCBpZiB0aGVyZSBpcyB0aGVuIGp1c3QgcHVzaCB0aGUgZXZlbnQgaW4gdGhlIGxvZyBzdHJlYW1cbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICBpZiAoZXJyLmNvZGUgJiYgZXJyLmNvZGUgPT09ICdSZXNvdXJjZUFscmVhZHlFeGlzdHNFeGNlcHRpb24nICYmIGVyci5tZXNzYWdlICYmIGVyci5tZXNzYWdlLmNvbnRhaW5zKCdUaGUgc3BlY2lmaWVkIGxvZyBzdHJlYW0gYWxyZWFkeSBleGlzdHMnKSkge1xuICAgICAgICAgICAgLy8gcHVzaCB0aGUgbmV3IGxvZyBldmVudCBpbnRvIHRoZSBzdHJlYW1cbiAgICAgICAgICAgIGNvbnN0IHB1c2hMb2dFdmVudEZsYWcgPSBhd2FpdCBwdXNoTG9nRXZlbnQoZGF0ZVRvZGF5LnRvSVNPU3RyaW5nKCksIHN1YiwgY3JlYXRlTG9nRXZlbnRJbnB1dCwgY2xvdWRXYXRjaENsaWVudCwgZnJvbnRlbmRMb2dHcm91cE5hbWUsIGxvZ1N0cmVhbU5hbWUpO1xuXG4gICAgICAgICAgICAvLyBtYWtlIHN1cmUgdGhhdCB0aGUgbG9nIGV2ZW50IHB1c2ggd2FzIHN1Y2Nlc3NmdWxcbiAgICAgICAgICAgIGlmIChwdXNoTG9nRXZlbnRGbGFnKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYExvZyBldmVudCBzdWNjZXNzZnVsbHkgcHVibGlzaGVkYCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogTG9nZ2luZ0Fja25vd2xlZGdtZW50VHlwZS5TdWNjZXNzZnVsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgRXJyb3Igd2hpbGUgcHVzaGluZyBhIG5ldyBsb2cgZXZlbnQgaW50byB0aGUgJHtsb2dTdHJlYW1OYW1lfSBsb2cgc3RyZWFtYDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IExvZ2dpbmdBY2tub3dsZWRnbWVudFR5cGUuRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IExvZ2dpbmdFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgJHtmaWVsZE5hbWV9IG11dGF0aW9uICR7ZXJyfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IExvZ2dpbmdFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdXNlZCB0byBwdXNoIGEgbG9nIGV2ZW50IGludG8gYSBwYXJ0aWN1bGFyIGxvZyBzdHJlYW0sIGJlbG9uZ2luZyB0byBhIGxvZyBncm91cC5cbiAqXG4gKiBAcGFyYW0gZXZlbnREYXRlIGRhdGUgZm9yIHRoZSBsb2cgZXZlbnRcbiAqIEBwYXJhbSBzdWIgdGhlIHN1YiByZXByZXNlbnRpbmcgdGhlIGlkZW50aXR5IG9mIHRoZSB1c2VyXG4gKiBAcGFyYW0gY3JlYXRlTG9nRXZlbnRJbnB1dCB0aGUgbG9nIGV2ZW50IGlucHV0IGNvbnRhaW5pbmcgYWxsIHRoZSBpbmZvcm1hdGlvbiBhc3NvY2lhdGVkIHRvIHRoZSBuZXdseVxuICogY3JlYXRlZCBsb2cgZXZlbnRcbiAqIEBwYXJhbSBjbG91ZFdhdGNoQ2xpZW50IHRoZSBjbG91ZHdhdGNoIGNsaWVudCB1c2VkIHRvIHB1c2ggYSBuZXcgbG9nIGV2ZW50XG4gKiBAcGFyYW0gbG9nR3JvdXBOYW1lIHRoZSBsb2cgZ3JvdXAgbmFtZSBjb250YWluaW5nIHRoZSBsb2cgc3RyZWFtIHRoYXQgd2lsbCBob3VzZSB0aGUgbmV3bHkgcHVzaGVkIGxvZyBldmVudCBpbnRvXG4gKiBAcGFyYW0gbG9nU3RyZWFtTmFtZSB0aGUgbG9nIHN0cmVhbSBuYW1lIHVzZWQgdG8gcHVzaCBhIG5ldyBsb2cgZXZlbnQgaW50b1xuICovXG5leHBvcnQgY29uc3QgcHVzaExvZ0V2ZW50ID0gYXN5bmMgKGV2ZW50RGF0ZTogc3RyaW5nLCBzdWI6IHN0cmluZywgY3JlYXRlTG9nRXZlbnRJbnB1dDogQ3JlYXRlTG9nRXZlbnRJbnB1dCwgY2xvdWRXYXRjaENsaWVudDogQ2xvdWRXYXRjaExvZ3NDbGllbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ0dyb3VwTmFtZTogc3RyaW5nLCBsb2dTdHJlYW1OYW1lOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgICAvLyBwcm9jZWVkIGJ5IHB1c2hpbmcgdGhlIGxvZyBldmVudCBpbnRvIHRoZSBsb2cgc3RyZWFtXG4gICAgY29uc3QgcHV0TG9nRXZlbnRzQ29tbWFuZE91dHB1dDogUHV0TG9nRXZlbnRzQ29tbWFuZE91dHB1dCA9IGF3YWl0IGNsb3VkV2F0Y2hDbGllbnQuc2VuZChuZXcgUHV0TG9nRXZlbnRzQ29tbWFuZCh7XG4gICAgICAgICAgICBsb2dHcm91cE5hbWU6IGxvZ0dyb3VwTmFtZSxcbiAgICAgICAgICAgIGxvZ1N0cmVhbU5hbWU6IGxvZ1N0cmVhbU5hbWUsXG4gICAgICAgICAgICBsb2dFdmVudHM6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5wYXJzZShuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkpLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBgWyR7Y3JlYXRlTG9nRXZlbnRJbnB1dC5sb2dMZXZlbH1dOiAke3N1Yn06ICR7ZXZlbnREYXRlfSAtICR7Y3JlYXRlTG9nRXZlbnRJbnB1dC5tZXNzYWdlfWBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdXG4gICAgICAgIH0pXG4gICAgKTtcbiAgICByZXR1cm4gcHV0TG9nRXZlbnRzQ29tbWFuZE91dHB1dC4kbWV0YWRhdGEuaHR0cFN0YXR1c0NvZGUgIT09IHVuZGVmaW5lZCAmJiBwdXRMb2dFdmVudHNDb21tYW5kT3V0cHV0LiRtZXRhZGF0YS5odHRwU3RhdHVzQ29kZSA9PT0gMjAwO1xufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHVzZWQgdG8gY3JlYXRlIGEgbmV3IGxvZyBzdHJlYW0uXG4gKlxuICogQHBhcmFtIGNsb3VkV2F0Y2hDbGllbnQgdGhlIGNsb3Vkd2F0Y2ggY2xpZW50IHVzZWQgdG8gY3JlYXRlIGEgbmV3IGxvZyBzdHJlYW0uXG4gKiBAcGFyYW0gbG9nR3JvdXBOYW1lIHRoZSBuYW1lIG9mIHRoZSBsb2cgZ3JvdXAgdG8gY29udGFpbiB0aGUgbmV3bHkgY3JlYXRlZCBsb2cgc3RyZWFtLlxuICogQHBhcmFtIGxvZ1N0cmVhbU5hbWUgdGhlIG5hbWUgb2YgdGhlIG5ld2x5IGNyZWF0ZWQgbG9nIHN0cmVhbVxuICpcbiAqIEByZXR1cm4gYSB7QGxpbmsgUHJvbWlzZX0gb2YgYSB7QGxpbmsgYm9vbGVhbn0gcmVwcmVzZW50aW5nIGEgZmxhZ1xuICogaGlnaGxpZ2h0aW5nIHdoZXRoZXIgdGhlIGxvZyBzdHJlYW0gd2FzIHN1Y2Nlc3NmdWxseSBjcmVhdGVkIG9yIG5vdC5cbiAqL1xuZXhwb3J0IGNvbnN0IGNyZWF0ZUxvZ1N0cmVhbSA9IGFzeW5jIChjbG91ZFdhdGNoQ2xpZW50OiBDbG91ZFdhdGNoTG9nc0NsaWVudCwgbG9nR3JvdXBOYW1lOiBzdHJpbmcsIGxvZ1N0cmVhbU5hbWU6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgIGNvbnN0IGNyZWF0ZUxvZ1N0cmVhbUNvbW1hbmRPdXRwdXQ6IENyZWF0ZUxvZ1N0cmVhbUNvbW1hbmRPdXRwdXQgPSBhd2FpdCBjbG91ZFdhdGNoQ2xpZW50LnNlbmQobmV3IENyZWF0ZUxvZ1N0cmVhbUNvbW1hbmQoe1xuICAgICAgICAgICAgbG9nR3JvdXBOYW1lOiBsb2dHcm91cE5hbWUsXG4gICAgICAgICAgICBsb2dTdHJlYW1OYW1lOiBsb2dTdHJlYW1OYW1lXG4gICAgICAgIH0pXG4gICAgKTtcbiAgICAvLyBjaGVjayB0byBtYWtlIHN1cmUgdGhhdCB0aGUgbG9nIHN0cmVhbSBjcmVhdGlvbiB3YXMgc3VjY2Vzc2Z1bFxuICAgIHJldHVybiAhKGNyZWF0ZUxvZ1N0cmVhbUNvbW1hbmRPdXRwdXQuJG1ldGFkYXRhLmh0dHBTdGF0dXNDb2RlID09PSB1bmRlZmluZWQgfHwgY3JlYXRlTG9nU3RyZWFtQ29tbWFuZE91dHB1dC4kbWV0YWRhdGEuaHR0cFN0YXR1c0NvZGUgIT09IDIwMCk7XG59XG4iXX0=