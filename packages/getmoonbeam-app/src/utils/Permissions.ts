import {requestTrackingPermissionsAsync} from "expo-tracking-transparency";

/**
 * Function used to add the necessary app tracking transparency permissions, needed for iOS devices.
 */
export const requestAppTrackingTransparencyPermission = async () => {
    setTimeout(async () => {
        const {status} = await requestTrackingPermissionsAsync();
        if (status !== 'granted') {
            console.log('Permission to track your data not granted!');
        }
    }, 1500);
}
