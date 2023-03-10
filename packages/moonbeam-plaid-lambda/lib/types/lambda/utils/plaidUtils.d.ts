import { PlaidApi } from "plaid/api";
/**
 * Class used to initialize a new Plaid Client, to be used for retrieving various
 * secrets.
 */
export declare class PlaidUtils {
    readonly plaidClientId: string | undefined;
    readonly plaidSecret: string | undefined;
    readonly plaidClient: PlaidApi | undefined;
    /**
     * Constructor for the PlaidClient to be initialized.
     *
     * @param plaidClient plaid client to be initialized
     * @param plaidClientId plaid client id to be retrieved
     * @param plaidSecret plaid secret to be retrieved
     */
    private constructor();
    /**
     * Method used to set up the utils class
     *
     * @return an instance of {@link Promise} of {@link PlaidUtils}
     */
    static setup: () => Promise<PlaidUtils>;
    /**
     * Function used to return the Plaid secrets, returned from the AWS Secrets Manager,
     * given the current region and environment.
     *
     * @return a instance of {@link Promise} of a Pair of {@link string}, {@link string}
     */
    private static retrievePlaidPair;
}
