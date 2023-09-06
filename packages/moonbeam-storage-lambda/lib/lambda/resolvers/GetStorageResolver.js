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
                    if (metadata.Metadata) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0U3RvcmFnZVJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvR2V0U3RvcmFnZVJlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtEQU9tQztBQUNuQyxrREFBK0Q7QUFDL0QsNEVBQTRGO0FBQzVGLGtFQUF3RDtBQUV4RDs7Ozs7Ozs7R0FRRztBQUNJLE1BQU0sVUFBVSxHQUFHLEtBQUssRUFBRSxTQUFpQixFQUFFLGVBQWdDLEVBQTRCLEVBQUU7SUFDOUcsSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2QyxxQ0FBcUM7UUFDckMsTUFBTSxRQUFRLEdBQUcsSUFBSSxvQkFBUSxDQUFDLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7UUFDaEQsTUFBTSxhQUFhLEdBQUcsSUFBSSw2Q0FBb0IsQ0FBQyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBRWxFLG1EQUFtRDtRQUNuRCxRQUFRLGVBQWUsQ0FBQyxJQUFJLEVBQUU7WUFDMUIsS0FBSywwQkFBUSxDQUFDLElBQUk7Z0JBQ2QsTUFBTSxVQUFVLEdBQUcsR0FBRywyQkFBUyxDQUFDLGdCQUFnQixDQUFDLCtCQUErQixJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUyxJQUFJLE1BQU0sRUFBRSxDQUFDO2dCQUN0SCxNQUFNLDRCQUE0QixHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsMkNBQTRDLENBQUM7Z0JBRTlGLDZGQUE2RjtnQkFDN0YsSUFBSSxlQUFlLENBQUMsS0FBSyxLQUFLLGlDQUFlLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxlQUFlLENBQUMsRUFBRSxJQUFJLGVBQWUsQ0FBQyxFQUFFLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxFQUFFO29CQUMvRyxNQUFNLFlB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aW1wb3J0IHtcbiAgICBDb25zdGFudHMsXG4gICAgRmlsZUFjY2Vzc0xldmVsLFxuICAgIEZpbGVUeXBlLFxuICAgIEdldFN0b3JhZ2VJbnB1dCxcbiAgICBTdG9yYWdlRXJyb3JUeXBlLFxuICAgIFN0b3JhZ2VSZXNwb25zZVxufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuaW1wb3J0IHtIZWFkT2JqZWN0Q29tbWFuZCwgUzNDbGllbnR9IGZyb20gXCJAYXdzLXNkay9jbGllbnQtczNcIjtcbmltcG9ydCB7R2V0U2VjcmV0VmFsdWVDb21tYW5kLCBTZWNyZXRzTWFuYWdlckNsaWVudH0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1zZWNyZXRzLW1hbmFnZXJcIjtcbmltcG9ydCB7Z2V0U2lnbmVkVXJsfSBmcm9tIFwiQGF3cy1zZGsvY2xvdWRmcm9udC1zaWduZXJcIjtcblxuLyoqXG4gKiBHZXRTdG9yYWdlIHJlc29sdmVyXG4gKlxuICogQHBhcmFtIGZpZWxkTmFtZSBuYW1lIG9mIHRoZSByZXNvbHZlciBwYXRoIGZyb20gdGhlIEFwcFN5bmMgZXZlbnRcbiAqIEBwYXJhbSBnZXRTdG9yYWdlSW5wdXQgaW5wdXQsIGJhc2VkIG9uIHdoaWNoIHRoZSBhcHByb3ByaWF0ZSBmaWxlIGlzIHJldHJpZXZlZCBmcm9tIHN0b3JhZ2UsIHRocm91Z2hcbiAqIGEgQ2xvdWRGcm9udCBkaXN0cmlidXRpb25cbiAqXG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIFN0b3JhZ2VSZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IGdldFN0b3JhZ2UgPSBhc3luYyAoZmllbGROYW1lOiBzdHJpbmcsIGdldFN0b3JhZ2VJbnB1dDogR2V0U3RvcmFnZUlucHV0KTogUHJvbWlzZTxTdG9yYWdlUmVzcG9uc2U+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OITtcblxuICAgICAgICAvLyBpbml0aWFsaXppbmcgYW55IEFXUyBTREsgcmVzb3VyY2VzXG4gICAgICAgIGNvbnN0IHMzQ2xpZW50ID0gbmV3IFMzQ2xpZW50KHtyZWdpb246IHJlZ2lvbn0pO1xuICAgICAgICBjb25zdCBzZWNyZXRzQ2xpZW50ID0gbmV3IFNlY3JldHNNYW5hZ2VyQ2xpZW50KHsgcmVnaW9uOiByZWdpb259KTtcblxuICAgICAgICAvLyBzd2l0Y2ggYmFzZWQgb24gdGhlIHR5cGUgb2YgZmlsZSB0byBiZSByZXRyaWV2ZWRcbiAgICAgICAgc3dpdGNoIChnZXRTdG9yYWdlSW5wdXQudHlwZSkge1xuICAgICAgICAgICAgY2FzZSBGaWxlVHlwZS5NYWluOlxuICAgICAgICAgICAgICAgIGNvbnN0IGJ1Y2tldE5hbWUgPSBgJHtDb25zdGFudHMuU3RvcmFnZUNvbnN0YW50cy5NT09OQkVBTV9NQUlOX0ZJTEVTX0JVQ0tFVF9OQU1FfS0ke3Byb2Nlc3MuZW52LkVOVl9OQU1FIX0tJHtyZWdpb259YDtcbiAgICAgICAgICAgICAgICBjb25zdCBjbG91ZEZyb250RGlzdHJpYnV0aW9uRG9tYWluID0gcHJvY2Vzcy5lbnYuTU9PTkJFQU1fTUFJTl9GSUxFU19DTE9VREZST05UX0RJU1RSSUJVVElPTiE7XG5cbiAgICAgICAgICAgICAgICAvLyBmaXJzdCBtYWtlIHN1cmUgdGhhdCBpZiB0aGUgbGV2ZWwgdG8gYmUgcGFzc2VkIGluIGlzIHByaXZhdGUsIHRoYXQgYW4gSUQgaXMgYWxzbyBwYXNzZWQgaW5cbiAgICAgICAgICAgICAgICBpZiAoZ2V0U3RvcmFnZUlucHV0LmxldmVsID09PSBGaWxlQWNjZXNzTGV2ZWwuUHJpdmF0ZSAmJiAoIWdldFN0b3JhZ2VJbnB1dC5pZCB8fCBnZXRTdG9yYWdlSW5wdXQuaWQubGVuZ3RoID09PSAwKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgSW52YWxpZCBzdG9yYWdlIGlucHV0IG9iamVjdCBwYXNzZWQgaW4gZm9yICR7Z2V0U3RvcmFnZUlucHV0LmxldmVsfSBhY2Nlc3MsICR7SlNPTi5zdHJpbmdpZnkoZ2V0U3RvcmFnZUlucHV0KX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9YCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogU3RvcmFnZUVycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogSW5pdGlhbGl6ZSB0aGUga2V5IGZvciB0aGUgb2JqZWN0IHRoYXQgd2UncmUgYXR0ZW1wdGluZyB0byByZWFkXG4gICAgICAgICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAgICAgICAqIEluIGNhc2Ugb2Ygb2JqZWN0cyBzdG9yZWQgaW4gcHJpdmF0ZS9zdWIsIGJ5IGNhcHR1cmluZyB0aGUgY2FsbGVycyBDb2duaXRvIGlkZW50aXR5IGhlcmUsXG4gICAgICAgICAgICAgICAgICAgICAqIHBhc3NlZCBpbiB0aHJvdWdoIHRoZSBBcHBTeW5jRXZlbnQsIHdlIGd1YXJhbnRlZSB0aGF0IG9ubHkgYXV0aGVudGljYXRlZCB1c2VycyBjYW4gcmVhZFxuICAgICAgICAgICAgICAgICAgICAgKiBmcm9tIHRoZWlyIE9XTi9QUklWQVRFIGZvbGRlci5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG9iamVjdEtleSA9IGdldFN0b3JhZ2VJbnB1dC5sZXZlbCA9PT0gRmlsZUFjY2Vzc0xldmVsLlB1YmxpY1xuICAgICAgICAgICAgICAgICAgICAgICAgPyBgJHtnZXRTdG9yYWdlSW5wdXQubGV2ZWwudG9Mb3dlckNhc2UoKX0vJHtnZXRTdG9yYWdlSW5wdXQubmFtZX1gXG4gICAgICAgICAgICAgICAgICAgICAgICA6IGAke2dldFN0b3JhZ2VJbnB1dC5sZXZlbC50b0xvd2VyQ2FzZSgpfS8ke2dldFN0b3JhZ2VJbnB1dC5pZH0vJHtnZXRTdG9yYWdlSW5wdXQubmFtZX1gO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGNoZWNrIGlmIHRoZSBvYmplY3QgZXhpc3RzIGluIHRoZSBidWNrZXQsIHdpdGhvdXQgYWN0dWFsbHkgcmV0cmlldmluZyBpdCBmaXJzdC5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbWV0YWRhdGEgPSBhd2FpdCBzM0NsaWVudC5zZW5kKG5ldyBIZWFkT2JqZWN0Q29tbWFuZCgoe1xuICAgICAgICAgICAgICAgICAgICAgICAgQnVja2V0OiBidWNrZXROYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgS2V5OiBvYmplY3RLZXlcbiAgICAgICAgICAgICAgICAgICAgfSkpKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBpZiB0aGVyZSdzIGFuIGV4aXN0ZW50IG9iamVjdCwgd2l0aCB2YWxpZCBtZXRhZGF0YVxuICAgICAgICAgICAgICAgICAgICBpZiAobWV0YWRhdGEuTWV0YWRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBDbG91ZEZyb250IGRpc3RyaWJ1dGlvbiBzZWNyZXRzIGZvciB0aGUgbWFpbiBmaWxlIHR5cGVzLCBkZXBlbmRpbmcgb24gdGhlIGN1cnJlbnQgcmVnaW9uIGFuZCBlbnZpcm9ubWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2xvdWRGcm9udE1haW5GaWxlc1BhaXIgPSBhd2FpdCBzZWNyZXRzQ2xpZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnNlbmQobmV3IEdldFNlY3JldFZhbHVlQ29tbWFuZCgoe1NlY3JldElkOiBgJHtDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5NQUlOX0ZJTEVTX0NMT1VERlJPTlRfRElTVFJJQlVUSU9OX1NFQ1JFVF9OQU1FfS0ke3Byb2Nlc3MuZW52LkVOVl9OQU1FIX0tJHtyZWdpb259YH0pKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNoZWNrIGlmIHRoZSBzZWNyZXRzIGZvciB0aGUgQ2xvdWRGcm9udCBEaXN0cmlidXRpb24gZXhpc3RcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjbG91ZEZyb250TWFpbkZpbGVzUGFpci5TZWNyZXRTdHJpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBJZiB0aGVyZSBpcyBhbiBleHBpcmF0aW9uIGZsYWcgcGFzc2VkIGluLCBhbmQgaXQgaXMgdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiB0aGVuIG1ha2UgdGhlIGV4cGlyYXRpb24gdG8gMSBob3VyLCB0byBjb2luY2lkZSB3aXRoIHRoZSBDb2duaXRvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICogc2Vzc2lvbiBleHBpcmF0aW9uLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICogT3RoZXJ3aXNlLCBpZiB0aGUgZXhwaXJhdGlvbiBmbGFnIGlzIGZhbHNlLCB0aGVuIGRvIG1ha2UgdGhlIGxpbmsgZXhwaXJlIGluXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICogNTAgeWVhcnMuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGV4cGlyYXRpb25EYXRlOiBEYXRlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChnZXRTdG9yYWdlSW5wdXQuZXhwaXJlcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZ2V0U3RvcmFnZUlucHV0LmV4cGlyZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cGlyYXRpb25EYXRlID0gbmV3IERhdGUobmV3IERhdGUoKS5nZXRUaW1lKCkgKyA2MDAwMCAqIDYwICogMjQgKiAzNjUgKiA1MCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHBpcmF0aW9uRGF0ZSA9IG5ldyBEYXRlKG5ldyBEYXRlKCkuZ2V0VGltZSgpICsgNjAwMDAgKiA2MCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHBpcmF0aW9uRGF0ZSA9IG5ldyBEYXRlKG5ldyBEYXRlKCkuZ2V0VGltZSgpICsgNjAwMDAgKiA2MCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgc2lnbmVkIFVSTCBmb3IgdGhlIGdpdmVuIG9iamVjdCwgd2l0aCBhbiBleHBpcmF0aW9uIGRhdGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmw6IGdldFNpZ25lZFVybCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBgaHR0cHM6Ly8ke2Nsb3VkRnJvbnREaXN0cmlidXRpb25Eb21haW59LyR7b2JqZWN0S2V5fWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0ZUxlc3NUaGFuOiBleHBpcmF0aW9uRGF0ZS50b1N0cmluZygpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleVBhaXJJZDogcHJvY2Vzcy5lbnYuTU9PTkJFQU1fTUFJTl9GSUxFU19LRVlfUEFJUl9JRCEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJpdmF0ZUtleTogY2xvdWRGcm9udE1haW5GaWxlc1BhaXIuU2VjcmV0U3RyaW5nIVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNsb3VkRnJvbnREaXN0cmlidXRpb25QYWlyTWVzc2FnZSA9IGBDbG91ZEZyb250IERpc3RyaWJ1dGlvbiBzZWNyZXQgc3RyaW5nIG5vdCBhdmFpbGFibGUgJHtKU09OLnN0cmluZ2lmeShjbG91ZEZyb250TWFpbkZpbGVzUGFpcil9YDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Nsb3VkRnJvbnREaXN0cmlidXRpb25QYWlyTWVzc2FnZX1gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBjbG91ZEZyb250RGlzdHJpYnV0aW9uUGFpck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBTdG9yYWdlRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSByZXRyaWV2aW5nIG9iamVjdCAke2dldFN0b3JhZ2VJbnB1dC5uYW1lfSBtZXRhZGF0YWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX1gKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBTdG9yYWdlRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvcixcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFRvRG86IEFkZCBtb3JlIGNhc2VzIGRlcGVuZGluZyBvbiB0aGUgYnVja2V0cyB0aGF0IHdlIGhhdmVcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgY29uc3QgdW5rbm93bkZpbGVUeXBlRXJyb3IgPSBgVW5rbm93biBmaWxlIHR5cGUgJHtnZXRTdG9yYWdlSW5wdXQudHlwZX1gO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHVua25vd25GaWxlVHlwZUVycm9yKTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IHVua25vd25GaWxlVHlwZUVycm9yLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFN0b3JhZ2VFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyAke2ZpZWxkTmFtZX0gcXVlcnkgJHtlcnJ9YDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICBpZiAoZXJyICYmIGVyci5uYW1lICYmIGVyci5uYW1lID09PSAnTm90Rm91bmQnKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYE9iamVjdCBub3QgZm91bmQgJHtnZXRTdG9yYWdlSW5wdXQubmFtZX1gLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogU3RvcmFnZUVycm9yVHlwZS5Ob25lT3JBYnNlbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICBlcnJvclR5cGU6IFN0b3JhZ2VFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH07XG4gICAgfVxufVxuIl19