import 'react-native-get-random-values';
import React, {useEffect, useState} from "react";
import {Dimensions, SafeAreaView, ScrollView, View} from "react-native";
import {commonStyles} from "../../../styles/common.module";
import {Button, Divider, IconButton, List, Text} from "react-native-paper";
import {styles} from "../../../styles/bankAccounts.module";
import {API, graphqlOperation} from "aws-amplify";
import {
    AccountDetails,
    AccountInput,
    AccountLinkDetails,
    AccountType,
    AccountVerificationStatus,
    Constants,
    createAccountLink,
    CreateAccountLinkInput,
    deleteAccount,
    DeleteAccountInput,
    FinancialInstitutionInput,
    listAccounts,
    updateAccountLink,
    UpdateAccountLinkInput
} from "@moonbeam/moonbeam-models";
import {LinkExit, LinkSuccess} from "react-native-plaid-link-sdk";
import {LinkAccountSubtypeDepository, LinkAccountVerificationStatus} from "react-native-plaid-link-sdk/dist/Types";
import PlaidLink from '../../integrations/plaid/PlaidLink';
import {CommonActions} from "@react-navigation/native";
import {refreshUserToken} from "../../../utils/Identity";
import * as envInfo from "../../../../amplify/.config/local-env-info.json";
import * as provider from "../../../../amplify/team-provider-info.json";
import * as SecureStore from "expo-secure-store";
import {BankAccountsProps} from "../../../models/DrawerProps";
import MOONBEAM_DEPLOYMENT_BUCKET_NAME = Constants.MoonbeamConstants.MOONBEAM_DEPLOYMENT_BUCKET_NAME;
import MOONBEAM_PLAID_OAUTH_FILE_NAME = Constants.MoonbeamConstants.MOONBEAM_PLAID_OAUTH_FILE_NAME;

/**
 * BankAccounts component.
 */
