import {
    Constants,
    FileAccessLevel,
    FileType,
    GetStorageInput,
    StorageErrorType,
    StorageResponse
} from "@moonbeam/moonbeam-models";
import {HeadObjectCommand, S3Client} from "@aws-sdk/client-s3";
import {GetSecretValueCommand, SecretsManagerClient} from "@aws-sdk/client-secrets-manager";
import {getSignedUrl} from "@aws-sdk/cloudfront-signer";

/**
 * GetStorage resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getStorageInput input, based on which the appropriate file is retrieved from storage, through
 * a CloudFront distribution
 *
 * @returns {@link Promise} of {@link StorageResponse}
 */
export const getStorage = async (fieldName: string, getStorageInput: GetStorageInput): Promise<StorageResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing any AWS SDK resources
        const s3Client = new S3Client({region: region});
        const secretsClient = new SecretsManagerClient({ region: region});

        // switch based on the type of file to be retrieved
        switch (getStorageInput.type) {
            case FileType.Main:
                const bucketName = `${Constants.StorageConstants.MOONBEAM_MAIN_FILES_BUCKET_NAME}-${process.env.ENV_NAME!}-${region}`;
                const cloudFrontDistributionDomain = process.env.MOONBEAM_MAIN_FILES_CLOUDFRONT_DISTRIBUTION!;

                // first make sure that if the level to be passed in is private, that an ID is also passed in
                if (getStorageInput.level === FileAccessLevel.Private && (!getStorageInput.id || getStorageInput.id.length === 0)) {
                    const errorMessage = `Invalid storage input object passed in for ${getStorageInput.level} access, ${JSON.stringify(getStorageInput)}`;
                    console.log(`${errorMessage}`);
                    return {
                        errorMessage: errorMessage,
                        errorType: StorageErrorType.ValidationError,
                    }
                } else {
                    /**
                     * Initialize the key for the object that we're attempting to read
                     *
                     * In case of objects stored in private/sub, by capturing the callers Cognito identity here,
                     * passed in through the AppSyncEvent, we guarantee that only authenticated users can read
                     * from their OWN/PRIVATE folder.
                     */
                    const objectKey = getStorageInput.level === FileAccessLevel.Public
                        ? `${getStorageInput.level.toLowerCase()}/${getStorageInput.name}`
                        : `${getStorageInput.level.toLowerCase()}/${getStorageInput.id}/${getStorageInput.name}`;

                    // check if the object exists in the bucket, without actually retrieving it first.
                    const metadata = await s3Client.send(new HeadObjectCommand(({
                        Bucket: bucketName,
                        Key: objectKey
                    })));

                    // if there's an existent object, with valid metadata
                    if (metadata.Metadata && metadata.$metadata.httpStatusCode !== undefined && metadata.$metadata.httpStatusCode === 200) {
                        // retrieve the CloudFront distribution secrets for the main file types, depending on the current region and environment
                        const cloudFrontMainFilesPair = await secretsClient
                            .send(new GetSecretValueCommand(({SecretId: `${Constants.AWSPairConstants.MAIN_FILES_CLOUDFRONT_DISTRIBUTION_SECRET_NAME}-${process.env.ENV_NAME!}-${region}`})));

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
                            let expirationDate: Date;
                            if (getStorageInput.expires !== undefined) {
                                if (!getStorageInput.expires) {
                                    expirationDate = new Date(new Date().getTime() + 60000 * 60 * 24 * 365 * 50);
                                } else {
                                    expirationDate = new Date(new Date().getTime() + 60000 * 60);
                                }
                            } else {
                                expirationDate = new Date(new Date().getTime() + 60000 * 60);
                            }
                            // return the signed URL for the given object, with an expiration date
                            return {
                                data: {
                                    url: getSignedUrl({
                                        url: `https://${cloudFrontDistributionDomain}/${objectKey}`,
                                        dateLessThan: expirationDate.toString(),
                                        keyPairId: process.env.MOONBEAM_MAIN_FILES_KEY_PAIR_ID!,
                                        privateKey: cloudFrontMainFilesPair.SecretString!
                                    })
                                }
                            }
                        }
                        const cloudFrontDistributionPairMessage = `CloudFront Distribution secret string not available ${JSON.stringify(cloudFrontMainFilesPair)}`;
                        console.log(`${cloudFrontDistributionPairMessage}`);
                        return {
                            errorMessage: cloudFrontDistributionPairMessage,
                            errorType: StorageErrorType.UnexpectedError,
                        }
                    }
                    const errorMessage = `Unexpected error while retrieving object ${getStorageInput.name} metadata`;
                    console.log(`${errorMessage}`);
                    return {
                        errorMessage: errorMessage,
                        errorType: StorageErrorType.UnexpectedError,
                    }
                }
            // ToDo: Add more cases depending on the buckets that we have
            default:
                const unknownFileTypeError = `Unknown file type ${getStorageInput.type}`;
                console.log(unknownFileTypeError);
                return {
                    errorMessage: unknownFileTypeError,
                    errorType: StorageErrorType.ValidationError
                }
        }
    } catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
        console.log(errorMessage);
        // @ts-ignore
        if (err && err.name && err.name === 'NotFound') {
            return {
                errorMessage: `Object not found ${getStorageInput.name}`,
                errorType: StorageErrorType.NoneOrAbsent
            }
        }
        return {
            errorMessage: errorMessage,
            errorType: StorageErrorType.UnexpectedError
        };
    }
}
