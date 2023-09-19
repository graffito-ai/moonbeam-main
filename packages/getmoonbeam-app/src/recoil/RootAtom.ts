import {atom} from "recoil";
import {DeviceType} from "expo-device";

/**
 * Atom used to keep track of the type of device running the app.
 */
const deviceTypeState = atom({
    key: "deviceTypeState",
    default: DeviceType.DESKTOP
});

/**
 * Atom used to keep track of whether a user logged in for the first time
 * in the app or not.
 */
const firstTimeLoggedInState = atom<boolean>({
    key: "firstTimeLoggedInState",
    default: false
});

/**
 * Atom used to keep track of the current user id, used for biometrics purposes set
 * up only.
 */
const moonbeamUserIdState = atom<string>({
    key: "moonbeamUserIdState",
    default: ""
});

/**
 * Atom used to keep track of the current user id pass, used for biometrics purposes set
 * up only.
 */
const moonbeamUserIdPassState = atom<string>({
    key: "moonbeamUserIdPassState",
    default: ""
});

/**
 * Export all atoms and/or selectors
 */
export {
    deviceTypeState,
    firstTimeLoggedInState,
    moonbeamUserIdState,
    moonbeamUserIdPassState
};