export const BankAccounts = ({route, navigation}: BankAccountsProps) => {
    // state driven key-value pairs for UI related elements
    const [isPlaidInitialized, setIsPlaidInitialized] = useState<boolean>(false);

    // state driven key-value pairs for any specific data values
    const [accountLinkDetails, setAccountLinkDetails] = useState<AccountLinkDetails>();
    const [redirectURL, setRedirectURL] = useState<string>("");
    const [bankAccounts, setBankAccounts] = useState<AccountDetails[]>([]);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // retrieve all bank accounts to display, on an initial render only
        retrieveBankAccounts().then(() => {
            if (route.params.oauthStateId) {
                const region = provider[envInfo.envName]["awscloudformation"]["Region"];
                const redirectURLFile = `https://${MOONBEAM_DEPLOYMENT_BUCKET_NAME}-${envInfo.envName}-${region}.s3.${region}.amazonaws.com/${MOONBEAM_PLAID_OAUTH_FILE_NAME}-${envInfo.envName}.html`;
                setRedirectURL(`${redirectURLFile}?oauth_state_id=${route.params.oauthStateId}`);
            }

            // hide the header, depending on whether the Plaid link flow is initialized or not
            if (isPlaidInitialized) {
                route.params.setIsDrawerHeaderShown(false);
            } else if (!isPlaidInitialized) {
                route.params.setIsDrawerHeaderShown(true);
            }
        });
    }, [route, route.params.oauthStateId, redirectURL, isPlaidInitialized, bankAccounts]);

    /**
     * Function used to retrieve the bank accounts for a particular user
     */
    const retrieveBankAccounts = async (): Promise<void> => {
        try {
            // check to see if after the redirect, the user information needs to be retrieved from cache
            const userInformation = route.params.currentUserInformation === '{}'
            || Object.keys(route.params.currentUserInformation).length === 0
                ? JSON.parse(await SecureStore.getItemAsync('currentUserInformation') as string)
                : route.params.currentUserInformation;

            if (bankAccounts.length === 0) {
                // first check if there are accounts already loaded
                let retrievedAccounts = await SecureStore.getItemAsync('bankAccounts');
                if (retrievedAccounts) {
                    setBankAccounts(JSON.parse(retrievedAccounts) as AccountDetails[]);
                } else {
                    // perform the query to retrieve accounts
                    const retrievedAccountsResult = await API.graphql(graphqlOperation(listAccounts, {
                        filter: {
                            id: userInformation["custom:userId"]
                        }
                    }));
                    // @ts-ignore
                    if (retrievedAccountsResult && retrievedAccountsResult.data.listAccounts.errorMessage === null) {
                        // @ts-ignore
                        setBankAccounts(retrievedAccountsResult.data.listAccounts.data);

                        // store the retrieved accounts in the store
                        // @ts-ignore
                        await SecureStore.setItemAsync('bankAccounts', JSON.stringify(retrievedAccountsResult.data.listAccounts.data));
                    } else {
                        console.log(`Unexpected error while attempting to retrieve accounts for user ${JSON.stringify(retrievedAccountsResult)}`);
                        // ToDo: need to create a modal with errors
                    }
                }
            }
        } catch (error) {
            // @ts-ignore
            console.log(error.message
                // @ts-ignore
                ? `Unexpected error while retrieving accounts for user: ${JSON.stringify(error.message)}`
                : `Unexpected error while retrieving accounts for user: ${JSON.stringify(error)}`);
            // ToDo: need to create a modal with errors
        }
    }

    /**
     * Function used to handle the addition a new link token
     *
     * @return a {@link Promise} or {@link void}
     */
    const addLinkToken = async (): Promise<void> => {
        try {
            // check to see if after the redirect, the user information needs to be retrieved from cache
            const userInformation = route.params.currentUserInformation === '{}'
            || Object.keys(route.params.currentUserInformation).length === 0
                ? JSON.parse(await SecureStore.getItemAsync('currentUserInformation') as string)
                : route.params.currentUserInformation;

            // perform a mutation to create a link token
            const createAccountLinkInput: CreateAccountLinkInput = {
                id: userInformation["custom:userId"],
                userName: userInformation["name"],
                userEmail: userInformation["email"].toLowerCase()
            }
            const linkTokenResult = await API.graphql(graphqlOperation(createAccountLink, {
                createAccountLinkInput: createAccountLinkInput
            }));
            // @ts-ignore
            if (linkTokenResult && linkTokenResult.data.createAccountLink.errorMessage === null) {
                // @ts-ignore
                const links: AccountLinkDetails[] = linkTokenResult.data.createAccountLink.data.links;

                // @ts-ignore
                const accountLinkDetails = links[links.length - 1];
                setAccountLinkDetails(accountLinkDetails);

                // refresh the user token if necessary - in order to be able to deep link back to the screen
                await refreshUserToken('BankAccounts');

                // initialize Plaid Link
                setIsPlaidInitialized(true);
            } else {
                console.log(`Unexpected error while attempting to create a link token ${JSON.stringify(linkTokenResult)}`);
                // ToDo: need to create a modal with errors
            }
        } catch (error) {
            // @ts-ignore
            console.log(error.message
                // @ts-ignore
                ? `Unexpected error while creating a link token: ${JSON.stringify(error.message)}`
                : `Unexpected error while creating a link token: ${JSON.stringify(error)}`);
            // ToDo: need to create a modal with errors
        }
    };

    /**
     * Function used to perform an update for the account link, on a Success event
     *
     * @param success success object obtained from a user successful action
     *
     * @return a {@link Promise} or {@link void}
     */
    const accountLinkOnSuccess = async (success: LinkSuccess): Promise<void> => {
        try {
            // check to see if after the redirect, the user information needs to be retrieved from cache
            const userInformation = route.params.currentUserInformation === '{}'
            || Object.keys(route.params.currentUserInformation).length === 0
                ? JSON.parse(await SecureStore.getItemAsync('currentUserInformation') as string)
                : route.params.currentUserInformation;

            /**
             * loop through all retrieved accounts, and map them accordingly
             */
            const accounts: AccountInput[] = [];
            const accountsToUpdate: AccountDetails[] = [];
            success.metadata.accounts.forEach(account => {
                /**
                 * add account details in the list of temporary accounts to be added
                 * this list will be merged with the retrieved list of accounts later on
                 * once the update query was successful, and duplicate accounts will be taken
                 * care of on the front-end side as well, so we don't make additional get calls.
                 */
                let accountToUpdate = {
                    id: account["_id"], // account.id not working - ToDo: need to discuss this with Plaid
                    mask: account.mask ? account.mask : '',
                    name: account.name ? account.name : '',
                    type: (account.type === LinkAccountSubtypeDepository.CHECKING.type && account.subtype === LinkAccountSubtypeDepository.CHECKING.subtype)
                        ? AccountType.Checking
                        : (((account.type === LinkAccountSubtypeDepository.SAVINGS.type && account.subtype === LinkAccountSubtypeDepository.SAVINGS.subtype)) ? AccountType.Savings : AccountType.Unknown),
                    verificationStatus: account.verificationStatus
                        ? ((account.verificationStatus === LinkAccountVerificationStatus.PENDING_AUTOMATIC_VERIFICATION || account.verificationStatus === LinkAccountVerificationStatus.PENDING_MANUAL_VERIFICATION)
                            ? AccountVerificationStatus.Pending : AccountVerificationStatus.Verified) : AccountVerificationStatus.Verified
                }

                // duplicate accounts on the back-end side, are handled at the API layer
                accounts.push({
                    ...accountToUpdate
                });

                accountsToUpdate.push({
                    ...accountToUpdate,
                    ...(success.metadata.institution
                        ? {
                            institution: success.metadata.institution as FinancialInstitutionInput
                        } : {
                            institution: {
                                name: 'Bank',
                                id: ''
                            }
                        }),
                    linkToken: accountLinkDetails!.linkToken!
                });
            });
            // perform a mutation to exchange the link token and update the account link with the appropriate account info
            const updateAccountLinkInput: UpdateAccountLinkInput = {
                id: userInformation["custom:userId"],
                accountLinkDetails: {
                    linkToken: accountLinkDetails!.linkToken!,
                    linkSessionId: success.metadata.linkSessionId,
                    accounts: accounts,
                    // only exchange access for public token if access token does not exist
                    ...((!accountLinkDetails!.accessToken || accountLinkDetails!.accessToken!.length === 0)) && {
                        publicToken: success.publicToken
                    },
                    ...(success.metadata.institution && {
                        institution: success.metadata.institution as FinancialInstitutionInput
                    })
                }
            }
            const accountLinkUpdateResult = await API.graphql(graphqlOperation(updateAccountLink, {
                updateAccountLinkInput: updateAccountLinkInput
            }));

            // @ts-ignore
            if (accountLinkUpdateResult && accountLinkUpdateResult.data.updateAccountLink.errorMessage === null) {
                setIsPlaidInitialized(false);

                // clean the oauth redirect state throughout
                if (route.params.oauthStateId) {
                    navigation.dispatch({
                        ...CommonActions.setParams({oauthStateId: undefined}),
                        source: route.key
                    });
                }
                setRedirectURL("");

                // clear the link details
                setAccountLinkDetails(undefined);

                // merge the two lists between retrieved and existing accounts, besides duplicates
                const accountsToMerge = accountsToUpdate;
                let checkedIndex: number = 0;
                accountsToUpdate.forEach(accountToUpdate => {
                    bankAccounts.forEach(retrievedAccount => {
                        if ((retrievedAccount.institution.name === accountToUpdate.institution.name)
                            && (retrievedAccount.institution.id === accountToUpdate.institution.id)
                            && (retrievedAccount.name === accountToUpdate.name)
                            && (retrievedAccount.mask === accountToUpdate.mask)
                            && (retrievedAccount.type === accountToUpdate.type)) {
                            // remove the duplicates
                            accountsToMerge.splice(checkedIndex, 1);
                        }
                    })
                    checkedIndex++;
                });
                accountsToMerge.length !== 0 && bankAccounts.push(...accountsToMerge);

                // need to clear the bankAccounts in the store, for future retrievals on future screen loads
                await SecureStore.deleteItemAsync('bankAccounts');
            } else {
                console.log(`Unexpected error while updating link token on exit ${JSON.stringify(accountLinkUpdateResult)}`);
                // ToDo: need to create a modal with errors
            }
        } catch (error) {
            // @ts-ignore
            console.log(error.message
                // @ts-ignore
                ? `Unexpected error while updating link account on success: ${JSON.stringify(error.message)}`
                : `Unexpected error while updating link account on success: ${JSON.stringify(error)}`);
            // ToDo: need to create a modal with errors
        }
    };

    /**
     * Function used to perform an update for the account link, on an Exit event
     *
     * @param exit exit object obtained from a user Link exit and/or error
     *
     * @return a {@link Promise} or {@link void}
     */
    const accountLinkOnExit = async (exit: LinkExit): Promise<void> => {
        try {
            // check to see if after the redirect, the user information needs to be retrieved from cache
            const userInformation = route.params.currentUserInformation === '{}'
            || Object.keys(route.params.currentUserInformation).length === 0
                ? JSON.parse(await SecureStore.getItemAsync('currentUserInformation') as string)
                : route.params.currentUserInformation;

            // perform a mutation to update the account link with the appropriate error info
            const updateAccountLinkInput: UpdateAccountLinkInput = {
                id: userInformation["custom:userId"],
                accountLinkDetails: {
                    ...(exit.error && {
                        accountLinkError: {
                            errorMessage: exit.error.errorMessage ? exit.error.errorMessage : 'N/A',
                            errorType: exit.error.errorCode ? exit.error.errorCode.toString() : 'N/A'
                        }
                    }),
                    linkToken: accountLinkDetails!.linkToken!,
                    linkSessionId: exit.metadata.linkSessionId,
                    requestId: exit.metadata.requestId
                }
            }
            const accountLinkExchangeResult = await API.graphql(graphqlOperation(updateAccountLink, {
                updateAccountLinkInput: updateAccountLinkInput
            }));

            // @ts-ignore
            if (accountLinkExchangeResult && accountLinkExchangeResult.data.updateAccountLink.errorMessage === null) {
                setIsPlaidInitialized(false);

                // clean the oauth redirect state throughout
                if (route.params.oauthStateId) {
                    navigation.dispatch({
                        ...CommonActions.setParams({oauthStateId: undefined}),
                        source: route.key
                    });
                }
                setRedirectURL("");

                // clear the link details
                setAccountLinkDetails(undefined);
            } else {
                console.log(`Unexpected error while creating exchanging link token on exit ${JSON.stringify(accountLinkExchangeResult)}`);
                // ToDo: need to create a modal with errors
            }
        } catch (error) {
            // @ts-ignore
            console.log(error.message
                // @ts-ignore
                ? `Unexpected error while updating link account on exit: ${JSON.stringify(error.message)}`
                : `Unexpected error while updating link account on exit: ${JSON.stringify(error)}`);
            // ToDo: need to create a modal with errors
        }
    }

    /**
     * Function used to remove a bank account, from the list of accounts for the user account link
     *
     * @param accountId id for the account to remove
     */
    const deleteAccountFromLink = async (accountId: string): Promise<void> => {
        try {
            // check to see if after the redirect, the user information needs to be retrieved from cache
            const userInformation = route.params.currentUserInformation === '{}'
            || Object.keys(route.params.currentUserInformation).length === 0
                ? JSON.parse(await SecureStore.getItemAsync('currentUserInformation') as string)
                : route.params.currentUserInformation;

            // retrieve the account details from the list of accounts, based on the provided id
            bankAccounts.filter(account => account!.id === accountId).map(async retrievedAccount => {
                // perform a mutation to delete the account from the list of accounts for the link
                const deleteAccountInput: DeleteAccountInput = {
                    id: userInformation["custom:userId"],
                    linkToken: retrievedAccount.linkToken,
                    accounts: [{
                        ...retrievedAccount
                    }]
                }
                const deleteAccountResult = await API.graphql(graphqlOperation(deleteAccount, {
                    deleteAccountInput: deleteAccountInput
                }));

                // @ts-ignore
                if (deleteAccountResult && deleteAccountResult.data.deleteAccount.errorMessage === null) {
                    // set the bank accounts array, to the array returned after deletion
                    // @ts-ignore
                    setBankAccounts(deleteAccountResult.data.deleteAccount.data as AccountDetails[]);

                    // store the retrieved accounts in the store
                    // @ts-ignore
                    await SecureStore.setItemAsync('bankAccounts', JSON.stringify(deleteAccountResult.data.deleteAccount.data));
                } else {
                    console.log(`Unexpected error while deleting account ${accountId} ${JSON.stringify(deleteAccountResult)}`);
                    // ToDo: need to create a modal with errors
                }
            });
        } catch (error) {
            // @ts-ignore
            console.log(error.message
                // @ts-ignore
                ? `Unexpected error while deleting account: ${JSON.stringify(error.message)}`
                : `Unexpected error while deleting account: ${JSON.stringify(error)}`);
            // ToDo: need to create a modal with errors
        }
    }


    /**
     * Function used to filter and return accounts, as a list items, depending on the
     * status passed in.
     *
     * @param status status to filter accounts by
     */
    const filterAccounts = (status: AccountVerificationStatus): React.ReactNode | React.ReactNode[] => {
        let filteredAccounts: AccountDetails[] = []
        if (bankAccounts.length !== 0) {
            bankAccounts
                .filter((account) => account!.verificationStatus === status)
                .map((account) => filteredAccounts.push(account))
        }
        if (filteredAccounts.length !== 0) {
            let results: React.ReactNode[] = [];
            let filteredAccountsIndex = 0;
            for (const filteredAccount of filteredAccounts) {
                results.push(<>
                    <List.Item
                        key={filteredAccount.id}
                        style={styles.bankItemStyle}
                        titleStyle={styles.bankItemTitle}
                        descriptionStyle={styles.bankItemDetails}
                        titleNumberOfLines={2}
                        descriptionNumberOfLines={2}
                        title={filteredAccount.institution.name}
                        description={`${filteredAccount.type} ${filteredAccount.mask !== '' ? filteredAccount.mask : '••••'}`}
                        left={() =>
                            <List.Icon color={'#2A3779'} icon="bank-check" key={`${filteredAccount.id}_bankIconKey`}/>}
                        right={() =>
                            <IconButton
                                key={`${filteredAccount.id}_deleteKey`}
                                style={styles.bankItemRightIcon}
                                icon="trash-can"
                                iconColor={'red'}
                                size={25}
                                onPress={async () => await deleteAccountFromLink(filteredAccount.id)}
                            />}
                    />
                    {filteredAccountsIndex !== filteredAccounts.length - 1 &&
                        <Divider style={[commonStyles.divider, {width: Dimensions.get('window').width / 1.15}]}/>}
                </>)
                filteredAccountsIndex++;
            }
            return results;
        } else {
            switch (status) {
                case AccountVerificationStatus.Verified:
                    return (<List.Item
                        key={`${AccountVerificationStatus.Verified}_Key`}
                        style={styles.bankItemStyle}
                        titleStyle={styles.bankItemTitle}
                        descriptionStyle={styles.bankItemDetails}
                        titleNumberOfLines={1}
                        descriptionNumberOfLines={2}
                        title="Hurry!"
                        description='Connect your first account below'
                        right={() =>
                            <List.Icon color={'red'} icon="exclamation"
                                       key={`${AccountVerificationStatus.Verified}_exclamationKey`}/>}
                    />);
                case AccountVerificationStatus.Pending:
                    return (<List.Item
                        key={`${AccountVerificationStatus.Pending}_Key`}
                        style={styles.bankItemStyle}
                        titleStyle={styles.bankItemTitle}
                        descriptionStyle={styles.bankItemDetails}
                        titleNumberOfLines={1}
                        descriptionNumberOfLines={2}
                        title="Great job!"
                        description='No accounts pending verification'
                        right={() =>
                            <List.Icon color={'green'} icon="check"
                                       key={`${AccountVerificationStatus.Pending}_checkKey`}/>}
                    />);
                default:
                    return (<></>);
            }
        }
    }

    // return the component for the Bank Accounts page
    return (
        isPlaidInitialized ?
            <PlaidLink
                oAuthUri={route.params.oauthStateId ? redirectURL : ""}
                linkToken={accountLinkDetails!.linkToken!}
                onExit={async (exit: LinkExit) => {
                    // perform an account link update accordingly
                    await accountLinkOnExit(exit);
                }}
                onSuccess={async (success: LinkSuccess) => {
                    // perform an account link update accordingly
                    await accountLinkOnSuccess(success);
                }}
                onEvent={undefined}
            />
            :
            <SafeAreaView style={[commonStyles.rowContainer, commonStyles.androidSafeArea]}>
                <View>
                    <ScrollView
                        scrollEnabled={true}
                        keyboardShouldPersistTaps={'handled'}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={[styles.mainView]}>
                            <View style={styles.titleView}>
                                <Text style={styles.mainTitle}>Bank Accounts</Text>
                            </View>
                            <View style={styles.content}>
                                <List.Section style={styles.listSectionView}>
                                    <List.Subheader style={styles.subHeaderTitle}>Connected Accounts</List.Subheader>
                                    <Divider
                                        style={[commonStyles.divider, {width: Dimensions.get('window').width / 1.15}]}/>
                                    {
                                        filterAccounts(AccountVerificationStatus.Verified)
                                    }
                                </List.Section>
                                <List.Section style={styles.listSectionView}>
                                    <List.Subheader style={styles.subHeaderTitle}>Pending Accounts</List.Subheader>
                                    <Divider
                                        style={[commonStyles.divider, {width: Dimensions.get('window').width / 1.15}]}/>
                                    {
                                        filterAccounts(AccountVerificationStatus.Pending)
                                    }
                                </List.Section>
                            </View>
                        </View>
                    </ScrollView>
                    <View style={styles.bottomView}>
                        <Divider style={[commonStyles.divider, {width: Dimensions.get('window').width}]}/>
                        <Button
                            onPress={async () => {
                                // retrieve the Plaid link token if it is not populated
                                await addLinkToken();
                            }}
                            uppercase={false}
                            style={styles.connectButton}
                            textColor={"#f2f2f2"}
                            buttonColor={"#2A3779"}
                            mode="outlined"
                            labelStyle={{fontSize: 18}}
                            icon={"plus"}>
                            Add a new Account
                        </Button>
                        <View style={styles.bottomTextView}>
                            <Text style={styles.bottomText}>Can't connect ?
                                <Text style={styles.bottomTextButton}
                                      onPress={() => {
                                      }}> Add account manually</Text>
                            </Text>
                        </View>
                    </View>
                </View>
            </SafeAreaView>
    );
}
