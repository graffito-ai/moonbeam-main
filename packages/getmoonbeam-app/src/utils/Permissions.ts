import * as Location from "expo-location";
import {requestTrackingPermissionsAsync} from "expo-tracking-transparency";
import * as Notifications from "expo-notifications";
import * as ImagePicker from "expo-image-picker";
import * as Contacts from "expo-contacts";

/**
 * Function used to add the necessary contacts permissions, needed for the application
 * to access a user's contacts.
 */
export const requestContactPermission = async () => {
    const {status} = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') {
        console.log('Permission to access contacts not granted!');
    }
}

/**
 * Function used to add the necessary location foreground permissions, needed for the application
 * to access a user's geolocation.
 */
export const requestForegroundLocationPermission = async () => {
    const {status} = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
        console.log('Permission to access location in foreground not granted!');
    }
}

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

/**
 * Function used to add the necessary notification permissions, needed for the application
 * to send push, as well as other types of notifications.
 */
export const requestNotificationsPermission = async () => {
    const {status} = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
        console.log('Permission for notifications not granted!');
    }
}

/**
 * Function used to add the necessary media library permissions, needed to upload pictures
 * through the Image picker for various documentation purposes.
 */
export const requestMediaLibraryPermission = async () => {
    const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
        console.log('Permission for media library not granted!');
    }
}

/**
 * Function used to add the necessary camera permissions, needed to upload pictures
 * through the Image picker for various documentation purposes.
 */
export const requestCameraPermission = async () => {
    const {status} = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
        console.log('Permission for camera not granted!');
    }
}
