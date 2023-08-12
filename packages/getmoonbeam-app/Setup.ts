import * as envInfo from "./amplify/.config/local-env-info.json";
import {Constants, Stages} from "@moonbeam/moonbeam-models";
import {Amplify} from "aws-amplify";

/**
 * Retrieves the CDK exports file from which we will configure Amplify, depending
 * on the current Amplify environment.
 */
export const initialize = () => {
    // ToDo: in the future we need to work on getting the region from a variable passed in through the command or something similar
    let baseAmplifyCDKStackName: string = `moonbeam-amplify-${envInfo.envName}-us-west-2`;
    let baseAppSyncCDKStackName: string = `moonbeam-appsync-${envInfo.envName}-us-west-2`;
    let baseStorageCDKStackName: string = `moonbeam-storage-resolver-${envInfo.envName}-us-west-2`;
    let cdkExport;
    switch (envInfo.envName) {
        /**
         * for internal development purposes we can point to the exports folder inside the getmoonbeam-cdk repo, however, at distribution
         * build time, we need to ensure that the most recent copy of the exports folder is present inside the getmoonbeam-app repo.
         */
        case Stages.DEV:
            // cannot string interpolate the environment name in here for some reason, so left it hardcoded
            cdkExport = require('./exports/cdk-exports-dev.json');
            break;
        case Stages.PROD:
            // cannot string interpolate the environment name in here for some reason, so left it hardcoded
            cdkExport = require('./exports/cdk-exports-prod.json');
            break;
        // ToDo: add more environments representing our stages in here
        default:
            throw new Error(`Invalid environment passed in from Amplify ${envInfo.envName}`);
    }

    // set up Amplify configuration
    Amplify.configure({
        // General Amplify configuration
        [Constants.AmplifyConstants.REGION]: cdkExport[baseAmplifyCDKStackName][Constants.AmplifyConstants.REGION.replaceAll('_', '')],
        // Amplify Auth configuration
        [Constants.AmplifyConstants.COGNITO_REGION]: cdkExport[baseAmplifyCDKStackName][Constants.AmplifyConstants.COGNITO_REGION.replaceAll('_', '')],
        [Constants.AmplifyConstants.USER_POOLS_ID]: cdkExport[baseAmplifyCDKStackName][Constants.AmplifyConstants.USER_POOLS_ID.replaceAll('_', '')],
        [Constants.AmplifyConstants.USER_POOLS_WEB_CLIENT_ID]: cdkExport[baseAmplifyCDKStackName][Constants.AmplifyConstants.USER_POOLS_WEB_CLIENT_ID.replaceAll('_', '')],
        [Constants.AmplifyConstants.COGNITO_IDENTITY_POOL_ID]: cdkExport[baseAmplifyCDKStackName][Constants.AmplifyConstants.COGNITO_IDENTITY_POOL_ID.replaceAll('_', '')],
        // Amplify AppSync configuration
        [Constants.AppSyncConstants.APPSYNC_REGION]: cdkExport[baseAppSyncCDKStackName][Constants.AppSyncConstants.APPSYNC_REGION.replaceAll('_', '')],
        [Constants.AppSyncConstants.APPSYNC_ENDPOINT]: cdkExport[baseAppSyncCDKStackName][Constants.AppSyncConstants.APPSYNC_ENDPOINT.replaceAll('_', '')],
        [Constants.AppSyncConstants.APPSYNC_AUTH_TYPE]: cdkExport[baseAppSyncCDKStackName][Constants.AppSyncConstants.APPSYNC_AUTH_TYPE.replaceAll('_', '')],
        // Amplify Storage configuration
        [Constants.StorageConstants.AWS_S3_BUCKET]: cdkExport[baseStorageCDKStackName][Constants.StorageConstants.AWS_S3_BUCKET.replaceAll('_', '')],
        [Constants.StorageConstants.AWS_S3_BUCKET_REGION]: cdkExport[baseStorageCDKStackName][Constants.StorageConstants.AWS_S3_BUCKET_REGION.replaceAll('_', '')]
    });
}
