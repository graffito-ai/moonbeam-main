import {createNotification, CreateNotificationInput} from "@moonbeam/moonbeam-models";
import {API, graphqlOperation} from "aws-amplify";

/**
 * Function used to send a notification (depending on type and channel)
 *
 * @param createNotificationInput the notification details to be passed in,
 * in order to send/route the notification appropriately.
 *
 * @returns a {@link Promise} containing a {@link boolean} flag, representing
 * whether the notification was successfully sent or not.
 */
export const sendNotification = async (createNotificationInput: CreateNotificationInput): Promise<boolean> => {
    try {
        // call the internal notification creation API
        const createNotificationResult = await API.graphql(graphqlOperation(createNotification, {
            createNotificationInput: createNotificationInput
        }));

        // retrieve the data block from the response
        // @ts-ignore
        const responseData = createNotificationResult ? createNotificationResult.data : null;

        // check if there are any errors in the returned response
        if (responseData && responseData.createNotification.errorMessage === null) {
            return true;
        } else {
            console.log(`Unexpected error while creating a notification through the create notification API ${JSON.stringify(responseData)}`);
            return false;
        }
    } catch (error) {
        console.log(`Unexpected error while sending a notification with details ${JSON.stringify(createNotificationInput)}`);

        return false;
    }
};
