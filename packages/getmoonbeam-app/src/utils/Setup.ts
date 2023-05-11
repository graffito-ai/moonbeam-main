import * as envInfo from "../../amplify/.config/local-env-info.json";
import {Constants, Stages} from "@moonbeam/moonbeam-models";
import {Amplify} from "aws-amplify";

/**
 * Retrieves the CDK exports file from which we will configure Amplify, depending
 * on the current Amplify environment.
 */
export const initialize = () => {
    let baseCDKStack: string =  `moonbeam-amplify-${envInfo.envName}-us-west-2`;
    let cdkExport;
    switch (envInfo.envName) {
        case Stages.DEV:
            cdkExport = require('../../../getmoonbeam-cdk/exports/cdk-exports-dev.json');
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
        // [Constants.AmplifyConstants.APPSYNC_REGION]: cdkExport[baseCDKStack][Constants.AmplifyConstants.APPSYNC_REGION.replaceAll('_', '')],
        // [Constants.AmplifyConstants.APPSYNC_AUTH_TYPE]: cdkExport[baseCDKStack][Constants.AmplifyConstants.APPSYNC_AUTH_TYPE.replaceAll('_', '')],
        // [Constants.AmplifyConstants.APPSYNC_ENDPOINT]: cdkExport[baseCDKStack][Constants.AmplifyConstants.APPSYNC_ENDPOINT.replaceAll('_', '')]
    });
}
