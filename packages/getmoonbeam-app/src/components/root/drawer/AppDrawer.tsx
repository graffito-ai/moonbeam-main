import React, {useEffect, useState} from 'react';
import {createDrawerNavigator, DrawerContentComponentProps} from "@react-navigation/drawer";
import {NavigationContainer} from "@react-navigation/native";
import {AppDrawerProps} from "../../../models/props/AuthenticationProps";
import {AppDrawerStackParamList} from "../../../models/props/AppDrawerProps";
import {CustomDrawer} from "../../common/CustomDrawer";
import {Animated, Dimensions, Text} from "react-native";
import {useRecoilState} from "recoil";
import {
    appDrawerHeaderShownState,
    cardLinkingStatusState,
    customBannerShown,
    drawerDashboardState,
    drawerSwipeState,
    profilePictureURIState
} from "../../../recoil/AppDrawerAtom";
import {Home} from "./home/Home";
import {Ionicons} from "@expo/vector-icons";
import * as Device from "expo-device";
import {DeviceType} from "expo-device";
import {deviceTypeState} from "../../../recoil/RootAtom";
import {
    CardLink,
    createdTransaction,
    getCardLink,
    getMilitaryVerificationStatus,
    getTransaction,
    MilitaryVerificationErrorType,
    MilitaryVerificationStatusType,
    MoonbeamTransaction,
    updatedMilitaryVerificationStatus
} from "@moonbeam/moonbeam-models";
import {API, Auth, graphqlOperation} from "aws-amplify";
import {Observable} from "zen-observable-ts";
import {currentUserInformation} from "../../../recoil/AuthAtom";
import {Spinner} from "../../common/Spinner";
import {Dialog, IconButton, Portal} from "react-native-paper";
import {commonStyles} from "../../../styles/common.module";
import {AppWall} from "./home/wall/AppWall";
import {customBannerState} from "../../../recoil/CustomBannerAtom";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// @ts-ignore
import CardLinkingImage from '../../../../assets/art/moonbeam-card-linking.png';
// @ts-ignore
import MoonbeamNavigationLogo from '../../../../assets/moonbeam-navigation-logo.png';
import {Settings} from "./settings/Settings";
import * as Linking from "expo-linking";
import {
    showTransactionBottomSheetState,
    showWalletBottomSheetState,
    transactionDataState
} from "../../../recoil/DashboardAtom";
import {fetchFile} from "../../../utils/File";
import Image = Animated.Image;

/**
 * AppDrawer component.
 *
 * @constructor constructor for the component
 */
