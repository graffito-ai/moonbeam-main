"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processMilitaryVerificationReport = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * MilitaryVerificationReportingProcessorHandler handler
 *
 * @param event the {@link SQSEvent} to be processed, containing the military verification reporting
 * message information
 * @returns {@link Promise} of {@link SQSBatchResponse}
 */
const processMilitaryVerificationReport = async (event) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        /**
         * initializing the batch response, as an empty array, that will be populated with errors, if any throughout the processing
         *
         * for the Lambda to indicate SQS that there have been no failures, and thus enable the deletion of all processed messages
         * from the queue, we have to return an empty batchItemFailures array. If we want to indicate that there have been errors,
         * for each individual message, based on its ID, we have to add it in the final batch response
         *
         * @link https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html
         */
        const itemFailures = [];
        // for each record in the incoming event, repeat the military verification reporting update steps
        for (const militaryVerificationReportingRecord of event.Records) {
            // first, convert the incoming event message body, into a MilitaryVerificationReportingInformation array object
            const militaryVerificationReportingRecords = JSON.parse(militaryVerificationReportingRecord.body);
            /**
             * The overall military verification notification reporting update event processing, will be made up of the following steps:
             *
             * 1) For each newly registered user in the militaryVerificationReportingRecords object above, get their contact information
             * (phone number + email), through Cognito, by calling the retrieveContactInformationForUser Cognito implemented internal call.
             *
             * 2) For each newly registered user, call the putMilitaryVerificationReport AppSync API, in order to update and/or create an existing/a new report,
             * containing the user's information.
             *
             * 3) ToDo: In the future, we might want to send an email with the generated/updated report
             *
             * first initialize the Moonbeam Client API here, in order to call the appropriate endpoints for this handler
             */
            const moonbeamClient = new moonbeam_models_1.MoonbeamClient(process.env.ENV_NAME, region);
            /**
             * 1) For each newly registered user in the militaryVerificationReportingRecords object above, get their contact information
             * (phone number + email), through Cognito, by calling the retrieveContactInformationForUser Cognito implemented internal call.
             */
            for (const contactInformationInputRecord of militaryVerificationReportingRecords) {
                const updatedMilitaryVerificationInformation = await moonbeamClient.retrieveContactInformationForUser(contactInformationInputRecord);
                // check to see if the get military verification information call was successful or not.
                if (updatedMilitaryVerificationInformation !== null && updatedMilitaryVerificationInformation !== undefined && !updatedMilitaryVerificationInformation.errorMessage &&
                    !updatedMilitaryVerificationInformation.errorType && updatedMilitaryVerificationInformation.data !== null && updatedMilitaryVerificationInformation.data !== undefined &&
                    updatedMilitaryVerificationInformation.data.length === 1 && updatedMilitaryVerificationInformation.data[0] !== undefined && updatedMilitaryVerificationInformation.data[0] !== null &&
                    updatedMilitaryVerificationInformation.data[0].phoneNumber !== undefined && updatedMilitaryVerificationInformation.data[0].phoneNumber !== null &&
                    updatedMilitaryVerificationInformation.data[0].emailAddress !== undefined && updatedMilitaryVerificationInformation.data[0].emailAddress !== null &&
                    contactInformationInputRecord.phoneNumber !== undefined && contactInformationInputRecord.phoneNumber !== null &&
                    contactInformationInputRecord.emailAddress !== undefined && contactInformationInputRecord.emailAddress !== null &&
                    contactInformationInputRecord.phoneNumber === updatedMilitaryVerificationInformation.data[0].phoneNumber &&
                    contactInformationInputRecord.emailAddress === updatedMilitaryVerificationInformation.data[0].emailAddress) {
                    console.log(`Contact information successfully updated/retrieved for user ${contactInformationInputRecord.id}!`);
                    // get the date to be passed in below, in the AWSDate format, and account for the timezone here.
                    let dateNow = new Date();
                    const offset = dateNow.getTimezoneOffset();
                    dateNow = new Date(dateNow.getTime() - (offset * 60 * 1000));
                    const reportNumberDate = dateNow;
                    reportNumberDate.setMinutes(0);
                    reportNumberDate.setSeconds(0);
                    reportNumberDate.setMilliseconds(0);
                    /**
                     * 2) For each newly registered user, call the putMilitaryVerificationReport AppSync API, in order to update and/or create an
                     * existing/a new report,containing the user's information.
                     */
                    const militaryVerificationReportResponse = await moonbeamClient.putMilitaryVerificationReport({
                        addressLine: contactInformationInputRecord.addressLine,
                        city: contactInformationInputRecord.city,
                        createdAt: contactInformationInputRecord.createdAt,
                        date: `${dateNow.toISOString().split('T')[0]}`,
                        dateOfBirth: contactInformationInputRecord.dateOfBirth,
                        emailAddress: contactInformationInputRecord.emailAddress,
                        enlistmentYear: contactInformationInputRecord.enlistmentYear,
                        firstName: contactInformationInputRecord.firstName,
                        id: contactInformationInputRecord.id,
                        lastName: contactInformationInputRecord.lastName,
                        militaryAffiliation: contactInformationInputRecord.militaryAffiliation,
                        militaryBranch: contactInformationInputRecord.militaryBranch,
                        militaryDutyStatus: contactInformationInputRecord.militaryDutyStatus,
                        militaryVerificationStatus: contactInformationInputRecord.militaryVerificationStatus,
                        phoneNumber: contactInformationInputRecord.phoneNumber,
                        reportNumber: reportNumberDate.getTime(),
                        state: contactInformationInputRecord.state,
                        updatedAt: contactInformationInputRecord.updatedAt,
                        zipCode: contactInformationInputRecord.zipCode
                    });
                    // check to see if the report call was successfully made.
                    if (militaryVerificationReportResponse && !militaryVerificationReportResponse.errorMessage && !militaryVerificationReportResponse.errorType &&
                        militaryVerificationReportResponse.data !== undefined && militaryVerificationReportResponse.data !== null) {
                        console.log(`${militaryVerificationReportResponse.data} for newly registered user ${contactInformationInputRecord.id}`);
                    }
                    else {
                        console.log(`Military verification report update/creation through PUT military verification report for user ${contactInformationInputRecord.id} call failed`);
                        // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                        itemFailures.push({
                            itemIdentifier: militaryVerificationReportingRecord.messageId
                        });
                    }
                }
                else {
                    console.log(`Contact information mapping through Cognito retrieve contact information for user ${contactInformationInputRecord.id} call failed`);
                    // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                    itemFailures.push({
                        itemIdentifier: militaryVerificationReportingRecord.messageId
                    });
                }
            }
        }
        /**
         * for the Lambda to indicate SQS that there have been no failures, and thus enable the deletion of all processed messages
         * from the queue, we have to return an empty batchItemFailures array here.
         *
         * @link https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html
         */
        return {
            batchItemFailures: itemFailures
        };
    }
    catch (error) {
        console.log(`Unexpected error while processing ${JSON.stringify(event)} military verification reporting event ${error}`);
        /**
         * returns a batch response failure for the particular message IDs which failed
         * in this case, the Lambda function DOES NOT delete the incoming messages from the queue, and it makes it available/visible again
         *
         * @link https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html
         */
        return {
            batchItemFailures: [{
                    // for this case, we only process 1 record at a time, we might need to change this in the future
                    itemIdentifier: event.Records[0].messageId
                }]
        };
    }
};
exports.processMilitaryVerificationReport = processMilitaryVerificationReport;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRpbmdQcm9jZXNzb3JIYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9oYW5kbGVycy9NaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydGluZ1Byb2Nlc3NvckhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEsK0RBS21DO0FBRW5DOzs7Ozs7R0FNRztBQUNJLE1BQU0saUNBQWlDLEdBQUcsS0FBSyxFQUFFLEtBQWUsRUFBNkIsRUFBRTtJQUNsRyxJQUFJO1FBQ0EseUNBQXlDO1FBQ3pDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVyxDQUFDO1FBRXZDOzs7Ozs7OztXQVFHO1FBQ0gsTUFBTSxZQUFZLEdBQTBCLEVBQUUsQ0FBQztRQUUvQyxpR0FBaUc7UUFDakcsS0FBSyxNQUFNLG1DQUFtQyxJQUFJLEtBQUssQ0FBQyxPQUFPLEVBQUU7WUFDN0QsK0dBQStHO1lBQy9HLE1BQU0sb0NBQW9DLEdBQStDLElBQUksQ0FBQyxLQUFLLENBQUMsbUNBQW1DLENBQUMsSUFBSSxDQUErQyxDQUFDO1lBRTVMOzs7Ozs7Ozs7Ozs7ZUFZRztZQUNILE1BQU0sY0FBYyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUV6RTs7O2VBR0c7WUFDSCxLQUFLLE1BQU0sNkJBQTZCLElBQUksb0NBQW9DLEVBQUU7Z0JBQzlFLE1BQU0sc0NBQXNDLEdBQXFELE1BQU0sY0FBYyxDQUFDLGlDQUFpQyxDQUFDLDZCQUE2QixDQUFDLENBQUM7Z0JBRXZMLHdGQUF3RjtnQkFDeEYsSUFBSSxzQ0FBc0MsS0FBSyxJQUFJLElBQUksc0NBQXNDLEtBQUssU0FBUyxJQUFJLENBQUMsc0NBQXNDLENBQUMsWUFBWTtvQkFDL0osQ0FBQyxzQ0FBc0MsQ0FBQyxTQUFTLElBQUks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LEtBQUssRUFBRSxDQUFDLENBQUM7UUFFekg7Ozs7O1dBS0c7UUFDSCxPQUFPO1lBQ0gsaUJBQWlCLEVBQUUsQ0FBQztvQkFDaEIsZ0dBQWdHO29CQUNoRyxjQUFjLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTO2lCQUM3QyxDQUFDO1NBQ0wsQ0FBQTtLQUNKO0FBQ0wsQ0FBQyxDQUFBO0FBM0lZLFFBQUEsaUNBQWlDLHFDQTJJN0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1NRU0JhdGNoUmVzcG9uc2UsIFNRU0V2ZW50fSBmcm9tIFwiYXdzLWxhbWJkYVwiO1xuaW1wb3J0IHtTUVNCYXRjaEl0ZW1GYWlsdXJlfSBmcm9tIFwiYXdzLWxhbWJkYS90cmlnZ2VyL3Nxc1wiO1xuaW1wb3J0IHtcbiAgICBNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydGluZ0luZm9ybWF0aW9uLFxuICAgIE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0aW5nSW5mb3JtYXRpb25SZXNwb25zZSxcbiAgICBNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydFJlc3BvbnNlLFxuICAgIE1vb25iZWFtQ2xpZW50XG59IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5cbi8qKlxuICogTWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRpbmdQcm9jZXNzb3JIYW5kbGVyIGhhbmRsZXJcbiAqXG4gKiBAcGFyYW0gZXZlbnQgdGhlIHtAbGluayBTUVNFdmVudH0gdG8gYmUgcHJvY2Vzc2VkLCBjb250YWluaW5nIHRoZSBtaWxpdGFyeSB2ZXJpZmljYXRpb24gcmVwb3J0aW5nXG4gKiBtZXNzYWdlIGluZm9ybWF0aW9uXG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIFNRU0JhdGNoUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBwcm9jZXNzTWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnQgPSBhc3luYyAoZXZlbnQ6IFNRU0V2ZW50KTogUHJvbWlzZTxTUVNCYXRjaFJlc3BvbnNlPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIGluaXRpYWxpemluZyB0aGUgYmF0Y2ggcmVzcG9uc2UsIGFzIGFuIGVtcHR5IGFycmF5LCB0aGF0IHdpbGwgYmUgcG9wdWxhdGVkIHdpdGggZXJyb3JzLCBpZiBhbnkgdGhyb3VnaG91dCB0aGUgcHJvY2Vzc2luZ1xuICAgICAgICAgKlxuICAgICAgICAgKiBmb3IgdGhlIExhbWJkYSB0byBpbmRpY2F0ZSBTUVMgdGhhdCB0aGVyZSBoYXZlIGJlZW4gbm8gZmFpbHVyZXMsIGFuZCB0aHVzIGVuYWJsZSB0aGUgZGVsZXRpb24gb2YgYWxsIHByb2Nlc3NlZCBtZXNzYWdlc1xuICAgICAgICAgKiBmcm9tIHRoZSBxdWV1ZSwgd2UgaGF2ZSB0byByZXR1cm4gYW4gZW1wdHkgYmF0Y2hJdGVtRmFpbHVyZXMgYXJyYXkuIElmIHdlIHdhbnQgdG8gaW5kaWNhdGUgdGhhdCB0aGVyZSBoYXZlIGJlZW4gZXJyb3JzLFxuICAgICAgICAgKiBmb3IgZWFjaCBpbmRpdmlkdWFsIG1lc3NhZ2UsIGJhc2VkIG9uIGl0cyBJRCwgd2UgaGF2ZSB0byBhZGQgaXQgaW4gdGhlIGZpbmFsIGJhdGNoIHJlc3BvbnNlXG4gICAgICAgICAqXG4gICAgICAgICAqIEBsaW5rIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9sYW1iZGEvbGF0ZXN0L2RnL3dpdGgtc3FzLmh0bWxcbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IGl0ZW1GYWlsdXJlczogU1FTQmF0Y2hJdGVtRmFpbHVyZVtdID0gW107XG5cbiAgICAgICAgLy8gZm9yIGVhY2ggcmVjb3JkIGluIHRoZSBpbmNvbWluZyBldmVudCwgcmVwZWF0IHRoZSBtaWxpdGFyeSB2ZXJpZmljYXRpb24gcmVwb3J0aW5nIHVwZGF0ZSBzdGVwc1xuICAgICAgICBmb3IgKGNvbnN0IG1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0aW5nUmVjb3JkIG9mIGV2ZW50LlJlY29yZHMpIHtcbiAgICAgICAgICAgIC8vIGZpcnN0LCBjb252ZXJ0IHRoZSBpbmNvbWluZyBldmVudCBtZXNzYWdlIGJvZHksIGludG8gYSBNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydGluZ0luZm9ybWF0aW9uIGFycmF5IG9iamVjdFxuICAgICAgICAgICAgY29uc3QgbWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRpbmdSZWNvcmRzOiBbTWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRpbmdJbmZvcm1hdGlvbl0gPSBKU09OLnBhcnNlKG1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0aW5nUmVjb3JkLmJvZHkpIGFzIFtNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydGluZ0luZm9ybWF0aW9uXTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUaGUgb3ZlcmFsbCBtaWxpdGFyeSB2ZXJpZmljYXRpb24gbm90aWZpY2F0aW9uIHJlcG9ydGluZyB1cGRhdGUgZXZlbnQgcHJvY2Vzc2luZywgd2lsbCBiZSBtYWRlIHVwIG9mIHRoZSBmb2xsb3dpbmcgc3RlcHM6XG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogMSkgRm9yIGVhY2ggbmV3bHkgcmVnaXN0ZXJlZCB1c2VyIGluIHRoZSBtaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydGluZ1JlY29yZHMgb2JqZWN0IGFib3ZlLCBnZXQgdGhlaXIgY29udGFjdCBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICogKHBob25lIG51bWJlciArIGVtYWlsKSwgdGhyb3VnaCBDb2duaXRvLCBieSBjYWxsaW5nIHRoZSByZXRyaWV2ZUNvbnRhY3RJbmZvcm1hdGlvbkZvclVzZXIgQ29nbml0byBpbXBsZW1lbnRlZCBpbnRlcm5hbCBjYWxsLlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIDIpIEZvciBlYWNoIG5ld2x5IHJlZ2lzdGVyZWQgdXNlciwgY2FsbCB0aGUgcHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnQgQXBwU3luYyBBUEksIGluIG9yZGVyIHRvIHVwZGF0ZSBhbmQvb3IgY3JlYXRlIGFuIGV4aXN0aW5nL2EgbmV3IHJlcG9ydCxcbiAgICAgICAgICAgICAqIGNvbnRhaW5pbmcgdGhlIHVzZXIncyBpbmZvcm1hdGlvbi5cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiAzKSBUb0RvOiBJbiB0aGUgZnV0dXJlLCB3ZSBtaWdodCB3YW50IHRvIHNlbmQgYW4gZW1haWwgd2l0aCB0aGUgZ2VuZXJhdGVkL3VwZGF0ZWQgcmVwb3J0XG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogZmlyc3QgaW5pdGlhbGl6ZSB0aGUgTW9vbmJlYW0gQ2xpZW50IEFQSSBoZXJlLCBpbiBvcmRlciB0byBjYWxsIHRoZSBhcHByb3ByaWF0ZSBlbmRwb2ludHMgZm9yIHRoaXMgaGFuZGxlclxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBjb25zdCBtb29uYmVhbUNsaWVudCA9IG5ldyBNb29uYmVhbUNsaWVudChwcm9jZXNzLmVudi5FTlZfTkFNRSEsIHJlZ2lvbik7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogMSkgRm9yIGVhY2ggbmV3bHkgcmVnaXN0ZXJlZCB1c2VyIGluIHRoZSBtaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydGluZ1JlY29yZHMgb2JqZWN0IGFib3ZlLCBnZXQgdGhlaXIgY29udGFjdCBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICogKHBob25lIG51bWJlciArIGVtYWlsKSwgdGhyb3VnaCBDb2duaXRvLCBieSBjYWxsaW5nIHRoZSByZXRyaWV2ZUNvbnRhY3RJbmZvcm1hdGlvbkZvclVzZXIgQ29nbml0byBpbXBsZW1lbnRlZCBpbnRlcm5hbCBjYWxsLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGNvbnRhY3RJbmZvcm1hdGlvbklucHV0UmVjb3JkIG9mIG1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0aW5nUmVjb3Jkcykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHVwZGF0ZWRNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uOiBNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydGluZ0luZm9ybWF0aW9uUmVzcG9uc2UgPSBhd2FpdCBtb29uYmVhbUNsaWVudC5yZXRyaWV2ZUNvbnRhY3RJbmZvcm1hdGlvbkZvclVzZXIoY29udGFjdEluZm9ybWF0aW9uSW5wdXRSZWNvcmQpO1xuXG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSBnZXQgbWlsaXRhcnkgdmVyaWZpY2F0aW9uIGluZm9ybWF0aW9uIGNhbGwgd2FzIHN1Y2Nlc3NmdWwgb3Igbm90LlxuICAgICAgICAgICAgICAgIGlmICh1cGRhdGVkTWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbiAhPT0gbnVsbCAmJiB1cGRhdGVkTWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbiAhPT0gdW5kZWZpbmVkICYmICF1cGRhdGVkTWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbi5lcnJvck1lc3NhZ2UgJiZcbiAgICAgICAgICAgICAgICAgICAgIXVwZGF0ZWRNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLmVycm9yVHlwZSAmJiB1cGRhdGVkTWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbi5kYXRhICE9PSBudWxsICYmIHVwZGF0ZWRNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLmRhdGEgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVkTWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbi5kYXRhLmxlbmd0aCA9PT0gMSAmJiB1cGRhdGVkTWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbi5kYXRhWzBdICE9PSB1bmRlZmluZWQgJiYgdXBkYXRlZE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb24uZGF0YVswXSAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVkTWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbi5kYXRhWzBdLnBob25lTnVtYmVyICE9PSB1bmRlZmluZWQgJiYgdXBkYXRlZE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb24uZGF0YVswXS5waG9uZU51bWJlciAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVkTWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbi5kYXRhWzBdLmVtYWlsQWRkcmVzcyAhPT0gdW5kZWZpbmVkICYmIHVwZGF0ZWRNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLmRhdGFbMF0uZW1haWxBZGRyZXNzICE9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgICAgIGNvbnRhY3RJbmZvcm1hdGlvbklucHV0UmVjb3JkLnBob25lTnVtYmVyICE9PSB1bmRlZmluZWQgJiYgY29udGFjdEluZm9ybWF0aW9uSW5wdXRSZWNvcmQucGhvbmVOdW1iZXIgIT09IG51bGwgJiZcbiAgICAgICAgICAgICAgICAgICAgY29udGFjdEluZm9ybWF0aW9uSW5wdXRSZWNvcmQuZW1haWxBZGRyZXNzICE9PSB1bmRlZmluZWQgJiYgY29udGFjdEluZm9ybWF0aW9uSW5wdXRSZWNvcmQuZW1haWxBZGRyZXNzICE9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgICAgIGNvbnRhY3RJbmZvcm1hdGlvbklucHV0UmVjb3JkLnBob25lTnVtYmVyID09PSB1cGRhdGVkTWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbi5kYXRhWzBdLnBob25lTnVtYmVyICYmXG4gICAgICAgICAgICAgICAgICAgIGNvbnRhY3RJbmZvcm1hdGlvbklucHV0UmVjb3JkLmVtYWlsQWRkcmVzcyA9PT0gdXBkYXRlZE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb24uZGF0YVswXS5lbWFpbEFkZHJlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYENvbnRhY3QgaW5mb3JtYXRpb24gc3VjY2Vzc2Z1bGx5IHVwZGF0ZWQvcmV0cmlldmVkIGZvciB1c2VyICR7Y29udGFjdEluZm9ybWF0aW9uSW5wdXRSZWNvcmQuaWR9IWApO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGdldCB0aGUgZGF0ZSB0byBiZSBwYXNzZWQgaW4gYmVsb3csIGluIHRoZSBBV1NEYXRlIGZvcm1hdCwgYW5kIGFjY291bnQgZm9yIHRoZSB0aW1lem9uZSBoZXJlLlxuICAgICAgICAgICAgICAgICAgICBsZXQgZGF0ZU5vdyA9IG5ldyBEYXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG9mZnNldCA9IGRhdGVOb3cuZ2V0VGltZXpvbmVPZmZzZXQoKVxuICAgICAgICAgICAgICAgICAgICBkYXRlTm93ID0gbmV3IERhdGUoZGF0ZU5vdy5nZXRUaW1lKCkgLSAob2Zmc2V0KjYwKjEwMDApKTtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXBvcnROdW1iZXJEYXRlID0gZGF0ZU5vdztcbiAgICAgICAgICAgICAgICAgICAgcmVwb3J0TnVtYmVyRGF0ZS5zZXRNaW51dGVzKDApO1xuICAgICAgICAgICAgICAgICAgICByZXBvcnROdW1iZXJEYXRlLnNldFNlY29uZHMoMClcbiAgICAgICAgICAgICAgICAgICAgcmVwb3J0TnVtYmVyRGF0ZS5zZXRNaWxsaXNlY29uZHMoMCk7XG5cbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIDIpIEZvciBlYWNoIG5ld2x5IHJlZ2lzdGVyZWQgdXNlciwgY2FsbCB0aGUgcHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnQgQXBwU3luYyBBUEksIGluIG9yZGVyIHRvIHVwZGF0ZSBhbmQvb3IgY3JlYXRlIGFuXG4gICAgICAgICAgICAgICAgICAgICAqIGV4aXN0aW5nL2EgbmV3IHJlcG9ydCxjb250YWluaW5nIHRoZSB1c2VyJ3MgaW5mb3JtYXRpb24uXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBtaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydFJlc3BvbnNlOiBNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydFJlc3BvbnNlID0gYXdhaXQgbW9vbmJlYW1DbGllbnQucHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgYWRkcmVzc0xpbmU6IGNvbnRhY3RJbmZvcm1hdGlvbklucHV0UmVjb3JkLmFkZHJlc3NMaW5lLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2l0eTogY29udGFjdEluZm9ybWF0aW9uSW5wdXRSZWNvcmQuY2l0eSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDogY29udGFjdEluZm9ybWF0aW9uSW5wdXRSZWNvcmQuY3JlYXRlZEF0LFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0ZTogYCR7ZGF0ZU5vdy50b0lTT1N0cmluZygpLnNwbGl0KCdUJylbMF19YCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGVPZkJpcnRoOiBjb250YWN0SW5mb3JtYXRpb25JbnB1dFJlY29yZC5kYXRlT2ZCaXJ0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVtYWlsQWRkcmVzczogY29udGFjdEluZm9ybWF0aW9uSW5wdXRSZWNvcmQuZW1haWxBZGRyZXNzLFxuICAgICAgICAgICAgICAgICAgICAgICAgZW5saXN0bWVudFllYXI6IGNvbnRhY3RJbmZvcm1hdGlvbklucHV0UmVjb3JkLmVubGlzdG1lbnRZZWFyLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3ROYW1lOiBjb250YWN0SW5mb3JtYXRpb25JbnB1dFJlY29yZC5maXJzdE5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogY29udGFjdEluZm9ybWF0aW9uSW5wdXRSZWNvcmQuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0TmFtZTogY29udGFjdEluZm9ybWF0aW9uSW5wdXRSZWNvcmQubGFzdE5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBtaWxpdGFyeUFmZmlsaWF0aW9uOiBjb250YWN0SW5mb3JtYXRpb25JbnB1dFJlY29yZC5taWxpdGFyeUFmZmlsaWF0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWlsaXRhcnlCcmFuY2g6IGNvbnRhY3RJbmZvcm1hdGlvbklucHV0UmVjb3JkLm1pbGl0YXJ5QnJhbmNoLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWlsaXRhcnlEdXR5U3RhdHVzOiBjb250YWN0SW5mb3JtYXRpb25JbnB1dFJlY29yZC5taWxpdGFyeUR1dHlTdGF0dXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBtaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1czogY29udGFjdEluZm9ybWF0aW9uSW5wdXRSZWNvcmQubWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBwaG9uZU51bWJlcjogY29udGFjdEluZm9ybWF0aW9uSW5wdXRSZWNvcmQucGhvbmVOdW1iZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXBvcnROdW1iZXI6IHJlcG9ydE51bWJlckRhdGUuZ2V0VGltZSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGU6IGNvbnRhY3RJbmZvcm1hdGlvbklucHV0UmVjb3JkLnN0YXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEF0OiBjb250YWN0SW5mb3JtYXRpb25JbnB1dFJlY29yZC51cGRhdGVkQXQsXG4gICAgICAgICAgICAgICAgICAgICAgICB6aXBDb2RlOiBjb250YWN0SW5mb3JtYXRpb25JbnB1dFJlY29yZC56aXBDb2RlXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgcmVwb3J0IGNhbGwgd2FzIHN1Y2Nlc3NmdWxseSBtYWRlLlxuICAgICAgICAgICAgICAgICAgICBpZiAobWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRSZXNwb25zZSAmJiAhbWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRSZXNwb25zZS5lcnJvck1lc3NhZ2UgJiYgIW1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0UmVzcG9uc2UuZXJyb3JUeXBlICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBtaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydFJlc3BvbnNlLmRhdGEgIT09IHVuZGVmaW5lZCAmJiBtaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydFJlc3BvbnNlLmRhdGEgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke21pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0UmVzcG9uc2UuZGF0YX0gZm9yIG5ld2x5IHJlZ2lzdGVyZWQgdXNlciAke2NvbnRhY3RJbmZvcm1hdGlvbklucHV0UmVjb3JkLmlkfWApO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYE1pbGl0YXJ5IHZlcmlmaWNhdGlvbiByZXBvcnQgdXBkYXRlL2NyZWF0aW9uIHRocm91Z2ggUFVUIG1pbGl0YXJ5IHZlcmlmaWNhdGlvbiByZXBvcnQgZm9yIHVzZXIgJHtjb250YWN0SW5mb3JtYXRpb25JbnB1dFJlY29yZC5pZH0gY2FsbCBmYWlsZWRgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWRkcyBhbiBpdGVtIGZhaWx1cmUsIGZvciB0aGUgU1FTIG1lc3NhZ2Ugd2hpY2ggZmFpbGVkIHByb2Nlc3NpbmcsIGFzIHBhcnQgb2YgdGhlIGluY29taW5nIGV2ZW50XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtRmFpbHVyZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbUlkZW50aWZpZXI6IG1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0aW5nUmVjb3JkLm1lc3NhZ2VJZFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgQ29udGFjdCBpbmZvcm1hdGlvbiBtYXBwaW5nIHRocm91Z2ggQ29nbml0byByZXRyaWV2ZSBjb250YWN0IGluZm9ybWF0aW9uIGZvciB1c2VyICR7Y29udGFjdEluZm9ybWF0aW9uSW5wdXRSZWNvcmQuaWR9IGNhbGwgZmFpbGVkYCk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYWRkcyBhbiBpdGVtIGZhaWx1cmUsIGZvciB0aGUgU1FTIG1lc3NhZ2Ugd2hpY2ggZmFpbGVkIHByb2Nlc3NpbmcsIGFzIHBhcnQgb2YgdGhlIGluY29taW5nIGV2ZW50XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1GYWlsdXJlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1JZGVudGlmaWVyOiBtaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydGluZ1JlY29yZC5tZXNzYWdlSWRcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIGZvciB0aGUgTGFtYmRhIHRvIGluZGljYXRlIFNRUyB0aGF0IHRoZXJlIGhhdmUgYmVlbiBubyBmYWlsdXJlcywgYW5kIHRodXMgZW5hYmxlIHRoZSBkZWxldGlvbiBvZiBhbGwgcHJvY2Vzc2VkIG1lc3NhZ2VzXG4gICAgICAgICAqIGZyb20gdGhlIHF1ZXVlLCB3ZSBoYXZlIHRvIHJldHVybiBhbiBlbXB0eSBiYXRjaEl0ZW1GYWlsdXJlcyBhcnJheSBoZXJlLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAbGluayBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vbGFtYmRhL2xhdGVzdC9kZy93aXRoLXNxcy5odG1sXG4gICAgICAgICAqL1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYmF0Y2hJdGVtRmFpbHVyZXM6IGl0ZW1GYWlsdXJlc1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5sb2coYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgcHJvY2Vzc2luZyAke0pTT04uc3RyaW5naWZ5KGV2ZW50KX0gbWlsaXRhcnkgdmVyaWZpY2F0aW9uIHJlcG9ydGluZyBldmVudCAke2Vycm9yfWApO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiByZXR1cm5zIGEgYmF0Y2ggcmVzcG9uc2UgZmFpbHVyZSBmb3IgdGhlIHBhcnRpY3VsYXIgbWVzc2FnZSBJRHMgd2hpY2ggZmFpbGVkXG4gICAgICAgICAqIGluIHRoaXMgY2FzZSwgdGhlIExhbWJkYSBmdW5jdGlvbiBET0VTIE5PVCBkZWxldGUgdGhlIGluY29taW5nIG1lc3NhZ2VzIGZyb20gdGhlIHF1ZXVlLCBhbmQgaXQgbWFrZXMgaXQgYXZhaWxhYmxlL3Zpc2libGUgYWdhaW5cbiAgICAgICAgICpcbiAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2xhbWJkYS9sYXRlc3QvZGcvd2l0aC1zcXMuaHRtbFxuICAgICAgICAgKi9cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGJhdGNoSXRlbUZhaWx1cmVzOiBbe1xuICAgICAgICAgICAgICAgIC8vIGZvciB0aGlzIGNhc2UsIHdlIG9ubHkgcHJvY2VzcyAxIHJlY29yZCBhdCBhIHRpbWUsIHdlIG1pZ2h0IG5lZWQgdG8gY2hhbmdlIHRoaXMgaW4gdGhlIGZ1dHVyZVxuICAgICAgICAgICAgICAgIGl0ZW1JZGVudGlmaWVyOiBldmVudC5SZWNvcmRzWzBdLm1lc3NhZ2VJZFxuICAgICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==