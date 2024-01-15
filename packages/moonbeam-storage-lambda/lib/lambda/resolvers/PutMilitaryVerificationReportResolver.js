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
                const newRecord = `${putMilitaryVerificationReportInput.firstName} ${putMilitaryVerificationReportInput.lastName} - ${putMilitaryVerificationReportInput.phoneNumber} | ${putMilitaryVerificationReportInput.emailAddress} | ${putMilitaryVerificationReportInput.militaryVerificationStatus === moonbeam_models_1.MilitaryVerificationStatusType.Verified ? 'THANKS FOR SIGNING UP' : putMilitaryVerificationReportInput.militaryVerificationStatus === moonbeam_models_1.MilitaryVerificationStatusType.Rejected ? 'REJECTED' : 'PENDING'}`;
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
                const data = `MOONBEAM MILITARY VERIFICATION REPORT - ${militaryVerificationReportName}\n${putMilitaryVerificationReportInput.firstName} ${putMilitaryVerificationReportInput.lastName} - ${putMilitaryVerificationReportInput.phoneNumber} | ${putMilitaryVerificationReportInput.emailAddress} | ${putMilitaryVerificationReportInput.militaryVerificationStatus === moonbeam_models_1.MilitaryVerificationStatusType.Verified ? 'THANKS FOR SIGNING UP' : putMilitaryVerificationReportInput.militaryVerificationStatus === moonbeam_models_1.MilitaryVerificationStatusType.Rejected ? 'REJECTED' : 'PENDING'}`;
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
                const data = `MOONBEAM MILITARY VERIFICATION REPORT - ${militaryVerificationReportName}\n${putMilitaryVerificationReportInput.firstName} ${putMilitaryVerificationReportInput.lastName} - ${putMilitaryVerificationReportInput.phoneNumber} | ${putMilitaryVerificationReportInput.emailAddress} | ${putMilitaryVerificationReportInput.militaryVerificationStatus === moonbeam_models_1.MilitaryVerificationStatusType.Verified ? 'THANKS FOR SIGNING UP' : putMilitaryVerificationReportInput.militaryVerificationStatus === moonbeam_models_1.MilitaryVerificationStatusType.Rejected ? 'REJECTED' : 'PENDING'}`;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRSZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL1B1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0UmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0RBTW1DO0FBQ25DLGtEQUFtRztBQUVuRzs7Ozs7Ozs7R0FRRztBQUNJLE1BQU0sNkJBQTZCLEdBQUcsS0FBSyxFQUFFLFNBQWlCLEVBQUUsa0NBQXNFLEVBQStDLEVBQUU7SUFDMUwseUVBQXlFO0lBQ3pFLE1BQU0saUJBQWlCLEdBQUcsa0NBQWtDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUM3RSxNQUFNLDhCQUE4QixHQUFHLEdBQUcsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLElBQUksaUJBQWlCLENBQUMsQ0FBQyxDQUFDLElBQUksaUJBQWlCLENBQUMsQ0FBQyxDQUFDLElBQUksa0NBQWtDLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDcEssSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2QyxxQ0FBcUM7UUFDckMsTUFBTSxRQUFRLEdBQUcsSUFBSSxvQkFBUSxDQUFDLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7UUFDaEQsTUFBTSxVQUFVLEdBQUcsR0FBRywyQkFBUyxDQUFDLGdCQUFnQixDQUFDLG9EQUFvRCxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUyxJQUFJLE1BQU0sRUFBRSxDQUFDO1FBRTNJLGtGQUFrRjtRQUNsRixNQUFNLFFBQVEsR0FBRyxNQUFNLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSw2QkFBaUIsQ0FBQyxDQUFDO1lBQ3hELE1BQU0sRUFBRSxVQUFVO1lBQ2xCLEdBQUcsRUFBRSxHQUFH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R0FBRyxDQUFDLEdBQUcsWUFBWSxFQUFFLENBQUMsQ0FBQztRQUMvQixPQUFPLEtBQUssQ0FBQztLQUNoQjtBQUNMLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gICAgQ29uc3RhbnRzLFxuICAgIE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0UmVzcG9uc2UsXG4gICAgTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNUeXBlLFxuICAgIFB1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0SW5wdXQsXG4gICAgU3RvcmFnZUVycm9yVHlwZVxufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuaW1wb3J0IHtHZXRPYmplY3RDb21tYW5kLCBIZWFkT2JqZWN0Q29tbWFuZCwgUHV0T2JqZWN0Q29tbWFuZCwgUzNDbGllbnR9IGZyb20gXCJAYXdzLXNkay9jbGllbnQtczNcIjtcblxuLyoqXG4gKiBQdXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydCByZXNvbHZlclxuICpcbiAqIEBwYXJhbSBmaWVsZE5hbWUgbmFtZSBvZiB0aGUgcmVzb2x2ZXIgcGF0aCBmcm9tIHRoZSBBcHBTeW5jIGV2ZW50XG4gKiBAcGFyYW0gcHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRJbnB1dCBpbnB1dCwgYmFzZWQgb24gd2hpY2ggdGhlIGFwcHJvcHJpYXRlIHJlcG9ydGluZ1xuICogZmlsZSBpcyByZXRyaWV2ZWQgZnJvbSBzdG9yYWdlLCB0aHJvdWdoIFMzLlxuICpcbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgTWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRSZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IHB1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0ID0gYXN5bmMgKGZpZWxkTmFtZTogc3RyaW5nLCBwdXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydElucHV0OiBQdXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydElucHV0KTogUHJvbWlzZTxNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydFJlc3BvbnNlPiA9PiB7XG4gICAgLy8gcHV0IHRvZ2V0aGVyIHRoZSB1bmlxdWUgbmFtZSBvZiB0aGUgcmVwb3J0IHRvIGxvb2sgdXAgaW4gdGhlIFMzIGJ1Y2tldFxuICAgIGNvbnN0IGluY29taW5nRGF0ZVBhcnRzID0gcHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRJbnB1dC5kYXRlLnNwbGl0KCctJyk7XG4gICAgY29uc3QgbWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnROYW1lID0gYCR7aW5jb21pbmdEYXRlUGFydHNbMF19LSR7aW5jb21pbmdEYXRlUGFydHNbMV19LSR7aW5jb21pbmdEYXRlUGFydHNbMl19LSR7cHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRJbnB1dC5yZXBvcnROdW1iZXJ9YDtcbiAgICB0cnkge1xuICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OITtcblxuICAgICAgICAvLyBpbml0aWFsaXppbmcgYW55IEFXUyBTREsgcmVzb3VyY2VzXG4gICAgICAgIGNvbnN0IHMzQ2xpZW50ID0gbmV3IFMzQ2xpZW50KHtyZWdpb246IHJlZ2lvbn0pO1xuICAgICAgICBjb25zdCBidWNrZXROYW1lID0gYCR7Q29uc3RhbnRzLlN0b3JhZ2VDb25zdGFudHMuTU9PTkJFQU1fTUlMSVRBUllfVkVSSUZJQ0FUSU9OX1JFUE9SVElOR19CVUNLRVRfTkFNRX0tJHtwcm9jZXNzLmVudi5FTlZfTkFNRSF9LSR7cmVnaW9ufWA7XG5cbiAgICAgICAgLy8gY2hlY2sgaWYgdGhlIG9iamVjdCBleGlzdHMgaW4gdGhlIGJ1Y2tldCwgd2l0aG91dCBhY3R1YWxseSByZXRyaWV2aW5nIGl0IGZpcnN0LlxuICAgICAgICBjb25zdCBtZXRhZGF0YSA9IGF3YWl0IHMzQ2xpZW50LnNlbmQobmV3IEhlYWRPYmplY3RDb21tYW5kKCh7XG4gICAgICAgICAgICBCdWNrZXQ6IGJ1Y2tldE5hbWUsXG4gICAgICAgICAgICBLZXk6IGAke21pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0TmFtZX0udHh0YFxuICAgICAgICB9KSkpO1xuXG4gICAgICAgIC8vIGlmIHRoZXJlJ3MgYW4gZXhpc3RlbnQgb2JqZWN0L3JlcG9ydCwgd2l0aCB2YWxpZCBtZXRhZGF0YVxuICAgICAgICBpZiAobWV0YWRhdGEuTWV0YWRhdGEgJiYgbWV0YWRhdGEuJG1ldGFkYXRhLmh0dHBTdGF0dXNDb2RlICE9PSB1bmRlZmluZWQgJiYgbWV0YWRhdGEuJG1ldGFkYXRhLmh0dHBTdGF0dXNDb2RlID09PSAyMDApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBSZXBvcnQgJHttaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydE5hbWV9LnR4dCBmb3VuZCFgKTtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogZmlsZSB3YXMgZm91bmQsIHNvIGp1c3QgYXBwZW5kIHRoZSBhcHByb3ByaWF0ZSBkYXRhIGFzIHRoZSBuZXh0IHJlY29yZCBpbiBpdC5cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBmaXJzdCByZXRyaWV2ZSB0aGUgb2xkIGRhdGUgaW4gdGhlIGV4aXN0aW5nIGZpbGUuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGNvbnN0IG9iamVjdEtleSA9IGAke21pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0TmFtZX0udHh0YDtcbiAgICAgICAgICAgIGNvbnN0IGdldE9iamVjdENvbW1hbmRSZXNwb25zZSA9IGF3YWl0IHMzQ2xpZW50LnNlbmQobmV3IEdldE9iamVjdENvbW1hbmQoKHtcbiAgICAgICAgICAgICAgICBCdWNrZXQ6IGJ1Y2tldE5hbWUsXG4gICAgICAgICAgICAgICAgS2V5OiBvYmplY3RLZXlcbiAgICAgICAgICAgIH0pKSk7XG4gICAgICAgICAgICAvLyBtYWtlIHN1cmUgdGhhdCB0aGUgR2V0T2JqZWN0Q29tbWFuZCB3YXMgc3VjY2Vzc2Z1bGx5IGV4ZWN1dGVkXG4gICAgICAgICAgICBpZiAoZ2V0T2JqZWN0Q29tbWFuZFJlc3BvbnNlLiRtZXRhZGF0YS5odHRwU3RhdHVzQ29kZSAhPT0gdW5kZWZpbmVkICYmIGdldE9iamVjdENvbW1hbmRSZXNwb25zZS4kbWV0YWRhdGEuaHR0cFN0YXR1c0NvZGUgPT09IDIwMCAmJiBnZXRPYmplY3RDb21tYW5kUmVzcG9uc2UuQm9keSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgb2xkRGF0YSA9IGF3YWl0IGdldE9iamVjdENvbW1hbmRSZXNwb25zZS5Cb2R5LnRyYW5zZm9ybVRvU3RyaW5nKCk7XG5cbiAgICAgICAgICAgICAgICAvLyBleGVjdXRlIHRoZSBQdXRPYmplY3RDb21tYW5kLCB0byB1cGRhdGUgdGhlIGZpbGUgb2xkIHdpdGggdGhlIG5ldyBkYXRhXG4gICAgICAgICAgICAgICAgY29uc3QgbmV3UmVjb3JkID0gYCR7cHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRJbnB1dC5maXJzdE5hbWV9ICR7cHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRJbnB1dC5sYXN0TmFtZX0gLSAke3B1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0SW5wdXQucGhvbmVOdW1iZXJ9IHwgJHtwdXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydElucHV0LmVtYWlsQWRkcmVzc30gfCAke3B1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0SW5wdXQubWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXMgPT09IE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZS5WZXJpZmllZCA/ICdUSEFOS1MgRk9SIFNJR05JTkcgVVAnIDogcHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRJbnB1dC5taWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1cyA9PT0gTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNUeXBlLlJlamVjdGVkID8gJ1JFSkVDVEVEJyA6ICdQRU5ESU5HJ31gO1xuICAgICAgICAgICAgICAgIGlmICghb2xkRGF0YS5pbmNsdWRlcyhuZXdSZWNvcmQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVwZGF0ZWREYXRhID0gYCR7b2xkRGF0YX1cXG4ke25ld1JlY29yZH1gO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHB1dE9iamVjdENvbW1hbmRGbGFnID0gYXdhaXQgcHV0T2JqZWN0Q29tbWFuZEV4ZWN1dGlvbihzM0NsaWVudCwgYnVja2V0TmFtZSwgb2JqZWN0S2V5LCB1cGRhdGVkRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwdXRPYmplY3RDb21tYW5kRmxhZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBgJHttaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydE5hbWV9LnR4dCByZXBvcnQgdXBkYXRlZGBcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHJldHJpZXZpbmcgUHV0T2JqZWN0Q29tbWFuZCBtZXRhZGF0YWA7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogU3RvcmFnZUVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgUmVjb3JkIGFscmVhZHkgZXhpc3RlbnQgaW4gdGhlIHJlcG9ydCwgbm90IGluc2VydGluZy91cGRhdGluZyBpdCBmdXJ0aGVyIVxcbiR7bmV3UmVjb3JkfWApO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBgUmVjb3JkIGFscmVhZHkgZXhpc3RlbnQgaW4gcmVwb3J0ICR7bWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnROYW1lfWBcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgcmV0cmlldmluZyBHZXRPYmplY3RDb21tYW5kIG1ldGFkYXRhYDtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBTdG9yYWdlRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvcixcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIGlmIHRoZSBjYWxsIGFib3ZlIGRvZXMgbm90IHJldHVybiBhbiBlcnJvciBub3QgZm91bmQsIGJ1dCBpdCBpcyB0aHJvd24gaW4gdGhlIG1ldGFkYXRhIHN0YXR1cyBjb2RlIGluc3RlYWRcbiAgICAgICAgICAgICAqIGNyZWF0ZSBhIG5ldyBmaWxlICwgYW5kIGFwcGVuZCB0aGUgYXBwcm9wcmlhdGUgZGF0YSBhcyB0aGUgZmlyc3QgcmVjb3JkIGluIHRoZSByZXBvcnRcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgaWYgKG1ldGFkYXRhLiRtZXRhZGF0YS5odHRwU3RhdHVzQ29kZSAhPT0gdW5kZWZpbmVkICYmIG1ldGFkYXRhLiRtZXRhZGF0YS5odHRwU3RhdHVzQ29kZSA9PT0gNDA0KSB7XG4gICAgICAgICAgICAgICAgLy8gZXhlY3V0ZSB0aGUgUHV0T2JqZWN0Q29tbWFuZFxuICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBgTU9PTkJFQU0gTUlMSVRBUlkgVkVSSUZJQ0FUSU9OIFJFUE9SVCAtICR7bWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnROYW1lfVxcbiR7cHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRJbnB1dC5maXJzdE5hbWV9ICR7cHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRJbnB1dC5sYXN0TmFtZX0gLSAke3B1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0SW5wdXQucGhvbmVOdW1iZXJ9IHwgJHtwdXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydElucHV0LmVtYWlsQWRkcmVzc30gfCAke3B1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0SW5wdXQubWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXMgPT09IE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZS5WZXJpZmllZCA/ICdUSEFOS1MgRk9SIFNJR05JTkcgVVAnIDogcHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRJbnB1dC5taWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1cyA9PT0gTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNUeXBlLlJlamVjdGVkID8gJ1JFSkVDVEVEJyA6ICdQRU5ESU5HJ31gO1xuICAgICAgICAgICAgICAgIGNvbnN0IHB1dE9iamVjdENvbW1hbmRGbGFnID0gYXdhaXQgcHV0T2JqZWN0Q29tbWFuZEV4ZWN1dGlvbihzM0NsaWVudCwgYnVja2V0TmFtZSwgYCR7bWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnROYW1lfS50eHRgLCBkYXRhKTtcbiAgICAgICAgICAgICAgICBpZiAocHV0T2JqZWN0Q29tbWFuZEZsYWcpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGAke21pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0TmFtZX0udHh0IHJlcG9ydCBjcmVhdGVkYFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgcmV0cmlldmluZyBQdXRPYmplY3RDb21tYW5kIG1ldGFkYXRhYDtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBTdG9yYWdlRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvcixcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgcmV0cmlldmluZyByZXBvcnQgJHttaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydE5hbWV9IG1ldGFkYXRhYDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9YCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogU3RvcmFnZUVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3IsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgaWYgKGVyciAmJiBlcnIubmFtZSAmJiBlcnIubmFtZSA9PT0gJ05vdEZvdW5kJykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYFJlcG9ydCAke21pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0TmFtZX0udHh0IG5vdCBmb3VuZGApO1xuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgICAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiBmaWxlIHdhcyBub3QgZm91bmQsIHNvIGNyZWF0ZSBhIG5ldyBmaWxlLCBhbmQgYXBwZW5kIHRoZSBhcHByb3ByaWF0ZSBkYXRhXG4gICAgICAgICAgICAgICAgICogYXMgdGhlIGZpcnN0IHJlY29yZCBpbiB0aGUgcmVwb3J0XG4gICAgICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAgICAgKiBmaXJzdCBpbml0aWFsaXppbmcgYW55IEFXUyBTREsgcmVzb3VyY2VzXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgY29uc3QgczNDbGllbnQgPSBuZXcgUzNDbGllbnQoe3JlZ2lvbjogcmVnaW9ufSk7XG4gICAgICAgICAgICAgICAgY29uc3QgYnVja2V0TmFtZSA9IGAke0NvbnN0YW50cy5TdG9yYWdlQ29uc3RhbnRzLk1PT05CRUFNX01JTElUQVJZX1ZFUklGSUNBVElPTl9SRVBPUlRJTkdfQlVDS0VUX05BTUV9LSR7cHJvY2Vzcy5lbnYuRU5WX05BTUUhfS0ke3JlZ2lvbn1gO1xuXG4gICAgICAgICAgICAgICAgLy8gZXhlY3V0ZSB0aGUgUHV0T2JqZWN0Q29tbWFuZFxuICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBgTU9PTkJFQU0gTUlMSVRBUlkgVkVSSUZJQ0FUSU9OIFJFUE9SVCAtICR7bWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnROYW1lfVxcbiR7cHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRJbnB1dC5maXJzdE5hbWV9ICR7cHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRJbnB1dC5sYXN0TmFtZX0gLSAke3B1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0SW5wdXQucGhvbmVOdW1iZXJ9IHwgJHtwdXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydElucHV0LmVtYWlsQWRkcmVzc30gfCAke3B1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0SW5wdXQubWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXMgPT09IE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZS5WZXJpZmllZCA/ICdUSEFOS1MgRk9SIFNJR05JTkcgVVAnIDogcHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRJbnB1dC5taWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1cyA9PT0gTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNUeXBlLlJlamVjdGVkID8gJ1JFSkVDVEVEJyA6ICdQRU5ESU5HJ31gO1xuICAgICAgICAgICAgICAgIGNvbnN0IHB1dE9iamVjdENvbW1hbmRGbGFnID0gYXdhaXQgcHV0T2JqZWN0Q29tbWFuZEV4ZWN1dGlvbihzM0NsaWVudCwgYnVja2V0TmFtZSwgYCR7bWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnROYW1lfS50eHRgLCBkYXRhKTtcbiAgICAgICAgICAgICAgICBpZiAocHV0T2JqZWN0Q29tbWFuZEZsYWcpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGAke21pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0TmFtZX0udHh0IHJlcG9ydCBjcmVhdGVkYFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgcmV0cmlldmluZyBQdXRPYmplY3RDb21tYW5kIG1ldGFkYXRhYDtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBTdG9yYWdlRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvcixcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nIHRoZSBQdXRPYmplY3RDb21tYW5kICR7ZXJyb3J9YDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogU3RvcmFnZUVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nICR7ZmllbGROYW1lfSBxdWVyeSAke2Vycn1gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFN0b3JhZ2VFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHVzZWQgdG8gcHV0IGNvbnRlbnQgaW50byBhIG5ldyBhbmQvb3IgZXhpc3RpbmcgcmVwb3J0LlxuICpcbiAqIEBwYXJhbSBzM0NsaWVudCBzM0NsaWVudCB1c2VkIHRvIGV4ZWN1dGUgdGhlIGNvbW1hbmRcbiAqIEBwYXJhbSBidWNrZXROYW1lIHRoZSBuYW1lIG9mIHRoZSBidWNrZXQgY29udGFpbmluZyB0aGUgbmV3IGFuZC9vciBleGlzdGluZyBvYmplY3RcbiAqIEBwYXJhbSBvYmplY3RLZXkgdGhlIG5hbWUgb2YgdGhlIG5ld2x5IGNyZWF0ZWQgYW5kL29yIGV4aXN0aW5nIG9iamVjdFxuICogQHBhcmFtIGNvbnRlbnQgdGhlIGNvbnRlbnQgdG8gYWRkIHRvIHRoZSByZXBvcnRcbiAqXG4gKiBAcmV0dXJucyBhIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgYm9vbGVhbn0gcmVwcmVzZW50aW5nIGEgZmxhZyBoaWdobGlnaHRpbmcgd2hldGhlclxuICogdGhlIGNvbW1hbmQgd2FzIHN1Y2Nlc3NmdWwgb3Igbm90XG4gKlxuICovXG5jb25zdCBwdXRPYmplY3RDb21tYW5kRXhlY3V0aW9uID0gYXN5bmMgKHMzQ2xpZW50OiBTM0NsaWVudCwgYnVja2V0TmFtZTogc3RyaW5nLCBvYmplY3RLZXk6IHN0cmluZywgY29udGVudDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgLy8gZXhlY3V0ZSB0aGUgUHV0T2JqZWN0Q29tbWFuZFxuICAgIGNvbnN0IHB1dE9iamVjdENvbW1hbmRSZXNwb25zZSA9IGF3YWl0IHMzQ2xpZW50LnNlbmQobmV3IFB1dE9iamVjdENvbW1hbmQoKHtcbiAgICAgICAgQnVja2V0OiBidWNrZXROYW1lLFxuICAgICAgICBLZXk6IG9iamVjdEtleSxcbiAgICAgICAgQm9keTogY29udGVudFxuICAgIH0pKSk7XG5cbiAgICAvLyBtYWtlIHN1cmUgdGhhdCB0aGUgUHV0T2JqZWN0Q29tbWFuZCB3YXMgc3VjY2Vzc2Z1bGx5IGV4ZWN1dGVkXG4gICAgaWYgKHB1dE9iamVjdENvbW1hbmRSZXNwb25zZS4kbWV0YWRhdGEuaHR0cFN0YXR1c0NvZGUgIT09IHVuZGVmaW5lZCAmJiBwdXRPYmplY3RDb21tYW5kUmVzcG9uc2UuJG1ldGFkYXRhLmh0dHBTdGF0dXNDb2RlID09PSAyMDApIHtcbiAgICAgICAgY29uc29sZS5sb2coYE5ldyAke29iamVjdEtleX0gcmVwb3J0IGNyZWF0ZWQgd2l0aCBhbiBpbml0aWFsIHJlY29yZCFgKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgcmV0cmlldmluZyBQdXRPYmplY3RDb21tYW5kIG1ldGFkYXRhYDtcbiAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfWApO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuIl19