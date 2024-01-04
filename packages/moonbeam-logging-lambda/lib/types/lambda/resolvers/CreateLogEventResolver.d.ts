import { CreateLogEventInput, LoggingResponse } from "@moonbeam/moonbeam-models";
import { CloudWatchLogsClient } from "@aws-sdk/client-cloudwatch-logs";
/**
 * CreateLogEvent resolver
 *
 * @param sub the sub representing the identity of the user
 * @param fieldName name of the resolver path from the AppSync event
 * @param createLogEventInput logging input object, used to post a new log event.
 * @returns {@link Promise} of {@link LoggingResponse}
 */
export declare const createLogEvent: (sub: string, fieldName: string, createLogEventInput: CreateLogEventInput) => Promise<LoggingResponse>;
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
export declare const pushLogEvent: (eventDate: string, sub: string, createLogEventInput: CreateLogEventInput, cloudWatchClient: CloudWatchLogsClient, logGroupName: string, logStreamName: string) => Promise<boolean>;
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
export declare const createLogStream: (cloudWatchClient: CloudWatchLogsClient, logGroupName: string, logStreamName: string) => Promise<boolean>;
