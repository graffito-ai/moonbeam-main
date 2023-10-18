import { NotificationReminderResponse, UpdateNotificationReminderInput } from "@moonbeam/moonbeam-models";
/**
 * UpdateNotificationReminder resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param updateNotificationReminderInput Notification Reminder input object, used to update an existent Notification Reminder object.
 * @returns {@link Promise} of {@link NotificationReminderResponse}
 */
export declare const updateNotificationReminder: (fieldName: string, updateNotificationReminderInput: UpdateNotificationReminderInput) => Promise<NotificationReminderResponse>;
