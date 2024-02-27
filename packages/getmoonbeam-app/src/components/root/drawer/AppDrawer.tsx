import React, {useEffect, useState} from 'react';
import {createDrawerNavigator} from "@react-navigation/drawer";
import {AppDrawerProps} from "../../../models/props/AuthenticationProps";
import {AppDrawerStackParamList} from "../../../models/props/AppDrawerProps";
import {CustomDrawer} from "../../common/CustomDrawer";
import {Animated, Text, TouchableOpacity, View} from "react-native";
import {useRecoilState} from "recoil";
import {
    appDrawerHeaderShownState,
    cardLinkingIdState,
    cardLinkingStatusState,
    customBannerShown,
    drawerDashboardState,
    drawerSwipeState,
    profilePictureURIState
} from "../../../recoil/AppDrawerAtom";
import {Home} from "./home/Home";
import * as Device from "expo-device";
import {deviceTypeState} from "../../../recoil/RootAtom";
import {
    CardLink,
    createdTransaction,
    FileAccessLevel,
    FileType,
    getCardLink,
    getFilesForUser,
    getMilitaryVerificationStatus,
    getTransaction,
    LoggingLevel,
    MilitaryVerificationErrorType,
    MilitaryVerificationStatusType,
    MoonbeamTransaction,
    MoonbeamUpdatedTransaction,
    updatedMilitaryVerificationStatus,
    updatedTransaction,
} from "@moonbeam/moonbeam-models";
import {API, Auth, graphqlOperation} from "aws-amplify";
import {Observable} from "zen-observable-ts";
import {
    currentUserInformation,
    expoPushTokenState,
    globalAmplifyCacheState,
    userIsAuthenticatedState
} from "../../../recoil/AuthAtom";
import {Spinner} from "../../common/Spinner";
import {Dialog, IconButton, Portal} from "react-native-paper";
import {commonStyles} from "../../../styles/common.module";
import {AppWall} from "./home/wall/AppWall";
import {customBannerState} from "../../../recoil/CustomBannerAtom";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Divider, Icon as ReactIcon} from "@rneui/base";
// @ts-ignore
import CardLinkingImage from '../../../../assets/art/moonbeam-card-linking.png';
// @ts-ignore
import MoonbeamNavigationLogo from '../../../../assets/moonbeam-navigation-logo.png';
import {Settings} from "./settings/Settings";
import {
    showTransactionBottomSheetState,
    showWalletBottomSheetState,
    transactionDataState
} from "../../../recoil/DashboardAtom";
import {fetchFile} from "../../../utils/File";
import {Documents} from './documents/Documents';
import {DocumentsViewer} from "../../common/DocumentsViewer";
import {Support} from "./support/Support";
import {createPhysicalDevice, logEvent, proceedWithDeviceCreation, retrieveCardLinkingId} from "../../../utils/AppSync";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {Referral} from "./home/referrals/Referral";
import Constants from 'expo-constants';
import {AppOwnership} from "expo-constants/src/Constants.types";
import {showClickOnlyBottomSheetState} from "../../../recoil/StoreOfferAtom";
import {ReimbursementsController} from "./home/dashboard/reimbursements/ReimbursementsController";
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
        const [, setTransactionUpdatedSubscription] = useState<ZenObservable.Subscription | null>(null);
        const [transactionUpdatedSubscribed, setTransactionUpdatedSubscribed] = useState<boolean>(false);
        const [userVerified, setUserVerified] = useState<boolean>(false);
        const [cardLinkRetrieved, setCardLinkRetrieved] = useState<boolean>(false);
        const [profilePictureRetrieved, setProfilePictureRetrieved] = useState<boolean>(false);
        const [cardLinkingIdRetrieved, setCardLinkingIdRetrieved] = useState<boolean>(false);
        const [militaryStatusRetrieved, setMilitaryStatusRetrieved] = useState<boolean>(false);
        const [transactionsRetrieved, setTransactionsRetrieved] = useState<boolean>(false);
        const [isLoaded, setIsLoaded] = useState<boolean>(false);
        const [updatedMilitaryStatus, setUpdatedMilitaryStatus] = useState<MilitaryVerificationStatusType | null>(null);
        // constants used to keep track of shared states
        const [userIsAuthenticated,] = useRecoilState(userIsAuthenticatedState);
        const [expoPushToken,] = useRecoilState(expoPushTokenState);
        const [globalCache,] = useRecoilState(globalAmplifyCacheState);
        const [transactionData, setTransactionData] = useRecoilState(transactionDataState);
        const [, setCardLinkingId] = useRecoilState(cardLinkingIdState);
        const [userInformation, setUserInformation] = useRecoilState(currentUserInformation);
        const [drawerHeaderShown,] = useRecoilState(appDrawerHeaderShownState);
        const [deviceType, setDeviceType] = useRecoilState(deviceTypeState);
        const [, setCardLinkingStatus] = useRecoilState(cardLinkingStatusState);
        const [drawerSwipeEnabled,] = useRecoilState(drawerSwipeState);
        const [, setBannerState] = useRecoilState(customBannerState);
        const [, setBannerShown] = useRecoilState(customBannerShown);
        const [drawerInDashboard,] = useRecoilState(drawerDashboardState);
        const [showTransactionsBottomSheet, setShowTransactionsBottomSheet] = useRecoilState(showTransactionBottomSheetState);
        const [, setShowWalletBottomSheet] = useRecoilState(showWalletBottomSheetState);
        const [, setShowClickOnlyBottomSheet] = useRecoilState(showClickOnlyBottomSheetState);
        const [, setProfilePictureURI] = useRecoilState(profilePictureURIState);

        /**
         * create a drawer navigator, to be used for our sidebar navigation, which is the main driving
         * navigation of our application.
         */
        const ApplicationDrawer = createDrawerNavigator<AppDrawerStackParamList>();

        /**
         * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
         * auth-related functionality for example), as well as any afferent API calls.
         *
         * Generally speaking, any functionality imperative prior to the full page-load should be
         * included in here.
         */
        useEffect(() => {
            // pre AppDrawer Load
            if (!isLoaded) {
                setIsLoaded(true);

                // check and set the type of device, to be used throughout the app
                Device.getDeviceTypeAsync().then(deviceType => {
                    setDeviceType(deviceType);
                });

                // if a valid use is logged in/ and we have a valid user id
                if (userInformation["custom:userId"]) {
                    // initial app load
                    (!militaryStatusRetrieved && !cardLinkRetrieved && !profilePictureRetrieved && !transactionsRetrieved)
                    && loadAppData(false).then(([updatedUserInformation, updatedTransactionalData]) => {
                        // if the retrieved status is verified, set the user as verified, so we bypass the App Wall screen
                        if (updatedUserInformation["militaryStatus"] === MilitaryVerificationStatusType.Verified) {
                            setUserVerified(true);
                        }
                        setIsReady(true);

                        // subscribe to receiving military status updates
                        subscribeToMilitaryStatusUpdates(userInformation["custom:userId"]).then(() => setMilitaryStatusUpdatesSubscribed(true));

                        // subscribe to receiving updates about newly created transactions
                        subscribeTransactionsCreatedUpdates(userInformation["custom:userId"]).then(() => setTransactionCreatedSubscribed(true));

                        // subscribe to receiving updates about newly updated transactions
                        subscribeTransactionUpdatedUpdates(userInformation["custom:userId"]).then(() => setTransactionUpdatedSubscribed(true));

                        /**
                         * we then check whether we should proceed with the creation of a new physical device, or not.
                         * (only if we are not running the app in Expo Go)
                         */
                        Constants.appOwnership !== AppOwnership.Expo && expoPushToken.data.length !== 0 &&
                        proceedWithDeviceCreation(userInformation["custom:userId"], expoPushToken.data).then((proceedWithDeviceCreationFlag) => {
                            if (proceedWithDeviceCreationFlag) {
                                // if so, we create the physical device accordingly (and associated to the new user)
                                createPhysicalDevice(userInformation["custom:userId"], expoPushToken.data).then((physicalDeviceCreationFlag) => {
                                    if (physicalDeviceCreationFlag) {
                                        const message = `Successfully created a physical device for user!`;
                                        console.log(message);
                                        logEvent(message, LoggingLevel.Info, userIsAuthenticated).then(() => {
                                        });
                                    } else {
                                        const message = `Unable to create a physical device for user!`;
                                        console.log(message);
                                        logEvent(message, LoggingLevel.Warning, userIsAuthenticated).then(() => {
                                        });
                                    }
                                });
                            } else {
                                const message = `Not necessary to create a physical device for user!`;
                                console.log(message);
                                logEvent(message, LoggingLevel.Warning, userIsAuthenticated).then(() => {
                                });
                            }
                        });

                        // set the user information, transactional data and profile picture URI accordingly, from what we have loaded
                        setUserInformation(updatedUserInformation);
                        setTransactionData(updatedTransactionalData);
                        loadProfilePicture().then(_ => {
                        });
                        loadCardLinkingId().then(_ => {
                        });
                    });
                }
            }
            // post AppDrawer Load
            else {
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

                        // handle incoming military status updates, by re-loading data accordingly
                        loadAppData(true).then(([updatedUserInformation, updatedTransactionalData]) => {
                            setIsReady(true);
                            setUserVerified(true);

                            /**
                             * we then check whether we should proceed with the creation of a new physical device, or not.
                             * (only if we are not running the app in Expo Go)
                             */
                            Constants.appOwnership !== AppOwnership.Expo && expoPushToken.data.length !== 0 &&
                            proceedWithDeviceCreation(userInformation["custom:userId"], expoPushToken.data).then((proceedWithDeviceCreationFlag) => {
                                if (proceedWithDeviceCreationFlag) {
                                    // if so, we create the physical device accordingly (and associated to the new user)
                                    createPhysicalDevice(userInformation["custom:userId"], expoPushToken.data).then((physicalDeviceCreationFlag) => {
                                        if (physicalDeviceCreationFlag) {
                                            const message = `Successfully created a physical device for user!`;
                                            console.log(message);
                                            logEvent(message, LoggingLevel.Info, userIsAuthenticated).then(() => {
                                            });
                                        } else {
                                            const message = `Unable to create a physical device for user!`;
                                            console.log(message);
                                            logEvent(message, LoggingLevel.Warning, userIsAuthenticated).then(() => {
                                            });
                                        }
                                    });
                                } else {
                                    const message = `Not necessary to create a physical device for user!`;
                                    console.log(message);
                                    logEvent(message, LoggingLevel.Warning, userIsAuthenticated).then(() => {
                                    });
                                }
                            });

                            // set the user information, transactional data and profile picture URI accordingly, from what we have loaded
                            setUserInformation(latestUserInformationValue => {
                                return {
                                    ...latestUserInformationValue,
                                    linkedCard: updatedUserInformation["linkedCard"]
                                }
                            });
                            setTransactionData(updatedTransactionalData);
                            loadProfilePicture().then(_ => {
                            });
                            loadCardLinkingId().then(_ => {
                            });
                        });

                        // reset the status for future updates
                        setUpdatedMilitaryStatus(null);
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
                    }
                }
            }


            /**
             * Function used to load the card linking id for the logged-in user
             */
            const loadCardLinkingId = async () => {
                if (!cardLinkingIdRetrieved) {
                    /**
                     * retrieve the user's card linking id - attempt to retrieve it from cache first
                     */
                    let cardLinkingId: string;
                    if (globalCache && await globalCache!.getItem(`${userInformation["custom:userId"]}-cardLinkingId`) !== null) {
                        const message = 'card linking id is cached';
                        console.log(message);
                        await logEvent(message, LoggingLevel.Info, userIsAuthenticated);

                        cardLinkingId = await globalCache!.getItem(`${userInformation["custom:userId"]}-cardLinkingId`);
                    } else {
                        const message = 'card linking id is not cached';
                        console.log(message);
                        await logEvent(message, LoggingLevel.Info, userIsAuthenticated);

                        cardLinkingId = await retrieveCardLinkingId(userInformation["custom:userId"]);
                        globalCache && globalCache!.setItem(`${userInformation["custom:userId"]}-cardLinkingId`, cardLinkingId);
                    }
                    setCardLinkingIdRetrieved(true);
                    setCardLinkingId(cardLinkingId);
                }
            }

            /**
             * Function used to load the profile picture for the logged-in user
             */
            const loadProfilePicture = async () => {
                if (!profilePictureRetrieved) {
                    /**
                     * retrieve the user profile picture - attempt to retrieve it from cache first
                     *
                     * We handle clearing and/or updating the cache in the Profile component
                     */
                    let profilePictureURI: string | null;
                    if (globalCache && await globalCache!.getItem(`${userInformation["custom:userId"]}-profilePictureURI`) !== null) {
                        const message = 'profile picture is cached';
                        console.log(message);
                        await logEvent(message, LoggingLevel.Info, userIsAuthenticated);

                        profilePictureURI = await globalCache!.getItem(`${userInformation["custom:userId"]}-profilePictureURI`);
                    } else {
                        const message = 'profile picture is not cached';
                        console.log(message);
                        await logEvent(message, LoggingLevel.Info, userIsAuthenticated);

                        profilePictureURI = await retrieveProfilePicture();
                        globalCache && globalCache!.setItem(`${userInformation["custom:userId"]}-profilePictureURI`, profilePictureURI !== null && profilePictureURI.length !== 0 ? profilePictureURI : "")
                    }
                    setProfilePictureRetrieved(true);
                    setProfilePictureURI(profilePictureURI !== null && profilePictureURI.length !== 0
                        ? profilePictureURI
                        : "");
                }
            }
        }, [
            deviceType, userInformation["custom:userId"], isLoaded,
            userInformation["given_name"], userInformation["family_name"],
            militaryStatusRetrieved, cardLinkRetrieved, profilePictureRetrieved,
            transactionsRetrieved, updatedMilitaryStatus, cardLinkingIdRetrieved
        ]);

        /**
         * Function used to load the initial application data, given a user's details.
         *
         * @param militaryStatusAlreadyVerified flag specifying whether the military status subscription
         * and verification needs to take place (since this already does take place at initial load, no
         * matter what)
         *
         * @return a tuple of {@link Object} - {@link Array} of {@link MoonbeamTransaction} and {@link Object}, representing
         * the user information details retrieved, the user's transactional data retrieved as well as the
         * user's profile picture URI if applicable, to be used when updating the current user information.
         */
        const loadAppData = async (militaryStatusAlreadyVerified: boolean): Promise<[Object, MoonbeamTransaction[]]> => {
            /**
             * remove any card linking caching previous users had,
             * since it causes issues with linking cards across multiple devices, and we added request/response caching.
             */
            await globalCache!.removeItem(`${userInformation["custom:userId"]}-linkedCard`);
            await globalCache!.removeItem(`${userInformation["custom:userId"]}-linkedCardFlag`);

            setIsReady(false);
            setIsLoaded(true);

            let updatedTransactionalData: MoonbeamTransaction[] = [];
            let updatedUserInformation: Object = userInformation;
            let militaryStatus: MilitaryVerificationStatusType | 'UNKNOWN' | 'NEEDS_DOCUMENT_UPLOAD' | null = null;

            // only subscribe to military status updates and retrieve the status, if needed
            if (!militaryStatusAlreadyVerified) {
                /**
                 * retrieve the military status information - attempt to retrieve it from cache first
                 *
                 * We keep the successful military verification status of a user for a year. For people
                 * not verified we don't cache this.
                 */
                if (globalCache && await globalCache!.getItem(`${userInformation["custom:userId"]}-militaryStatus`) !== null) {
                    const message = 'military status is cached';
                    console.log(message);
                    await logEvent(message, LoggingLevel.Info, userIsAuthenticated);

                    militaryStatus = await globalCache!.getItem(`${userInformation["custom:userId"]}-militaryStatus`);
                    userInformation["militaryStatus"] = militaryStatus;
                } else {
                    const message = 'military status is not cached';
                    console.log(message);
                    await logEvent(message, LoggingLevel.Info, userIsAuthenticated);

                    militaryStatus = await retrieveMilitaryVerification(userInformation["custom:userId"]);
                    militaryStatus === MilitaryVerificationStatusType.Verified && globalCache && globalCache!.setItem(`${userInformation["custom:userId"]}-militaryStatus`, militaryStatus);
                    userInformation["militaryStatus"] = militaryStatus;
                }
                militaryStatus && setMilitaryStatusRetrieved(true);

                // set the user's military verification status accordingly
                updatedUserInformation = {
                    ...updatedUserInformation,
                    militaryStatus: militaryStatus
                };
            }

            /**
             * get the military status from passed in subscription through flag, or existing status,
             * and set the transactions and card-link data accordingly.
             */
            if (militaryStatus === MilitaryVerificationStatusType.Verified || militaryStatusAlreadyVerified) {
                /**
                 * retrieve linked card information for the user, only if we have not done so already
                 */
                const linkedCard = await retrieveLinkedCard(userInformation["custom:userId"]);
                /**
                 * if there is no linked card object or if there are no linked cards for an existing object,
                 * then display the banner accordingly.
                 *
                 * Whenever a new card is linked successfully, then the status of the card linking will be changed,
                 * and thus, the banner will be hidden.
                 */
                if (linkedCard === null || (linkedCard && linkedCard!.cards.length === 0)) {
                    // adding the card linking status accordingly
                    setCardLinkingStatus(false);

                    // set the banner state accordingly
                    setBannerState({
                        bannerVisibilityState: cardLinkingStatusState,
                        bannerMessage: "You do not have a linked card. You will need to have a linked-card in your wallet to see more transaction details.",
                        bannerButtonLabel: "Link Now",
                        bannerButtonLabelActionSource: "home/wallet",
                        bannerArtSource: CardLinkingImage,
                        dismissing: false
                    });
                    setBannerShown(true);
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
                }

                // set the user's card linked object accordingly
                updatedUserInformation = {
                    ...updatedUserInformation,
                    ...(linkedCard !== null && {linkedCard: linkedCard})
                };

                // retrieve the transactional data for the user
                const retrievedTransactionalData = await retrieveTransactionalData(userInformation["custom:userId"]);
                setTransactionsRetrieved(true);
                updatedTransactionalData = retrievedTransactionalData !== null ? retrievedTransactionalData : [];

                return [updatedUserInformation, updatedTransactionalData];
            } else {
                return [updatedUserInformation, updatedTransactionalData];
            }
        }

        /**
         * Function used to start subscribing to any new transactions that are updated, made through the
         * "updateTransaction" mutation, for a specific user id.
         *
         * @param userId userID generated through previous steps during the sign-up process
         * @return a {@link Promise} of a {@link Boolean} representing a flag indicating whether the subscription
         * was successful or not.
         */
        const subscribeTransactionUpdatedUpdates = async (userId: string): Promise<void> => {
            try {
                if (!transactionUpdatedSubscribed) {
                    const updatedTransactionUpdate = await API.graphql(graphqlOperation(updatedTransaction, {id: userId})) as unknown as Observable<any>;
                    // @ts-ignore
                    setTransactionUpdatedSubscription(updatedTransactionUpdate.subscribe({
                        // function triggering on the next transaction updated
                        next: async ({value}) => {
                            // check to ensure that there is a value and a valid data block to parse the message from
                            if (value && value.data && value.data.updatedTransaction) {
                                // parse the new updated transaction data from the subscription message received
                                const messageData: MoonbeamUpdatedTransaction = value.data.updatedTransaction.data;
                                // updating the specific transaction details, accordingly
                                setTransactionData(latestTransactionData => {
                                    const newTransactionList: MoonbeamTransaction[] = [];
                                    latestTransactionData.forEach(transaction => {
                                        const newTransaction: MoonbeamTransaction = transaction;
                                        if (newTransaction.id === messageData.id && newTransaction.transactionId === messageData.transactionId) {
                                            // update the updated at and status values
                                            newTransactionList.push({
                                                brandId: newTransaction.brandId,
                                                cardId: newTransaction.cardId,
                                                category: newTransaction.category,
                                                createdAt: newTransaction.createdAt,
                                                creditedCashbackAmount: newTransaction.creditedCashbackAmount,
                                                currencyCode: newTransaction.currencyCode,
                                                id: newTransaction.id,
                                                memberId: newTransaction.memberId,
                                                pendingCashbackAmount: newTransaction.pendingCashbackAmount,
                                                rewardAmount: newTransaction.rewardAmount,
                                                storeId: newTransaction.storeId,
                                                timestamp: newTransaction.timestamp,
                                                totalAmount: newTransaction.totalAmount,
                                                transactionBrandAddress: newTransaction.transactionBrandAddress,
                                                transactionBrandLogoUrl: newTransaction.transactionBrandLogoUrl,
                                                transactionBrandName: newTransaction.transactionBrandName,
                                                transactionBrandURLAddress: newTransaction.transactionBrandURLAddress,
                                                transactionId: newTransaction.transactionId,
                                                transactionIsOnline: newTransaction.transactionIsOnline,
                                                transactionStatus: messageData.transactionStatus,
                                                transactionType: newTransaction.transactionType,
                                                updatedAt: messageData.updatedAt
                                            })
                                        } else {
                                            newTransactionList.push(newTransaction);
                                        }
                                    });
                                    // @link https://legacy.reactjs.org/docs/hooks-reference.html#functional-updates
                                    return [...newTransactionList];
                                });
                            } else {
                                const message = `Unexpected error while parsing subscription message for transactions updated updates ${JSON.stringify(value)}`;
                                console.log(message);
                                await logEvent(message, LoggingLevel.Error, userIsAuthenticated);

                                setModalVisible(true);
                            }
                        },
                        // function triggering in case there are any errors
                        error: async (error) => {
                            const message = `Unexpected error while subscribing to transactions updated updates ${JSON.stringify(error)} ${error}`;
                            console.log(message);
                            await logEvent(message, LoggingLevel.Error, userIsAuthenticated);

                            setModalVisible(true);
                        }
                    }));
                }
            } catch (error) {
                const message = `Unexpected error while building a subscription to observe transactions updated updates ${JSON.stringify(error)} ${error}`;
                console.log(message);
                await logEvent(message, LoggingLevel.Error, userIsAuthenticated);

                setModalVisible(true);
            }
        }

        /**
         * Function used to start subscribing to any new transactions that are created, made through the
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
                        next: async ({value}) => {
                            // check to ensure that there is a value and a valid data block to parse the message from
                            if (value && value.data && value.data.createdTransaction) {
                                // parse the new transaction data from the subscription message received
                                const messageData: MoonbeamTransaction = value.data.createdTransaction.data;
                                // adding the new transactions into the transaction list
                                setTransactionData(latestTransactionData => {
                                    // @link https://legacy.reactjs.org/docs/hooks-reference.html#functional-updates
                                    return [...latestTransactionData, messageData];
                                });
                            } else {
                                const message = `Unexpected error while parsing subscription message for transactions created updates ${JSON.stringify(value)}`;
                                console.log(message);
                                await logEvent(message, LoggingLevel.Error, userIsAuthenticated);

                                setModalVisible(true);
                            }
                        },
                        // function triggering in case there are any errors
                        error: async (error) => {
                            const message = `Unexpected error while subscribing to transactions created updates ${JSON.stringify(error)} ${error}`;
                            console.log(message);
                            await logEvent(message, LoggingLevel.Error, userIsAuthenticated);

                            setModalVisible(true);
                        }
                    }));
                }
            } catch (error) {
                const message = `Unexpected error while building a subscription to observe transactions created updates ${JSON.stringify(error)} ${error}`;
                console.log(message);
                await logEvent(message, LoggingLevel.Error, userIsAuthenticated);

                setModalVisible(true);
            }
        }

        /**
         * Function used to retrieve the individual's transactional data. This data will represent
         * all the user's transactions, from the current time, since they've created an account with
         * us.
         *
         * @param userId userID generated through previous steps during the sign-up process
         * @returns a {@link Array} of {@link MoonbeamTransaction} representing the card linked object, or {@link null}, representing an error
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
                        const updatedTransactionalData = [...transactionData, ...responseData.getTransaction.data];

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
                            const message = `Unexpected error while retrieving transactional data through the API ${JSON.stringify(retrievedTransactionsResult)}`;
                            console.log(message);
                            await logEvent(message, LoggingLevel.Error, userIsAuthenticated);

                            setModalVisible(true);

                            return null;
                        }
                    }
                }

                return null;
            } catch (error) {
                const message = `Unexpected error while attempting to retrieve transactional data ${JSON.stringify(error)} ${error}`;
                console.log(message);
                await logEvent(message, LoggingLevel.Error, userIsAuthenticated);

                setModalVisible(true);

                return null;
            }
        }

        /**
         * Function used to retrieve an individual's card linked object.
         *
         * @param userId userID generated through the previous steps during the sign-up process
         * @returns a {@link CardLink} representing the card linked object, or {@link null}, representing an error
         * or an absent card.
         */
        const retrieveLinkedCard = async (userId: string): Promise<CardLink | null> => {
            try {
                if (!cardLinkRetrieved) {
                    setCardLinkRetrieved(true);

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
                                bannerMessage: "You do not have a linked card. You will need to have a linked-card in your wallet to see more transaction details.",
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
                                bannerMessage: "You do not have a linked card. You will need to have a linked-card in your wallet to see more transaction details.",
                                bannerButtonLabel: "Link Now",
                                bannerButtonLabelActionSource: "home/wallet",
                                bannerArtSource: CardLinkingImage,
                                dismissing: false
                            });
                            setBannerShown(true);

                            return null;
                        } else {
                            const message = `Unexpected error while retrieving the card linking through the API ${JSON.stringify(retrievedCardLinkingResult)}`;
                            console.log(message);
                            await logEvent(message, LoggingLevel.Error, userIsAuthenticated);

                            setModalVisible(true);

                            return null;
                        }
                    }
                } else {
                    return null;
                }
            } catch (error) {
                const message = `Unexpected error while attempting to retrieve the card linking object ${JSON.stringify(error)} ${error}`;
                console.log(message);
                await logEvent(message, LoggingLevel.Error, userIsAuthenticated);

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
        const retrieveMilitaryVerification = async (userId: string): Promise<MilitaryVerificationStatusType | 'UNKNOWN' | 'NEEDS_DOCUMENT_UPLOAD' | null> => {
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
                        /**
                         * If there is a military status existent for the user, we need to check if that status is PENDING,
                         * if they have uploaded a document for us to verify their status. If they have not, then we will
                         * return a status of 'NEEDS_DOCUMENT_UPLOAD' so we can flag that in the AppWall component, and ask
                         * them for a document upload.
                         */
                        if (responseData.getMilitaryVerificationStatus.data.militaryVerificationStatus === MilitaryVerificationStatusType.Pending) {
                            // call the getFilesForUser API endpoint to check if the user has uploaded any documentation
                            const filesForUserResult = await API.graphql(graphqlOperation(getFilesForUser, {
                                getFilesForUserInput: {
                                    id: userId,
                                    level: FileAccessLevel.Public,
                                    type: FileType.Main
                                }
                            }));

                            // retrieve the data block from the response
                            // @ts-ignore
                            const filesResponseData = filesForUserResult ? filesForUserResult.data : null;

                            // check if there are any error in the returned response
                            if (filesResponseData && filesResponseData.getFilesForUser.data && filesResponseData.getFilesForUser.data.length !== 0) {
                                const message = `User ${userId} has uploaded all the necessary files for verification. Need to verify them!`;
                                console.log(message);
                                await logEvent(message, LoggingLevel.Info, userIsAuthenticated);

                                return responseData.getMilitaryVerificationStatus.data.militaryVerificationStatus;
                            } else {
                                /**
                                 * if there are no files returned or there is an error (even if that's NONE_OR_ABSENT) that means that
                                 * either there are no files for the user, or there has been an error. In that case we assume that the user
                                 * still needs to upload a file
                                 */
                                const message = `Unexpected error or no files for user retrieved while attempting to retrieve files for user ${userId} ${JSON.stringify(filesForUserResult)}`;
                                console.log(message);
                                await logEvent(message, LoggingLevel.Error, userIsAuthenticated);

                                return 'NEEDS_DOCUMENT_UPLOAD';
                            }
                        } else {
                            // for REJECTED OR VERIFIED statuses, just proceed by returning the military status
                            return responseData.getMilitaryVerificationStatus.data.militaryVerificationStatus;
                        }
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
                            const message = `Unexpected error while retrieving the military verification status through the API ${JSON.stringify(retrievedMilitaryVerificationResult)}`;
                            console.log(message);
                            await logEvent(message, LoggingLevel.Error, userIsAuthenticated);

                            setModalVisible(true);

                            return null;
                        }
                    }
                }
                return null;
            } catch (error) {
                const message = `Unexpected error while attempting to retrieve the military verification object ${JSON.stringify(error)} ${error}`;
                console.log(message);
                await logEvent(message, LoggingLevel.Error, userIsAuthenticated);

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
                        next: async ({value}) => {
                            // check to ensure that there is a value and a valid data block to parse the message from
                            if (value && value.data && value.data.updatedMilitaryVerificationStatus && value.data.updatedMilitaryVerificationStatus.militaryVerificationStatus) {
                                // parse the military status data from the subscription message received
                                const militaryStatus: MilitaryVerificationStatusType = value.data.updatedMilitaryVerificationStatus.militaryVerificationStatus;

                                // cache the new verification status if it is verified
                                if (militaryStatus === MilitaryVerificationStatusType.Verified) {
                                    if (globalCache && await globalCache!.getItem(`${userInformation["custom:userId"]}-militaryStatus`) !== null) {
                                        const message = 'old military status is cached, needs cleaning up';
                                        console.log(message);
                                        await logEvent(message, LoggingLevel.Info, userIsAuthenticated);

                                        await globalCache!.removeItem(`${userInformation["custom:userId"]}-militaryStatus`);
                                        await globalCache!.setItem(`${userInformation["custom:userId"]}-militaryStatus`, militaryStatus);
                                        userInformation["militaryStatus"] = militaryStatus;
                                    } else {
                                        const message = 'military status is not cached';
                                        console.log(message);
                                        await logEvent(message, LoggingLevel.Info, userIsAuthenticated);

                                        globalCache && globalCache!.setItem(`${userInformation["custom:userId"]}-militaryStatus`, militaryStatus);
                                        userInformation["militaryStatus"] = militaryStatus;
                                    }
                                }
                                // set the update military status object
                                setUpdatedMilitaryStatus(militaryStatus);
                            } else {
                                const message = `Unexpected error while parsing subscription message for military status update ${JSON.stringify(value)}`;
                                console.log(message);
                                await logEvent(message, LoggingLevel.Error, userIsAuthenticated);

                                setModalVisible(true);
                            }
                        },
                        // function triggering in case there are any errors
                        error: async (error) => {
                            const message = `Unexpected error while subscribing to military status updates ${JSON.stringify(error)} ${error}`;
                            console.log(message);
                            await logEvent(message, LoggingLevel.Error, userIsAuthenticated);

                            setModalVisible(true);
                        }
                    }));
                }
            } catch (error) {
                const message = `Unexpected error while building a subscription to observe military status updates ${JSON.stringify(error)} ${error}`;
                console.log(message);
                await logEvent(message, LoggingLevel.Error, userIsAuthenticated);

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
                        false, false, userCredentials["identityId"]);
                    if (!returnFlag || profilePictureURI === null) {
                        // for any error we just want to print them out, and not set any profile picture, and show the default avatar instead
                        const message = `Unable to retrieve new profile picture!`;
                        console.log(message);
                        await logEvent(message, LoggingLevel.Warning, userIsAuthenticated);

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
                await logEvent(`${errorMessage} - ${error}`, LoggingLevel.Error, userIsAuthenticated);

                return null;
            }
        }

        // return the component for the AppDrawer page
        return (
            <>
                {
                    !isReady ?
                        <Spinner loadingSpinnerShown={loadingSpinnerShown}
                                 setLoadingSpinnerShown={setLoadingSpinnerShown}/>
                        :
                        <>
                            <Portal>
                                <Dialog style={commonStyles.dialogStyle} visible={modalVisible}
                                        onDismiss={() => setModalVisible(false)}>
                                    <Dialog.Icon icon="alert" color={"#F2FF5D"}
                                                 size={hp(10)}/>
                                    <Dialog.Title style={commonStyles.dialogTitle}>We hit a snag!</Dialog.Title>
                                    <Dialog.Content>
                                        <Text
                                            style={commonStyles.dialogParagraph}>{`Unexpected error while loading application!`}</Text>
                                    </Dialog.Content>
                                </Dialog>
                            </Portal>
                            <ApplicationDrawer.Navigator
                                drawerContent={(props) => {
                                    return (<CustomDrawer {...props} />);
                                }}
                                initialRouteName={!userVerified ? "AppWall" : "Home"}
                                screenOptions={({}) => ({
                                    ...(showTransactionsBottomSheet && {
                                        header: () =>
                                            <>
                                                {
                                                    <TouchableOpacity
                                                        activeOpacity={1}
                                                        disabled={!showTransactionsBottomSheet}
                                                        onPress={() => setShowTransactionsBottomSheet(false)}
                                                    >
                                                        <View
                                                            {...showTransactionsBottomSheet && {pointerEvents: "none"}}
                                                            {...showTransactionsBottomSheet && {
                                                                style: {backgroundColor: 'transparent', opacity: 0.3}
                                                            }}
                                                            style={drawerInDashboard ? {
                                                                height: hp(8),
                                                                width: wp(100),
                                                                backgroundColor: 'black',
                                                                shadowColor: 'transparent', // this covers iOS
                                                                elevation: 0, // this covers Android
                                                                opacity: 0.75,
                                                                flexDirection: 'column'
                                                            } : {
                                                                backgroundColor: '#313030'
                                                            }}
                                                        />
                                                    </TouchableOpacity>
                                                }
                                            </>
                                    }),
                                    headerLeft: () =>
                                        <>
                                        </>,
                                    headerRight: () =>
                                        <>
                                        </>,
                                    headerTitle: () =>
                                        <></>,
                                    headerRightContainerStyle: {
                                        marginTop: hp(1.9)
                                    },
                                    headerStyle: drawerInDashboard ? {
                                        width: wp(100),
                                        backgroundColor: '#5B5A5A',
                                        height: hp(8),
                                        shadowColor: 'transparent', // this covers iOS
                                        elevation: 0, // this covers Android
                                    } : {
                                        backgroundColor: '#313030'
                                    },
                                    drawerLabelStyle: {
                                        fontFamily: 'Raleway-Medium',
                                        fontSize: hp(2),
                                        color: '#FFFFFF'
                                    },
                                    headerTitleAlign: 'center',
                                    drawerActiveBackgroundColor: 'transparent',
                                    drawerActiveTintColor: '#F2FF5D',
                                    drawerInactiveTintColor: 'white',
                                    swipeEnabled: false,
                                    drawerStyle: {
                                        width: wp(70),
                                        backgroundColor: '#5B5A5A'
                                    },
                                })}
                            >
                                <ApplicationDrawer.Screen
                                    name={"Home"}
                                    component={Home}
                                    options={{
                                        swipeEnabled: drawerSwipeEnabled,
                                        drawerItemStyle: {
                                            right: wp(2),
                                            marginBottom: 0
                                        },
                                        drawerIcon: () => (
                                            <ReactIcon
                                                type={"antdesign"}
                                                size={hp(2.5)}
                                                name={'linechart'} color={'#F2FF5D'}/>
                                        ),
                                        headerShown: drawerHeaderShown
                                    }}
                                    initialParams={{}}
                                />
                                <ApplicationDrawer.Screen
                                    name={"Documents"}
                                    component={Documents}
                                    initialParams={{}}
                                    options={({navigation}) => ({
                                        header: () => (
                                            <>
                                                {
                                                    <>
                                                        <TouchableOpacity
                                                            disabled={!showTransactionsBottomSheet}
                                                            onPress={() => setShowTransactionsBottomSheet(false)}
                                                        >
                                                            <View
                                                                {...showTransactionsBottomSheet && {pointerEvents: "none"}}
                                                                {...showTransactionsBottomSheet && {
                                                                    style: {backgroundColor: 'transparent'}
                                                                }}
                                                                style={drawerInDashboard ? {
                                                                    height: hp(11),
                                                                    width: wp(100),
                                                                    backgroundColor: 'black',
                                                                    shadowColor: 'transparent', // this covers iOS
                                                                    elevation: 0, // this covers Android
                                                                    flexDirection: 'column'
                                                                } : {
                                                                    backgroundColor: '#313030'
                                                                }}
                                                            >
                                                                <View style={{
                                                                    height: hp(11),
                                                                    width: wp(100),
                                                                    flexDirection: 'column'
                                                                }}>
                                                                    <IconButton
                                                                        style={{
                                                                            alignSelf: 'flex-start',
                                                                            marginTop: hp(5.75),
                                                                        }}
                                                                        icon={'menu'} iconColor={'#FFFFFF'}
                                                                        size={hp(4)}
                                                                        onPress={() => {
                                                                            setShowTransactionsBottomSheet(false);
                                                                            setShowWalletBottomSheet(false);
                                                                            setShowClickOnlyBottomSheet(false);
                                                                            navigation.openDrawer();
                                                                        }}/>
                                                                    <Image resizeMode={"contain"}
                                                                           style={{
                                                                               bottom: hp(8.5),
                                                                               height: hp(10),
                                                                               width: wp(10),
                                                                               alignSelf: 'center'
                                                                           }}
                                                                           source={MoonbeamNavigationLogo}
                                                                    />
                                                                </View>
                                                            </View>
                                                        </TouchableOpacity>
                                                        <Divider color={"#D9D9D9"}/>
                                                    </>
                                                }
                                            </>
                                        ),
                                        swipeEnabled: drawerSwipeEnabled,
                                        drawerItemStyle: {
                                            right: wp(2),
                                            marginBottom: 0
                                        },
                                        drawerIcon: () => (
                                            <ReactIcon
                                                type={"antdesign"}
                                                size={hp(2.5)}
                                                name={'file1'} color={'#F2FF5D'}/>
                                        ),
                                        headerShown: drawerHeaderShown
                                    })}
                                />
                                <ApplicationDrawer.Screen
                                    name={"Settings"}
                                    component={Settings}
                                    options={({navigation}) => ({
                                        header: () => (
                                            <>
                                                {
                                                    <>
                                                        <TouchableOpacity
                                                            disabled={!showTransactionsBottomSheet}
                                                            onPress={() => setShowTransactionsBottomSheet(false)}
                                                        >
                                                            <View
                                                                {...showTransactionsBottomSheet && {pointerEvents: "none"}}
                                                                {...showTransactionsBottomSheet && {
                                                                    style: {backgroundColor: 'transparent'}
                                                                }}
                                                                style={drawerInDashboard ? {
                                                                    height: hp(11),
                                                                    width: wp(100),
                                                                    backgroundColor: 'black',
                                                                    shadowColor: 'transparent', // this covers iOS
                                                                    elevation: 0, // this covers Android
                                                                    flexDirection: 'column'
                                                                } : {
                                                                    backgroundColor: '#313030'
                                                                }}
                                                            >
                                                                <View style={{
                                                                    height: hp(11),
                                                                    width: wp(100),
                                                                    flexDirection: 'column'
                                                                }}>
                                                                    <IconButton
                                                                        style={{
                                                                            alignSelf: 'flex-start',
                                                                            marginTop: hp(5.75),
                                                                        }}
                                                                        icon={'menu'} iconColor={'#FFFFFF'}
                                                                        size={hp(4)}
                                                                        onPress={() => {
                                                                            setShowTransactionsBottomSheet(false);
                                                                            setShowWalletBottomSheet(false);
                                                                            setShowClickOnlyBottomSheet(false);
                                                                            navigation.openDrawer();
                                                                        }}/>
                                                                    <Image resizeMode={"contain"}
                                                                           style={{
                                                                               bottom: hp(8.5),
                                                                               height: hp(10),
                                                                               width: wp(10),
                                                                               alignSelf: 'center'
                                                                           }}
                                                                           source={MoonbeamNavigationLogo}
                                                                    />
                                                                </View>
                                                            </View>
                                                        </TouchableOpacity>
                                                        <Divider color={"#D9D9D9"}/>
                                                    </>
                                                }
                                            </>
                                        ),
                                        swipeEnabled: drawerSwipeEnabled,
                                        drawerItemStyle: {
                                            right: wp(2),
                                            marginBottom: 0
                                        },
                                        drawerIcon: () => (
                                            <ReactIcon
                                                type={"antdesign"}
                                                size={hp(2.5)}
                                                name={'setting'} color={'#F2FF5D'}/>
                                        ),
                                        headerShown: drawerHeaderShown
                                    })}
                                    initialParams={{}}
                                />
                                <ApplicationDrawer.Screen
                                    name={"Support"}
                                    component={Support}
                                    initialParams={{}}
                                    options={({navigation}) => ({
                                        header: () => (
                                            <>
                                                {
                                                    <>
                                                        <TouchableOpacity
                                                            disabled={!showTransactionsBottomSheet}
                                                            onPress={() => setShowTransactionsBottomSheet(false)}
                                                        >
                                                            <View
                                                                {...showTransactionsBottomSheet && {pointerEvents: "none"}}
                                                                {...showTransactionsBottomSheet && {
                                                                    style: {backgroundColor: 'transparent'}
                                                                }}
                                                                style={drawerInDashboard ? {
                                                                    height: hp(11),
                                                                    width: wp(100),
                                                                    backgroundColor: 'black',
                                                                    shadowColor: 'transparent', // this covers iOS
                                                                    elevation: 0, // this covers Android
                                                                    flexDirection: 'column'
                                                                } : {
                                                                    backgroundColor: '#313030'
                                                                }}
                                                            >
                                                                <View style={{
                                                                    height: hp(11),
                                                                    width: wp(100),
                                                                    flexDirection: 'column'
                                                                }}>
                                                                    <IconButton
                                                                        style={{
                                                                            alignSelf: 'flex-start',
                                                                            marginTop: hp(5.75),
                                                                        }}
                                                                        icon={'menu'} iconColor={'#FFFFFF'}
                                                                        size={hp(4)}
                                                                        onPress={() => {
                                                                            setShowTransactionsBottomSheet(false);
                                                                            setShowWalletBottomSheet(false);
                                                                            setShowClickOnlyBottomSheet(false);
                                                                            navigation.openDrawer();
                                                                        }}/>
                                                                    <Image resizeMode={"contain"}
                                                                           style={{
                                                                               bottom: hp(8.5),
                                                                               height: hp(10),
                                                                               width: wp(10),
                                                                               alignSelf: 'center'
                                                                           }}
                                                                           source={MoonbeamNavigationLogo}
                                                                    />
                                                                </View>
                                                            </View>
                                                        </TouchableOpacity>
                                                        <Divider color={"#D9D9D9"}/>
                                                    </>
                                                }
                                            </>
                                        ),
                                        swipeEnabled: true,
                                        drawerItemStyle: {
                                            right: wp(2),
                                            marginBottom: 0
                                        },
                                        drawerIcon: () => (
                                            <ReactIcon
                                                type={"antdesign"}
                                                size={hp(2.5)}
                                                name={'questioncircleo'} color={'#F2FF5D'}/>
                                        ),
                                        headerShown: drawerHeaderShown
                                    })}
                                />
                                <ApplicationDrawer.Screen
                                    name={"Referral"}
                                    component={Referral}
                                    initialParams={{}}
                                    options={{
                                        swipeEnabled: drawerSwipeEnabled,
                                        drawerItemStyle: {
                                            display: 'none',
                                            right: wp(2),
                                            marginBottom: 0
                                        },
                                        drawerIcon: () => (
                                            <Icon
                                                size={hp(3)}
                                                name={'gift'} color={'#F2FF5D'}/>
                                        ),
                                        headerShown: drawerHeaderShown
                                    }}
                                />
                                <ApplicationDrawer.Screen
                                    name={"Reimbursements"}
                                    component={ReimbursementsController}
                                    initialParams={{}}
                                    options={{
                                        swipeEnabled: drawerSwipeEnabled,
                                        drawerItemStyle: {
                                            display: 'none',
                                            right: wp(2),
                                            marginBottom: 0
                                        },
                                        drawerIcon: () => (
                                            <Icon
                                                size={hp(3)}
                                                name={'cash'} color={'#F2FF5D'}/>
                                        ),
                                        headerShown: drawerHeaderShown
                                    }}
                                />
                                {
                                    !userVerified &&
                                    <ApplicationDrawer.Screen
                                        name={"AppWall"}
                                        component={AppWall}
                                        initialParams={{}}
                                        options={{
                                            swipeEnabled: false,
                                            drawerItemStyle: {
                                                right: wp(2),
                                                marginBottom: 0
                                            },
                                            drawerIcon: () => (
                                                <Icon
                                                    size={hp(3)}
                                                    name={'wall'} color={'#F2FF5D'}/>
                                            ),
                                            header: () => {
                                                return (<></>)
                                            },
                                            headerShown: false
                                        }}
                                    />
                                }
                                {
                                    !userVerified &&
                                    <ApplicationDrawer.Screen
                                        name={"DocumentsViewer"}
                                        component={DocumentsViewer}
                                        initialParams={{}}
                                        options={{
                                            unmountOnBlur: true,
                                            swipeEnabled: false,
                                            drawerItemStyle: {
                                                right: wp(2),
                                                marginBottom: 0
                                            },
                                            drawerIcon: () => (
                                                <Icon
                                                    size={hp(3)}
                                                    name={'file'} color={'#F2FF5D'}/>
                                            ),
                                            header: () => {
                                                return (<></>)
                                            },
                                            headerShown: false
                                        }}
                                    />
                                }
                            </ApplicationDrawer.Navigator>
                        </>
                }
            </>
        );
    }
;