export const AppDrawer = ({}: AppDrawerProps) => {
        // constants used to keep track of local component state
        const [isReady, setIsReady] = useState<boolean>(true);
        const [modalVisible, setModalVisible] = useState<boolean>(false);
        const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
        const [, setMilitaryStatusUpdatesSubscription] = useState<ZenObservable.Subscription | null>(null);
        const [militaryStatusUpdatesSubscribed, setMilitaryStatusUpdatesSubscribed] = useState<boolean>(false);
        const [, setTransactionCreatedSubscription] = useState<ZenObservable.Subscription | null>(null);
        const [transactionCreatedSubscribed, setTransactionCreatedSubscribed] = useState<boolean>(false);
        const [userVerified, setUserVerified] = useState<boolean>(false);
        const [cardLinkRetrieved, setCardLinkRetrieved] = useState<boolean>(false);
        const [profilePictureRetrieved, setProfilePictureRetrieved] = useState<boolean>(false);
        const [militaryStatusRetrieved, setMilitaryStatusRetrieved] = useState<boolean>(false);
        const [transactionsRetrieved, setTransactionsRetrieved] = useState<boolean>(false);
        const [isLoaded, setIsLoaded] = useState<boolean>(false);
        const [updatedMilitaryStatus, setUpdatedMilitaryStatus] = useState<MilitaryVerificationStatusType | null>(null);
        // constants used to keep track of shared states
        const [transactionData, setTransactionData] = useRecoilState(transactionDataState);
        const [, setProfilePictureURI] = useRecoilState(profilePictureURIState);
        const [userInformation, setUserInformation] = useRecoilState(currentUserInformation);
        const [drawerHeaderShown,] = useRecoilState(appDrawerHeaderShownState);
        const [deviceType, setDeviceType] = useRecoilState(deviceTypeState);
        const [, setCardLinkingStatus] = useRecoilState(cardLinkingStatusState);
        const [drawerSwipeEnabled,] = useRecoilState(drawerSwipeState);
        const [, setBannerState] = useRecoilState(customBannerState);
        const [, setBannerShown] = useRecoilState(customBannerShown);
        const [drawerInDashboard,] = useRecoilState(drawerDashboardState);
        const [, setShowTransactionsBottomSheet] = useRecoilState(showTransactionBottomSheetState);
        const [, setShowWalletBottomSheet] = useRecoilState(showWalletBottomSheetState);

        /**
         * create a drawer navigator, to be used for our sidebar navigation, which is the main driving
         * navigation of our application.
         */
        const ApplicationDrawer = createDrawerNavigator<AppDrawerStackParamList>();

        // enabling the linking configuration for creating links to the application screens, based on the navigator
        const config = {
            screens: {
                Home: {
                    path: 'home',
                    screens: {
                        DashboardController: {
                            path: 'dashboard'
                        },
                        Marketplace: {
                            path: 'marketplace'
                        },
                        Cards: {
                            path: 'wallet'
                        }
                    }
                },
                Documents: {
                    path: 'documents'
                },
                Settings: {
                    path: 'settings',
                    screens: {
                        SettingsList: {
                            path: 'list'
                        },
                        Profile: {
                            path: 'profile'
                        }
                    }
                },
                Support: {
                    path: 'support'
                }
            },
        };

        /**
         * configuring the navigation linking, based on the types of prefixes that the application supports, given
         * the environment that we deployed the application in.
         * @see https://docs.expo.dev/guides/linking/?redirected
         * @see https://reactnavigation.org/docs/deep-linking/
         */
        const linking = {
            prefixes: [Linking.createURL('/')],
            config,
        };

        /**
         * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
         * auth-related functionality for example), as well as any afferent API calls.
         *
         * Generally speaking, any functionality imperative prior to the full page-load should be
         * included in here.
         */
        useEffect(() => {
            if (userInformation["custom:userId"]) {
                // initial app load
                (!isLoaded && !militaryStatusRetrieved && !cardLinkRetrieved && !profilePictureRetrieved && !transactionsRetrieved)
                && loadAppData(false).then(([updatedUserInformation, updatedTransactionalData, updateProfilePictureURI]) => {
                    // if the retrieved status is verified, set the user as verified, so we bypass the App Wall screen
                    if (updatedUserInformation["militaryStatus"] === MilitaryVerificationStatusType.Verified) {
                        setUserVerified(true);
                    }
                    setIsReady(true);

                    // set the user information, transactional data and profile picture URI accordingly, from what we have loaded
                    setUserInformation(updatedUserInformation);
                    setTransactionData(updatedTransactionalData);
                    setProfilePictureURI(updateProfilePictureURI);
                });

                // incoming military status updates
                (!isLoaded && militaryStatusRetrieved && !cardLinkRetrieved && !profilePictureRetrieved && !transactionsRetrieved)
                && loadAppData(true).then(([updatedUserInformation, updatedTransactionalData, updateProfilePictureURI]) => {
                    setIsReady(true);
                    setUserVerified(true);

                    // set the user information, transactional data and profile picture URI accordingly, from what we have loaded
                    setUserInformation(latestUserInformationValue => {
                        return {
                            ...latestUserInformationValue,
                            linkedCard: updatedUserInformation["linkedCard"]
                        }
                    });
                    setTransactionData(updatedTransactionalData);
                    setProfilePictureURI(updateProfilePictureURI);
                });

                // post app load
                if (isLoaded) {
                    // handle incoming military status changes
                    if (updatedMilitaryStatus !== null) {
                        // load the application data, depending on whether the status was verified or not
                        if (userInformation["militaryStatus"] !== updatedMilitaryStatus && updatedMilitaryStatus === MilitaryVerificationStatusType.Verified) {
                            // set the user military status information accordingly
                            setUserInformation(latestUserInformationValue => {
                                // @link https://legacy.reactjs.org/docs/hooks-reference.html#functional-updates
                                return {
                                    ...latestUserInformationValue,
                                    militaryStatus: updatedMilitaryStatus
                                }
                            });

                            // reset the flags, so we can reload the information that we need
                            setIsLoaded(false);
                            setTransactionsRetrieved(false);
                            setCardLinkRetrieved(false);
                            setProfilePictureRetrieved(false);

                            // reset the status for future updates
                            setUpdatedMilitaryStatus(null);

                            console.log(`new updated user profile object: ${JSON.stringify(userInformation)}`);
                        } else {
                            // the user is not verified
                            setUserVerified(false);

                            // set the user military status information accordingly
                            setUserInformation(latestUserInformationValue => {
                                // @link https://legacy.reactjs.org/docs/hooks-reference.html#functional-updates
                                return {
                                    ...latestUserInformationValue,
                                    militaryStatus: updatedMilitaryStatus
                                }
                            });

                            // reset the status for future updates
                            setUpdatedMilitaryStatus(null);

                            console.log(`new updated user profile object: ${JSON.stringify(userInformation)}`);
                        }
                    }
                }

                // check and set the type of device, to be used throughout the app
                Device.getDeviceTypeAsync().then(deviceType => {
                    setDeviceType(deviceType);
                });
            }
        }, [
            deviceType, userInformation["custom:userId"], isLoaded,
            militaryStatusRetrieved, cardLinkRetrieved, profilePictureRetrieved,
            transactionsRetrieved, updatedMilitaryStatus
        ]);

        /**
         * Function used to load the initial application data, given a user's details.
         *
         * @param militaryStatusAlreadyVerified flag specifying whether the military status subscription
         * and verification needs to take place (since this already does take place at initial load, no
         * matter what)
         *
         * @return a tuple of {@link Object}, {@link MoonbeamTransaction} and {@link string}, representing
         * the user information details retrieved, the user's transactional data retrieved as well as the
         * user's profile picture URI if applicable, to be used when updating the current user information.
         */
        const loadAppData = async (militaryStatusAlreadyVerified: boolean): Promise<[Object, MoonbeamTransaction[], string]> => {
            console.log('in this bitch');
            setIsReady(false);
            setIsLoaded(true);

            let updatedTransactionalData: MoonbeamTransaction[] = [];
            let updatedUserInformation: Object = userInformation;
            let updatedProfilePicture: string = "";
            let militaryStatus: MilitaryVerificationStatusType | 'UNKNOWN' | null = null;

            // only subscribe to military status updates and retrieve the status, if needed
            if (!militaryStatusAlreadyVerified) {
                // subscribe to receiving military status updates
                await subscribeToMilitaryStatusUpdates(userInformation["custom:userId"]);
                setMilitaryStatusUpdatesSubscribed(true);

                // retrieve the military status information
                militaryStatus = await retrieveMilitaryVerification(userInformation["custom:userId"]);
                militaryStatus && setMilitaryStatusRetrieved(true);

                // set the user's military verification status accordingly
                updatedUserInformation = {
                    ...updatedUserInformation,
                    militaryStatus: militaryStatus
                };
            }

            // get the military status, and set the user verified flag accordingly
            if (militaryStatus === MilitaryVerificationStatusType.Verified || militaryStatusAlreadyVerified) {
                // retrieve linked card information for the user
                const linkedCard = await retrieveLinkedCard(userInformation["custom:userId"]);
                setCardLinkRetrieved(true);

                // set the user's card linked object accordingly
                updatedUserInformation = {
                    ...updatedUserInformation,
                    ...(linkedCard !== null && {linkedCard: linkedCard})
                };

                // retrieve the user profile picture
                const profilePictureURI = await retrieveProfilePicture();
                setProfilePictureRetrieved(true);
                updatedProfilePicture = (profilePictureURI !== null && profilePictureURI.length !== 0)
                    ? profilePictureURI
                    : "";

                // retrieve the transactional data for the user
                const retrievedTransactionalData = await retrieveTransactionalData(userInformation["custom:userId"]);
                setTransactionsRetrieved(true);
                updatedTransactionalData = retrievedTransactionalData !== null ? retrievedTransactionalData : [];

                // subscribe to receiving updates about newly created transactions
                await subscribeTransactionsCreatedUpdates(userInformation["custom:userId"]);
                setTransactionCreatedSubscribed(true);

                return [updatedUserInformation, updatedTransactionalData, updatedProfilePicture];
            } else {
                return [updatedUserInformation, updatedTransactionalData, updatedProfilePicture];
            }
        }


        /**
         * Function used to start subscribing to any new transactions thar are created, made through the
         * "createTransaction" mutation, for a specific user id.
         *
         * @param userId userID generated through previous steps during the sign-up process
         * @return a {@link Promise} of a {@link Boolean} representing a flag indicating whether the subscription
         * was successful or not.
         */
        const subscribeTransactionsCreatedUpdates = async (userId: string): Promise<void> => {
            try {
                if (!transactionCreatedSubscribed) {
                    const createdTransactionUpdate = await API.graphql(graphqlOperation(createdTransaction, {id: userId})) as unknown as Observable<any>;
                    // @ts-ignore
                    setTransactionCreatedSubscription(createdTransactionUpdate.subscribe({
                        // function triggering on the next transaction created
                        next: ({value}) => {
                            // check to ensure that there is a value and a valid data block to parse the message from
                            if (value && value.data && value.data.createdTransaction) {
                                // parse the new transaction data from the subscription message received
                                const messageData: MoonbeamTransaction = value.data.createdTransaction.data;

                                // adding the new transactions into the transaction list
                                setTransactionData(latestTransactionData => {
                                    // @link https://legacy.reactjs.org/docs/hooks-reference.html#functional-updates
                                    return latestTransactionData.concat([messageData]);
                                });
                            } else {
                                console.log(`Unexpected error while parsing subscription message for transactions created updates ${JSON.stringify(value)}`);
                                setModalVisible(true);
                            }
                        },
                        // function triggering in case there are any errors
                        error: (error) => {
                            console.log(`Unexpected error while subscribing to transactions created updates ${JSON.stringify(error)} ${error}`);
                            setModalVisible(true);
                        }
                    }));
                }
            } catch (error) {
                console.log(`Unexpected error while building a subscription to observe transactions created updates ${JSON.stringify(error)} ${error}`);
                setModalVisible(true);
            }
        }

        /**
         * Function used to retrieve the individual's transactional data. This data will represent
         * all the user's transactions, from the current time, since they've created an account with
         * us.
         *
         * @param userId userID generated through previous steps during the sign-up process
         * @returns a {@link MoonbeamTransaction[]} representing the card linked object, or {@link null}, representing an error
         */
        const retrieveTransactionalData = async (userId: string): Promise<MoonbeamTransaction[] | null> => {
            try {
                if (!transactionsRetrieved) {
                    // call the get transaction API
                    const retrievedTransactionsResult = await API.graphql(graphqlOperation(getTransaction, {
                        getTransactionInput: {
                            id: userId,
                            // retrieve the current date and time to filter transactions by
                            endDate: new Date().toISOString()
                        }
                    }));

                    // retrieve the data block from the response
                    // @ts-ignore
                    const responseData = retrievedTransactionsResult ? retrievedTransactionsResult.data : null;

                    // check if there are any errors in the returned response
                    if (responseData && responseData.getTransaction.errorMessage === null) {
                        /**
                         * concatenating the incoming transactional data to the existing one and
                         * adding the user's transactions to the transactional object
                         */
                        const updatedTransactionalData = transactionData.concat(responseData.getTransaction.data);

                        // return the transactional data for the user
                        return updatedTransactionalData as MoonbeamTransaction[];
                    } else {
                        /**
                         * if there is no transactional data, we won't be showing the error modal, since for new customers,
                         * and/or existing ones, there's a possibility where there were not transactions being made.
                         */
                        if (responseData.getTransaction.errorType === MilitaryVerificationErrorType.NoneOrAbsent) {
                            return null;
                        } else {
                            console.log(`Unexpected error while retrieving transactional data through the API ${JSON.stringify(retrievedTransactionsResult)}`);
                            setModalVisible(true);

                            return null;
                        }
                    }
                }

                return null;
            } catch (error) {
                console.log(`Unexpected error while attempting to retrieve transactional data ${JSON.stringify(error)} ${error}`);
                setModalVisible(true);

                return null;
            }
        }

        /**
         * Function used to retrieve an individual's card linked object.
         *
         * @param userId userID generated through the previous steps during the sign-up process
         * @returns a {@link CardLink} representing the card linked object, or {@link null}, representing an error
         */
        const retrieveLinkedCard = async (userId: string): Promise<CardLink | null> => {
            try {
                if (!cardLinkRetrieved) {
                    // call the internal card linking status API
                    const retrievedCardLinkingResult = await API.graphql(graphqlOperation(getCardLink, {
                        getCardLinkInput: {
                            id: userId
                        }
                    }));

                    // retrieve the data block from the response
                    // @ts-ignore
                    const responseData = retrievedCardLinkingResult ? retrievedCardLinkingResult.data : null;

                    // check if there are any errors in the returned response
                    if (responseData && responseData.getCardLink.errorMessage === null) {
                        /**
                         * if there are no linked cards for an existing object, then display the banner accordingly.
                         * Whenever a new card is linked successfully, then the status of the card linking will be changed,
                         * and thus, the banner will be hidden.
                         */
                        if (responseData.getCardLink.data.cards.length === 0) {
                            // adding the card linking status accordingly
                            setCardLinkingStatus(false);

                            // set the banner state accordingly
                            setBannerState({
                                bannerVisibilityState: cardLinkingStatusState,
                                bannerMessage: "You currently do not have a linked card to your Moonbeam account. In order to see more dashboard details, you will need to have a card in your wallet. Get started now!",
                                bannerButtonLabel: "Link Now",
                                bannerButtonLabelActionSource: "home/wallet",
                                bannerArtSource: CardLinkingImage,
                                dismissing: false
                            });
                            setBannerShown(true);

                            // returning the linked card object
                            return responseData.getCardLink.data as CardLink;
                        } else {
                            // adding the card linking status accordingly
                            setCardLinkingStatus(true);

                            // set the banner state accordingly
                            setBannerState({
                                bannerVisibilityState: cardLinkingStatusState,
                                bannerMessage: "",
                                bannerButtonLabel: "",
                                bannerButtonLabelActionSource: "",
                                bannerArtSource: CardLinkingImage,
                                dismissing: false
                            });
                            setBannerShown(false);

                            // returning the linked card object
                            return responseData.getCardLink.data as CardLink;
                        }
                    } else {
                        /**
                         * if there is no card linking object retrieved for the user id, then display the banner accordingly.
                         * Whenever a new card is linked successfully, then the status of the card linking will be changed, and thus,
                         * the banner will be hidden.
                         */
                        if (responseData.getCardLink.errorType === MilitaryVerificationErrorType.NoneOrAbsent) {
                            // adding the card linking status accordingly
                            setCardLinkingStatus(false);

                            // set the banner state accordingly
                            setBannerState({
                                bannerVisibilityState: cardLinkingStatusState,
                                bannerMessage: "You currently do not have a linked card to your Moonbeam account. In order to see more dashboard details, you will need to have a card in your wallet. Get started now!",
                                bannerButtonLabel: "Link Now",
                                bannerButtonLabelActionSource: "home/wallet",
                                bannerArtSource: CardLinkingImage,
                                dismissing: false
                            });
                            setBannerShown(true);

                            return null;
                        } else {
                            console.log(`Unexpected error while retrieving the card linking through the API ${JSON.stringify(retrievedCardLinkingResult)}`);
                            setModalVisible(true);

                            return null;
                        }
                    }
                }

                return null;
            } catch (error) {
                console.log(`Unexpected error while attempting to retrieve the card linking object ${JSON.stringify(error)} ${error}`);
                setModalVisible(true);

                return null;
            }
        }

        /**
         * Function used to retrieve the individual's eligibility by checking their
         * military verification status.
         *
         * @param userId userID generated through previous steps during the sign-up process
         * @returns a {@link MilitaryVerificationStatusType} representing the military verification status
         * or {@link null}, representing an error
         */
        const retrieveMilitaryVerification = async (userId: string): Promise<MilitaryVerificationStatusType | 'UNKNOWN' | null> => {
            try {
                if (!militaryStatusRetrieved) {
                    // call the internal military verification status API
                    const retrievedMilitaryVerificationResult = await API.graphql(graphqlOperation(getMilitaryVerificationStatus, {
                        getMilitaryVerificationInput: {
                            id: userId
                        }
                    }));

                    // retrieve the data block from the response
                    // @ts-ignore
                    const responseData = retrievedMilitaryVerificationResult ? retrievedMilitaryVerificationResult.data : null;

                    // check if there are any errors in the returned response
                    if (responseData && responseData.getMilitaryVerificationStatus.errorMessage === null) {
                        // returning the military status
                        return responseData.getMilitaryVerificationStatus.data.militaryVerificationStatus;
                    } else {
                        /**
                         * if there is no military object found for the passed in user id, instead of showing the error modal, set the status in
                         * the user information object to an unknown status, which then triggers the application wall accordingly
                         * in the useEffect() method above.
                         */
                        if (responseData.getMilitaryVerificationStatus.errorType === MilitaryVerificationErrorType.NoneOrAbsent) {
                            // returning the military status
                            return 'UNKNOWN';
                        } else {
                            console.log(`Unexpected error while retrieving the military verification status through the API ${JSON.stringify(retrievedMilitaryVerificationResult)}`);
                            setModalVisible(true);

                            return null;
                        }
                    }
                }
                return null;

            } catch (error) {
                console.log(`Unexpected error while attempting to retrieve the military verification object ${JSON.stringify(error)} ${error}`);
                setModalVisible(true);

                return null;
            }
        }

        /**
         * Function used to start subscribing to any military status updates, made through the
         * "updateMilitaryVerificationStatus" mutation, for a specific user id.
         *
         * @param userId userID generated through previous steps during the sign-up process
         * @return a {@link Promise} of a {@link Boolean} representing a flag indicating whether the subscription
         * was successful or not.
         */
        const subscribeToMilitaryStatusUpdates = async (userId: string): Promise<void> => {
            try {
                if (!militaryStatusUpdatesSubscribed) {
                    const militaryStatusUpdates = await API.graphql(graphqlOperation(updatedMilitaryVerificationStatus, {id: userId})) as unknown as Observable<any>;
                    // @ts-ignore
                    setMilitaryStatusUpdatesSubscription(militaryStatusUpdates.subscribe({
                        // function triggering on the next military verification status update
                        next: ({value}) => {
                            // check to ensure that there is a value and a valid data block to parse the message from
                            if (value && value.data && value.data.updatedMilitaryVerificationStatus && value.data.updatedMilitaryVerificationStatus.militaryVerificationStatus) {
                                // parse the military status data from the subscription message received
                                const militaryStatus: MilitaryVerificationStatusType = value.data.updatedMilitaryVerificationStatus.militaryVerificationStatus;

                                // set the update military status object
                                setUpdatedMilitaryStatus(militaryStatus);
                            } else {
                                console.log(`Unexpected error while parsing subscription message for military status update ${JSON.stringify(value)}`);
                                setModalVisible(true);
                            }
                        },
                        // function triggering in case there are any errors
                        error: (error) => {
                            console.log(`Unexpected error while subscribing to military status updates ${JSON.stringify(error)} ${error}`);
                            setModalVisible(true);
                        }
                    }));
                }
            } catch (error) {
                console.log(`Unexpected error while building a subscription to observe military status updates ${JSON.stringify(error)} ${error}`);
                setModalVisible(true);
            }
        }

        /**
         * Function used to retrieve an existing profile picture for the user, if any.
         *
         * @return a {@link string} or null, representing the retrieved picture URI or indicating
         * that an error occurred
         */
        const retrieveProfilePicture = async (): Promise<string | null> => {
            try {
                if (!profilePictureRetrieved) {
                    // retrieve the identity id for the current user
                    const userCredentials = await Auth.currentUserCredentials();

                    // fetch the profile picture URI from storage and/or cache
                    const [returnFlag, profilePictureURI] = await fetchFile('profile_picture.png', true,
                        true, true, userCredentials["identityId"]);
                    if (!returnFlag || profilePictureURI === null) {
                        // for any error we just want to print them out, and not set any profile picture, and show the default avatar instead
                        console.log(`Unable to retrieve new profile picture!`);

                        return null;
                    } else {
                        // return the profile picture URI
                        return profilePictureURI;
                    }
                }
                return null;
            } catch (error) {
                // for any error we just want to print them out, and not set any profile picture, and show the default avatar instead
                const errorMessage = `Error while retrieving profile picture!`;
                console.log(`${errorMessage} - ${error}`);

                return null;
            }
        }

        // return the component for the AppDrawer page
        return (
            <>
                {
                    !isReady ?
                        <Spinner loadingSpinnerShown={loadingSpinnerShown} setLoadingSpinnerShown={setLoadingSpinnerShown}/>
                        :
                        <>
                            <Portal>
                                <Dialog style={commonStyles.dialogStyle} visible={modalVisible}
                                        onDismiss={() => setModalVisible(false)}>
                                    <Dialog.Icon icon="alert" color={"#F2FF5D"}
                                                 size={Dimensions.get('window').height / 14}/>
                                    <Dialog.Title style={commonStyles.dialogTitle}>We hit a snag!</Dialog.Title>
                                    <Dialog.Content>
                                        <Text
                                            style={commonStyles.dialogParagraph}>{`Unexpected error while loading application!`}</Text>
                                    </Dialog.Content>
                                </Dialog>
                            </Portal>
                            {/*@ts-ignore*/}
                            <NavigationContainer independent={true}
                                                 linking={linking}
                                                 fallback={
                                                     <Spinner loadingSpinnerShown={loadingSpinnerShown}
                                                              setLoadingSpinnerShown={setLoadingSpinnerShown}/>
                                                 }>
                                <ApplicationDrawer.Navigator
                                    drawerContent={(props) => {
                                        const filteredProps: DrawerContentComponentProps = {
                                            ...props,
                                            state: {
                                                ...props.state,
                                                // hide the App Wall from drawer content, when the user is verified
                                                routes: !userVerified ?
                                                    props.state.routes
                                                    : props.state.routes.filter((route) => route.name !== 'AppWall')
                                            }
                                        }
                                        return(<CustomDrawer {...filteredProps} />);
                                    }}
                                    initialRouteName={!userVerified ? "AppWall" : "Home"}
                                    screenOptions={({navigation}) => ({
                                        headerLeft: () => <IconButton icon={'menu'} iconColor={'#FFFFFF'}
                                                                      size={deviceType === DeviceType.TABLET ? Dimensions.get('window').height / 38 : Dimensions.get('window').height / 28}
                                                                      onPress={() => {
                                                                          setShowTransactionsBottomSheet(false);
                                                                          setShowWalletBottomSheet(false);
                                                                          navigation.openDrawer();
                                                                      }}/>,
                                        ...(drawerInDashboard && {
                                            headerRight: () => <IconButton icon={'bell'} iconColor={'#FFFFFF'}
                                                                           size={deviceType === DeviceType.TABLET ? Dimensions.get('window').height / 38 : Dimensions.get('window').height / 28}
                                                                           onPress={() => {
                                                                               // ToDo: need to go to the notifications screen
                                                                           }}/>,
                                        }),
                                        headerTitle: () =>
                                            <Image resizeMode={"contain"}
                                                   style={[{alignSelf: 'center'},
                                                       deviceType === DeviceType.TABLET
                                                           ? {
                                                               width: Dimensions.get('window').width / 22,
                                                               height: Dimensions.get('window').height / 22
                                                           }
                                                           : {
                                                               width: Dimensions.get('window').width / 12,
                                                               height: Dimensions.get('window').height / 12
                                                           }]}
                                                   source={MoonbeamNavigationLogo}
                                            />,
                                        headerStyle: drawerInDashboard ? {
                                            backgroundColor: '#5B5A5A',
                                            shadowColor: 'transparent', // this covers iOS
                                            elevation: 0, // this covers Android
                                        } : {
                                            backgroundColor: '#313030'
                                        },
                                        drawerLabelStyle: {
                                            fontFamily: 'Raleway-Medium',
                                            fontSize: deviceType === DeviceType.TABLET ? Dimensions.get('window').width / 35 : Dimensions.get('window').width / 25
                                        },
                                        drawerActiveBackgroundColor: 'transparent',
                                        drawerActiveTintColor: '#F2FF5D',
                                        drawerInactiveTintColor: 'white',
                                        swipeEnabled: false,
                                        drawerStyle: {
                                            width: deviceType === DeviceType.TABLET ? Dimensions.get('window').width / 2 : Dimensions.get('window').width / 1.5,
                                            backgroundColor: '#5B5A5A'
                                        },
                                    })}
                                >
                                    <ApplicationDrawer.Screen
                                        name={"Home"}
                                        component={Home}
                                        options={{
                                            swipeEnabled: drawerSwipeEnabled,
                                            drawerItemStyle: {marginBottom: deviceType === DeviceType.TABLET ? 20 : 0},
                                            drawerIcon: () => (
                                                <Icon
                                                    size={deviceType === DeviceType.TABLET ? Dimensions.get('window').width / 25 : Dimensions.get('window').width / 15}
                                                    name={'home-variant-outline'} color={'#F2FF5D'}/>
                                            ),
                                            headerShown: drawerHeaderShown
                                        }}
                                        initialParams={{}}
                                    />
                                    <ApplicationDrawer.Screen
                                        name={"Documents"}
                                        component={() => <></>}
                                        initialParams={{}}
                                        options={{
                                            swipeEnabled: true,
                                            drawerItemStyle: {marginBottom: deviceType === DeviceType.TABLET ? 20 : 0},
                                            drawerIcon: () => (
                                                <Icon
                                                    size={deviceType === DeviceType.TABLET ? Dimensions.get('window').width / 25 : Dimensions.get('window').width / 15}
                                                    name={'file-document-multiple-outline'} color={'#F2FF5D'}/>
                                            ),
                                            headerShown: drawerHeaderShown
                                        }}
                                    />
                                    <ApplicationDrawer.Screen
                                        name={"Settings"}
                                        component={Settings}
                                        options={{
                                            swipeEnabled: drawerSwipeEnabled,
                                            drawerItemStyle: {marginBottom: deviceType === DeviceType.TABLET ? 20 : 0},
                                            drawerIcon: () => (
                                                <Ionicons
                                                    size={deviceType === DeviceType.TABLET ? Dimensions.get('window').width / 25 : Dimensions.get('window').width / 15}
                                                    name={'settings-outline'} color={'#F2FF5D'}/>
                                            ),
                                            headerShown: drawerHeaderShown
                                        }}
                                        initialParams={{}}
                                    />
                                    <ApplicationDrawer.Screen
                                        name={"Support"}
                                        component={() => <></>}
                                        initialParams={{}}
                                        options={{
                                            swipeEnabled: true,
                                            drawerItemStyle: {marginBottom: deviceType === DeviceType.TABLET ? 20 : 0},
                                            drawerIcon: () => (
                                                <Icon
                                                    size={deviceType === DeviceType.TABLET ? Dimensions.get('window').width / 25 : Dimensions.get('window').width / 15}
                                                    name={'help-circle-outline'} color={'#F2FF5D'}/>
                                            ),
                                            headerShown: drawerHeaderShown
                                        }}
                                    />
                                    <ApplicationDrawer.Screen
                                        name={"AppWall"}
                                        component={AppWall}
                                        initialParams={{}}
                                        options={{
                                            swipeEnabled: false,
                                            drawerItemStyle: {marginBottom: deviceType === DeviceType.TABLET ? 20 : 0},
                                            drawerIcon: () => (
                                                <Icon
                                                    size={deviceType === DeviceType.TABLET ? Dimensions.get('window').width / 25 : Dimensions.get('window').width / 15}
                                                    name={'wall'} color={'#F2FF5D'}/>
                                            ),
                                            header: () => {
                                                return (<></>)
                                            },
                                            headerShown: false
                                        }}
                                    />
                                </ApplicationDrawer.Navigator>
                            </NavigationContainer>
                        </>
                }
            </>
        );
    }
;
