"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.putMilitaryVerificationReport = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const client_s3_1 = require("@aws-sdk/client-s3");
/**
 * PutMilitaryVerificationReport resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param putMilitaryVerificationReportInput input, based on which the appropriate reporting
 * file is retrieved from storage, through S3.
 *
 * @returns {@link Promise} of {@link MilitaryVerificationReportResponse}
 */
const putMilitaryVerificationReport = async (fieldName, putMilitaryVerificationReportInput) => {
    // put together the unique name of the report to look up in the S3 bucket
    const incomingDateParts = putMilitaryVerificationReportInput.date.split('-');
    const militaryVerificationReportName = `${incomingDateParts[0]}-${incomingDateParts[1]}-${incomingDateParts[2]}-${putMilitaryVerificationReportInput.reportNumber}`;
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // initializing any AWS SDK resources
        const s3Client = new client_s3_1.S3Client({ region: region });
        const bucketName = `${moonbeam_models_1.Constants.StorageConstants.MOONBEAM_MILITARY_VERIFICATION_REPORTING_BUCKET_NAME}-${process.env.ENV_NAME}-${region}`;
        // check if the object exists in the bucket, without actually retrieving it first.
        const metadata = await s3Client.send(new client_s3_1.HeadObjectCommand(({
            Bucket: bucketName,
            Key: `${militaryVerificationReportName}.txt`
        })));
        // if there's an existent object/report, with valid metadata
        if (metadata.Metadata && metadata.$metadata.httpStatusCode !== undefined && metadata.$metadata.httpStatusCode === 200) {
            console.log(`Report ${militaryVerificationReportName}.txt found!`);
            /**
             * file was found, so just append the appropriate data as the next record in it.
             *
             * first retrieve the old date in the existing file.
             */
            const objectKey = `${militaryVerificationReportName}.txt`;
            const getObjectCommandResponse = await s3Client.send(new client_s3_1.GetObjectCommand(({
                Bucket: bucketName,
                Key: objectKey
            })));
            // make sure that the GetObjectCommand was successfully executed
            if (getObjectCommandResponse.$metadata.httpStatusCode !== undefined && getObjectCommandResponse.$metadata.httpStatusCode === 200 && getObjectCommandResponse.Body !== undefined) {
                const oldData = await getObjectCommandResponse.Body.transformToString();
                // execute the PutObjectCommand, to update the file old with the new data
                const newRecord = `${putMilitaryVerificationReportInput.firstName} ${putMilitaryVerificationReportInput.lastName} - ${putMilitaryVerificationReportInput.phoneNumber} ${putMilitaryVerificationReportInput.militaryVerificationStatus === moonbeam_models_1.MilitaryVerificationStatusType.Verified ? 'THANKS FOR SIGNING UP' : putMilitaryVerificationReportInput.militaryVerificationStatus === moonbeam_models_1.MilitaryVerificationStatusType.Rejected ? 'REJECTED' : 'PENDING'}`;
                if (!oldData.includes(newRecord)) {
                    const updatedData = `${oldData}\n${newRecord}`;
                    const putObjectCommandFlag = await putObjectCommandExecution(s3Client, bucketName, objectKey, updatedData);
                    if (putObjectCommandFlag) {
                        return {
                            data: `${militaryVerificationReportName}.txt report updated`
                        };
                    }
                    else {
                        const errorMessage = `Unexpected error while retrieving PutObjectCommand metadata`;
                        return {
                            errorMessage: errorMessage,
                            errorType: moonbeam_models_1.StorageErrorType.UnexpectedError,
                        };
                    }
                }
                else {
                    console.log(`Record already existent in the report, not inserting/updating it further!\n${newRecord}`);
                    return {
                        data: `Record already existent in report ${militaryVerificationReportName}`
                    };
                }
            }
            else {
                const errorMessage = `Unexpected error while retrieving GetObjectCommand metadata`;
                return {
                    errorMessage: errorMessage,
                    errorType: moonbeam_models_1.StorageErrorType.UnexpectedError,
                };
            }
        }
        else {
            /**
             * if the call above does not return an error not found, but it is thrown in the metadata status code instead
             * create a new file , and append the appropriate data as the first record in the report
             */
            if (metadata.$metadata.httpStatusCode !== undefined && metadata.$metadata.httpStatusCode === 404) {
                // execute the PutObjectCommand
                const data = `MOONBEAM MILITARY VERIFICATION REPORT - ${militaryVerificationReportName}\n${putMilitaryVerificationReportInput.firstName} ${putMilitaryVerificationReportInput.lastName} - ${putMilitaryVerificationReportInput.phoneNumber} ${putMilitaryVerificationReportInput.militaryVerificationStatus === moonbeam_models_1.MilitaryVerificationStatusType.Verified ? 'THANKS FOR SIGNING UP' : putMilitaryVerificationReportInput.militaryVerificationStatus === moonbeam_models_1.MilitaryVerificationStatusType.Rejected ? 'REJECTED' : 'PENDING'}`;
                const putObjectCommandFlag = await putObjectCommandExecution(s3Client, bucketName, `${militaryVerificationReportName}.txt`, data);
                if (putObjectCommandFlag) {
                    return {
                        data: `${militaryVerificationReportName}.txt report created`
                    };
                }
                else {
                    const errorMessage = `Unexpected error while retrieving PutObjectCommand metadata`;
                    return {
                        errorMessage: errorMessage,
                        errorType: moonbeam_models_1.StorageErrorType.UnexpectedError,
                    };
                }
            }
            else {
                const errorMessage = `Unexpected error while retrieving report ${militaryVerificationReportName} metadata`;
                console.log(`${errorMessage}`);
                return {
                    errorMessage: errorMessage,
                    errorType: moonbeam_models_1.StorageErrorType.UnexpectedError,
                };
            }
        }
    }
    catch (err) {
        // @ts-ignore
        if (err && err.name && err.name === 'NotFound') {
            console.log(`Report ${militaryVerificationReportName}.txt not found`);
            try {
                // retrieving the current function region
                const region = process.env.AWS_REGION;
                /**
                 * file was not found, so create a new file, and append the appropriate data
                 * as the first record in the report
                 *
                 * first initializing any AWS SDK resources
                 */
                const s3Client = new client_s3_1.S3Client({ region: region });
                const bucketName = `${moonbeam_models_1.Constants.StorageConstants.MOONBEAM_MILITARY_VERIFICATION_REPORTING_BUCKET_NAME}-${process.env.ENV_NAME}-${region}`;
                // execute the PutObjectCommand
                const data = `MOONBEAM MILITARY VERIFICATION REPORT - ${militaryVerificationReportName}\n${putMilitaryVerificationReportInput.firstName} ${putMilitaryVerificationReportInput.lastName} - ${putMilitaryVerificationReportInput.phoneNumber} ${putMilitaryVerificationReportInput.militaryVerificationStatus === moonbeam_models_1.MilitaryVerificationStatusType.Verified ? 'THANKS FOR SIGNING UP' : putMilitaryVerificationReportInput.militaryVerificationStatus === moonbeam_models_1.MilitaryVerificationStatusType.Rejected ? 'REJECTED' : 'PENDING'}`;
                const putObjectCommandFlag = await putObjectCommandExecution(s3Client, bucketName, `${militaryVerificationReportName}.txt`, data);
                if (putObjectCommandFlag) {
                    return {
                        data: `${militaryVerificationReportName}.txt report created`
                    };
                }
                else {
                    const errorMessage = `Unexpected error while retrieving PutObjectCommand metadata`;
                    return {
                        errorMessage: errorMessage,
                        errorType: moonbeam_models_1.StorageErrorType.UnexpectedError,
                    };
                }
            }
            catch (error) {
                const errorMessage = `Unexpected error while executing the PutObjectCommand ${error}`;
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: moonbeam_models_1.StorageErrorType.UnexpectedError
                };
            }
        }
        else {
            const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.StorageErrorType.UnexpectedError
            };
        }
    }
};
exports.putMilitaryVerificationReport = putMilitaryVerificationReport;
/**
 * Function used to put content into a new and/or existing report.
 *
 * @param s3Client s3Client used to execute the command
 * @param bucketName the name of the bucket containing the new and/or existing object
 * @param objectKey the name of the newly created and/or existing object
 * @param content the content to add to the report
 *
 * @returns a {@link Promise} of {@link boolean} representing a flag highlighting whether
 * the command was successful or not
 *
 */
