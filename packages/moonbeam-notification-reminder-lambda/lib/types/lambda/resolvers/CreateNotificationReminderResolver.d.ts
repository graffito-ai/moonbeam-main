import { CreateNotificationReminderInput, NotificationReminderResponse } from "@moonbeam/moonbeam-models";
/**
 * CreateNotificationReminder resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param createNotificationReminderInput Notification Reminder input object, used to create a new Notification Reminder object.
 * @returns {@link Promise} of {@link NotificationReminderResponse}
 */
export declare const createNotificationReminder: (fieldName: string, createNotificationReminderInput: CreateNotificationReminderInput) => Promise<NotificationReminderResponse>;
