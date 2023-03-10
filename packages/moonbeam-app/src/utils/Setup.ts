import * as envInfo from "../../amplify/.config/local-env-info.json";
import {Constants, Stages} from "@moonbeam/moonbeam-models";
import {Amplify, Auth} from "aws-amplify";
import * as SecureStore from "expo-secure-store";
import {NativeModules} from "react-native";

/**
 * Retrieves the CDK exports file from which we will configure Amplify, depending
 * on the current Amplify environment.
 */
export const initialize = () => {
    let baseCDKStack: string = '';
    let cdkExport;
    switch (envInfo.envName) {
        case Stages.DEV:
            cdkExport = require('../../../moonbeam-cdk/exports/cdk-exports-dev.json');
            baseCDKStack = `amplify-${Stages.DEV}-us-west-2`;
            break;
        case Stages.STAGING:
            break;
        case Stages.PREVIEW:
            break;
        case Stages.PROD:
            break;
        default:
            throw new Error(`Invalid environment passed in from Amplify ${envInfo.envName}`);
    }

    // set up Amplify configuration
    Amplify.configure({
        // General Amplify configuration
        [Constants.AmplifyConstants.REGION]: cdkExport[baseCDKStack][Constants.AmplifyConstants.REGION.replaceAll('_', '')],
        // Amplify Auth configuration
        [Constants.AmplifyConstants.COGNITO_REGION]: cdkExport[baseCDKStack][Constants.AmplifyConstants.COGNITO_REGION.replaceAll('_', '')],
        [Constants.AmplifyConstants.USER_POOLS_ID]: cdkExport[baseCDKStack][Constants.AmplifyConstants.USER_POOLS_ID.replaceAll('_', '')],
        [Constants.AmplifyConstants.USER_POOLS_WEB_CLIENT_ID]: cdkExport[baseCDKStack][Constants.AmplifyConstants.USER_POOLS_WEB_CLIENT_ID.replaceAll('_', '')],
        [Constants.AmplifyConstants.COGNITO_IDENTITY_POOL_ID]: cdkExport[baseCDKStack][Constants.AmplifyConstants.COGNITO_IDENTITY_POOL_ID.replaceAll('_', '')],
        // Amplify AppSync configuration
        [Constants.AmplifyConstants.APPSYNC_REGION]: cdkExport[baseCDKStack][Constants.AmplifyConstants.APPSYNC_REGION.replaceAll('_', '')],
        [Constants.AmplifyConstants.APPSYNC_AUTH_TYPE]: cdkExport[baseCDKStack][Constants.AmplifyConstants.APPSYNC_AUTH_TYPE.replaceAll('_', '')],
        [Constants.AmplifyConstants.APPSYNC_ENDPOINT]: cdkExport[baseCDKStack][Constants.AmplifyConstants.APPSYNC_ENDPOINT.replaceAll('_', '')]
    });
}

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
