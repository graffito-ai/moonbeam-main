import * as SecureStore from "expo-secure-store";
import {Auth} from "aws-amplify";
import {NativeModules} from "react-native";

/**
 * Checks to see if the cached user token is valid (used for deep linking purposes)
 */
export const isCacheTokenValid = async (): Promise<boolean> => {
    // retrieve the cached information from the secure store
    let result = await SecureStore.getItemAsync('currentUserInformation');
    // verify whether a user cache already exists with a token, in order to account for deep linking availability
    if (result) {
        // verify the token expiration
        const tokenExpiration = JSON.parse(result).exp;
        return tokenExpiration > Number(`${new Date().getTime() / 1000}`.split('.')[0]);
    } else {
        return false;
    }
}

/**
 * Function used to refresh the current user token, and store that information in the secure store.
 *
 * @param component component in which the token will be refreshed
 */
export const refreshUserToken = async (component: string) => {
    // refresh the current session - just in case we need to, for deep linking purposes
    const validToken = await isCacheTokenValid();
    if (!validToken) {
        const refreshedUserSession = await Auth.currentSession();

        /**
         * Retrieving the authenticated user's information.
         * Necessary upon Oauth later on, because we want to get the refreshed user session information on a link open.
         */
        const user = await Auth.currentAuthenticatedUser({
            bypassCache: true
        });
        if (user && refreshedUserSession) {
            const userInfo = user.signInUserSession.idToken.payload;

            // delete existing user information
            await SecureStore.deleteItemAsync('currentUserInformation');

            // store the user information in secure store, in order to handle deeplinks later on
            await SecureStore.setItemAsync('currentUserInformation', JSON.stringify(userInfo));
        } else {
            console.log(`Unexpected error in while attempting to refresh user session ${JSON.stringify(refreshedUserSession)}, for user ${JSON.stringify(user)}, in component ${component}`);
            NativeModules.DevSettings.reload();
        }
    }
}
