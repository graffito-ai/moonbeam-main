"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLogEvent = void 0;
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
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // retrieving the frontend log group name
        const frontendLogGroupName = process.env.MOONBEAM_FRONTEND_LOG_GROUP_NAME;
        // initialize the CloudWatch client
        const cloudWatchClient = new client_cloudwatch_logs_1.CloudWatchLogsClient({
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
        const describeLogStreamsCommandOutput = await cloudWatchClient.send(new client_cloudwatch_logs_1.DescribeLogStreamsCommand({
            logGroupName: frontendLogGroupName,
            orderBy: client_cloudwatch_logs_1.OrderBy.LastEventTime
        }));
        // define a flag used to highlight whether there is a log stream associated with today's date or not
        let alreadyExistent = false;
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
            const createLogStreamCommandOutput = await cloudWatchClient.send(new client_cloudwatch_logs_1.CreateLogStreamCommand({
                logGroupName: frontendLogGroupName,
                logStreamName: logStreamName
            }));
            // check to make sure that the log stream creation was successful
            if (createLogStreamCommandOutput.$metadata.httpStatusCode === undefined || createLogStreamCommandOutput.$metadata.httpStatusCode !== 200) {
                const errorMessage = `Error while creating the new log stream for the log event`;
                console.log(`${errorMessage} - ${createLogStreamCommandOutput.$metadata.httpStatusCode}`);
                return {
                    errorMessage: errorMessage,
                    errorType: moonbeam_models_1.LoggingErrorType.UnexpectedError
                };
            }
        }
        // proceed by pushing the log event into the log stream
        const putLogEventsCommandOutput = await cloudWatchClient.send(new client_cloudwatch_logs_1.PutLogEventsCommand({
            logGroupName: frontendLogGroupName,
            logStreamName: logStreamName,
            logEvents: [
                {
                    timestamp: Date.parse(new Date().toISOString()),
                    message: `[${createLogEventInput.logLevel}] - ${createLogEventInput.message}`
                }
            ]
        }));
        if (putLogEventsCommandOutput.$metadata.httpStatusCode !== undefined && putLogEventsCommandOutput.$metadata.httpStatusCode === 200) {
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
    catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: moonbeam_models_1.LoggingErrorType.UnexpectedError
        };
    }
};
exports.createLogEvent = createLogEvent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRlTG9nRXZlbnRSZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL0NyZWF0ZUxvZ0V2ZW50UmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0RBS21DO0FBQ25DLDRFQVN5QztBQUV6Qzs7Ozs7O0dBTUc7QUFDSSxNQUFNLGNBQWMsR0FBRyxLQUFLLEVBQUUsU0FBaUIsRUFBRSxtQkFBd0MsRUFBNEIsRUFBRTtJQUMxSCxJQUFJO1FBQ0EseUNBQXlDO1FBQ3pDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVyxDQUFDO1FBRXZDLHlDQUF5QztRQUN6QyxNQUFNLG9CQUFvQixHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0NBQWlDLENBQUM7UUFFM0UsbUNBQW1DO1FBQ25DLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSw2Q0FBb0IsQ0FBQztZQUM5QyxNQUFNLEVBQUUsTUFBTTtTQUNqQixDQUFDLENBQUM7UUFFSCxvR0FBb0c7UUFDcEcsTUFBTSxTQUFTLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUM3QixNQUFNLGlCQUFpQixHQUFHLEdBQUcsU0FBUyxDQUFDLFdBQVcsRUFBRSxJQUFJLFNBQVMsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLElBQUksU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUM7UUFDMUcsTUFBTSxhQUFhLEdBQUcscUJBQXFCLGlCQUFpQixFQUFFLENBQUM7UUFFL0Q7Ozs7Ozs7V0FPRztRQUNILE1BQU0sK0JBQStCLEdBQW9DLE1BQU0sZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksa0RBQXlCLENBQUM7WUFDM0gsWUFBWSxFQUFFLG9CQUFvQjtZQUNsQyxPQUFPLEVBQUUsZ0NBQU8sQ0FBQyxhQUFhO1NBQ2pDLENBQUMsQ0FDTCxDQUFDO1FBQ0Ysb0dBQW9HO1FBQ3BHLElBQUksZUFBZSxHQUFZ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QUFjLGtCQXFHMUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICAgIENyZWF0ZUxvZ0V2ZW50SW5wdXQsXG4gICAgTG9nZ2luZ0Fja25vd2xlZGdtZW50VHlwZSxcbiAgICBMb2dnaW5nRXJyb3JUeXBlLFxuICAgIExvZ2dpbmdSZXNwb25zZVxufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuaW1wb3J0IHtcbiAgICBDbG91ZFdhdGNoTG9nc0NsaWVudCxcbiAgICBDcmVhdGVMb2dTdHJlYW1Db21tYW5kLFxuICAgIENyZWF0ZUxvZ1N0cmVhbUNvbW1hbmRPdXRwdXQsXG4gICAgRGVzY3JpYmVMb2dTdHJlYW1zQ29tbWFuZCxcbiAgICBEZXNjcmliZUxvZ1N0cmVhbXNDb21tYW5kT3V0cHV0LFxuICAgIE9yZGVyQnksXG4gICAgUHV0TG9nRXZlbnRzQ29tbWFuZCxcbiAgICBQdXRMb2dFdmVudHNDb21tYW5kT3V0cHV0XG59IGZyb20gXCJAYXdzLXNkay9jbGllbnQtY2xvdWR3YXRjaC1sb2dzXCI7XG5cbi8qKlxuICogQ3JlYXRlTG9nRXZlbnQgcmVzb2x2ZXJcbiAqXG4gKiBAcGFyYW0gZmllbGROYW1lIG5hbWUgb2YgdGhlIHJlc29sdmVyIHBhdGggZnJvbSB0aGUgQXBwU3luYyBldmVudFxuICogQHBhcmFtIGNyZWF0ZUxvZ0V2ZW50SW5wdXQgbG9nZ2luZyBpbnB1dCBvYmplY3QsIHVzZWQgdG8gcG9zdCBhIG5ldyBsb2cgZXZlbnQuXG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIExvZ2dpbmdSZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IGNyZWF0ZUxvZ0V2ZW50ID0gYXN5bmMgKGZpZWxkTmFtZTogc3RyaW5nLCBjcmVhdGVMb2dFdmVudElucHV0OiBDcmVhdGVMb2dFdmVudElucHV0KTogUHJvbWlzZTxMb2dnaW5nUmVzcG9uc2U+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OITtcblxuICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBmcm9udGVuZCBsb2cgZ3JvdXAgbmFtZVxuICAgICAgICBjb25zdCBmcm9udGVuZExvZ0dyb3VwTmFtZSA9IHByb2Nlc3MuZW52Lk1PT05CRUFNX0ZST05URU5EX0xPR19HUk9VUF9OQU1FITtcblxuICAgICAgICAvLyBpbml0aWFsaXplIHRoZSBDbG91ZFdhdGNoIGNsaWVudFxuICAgICAgICBjb25zdCBjbG91ZFdhdGNoQ2xpZW50ID0gbmV3IENsb3VkV2F0Y2hMb2dzQ2xpZW50KHtcbiAgICAgICAgICAgIHJlZ2lvbjogcmVnaW9uXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIGdldCB0b2RheSdzIGRhdGUgaW4gdGhlIGZvcm1hdCBvZiBZWVlZLU1NLUREIGluIG9yZGVyIHRvIHVzZSB0aGF0IGZvcm1hdCBpbiB0aGUgbG9nIHN0cmVhbSdzIG5hbWVcbiAgICAgICAgY29uc3QgZGF0ZVRvZGF5ID0gbmV3IERhdGUoKTtcbiAgICAgICAgY29uc3QgbG9nU3RyZWFtTmFtZURhdGUgPSBgJHtkYXRlVG9kYXkuZ2V0RnVsbFllYXIoKX0tJHtkYXRlVG9kYXkuZ2V0TW9udGgoKSArIDF9LSR7ZGF0ZVRvZGF5LmdldERhdGUoKX1gO1xuICAgICAgICBjb25zdCBsb2dTdHJlYW1OYW1lID0gYG1vb25iZWFtLWZyb250ZW5kLSR7bG9nU3RyZWFtTmFtZURhdGV9YDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogZmlyc3QgY2hlY2sgdG8gc2VlIGlmIHRoZXJlIGlzIGEgbG9nZ2luZyBzdHJlYW0gY3JlYXRlZCBmb3IgdGhlIGN1cnJlbnQgZGF5LlxuICAgICAgICAgKiBJZiB0aGVyZSBpcyBub25lLCB0aGVuIGNyZWF0ZSBhIGxvZ2dpbmcgc3RyZWFtIGZpcnN0LCBiZWZvcmUgbG9nZ2luZyBhbnkgZXZlbnRzLlxuICAgICAgICAgKlxuICAgICAgICAgKiBUaGUgbGltaXQgZm9yIHRoZSBudW1iZXIgb2Ygc3RyZWFtcyByZXR1cm5lZCBpcyA1MCwgaG93ZXZlciwgc2luY2Ugd2Ugb3JkZXIgdGhlXG4gICAgICAgICAqIHN0cmVhbXMgYnkgdGhlIGxhc3QgbG9nIGV2ZW50IHRpbWUsIHRoZW4gd2UgYXJlIGNvdmVyZWQgaW4gdGhpcyBzY2VuYXJpbyB0byBiZSBzdXJlXG4gICAgICAgICAqIHRoYXQgdGhlIG1vc3QgcmVjZW50IDUwIGxvZyBzdHJlYW1zLCBvcmRlcmVkIGJ5IHRoZWlyIGxvZ3MnIGxhc3QgZXZlbnQgdGltZXMgYXJlIHJldHVybmVkLlxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgZGVzY3JpYmVMb2dTdHJlYW1zQ29tbWFuZE91dHB1dDogRGVzY3JpYmVMb2dTdHJlYW1zQ29tbWFuZE91dHB1dCA9IGF3YWl0IGNsb3VkV2F0Y2hDbGllbnQuc2VuZChuZXcgRGVzY3JpYmVMb2dTdHJlYW1zQ29tbWFuZCh7XG4gICAgICAgICAgICAgICAgbG9nR3JvdXBOYW1lOiBmcm9udGVuZExvZ0dyb3VwTmFtZSxcbiAgICAgICAgICAgICAgICBvcmRlckJ5OiBPcmRlckJ5Lkxhc3RFdmVudFRpbWVcbiAgICAgICAgICAgIH0pXG4gICAgICAgICk7XG4gICAgICAgIC8vIGRlZmluZSBhIGZsYWcgdXNlZCB0byBoaWdobGlnaHQgd2hldGhlciB0aGVyZSBpcyBhIGxvZyBzdHJlYW0gYXNzb2NpYXRlZCB3aXRoIHRvZGF5J3MgZGF0ZSBvciBub3RcbiAgICAgICAgbGV0IGFscmVhZHlFeGlzdGVudDogYm9vbGVhbiA9IGZhbHNlO1xuICAgICAgICBpZiAoZGVzY3JpYmVMb2dTdHJlYW1zQ29tbWFuZE91dHB1dC5sb2dTdHJlYW1zICE9PSB1bmRlZmluZWQgJiYgZGVzY3JpYmVMb2dTdHJlYW1zQ29tbWFuZE91dHB1dC5sb2dTdHJlYW1zLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBpZiB0aGVyZSBhcmUgbG9nIHN0cmVhbXMgYXNzb2NpYXRlZCB3aXRoIHRoZSBmcm9udGVuZCBsb2cgZ3JvdXAsIHRoZW4gc2VhcmNoIHRocm91Z2ggdGhlbSB0byBzZWUgaWYgdGhlcmVcbiAgICAgICAgICAgICAqIGlzIGEgbG9nIHN0cmVhbSBmb3IgdG9kYXkncyBkYXRlLCBhbmQgdGhlbiBtb2RpZnkgdGhlIGZsYWcgYWNjb3JkaW5nbHkuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGRlc2NyaWJlTG9nU3RyZWFtc0NvbW1hbmRPdXRwdXQubG9nU3RyZWFtcy5mb3JFYWNoKHN0cmVhbSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHN0cmVhbS5sb2dTdHJlYW1OYW1lICE9PSB1bmRlZmluZWQgJiYgc3RyZWFtLmxvZ1N0cmVhbU5hbWUuaW5jbHVkZXMobG9nU3RyZWFtTmFtZURhdGUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBTa2lwcGluZyB0aGUgY3JlYXRpb24gb2YgYSBsb2cgc3RyZWFtIGZvciB0b2RheSwgc2luY2UgaXQncyBhbHJlYWR5IGV4aXN0ZW50ICR7c3RyZWFtLmxvZ1N0cmVhbU5hbWV9YCk7XG4gICAgICAgICAgICAgICAgICAgIGFscmVhZHlFeGlzdGVudCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogaWYgd2UgbmVlZCB0byBjcmVhdGUgYSBuZXcgbG9nIHN0cmVhbSwgZG8gc28gYWNjb3JkaW5nbHkgYW5kIHRoZW4gcHVzaCB0aGUgbG9nIGV2ZW50IGluIGl0LFxuICAgICAgICAgKiBvdGhlcndpc2UgcHJvY2VlZCBieSBwdXNoaW5nIHRoZSBsb2cgZXZlbnQgaW4gaXQuXG4gICAgICAgICAqL1xuICAgICAgICBpZiAoIWFscmVhZHlFeGlzdGVudCkge1xuICAgICAgICAgICAgY29uc3QgY3JlYXRlTG9nU3RyZWFtQ29tbWFuZE91dHB1dDogQ3JlYXRlTG9nU3RyZWFtQ29tbWFuZE91dHB1dCA9IGF3YWl0IGNsb3VkV2F0Y2hDbGllbnQuc2VuZChuZXcgQ3JlYXRlTG9nU3RyZWFtQ29tbWFuZCh7XG4gICAgICAgICAgICAgICAgICAgIGxvZ0dyb3VwTmFtZTogZnJvbnRlbmRMb2dHcm91cE5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGxvZ1N0cmVhbU5hbWU6IGxvZ1N0cmVhbU5hbWVcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSBsb2cgc3RyZWFtIGNyZWF0aW9uIHdhcyBzdWNjZXNzZnVsXG4gICAgICAgICAgICBpZiAoY3JlYXRlTG9nU3RyZWFtQ29tbWFuZE91dHB1dC4kbWV0YWRhdGEuaHR0cFN0YXR1c0NvZGUgPT09IHVuZGVmaW5lZCB8fCBjcmVhdGVMb2dTdHJlYW1Db21tYW5kT3V0cHV0LiRtZXRhZGF0YS5odHRwU3RhdHVzQ29kZSAhPT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYEVycm9yIHdoaWxlIGNyZWF0aW5nIHRoZSBuZXcgbG9nIHN0cmVhbSBmb3IgdGhlIGxvZyBldmVudGA7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfSAtICR7Y3JlYXRlTG9nU3RyZWFtQ29tbWFuZE91dHB1dC4kbWV0YWRhdGEuaHR0cFN0YXR1c0NvZGV9YCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTG9nZ2luZ0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBwcm9jZWVkIGJ5IHB1c2hpbmcgdGhlIGxvZyBldmVudCBpbnRvIHRoZSBsb2cgc3RyZWFtXG4gICAgICAgIGNvbnN0IHB1dExvZ0V2ZW50c0NvbW1hbmRPdXRwdXQ6IFB1dExvZ0V2ZW50c0NvbW1hbmRPdXRwdXQgPSBhd2FpdCBjbG91ZFdhdGNoQ2xpZW50LnNlbmQobmV3IFB1dExvZ0V2ZW50c0NvbW1hbmQoe1xuICAgICAgICAgICAgICAgIGxvZ0dyb3VwTmFtZTogZnJvbnRlbmRMb2dHcm91cE5hbWUsXG4gICAgICAgICAgICAgICAgbG9nU3RyZWFtTmFtZTogbG9nU3RyZWFtTmFtZSxcbiAgICAgICAgICAgICAgICBsb2dFdmVudHM6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiBEYXRlLnBhcnNlKG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBgWyR7Y3JlYXRlTG9nRXZlbnRJbnB1dC5sb2dMZXZlbH1dIC0gJHtjcmVhdGVMb2dFdmVudElucHV0Lm1lc3NhZ2V9YFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKHB1dExvZ0V2ZW50c0NvbW1hbmRPdXRwdXQuJG1ldGFkYXRhLmh0dHBTdGF0dXNDb2RlICE9PSB1bmRlZmluZWQgJiYgcHV0TG9nRXZlbnRzQ29tbWFuZE91dHB1dC4kbWV0YWRhdGEuaHR0cFN0YXR1c0NvZGUgPT09IDIwMCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYExvZyBldmVudCBzdWNjZXNzZnVsbHkgcHVibGlzaGVkYCk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRhdGE6IExvZ2dpbmdBY2tub3dsZWRnbWVudFR5cGUuU3VjY2Vzc2Z1bFxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYEVycm9yIHdoaWxlIHB1c2hpbmcgYSBuZXcgbG9nIGV2ZW50IGludG8gdGhlICR7bG9nU3RyZWFtTmFtZX0gbG9nIHN0cmVhbWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBkYXRhOiBMb2dnaW5nQWNrbm93bGVkZ21lbnRUeXBlLkVycm9yLFxuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTG9nZ2luZ0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgJHtmaWVsZE5hbWV9IG11dGF0aW9uICR7ZXJyfWA7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgIGVycm9yVHlwZTogTG9nZ2luZ0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==