import {Partner, PartnerResponse, Service, ServicePartnerStatus, ServicesErrorType} from "@moonbeam/moonbeam-models";
import {AttributeValue, DynamoDBClient, QueryCommand} from "@aws-sdk/client-dynamodb";

/**
 * GetServicePartners resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @returns {@link Promise} of {@link PartnerResponse}
 */
export const getServicePartners = async (fieldName: string): Promise<PartnerResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the DynamoDB document client
        const dynamoDbClient = new DynamoDBClient({region: region});

        /**
         * the data to be retrieved from the Query Command
         * the eligible user Items returned from the Query Command, all aggregated together
         * the last evaluated key, to help with the pagination of results
         */
        let result: Record<string, AttributeValue>[] = [];
        let exclusiveStartKey, retrievedData;

        do {
            /**
             * retrieve all service partners, given the global secondary index allowing us to query all partners by their
             * createdAt date, only for those partners that are ACTIVE.
             *
             * Limit of 1 MB per paginated response data (in our case 500 items). An average size for an Item is about 1544 bytes, which means that we won't
             * need to do pagination here, since we actually retrieve all service partners in a looped format, and we account for paginated responses. Even if the item size
             * increases we loop the query command depending on the last evaluated key, so we're ok not to do pagination.
             *
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.Pagination.html}
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html}
             */
            retrievedData = await dynamoDbClient.send(new QueryCommand({
                TableName: process.env.SERVICES_PARTNERS_TABLE!,
                IndexName: `${process.env.SERVICES_PARTNERS_CREATE_TIME_GLOBAL_INDEX!}-${process.env.ENV_NAME!}-${region}`,
                ...(exclusiveStartKey && {ExclusiveStartKey: exclusiveStartKey}),
                Limit: 500, // 500 * 1,544 bytes = 772,000 bytes = 0.772 MB (leave a margin of error here up to 1 MB)
                ExpressionAttributeNames: {
                    '#stat': 'status',
                    '#cAt': 'createdAt'
                },
                ExpressionAttributeValues: {
                    ':stat': {
                        S: ServicePartnerStatus.Active
                    },
                    ':start': {
                        S: new Date(new Date().setFullYear(1979)).toISOString()
                    },
                    ":end": {
                        S: new Date().toISOString()
                    }
                },
                KeyConditionExpression: '#stat = :stat AND #cAt BETWEEN :start AND :end'
            }));

            exclusiveStartKey = retrievedData.LastEvaluatedKey;
            result = result.concat(retrievedData.Items);
        } while (retrievedData && retrievedData.Count && retrievedData.Items &&
        retrievedData.Items.length && retrievedData.Count !== 0 &&
        retrievedData.Items.length !== 0 && retrievedData.LastEvaluatedKey);

        // if there are Service Partners retrieved, then return all of them accordingly
        if (result && result.length !== 0) {
            // convert the Dynamo DB data from Dynamo DB JSON format to a Moonbeam Partner data format
            const partnerData: Partner[] = [];

            // build up the list of partners to be returned
            result.forEach(partnerResult => {
                const services: Service[] = [];
                partnerResult.services.L && partnerResult.services.L!.forEach(service => {
                    const newService: Service = {
                        title: service.M!.title.S!,
                        description: service.M!.description.S!
                    }
                    services.push(newService);
                })
                const servicePartner: Partner = {
                    addressLine: partnerResult.addressLine.S!,
                    city: partnerResult.city.S!,
                    createdAt: partnerResult.createdAt.S!,
                    description: partnerResult.description.S!,
                    id: partnerResult.id.S!,
                    status: ServicePartnerStatus.Active,
                    isOnline: partnerResult.isOnline.BOOL!,
                    logoUrl: partnerResult.logoUrl.S!,
                    name: partnerResult.name.S!,
                    services: services,
                    state: partnerResult.state.S!,
                    updatedAt: partnerResult.updatedAt.S!,
                    website: partnerResult.website.S!,
                    zipCode: partnerResult.zipCode.S!
                };
                partnerData.push(servicePartner);
            });
            // return the list of service partners
            return {
                data: partnerData
            }
        } else {
            const errorMessage = `No matching Service Partners found!`;
            console.log(errorMessage);

            return {
                errorMessage: errorMessage,
                errorType: ServicesErrorType.NoneOrAbsent
            }
        }
    } catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: ServicesErrorType.UnexpectedError
        };
    }
}
