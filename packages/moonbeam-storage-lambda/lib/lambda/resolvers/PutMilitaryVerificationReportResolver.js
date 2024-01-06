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
                const updatedData = `${oldData}\n${putMilitaryVerificationReportInput.firstName} ${putMilitaryVerificationReportInput.lastName} - ${putMilitaryVerificationReportInput.phoneNumber} ${putMilitaryVerificationReportInput.militaryVerificationStatus === moonbeam_models_1.MilitaryVerificationStatusType.Verified ? 'THANKS FOR SIGNING UP' : putMilitaryVerificationReportInput.militaryVerificationStatus === moonbeam_models_1.MilitaryVerificationStatusType.Rejected ? 'REJECTED' : 'PENDING'}`;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRSZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL1B1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0UmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0RBTW1DO0FBQ25DLGtEQUFtRztBQUVuRzs7Ozs7Ozs7R0FRRztBQUNJLE1BQU0sNkJBQTZCLEdBQUcsS0FBSyxFQUFFLFNBQWlCLEVBQUUsa0NBQXNFLEVBQStDLEVBQUU7SUFDMUwseUVBQXlFO0lBQ3pFLE1BQU0saUJBQWlCLEdBQUcsa0NBQWtDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUM3RSxNQUFNLDhCQUE4QixHQUFHLEdBQUcsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLElBQUksaUJBQWlCLENBQUMsQ0FBQyxDQUFDLElBQUksaUJBQWlCLENBQUMsQ0FBQyxDQUFDLElBQUksa0NBQWtDLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDcEssSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2QyxxQ0FBcUM7UUFDckMsTUFBTSxRQUFRLEdBQUcsSUFBSSxvQkFBUSxDQUFDLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7UUFDaEQsTUFBTSxVQUFVLEdBQUcsR0FBRywyQkFBUyxDQUFDLGdCQUFnQixDQUFDLG9EQUFvRCxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUyxJQUFJLE1BQU0sRUFBRSxDQUFDO1FBRTNJLGtGQUFrRjtRQUNsRixNQUFNLFFBQVEsR0FBRyxNQUFNLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSw2QkFBaUIsQ0FBQyxDQUFDO1lBQ3hELE1BQU0sRUFBRSxVQUFVO1lBQ2xCLEdBQUcsRUFBRSxHQUFH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O2dCQUMxQixTQUFTLEVBQUUsa0NBQWdCLENBQUMsZUFBZTthQUM5QyxDQUFDO1NBQ0w7S0FDSjtBQUNMLENBQUMsQ0FBQTtBQXhJWSxRQUFBLDZCQUE2QixpQ0F3SXpDO0FBRUQ7Ozs7Ozs7Ozs7O0dBV0c7QUFDSCxNQUFNLHlCQUF5QixHQUFHLEtBQUssRUFBRSxRQUFrQixFQUFFLFVBQWtCLEVBQUUsU0FBaUIsRUFBRSxPQUFlLEVBQW9CLEVBQUU7SUFDckksK0JBQStCO0lBQy9CLE1BQU0sd0JBQXdCLEdBQUcsTUFBTSxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksNEJBQWdCLENBQUMsQ0FBQztRQUN2RSxNQUFNLEVBQUUsVUFBVTtRQUNsQixHQUFHLEVBQUUsU0FBUztRQUNkLElBQUksRUFBRSxPQUFPO0tBQ2hCLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFTCxnRUFBZ0U7SUFDaEUsSUFBSSx3QkFBd0IsQ0FBQyxTQUFTLENBQUMsY0FBYyxLQUFLLFNBQVMsSUFBSSx3QkFBd0IsQ0FBQyxTQUFTLENBQUMsY0FBYyxLQUFLLEdBQUcsRUFBRTtRQUM5SCxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sU0FBUyx5Q0FBeUMsQ0FBQyxDQUFDO1FBQ3ZFLE9BQU8sSUFBSSxDQUFDO0tBQ2Y7U0FBTTtRQUNILE1BQU0sWUFBWSxHQUFHLDZEQUE2RCxDQUFDO1FBQ25GLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxZQUFZLEVBQUUsQ0FBQyxDQUFDO1FBQy9CLE9BQU8sS0FBSyxDQUFDO0tBQ2hCO0FBQ0wsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBDb25zdGFudHMsXG4gICAgTWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRSZXNwb25zZSxcbiAgICBNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1R5cGUsXG4gICAgUHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRJbnB1dCxcbiAgICBTdG9yYWdlRXJyb3JUeXBlXG59IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5pbXBvcnQge0dldE9iamVjdENvbW1hbmQsIEhlYWRPYmplY3RDb21tYW5kLCBQdXRPYmplY3RDb21tYW5kLCBTM0NsaWVudH0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1zM1wiO1xuXG4vKipcbiAqIFB1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0IHJlc29sdmVyXG4gKlxuICogQHBhcmFtIGZpZWxkTmFtZSBuYW1lIG9mIHRoZSByZXNvbHZlciBwYXRoIGZyb20gdGhlIEFwcFN5bmMgZXZlbnRcbiAqIEBwYXJhbSBwdXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydElucHV0IGlucHV0LCBiYXNlZCBvbiB3aGljaCB0aGUgYXBwcm9wcmlhdGUgcmVwb3J0aW5nXG4gKiBmaWxlIGlzIHJldHJpZXZlZCBmcm9tIHN0b3JhZ2UsIHRocm91Z2ggUzMuXG4gKlxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydFJlc3BvbnNlfVxuICovXG5leHBvcnQgY29uc3QgcHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnQgPSBhc3luYyAoZmllbGROYW1lOiBzdHJpbmcsIHB1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0SW5wdXQ6IFB1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0SW5wdXQpOiBQcm9taXNlPE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0UmVzcG9uc2U+ID0+IHtcbiAgICAvLyBwdXQgdG9nZXRoZXIgdGhlIHVuaXF1ZSBuYW1lIG9mIHRoZSByZXBvcnQgdG8gbG9vayB1cCBpbiB0aGUgUzMgYnVja2V0XG4gICAgY29uc3QgaW5jb21pbmdEYXRlUGFydHMgPSBwdXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydElucHV0LmRhdGUuc3BsaXQoJy0nKTtcbiAgICBjb25zdCBtaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydE5hbWUgPSBgJHtpbmNvbWluZ0RhdGVQYXJ0c1swXX0tJHtpbmNvbWluZ0RhdGVQYXJ0c1sxXX0tJHtpbmNvbWluZ0RhdGVQYXJ0c1syXX0tJHtwdXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydElucHV0LnJlcG9ydE51bWJlcn1gO1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8vIGluaXRpYWxpemluZyBhbnkgQVdTIFNESyByZXNvdXJjZXNcbiAgICAgICAgY29uc3QgczNDbGllbnQgPSBuZXcgUzNDbGllbnQoe3JlZ2lvbjogcmVnaW9ufSk7XG4gICAgICAgIGNvbnN0IGJ1Y2tldE5hbWUgPSBgJHtDb25zdGFudHMuU3RvcmFnZUNvbnN0YW50cy5NT09OQkVBTV9NSUxJVEFSWV9WRVJJRklDQVRJT05fUkVQT1JUSU5HX0JVQ0tFVF9OQU1FfS0ke3Byb2Nlc3MuZW52LkVOVl9OQU1FIX0tJHtyZWdpb259YDtcblxuICAgICAgICAvLyBjaGVjayBpZiB0aGUgb2JqZWN0IGV4aXN0cyBpbiB0aGUgYnVja2V0LCB3aXRob3V0IGFjdHVhbGx5IHJldHJpZXZpbmcgaXQgZmlyc3QuXG4gICAgICAgIGNvbnN0IG1ldGFkYXRhID0gYXdhaXQgczNDbGllbnQuc2VuZChuZXcgSGVhZE9iamVjdENvbW1hbmQoKHtcbiAgICAgICAgICAgIEJ1Y2tldDogYnVja2V0TmFtZSxcbiAgICAgICAgICAgIEtleTogYCR7bWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnROYW1lfS50eHRgXG4gICAgICAgIH0pKSk7XG5cbiAgICAgICAgLy8gaWYgdGhlcmUncyBhbiBleGlzdGVudCBvYmplY3QvcmVwb3J0LCB3aXRoIHZhbGlkIG1ldGFkYXRhXG4gICAgICAgIGlmIChtZXRhZGF0YS5NZXRhZGF0YSAmJiBtZXRhZGF0YS4kbWV0YWRhdGEuaHR0cFN0YXR1c0NvZGUgIT09IHVuZGVmaW5lZCAmJiBtZXRhZGF0YS4kbWV0YWRhdGEuaHR0cFN0YXR1c0NvZGUgPT09IDIwMCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYFJlcG9ydCAke21pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0TmFtZX0udHh0IGZvdW5kIWApO1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBmaWxlIHdhcyBmb3VuZCwgc28ganVzdCBhcHBlbmQgdGhlIGFwcHJvcHJpYXRlIGRhdGEgYXMgdGhlIG5leHQgcmVjb3JkIGluIGl0LlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIGZpcnN0IHJldHJpZXZlIHRoZSBvbGQgZGF0ZSBpbiB0aGUgZXhpc3RpbmcgZmlsZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgY29uc3Qgb2JqZWN0S2V5ID0gYCR7bWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnROYW1lfS50eHRgO1xuICAgICAgICAgICAgY29uc3QgZ2V0T2JqZWN0Q29tbWFuZFJlc3BvbnNlID0gYXdhaXQgczNDbGllbnQuc2VuZChuZXcgR2V0T2JqZWN0Q29tbWFuZCgoe1xuICAgICAgICAgICAgICAgIEJ1Y2tldDogYnVja2V0TmFtZSxcbiAgICAgICAgICAgICAgICBLZXk6IG9iamVjdEtleVxuICAgICAgICAgICAgfSkpKTtcbiAgICAgICAgICAgIC8vIG1ha2Ugc3VyZSB0aGF0IHRoZSBHZXRPYmplY3RDb21tYW5kIHdhcyBzdWNjZXNzZnVsbHkgZXhlY3V0ZWRcbiAgICAgICAgICAgIGlmIChnZXRPYmplY3RDb21tYW5kUmVzcG9uc2UuJG1ldGFkYXRhLmh0dHBTdGF0dXNDb2RlICE9PSB1bmRlZmluZWQgJiYgZ2V0T2JqZWN0Q29tbWFuZFJlc3BvbnNlLiRtZXRhZGF0YS5odHRwU3RhdHVzQ29kZSA9PT0gMjAwICYmIGdldE9iamVjdENvbW1hbmRSZXNwb25zZS5Cb2R5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBvbGREYXRhID0gYXdhaXQgZ2V0T2JqZWN0Q29tbWFuZFJlc3BvbnNlLkJvZHkudHJhbnNmb3JtVG9TdHJpbmcoKTtcblxuICAgICAgICAgICAgICAgIC8vIGV4ZWN1dGUgdGhlIFB1dE9iamVjdENvbW1hbmQsIHRvIHVwZGF0ZSB0aGUgZmlsZSBvbGQgd2l0aCB0aGUgbmV3IGRhdGFcbiAgICAgICAgICAgICAgICBjb25zdCB1cGRhdGVkRGF0YSA9IGAke29sZERhdGF9XFxuJHtwdXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydElucHV0LmZpcnN0TmFtZX0gJHtwdXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydElucHV0Lmxhc3ROYW1lfSAtICR7cHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRJbnB1dC5waG9uZU51bWJlcn0gJHtwdXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydElucHV0Lm1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzID09PSBNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1R5cGUuVmVyaWZpZWQgPyAnVEhBTktTIEZPUiBTSUdOSU5HIFVQJyA6IHB1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0SW5wdXQubWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXMgPT09IE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZS5SZWplY3RlZCA/ICdSRUpFQ1RFRCcgOiAnUEVORElORyd9YDtcbiAgICAgICAgICAgICAgICBjb25zdCBwdXRPYmplY3RDb21tYW5kRmxhZyA9IGF3YWl0IHB1dE9iamVjdENvbW1hbmRFeGVjdXRpb24oczNDbGllbnQsIGJ1Y2tldE5hbWUsIG9iamVjdEtleSwgdXBkYXRlZERhdGEpO1xuICAgICAgICAgICAgICAgIGlmIChwdXRPYmplY3RDb21tYW5kRmxhZykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogYCR7bWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnROYW1lfS50eHQgcmVwb3J0IHVwZGF0ZWRgXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSByZXRyaWV2aW5nIFB1dE9iamVjdENvbW1hbmQgbWV0YWRhdGFgO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFN0b3JhZ2VFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yLFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSByZXRyaWV2aW5nIEdldE9iamVjdENvbW1hbmQgbWV0YWRhdGFgO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFN0b3JhZ2VFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogaWYgdGhlIGNhbGwgYWJvdmUgZG9lcyBub3QgcmV0dXJuIGFuIGVycm9yIG5vdCBmb3VuZCwgYnV0IGl0IGlzIHRocm93biBpbiB0aGUgbWV0YWRhdGEgc3RhdHVzIGNvZGUgaW5zdGVhZFxuICAgICAgICAgICAgICogY3JlYXRlIGEgbmV3IGZpbGUgLCBhbmQgYXBwZW5kIHRoZSBhcHByb3ByaWF0ZSBkYXRhIGFzIHRoZSBmaXJzdCByZWNvcmQgaW4gdGhlIHJlcG9ydFxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBpZiAobWV0YWRhdGEuJG1ldGFkYXRhLmh0dHBTdGF0dXNDb2RlICE9PSB1bmRlZmluZWQgJiYgbWV0YWRhdGEuJG1ldGFkYXRhLmh0dHBTdGF0dXNDb2RlID09PSA0MDQpIHtcbiAgICAgICAgICAgICAgICAvLyBleGVjdXRlIHRoZSBQdXRPYmplY3RDb21tYW5kXG4gICAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IGBNT09OQkVBTSBNSUxJVEFSWSBWRVJJRklDQVRJT04gUkVQT1JUIC0gJHttaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydE5hbWV9XFxuJHtwdXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydElucHV0LmZpcnN0TmFtZX0gJHtwdXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydElucHV0Lmxhc3ROYW1lfSAtICR7cHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRJbnB1dC5waG9uZU51bWJlcn0gJHtwdXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydElucHV0Lm1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzID09PSBNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1R5cGUuVmVyaWZpZWQgPyAnVEhBTktTIEZPUiBTSUdOSU5HIFVQJyA6IHB1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0SW5wdXQubWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXMgPT09IE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZS5SZWplY3RlZCA/ICdSRUpFQ1RFRCcgOiAnUEVORElORyd9YDtcbiAgICAgICAgICAgICAgICBjb25zdCBwdXRPYmplY3RDb21tYW5kRmxhZyA9IGF3YWl0IHB1dE9iamVjdENvbW1hbmRFeGVjdXRpb24oczNDbGllbnQsIGJ1Y2tldE5hbWUsIGAke21pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0TmFtZX0udHh0YCwgZGF0YSk7XG4gICAgICAgICAgICAgICAgaWYgKHB1dE9iamVjdENvbW1hbmRGbGFnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBgJHttaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydE5hbWV9LnR4dCByZXBvcnQgY3JlYXRlZGBcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHJldHJpZXZpbmcgUHV0T2JqZWN0Q29tbWFuZCBtZXRhZGF0YWA7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogU3RvcmFnZUVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHJldHJpZXZpbmcgcmVwb3J0ICR7bWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnROYW1lfSBtZXRhZGF0YWA7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfWApO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFN0b3JhZ2VFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIGlmIChlcnIgJiYgZXJyLm5hbWUgJiYgZXJyLm5hbWUgPT09ICdOb3RGb3VuZCcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBSZXBvcnQgJHttaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydE5hbWV9LnR4dCBub3QgZm91bmRgKTtcblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICAgICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogZmlsZSB3YXMgbm90IGZvdW5kLCBzbyBjcmVhdGUgYSBuZXcgZmlsZSwgYW5kIGFwcGVuZCB0aGUgYXBwcm9wcmlhdGUgZGF0YVxuICAgICAgICAgICAgICAgICAqIGFzIHRoZSBmaXJzdCByZWNvcmQgaW4gdGhlIHJlcG9ydFxuICAgICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAgICogZmlyc3QgaW5pdGlhbGl6aW5nIGFueSBBV1MgU0RLIHJlc291cmNlc1xuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGNvbnN0IHMzQ2xpZW50ID0gbmV3IFMzQ2xpZW50KHtyZWdpb246IHJlZ2lvbn0pO1xuICAgICAgICAgICAgICAgIGNvbnN0IGJ1Y2tldE5hbWUgPSBgJHtDb25zdGFudHMuU3RvcmFnZUNvbnN0YW50cy5NT09OQkVBTV9NSUxJVEFSWV9WRVJJRklDQVRJT05fUkVQT1JUSU5HX0JVQ0tFVF9OQU1FfS0ke3Byb2Nlc3MuZW52LkVOVl9OQU1FIX0tJHtyZWdpb259YDtcblxuICAgICAgICAgICAgICAgIC8vIGV4ZWN1dGUgdGhlIFB1dE9iamVjdENvbW1hbmRcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRhID0gYE1PT05CRUFNIE1JTElUQVJZIFZFUklGSUNBVElPTiBSRVBPUlQgLSAke21pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0TmFtZX1cXG4ke3B1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0SW5wdXQuZmlyc3ROYW1lfSAke3B1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0SW5wdXQubGFzdE5hbWV9IC0gJHtwdXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydElucHV0LnBob25lTnVtYmVyfSAke3B1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0SW5wdXQubWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXMgPT09IE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZS5WZXJpZmllZCA/ICdUSEFOS1MgRk9SIFNJR05JTkcgVVAnIDogcHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRJbnB1dC5taWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1cyA9PT0gTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNUeXBlLlJlamVjdGVkID8gJ1JFSkVDVEVEJyA6ICdQRU5ESU5HJ31gO1xuICAgICAgICAgICAgICAgIGNvbnN0IHB1dE9iamVjdENvbW1hbmRGbGFnID0gYXdhaXQgcHV0T2JqZWN0Q29tbWFuZEV4ZWN1dGlvbihzM0NsaWVudCwgYnVja2V0TmFtZSwgYCR7bWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnROYW1lfS50eHRgLCBkYXRhKTtcbiAgICAgICAgICAgICAgICBpZiAocHV0T2JqZWN0Q29tbWFuZEZsYWcpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGAke21pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0TmFtZX0udHh0IHJlcG9ydCBjcmVhdGVkYFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgcmV0cmlldmluZyBQdXRPYmplY3RDb21tYW5kIG1ldGFkYXRhYDtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBTdG9yYWdlRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvcixcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nIHRoZSBQdXRPYmplY3RDb21tYW5kICR7ZXJyb3J9YDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogU3RvcmFnZUVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nICR7ZmllbGROYW1lfSBxdWVyeSAke2Vycn1gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFN0b3JhZ2VFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHVzZWQgdG8gcHV0IGNvbnRlbnQgaW50byBhIG5ldyBhbmQvb3IgZXhpc3RpbmcgcmVwb3J0LlxuICpcbiAqIEBwYXJhbSBzM0NsaWVudCBzM0NsaWVudCB1c2VkIHRvIGV4ZWN1dGUgdGhlIGNvbW1hbmRcbiAqIEBwYXJhbSBidWNrZXROYW1lIHRoZSBuYW1lIG9mIHRoZSBidWNrZXQgY29udGFpbmluZyB0aGUgbmV3IGFuZC9vciBleGlzdGluZyBvYmplY3RcbiAqIEBwYXJhbSBvYmplY3RLZXkgdGhlIG5hbWUgb2YgdGhlIG5ld2x5IGNyZWF0ZWQgYW5kL29yIGV4aXN0aW5nIG9iamVjdFxuICogQHBhcmFtIGNvbnRlbnQgdGhlIGNvbnRlbnQgdG8gYWRkIHRvIHRoZSByZXBvcnRcbiAqXG4gKiBAcmV0dXJucyBhIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgYm9vbGVhbn0gcmVwcmVzZW50aW5nIGEgZmxhZyBoaWdobGlnaHRpbmcgd2hldGhlclxuICogdGhlIGNvbW1hbmQgd2FzIHN1Y2Nlc3NmdWwgb3Igbm90XG4gKlxuICovXG5jb25zdCBwdXRPYmplY3RDb21tYW5kRXhlY3V0aW9uID0gYXN5bmMgKHMzQ2xpZW50OiBTM0NsaWVudCwgYnVja2V0TmFtZTogc3RyaW5nLCBvYmplY3RLZXk6IHN0cmluZywgY29udGVudDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgLy8gZXhlY3V0ZSB0aGUgUHV0T2JqZWN0Q29tbWFuZFxuICAgIGNvbnN0IHB1dE9iamVjdENvbW1hbmRSZXNwb25zZSA9IGF3YWl0IHMzQ2xpZW50LnNlbmQobmV3IFB1dE9iamVjdENvbW1hbmQoKHtcbiAgICAgICAgQnVja2V0OiBidWNrZXROYW1lLFxuICAgICAgICBLZXk6IG9iamVjdEtleSxcbiAgICAgICAgQm9keTogY29udGVudFxuICAgIH0pKSk7XG5cbiAgICAvLyBtYWtlIHN1cmUgdGhhdCB0aGUgUHV0T2JqZWN0Q29tbWFuZCB3YXMgc3VjY2Vzc2Z1bGx5IGV4ZWN1dGVkXG4gICAgaWYgKHB1dE9iamVjdENvbW1hbmRSZXNwb25zZS4kbWV0YWRhdGEuaHR0cFN0YXR1c0NvZGUgIT09IHVuZGVmaW5lZCAmJiBwdXRPYmplY3RDb21tYW5kUmVzcG9uc2UuJG1ldGFkYXRhLmh0dHBTdGF0dXNDb2RlID09PSAyMDApIHtcbiAgICAgICAgY29uc29sZS5sb2coYE5ldyAke29iamVjdEtleX0gcmVwb3J0IGNyZWF0ZWQgd2l0aCBhbiBpbml0aWFsIHJlY29yZCFgKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgcmV0cmlldmluZyBQdXRPYmplY3RDb21tYW5kIG1ldGFkYXRhYDtcbiAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfWApO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuIl19