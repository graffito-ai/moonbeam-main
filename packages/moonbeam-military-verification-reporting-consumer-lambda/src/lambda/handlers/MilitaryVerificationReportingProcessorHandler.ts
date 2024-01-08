import {SQSBatchResponse, SQSEvent} from "aws-lambda";
import {SQSBatchItemFailure} from "aws-lambda/trigger/sqs";
import {
    MilitaryVerificationReportingInformation,
    MilitaryVerificationReportingInformationResponse,
    MilitaryVerificationReportResponse,
    MoonbeamClient
} from "@moonbeam/moonbeam-models";

/**
 * MilitaryVerificationReportingProcessorHandler handler
 *
 * @param event the {@link SQSEvent} to be processed, containing the military verification reporting
 * message information
 * @returns {@link Promise} of {@link SQSBatchResponse}
 */
export const processMilitaryVerificationReport = async (event: SQSEvent): Promise<SQSBatchResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        /**
         * initializing the batch response, as an empty array, that will be populated with errors, if any throughout the processing
         *
         * for the Lambda to indicate SQS that there have been no failures, and thus enable the deletion of all processed messages
         * from the queue, we have to return an empty batchItemFailures array. If we want to indicate that there have been errors,
         * for each individual message, based on its ID, we have to add it in the final batch response
         *
         * @link https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html
         */
        const itemFailures: SQSBatchItemFailure[] = [];

        // for each record in the incoming event, repeat the military verification reporting update steps
        for (const militaryVerificationReportingRecord of event.Records) {
            // first, convert the incoming event message body, into a MilitaryVerificationReportingInformation array object
            const militaryVerificationReportingRecords: [MilitaryVerificationReportingInformation] = JSON.parse(militaryVerificationReportingRecord.body) as [MilitaryVerificationReportingInformation];

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
            const moonbeamClient = new MoonbeamClient(process.env.ENV_NAME!, region);

            /**
             * 1) For each newly registered user in the militaryVerificationReportingRecords object above, get their contact information
             * (phone number + email), through Cognito, by calling the retrieveContactInformationForUser Cognito implemented internal call.
             */
            for (const contactInformationInputRecord of militaryVerificationReportingRecords) {
                const updatedMilitaryVerificationInformation: MilitaryVerificationReportingInformationResponse = await moonbeamClient.retrieveContactInformationForUser(contactInformationInputRecord);

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
                    const offset = dateNow.getTimezoneOffset()
                    dateNow = new Date(dateNow.getTime() - (offset*60*1000));

                    const reportNumberDate = dateNow;
                    reportNumberDate.setMinutes(0);
                    reportNumberDate.setSeconds(0)
                    reportNumberDate.setMilliseconds(0);

                    /**
                     * 2) For each newly registered user, call the putMilitaryVerificationReport AppSync API, in order to update and/or create an
                     * existing/a new report,containing the user's information.
                     */
                    const militaryVerificationReportResponse: MilitaryVerificationReportResponse = await moonbeamClient.putMilitaryVerificationReport({
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
                    } else {
                        console.log(`Military verification report update/creation through PUT military verification report for user ${contactInformationInputRecord.id} call failed`);

                        // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                        itemFailures.push({
                            itemIdentifier: militaryVerificationReportingRecord.messageId
                        });
                    }
                } else {
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
        }
    } catch (error) {
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
        }
    }
}
