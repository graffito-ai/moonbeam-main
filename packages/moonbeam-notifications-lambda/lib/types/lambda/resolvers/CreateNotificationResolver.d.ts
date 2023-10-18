import { CreateNotificationInput, CreateNotificationResponse } from "@moonbeam/moonbeam-models";
/**
 * CreateNotification resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param createNotificationInput create notifications input object, used to create a notification
 * based on an event (reimbursement, transaction, card expiration, successful registration).
 * @returns {@link Promise} of {@link CreateNotificationResponse}
 */
export declare const createNotification: (fieldName: string, createNotificationInput: CreateNotificationInput) => Promise<CreateNotificationResponse>;
