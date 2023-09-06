import { BaseAPIClient } from "./BaseAPIClient";
import { NotificationResponse, SendEmailNotificationInput, SendMobilePushNotificationInput } from "../GraphqlExports";
/**
 * Class used as the base/generic client for all Courier/notification-related calls.
 */
export declare class CourierClient extends BaseAPIClient {
    /**
     * Generic constructor for the client.
     *
     * @param environment the AWS environment passed in from the Lambda resolver.
     * @param region the AWS region passed in from the Lambda resolver.
     */
    constructor(environment: string, region: string);
    /**
     * Function used to send a mobile push notification.
     *
     * @param sendMobilePushNotificationInput the notification input details to be passed in, in order to send
     * a mobile push notification
     *
     * @returns a {@link NotificationResponse} representing the Courier notification response
     *
     * @protected
     */
    sendMobilePushNotification(sendMobilePushNotificationInput: SendMobilePushNotificationInput): Promise<NotificationResponse>;
    /**
     * Function used to send an email notification.
     *
     * @param sendEmailNotificationInput the notification input details to be passed in, in order to send
     * an email notification
     *
     * @returns a {@link NotificationResponse} representing the Courier notification response
     */
    sendEmailNotification(sendEmailNotificationInput: SendEmailNotificationInput): Promise<NotificationResponse>;
}
