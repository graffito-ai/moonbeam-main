import * as AWS from "aws-sdk";
import {PlaidApi} from "plaid/api";
import {Configuration, PlaidEnvironments} from "plaid";
import {Constants} from "@moonbeam/moonbeam-models";

/**
 * Class used to initialize a new Plaid Client, to be used for retrieving various
 * secrets.
 */
export class PlaidUtils {

    // Plaid credentials retrieve from AWS Secrets Manager
    readonly plaidClientId: string | undefined;
    readonly plaidSecret: string | undefined;

    // Plaid Client to be initialized
    readonly plaidClient: PlaidApi | undefined;

    /**
     * Constructor for the PlaidClient to be initialized.
     *
     * @param plaidClient plaid client to be initialized
     * @param plaidClientId plaid client id to be retrieved
     * @param plaidSecret plaid secret to be retrieved
     */
    private constructor(plaidClient?: PlaidApi, plaidClientId?: string, plaidSecret?: string) {
        this.plaidClient = plaidClient;
        this.plaidClientId = plaidClientId;
        this.plaidSecret = plaidSecret;
    }

    /**
     * Method used to set up the utils class
     *
     * @return an instance of {@link Promise} of {@link PlaidUtils}
     */
    public static setup = async (): Promise<PlaidUtils> => {
        // retrieve the necessary Plaid credentials
        const plaidPair = await this.retrievePlaidPair();

        try {
            // use the Plaid library, in order to initialize a Plaid client
            const plaidClient = new PlaidApi(new Configuration({
                basePath: PlaidEnvironments.sandbox, // this needs to change in the future depending on the environment
                baseOptions: {
                    headers: {
                        [Constants.AWSPairConstants.PLAID_CLIENT_ID]: plaidPair[0],
                        [Constants.AWSPairConstants.PLAID_SECRET]: plaidPair[1],
                    },
                },
            }));

            // return a new instance of the Utils class
            return new PlaidUtils(plaidClient, plaidPair[0], plaidPair[1]);
        } catch (err) {
            const errorMessage = `Unexpected error while setting up the Plaid client ${err}`;
            console.log(errorMessage);
            throw new Error(errorMessage);
        }
    }

    /**
     * Function used to return the Plaid secrets, returned from the AWS Secrets Manager,
     * given the current region and environment.
     *
     * @return a instance of {@link Promise} of a Pair of {@link string}, {@link string}
     */
    private static retrievePlaidPair = async (): Promise<[string, string]> => {
        try {
            // retrieving the current function region
            const region = process.env.AWS_REGION!;

            // initializing the AWS Secrets Manager client
            const secretsClient = new AWS.SecretsManager({
                region: region,
            });

            // retrieve the Plaid related secrets for Moonbeam, depending on the current region and environment
            const plaidPair = await secretsClient
                .getSecretValue({SecretId: `${Constants.AWSPairConstants.PLAID_SECRET_NAME}-${process.env.ENV_NAME!}-${region}`}).promise();

            if (plaidPair.SecretString) {
                // convert the retrieved secrets pair value, as a JSON object
                const plaidPairAsJson = JSON.parse(plaidPair.SecretString!);

                // filter out and set the necessary Plaid credentials
                return [plaidPairAsJson[Constants.AWSPairConstants.PLAID_CLIENT_ID], plaidPairAsJson[Constants.AWSPairConstants.PLAID_SECRET]];
            }
            throw new Error(`Plaid pair secret string not available ${JSON.stringify(plaidPair)}`);
        } catch (err) {
            const errorMessage = `Unexpected error while retrieving Plaid pair ${err}`;
            console.log(errorMessage);
            throw new Error(errorMessage);
        }
    }
}
