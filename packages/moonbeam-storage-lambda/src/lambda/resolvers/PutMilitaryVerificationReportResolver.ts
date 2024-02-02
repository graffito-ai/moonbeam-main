import {
    Constants,
    MilitaryVerificationReportResponse,
    MilitaryVerificationStatusType,
    PutMilitaryVerificationReportInput,
    StorageErrorType
} from "@moonbeam/moonbeam-models";
import {GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client} from "@aws-sdk/client-s3";

/**
 * PutMilitaryVerificationReport resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param putMilitaryVerificationReportInput input, based on which the appropriate reporting
 * file is retrieved from storage, through S3.
 *
 * @returns {@link Promise} of {@link MilitaryVerificationReportResponse}
 */
export const putMilitaryVerificationReport = async (fieldName: string, putMilitaryVerificationReportInput: PutMilitaryVerificationReportInput): Promise<MilitaryVerificationReportResponse> => {
    // put together the unique name of the report to look up in the S3 bucket
    const incomingDateParts = putMilitaryVerificationReportInput.date.split('-');
    const militaryVerificationReportName = `${incomingDateParts[0]}-${incomingDateParts[1]}-${incomingDateParts[2]}-${putMilitaryVerificationReportInput.reportNumber}`;
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing any AWS SDK resources
        const s3Client = new S3Client({region: region});
        const bucketName = `${Constants.StorageConstants.MOONBEAM_MILITARY_VERIFICATION_REPORTING_BUCKET_NAME}-${process.env.ENV_NAME!}-${region}`;

        // check if the object exists in the bucket, without actually retrieving it first.
        const metadata = await s3Client.send(new HeadObjectCommand(({
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
            const getObjectCommandResponse = await s3Client.send(new GetObjectCommand(({
                Bucket: bucketName,
                Key: objectKey
            })));
            // make sure that the GetObjectCommand was successfully executed
            if (getObjectCommandResponse.$metadata.httpStatusCode !== undefined && getObjectCommandResponse.$metadata.httpStatusCode === 200 && getObjectCommandResponse.Body !== undefined) {
                const oldData = await getObjectCommandResponse.Body.transformToString();

                // execute the PutObjectCommand, to update the file old with the new data
                const newRecord = `${putMilitaryVerificationReportInput.firstName} ${putMilitaryVerificationReportInput.lastName} - ${putMilitaryVerificationReportInput.phoneNumber} | ${putMilitaryVerificationReportInput.emailAddress} | ${putMilitaryVerificationReportInput.militaryVerificationStatus === MilitaryVerificationStatusType.Verified ? 'THANKS FOR SIGNING UP' : putMilitaryVerificationReportInput.militaryVerificationStatus === MilitaryVerificationStatusType.Rejected ? 'REJECTED' : 'PENDING'}`;
                if (!oldData.includes(newRecord)) {
                    const updatedData = `${oldData}\n${newRecord}`;

                    const putObjectCommandFlag = await putObjectCommandExecution(s3Client, bucketName, objectKey, updatedData);
                    if (putObjectCommandFlag) {
                        return {
                            data: `${militaryVerificationReportName}.txt report updated`
                        }
                    } else {
                        const errorMessage = `Unexpected error while retrieving PutObjectCommand metadata`;
                        return {
                            errorMessage: errorMessage,
                            errorType: StorageErrorType.UnexpectedError,
                        }
                    }
                } else {
                    console.log(`Record already existent in the report, not inserting/updating it further!\n${newRecord}`);

                    return {
                        data: `Record already existent in report ${militaryVerificationReportName}`
                    }
                }
            } else {
                const errorMessage = `Unexpected error while retrieving GetObjectCommand metadata`;
                return {
                    errorMessage: errorMessage,
                    errorType: StorageErrorType.UnexpectedError,
                }
            }
        } else {
            /**
             * if the call above does not return an error not found, but it is thrown in the metadata status code instead
             * create a new file , and append the appropriate data as the first record in the report
             */
            if (metadata.$metadata.httpStatusCode !== undefined && metadata.$metadata.httpStatusCode === 404) {
                // execute the PutObjectCommand
                const data = `MOONBEAM MILITARY VERIFICATION REPORT - ${militaryVerificationReportName}\n${putMilitaryVerificationReportInput.firstName} ${putMilitaryVerificationReportInput.lastName} - ${putMilitaryVerificationReportInput.phoneNumber} | ${putMilitaryVerificationReportInput.emailAddress} | ${putMilitaryVerificationReportInput.militaryVerificationStatus === MilitaryVerificationStatusType.Verified ? 'THANKS FOR SIGNING UP' : putMilitaryVerificationReportInput.militaryVerificationStatus === MilitaryVerificationStatusType.Rejected ? 'REJECTED' : 'PENDING'}`;
                const putObjectCommandFlag = await putObjectCommandExecution(s3Client, bucketName, `${militaryVerificationReportName}.txt`, data);
                if (putObjectCommandFlag) {
                    return {
                        data: `${militaryVerificationReportName}.txt report created`
                    }
                } else {
                    const errorMessage = `Unexpected error while retrieving PutObjectCommand metadata`;
                    return {
                        errorMessage: errorMessage,
                        errorType: StorageErrorType.UnexpectedError,
                    }
                }
            } else {
                const errorMessage = `Unexpected error while retrieving report ${militaryVerificationReportName} metadata`;
                console.log(`${errorMessage}`);
                return {
                    errorMessage: errorMessage,
                    errorType: StorageErrorType.UnexpectedError,
                }
            }
        }
    } catch (err) {
        // @ts-ignore
        if (err && err.name && err.name === 'NotFound') {
            console.log(`Report ${militaryVerificationReportName}.txt not found`);

            try {
                // retrieving the current function region
                const region = process.env.AWS_REGION!;

                /**
                 * file was not found, so create a new file, and append the appropriate data
                 * as the first record in the report
                 *
                 * first initializing any AWS SDK resources
                 */
                const s3Client = new S3Client({region: region});
                const bucketName = `${Constants.StorageConstants.MOONBEAM_MILITARY_VERIFICATION_REPORTING_BUCKET_NAME}-${process.env.ENV_NAME!}-${region}`;

                // execute the PutObjectCommand
                const data = `MOONBEAM MILITARY VERIFICATION REPORT - ${militaryVerificationReportName}\n${putMilitaryVerificationReportInput.firstName} ${putMilitaryVerificationReportInput.lastName} - ${putMilitaryVerificationReportInput.phoneNumber} | ${putMilitaryVerificationReportInput.emailAddress} | ${putMilitaryVerificationReportInput.militaryVerificationStatus === MilitaryVerificationStatusType.Verified ? 'THANKS FOR SIGNING UP' : putMilitaryVerificationReportInput.militaryVerificationStatus === MilitaryVerificationStatusType.Rejected ? 'REJECTED' : 'PENDING'}`;
                const putObjectCommandFlag = await putObjectCommandExecution(s3Client, bucketName, `${militaryVerificationReportName}.txt`, data);
                if (putObjectCommandFlag) {
                    return {
                        data: `${militaryVerificationReportName}.txt report created`
                    }
                } else {
                    const errorMessage = `Unexpected error while retrieving PutObjectCommand metadata`;
                    return {
                        errorMessage: errorMessage,
                        errorType: StorageErrorType.UnexpectedError,
                    }
                }
            } catch (error) {
                const errorMessage = `Unexpected error while executing the PutObjectCommand ${error}`;
                console.log(errorMessage);

                return {
                    errorMessage: errorMessage,
                    errorType: StorageErrorType.UnexpectedError
                };
            }
        } else {
            const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
            console.log(errorMessage);

            return {
                errorMessage: errorMessage,
                errorType: StorageErrorType.UnexpectedError
            };
        }
    }
}

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
const putObjectCommandExecution = async (s3Client: S3Client, bucketName: string, objectKey: string, content: string): Promise<boolean> => {
    // execute the PutObjectCommand
    const putObjectCommandResponse = await s3Client.send(new PutObjectCommand(({
        Bucket: bucketName,
        Key: objectKey,
        Body: content
    })));

    // make sure that the PutObjectCommand was successfully executed
    if (putObjectCommandResponse.$metadata.httpStatusCode !== undefined && putObjectCommandResponse.$metadata.httpStatusCode === 200) {
        console.log(`New ${objectKey} report created with an initial record!`);
        return true;
    } else {
        const errorMessage = `Unexpected error while retrieving PutObjectCommand metadata`;
        console.log(`${errorMessage}`);
        return false;
    }
}
