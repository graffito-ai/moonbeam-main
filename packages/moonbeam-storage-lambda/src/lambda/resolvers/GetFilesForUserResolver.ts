import {
    Constants,
    FileAccessLevel,
    FilesForUserResponse,
    FileType,
    GetFilesForUserInput,
    StorageErrorType
} from "@moonbeam/moonbeam-models";
import {ListObjectsV2Command, ListObjectsV2CommandOutput, S3Client} from "@aws-sdk/client-s3";

/**
 * GetFilesForUser resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getFilesForUserInput input, based on which the appropriate file are retrieved for a
 * given user, if applicable.
 *
 * @returns {@link Promise} of {@link FilesForUserResponse}
 */
export const getFilesForUser = async (fieldName: string, getFilesForUserInput: GetFilesForUserInput): Promise<FilesForUserResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing any AWS SDK resources
        const s3Client = new S3Client({region: region});

        // switch based on the type of files to be retrieved
        switch (getFilesForUserInput.type) {
            case FileType.Main:
                const bucketName = `${Constants.StorageConstants.MOONBEAM_MAIN_FILES_BUCKET_NAME}-${process.env.ENV_NAME!}-${region}`;

                /**
                 * Initialize the prefix for the objects that we're attempting to read, for a particular user.
                 */
                const prefix = getFilesForUserInput.level === FileAccessLevel.Public
                    ? `${getFilesForUserInput.level.toLowerCase()}/${getFilesForUserInput.id}`
                    : `${getFilesForUserInput.level.toLowerCase()}/${getFilesForUserInput.id}`;

                /**
                 * returns some or all (up to 1,000) of the objects in a bucket with each request, given the prefix above.
                 * We will then need to filter these objects to ensure that we have some of them with that given user id, in the name.
                 * If we do, we will return their names in the response.
                 *
                 * Due to the prefix that we're passing in, we won't have to swift through more than just a couple of records
                 * for that user id prefix, thus why we don't care about paginated requests, even though we might have more than
                 * 1,000 files in a bucket.
                 */
                const metadata: ListObjectsV2CommandOutput = await s3Client.send(new ListObjectsV2Command(({
                    Bucket: bucketName,
                    Prefix: prefix
                })));

                // if there are existent objects, then we return them appropriately, otherwise we will return a not found error
                if (metadata.$metadata.httpStatusCode !== undefined && metadata.$metadata.httpStatusCode === 200 &&
                    metadata.Contents !== undefined && metadata.Contents.length !== 0) {
                    // add each retrieved object's key in the list of object keys to return in the response
                    const objectKeyList: string[] = [];
                    metadata.Contents.forEach(retrievedObject => {
                        retrievedObject.Key !== undefined && objectKeyList.push(retrievedObject.Key)
                    });

                    // return the appropriate retrieved object keys in the response
                    return {
                        data: objectKeyList
                    }
                } else {
                    if ((metadata.$metadata.httpStatusCode !== undefined && metadata.$metadata.httpStatusCode === 404) || (metadata.Contents === undefined || metadata.Contents.length === 0)) {
                        const notFoundMessage = `Objects not found for user: ${getFilesForUserInput.id}`;
                        console.log(notFoundMessage);
                        return {
                            errorMessage: notFoundMessage,
                            errorType: StorageErrorType.NoneOrAbsent
                        }
                    } else {
                        const invalidMetadataError = `Invalid metadata returned for ${getFilesForUserInput.type}`;
                        console.log(`${invalidMetadataError} ${JSON.stringify(metadata)}`);
                        return {
                            errorMessage: invalidMetadataError,
                            errorType: StorageErrorType.ValidationError
                        }
                    }
                }
            // ToDo: Add more cases depending on the buckets that we have
            default:
                const unknownFileTypeError = `Unknown file type ${getFilesForUserInput.type}`;
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
                errorMessage: `Objects not found for user: ${getFilesForUserInput.id}`,
                errorType: StorageErrorType.NoneOrAbsent
            }
        }
        return {
            errorMessage: errorMessage,
            errorType: StorageErrorType.UnexpectedError
        };
    }
}
