"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStorage = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const client_s3_1 = require("@aws-sdk/client-s3");
const client_secrets_manager_1 = require("@aws-sdk/client-secrets-manager");
const cloudfront_signer_1 = require("@aws-sdk/cloudfront-signer");
/**
 * GetStorage resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getStorageInput input, based on which the appropriate file is retrieved from storage, through
 * a CloudFront distribution
 *
 * @returns {@link Promise} of {@link StorageResponse}
 */
const getStorage = async (fieldName, getStorageInput) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // initializing any AWS SDK resources
        const s3Client = new client_s3_1.S3Client({ region: region });
        const secretsClient = new client_secrets_manager_1.SecretsManagerClient({ region: region });
        // switch based on the type of file to be retrieved
        switch (getStorageInput.type) {
            case moonbeam_models_1.FileType.Main:
                const bucketName = `${moonbeam_models_1.Constants.StorageConstants.MOONBEAM_MAIN_FILES_BUCKET_NAME}-${process.env.ENV_NAME}-${region}`;
                const cloudFrontDistributionDomain = process.env.MOONBEAM_MAIN_FILES_CLOUDFRONT_DISTRIBUTION;
                // first make sure that if the level to be passed in is private, that an ID is also passed in
                if (getStorageInput.level === moonbeam_models_1.FileAccessLevel.Private && (!getStorageInput.id || getStorageInput.id.length === 0)) {
                    const errorMessage = `Invalid storage input object passed in for ${getStorageInput.level} access, ${JSON.stringify(getStorageInput)}`;
                    console.log(`${errorMessage}`);
                    return {
                        errorMessage: errorMessage,
                        errorType: moonbeam_models_1.StorageErrorType.ValidationError,
                    };
                }
                else {
                    /**
                     * Initialize the key for the object that we're attempting to read
                     *
                     * In case of objects stored in private/sub, by capturing the callers Cognito identity here,
                     * passed in through the AppSyncEvent, we guarantee that only authenticated users can read
                     * from their OWN/PRIVATE folder.
                     */
                    const objectKey = getStorageInput.level === moonbeam_models_1.FileAccessLevel.Public
                        ? `${getStorageInput.level.toLowerCase()}/${getStorageInput.name}`
                        : `${getStorageInput.level.toLowerCase()}/${getStorageInput.id}/${getStorageInput.name}`;
                    // check if the object exists in the bucket, without actually retrieving it first.
                    const metadata = await s3Client.send(new client_s3_1.HeadObjectCommand(({
                        Bucket: bucketName,
                        Key: objectKey
                    })));
                    // if there's an existent object, with valid metadata
                    if (metadata.Metadata && metadata.$metadata.httpStatusCode !== undefined && metadata.$metadata.httpStatusCode === 200) {
                        // retrieve the CloudFront distribution secrets for the main file types, depending on the current region and environment
                        const cloudFrontMainFilesPair = await secretsClient
                            .send(new client_secrets_manager_1.GetSecretValueCommand(({ SecretId: `${moonbeam_models_1.Constants.AWSPairConstants.MAIN_FILES_CLOUDFRONT_DISTRIBUTION_SECRET_NAME}-${process.env.ENV_NAME}-${region}` })));
                        // check if the secrets for the CloudFront Distribution exist
                        if (cloudFrontMainFilesPair.SecretString) {
                            /**
                             * If there is an expiration flag passed in, and it is true,
                             * then make the expiration to 1 hour, to coincide with the Cognito
                             * session expiration.
                             *
                             * Otherwise, if the expiration flag is false, then do make the link expire in
                             * 50 years.
                             */
                            let expirationDate;
                            if (getStorageInput.expires !== undefined) {
                                if (!getStorageInput.expires) {
                                    expirationDate = new Date(new Date().getTime() + 60000 * 60 * 24 * 365 * 50);
                                }
                                else {
                                    expirationDate = new Date(new Date().getTime() + 60000 * 60);
                                }
                            }
                            else {
                                expirationDate = new Date(new Date().getTime() + 60000 * 60);
                            }
                            // return the signed URL for the given object, with an expiration date
                            return {
                                data: {
                                    url: (0, cloudfront_signer_1.getSignedUrl)({
                                        url: `https://${cloudFrontDistributionDomain}/${objectKey}`,
                                        dateLessThan: expirationDate.toString(),
                                        keyPairId: process.env.MOONBEAM_MAIN_FILES_KEY_PAIR_ID,
                                        privateKey: cloudFrontMainFilesPair.SecretString
                                    })
                                }
                            };
                        }
                        const cloudFrontDistributionPairMessage = `CloudFront Distribution secret string not available ${JSON.stringify(cloudFrontMainFilesPair)}`;
                        console.log(`${cloudFrontDistributionPairMessage}`);
                        return {
                            errorMessage: cloudFrontDistributionPairMessage,
                            errorType: moonbeam_models_1.StorageErrorType.UnexpectedError,
                        };
                    }
                    const errorMessage = `Unexpected error while retrieving object ${getStorageInput.name} metadata`;
                    console.log(`${errorMessage}`);
                    return {
                        errorMessage: errorMessage,
                        errorType: moonbeam_models_1.StorageErrorType.UnexpectedError,
                    };
                }
            // ToDo: Add more cases depending on the buckets that we have
            default:
                const unknownFileTypeError = `Unknown file type ${getStorageInput.type}`;
                console.log(unknownFileTypeError);
                return {
                    errorMessage: unknownFileTypeError,
                    errorType: moonbeam_models_1.StorageErrorType.ValidationError
                };
        }
    }
    catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
        console.log(errorMessage);
        // @ts-ignore
        if (err && err.name && err.name === 'NotFound') {
            return {
                errorMessage: `Object not found ${getStorageInput.name}`,
                errorType: moonbeam_models_1.StorageErrorType.NoneOrAbsent
            };
        }
        return {
            errorMessage: errorMessage,
            errorType: moonbeam_models_1.StorageErrorType.UnexpectedError
        };
    }
};
exports.getStorage = getStorage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0U3RvcmFnZVJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvR2V0U3RvcmFnZVJlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtEQU9tQztBQUNuQyxrREFBK0Q7QUFDL0QsNEVBQTRGO0FBQzVGLGtFQUF3RDtBQUV4RDs7Ozs7Ozs7R0FRRztBQUNJLE1BQU0sVUFBVSxHQUFHLEtBQUssRUFBRSxTQUFpQixFQUFFLGVBQWdDLEVBQTRCLEVBQUU7SUFDOUcsSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2QyxxQ0FBcUM7UUFDckMsTUFBTSxRQUFRLEdBQUcsSUFBSSxvQkFBUSxDQUFDLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7UUFDaEQsTUFBTSxhQUFhLEdBQUcsSUFBSSw2Q0FBb0IsQ0FBQyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBRWxFLG1EQUFtRDtRQUNuRCxRQUFRLGVBQWUsQ0FBQyxJQUFJLEVBQUU7WUFDMUIsS0FBSywwQkFBUSxDQUFDLElBQUk7Z0JBQ2QsTUFBTSxVQUFVLEdBQUcsR0FBRywyQkFBUyxDQUFDLGdCQUFnQixDQUFDLCtCQUErQixJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUyxJQUFJLE1BQU0sRUFBRSxDQUFDO2dCQUN0SCxNQUFNLDRCQUE0QixHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsMkNBQTRDLENBQUM7Z0JBRTlGLDZGQUE2RjtnQkFDN0YsSUFBSSxlQUFlLENBQUMsS0FBSyxLQUFLLGlDQUFlLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxlQUFlLENBQUMsRUFBRSxJQUFJLGVBQWUsQ0FBQyxFQUFFLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxFQUFFO29CQUMvRyxNQUFNLFlB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LGVBQWU7U0FDOUMsQ0FBQztLQUNMO0FBQ0wsQ0FBQyxDQUFBO0FBckhZLFFBQUEsVUFBVSxjQXFIdEIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICAgIENvbnN0YW50cyxcbiAgICBGaWxlQWNjZXNzTGV2ZWwsXG4gICAgRmlsZVR5cGUsXG4gICAgR2V0U3RvcmFnZUlucHV0LFxuICAgIFN0b3JhZ2VFcnJvclR5cGUsXG4gICAgU3RvcmFnZVJlc3BvbnNlXG59IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5pbXBvcnQge0hlYWRPYmplY3RDb21tYW5kLCBTM0NsaWVudH0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1zM1wiO1xuaW1wb3J0IHtHZXRTZWNyZXRWYWx1ZUNvbW1hbmQsIFNlY3JldHNNYW5hZ2VyQ2xpZW50fSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LXNlY3JldHMtbWFuYWdlclwiO1xuaW1wb3J0IHtnZXRTaWduZWRVcmx9IGZyb20gXCJAYXdzLXNkay9jbG91ZGZyb250LXNpZ25lclwiO1xuXG4vKipcbiAqIEdldFN0b3JhZ2UgcmVzb2x2ZXJcbiAqXG4gKiBAcGFyYW0gZmllbGROYW1lIG5hbWUgb2YgdGhlIHJlc29sdmVyIHBhdGggZnJvbSB0aGUgQXBwU3luYyBldmVudFxuICogQHBhcmFtIGdldFN0b3JhZ2VJbnB1dCBpbnB1dCwgYmFzZWQgb24gd2hpY2ggdGhlIGFwcHJvcHJpYXRlIGZpbGUgaXMgcmV0cmlldmVkIGZyb20gc3RvcmFnZSwgdGhyb3VnaFxuICogYSBDbG91ZEZyb250IGRpc3RyaWJ1dGlvblxuICpcbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgU3RvcmFnZVJlc3BvbnNlfVxuICovXG5leHBvcnQgY29uc3QgZ2V0U3RvcmFnZSA9IGFzeW5jIChmaWVsZE5hbWU6IHN0cmluZywgZ2V0U3RvcmFnZUlucHV0OiBHZXRTdG9yYWdlSW5wdXQpOiBQcm9taXNlPFN0b3JhZ2VSZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8vIGluaXRpYWxpemluZyBhbnkgQVdTIFNESyByZXNvdXJjZXNcbiAgICAgICAgY29uc3QgczNDbGllbnQgPSBuZXcgUzNDbGllbnQoe3JlZ2lvbjogcmVnaW9ufSk7XG4gICAgICAgIGNvbnN0IHNlY3JldHNDbGllbnQgPSBuZXcgU2VjcmV0c01hbmFnZXJDbGllbnQoeyByZWdpb246IHJlZ2lvbn0pO1xuXG4gICAgICAgIC8vIHN3aXRjaCBiYXNlZCBvbiB0aGUgdHlwZSBvZiBmaWxlIHRvIGJlIHJldHJpZXZlZFxuICAgICAgICBzd2l0Y2ggKGdldFN0b3JhZ2VJbnB1dC50eXBlKSB7XG4gICAgICAgICAgICBjYXNlIEZpbGVUeXBlLk1haW46XG4gICAgICAgICAgICAgICAgY29uc3QgYnVja2V0TmFtZSA9IGAke0NvbnN0YW50cy5TdG9yYWdlQ29uc3RhbnRzLk1PT05CRUFNX01BSU5fRklMRVNfQlVDS0VUX05BTUV9LSR7cHJvY2Vzcy5lbnYuRU5WX05BTUUhfS0ke3JlZ2lvbn1gO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNsb3VkRnJvbnREaXN0cmlidXRpb25Eb21haW4gPSBwcm9jZXNzLmVudi5NT09OQkVBTV9NQUlOX0ZJTEVTX0NMT1VERlJPTlRfRElTVFJJQlVUSU9OITtcblxuICAgICAgICAgICAgICAgIC8vIGZpcnN0IG1ha2Ugc3VyZSB0aGF0IGlmIHRoZSBsZXZlbCB0byBiZSBwYXNzZWQgaW4gaXMgcHJpdmF0ZSwgdGhhdCBhbiBJRCBpcyBhbHNvIHBhc3NlZCBpblxuICAgICAgICAgICAgICAgIGlmIChnZXRTdG9yYWdlSW5wdXQubGV2ZWwgPT09IEZpbGVBY2Nlc3NMZXZlbC5Qcml2YXRlICYmICghZ2V0U3RvcmFnZUlucHV0LmlkIHx8IGdldFN0b3JhZ2VJbnB1dC5pZC5sZW5ndGggPT09IDApKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBJbnZhbGlkIHN0b3JhZ2UgaW5wdXQgb2JqZWN0IHBhc3NlZCBpbiBmb3IgJHtnZXRTdG9yYWdlSW5wdXQubGV2ZWx9IGFjY2VzcywgJHtKU09OLnN0cmluZ2lmeShnZXRTdG9yYWdlSW5wdXQpfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX1gKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBTdG9yYWdlRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvcixcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBJbml0aWFsaXplIHRoZSBrZXkgZm9yIHRoZSBvYmplY3QgdGhhdCB3ZSdyZSBhdHRlbXB0aW5nIHRvIHJlYWRcbiAgICAgICAgICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAgICAgICAgICogSW4gY2FzZSBvZiBvYmplY3RzIHN0b3JlZCBpbiBwcml2YXRlL3N1YiwgYnkgY2FwdHVyaW5nIHRoZSBjYWxsZXJzIENvZ25pdG8gaWRlbnRpdHkgaGVyZSxcbiAgICAgICAgICAgICAgICAgICAgICogcGFzc2VkIGluIHRocm91Z2ggdGhlIEFwcFN5bmNFdmVudCwgd2UgZ3VhcmFudGVlIHRoYXQgb25seSBhdXRoZW50aWNhdGVkIHVzZXJzIGNhbiByZWFkXG4gICAgICAgICAgICAgICAgICAgICAqIGZyb20gdGhlaXIgT1dOL1BSSVZBVEUgZm9sZGVyLlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgb2JqZWN0S2V5ID0gZ2V0U3RvcmFnZUlucHV0LmxldmVsID09PSBGaWxlQWNjZXNzTGV2ZWwuUHVibGljXG4gICAgICAgICAgICAgICAgICAgICAgICA/IGAke2dldFN0b3JhZ2VJbnB1dC5sZXZlbC50b0xvd2VyQ2FzZSgpfS8ke2dldFN0b3JhZ2VJbnB1dC5uYW1lfWBcbiAgICAgICAgICAgICAgICAgICAgICAgIDogYCR7Z2V0U3RvcmFnZUlucHV0LmxldmVsLnRvTG93ZXJDYXNlKCl9LyR7Z2V0U3RvcmFnZUlucHV0LmlkfS8ke2dldFN0b3JhZ2VJbnB1dC5uYW1lfWA7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gY2hlY2sgaWYgdGhlIG9iamVjdCBleGlzdHMgaW4gdGhlIGJ1Y2tldCwgd2l0aG91dCBhY3R1YWxseSByZXRyaWV2aW5nIGl0IGZpcnN0LlxuICAgICAgICAgICAgICAgICAgICBjb25zdCBtZXRhZGF0YSA9IGF3YWl0IHMzQ2xpZW50LnNlbmQobmV3IEhlYWRPYmplY3RDb21tYW5kKCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBCdWNrZXQ6IGJ1Y2tldE5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBLZXk6IG9iamVjdEtleVxuICAgICAgICAgICAgICAgICAgICB9KSkpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIHRoZXJlJ3MgYW4gZXhpc3RlbnQgb2JqZWN0LCB3aXRoIHZhbGlkIG1ldGFkYXRhXG4gICAgICAgICAgICAgICAgICAgIGlmIChtZXRhZGF0YS5NZXRhZGF0YSAmJiBtZXRhZGF0YS4kbWV0YWRhdGEuaHR0cFN0YXR1c0NvZGUgIT09IHVuZGVmaW5lZCAmJiBtZXRhZGF0YS4kbWV0YWRhdGEuaHR0cFN0YXR1c0NvZGUgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIENsb3VkRnJvbnQgZGlzdHJpYnV0aW9uIHNlY3JldHMgZm9yIHRoZSBtYWluIGZpbGUgdHlwZXMsIGRlcGVuZGluZyBvbiB0aGUgY3VycmVudCByZWdpb24gYW5kIGVudmlyb25tZW50XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjbG91ZEZyb250TWFpbkZpbGVzUGFpciA9IGF3YWl0IHNlY3JldHNDbGllbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc2VuZChuZXcgR2V0U2VjcmV0VmFsdWVDb21tYW5kKCh7U2VjcmV0SWQ6IGAke0NvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLk1BSU5fRklMRVNfQ0xPVURGUk9OVF9ESVNUUklCVVRJT05fU0VDUkVUX05BTUV9LSR7cHJvY2Vzcy5lbnYuRU5WX05BTUUhfS0ke3JlZ2lvbn1gfSkpKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2hlY2sgaWYgdGhlIHNlY3JldHMgZm9yIHRoZSBDbG91ZEZyb250IERpc3RyaWJ1dGlvbiBleGlzdFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNsb3VkRnJvbnRNYWluRmlsZXNQYWlyLlNlY3JldFN0cmluZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIElmIHRoZXJlIGlzIGFuIGV4cGlyYXRpb24gZmxhZyBwYXNzZWQgaW4sIGFuZCBpdCBpcyB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIHRoZW4gbWFrZSB0aGUgZXhwaXJhdGlvbiB0byAxIGhvdXIsIHRvIGNvaW5jaWRlIHdpdGggdGhlIENvZ25pdG9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBzZXNzaW9uIGV4cGlyYXRpb24uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBPdGhlcndpc2UsIGlmIHRoZSBleHBpcmF0aW9uIGZsYWcgaXMgZmFsc2UsIHRoZW4gZG8gbWFrZSB0aGUgbGluayBleHBpcmUgaW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiA1MCB5ZWFycy5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgZXhwaXJhdGlvbkRhdGU6IERhdGU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGdldFN0b3JhZ2VJbnB1dC5leHBpcmVzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFnZXRTdG9yYWdlSW5wdXQuZXhwaXJlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwaXJhdGlvbkRhdGUgPSBuZXcgRGF0ZShuZXcgRGF0ZSgpLmdldFRpbWUoKSArIDYwMDAwICogNjAgKiAyNCAqIDM2NSAqIDUwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cGlyYXRpb25EYXRlID0gbmV3IERhdGUobmV3IERhdGUoKS5nZXRUaW1lKCkgKyA2MDAwMCAqIDYwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cGlyYXRpb25EYXRlID0gbmV3IERhdGUobmV3IERhdGUoKS5nZXRUaW1lKCkgKyA2MDAwMCAqIDYwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBzaWduZWQgVVJMIGZvciB0aGUgZ2l2ZW4gb2JqZWN0LCB3aXRoIGFuIGV4cGlyYXRpb24gZGF0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybDogZ2V0U2lnbmVkVXJsKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmw6IGBodHRwczovLyR7Y2xvdWRGcm9udERpc3RyaWJ1dGlvbkRvbWFpbn0vJHtvYmplY3RLZXl9YCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRlTGVzc1RoYW46IGV4cGlyYXRpb25EYXRlLnRvU3RyaW5nKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5UGFpcklkOiBwcm9jZXNzLmVudi5NT09OQkVBTV9NQUlOX0ZJTEVTX0tFWV9QQUlSX0lEISxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcml2YXRlS2V5OiBjbG91ZEZyb250TWFpbkZpbGVzUGFpci5TZWNyZXRTdHJpbmchXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2xvdWRGcm9udERpc3RyaWJ1dGlvblBhaXJNZXNzYWdlID0gYENsb3VkRnJvbnQgRGlzdHJpYnV0aW9uIHNlY3JldCBzdHJpbmcgbm90IGF2YWlsYWJsZSAke0pTT04uc3RyaW5naWZ5KGNsb3VkRnJvbnRNYWluRmlsZXNQYWlyKX1gO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7Y2xvdWRGcm9udERpc3RyaWJ1dGlvblBhaXJNZXNzYWdlfWApO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGNsb3VkRnJvbnREaXN0cmlidXRpb25QYWlyTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFN0b3JhZ2VFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHJldHJpZXZpbmcgb2JqZWN0ICR7Z2V0U3RvcmFnZUlucHV0Lm5hbWV9IG1ldGFkYXRhYDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfWApO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFN0b3JhZ2VFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yLFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gVG9EbzogQWRkIG1vcmUgY2FzZXMgZGVwZW5kaW5nIG9uIHRoZSBidWNrZXRzIHRoYXQgd2UgaGF2ZVxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBjb25zdCB1bmtub3duRmlsZVR5cGVFcnJvciA9IGBVbmtub3duIGZpbGUgdHlwZSAke2dldFN0b3JhZ2VJbnB1dC50eXBlfWA7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2codW5rbm93bkZpbGVUeXBlRXJyb3IpO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogdW5rbm93bkZpbGVUeXBlRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogU3RvcmFnZUVycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nICR7ZmllbGROYW1lfSBxdWVyeSAke2Vycn1gO1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIGlmIChlcnIgJiYgZXJyLm5hbWUgJiYgZXJyLm5hbWUgPT09ICdOb3RGb3VuZCcpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgT2JqZWN0IG5vdCBmb3VuZCAke2dldFN0b3JhZ2VJbnB1dC5uYW1lfWAsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBTdG9yYWdlRXJyb3JUeXBlLk5vbmVPckFic2VudFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgIGVycm9yVHlwZTogU3RvcmFnZUVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgfTtcbiAgICB9XG59XG4iXX0=