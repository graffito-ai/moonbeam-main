import {
    Constants,
    FileAccessLevel,
    FileType,
    PutStorageInput,
    StorageErrorType,
    StorageResponse
} from "@moonbeam/moonbeam-models";
import {HeadObjectCommand, S3Client} from "@aws-sdk/client-s3";
import {Upload} from "@aws-sdk/lib-storage";
import {GetSecretValueCommand, SecretsManagerClient} from "@aws-sdk/client-secrets-manager";
import {getSignedUrl} from "@aws-sdk/cloudfront-signer";

/**
 * PutStorage resolver
 *
 * @param putStorageInput input, based on which the appropriate file is uploaded in storage, and an
 * url is returned with its CloudFront distribution link
 * @param sub representing the Cognito identity of the user making this call
 *
 * @returns {@link Promise} of {@link StorageResponse}
 */
export const putStorage = async (putStorageInput: PutStorageInput, sub: string): Promise<StorageResponse> => {
    // retrieving the current function region
    const region = process.env.AWS_REGION!;

    // initializing any AWS SDK resources
    const s3Client = new S3Client({region: region});
    const secretsClient = new SecretsManagerClient({ region: region});

    // Initialize the bucket to upload files to. In the future if we have more buckets we need to change it
    const bucketName = `${Constants.MoonbeamConstants.MOONBEAM_MAIN_FILES_BUCKET_NAME}-${process.env.ENV_NAME!}-${region}`;

    // Initialize the CloudFront distribution domain, used to build the returned url
    const cloudFrontDistributionDomain = process.env.MOONBEAM_MAIN_FILES_CLOUDFRONT_DISTRIBUTION!;

    /**
     * Initialize the key for the object that we're attempting to upload to
     *
     * In case of objects stored in private/sub, by capturing the callers Cognito identity here,
     * passed in through the AppSyncEvent, we guarantee that only authenticated users can upload
     * to their OWN/PRIVATE folder.
     */
    const objectKey = putStorageInput.level === FileAccessLevel.Public
        ? `${putStorageInput.level.toLowerCase()}/${putStorageInput.name}`
        : `${putStorageInput.level.toLowerCase()}/${sub}/${putStorageInput.name}`;

    try {
        // switch based on the type of file to be uploaded
        switch (putStorageInput.type) {
            case FileType.Main:
                // check if the object exists in the bucket, without actually retrieving it first.
                const metadata = await s3Client.send(new HeadObjectCommand({
                    Bucket: bucketName,
                    Key: objectKey
                }));

                console.log(`metadata object result ${JSON.stringify(metadata)}`);

                // if there's an existent object, with valid metadata, then we can't upload one with the same name
                if (metadata.Metadata) {
                    const errorMessage = `${putStorageInput.name} file already exists`;
                    console.log(`${errorMessage}`);
                    return {
                        errorMessage: errorMessage,
                        errorType: StorageErrorType.DuplicateObjectFound,
                    }
                } else {
                    const errorMessage = `Invalid metadata obtained from S3 ${metadata}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: StorageErrorType.UnexpectedError
                    }
                }
            // ToDo: Add more cases depending on the buckets that we have
            default:
                const unknownFileTypeError = `Unknown file type ${putStorageInput.type}`;
                console.log(unknownFileTypeError);
                return {
                    errorMessage: unknownFileTypeError,
                    errorType: StorageErrorType.ValidationError
                }
        }
    } catch (err) {
        // @ts-ignore
        // if there is no existent object, then upload one
        if (err && err.name && err.name === 'NotFound') {
            try {
                // if there is not an object in storage with the same name, then upload one
                const uploadFileResponse = await new Upload({
                    leavePartsOnError: false,
                    client: s3Client,
                    params: {
                        Bucket: bucketName,
                        Key: objectKey,
                        Body: putStorageInput.content
                    }
                }).done();

                // check if the file was uploaded successfully or not
                if (uploadFileResponse.$metadata.httpStatusCode && uploadFileResponse.$metadata.httpStatusCode === 200) {
                    console.log(`File ${objectKey} uploaded successfully!`);

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
                        if (putStorageInput.expires !== undefined) {
                            if (!putStorageInput.expires) {
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
                } else {
                    const errorMessage = `Upload file failed with status ${uploadFileResponse.$metadata.httpStatusCode}, and metadata ${uploadFileResponse.$metadata}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: StorageErrorType.UnexpectedError
                    }
                }
            } catch (err) {
                const errorMessage = `Unexpected error while attempting to upload file ${err}`;
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: StorageErrorType.UnexpectedError
                }
            }
        } else {
            const errorMessage = `Unexpected error while executing putStorage query ${err}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: StorageErrorType.UnexpectedError
            };
        }
    }
}
