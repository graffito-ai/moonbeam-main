"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFilesForUser = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const client_s3_1 = require("@aws-sdk/client-s3");
/**
 * GetFilesForUser resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getFilesForUserInput input, based on which the appropriate file are retrieved for a
 * given user, if applicable.
 *
 * @returns {@link Promise} of {@link FilesForUserResponse}
 */
const getFilesForUser = async (fieldName, getFilesForUserInput) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // initializing any AWS SDK resources
        const s3Client = new client_s3_1.S3Client({ region: region });
        // switch based on the type of files to be retrieved
        switch (getFilesForUserInput.type) {
            case moonbeam_models_1.FileType.Main:
                const bucketName = `${moonbeam_models_1.Constants.StorageConstants.MOONBEAM_MAIN_FILES_BUCKET_NAME}-${process.env.ENV_NAME}-${region}`;
                /**
                 * Initialize the prefix for the objects that we're attempting to read, for a particular user.
                 */
                const prefix = getFilesForUserInput.level === moonbeam_models_1.FileAccessLevel.Public
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
                const metadata = await s3Client.send(new client_s3_1.ListObjectsV2Command(({
                    Bucket: bucketName,
                    Prefix: prefix
                })));
                // if there are existent objects, then we return them appropriately, otherwise we will return a not found error
                if (metadata.$metadata.httpStatusCode !== undefined && metadata.$metadata.httpStatusCode === 200 &&
                    metadata.Contents !== undefined && metadata.Contents.length !== 0) {
                    // add each retrieved object's key in the list of object keys to return in the response
                    const objectKeyList = [];
                    metadata.Contents.forEach(retrievedObject => {
                        retrievedObject.Key !== undefined && objectKeyList.push(retrievedObject.Key);
                    });
                    // return the appropriate retrieved object keys in the response
                    return {
                        data: objectKeyList
                    };
                }
                else {
                    if ((metadata.$metadata.httpStatusCode !== undefined && metadata.$metadata.httpStatusCode === 404) || (metadata.Contents === undefined || metadata.Contents.length === 0)) {
                        const notFoundMessage = `Objects not found for user: ${getFilesForUserInput.id}`;
                        console.log(notFoundMessage);
                        return {
                            errorMessage: notFoundMessage,
                            errorType: moonbeam_models_1.StorageErrorType.NoneOrAbsent
                        };
                    }
                    else {
                        const invalidMetadataError = `Invalid metadata returned for ${getFilesForUserInput.type}`;
                        console.log(`${invalidMetadataError} ${JSON.stringify(metadata)}`);
                        return {
                            errorMessage: invalidMetadataError,
                            errorType: moonbeam_models_1.StorageErrorType.ValidationError
                        };
                    }
                }
            // ToDo: Add more cases depending on the buckets that we have
            default:
                const unknownFileTypeError = `Unknown file type ${getFilesForUserInput.type}`;
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
                errorMessage: `Objects not found for user: ${getFilesForUserInput.id}`,
                errorType: moonbeam_models_1.StorageErrorType.NoneOrAbsent
            };
        }
        return {
            errorMessage: errorMessage,
            errorType: moonbeam_models_1.StorageErrorType.UnexpectedError
        };
    }
};
exports.getFilesForUser = getFilesForUser;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0RmlsZXNGb3JVc2VyUmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL3Jlc29sdmVycy9HZXRGaWxlc0ZvclVzZXJSZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwrREFPbUM7QUFDbkMsa0RBQThGO0FBRTlGOzs7Ozs7OztHQVFHO0FBQ0ksTUFBTSxlQUFlLEdBQUcsS0FBSyxFQUFFLFNBQWlCLEVBQUUsb0JBQTBDLEVBQWlDLEVBQUU7SUFDbEksSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2QyxxQ0FBcUM7UUFDckMsTUFBTSxRQUFRLEdBQUcsSUFBSSxvQkFBUSxDQUFDLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7UUFFaEQsb0RBQW9EO1FBQ3BELFFBQVEsb0JBQW9CLENBQUMsSUFBSSxFQUFFO1lBQy9CLEtBQUssMEJBQVEsQ0FBQyxJQUFJO2dCQUNkLE1BQU0sVUFBVSxHQUFHLEdBQUcsMkJBQVMsQ0FBQyxnQkFBZ0IsQ0FBQywrQkFBK0IsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVMsSUFBSSxNQUFNLEVBQUUsQ0FBQztnQkFFdEg7O21CQUVHO2dCQUNILE1BQU0sTUFBTSxHQUFHLG9CQUFvQixDQUFDLEtBQUssS0FBSyxpQ0FBZSxDQUFDLE1BQU07b0JBQ2hFLENBQUMsQ0FBQyxHQUFHLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsSUFBSSxvQkFBb0IsQ0FBQyxFQUFFLEVBQUU7b0JBQzFFLENBQUMsQ0FBQyxHQUFHLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsSUFBSSxvQkFBb0IsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFFL0U7Ozs7Ozs7O21CQVFHO2dCQUNILE1BQU0sUUFBUSxHQUErQixNQUFNLFFBQVEsQ0FBQyxJ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dGVudCI6WyJpbXBvcnQge1xuICAgIENvbnN0YW50cyxcbiAgICBGaWxlQWNjZXNzTGV2ZWwsXG4gICAgRmlsZXNGb3JVc2VyUmVzcG9uc2UsXG4gICAgRmlsZVR5cGUsXG4gICAgR2V0RmlsZXNGb3JVc2VySW5wdXQsXG4gICAgU3RvcmFnZUVycm9yVHlwZVxufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuaW1wb3J0IHtMaXN0T2JqZWN0c1YyQ29tbWFuZCwgTGlzdE9iamVjdHNWMkNvbW1hbmRPdXRwdXQsIFMzQ2xpZW50fSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LXMzXCI7XG5cbi8qKlxuICogR2V0RmlsZXNGb3JVc2VyIHJlc29sdmVyXG4gKlxuICogQHBhcmFtIGZpZWxkTmFtZSBuYW1lIG9mIHRoZSByZXNvbHZlciBwYXRoIGZyb20gdGhlIEFwcFN5bmMgZXZlbnRcbiAqIEBwYXJhbSBnZXRGaWxlc0ZvclVzZXJJbnB1dCBpbnB1dCwgYmFzZWQgb24gd2hpY2ggdGhlIGFwcHJvcHJpYXRlIGZpbGUgYXJlIHJldHJpZXZlZCBmb3IgYVxuICogZ2l2ZW4gdXNlciwgaWYgYXBwbGljYWJsZS5cbiAqXG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIEZpbGVzRm9yVXNlclJlc3BvbnNlfVxuICovXG5leHBvcnQgY29uc3QgZ2V0RmlsZXNGb3JVc2VyID0gYXN5bmMgKGZpZWxkTmFtZTogc3RyaW5nLCBnZXRGaWxlc0ZvclVzZXJJbnB1dDogR2V0RmlsZXNGb3JVc2VySW5wdXQpOiBQcm9taXNlPEZpbGVzRm9yVXNlclJlc3BvbnNlPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLy8gaW5pdGlhbGl6aW5nIGFueSBBV1MgU0RLIHJlc291cmNlc1xuICAgICAgICBjb25zdCBzM0NsaWVudCA9IG5ldyBTM0NsaWVudCh7cmVnaW9uOiByZWdpb259KTtcblxuICAgICAgICAvLyBzd2l0Y2ggYmFzZWQgb24gdGhlIHR5cGUgb2YgZmlsZXMgdG8gYmUgcmV0cmlldmVkXG4gICAgICAgIHN3aXRjaCAoZ2V0RmlsZXNGb3JVc2VySW5wdXQudHlwZSkge1xuICAgICAgICAgICAgY2FzZSBGaWxlVHlwZS5NYWluOlxuICAgICAgICAgICAgICAgIGNvbnN0IGJ1Y2tldE5hbWUgPSBgJHtDb25zdGFudHMuU3RvcmFnZUNvbnN0YW50cy5NT09OQkVBTV9NQUlOX0ZJTEVTX0JVQ0tFVF9OQU1FfS0ke3Byb2Nlc3MuZW52LkVOVl9OQU1FIX0tJHtyZWdpb259YDtcblxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIEluaXRpYWxpemUgdGhlIHByZWZpeCBmb3IgdGhlIG9iamVjdHMgdGhhdCB3ZSdyZSBhdHRlbXB0aW5nIHRvIHJlYWQsIGZvciBhIHBhcnRpY3VsYXIgdXNlci5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBjb25zdCBwcmVmaXggPSBnZXRGaWxlc0ZvclVzZXJJbnB1dC5sZXZlbCA9PT0gRmlsZUFjY2Vzc0xldmVsLlB1YmxpY1xuICAgICAgICAgICAgICAgICAgICA/IGAke2dldEZpbGVzRm9yVXNlcklucHV0LmxldmVsLnRvTG93ZXJDYXNlKCl9LyR7Z2V0RmlsZXNGb3JVc2VySW5wdXQuaWR9YFxuICAgICAgICAgICAgICAgICAgICA6IGAke2dldEZpbGVzRm9yVXNlcklucHV0LmxldmVsLnRvTG93ZXJDYXNlKCl9LyR7Z2V0RmlsZXNGb3JVc2VySW5wdXQuaWR9YDtcblxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIHJldHVybnMgc29tZSBvciBhbGwgKHVwIHRvIDEsMDAwKSBvZiB0aGUgb2JqZWN0cyBpbiBhIGJ1Y2tldCB3aXRoIGVhY2ggcmVxdWVzdCwgZ2l2ZW4gdGhlIHByZWZpeCBhYm92ZS5cbiAgICAgICAgICAgICAgICAgKiBXZSB3aWxsIHRoZW4gbmVlZCB0byBmaWx0ZXIgdGhlc2Ugb2JqZWN0cyB0byBlbnN1cmUgdGhhdCB3ZSBoYXZlIHNvbWUgb2YgdGhlbSB3aXRoIHRoYXQgZ2l2ZW4gdXNlciBpZCwgaW4gdGhlIG5hbWUuXG4gICAgICAgICAgICAgICAgICogSWYgd2UgZG8sIHdlIHdpbGwgcmV0dXJuIHRoZWlyIG5hbWVzIGluIHRoZSByZXNwb25zZS5cbiAgICAgICAgICAgICAgICAgKlxuICAgICAgICAgICAgICAgICAqIER1ZSB0byB0aGUgcHJlZml4IHRoYXQgd2UncmUgcGFzc2luZyBpbiwgd2Ugd29uJ3QgaGF2ZSB0byBzd2lmdCB0aHJvdWdoIG1vcmUgdGhhbiBqdXN0IGEgY291cGxlIG9mIHJlY29yZHNcbiAgICAgICAgICAgICAgICAgKiBmb3IgdGhhdCB1c2VyIGlkIHByZWZpeCwgdGh1cyB3aHkgd2UgZG9uJ3QgY2FyZSBhYm91dCBwYWdpbmF0ZWQgcmVxdWVzdHMsIGV2ZW4gdGhvdWdoIHdlIG1pZ2h0IGhhdmUgbW9yZSB0aGFuXG4gICAgICAgICAgICAgICAgICogMSwwMDAgZmlsZXMgaW4gYSBidWNrZXQuXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgY29uc3QgbWV0YWRhdGE6IExpc3RPYmplY3RzVjJDb21tYW5kT3V0cHV0ID0gYXdhaXQgczNDbGllbnQuc2VuZChuZXcgTGlzdE9iamVjdHNWMkNvbW1hbmQoKHtcbiAgICAgICAgICAgICAgICAgICAgQnVja2V0OiBidWNrZXROYW1lLFxuICAgICAgICAgICAgICAgICAgICBQcmVmaXg6IHByZWZpeFxuICAgICAgICAgICAgICAgIH0pKSk7XG5cbiAgICAgICAgICAgICAgICAvLyBpZiB0aGVyZSBhcmUgZXhpc3RlbnQgb2JqZWN0cywgdGhlbiB3ZSByZXR1cm4gdGhlbSBhcHByb3ByaWF0ZWx5LCBvdGhlcndpc2Ugd2Ugd2lsbCByZXR1cm4gYSBub3QgZm91bmQgZXJyb3JcbiAgICAgICAgICAgICAgICBpZiAobWV0YWRhdGEuJG1ldGFkYXRhLmh0dHBTdGF0dXNDb2RlICE9PSB1bmRlZmluZWQgJiYgbWV0YWRhdGEuJG1ldGFkYXRhLmh0dHBTdGF0dXNDb2RlID09PSAyMDAgJiZcbiAgICAgICAgICAgICAgICAgICAgbWV0YWRhdGEuQ29udGVudHMgIT09IHVuZGVmaW5lZCAmJiBtZXRhZGF0YS5Db250ZW50cy5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gYWRkIGVhY2ggcmV0cmlldmVkIG9iamVjdCdzIGtleSBpbiB0aGUgbGlzdCBvZiBvYmplY3Qga2V5cyB0byByZXR1cm4gaW4gdGhlIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG9iamVjdEtleUxpc3Q6IHN0cmluZ1tdID0gW107XG4gICAgICAgICAgICAgICAgICAgIG1ldGFkYXRhLkNvbnRlbnRzLmZvckVhY2gocmV0cmlldmVkT2JqZWN0ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHJpZXZlZE9iamVjdC5LZXkgIT09IHVuZGVmaW5lZCAmJiBvYmplY3RLZXlMaXN0LnB1c2gocmV0cmlldmVkT2JqZWN0LktleSlcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBhcHByb3ByaWF0ZSByZXRyaWV2ZWQgb2JqZWN0IGtleXMgaW4gdGhlIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBvYmplY3RLZXlMaXN0XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoKG1ldGFkYXRhLiRtZXRhZGF0YS5odHRwU3RhdHVzQ29kZSAhPT0gdW5kZWZpbmVkICYmIG1ldGFkYXRhLiRtZXRhZGF0YS5odHRwU3RhdHVzQ29kZSA9PT0gNDA0KSB8fCAobWV0YWRhdGEuQ29udGVudHMgPT09IHVuZGVmaW5lZCB8fCBtZXRhZGF0YS5Db250ZW50cy5sZW5ndGggPT09IDApKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBub3RGb3VuZE1lc3NhZ2UgPSBgT2JqZWN0cyBub3QgZm91bmQgZm9yIHVzZXI6ICR7Z2V0RmlsZXNGb3JVc2VySW5wdXQuaWR9YDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKG5vdEZvdW5kTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogbm90Rm91bmRNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogU3RvcmFnZUVycm9yVHlwZS5Ob25lT3JBYnNlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGludmFsaWRNZXRhZGF0YUVycm9yID0gYEludmFsaWQgbWV0YWRhdGEgcmV0dXJuZWQgZm9yICR7Z2V0RmlsZXNGb3JVc2VySW5wdXQudHlwZX1gO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7aW52YWxpZE1ldGFkYXRhRXJyb3J9ICR7SlNPTi5zdHJpbmdpZnkobWV0YWRhdGEpfWApO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGludmFsaWRNZXRhZGF0YUVycm9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogU3RvcmFnZUVycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFRvRG86IEFkZCBtb3JlIGNhc2VzIGRlcGVuZGluZyBvbiB0aGUgYnVja2V0cyB0aGF0IHdlIGhhdmVcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgY29uc3QgdW5rbm93bkZpbGVUeXBlRXJyb3IgPSBgVW5rbm93biBmaWxlIHR5cGUgJHtnZXRGaWxlc0ZvclVzZXJJbnB1dC50eXBlfWA7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2codW5rbm93bkZpbGVUeXBlRXJyb3IpO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogdW5rbm93bkZpbGVUeXBlRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogU3RvcmFnZUVycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nICR7ZmllbGROYW1lfSBxdWVyeSAke2Vycn1gO1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIGlmIChlcnIgJiYgZXJyLm5hbWUgJiYgZXJyLm5hbWUgPT09ICdOb3RGb3VuZCcpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgT2JqZWN0cyBub3QgZm91bmQgZm9yIHVzZXI6ICR7Z2V0RmlsZXNGb3JVc2VySW5wdXQuaWR9YCxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFN0b3JhZ2VFcnJvclR5cGUuTm9uZU9yQWJzZW50XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBTdG9yYWdlRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICB9O1xuICAgIH1cbn1cbiJdfQ==