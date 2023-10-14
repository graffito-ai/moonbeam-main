import {AttributeValue, DynamoDBClient, GetItemCommand, PutItemCommand} from "@aws-sdk/client-dynamodb";
import {
    CreateNotificationReminderInput,
    NotificationReminder,
    NotificationReminderErrorType,
    NotificationReminderResponse
} from "@moonbeam/moonbeam-models";
import {v4 as uuidv4} from 'uuid';

/**
 * CreateNotificationReminder resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param createNotificationReminderInput Notification Reminder input object, used to create a new Notification Reminder object.
 * @returns {@link Promise} of {@link NotificationReminderResponse}
 */
export const createNotificationReminder = async (fieldName: string, createNotificationReminderInput: CreateNotificationReminderInput): Promise<NotificationReminderResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the DynamoDB document client
        const dynamoDbClient = new DynamoDBClient({region: region});

        // update the timestamps accordingly
        const createdAt = new Date().toISOString();
        createNotificationReminderInput.createdAt = createNotificationReminderInput.createdAt ? createNotificationReminderInput.createdAt : createdAt;
        createNotificationReminderInput.updatedAt = createNotificationReminderInput.updatedAt ? createNotificationReminderInput.updatedAt : createdAt;

        /**
         * check to see if there is an existing Notification Reminder with the same ID, in case there is
         * an id passed in.
         */
        const preExistingNotificationReminder = createNotificationReminderInput.id && await dynamoDbClient.send(new GetItemCommand({
            TableName: process.env.NOTIFICATION_REMINDER_TABLE!,
            Key: {
                id: {
                    S: createNotificationReminderInput.id
                }
            },
            /**
             * we're not interested in getting all the data for this call, just the minimum for us to determine whether this is a duplicate or not
             *
             * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html
             * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ExpressionAttributeNames.html
             */
            ProjectionExpression: '#idf',
            ExpressionAttributeNames: {
                '#idf': 'id'
            }
        }));

        // if there is an item retrieved, then we return an error
        if (preExistingNotificationReminder && preExistingNotificationReminder.Item) {
            // if there is an existent Notification Reminder object, then we cannot duplicate that, so we will return an error
            const errorMessage = `Duplicate Notification Reminder object found!`;
            console.log(errorMessage);

            return {
                errorMessage: errorMessage,
                errorType: NotificationReminderErrorType.DuplicateObjectFound
            }
        } else {
            // generate a unique application identifier for the Notification Reminder, if not already passed in
            createNotificationReminderInput.id = createNotificationReminderInput.id ? createNotificationReminderInput.id : uuidv4();

            // create the notification channel type array from the input
            const notificationChannelType: AttributeValue[] = [];
            createNotificationReminderInput.notificationChannelType.forEach(notificationChannel => {
                notificationChannelType.push({
                    S: notificationChannel!
                })
            });

            // store the next trigger date/time, to start the next day
            const triggerDate = new Date(Date.now());
            triggerDate.setDate(triggerDate.getDate() + 1);
            triggerDate.setHours(19, 0,0,0); // set the UTC time to match 12 PM MST/ 2 PM CST / 3 PM EST
            createNotificationReminderInput.nextTriggerAt = triggerDate.toISOString();

            // initially set this as 0 times since this has never been triggered at the creation time
            createNotificationReminderInput.notificationReminderCount = 0;

            // store the Notification Reminder object
            await dynamoDbClient.send(new PutItemCommand({
                TableName: process.env.NOTIFICATION_REMINDER_TABLE!,
                Item: {
                    id: {
                        S: createNotificationReminderInput.id!
                    },
                    notificationReminderType: {
                        S: createNotificationReminderInput.notificationReminderType!
                    },
                    notificationReminderStatus: {
                        S: createNotificationReminderInput.notificationReminderStatus!
                    },
                    notificationReminderCadence: {
                        S: createNotificationReminderInput.notificationReminderCadence!
                    },
                    createdAt: {
                        S: createNotificationReminderInput.createdAt!
                    },
                    updatedAt: {
                        S: createNotificationReminderInput.updatedAt!
                    },
                    nextTriggerAt: {
                        S: createNotificationReminderInput.nextTriggerAt!
                    },
                    notificationReminderCount: {
                        N: createNotificationReminderInput.notificationReminderCount!.toString()
                    },
                    notificationChannelType: {
                        L: notificationChannelType
                    }
                }
            }));

            // return the Notification Reminder object
            return {
                data: [createNotificationReminderInput as NotificationReminder]
            }
        }
    } catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: NotificationReminderErrorType.UnexpectedError
        }
    }
}
