import 'react-native-get-random-values';
import React, {useEffect, useState} from "react";
import {Dimensions, SafeAreaView, View} from "react-native";
import {commonStyles} from "../../../../styles/common.module";
import {Button, Divider, List, Text} from "react-native-paper";
import {styles} from "../../../../styles/bankAccounts.module";
// @ts-ignore
import FriendReferral from '../../../../../assets/refer-friend.png';
import {BankAccountsProps} from "../../../../models/SettingsStackProps";
import {API, graphqlOperation} from "aws-amplify";
import {
    AccountInput,
    AccountLinkDetails,
    AccountType,
    AccountVerificationStatus,
    createAccountLink,
    CreateAccountLinkInput,
    FinancialInstitutionInput,
    updateAccountLink,
    UpdateAccountLinkInput
} from "@moonbeam/moonbeam-models";
import {LinkExit, LinkSuccess} from "react-native-plaid-link-sdk";
import {LinkAccountSubtypeDepository, LinkAccountVerificationStatus} from "react-native-plaid-link-sdk/dist/Types";
import PlaidLink from '../../../integrations/plaid/PlaidLink';
import {CommonActions} from "@react-navigation/native";
import {refreshUserToken} from "../../../../utils/Setup";

/**
 * BankAccounts component.
 */
export const BankAccounts = ({navigation, route}: BankAccountsProps) => {
    // state driven key-value pairs for UI related elements
    const [isPlaidInitialized, setIsPlaidInitialized] = useState<boolean>(false);
    const [headerOffset, setIsHeaderOffset] = useState<boolean | null>(null);

    // state driven key-value pairs for any specific data values
    const [accountLinkDetails, setAccountLinkDetails] = useState<AccountLinkDetails>();

    // state to keep track of the redirect reconstructed URL
    const [redirectURL, setRedirectURL] = useState<string>("");

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        if (route.params.oauthStateId) {
            setRedirectURL(`https://moonbeam-application-deployment-bucket.s3.us-west-2.amazonaws.com/moonbeam-plaid-oauth-dev.html?oauth_state_id=${route.params.oauthStateId}`);
        }

        // hide the header, depending on whether the Plaid link flow is initialized or not
        if (isPlaidInitialized && route.params.setIsHeaderShown) {
            route.params.setIsHeaderShown(false);
        } else if (!isPlaidInitialized && route.params.setIsHeaderShown) {
            route.params.setIsHeaderShown(true);
        }

        // hide the bottom tab navigation
        route.params.setBottomTabNavigationShown && route.params.setBottomTabNavigationShown(false);
    }, [route, route.params.oauthStateId, redirectURL, isPlaidInitialized]);

    /**
     * Function used to handle the addition a new link token
     *
     * @return a {@link Promise} or {@link void}
     */
    const addLinkToken = async (): Promise<void> => {
        try {
            // perform a mutation to create a link token
            const createAccountLinkInput: CreateAccountLinkInput = {
                id: route.params.currentUserInformation["custom:userId"],
                userName: route.params.currentUserInformation["name"],
                userEmail: route.params.currentUserInformation["email"].toLowerCase()
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
            } else {
                console.log(`Unexpected error while attempting to create a link token ${JSON.stringify(linkTokenResult)}`);
                // ToDo: need to create a modal with errors
                // setPasswordErrors([`Unexpected error while creating a link token ${linkTokenResult}`]);
            }
        } catch (error) {
            // @ts-ignore
            console.log(error.message ? `Unexpected error while creating a link token: ${JSON.stringify(error.message)}` : `Unexpected error while creating a link token: ${JSON.stringify(error)}`);
            // ToDo: need to create a modal with errors
            // setPasswordErrors([`Error while linking Bank Account`]);
        }
    };

    /**
     * Function used to perform an update for the account link
     *
     * @param success success object obtained from a user successful action
     * @param exit exit object obtained from a user Link exit and/or error
     *
     * @return a {@link Promise} or {@link void}
     */
    const accountLinkUpdate = async (success?: LinkSuccess, exit?: LinkExit): Promise<void> => {
        try {
            // in case of a Link exit
            if (exit) {
                // perform a mutation to update the account link with the appropriate error info
                const updateAccountLinkInput: UpdateAccountLinkInput = {
                    id: route.params.currentUserInformation["custom:userId"],
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
                JSON.stringify(updateAccountLinkInput);

                const accountLinkExchangeResult = await API.graphql(graphqlOperation(updateAccountLink, {
                    updateAccountLinkInput: updateAccountLinkInput
                }));

                // @ts-ignore
                if (accountLinkExchangeResult && accountLinkExchangeResult.data.updateAccountLink.errorMessage === null) {
                    setIsPlaidInitialized(false);
                    setIsHeaderOffset(true);

                    // clean the oauth redirect state throughout
                    if(route.params.oauthStateId) {
                        navigation.dispatch({
                            ...CommonActions.setParams({oauthStateId: undefined}),
                            source: route.key
                        });
                        setRedirectURL("");
                    }
                } else {
                    console.log(`Unexpected error while creating exchanging link token ${JSON.stringify(accountLinkExchangeResult)}`);
                    // ToDo: need to create a modal with errors
                    // setPasswordErrors([`Unexpected error while creating a link token ${linkTokenResult}`]);
                }
            } else if (success) {
                // loop through all retrieved accounts, and map them accordingly
                const accounts: AccountInput[] = [];
                success.metadata.accounts.forEach(account => {
                    accounts.push({
                        id: account["_id"], // account.id not working - ToDo: need to discuss this with Plaid
                        mask: account.mask ? account.mask : '••••',
                        name: account.name ? account.name : 'Account',
                        type: (account.type === LinkAccountSubtypeDepository.CHECKING.type && account.subtype === LinkAccountSubtypeDepository.CHECKING.subtype)
                            ? AccountType.Checking
                            : (((account.type === LinkAccountSubtypeDepository.SAVINGS.type && account.subtype === LinkAccountSubtypeDepository.SAVINGS.subtype)) ? AccountType.Savings : AccountType.Unknown),
                        verificationStatus: account.verificationStatus
                            ? ((account.verificationStatus === LinkAccountVerificationStatus.PENDING_AUTOMATIC_VERIFICATION || account.verificationStatus === LinkAccountVerificationStatus.PENDING_MANUAL_VERIFICATION)
                                ? AccountVerificationStatus.Pending : AccountVerificationStatus.Verified) : AccountVerificationStatus.Verified
                    });
                });
                // perform a mutation to exchange the link token and update the account link with the appropriate account info
                const updateAccountLinkInput: UpdateAccountLinkInput = {
                    id: route.params.currentUserInformation["custom:userId"],
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
                    setIsHeaderOffset(true);

                    // clean the oauth redirect state throughout
                    if(route.params.oauthStateId) {
                        navigation.dispatch({
                            ...CommonActions.setParams({oauthStateId: undefined}),
                            source: route.key
                        });
                        setRedirectURL("");
                    }
                } else {
                    console.log(`Unexpected error while updating link token ${JSON.stringify(accountLinkUpdateResult)}`);
                    // ToDo: need to create a modal with errors
                    // setPasswordErrors([`Unexpected error while updating link token ${linkTokenResult}`]);
                }
            }
        } catch (error) {
            // @ts-ignore
            console.log(error.message ? `Unexpected error while updating link account: ${JSON.stringify(error.message)}` : `Unexpected error while updating link account: ${JSON.stringify(error)}`);
            // ToDo: need to create a modal with errors
            // setPasswordErrors([`Error while linking Bank Account`]);
        }
    }

    // return the component for the Bank Accounts page
    return (
        isPlaidInitialized ?
            <PlaidLink
                oAuthUri={redirectURL}
                linkToken={route.params.oauthStateId ? `${accountLinkDetails!.linkToken!}` : accountLinkDetails!.linkToken!}
                onExit={async (exit: LinkExit) => {
                    // perform a token exchange accordingly
                    await accountLinkUpdate(undefined, exit);
                }}
                onSuccess={async (success: LinkSuccess) => {
                    // perform a token exchange accordingly
                    await accountLinkUpdate(success, undefined);
                }}
                onEvent={undefined}
            />
            :
            <SafeAreaView style={[commonStyles.rowContainer, commonStyles.androidSafeArea]}>
                <View
                    style={[styles.mainView, (headerOffset && headerOffset!) && {marginTop: Dimensions.get('window').height / 13}]}>
                    <View style={styles.titleView}>
                        <Text style={styles.mainTitle}>Bank Accounts</Text>
                    </View>
                    <View style={styles.content}>
                        <List.Section style={styles.listSectionView}>
                            <List.Subheader style={styles.subHeaderTitle}>Connected Accounts</List.Subheader>
                            <Divider
                                style={[commonStyles.divider, {width: Dimensions.get('window').width / 1.15}]}/>
                            <List.Item
                                style={styles.bankItemStyle}
                                titleStyle={styles.bankItemTitle}
                                descriptionStyle={styles.bankItemDetails}
                                titleNumberOfLines={1}
                                descriptionNumberOfLines={2}
                                title="Hurry!"
                                description='Connect your first account below'
                                right={() => <List.Icon color={'red'} icon="exclamation"/>}
                            />
                            {/*<List.Item*/}
                            {/*    style={styles.bankItemStyle}*/}
                            {/*    titleStyle={styles.bankItemTitle}*/}
                            {/*    descriptionStyle={styles.bankItemDetails}*/}
                            {/*    titleNumberOfLines={1}*/}
                            {/*    descriptionNumberOfLines={1}*/}
                            {/*    title="Bank of America"*/}
                            {/*    description='Checking ***2107'*/}
                            {/*    left={() => <List.Icon color={'#2A3779'} icon="bank"/>}*/}
                            {/*    right={() => <List.Icon color={'#2A3779'} icon="chevron-right"/>}*/}
                            {/*/>*/}
                            {/*<Divider style={[commonStyles.divider, {width: Dimensions.get('window').width / 1.15}]}/>*/}
                            {/*<List.Item*/}
                            {/*    style={styles.bankItemStyle}*/}
                            {/*    titleStyle={styles.bankItemTitle}*/}
                            {/*    descriptionStyle={styles.bankItemDetails}*/}
                            {/*    titleNumberOfLines={1}*/}
                            {/*    descriptionNumberOfLines={1}*/}
                            {/*    title="Bank of America"*/}
                            {/*    description='Savings **4506'*/}
                            {/*    left={() => <List.Icon color={'#2A3779'} icon="bank"/>}*/}
                            {/*    right={() => <List.Icon color={'#2A3779'} icon="chevron-right"/>}*/}
                            {/*/>*/}
                            {/*<Divider style={[commonStyles.divider, {width: Dimensions.get('window').width / 1.15}]}/>*/}
                            {/*<List.Item*/}
                            {/*    style={styles.bankItemStyle}*/}
                            {/*    titleStyle={styles.bankItemTitle}*/}
                            {/*    descriptionStyle={styles.bankItemDetails}*/}
                            {/*    titleNumberOfLines={1}*/}
                            {/*    descriptionNumberOfLines={1}*/}
                            {/*    title="Wells Fargo"*/}
                            {/*    description='Saving ***2907'*/}
                            {/*    left={() => <List.Icon color={'#2A3779'} icon="bank"/>}*/}
                            {/*    right={() => <List.Icon color={'#2A3779'} icon="chevron-right"/>}*/}
                            {/*/>*/}
                        </List.Section>
                        <List.Section style={styles.listSectionView}>
                            <List.Subheader style={styles.subHeaderTitle}>Pending Accounts</List.Subheader>
                            <Divider
                                style={[commonStyles.divider, {width: Dimensions.get('window').width / 1.15}]}/>
                            <List.Item
                                style={styles.bankItemStyle}
                                titleStyle={styles.bankItemTitle}
                                descriptionStyle={styles.bankItemDetails}
                                titleNumberOfLines={1}
                                descriptionNumberOfLines={2}
                                title="Great job!"
                                description='No accounts pending verification'
                                right={() => <List.Icon color={'green'} icon="check"/>}
                            />
                        </List.Section>
                    </View>
                    <View style={styles.bottomView}>
                        <Divider style={[commonStyles.divider, {width: Dimensions.get('window').width}]}/>
                        <Button
                            onPress={async () => {
                                // retrieve the Plaid link token if it is not populated
                                await addLinkToken();
                                // initialize Plaid Link
                                setIsPlaidInitialized(true);
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
