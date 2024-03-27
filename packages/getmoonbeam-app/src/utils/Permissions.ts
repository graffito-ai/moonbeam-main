import {requestTrackingPermissionsAsync} from "expo-tracking-transparency";
import {logEvent} from "./AppSync";
import {LoggingLevel} from "@moonbeam/moonbeam-models";
import * as Location from 'expo-location';

/**
 * Function used to add the necessary app tracking transparency permissions,
 * needed for iOS devices.
 */
export const requestAppTrackingTransparencyPermission = async () => {
    setTimeout(async () => {
        const {status} = await requestTrackingPermissionsAsync();
        if (status !== 'granted') {
            const message = 'Permission to track your data not granted!';
            console.log(message);
            await logEvent(message, LoggingLevel.Info, false);
        }
    }, 1500);
}

/**
 * Function used to start receiving location updates in the background, once the user
 * has provided appropriate foreground and background location permissions.
 *
 * @param taskName the name of the task to be passed in, that the user subscribed to
 * in order to receive location updates.
 */
export const watchLocationAsync = async (taskName: string): Promise<void> => {
    return await Location.startLocationUpdatesAsync(taskName, {
        distanceInterval: 1000,
        timeInterval: 10000
    });
};
