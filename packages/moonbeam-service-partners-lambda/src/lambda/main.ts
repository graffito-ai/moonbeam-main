import {CreatePartnerInput, PartnerResponse, ServicesErrorType} from "@moonbeam/moonbeam-models";
import {createServicePartner} from "./resolvers/CreateServicePartnerResolver";
import {getServicePartners} from "./resolvers/GetServicePartnersResolver";

/**
 * Mapping out the App Sync event type, so we can use it as a type in the Lambda Handler
 */
type AppSyncEvent = {
    info: {
        fieldName: string
    },
    arguments: {
        createPartnerInput: CreatePartnerInput,
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
 * @returns a {@link Promise} containing a {@link PartnerResponse}
 */
exports.handler = async (event: AppSyncEvent): Promise<PartnerResponse> => {
    console.log(`Received new Service Partner event for operation [${event.info.fieldName}], with arguments ${JSON.stringify(event.arguments)}`);
    switch (event.info.fieldName) {
        case "getServicePartners":
            return await getServicePartners(event.info.fieldName);
        case "createServicePartner":
            return await createServicePartner(event.info.fieldName, event.arguments.createPartnerInput);
        default:
            const errorMessage = `Unexpected field name: ${event.info.fieldName}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: ServicesErrorType.UnexpectedError
            };
    }
}

