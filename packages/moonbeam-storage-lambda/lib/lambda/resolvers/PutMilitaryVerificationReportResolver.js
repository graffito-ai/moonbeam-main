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
            return {
                data: militaryVerificationReportName
            };
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
    catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
        console.log(errorMessage);
        // @ts-ignore
        if (err && err.name && err.name === 'NotFound') {
            return {
                errorMessage: `Report ${militaryVerificationReportName}.txt not found`,
                errorType: moonbeam_models_1.StorageErrorType.NoneOrAbsent
            };
        }
        return {
            errorMessage: errorMessage,
            errorType: moonbeam_models_1.StorageErrorType.UnexpectedError
        };
    }
};
exports.putMilitaryVerificationReport = putMilitaryVerificationReport;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRSZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL1B1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0UmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0RBS21DO0FBQ25DLGtEQUErRDtBQUUvRDs7Ozs7Ozs7R0FRRztBQUNJLE1BQU0sNkJBQTZCLEdBQUcsS0FBSyxFQUFFLFNBQWlCLEVBQUUsa0NBQXNFLEVBQStDLEVBQUU7SUFDMUwseUVBQXlFO0lBQ3pFLE1BQU0saUJBQWlCLEdBQUcsa0NBQWtDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUM3RSxNQUFNLDhCQUE4QixHQUFHLEdBQUcsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLElBQUksaUJBQWlCLENBQUMsQ0FBQyxDQUFDLElBQUksaUJBQWlCLENBQUMsQ0FBQyxDQUFDLElBQUksa0NBQWtDLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDcEssSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2QyxxQ0FBcUM7UUFDckMsTUFBTSxRQUFRLEdBQUcsSUFBSSxvQkFBUSxDQUFDLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7UUFDaEQsTUFBTSxVQUFVLEdBQUcsR0FBRywyQkFBUyxDQUFDLGdCQUFnQixDQUFDLG9EQUFvRCxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUyxJQUFJLE1BQU0sRUFBRSxDQUFDO1FBRTNJLGtGQUFrRjtRQUNsRixNQUFNLFFBQVEsR0FBRyxNQUFNLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSw2QkFBaUIsQ0FBQyxDQUFDO1lBQ3hELE1BQU0sRUFBRSxVQUFVO1lBQ2xCLEdBQUcsRUFBRSxHQUFHLDhCQUE4QixNQUFNO1NBQy9DLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFTCw0REFBNEQ7UUFDNUQsSUFBSSxRQUFRLENBQUMsUUFBUSxJQUFJLFFBQVEsQ0FBQyxTQUFTLENBQUMsY0FBYyxLQUFLLFNBQVMsSUFBSSxRQUFRLENBQUMsU0FBUyxDQUFDLGNBQWMsS0FBSyxHQUFHLEVBQUU7WUFDbkgsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLDhCQUE4QixhQUFhLENBQUMsQ0FBQztZQUNuRSxPQUFPO2dCQUNILElBQUksRUFBRSw4QkFBOEI7YUFDdkMsQ0FBQTtTQUNKO2FBQU07WUFDSCxNQUFNLFlBQVksR0FBRyw0Q0FBNEMsOEJBQThCLFdBQVcsQ0FBQztZQUMzRyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsWUFBWSxFQUFFLENBQUMsQ0FBQztZQUMvQixPQUFPO2dCQUNILFlBQVksRUFBRSxZQUFZO2dCQUMxQixTQUFTLEVBQUUsa0NBQWdCLENBQUMsZUFBZTthQUM5QyxDQUFBO1NBQ0o7S0FDSjtJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1YsTUFBTSxZQUFZLEdBQUcsb0NBQW9DLFNBQVMsVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNsRixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzFCLGFBQWE7UUFDYixJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUssVUFBVSxFQUFFO1lBQzVDLE9BQU87Z0JBQ0gsWUFBWSxFQUFFLFVBQVUsOEJBQThCLGdCQUFnQjtnQkFDdEUsU0FBUyxFQUFFLGtDQUFnQixDQUFDLFlBQVk7YUFDM0MsQ0FBQTtTQUNKO1FBQ0QsT0FBTztZQUNILFlBQVksRUFBRSxZQUFZO1lBQzFCLFNBQVMsRUFBRSxrQ0FBZ0IsQ0FBQyxlQUFlO1NBQzlDLENBQUM7S0FDTDtBQUNMLENBQUMsQ0FBQTtBQS9DWSxRQUFBLDZCQUE2QixpQ0ErQ3pDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBDb25zdGFudHMsXG4gICAgTWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRSZXNwb25zZSxcbiAgICBQdXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydElucHV0LFxuICAgIFN0b3JhZ2VFcnJvclR5cGVcbn0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcbmltcG9ydCB7SGVhZE9iamVjdENvbW1hbmQsIFMzQ2xpZW50fSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LXMzXCI7XG5cbi8qKlxuICogUHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnQgcmVzb2x2ZXJcbiAqXG4gKiBAcGFyYW0gZmllbGROYW1lIG5hbWUgb2YgdGhlIHJlc29sdmVyIHBhdGggZnJvbSB0aGUgQXBwU3luYyBldmVudFxuICogQHBhcmFtIHB1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0SW5wdXQgaW5wdXQsIGJhc2VkIG9uIHdoaWNoIHRoZSBhcHByb3ByaWF0ZSByZXBvcnRpbmdcbiAqIGZpbGUgaXMgcmV0cmlldmVkIGZyb20gc3RvcmFnZSwgdGhyb3VnaCBTMy5cbiAqXG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0UmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBwdXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydCA9IGFzeW5jIChmaWVsZE5hbWU6IHN0cmluZywgcHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRJbnB1dDogUHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRJbnB1dCk6IFByb21pc2U8TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRSZXNwb25zZT4gPT4ge1xuICAgIC8vIHB1dCB0b2dldGhlciB0aGUgdW5pcXVlIG5hbWUgb2YgdGhlIHJlcG9ydCB0byBsb29rIHVwIGluIHRoZSBTMyBidWNrZXRcbiAgICBjb25zdCBpbmNvbWluZ0RhdGVQYXJ0cyA9IHB1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0SW5wdXQuZGF0ZS5zcGxpdCgnLScpO1xuICAgIGNvbnN0IG1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0TmFtZSA9IGAke2luY29taW5nRGF0ZVBhcnRzWzBdfS0ke2luY29taW5nRGF0ZVBhcnRzWzFdfS0ke2luY29taW5nRGF0ZVBhcnRzWzJdfS0ke3B1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0SW5wdXQucmVwb3J0TnVtYmVyfWA7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLy8gaW5pdGlhbGl6aW5nIGFueSBBV1MgU0RLIHJlc291cmNlc1xuICAgICAgICBjb25zdCBzM0NsaWVudCA9IG5ldyBTM0NsaWVudCh7cmVnaW9uOiByZWdpb259KTtcbiAgICAgICAgY29uc3QgYnVja2V0TmFtZSA9IGAke0NvbnN0YW50cy5TdG9yYWdlQ29uc3RhbnRzLk1PT05CRUFNX01JTElUQVJZX1ZFUklGSUNBVElPTl9SRVBPUlRJTkdfQlVDS0VUX05BTUV9LSR7cHJvY2Vzcy5lbnYuRU5WX05BTUUhfS0ke3JlZ2lvbn1gO1xuXG4gICAgICAgIC8vIGNoZWNrIGlmIHRoZSBvYmplY3QgZXhpc3RzIGluIHRoZSBidWNrZXQsIHdpdGhvdXQgYWN0dWFsbHkgcmV0cmlldmluZyBpdCBmaXJzdC5cbiAgICAgICAgY29uc3QgbWV0YWRhdGEgPSBhd2FpdCBzM0NsaWVudC5zZW5kKG5ldyBIZWFkT2JqZWN0Q29tbWFuZCgoe1xuICAgICAgICAgICAgQnVja2V0OiBidWNrZXROYW1lLFxuICAgICAgICAgICAgS2V5OiBgJHttaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydE5hbWV9LnR4dGBcbiAgICAgICAgfSkpKTtcblxuICAgICAgICAvLyBpZiB0aGVyZSdzIGFuIGV4aXN0ZW50IG9iamVjdC9yZXBvcnQsIHdpdGggdmFsaWQgbWV0YWRhdGFcbiAgICAgICAgaWYgKG1ldGFkYXRhLk1ldGFkYXRhICYmIG1ldGFkYXRhLiRtZXRhZGF0YS5odHRwU3RhdHVzQ29kZSAhPT0gdW5kZWZpbmVkICYmIG1ldGFkYXRhLiRtZXRhZGF0YS5odHRwU3RhdHVzQ29kZSA9PT0gMjAwKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgUmVwb3J0ICR7bWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnROYW1lfS50eHQgZm91bmQhYCk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRhdGE6IG1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0TmFtZVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgcmV0cmlldmluZyByZXBvcnQgJHttaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydE5hbWV9IG1ldGFkYXRhYDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX1gKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBTdG9yYWdlRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvcixcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgJHtmaWVsZE5hbWV9IHF1ZXJ5ICR7ZXJyfWA7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgaWYgKGVyciAmJiBlcnIubmFtZSAmJiBlcnIubmFtZSA9PT0gJ05vdEZvdW5kJykge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBSZXBvcnQgJHttaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydE5hbWV9LnR4dCBub3QgZm91bmRgLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogU3RvcmFnZUVycm9yVHlwZS5Ob25lT3JBYnNlbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICBlcnJvclR5cGU6IFN0b3JhZ2VFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH07XG4gICAgfVxufVxuIl19