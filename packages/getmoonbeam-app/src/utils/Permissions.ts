import {requestTrackingPermissionsAsync} from "expo-tracking-transparency";
import {logEvent} from "./AppSync";
import {LoggingLevel} from "@moonbeam/moonbeam-models";

/**
 * Function used to add the necessary app tracking transparency permissions, needed for iOS devices.
 */
export const requestAppTrackingTransparencyPermission = async () => {
    setTimeout(async () => {
        const {status} = await requestTrackingPermissionsAsync();
        if (status !== 'granted') {
            const message = 'Permission to track your data not granted!';
            console.log(message);
            await logEvent(message, LoggingLevel.Info, true);
        }
    }, 1500);
}