const putObjectCommandExecution = async (s3Client, bucketName, objectKey, content) => {
    // execute the PutObjectCommand
    const putObjectCommandResponse = await s3Client.send(new client_s3_1.PutObjectCommand(({
        Bucket: bucketName,
        Key: objectKey,
        Body: content
    })));
    // make sure that the PutObjectCommand was successfully executed
    if (putObjectCommandResponse.$metadata.httpStatusCode !== undefined && putObjectCommandResponse.$metadata.httpStatusCode === 200) {
        console.log(`New ${objectKey} report created with an initial record!`);
        return true;
    }
    else {
        const errorMessage = `Unexpected error while retrieving PutObjectCommand metadata`;
        console.log(`${errorMessage}`);
        return false;
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRSZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL1B1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0UmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0RBTW1DO0FBQ25DLGtEQUFtRztBQUVuRzs7Ozs7Ozs7R0FRRztBQUNJLE1BQU0sNkJBQTZCLEdBQUcsS0FBSyxFQUFFLFNBQWlCLEVBQUUsa0NBQXNFLEVBQStDLEVBQUU7SUFDMUwseUVBQXlFO0lBQ3pFLE1BQU0saUJBQWlCLEdBQUcsa0NBQWtDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUM3RSxNQUFNLDhCQUE4QixHQUFHLEdBQUcsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLElBQUksaUJBQWlCLENBQUMsQ0FBQyxDQUFDLElBQUksaUJBQWlCLENBQUMsQ0FBQyxDQUFDLElBQUksa0NBQWtDLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDcEssSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2QyxxQ0FBcUM7UUFDckMsTUFBTSxRQUFRLEdBQUcsSUFBSSxvQkFBUSxDQUFDLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7UUFDaEQsTUFBTSxVQUFVLEdBQUcsR0FBRywyQkFBUyxDQUFDLGdCQUFnQixDQUFDLG9EQUFvRCxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUyxJQUFJLE1BQU0sRUFBRSxDQUFDO1FBRTNJLGtGQUFrRjtRQUNsRixNQUFNLFFBQVEsR0FBRyxNQUFNLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSw2QkFBaUIsQ0FBQyxDQUFDO1lBQ3hELE1BQU0sRUFBRSxVQUFVO1lBQ2xCLEdBQUcsRUFBRSxHQUFH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QUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICAgIENvbnN0YW50cyxcbiAgICBNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydFJlc3BvbnNlLFxuICAgIE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZSxcbiAgICBQdXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydElucHV0LFxuICAgIFN0b3JhZ2VFcnJvclR5cGVcbn0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcbmltcG9ydCB7R2V0T2JqZWN0Q29tbWFuZCwgSGVhZE9iamVjdENvbW1hbmQsIFB1dE9iamVjdENvbW1hbmQsIFMzQ2xpZW50fSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LXMzXCI7XG5cbi8qKlxuICogUHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnQgcmVzb2x2ZXJcbiAqXG4gKiBAcGFyYW0gZmllbGROYW1lIG5hbWUgb2YgdGhlIHJlc29sdmVyIHBhdGggZnJvbSB0aGUgQXBwU3luYyBldmVudFxuICogQHBhcmFtIHB1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0SW5wdXQgaW5wdXQsIGJhc2VkIG9uIHdoaWNoIHRoZSBhcHByb3ByaWF0ZSByZXBvcnRpbmdcbiAqIGZpbGUgaXMgcmV0cmlldmVkIGZyb20gc3RvcmFnZSwgdGhyb3VnaCBTMy5cbiAqXG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0UmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBwdXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydCA9IGFzeW5jIChmaWVsZE5hbWU6IHN0cmluZywgcHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRJbnB1dDogUHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRJbnB1dCk6IFByb21pc2U8TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRSZXNwb25zZT4gPT4ge1xuICAgIC8vIHB1dCB0b2dldGhlciB0aGUgdW5pcXVlIG5hbWUgb2YgdGhlIHJlcG9ydCB0byBsb29rIHVwIGluIHRoZSBTMyBidWNrZXRcbiAgICBjb25zdCBpbmNvbWluZ0RhdGVQYXJ0cyA9IHB1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0SW5wdXQuZGF0ZS5zcGxpdCgnLScpO1xuICAgIGNvbnN0IG1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0TmFtZSA9IGAke2luY29taW5nRGF0ZVBhcnRzWzBdfS0ke2luY29taW5nRGF0ZVBhcnRzWzFdfS0ke2luY29taW5nRGF0ZVBhcnRzWzJdfS0ke3B1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0SW5wdXQucmVwb3J0TnVtYmVyfWA7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLy8gaW5pdGlhbGl6aW5nIGFueSBBV1MgU0RLIHJlc291cmNlc1xuICAgICAgICBjb25zdCBzM0NsaWVudCA9IG5ldyBTM0NsaWVudCh7cmVnaW9uOiByZWdpb259KTtcbiAgICAgICAgY29uc3QgYnVja2V0TmFtZSA9IGAke0NvbnN0YW50cy5TdG9yYWdlQ29uc3RhbnRzLk1PT05CRUFNX01JTElUQVJZX1ZFUklGSUNBVElPTl9SRVBPUlRJTkdfQlVDS0VUX05BTUV9LSR7cHJvY2Vzcy5lbnYuRU5WX05BTUUhfS0ke3JlZ2lvbn1gO1xuXG4gICAgICAgIC8vIGNoZWNrIGlmIHRoZSBvYmplY3QgZXhpc3RzIGluIHRoZSBidWNrZXQsIHdpdGhvdXQgYWN0dWFsbHkgcmV0cmlldmluZyBpdCBmaXJzdC5cbiAgICAgICAgY29uc3QgbWV0YWRhdGEgPSBhd2FpdCBzM0NsaWVudC5zZW5kKG5ldyBIZWFkT2JqZWN0Q29tbWFuZCgoe1xuICAgICAgICAgICAgQnVja2V0OiBidWNrZXROYW1lLFxuICAgICAgICAgICAgS2V5OiBgJHttaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydE5hbWV9LnR4dGBcbiAgICAgICAgfSkpKTtcblxuICAgICAgICAvLyBpZiB0aGVyZSdzIGFuIGV4aXN0ZW50IG9iamVjdC9yZXBvcnQsIHdpdGggdmFsaWQgbWV0YWRhdGFcbiAgICAgICAgaWYgKG1ldGFkYXRhLk1ldGFkYXRhICYmIG1ldGFkYXRhLiRtZXRhZGF0YS5odHRwU3RhdHVzQ29kZSAhPT0gdW5kZWZpbmVkICYmIG1ldGFkYXRhLiRtZXRhZGF0YS5odHRwU3RhdHVzQ29kZSA9PT0gMjAwKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgUmVwb3J0ICR7bWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnROYW1lfS50eHQgZm91bmQhYCk7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIGZpbGUgd2FzIGZvdW5kLCBzbyBqdXN0IGFwcGVuZCB0aGUgYXBwcm9wcmlhdGUgZGF0YSBhcyB0aGUgbmV4dCByZWNvcmQgaW4gaXQuXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogZmlyc3QgcmV0cmlldmUgdGhlIG9sZCBkYXRlIGluIHRoZSBleGlzdGluZyBmaWxlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBjb25zdCBvYmplY3RLZXkgPSBgJHttaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydE5hbWV9LnR4dGA7XG4gICAgICAgICAgICBjb25zdCBnZXRPYmplY3RDb21tYW5kUmVzcG9uc2UgPSBhd2FpdCBzM0NsaWVudC5zZW5kKG5ldyBHZXRPYmplY3RDb21tYW5kKCh7XG4gICAgICAgICAgICAgICAgQnVja2V0OiBidWNrZXROYW1lLFxuICAgICAgICAgICAgICAgIEtleTogb2JqZWN0S2V5XG4gICAgICAgICAgICB9KSkpO1xuICAgICAgICAgICAgLy8gbWFrZSBzdXJlIHRoYXQgdGhlIEdldE9iamVjdENvbW1hbmQgd2FzIHN1Y2Nlc3NmdWxseSBleGVjdXRlZFxuICAgICAgICAgICAgaWYgKGdldE9iamVjdENvbW1hbmRSZXNwb25zZS4kbWV0YWRhdGEuaHR0cFN0YXR1c0NvZGUgIT09IHVuZGVmaW5lZCAmJiBnZXRPYmplY3RDb21tYW5kUmVzcG9uc2UuJG1ldGFkYXRhLmh0dHBTdGF0dXNDb2RlID09PSAyMDAgJiYgZ2V0T2JqZWN0Q29tbWFuZFJlc3BvbnNlLkJvZHkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG9sZERhdGEgPSBhd2FpdCBnZXRPYmplY3RDb21tYW5kUmVzcG9uc2UuQm9keS50cmFuc2Zvcm1Ub1N0cmluZygpO1xuXG4gICAgICAgICAgICAgICAgLy8gZXhlY3V0ZSB0aGUgUHV0T2JqZWN0Q29tbWFuZCwgdG8gdXBkYXRlIHRoZSBmaWxlIG9sZCB3aXRoIHRoZSBuZXcgZGF0YVxuICAgICAgICAgICAgICAgIGNvbnN0IG5ld1JlY29yZCA9IGAke3B1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0SW5wdXQuZmlyc3ROYW1lfSAke3B1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0SW5wdXQubGFzdE5hbWV9IC0gJHtwdXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydElucHV0LnBob25lTnVtYmVyfSAke3B1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0SW5wdXQubWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXMgPT09IE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZS5WZXJpZmllZCA/ICdUSEFOS1MgRk9SIFNJR05JTkcgVVAnIDogcHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRJbnB1dC5taWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1cyA9PT0gTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNUeXBlLlJlamVjdGVkID8gJ1JFSkVDVEVEJyA6ICdQRU5ESU5HJ31gO1xuICAgICAgICAgICAgICAgIGlmICghb2xkRGF0YS5pbmNsdWRlcyhuZXdSZWNvcmQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVwZGF0ZWREYXRhID0gYCR7b2xkRGF0YX1cXG4ke25ld1JlY29yZH1gO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHB1dE9iamVjdENvbW1hbmRGbGFnID0gYXdhaXQgcHV0T2JqZWN0Q29tbWFuZEV4ZWN1dGlvbihzM0NsaWVudCwgYnVja2V0TmFtZSwgb2JqZWN0S2V5LCB1cGRhdGVkRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwdXRPYmplY3RDb21tYW5kRmxhZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBgJHttaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydE5hbWV9LnR4dCByZXBvcnQgdXBkYXRlZGBcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHJldHJpZXZpbmcgUHV0T2JqZWN0Q29tbWFuZCBtZXRhZGF0YWA7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogU3RvcmFnZUVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgUmVjb3JkIGFscmVhZHkgZXhpc3RlbnQgaW4gdGhlIHJlcG9ydCwgbm90IGluc2VydGluZy91cGRhdGluZyBpdCBmdXJ0aGVyIVxcbiR7bmV3UmVjb3JkfWApO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGBSZWNvcmQgYWxyZWFkeSBleGlzdGVudCBpbiByZXBvcnQgJHttaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydE5hbWV9YFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSByZXRyaWV2aW5nIEdldE9iamVjdENvbW1hbmQgbWV0YWRhdGFgO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFN0b3JhZ2VFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogaWYgdGhlIGNhbGwgYWJvdmUgZG9lcyBub3QgcmV0dXJuIGFuIGVycm9yIG5vdCBmb3VuZCwgYnV0IGl0IGlzIHRocm93biBpbiB0aGUgbWV0YWRhdGEgc3RhdHVzIGNvZGUgaW5zdGVhZFxuICAgICAgICAgICAgICogY3JlYXRlIGEgbmV3IGZpbGUgLCBhbmQgYXBwZW5kIHRoZSBhcHByb3ByaWF0ZSBkYXRhIGFzIHRoZSBmaXJzdCByZWNvcmQgaW4gdGhlIHJlcG9ydFxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBpZiAobWV0YWRhdGEuJG1ldGFkYXRhLmh0dHBTdGF0dXNDb2RlICE9PSB1bmRlZmluZWQgJiYgbWV0YWRhdGEuJG1ldGFkYXRhLmh0dHBTdGF0dXNDb2RlID09PSA0MDQpIHtcbiAgICAgICAgICAgICAgICAvLyBleGVjdXRlIHRoZSBQdXRPYmplY3RDb21tYW5kXG4gICAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IGBNT09OQkVBTSBNSUxJVEFSWSBWRVJJRklDQVRJT04gUkVQT1JUIC0gJHttaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydE5hbWV9XFxuJHtwdXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydElucHV0LmZpcnN0TmFtZX0gJHtwdXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydElucHV0Lmxhc3ROYW1lfSAtICR7cHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRJbnB1dC5waG9uZU51bWJlcn0gJHtwdXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydElucHV0Lm1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzID09PSBNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1R5cGUuVmVyaWZpZWQgPyAnVEhBTktTIEZPUiBTSUdOSU5HIFVQJyA6IHB1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0SW5wdXQubWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXMgPT09IE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZS5SZWplY3RlZCA/ICdSRUpFQ1RFRCcgOiAnUEVORElORyd9YDtcbiAgICAgICAgICAgICAgICBjb25zdCBwdXRPYmplY3RDb21tYW5kRmxhZyA9IGF3YWl0IHB1dE9iamVjdENvbW1hbmRFeGVjdXRpb24oczNDbGllbnQsIGJ1Y2tldE5hbWUsIGAke21pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0TmFtZX0udHh0YCwgZGF0YSk7XG4gICAgICAgICAgICAgICAgaWYgKHB1dE9iamVjdENvbW1hbmRGbGFnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBgJHttaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydE5hbWV9LnR4dCByZXBvcnQgY3JlYXRlZGBcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHJldHJpZXZpbmcgUHV0T2JqZWN0Q29tbWFuZCBtZXRhZGF0YWA7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogU3RvcmFnZUVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHJldHJpZXZpbmcgcmVwb3J0ICR7bWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnROYW1lfSBtZXRhZGF0YWA7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfWApO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFN0b3JhZ2VFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIGlmIChlcnIgJiYgZXJyLm5hbWUgJiYgZXJyLm5hbWUgPT09ICdOb3RGb3VuZCcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBSZXBvcnQgJHttaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydE5hbWV9LnR4dCBub3QgZm91bmRgKTtcblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICAgICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogZmlsZSB3YXMgbm90IGZvdW5kLCBzbyBjcmVhdGUgYSBuZXcgZmlsZSwgYW5kIGFwcGVuZCB0aGUgYXBwcm9wcmlhdGUgZGF0YVxuICAgICAgICAgICAgICAgICAqIGFzIHRoZSBmaXJzdCByZWNvcmQgaW4gdGhlIHJlcG9ydFxuICAgICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAgICogZmlyc3QgaW5pdGlhbGl6aW5nIGFueSBBV1MgU0RLIHJlc291cmNlc1xuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGNvbnN0IHMzQ2xpZW50ID0gbmV3IFMzQ2xpZW50KHtyZWdpb246IHJlZ2lvbn0pO1xuICAgICAgICAgICAgICAgIGNvbnN0IGJ1Y2tldE5hbWUgPSBgJHtDb25zdGFudHMuU3RvcmFnZUNvbnN0YW50cy5NT09OQkVBTV9NSUxJVEFSWV9WRVJJRklDQVRJT05fUkVQT1JUSU5HX0JVQ0tFVF9OQU1FfS0ke3Byb2Nlc3MuZW52LkVOVl9OQU1FIX0tJHtyZWdpb259YDtcblxuICAgICAgICAgICAgICAgIC8vIGV4ZWN1dGUgdGhlIFB1dE9iamVjdENvbW1hbmRcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRhID0gYE1PT05CRUFNIE1JTElUQVJZIFZFUklGSUNBVElPTiBSRVBPUlQgLSAke21pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0TmFtZX1cXG4ke3B1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0SW5wdXQuZmlyc3ROYW1lfSAke3B1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0SW5wdXQubGFzdE5hbWV9IC0gJHtwdXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydElucHV0LnBob25lTnVtYmVyfSAke3B1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0SW5wdXQubWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXMgPT09IE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZS5WZXJpZmllZCA/ICdUSEFOS1MgRk9SIFNJR05JTkcgVVAnIDogcHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRJbnB1dC5taWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1cyA9PT0gTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNUeXBlLlJlamVjdGVkID8gJ1JFSkVDVEVEJyA6ICdQRU5ESU5HJ31gO1xuICAgICAgICAgICAgICAgIGNvbnN0IHB1dE9iamVjdENvbW1hbmRGbGFnID0gYXdhaXQgcHV0T2JqZWN0Q29tbWFuZEV4ZWN1dGlvbihzM0NsaWVudCwgYnVja2V0TmFtZSwgYCR7bWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnROYW1lfS50eHRgLCBkYXRhKTtcbiAgICAgICAgICAgICAgICBpZiAocHV0T2JqZWN0Q29tbWFuZEZsYWcpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGAke21pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0TmFtZX0udHh0IHJlcG9ydCBjcmVhdGVkYFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgcmV0cmlldmluZyBQdXRPYmplY3RDb21tYW5kIG1ldGFkYXRhYDtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBTdG9yYWdlRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvcixcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nIHRoZSBQdXRPYmplY3RDb21tYW5kICR7ZXJyb3J9YDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogU3RvcmFnZUVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nICR7ZmllbGROYW1lfSBxdWVyeSAke2Vycn1gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFN0b3JhZ2VFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHVzZWQgdG8gcHV0IGNvbnRlbnQgaW50byBhIG5ldyBhbmQvb3IgZXhpc3RpbmcgcmVwb3J0LlxuICpcbiAqIEBwYXJhbSBzM0NsaWVudCBzM0NsaWVudCB1c2VkIHRvIGV4ZWN1dGUgdGhlIGNvbW1hbmRcbiAqIEBwYXJhbSBidWNrZXROYW1lIHRoZSBuYW1lIG9mIHRoZSBidWNrZXQgY29udGFpbmluZyB0aGUgbmV3IGFuZC9vciBleGlzdGluZyBvYmplY3RcbiAqIEBwYXJhbSBvYmplY3RLZXkgdGhlIG5hbWUgb2YgdGhlIG5ld2x5IGNyZWF0ZWQgYW5kL29yIGV4aXN0aW5nIG9iamVjdFxuICogQHBhcmFtIGNvbnRlbnQgdGhlIGNvbnRlbnQgdG8gYWRkIHRvIHRoZSByZXBvcnRcbiAqXG4gKiBAcmV0dXJucyBhIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgYm9vbGVhbn0gcmVwcmVzZW50aW5nIGEgZmxhZyBoaWdobGlnaHRpbmcgd2hldGhlclxuICogdGhlIGNvbW1hbmQgd2FzIHN1Y2Nlc3NmdWwgb3Igbm90XG4gKlxuICovXG5jb25zdCBwdXRPYmplY3RDb21tYW5kRXhlY3V0aW9uID0gYXN5bmMgKHMzQ2xpZW50OiBTM0NsaWVudCwgYnVja2V0TmFtZTogc3RyaW5nLCBvYmplY3RLZXk6IHN0cmluZywgY29udGVudDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgLy8gZXhlY3V0ZSB0aGUgUHV0T2JqZWN0Q29tbWFuZFxuICAgIGNvbnN0IHB1dE9iamVjdENvbW1hbmRSZXNwb25zZSA9IGF3YWl0IHMzQ2xpZW50LnNlbmQobmV3IFB1dE9iamVjdENvbW1hbmQoKHtcbiAgICAgICAgQnVja2V0OiBidWNrZXROYW1lLFxuICAgICAgICBLZXk6IG9iamVjdEtleSxcbiAgICAgICAgQm9keTogY29udGVudFxuICAgIH0pKSk7XG5cbiAgICAvLyBtYWtlIHN1cmUgdGhhdCB0aGUgUHV0T2JqZWN0Q29tbWFuZCB3YXMgc3VjY2Vzc2Z1bGx5IGV4ZWN1dGVkXG4gICAgaWYgKHB1dE9iamVjdENvbW1hbmRSZXNwb25zZS4kbWV0YWRhdGEuaHR0cFN0YXR1c0NvZGUgIT09IHVuZGVmaW5lZCAmJiBwdXRPYmplY3RDb21tYW5kUmVzcG9uc2UuJG1ldGFkYXRhLmh0dHBTdGF0dXNDb2RlID09PSAyMDApIHtcbiAgICAgICAgY29uc29sZS5sb2coYE5ldyAke29iamVjdEtleX0gcmVwb3J0IGNyZWF0ZWQgd2l0aCBhbiBpbml0aWFsIHJlY29yZCFgKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgcmV0cmlldmluZyBQdXRPYmplY3RDb21tYW5kIG1ldGFkYXRhYDtcbiAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfWApO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuIl19