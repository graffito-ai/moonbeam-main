/**
 * Function used to handle the daily notification reminder trigger, by first
 * determining whether a notification reminder needs to be sent out, and by
 * kick-starting that process for any applicable users, accordingly.
 */
export declare const triggerNotificationReminder: () => Promise<void>;
/**
 * Function used to timeout/sleep for a particular number of milliseconds
 *
 * @param ms number of milliseconds to timeout for.
 */
export declare const sleep: (ms: number) => Promise<unknown>;
