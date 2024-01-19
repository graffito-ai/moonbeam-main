import {
    FilesForUserResponse,
    GetFilesForUserInput,
    GetStorageInput,
    MilitaryVerificationReportResponse,
    PutMilitaryVerificationReportInput,
    StorageErrorType,
    StorageResponse
} from "@moonbeam/moonbeam-models";
import {getStorage} from "./resolvers/GetStorageResolver";
import {putMilitaryVerificationReport} from "./resolvers/PutMilitaryVerificationReportResolver";
import {getFilesForUser} from "./resolvers/GetFilesForUserResolver";

/**
 * Mapping out the App Sync event type, so we can use it as a type in the Lambda Handler
 */
type AppSyncEvent = {
    info: {
        fieldName: string
    },
    arguments: {
        getStorageInput: GetStorageInput,
        getFilesForUserInput: GetFilesForUserInput,
        putMilitaryVerificationReportInput: PutMilitaryVerificationReportInput
    },
    identity: {
        sub: string;
        username: string;
    }
}

/**
 * Lambda Function handler, handling incoming events,
 * depending on the AppSync field name.
 *
 * @param event AppSync event to be passed in the handler
 * @returns a {@link Promise} containing a {@link StorageResponse}, {@link MilitaryVerificationReportResponse} or {@link FilesForUserResponse}
 */
exports.handler = async (event: AppSyncEvent): Promise<StorageResponse | MilitaryVerificationReportResponse | FilesForUserResponse> => {
    console.log(`Received new storage event for operation [${event.info.fieldName}], with arguments ${JSON.stringify(event.arguments)}`);
    switch (event.info.fieldName) {
        case "getFilesForUser":
            return await getFilesForUser(event.info.fieldName, event.arguments.getFilesForUserInput);
        case "getStorage":
            return await getStorage(event.info.fieldName, event.arguments.getStorageInput);
        case "putMilitaryVerificationReport":
            return await putMilitaryVerificationReport(event.info.fieldName, event.arguments.putMilitaryVerificationReportInput);
        default:
            const errorMessage = `Unexpected field name: ${event.info.fieldName}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: StorageErrorType.UnexpectedError
            };
    }
}

