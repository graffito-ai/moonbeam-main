import { CreateLogEventInput, LoggingResponse } from "@moonbeam/moonbeam-models";
/**
 * CreateLogEvent resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param createLogEventInput logging input object, used to post a new log event.
 * @returns {@link Promise} of {@link LoggingResponse}
 */
export declare const createLogEvent: (fieldName: string, createLogEventInput: CreateLogEventInput) => Promise<LoggingResponse>;
