import {
    CreateMilitaryVerificationInput,
    CreateMilitaryVerificationResponse,
    GetMilitaryVerificationInput,
    GetMilitaryVerificationResponse,
    MilitaryVerificationErrorType,
    UpdateMilitaryVerificationInput,
    UpdateMilitaryVerificationResponse
} from "@moonbeam/moonbeam-models";
import {createMilitaryVerification} from "./resolvers/CreateMilitaryVerificationResolver";
import {getMilitaryVerificationStatus} from "./resolvers/GetMilitaryVerificationStatusResolver";
import {updateMilitaryVerificationStatus} from "./resolvers/UpdateMilitaryVerificationStatusResolver";

/**
 * Mapping out the App Sync event type, so we can use it as a type in the Lambda Handler
 */
type AppSyncEvent = {
    info: {
        fieldName: string
    },
    arguments: {
        getMilitaryVerificationInput: GetMilitaryVerificationInput,
        updateMilitaryVerificationInput: UpdateMilitaryVerificationInput
        createMilitaryVerificationInput: CreateMilitaryVerificationInput
    },
    identity: {
        sub : string;
        username : string;
    }
}

/**
 * Lambda Function handler, handling incoming events,
 * depending on the AppSync field name.
 *
 * @param event AppSync event to be passed in the handler
 * @returns a {@link Promise} containing a {@link CreateMilitaryVerificationResponse} or {@link GetMilitaryVerificationResponse} or {@link UpdateMilitaryVerificationResponse}
 */
exports.handler = async (event: AppSyncEvent): Promise<CreateMilitaryVerificationResponse | GetMilitaryVerificationResponse | UpdateMilitaryVerificationResponse> => {
    console.log(`Received new storage event for operation [${event.info.fieldName}], with arguments ${JSON.stringify(event.arguments)}`);
    switch (event.info.fieldName) {
        case "getMilitaryVerificationStatus":
            return await getMilitaryVerificationStatus(event.info.fieldName, event.arguments.getMilitaryVerificationInput);
        case "updateMilitaryVerificationStatus":
            return await updateMilitaryVerificationStatus(event.info.fieldName, event.arguments.updateMilitaryVerificationInput);
        case "createMilitaryVerification":
            return await createMilitaryVerification(event.info.fieldName, event.arguments.createMilitaryVerificationInput);
        default:
            const errorMessage = `Unexpected field name: ${event.info.fieldName}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: MilitaryVerificationErrorType.UnexpectedError
            };
    }
}

