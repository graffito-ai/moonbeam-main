import {
    Constants,
    FileAccessLevel,
    FileType,
    GetStorageInput,
    StorageErrorType,
    StorageResponse
} from "@moonbeam/moonbeam-models";
import * as AWS from "aws-sdk";

/**
 * GetStorage resolver
 *
 * @param getStorageInput input, based on which the appropriate file is retrieved from storage, through
 * a CloudFront distribution
 * @param sub representing the Cognito identity of the user making this call
 *
 * @returns {@link Promise} of {@link StorageResponse}
 */
export const getStorage = async (getStorageInput: GetStorageInput, sub: string): Promise<StorageResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // switch based on the type of file to be retrieved
        switch (getStorageInput.type) {
            case FileType.Main:
                const bucketName = `${Constants.MoonbeamConstants.MOONBEAM_MAIN_FILES_BUCKET_NAME}-${process.env.ENV_NAME!}-${region}`;
                const cloudFrontDistributionDomain = process.env.MOONBEAM_MAIN_FILES_CLOUDFRONT_DISTRIBUTION!;

                // check if the object exists in the bucket, without actually retrieving it first.
                const objectKey = getStorageInput.level === FileAccessLevel.Public
                    ? `${getStorageInput.level.toLowerCase()}/${getStorageInput.name}`
                    : `${getStorageInput.level.toLowerCase()}/${sub}/${getStorageInput.name}`;
                console.log(`Object key is ${objectKey}`);
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
                        .getSecretValue({SecretId: `${Constants.AWSPairConstants.MAIN_FILES_CLOUDFRONT_DISTRIBUTION_SECRET_NAME}-${process.env.ENV_NAME!}-${region}`}).promise();

                    // check if the secrets for the CloudFront Distribution exist
                    if (cloudFrontMainFilesPair.SecretString) {
                        /**
                         * initialize a new CloudFront Distribution URL signer, through the private key obtained from the Secrets Manager pair,
                         * and the key pair id, obtained from the function's environment variables.
                         */
                        const cloudFrontURLSigner = new AWS.CloudFront.Signer(`${process.env.MOONBEAM_MAIN_FILES_KEY_PAIR_ID!}`, `${cloudFrontMainFilesPair.SecretString!}`);

                        // return the signed URL for the given object, with an expiration date
                        /**
                         * If there is an expiration flag passed in, and it is true,
                         * then make the expiration to 1 hour, to coincide with the Cognito
                         * session expiration.
                         *
                         * Otherwise, if the expiration flag is false, then do make the link expire in
                         * 50 years.
                         */
                        let expirationTimestamp: number;
                        if (getStorageInput.expires !== undefined) {
                            if (!getStorageInput.expires) {
                                expirationTimestamp = parseInt(String((new Date().getTime() + 60000 * 60 * 24 * 365 * 50) / 1000));
                            } else {
                                expirationTimestamp = parseInt(String((new Date().getTime() + 60000 * 60) / 1000));
                            }
                        } else {
                            expirationTimestamp = parseInt(String((new Date().getTime() + 60000 * 60) / 1000));
                        }
                        return {
                            data: {
                                url: new URL(cloudFrontURLSigner.getSignedUrl({
                                    url: `https://${cloudFrontDistributionDomain}/${objectKey}`,
                                    expires: expirationTimestamp
                                })).href
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
            default:
                const unknownFileTypeError = `Unknown file type ${getStorageInput.type}`;
                console.log(unknownFileTypeError);
                return {
                    errorMessage: unknownFileTypeError,
                    errorType: StorageErrorType.ValidationError
                }
        }
    } catch (err) {
        console.log(`Unexpected error while executing getStorage query {}`, err);
        // @ts-ignore
        if (err && err.code && err.code === 'NotFound') {
            return {
                errorMessage: `Object not found ${getStorageInput.name}`,
                errorType: StorageErrorType.NoneOrAbsent
            }
        }
        return {
            errorMessage: `Unexpected error while executing getStorage query ${err}`,
            errorType: StorageErrorType.UnexpectedError
        };
    }
}
