"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStorage = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const AWS = __importStar(require("aws-sdk"));
/**
 * GetStorage resolver
 *
 * @param getStorageInput input, based on which the appropriate file is retrieved from storage, through
 * a CloudFront distribution
 *
 * @returns {@link Promise} of {@link StorageResponse}
 */
const getStorage = async (getStorageInput) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // switch based on the type of file to be retrieved
        switch (getStorageInput.type) {
            case moonbeam_models_1.FileType.Main:
                const bucketName = `${moonbeam_models_1.Constants.MoonbeamConstants.MOONBEAM_MAIN_FILES_BUCKET_NAME}-${process.env.ENV_NAME}-${region}`;
                const cloudFrontDistributionDomain = process.env.MOONBEAM_MAIN_FILES_CLOUDFRONT_DISTRIBUTION;
                // check if the object exists in the bucket, without actually retrieving it first.
                const objectKey = `${getStorageInput.level.toLowerCase()}/${getStorageInput.name}`;
                const metadata = await new AWS.S3().headObject({
                    Bucket: bucketName,
                    Key: objectKey
                }).promise();
                // if there's an existent object, with valid metadata
                if (metadata.Metadata) {
                    // initializing the AWS Secrets Manager client
                    const secretsClient = new AWS.SecretsManager({
                        region: region,
                    });
                    // retrieve the CloudFront distribution secrets for the main file types, depending on the current region and environment
                    const cloudFrontMainFilesPair = await secretsClient
                        .getSecretValue({ SecretId: `${moonbeam_models_1.Constants.AWSPairConstants.MAIN_FILES_CLOUDFRONT_DISTRIBUTION_SECRET_NAME}-${process.env.ENV_NAME}-${region}` }).promise();
                    // check if the secrets for the CloudFront Distribution exist
                    if (cloudFrontMainFilesPair.SecretString) {
                        // convert the retrieved secrets pair value, as a JSON object
                        const cloudFrontMainFilesPairAsJson = JSON.parse(cloudFrontMainFilesPair.SecretString);
                        /**
                         * initialize a new CloudFront Distribution URL signer, through the private key obtained from the Secrets Manager pair,
                         * and the key pair id, obtained from the function's environment variables.
                         */
                        const cloudFrontURLSigner = new AWS.CloudFront.Signer(`${process.env.MOONBEAM_MAIN_FILES_KEY_PAIR_ID}`, `${cloudFrontMainFilesPairAsJson[moonbeam_models_1.Constants.AWSPairConstants.MAIN_FILES_CLOUDFRONT_PRIVATE_KEY]}`);
                        // return the signed URL for the given object, with an expiration date
                        return {
                            data: {
                                url: cloudFrontURLSigner.getSignedUrl({
                                    url: `https://${cloudFrontDistributionDomain}/${objectKey}`,
                                    expires: new Date(Date.now() + 1000 * 60 * 60).getUTCDate() // expires in 1 hour, to coincide with the Cognito session expiry
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
        console.log(`Unexpected error while executing getStorage query {}`, err);
        // @ts-ignore
        if (err && err.code && err.code === 'NotFound') {
            return {
                errorMessage: `Object not found ${getStorageInput.name}`,
                errorType: moonbeam_models_1.StorageErrorType.NoneOrAbsent
            };
        }
        return {
            errorMessage: `Unexpected error while executing getStorage query ${err}`,
            errorType: moonbeam_models_1.StorageErrorType.UnexpectedError
        };
    }
};
exports.getStorage = getStorage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0U3RvcmFnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL2dldFN0b3JhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSwrREFBa0g7QUFDbEgsNkNBQStCO0FBRS9COzs7Ozs7O0dBT0c7QUFDSSxNQUFNLFVBQVUsR0FBRyxLQUFLLEVBQUUsZUFBZ0MsRUFBNEIsRUFBRTtJQUMzRixJQUFJO1FBQ0EseUNBQXlDO1FBQ3pDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVyxDQUFDO1FBRXZDLG1EQUFtRDtRQUNuRCxRQUFRLGVBQWUsQ0FBQyxJQUFJLEVBQUU7WUFDMUIsS0FBSywwQkFBUSxDQUFDLElBQUk7Z0JBQ2QsTUFBTSxVQUFVLEdBQUcsR0FBRywyQkFBUyxDQUFDLGlCQUFpQixDQUFDLCtCQUErQixJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUyxJQUFJLE1BQU0sRUFBRSxDQUFDO2dCQUN2SCxNQUFNLDRCQUE0QixHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsMkNBQTRDLENBQUM7Z0JBRTlGLGtGQUFrRjtnQkFDbEYsTUFBTSxTQUFTLEdBQUcsR0FBRyxlQUFlLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxJQUFJLGVBQWUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbkYsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUM7b0JBQzNDLE1BQU0sRUFBRSxVQUFVO29CQUNsQixHQUFHLEVBQUUsU0FBUztpQkFDakIsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUViLHFEQUFxRDtnQkFDckQsSUFBSSxRQUFRLENBQUMsUUFBUSxFQUFFO29CQUNuQiw4Q0FBOEM7b0JBQzlDLE1BQU0sYUFBYSxHQUFHLElBQUksR0FBRyxDQUFDLGNBQWMs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LCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NvbnN0YW50cywgRmlsZVR5cGUsIEdldFN0b3JhZ2VJbnB1dCwgU3RvcmFnZUVycm9yVHlwZSwgU3RvcmFnZVJlc3BvbnNlfSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuaW1wb3J0ICogYXMgQVdTIGZyb20gXCJhd3Mtc2RrXCI7XG5cbi8qKlxuICogR2V0U3RvcmFnZSByZXNvbHZlclxuICpcbiAqIEBwYXJhbSBnZXRTdG9yYWdlSW5wdXQgaW5wdXQsIGJhc2VkIG9uIHdoaWNoIHRoZSBhcHByb3ByaWF0ZSBmaWxlIGlzIHJldHJpZXZlZCBmcm9tIHN0b3JhZ2UsIHRocm91Z2hcbiAqIGEgQ2xvdWRGcm9udCBkaXN0cmlidXRpb25cbiAqXG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIFN0b3JhZ2VSZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IGdldFN0b3JhZ2UgPSBhc3luYyAoZ2V0U3RvcmFnZUlucHV0OiBHZXRTdG9yYWdlSW5wdXQpOiBQcm9taXNlPFN0b3JhZ2VSZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8vIHN3aXRjaCBiYXNlZCBvbiB0aGUgdHlwZSBvZiBmaWxlIHRvIGJlIHJldHJpZXZlZFxuICAgICAgICBzd2l0Y2ggKGdldFN0b3JhZ2VJbnB1dC50eXBlKSB7XG4gICAgICAgICAgICBjYXNlIEZpbGVUeXBlLk1haW46XG4gICAgICAgICAgICAgICAgY29uc3QgYnVja2V0TmFtZSA9IGAke0NvbnN0YW50cy5Nb29uYmVhbUNvbnN0YW50cy5NT09OQkVBTV9NQUlOX0ZJTEVTX0JVQ0tFVF9OQU1FfS0ke3Byb2Nlc3MuZW52LkVOVl9OQU1FIX0tJHtyZWdpb259YDtcbiAgICAgICAgICAgICAgICBjb25zdCBjbG91ZEZyb250RGlzdHJpYnV0aW9uRG9tYWluID0gcHJvY2Vzcy5lbnYuTU9PTkJFQU1fTUFJTl9GSUxFU19DTE9VREZST05UX0RJU1RSSUJVVElPTiE7XG5cbiAgICAgICAgICAgICAgICAvLyBjaGVjayBpZiB0aGUgb2JqZWN0IGV4aXN0cyBpbiB0aGUgYnVja2V0LCB3aXRob3V0IGFjdHVhbGx5IHJldHJpZXZpbmcgaXQgZmlyc3QuXG4gICAgICAgICAgICAgICAgY29uc3Qgb2JqZWN0S2V5ID0gYCR7Z2V0U3RvcmFnZUlucHV0LmxldmVsLnRvTG93ZXJDYXNlKCl9LyR7Z2V0U3RvcmFnZUlucHV0Lm5hbWV9YDtcbiAgICAgICAgICAgICAgICBjb25zdCBtZXRhZGF0YSA9IGF3YWl0IG5ldyBBV1MuUzMoKS5oZWFkT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgQnVja2V0OiBidWNrZXROYW1lLFxuICAgICAgICAgICAgICAgICAgICBLZXk6IG9iamVjdEtleVxuICAgICAgICAgICAgICAgIH0pLnByb21pc2UoKTtcblxuICAgICAgICAgICAgICAgIC8vIGlmIHRoZXJlJ3MgYW4gZXhpc3RlbnQgb2JqZWN0LCB3aXRoIHZhbGlkIG1ldGFkYXRhXG4gICAgICAgICAgICAgICAgaWYgKG1ldGFkYXRhLk1ldGFkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGluaXRpYWxpemluZyB0aGUgQVdTIFNlY3JldHMgTWFuYWdlciBjbGllbnRcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2VjcmV0c0NsaWVudCA9IG5ldyBBV1MuU2VjcmV0c01hbmFnZXIoe1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVnaW9uOiByZWdpb24sXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBDbG91ZEZyb250IGRpc3RyaWJ1dGlvbiBzZWNyZXRzIGZvciB0aGUgbWFpbiBmaWxlIHR5cGVzLCBkZXBlbmRpbmcgb24gdGhlIGN1cnJlbnQgcmVnaW9uIGFuZCBlbnZpcm9ubWVudFxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjbG91ZEZyb250TWFpbkZpbGVzUGFpciA9IGF3YWl0IHNlY3JldHNDbGllbnRcbiAgICAgICAgICAgICAgICAgICAgICAgIC5nZXRTZWNyZXRWYWx1ZSh7U2VjcmV0SWQ6IGAke0NvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLk1BSU5fRklMRVNfQ0xPVURGUk9OVF9ESVNUUklCVVRJT05fU0VDUkVUX05BTUV9LSR7cHJvY2Vzcy5lbnYuRU5WX05BTUUhfS0ke3JlZ2lvbn1gfSkucHJvbWlzZSgpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGNoZWNrIGlmIHRoZSBzZWNyZXRzIGZvciB0aGUgQ2xvdWRGcm9udCBEaXN0cmlidXRpb24gZXhpc3RcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNsb3VkRnJvbnRNYWluRmlsZXNQYWlyLlNlY3JldFN0cmluZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29udmVydCB0aGUgcmV0cmlldmVkIHNlY3JldHMgcGFpciB2YWx1ZSwgYXMgYSBKU09OIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2xvdWRGcm9udE1haW5GaWxlc1BhaXJBc0pzb24gPSBKU09OLnBhcnNlKGNsb3VkRnJvbnRNYWluRmlsZXNQYWlyLlNlY3JldFN0cmluZyEpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIGluaXRpYWxpemUgYSBuZXcgQ2xvdWRGcm9udCBEaXN0cmlidXRpb24gVVJMIHNpZ25lciwgdGhyb3VnaCB0aGUgcHJpdmF0ZSBrZXkgb2J0YWluZWQgZnJvbSB0aGUgU2VjcmV0cyBNYW5hZ2VyIHBhaXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBhbmQgdGhlIGtleSBwYWlyIGlkLCBvYnRhaW5lZCBmcm9tIHRoZSBmdW5jdGlvbidzIGVudmlyb25tZW50IHZhcmlhYmxlcy5cbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2xvdWRGcm9udFVSTFNpZ25lciA9IG5ldyBBV1MuQ2xvdWRGcm9udC5TaWduZXIoYCR7cHJvY2Vzcy5lbnYuTU9PTkJFQU1fTUFJTl9GSUxFU19LRVlfUEFJUl9JRCF9YCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgJHtjbG91ZEZyb250TWFpbkZpbGVzUGFpckFzSnNvbltDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5NQUlOX0ZJTEVTX0NMT1VERlJPTlRfUFJJVkFURV9LRVldfWApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIHNpZ25lZCBVUkwgZm9yIHRoZSBnaXZlbiBvYmplY3QsIHdpdGggYW4gZXhwaXJhdGlvbiBkYXRlXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBjbG91ZEZyb250VVJMU2lnbmVyLmdldFNpZ25lZFVybCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmw6IGBodHRwczovLyR7Y2xvdWRGcm9udERpc3RyaWJ1dGlvbkRvbWFpbn0vJHtvYmplY3RLZXl9YCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cGlyZXM6IG5ldyBEYXRlKERhdGUubm93KCkgKyAxMDAwICogNjAgKiA2MCkuZ2V0VVRDRGF0ZSgpIC8vIGV4cGlyZXMgaW4gMSBob3VyLCB0byBjb2luY2lkZSB3aXRoIHRoZSBDb2duaXRvIHNlc3Npb24gZXhwaXJ5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNsb3VkRnJvbnREaXN0cmlidXRpb25QYWlyTWVzc2FnZSA9IGBDbG91ZEZyb250IERpc3RyaWJ1dGlvbiBzZWNyZXQgc3RyaW5nIG5vdCBhdmFpbGFibGUgJHtKU09OLnN0cmluZ2lmeShjbG91ZEZyb250TWFpbkZpbGVzUGFpcil9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7Y2xvdWRGcm9udERpc3RyaWJ1dGlvblBhaXJNZXNzYWdlfWApO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBjbG91ZEZyb250RGlzdHJpYnV0aW9uUGFpck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFN0b3JhZ2VFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yLFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHJldHJpZXZpbmcgb2JqZWN0ICR7Z2V0U3RvcmFnZUlucHV0Lm5hbWV9IG1ldGFkYXRhYDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9YCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogU3RvcmFnZUVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3IsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBjb25zdCB1bmtub3duRmlsZVR5cGVFcnJvciA9IGBVbmtub3duIGZpbGUgdHlwZSAke2dldFN0b3JhZ2VJbnB1dC50eXBlfWA7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2codW5rbm93bkZpbGVUeXBlRXJyb3IpO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogdW5rbm93bkZpbGVUeXBlRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogU3RvcmFnZUVycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5sb2coYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nIGdldFN0b3JhZ2UgcXVlcnkge31gLCBlcnIpO1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIGlmIChlcnIgJiYgZXJyLmNvZGUgJiYgZXJyLmNvZGUgPT09ICdOb3RGb3VuZCcpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgT2JqZWN0IG5vdCBmb3VuZCAke2dldFN0b3JhZ2VJbnB1dC5uYW1lfWAsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBTdG9yYWdlRXJyb3JUeXBlLk5vbmVPckFic2VudFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyBnZXRTdG9yYWdlIHF1ZXJ5ICR7ZXJyfWAsXG4gICAgICAgICAgICBlcnJvclR5cGU6IFN0b3JhZ2VFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH07XG4gICAgfVxufVxuIl19