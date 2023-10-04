import {FidelisPartnerResponse, GetOffersInput, OffersErrorType, OffersResponse} from "@moonbeam/moonbeam-models";
import { getFidelisPartners } from "./resolvers/GetFidelisPartnersResolver";
import { getOffers } from "./resolvers/GetOffersResolver";
import {getPremierOffers} from "./resolvers/GetPremierOffersResolver";

/**
 * Mapping out the App Sync event type, so we can use it as a type in the Lambda Handler
 */
type AppSyncEvent = {
    info: {
        fieldName: string
    },
    arguments: {
        getOffersInput: GetOffersInput
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
 * @returns a {@link Promise} containing a {@link OffersResponse} or {@link FidelisPartnerResponse}
 */
exports.handler = async (event: AppSyncEvent): Promise<OffersResponse | FidelisPartnerResponse> => {
    console.log(`Received new offers event for operation [${event.info.fieldName}], with arguments ${JSON.stringify(event.arguments)}`);
    switch (event.info.fieldName) {
        case "getOffers":
            return await getOffers(event.info.fieldName, event.arguments.getOffersInput);
        case "getFidelisPartners":
            return await getFidelisPartners(event.info.fieldName);
        case "getPremierOffers":
            return await getPremierOffers(event.info.fieldName, event.arguments.getOffersInput);
        default:
            const errorMessage = `Unexpected field name: ${event.info.fieldName}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: OffersErrorType.UnexpectedError
            };
    }
}
