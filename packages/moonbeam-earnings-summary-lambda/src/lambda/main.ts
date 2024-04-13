import {
    CreateDailyEarningsSummaryInput,
    DailyEarningsSummaryResponse,
    DailySummaryErrorType,
    GetDailyEarningsSummaryInput
} from "@moonbeam/moonbeam-models";
import {createDailyEarningsSummary} from "./resolvers/CreateDailyEarningsSummaryResolver";

/**
 * Mapping out the App Sync event type, so we can use it as a type in the Lambda Handler
 */
type AppSyncEvent = {
    info: {
        fieldName: string
    },
    arguments: {
        getDailyEarningsSummaryInput: GetDailyEarningsSummaryInput,
        createDailyEarningsSummaryInput: CreateDailyEarningsSummaryInput,
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
 * @returns a {@link Promise} containing a {@link DailyEarningsSummaryResponse}
 */
exports.handler = async (event: AppSyncEvent): Promise<DailyEarningsSummaryResponse> => {
    console.log(`Received new Earnings Summary event for operation [${event.info.fieldName}], with arguments ${JSON.stringify(event.arguments)}`);
    switch (event.info.fieldName) {
        // case "getDailyEarningsSummary":
        //     return await getDailyEarningsSummary(event.info.fieldName, event.arguments.getDailyEarningsSummaryInput);
        case "createDailyEarningsSummary":
            return await createDailyEarningsSummary(event.info.fieldName, event.arguments.createDailyEarningsSummaryInput);
        default:
            const errorMessage = `Unexpected field name: ${event.info.fieldName}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: DailySummaryErrorType.UnexpectedError
            };
    }
}

