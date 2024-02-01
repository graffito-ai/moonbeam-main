import {
    AppReviewErrorType,
    AppReviewResponse,
    CreateAppReviewInput,
    GetAppReviewEligibilityInput,
    GetAppReviewEligibilityResponse
} from "@moonbeam/moonbeam-models";
import {createAppReview} from "./resolvers/CreateAppReviewResolver";
import {getAppReviewEligibility} from "./resolvers/GetAppReviewEligibilityResolver";

/**
 * Mapping out the App Sync event type, so we can use it as a type in the Lambda Handler
 */
type AppSyncEvent = {
    info: {
        fieldName: string
    },
    arguments: {
        getAppReviewEligibilityInput: GetAppReviewEligibilityInput,
        createAppReviewInput: CreateAppReviewInput
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
 * @param event AppSync even to be passed in the handler
 * @returns a {@link Promise} containing a {@link GetAppReviewEligibilityResponse} or {@link AppReviewResponse}
 */
exports.handler = async (event: AppSyncEvent): Promise<AppReviewResponse | GetAppReviewEligibilityResponse> => {
    console.log(`Received new App Review event for operation [${event.info.fieldName}], with arguments ${JSON.stringify(event.arguments)}`);
    switch (event.info.fieldName) {
        case "getAppReviewEligibility":
            return await getAppReviewEligibility(event.info.fieldName, event.arguments.getAppReviewEligibilityInput);
        case "createAppReview":
            return await createAppReview(event.info.fieldName, event.arguments.createAppReviewInput);
        default:
            const errorMessage = `Unexpected field name: ${event.info.fieldName}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: AppReviewErrorType.UnexpectedError
            };
    }
}

