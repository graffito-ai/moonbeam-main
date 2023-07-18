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
 * Export all atoms and/or selectors
 */
export {
    deviceTypeState
};
