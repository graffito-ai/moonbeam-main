import Constants from 'expo-constants';
import {AppOwnership} from "expo-constants/src/Constants.types";
/**
 * import branch only if the app is not running in Expo Go (so we can actually run the application without Branch for
 * Expo Go), for easier testing purposes.
 */
const isRunningInExpoGo = Constants.appOwnership === AppOwnership.Expo;
import {Platform} from "react-native";
import {LoggingLevel} from "@moonbeam/moonbeam-models";
import {logEvent} from "./AppSync";

/**
 * Function used to initialize a new Branch Universal Object, in order to start using
 * it with Branch to track and log attribution events across the app.
 *
 * @param identifier the unique identifier for this object/content
 * @param title the title for the Branch Universal Object
 * @param description the description for the Branch Universal Object
 * @param metadata optional metadata for the Branch Universal Object
 *
 * @returns {@link Object} representing the new Branch Universal Object
 */
export const branchInitUniversalObject = async (identifier: string, title: string, description: string, metadata?: Object): Promise<Object> => {
    // if the app is not running in Expo Go
    if (!isRunningInExpoGo) {
        // import branch
        const branch = await import('react-native-branch');
        return await branch.default.createBranchUniversalObject(identifier, {
            title: title,
            contentDescription: description,
            ...(metadata !== null && metadata !== undefined && {
                contentMetadata: metadata
            })
        });
    } else {
        return {};
    }
}

/**
 * Function used to initialize Branch, and set its identity based on the logged-in user.
 *
 * @param userInformation the user information used to set the identity of the user with branch, used
 * for events, deep links and referrals.
 *
 * @returns {@link Object} representing the root Branch Universal Object
 */
export const initializeBranch = async (userInformation: any): Promise<Object | null> => {
    try {
        // if the app is not running in Expo Go
        if (!isRunningInExpoGo) {
            // import branch
            const branch = await import('react-native-branch');

            // sets the identity of the logged-in user
            await branch.default.setIdentity(`${userInformation['custom:userId']}`);

            return await branch.default.createBranchUniversalObject(`moonbeam-root`, {
                title: `Moonbeam | Military Discounts Platform`,
                contentDescription: `The first automatic military discounts platform.`
            });
        } else {
            return null;
        }
    } catch (error) {
        const errorMessage = `Unexpected error while initializing the Branch.IO Universal Object, for OS ${Platform.OS} ${error} ${JSON.stringify(error)}`;
        console.log(errorMessage);
        await logEvent(errorMessage, LoggingLevel.Error, false);

        return null;
    }
}
