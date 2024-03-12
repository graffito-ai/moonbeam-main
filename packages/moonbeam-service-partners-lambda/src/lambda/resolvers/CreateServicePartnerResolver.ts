import {
    CreatePartnerInput,
    FileAccessLevel,
    FileType,
    MoonbeamClient,
    Partner,
    PartnerResponse,
    ServicesErrorType
} from "@moonbeam/moonbeam-models";
import {DynamoDBClient, GetItemCommand, PutItemCommand} from "@aws-sdk/client-dynamodb";
import {v4 as uuidv4} from 'uuid';

/**
 * CreateServicePartner resolver
 *
 * @param createPartnerInput the input needed to create a new service partner
 * @param fieldName name of the resolver path from the AppSync event
 * @returns {@link Promise} of {@link PartnerResponse}
 */
export const createServicePartner = async (fieldName: string, createPartnerInput: CreatePartnerInput): Promise<PartnerResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the DynamoDB document client
        const dynamoDbClient = new DynamoDBClient({region: region});

        // update the timestamps accordingly and the id of the potentially newly created service partner
        const createdAt = new Date().toISOString();
        createPartnerInput.createdAt = createPartnerInput.createdAt ? createPartnerInput.createdAt : createdAt;
        createPartnerInput.updatedAt = createPartnerInput.updatedAt ? createPartnerInput.updatedAt : createdAt;
        createPartnerInput.id = createPartnerInput.id ? createPartnerInput.id : uuidv4();

        /**
         * check to see if the service partner already exists in the DB.
         */
        const preExistingServicePartner = await dynamoDbClient.send(new GetItemCommand({
            TableName: process.env.SERVICES_PARTNERS_TABLE!,
            Key: {
                name: {
                    S: createPartnerInput.name
                }
            },
            /**
             * we're not interested in getting all the data for this call, just the minimum for us to determine whether this is a duplicate or not
             *
             * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html
             * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ExpressionAttributeNames.html
             */
            ProjectionExpression: '#name',
            ExpressionAttributeNames: {
                '#name': 'name'
            }
        }));

        // if there is an item retrieved and the service partner's name is the same as the one inputted to be created, then we return an error
        if (preExistingServicePartner && preExistingServicePartner.Item) {
            /**
             * if there is a pre-existing service partner with the same name as the one inputted,
             * then we cannot duplicate that, so we will return an error.
             */
            const errorMessage = `Duplicate service partner found!`;
            console.log(errorMessage);

            return {
                errorMessage: errorMessage,
                errorType: ServicesErrorType.DuplicateObjectFound
            }
        } else {
            // initialize the Moonbeam client used for making appropriate API calls
            const moonbeamClient = new MoonbeamClient(process.env.ENV_NAME!, region);

            // retrieve the logo URL served through CloudFront and S3, by calling the getStorage internal AppSync Query accordingly
            // moonbeamClient.getStorageFileUrl({
            //     level: FileAccessLevel.Public,
            //     type: FileType.Main,
            //     name: "terms-and-conditions.pdf",
            //     expires: false
            // });

            // create the services array, obtained from the input
            const services: any[] = [];
            createPartnerInput.services.forEach(service => {
                if (service !== null) {
                    services.push({
                        M: {
                            title: {
                                S: service.title
                            },
                            description: {
                                S: service.description
                            }
                        }
                    });
                }
            });
            // store the Service Partner object
            await dynamoDbClient.send(new PutItemCommand({
                TableName: process.env.SERVICES_PARTNERS_TABLE!,
                Item: {
                    id: {
                        S: createPartnerInput.id!
                    },
                    createdAt: {
                        S: createPartnerInput.createdAt!
                    },
                    updatedAt: {
                        S: createPartnerInput.updatedAt!
                    },
                    name: {
                        S: createPartnerInput.name
                    },
                    description: {
                        S: createPartnerInput.description
                    },
                    isOnline: {
                        BOOL: createPartnerInput.isOnline
                    },
                    logoUrl: {
                        S: createPartnerInput.logoUrl
                    },
                    addressLine: {
                        S: createPartnerInput.addressLine
                    },
                    city: {
                        S: createPartnerInput.city
                    },
                    state: {
                        S: createPartnerInput.state
                    },
                    zipCode: {
                        S: createPartnerInput.zipCode
                    },
                    website: {
                        S: createPartnerInput.website
                    },
                    services: {
                        L: services
                    }
                }
            }));

            // return the Service Partner object
            return {
                data: [createPartnerInput as Partner]
            }
        }
    } catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: ServicesErrorType.UnexpectedError
        }
    }
}
