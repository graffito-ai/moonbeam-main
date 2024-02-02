import React, {useEffect, useRef, useState} from "react";
import {AuthenticationProps} from "../../../models/props/RootProps";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {AuthenticationStackParamList} from "../../../models/props/AuthenticationProps";
import {IconButton, Text} from "react-native-paper";
import {SignInComponent} from "./SignInComponent";
import {RegistrationComponent} from "./registration/RegistrationComponent";
import {useRecoilState, useRecoilValue} from "recoil";
import {
    accountCreationDisclaimerCheckState,
    addressCityState,
    addressLineState,
    addressStateState,
    addressZipState,
    amplifySignUpProcessErrorsState, appUrlState,
    birthdayState,
    currentMemberAffiliationState,
    currentUserInformation,
    dutyStatusValueState,
    emailState,
    enlistingYearState,
    expoPushTokenState,
    firstNameState,
    globalAmplifyCacheState,
    initialAuthenticationScreen,
    isLoadingAppOverviewNeededState,
    isReadyRegistrationState,
    lastNameState,
    mainRootNavigationState,
    marketplaceAmplifyCacheState,
    militaryBranchValueState,
    phoneNumberState,
    registrationBackButtonShown,
    registrationConfirmationPasswordState,
    registrationMainErrorState,
    registrationPasswordState,
    registrationStepNumber,
    userIsAuthenticatedState
} from '../../../recoil/AuthAtom';
import {AccountRecoveryComponent} from "./AccountRecoveryComponent";
import {Linking, TouchableOpacity, View} from "react-native";
import {commonStyles} from "../../../styles/common.module";
import {AppDrawer} from "../drawer/AppDrawer";
import {DocumentsViewer} from "../../common/DocumentsViewer";
import * as SMS from "expo-sms";
import {styles} from "../../../styles/registration.module";
import {
    appUpgradeCheck,
    logEvent,
    retrieveClickOnlyOnlineOffersList,
    retrieveFidelisPartnerList,
    retrieveOffersNearby,
    retrieveOffersNearbyForMap,
    retrieveOnlineOffersList,
    retrievePremierClickOnlyOnlineOffersList,
    retrievePremierOffersNearby,
    retrievePremierOnlineOffersList,
    updateUserAuthStat
} from "../../../utils/AppSync";
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';
import {LoggingLevel, MilitaryVerificationStatusType, Stages, UserAuthSessionResponse} from "@moonbeam/moonbeam-models";
import {currentUserLocationState, firstTimeLoggedInState} from "../../../recoil/RootAtom";
import * as envInfo from "../../../../local-env-info.json";
import {
    clickOnlyOnlineOffersListState,
    clickOnlyOnlineOffersPageNumberState,
    locationServicesButtonState,
    nearbyOffersListForFullScreenMapState,
    nearbyOffersListForMainHorizontalMapState,
    nearbyOffersListState,
    nearbyOffersPageNumberState,
    noClickOnlyOnlineOffersToLoadState,
    noNearbyOffersToLoadState,
    noOnlineOffersToLoadState,
    numberOfClickOnlyOnlineOffersState,
    numberOfFailedClickOnlyOnlineOfferCallsState,
    numberOfFailedHorizontalMapOfferCallsState,
    numberOfFailedNearbyOfferCallsState,
    numberOfFailedOnlineOfferCallsState,
    numberOfOffersWithin25MilesState,
    numberOfOffersWithin5MilesState,
    numberOfOnlineOffersState,
    offersNearUserLocationFlagState,
    onlineOffersListState,
    onlineOffersPageNumberState,
    premierNearbyOffersPageNumberState,
    reloadNearbyDueToPermissionsChangeState,
} from "../../../recoil/StoreOfferAtom";
import {registerListener, removeListener} from "../../../utils/AmplifyHub";
import * as Location from "expo-location";
import {
    branchRootUniversalObjectState,
    referralCodeMarketingCampaignState,
    referralCodeState
} from "../../../recoil/BranchAtom";
import {initializeBranch} from "../../../utils/Branch";
import {Spinner} from "../../common/Spinner";
import Constants from 'expo-constants';
import {AppOwnership} from "expo-constants/src/Constants.types";
import * as ExpoLinking from "expo-linking";
import * as Notifications from "expo-notifications";

/**
 * import branch only if the app is not running in Expo Go (so we can actually run the application without Branch for
 * Expo Go), for easier testing purposes.
 */
const isRunningInExpoGo = Constants.appOwnership === AppOwnership.Expo;

/**
 * Authentication component.
 *
 * @constructor constructor for the component.
 */
export const AuthenticationComponent = ({route, navigation}: AuthenticationProps) => {
        // constants used to keep track of local component state
        const [initialStoreContentLoaded, isInitialStoreContentLoaded] = useState<boolean>(false);
        const [branchInitialized, setIsBranchInitialized] = useState<boolean>(false);
        const [latestReferringParamsChecked, setLatestReferringParamsChecked] = useState<boolean>(false);
        const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
        const [appUpgradeChecked, setAppUpgradeChecked] = useState<boolean>(false);
        const [checkedOnlineCache, setCheckOnlineCache] = useState<boolean>(false);
        const [checkedClickOnlyOnlineCache, setCheckClickOnlyOnlineCache] = useState<boolean>(false);
        const [loadingNearbyOffersInProgress, setIsLoadingNearbyOffersInProgress] = useState<boolean>(false);
        const [loadingOnlineInProgress, setIsLoadingOnlineInProgress] = useState<boolean>(false);
        const [loadingClickOnlyOnlineInProgress, setIsLoadingClickOnlyOnlineInProgress] = useState<boolean>(false);
        const [, setNoPremierOnlineOffersToLoad] = useState<boolean>(false);
        const [, setNoPremierClickOnlyOnlineOffersToLoad] = useState<boolean>(false);
        const [loadingNearbyOffersForHorizontalMapInProgress, setIsLoadingNearbyOffersForHorizontalMapInProgress] = useState<boolean>(false);
        const [areOffersForMainHorizontalMapLoaded, setAreOffersForMainHorizontalMapLoaded] = useState<boolean>(false);
        const [loadingNearbyOffersForFullScreenMapInProgress, setIsLoadingNearbyOffersForFullScreenMapInProgress] = useState<boolean>(false);
        const [areOffersForFullScreenMapLoaded, setAreOffersForFullScreenMapLoaded] = useState<boolean>(false);
        // constants used to keep track of shared states
        const [appUrl, setAppUrl] = useRecoilState(appUrlState);
        const [, setCurrentMemberAffiliation] = useRecoilState(currentMemberAffiliationState);
        const [numberOfFailedHorizontalMapOfferCalls, setNumberOfFailedHorizontalMapOfferCalls] = useRecoilState(numberOfFailedHorizontalMapOfferCallsState);
        const [numberOfNearbyFailedCalls, setNumberOfNearbyFailedCalls] = useRecoilState(numberOfFailedNearbyOfferCallsState);
        const [numberOfOnlineFailedCalls, setNumberOfOnlineFailedCalls] = useRecoilState(numberOfFailedOnlineOfferCallsState);
        const [numberOfClickOnlyOnlineFailedCalls, setNumberOfClickOnlyOnlineFailedCalls] = useRecoilState(numberOfFailedClickOnlyOnlineOfferCallsState);
        const [userIsAuthenticated, setIsUserAuthenticated] = useRecoilState(userIsAuthenticatedState);
        const [, setReferralCodeMarketingCampaign] = useRecoilState(referralCodeMarketingCampaignState);
        const [, setReferralCode] = useRecoilState(referralCodeState);
        const [authScreen, setAuthScreen] = useRecoilState(initialAuthenticationScreen);
        const [numberOfOnlineOffers, setNumberOfOnlineOffers] = useRecoilState(numberOfOnlineOffersState);
        const [numberOfClickOnlyOnlineOffers, setNumberOfClickOnlyOnlineOffers] = useRecoilState(numberOfClickOnlyOnlineOffersState);
        const [numberOfOffersWithin5Miles, setNumberOfOffersWithin5Miles] = useRecoilState(numberOfOffersWithin5MilesState);
        const [numberOfOffersWithin25Miles, setNumberOfOffersWithin25Miles] = useRecoilState(numberOfOffersWithin25MilesState);
        const [currentUserLocation, setCurrentUserLocation] = useRecoilState(currentUserLocationState);
        const [nearbyOffersPageNumber, setNearbyOffersPageNumber] = useRecoilState(nearbyOffersPageNumberState);
        const [premierNearbyOffersPageNumber, setPremierNearbyOffersPageNumber] = useRecoilState(premierNearbyOffersPageNumberState);
        const [onlineOffersPageNumber, setOnlineOffersPageNumber] = useRecoilState(onlineOffersPageNumberState);
        // const [premierOnlineOffersPageNumber, setPremierOnlineOffersPageNumber] = useRecoilState(premierOnlineOffersPageNumberState);
        const [noOnlineOffersToLoad, setNoOnlineOffersToLoad] = useRecoilState(noOnlineOffersToLoadState);
        const [clickOnlyOnlineOffersPageNumber, setClickOnlyOnlineOffersPageNumber] = useRecoilState(clickOnlyOnlineOffersPageNumberState);
        // const [premierClickOnlyOnlineOffersPageNumber, setPremierClickOnlyOnlineOffersPageNumber] = useRecoilState(premierClickOnlyOnlineOffersPageNumberState);
        const [noClickOnlyOnlineOffersToLoad, setNoClickOnlyOnlineOffersToLoad] = useRecoilState(noClickOnlyOnlineOffersToLoadState);
        const [noNearbyOffersToLoad, setNoNearbyOffersToLoad] = useRecoilState(noNearbyOffersToLoadState);
        const [, setOffersNearUserLocationFlag] = useRecoilState(offersNearUserLocationFlagState);
        const [reloadNearbyDueToPermissionsChange, setReloadNearbyDueToPermissionsChange] = useRecoilState(reloadNearbyDueToPermissionsChangeState);
        const [, setLocationServicesButtonState] = useRecoilState(locationServicesButtonState);
        const [nearbyOffersListForMainHorizontalMap, setNearbyOffersListForMainHorizontalMap] = useRecoilState(nearbyOffersListForMainHorizontalMapState);
        const [nearbyOffersListForFullScreenMap, setNearbyOffersListForFullScreenMap] = useRecoilState(nearbyOffersListForFullScreenMapState);
        const [nearbyOfferList, setNearbyOfferList] = useRecoilState(nearbyOffersListState);
        const [onlineOfferList, setOnlineOfferList] = useRecoilState(onlineOffersListState);
        const [clickOnlyOnlineOfferList, setClickOnlyOnlineOfferList] = useRecoilState(clickOnlyOnlineOffersListState);
        const [mainRootNavigation, setMainRootNavigation] = useRecoilState(mainRootNavigationState);
        const [isLoadingAppOverviewNeeded,] = useRecoilState(isLoadingAppOverviewNeededState);
        const [, setIsReady] = useRecoilState(isReadyRegistrationState);
        const [marketplaceCache, setMarketplaceCache] = useRecoilState(marketplaceAmplifyCacheState);
        const [globalCache, setGlobalCache] = useRecoilState(globalAmplifyCacheState);
        const [isRegistrationReady,] = useRecoilState(isReadyRegistrationState);
        const [, setRegistrationMainError] = useRecoilState(registrationMainErrorState);
        const [stepNumber, setStepNumber] = useRecoilState(registrationStepNumber);
        const [userInformation,] = useRecoilState(currentUserInformation);
        const [, setExpoPushToken] = useRecoilState(expoPushTokenState);
        const [, setFirstTimeLoggedIn] = useRecoilState(firstTimeLoggedInState);
        const [, setBranchRootUniversalObject] = useRecoilState(branchRootUniversalObjectState);
        // step 1
        const [, setFirstName] = useRecoilState(firstNameState);
        const [, setLastName] = useRecoilState(lastNameState);
        const [, setBirthday] = useRecoilState(birthdayState);
        const [, setPhoneNumber] = useRecoilState(phoneNumberState);
        const [, setEmail] = useRecoilState(emailState);
        const [, setDutyStatus] = useRecoilState(dutyStatusValueState);
        const [, setEnlistingYear] = useRecoilState(enlistingYearState);
        // step 2
        const [, setAddressLine] = useRecoilState(addressLineState);
        const [, setAddressState] = useRecoilState(addressStateState);
        const [, setAddressZip] = useRecoilState(addressZipState);
        const [, setAddressCity] = useRecoilState(addressCityState);
        const [, setMilitaryBranch] = useRecoilState(militaryBranchValueState);
        // step 3
        const [, setPassword] = useRecoilState(registrationPasswordState);
        const [, setConfirmationPassword] = useRecoilState(registrationConfirmationPasswordState);
        const [, setAccountRegistrationDisclaimer] = useRecoilState(accountCreationDisclaimerCheckState);
        const [, setAmplifySignUpErrors] = useRecoilState(amplifySignUpProcessErrorsState);
        // do not need to clear further steps because back button won't be shown for subsequent ones

        // create a native stack navigator, to be used for our Authentication application navigation
        const Stack = createNativeStackNavigator<AuthenticationStackParamList>();

        // notification states and listeners
        const notificationListener = useRef<Notifications.Subscription>();
        const responseListener = useRef<Notifications.Subscription>();
        const lastNotificationResponse = Notifications.useLastNotificationResponse();

        /**
         * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
         * auth-related functionality for example), as well as any afferent API calls.
         *
         * Generally speaking, any functionality imperative prior to the full page-load should be
         * included in here.
         */
        useEffect(() => {
            /**
             * we're favoring this over the notification listeners (since they don't always work)
             * we left the listeners from the useEffect perspective temporarily until we do some deep
             * dive.
             */
            if (lastNotificationResponse) {
                // navigate to your desired screen
                const message = `incoming notification and/or notification response received`;
                console.log(message);
                logEvent(message, LoggingLevel.Info, true).then(() => {
                });

                // filter incoming notification action, and set the app url accordingly
                if (lastNotificationResponse.notification.request.content.data && lastNotificationResponse.notification.request.content.data.clickAction) {
                    if (lastNotificationResponse.notification.request.content.data.clickAction === 'https://app.moonbeam.vet/transaction/cashback') {
                        ExpoLinking.getInitialURL().then(baseUrl => {
                            setAppUrl(`${baseUrl}/notifications/cashback`);
                        });
                    }
                }
            }
            // This listener is fired whenever a notification is received while the app is foregrounded.
            notificationListener.current = Notifications.addNotificationReceivedListener(_ => {
                // Do something with the notification
                const message = `Incoming push notification received`;
                console.log(message);
                logEvent(message, LoggingLevel.Info, true).then(() => {
                });
            });
            // This listener is fired whenever a user taps on or interacts with a notification (works when an app is foregrounded, backgrounded, or killed).
            responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
                // Do something with the notification/response
                const message = `Incoming notification interaction response received`;
                console.log(message);
                logEvent(message, LoggingLevel.Info, true).then(() => {
                });

                // filter incoming notification action, and set the app url accordingly
                if (response.notification.request.content.data && response.notification.request.content.data.clickAction) {
                    if (response.notification.request.content.data.clickAction === 'https://app.moonbeam.vet/transaction/cashback') {
                        ExpoLinking.getInitialURL().then(baseUrl => {
                            setAppUrl(`${baseUrl}/notifications/cashback`);
                        });
                    }
                }
            });

            // subscribe to incoming deep-linking attempts in the auth component
            Linking.getInitialURL().then(async (url) => {
                if (url) {
                    setAppUrl(url);

                    // re-direct to the Authentication screen
                    setAuthScreen('SignIn');
                    navigation.navigate("Authentication", {
                        marketplaceCache: route.params.marketplaceCache,
                        cache: route.params.cache,
                        currentUserLocation: route.params.currentUserLocation,
                        expoPushToken: route.params.expoPushToken,
                        onLayoutRootView: route.params.onLayoutRootView
                    });
                }
            }).catch(err => {
                const errorMessage = `An error occurred while observing initial url ${err}`;
                console.log(errorMessage);
                logEvent(errorMessage, LoggingLevel.Error, true).then(() => {
                });
            });
            Linking.addEventListener('url', async (urlObject) => {
                if (urlObject && urlObject.url) {
                    const url = urlObject.url;
                    setAppUrl(url);

                    // re-direct to the Authentication screen
                    setAuthScreen('SignIn');
                    navigation.navigate("Authentication", {
                        marketplaceCache: route.params.marketplaceCache,
                        cache: route.params.cache,
                        currentUserLocation: route.params.currentUserLocation,
                        expoPushToken: route.params.expoPushToken,
                        onLayoutRootView: route.params.onLayoutRootView
                    });
                }
            });

            // import branch accordingly
            !isRunningInExpoGo && import('react-native-branch').then((branch) => {
                // handle incoming deep-links through the latest referring params of the Branch SDK
                branch !== null && branch.default !== null && !latestReferringParamsChecked && branch.default.getLatestReferringParams(false).then(async params => {
                    setLatestReferringParamsChecked(true);
                    if (params) {
                        if (params['~tags'] && params['~tags'].length === 2) {
                            // check whether this is a referral specific branch url or a notification deep-link url
                            if ((params['~tags'][0].toString() === 'cashback' && params['~tags'][1].toString() === 'notifications') ||
                                (params['~tags'][1].toString() === 'cashback' && params['~tags'][0].toString() === 'notifications')) {
                                setAppUrl(`${await ExpoLinking.getInitialURL()}/notifications/cashback`);

                                // re-direct to the Authentication screen
                                setAuthScreen('SignIn');
                                navigation.navigate("Authentication", {
                                    marketplaceCache: route.params.marketplaceCache,
                                    cache: route.params.cache,
                                    currentUserLocation: route.params.currentUserLocation,
                                    expoPushToken: route.params.expoPushToken,
                                    onLayoutRootView: route.params.onLayoutRootView
                                });
                            } else {
                                // set the referral code to be used during registration
                                setReferralCode(params['~tags'][0].toString());

                                // set the marketing campaign code used for the referral
                                setReferralCodeMarketingCampaign(params['~tags'][1].toString());

                                // re-direct to the registration screen
                                setAuthScreen('Registration');
                                navigation.navigate("Authentication", {
                                    marketplaceCache: route.params.marketplaceCache,
                                    cache: route.params.cache,
                                    currentUserLocation: route.params.currentUserLocation,
                                    expoPushToken: route.params.expoPushToken,
                                    onLayoutRootView: route.params.onLayoutRootView
                                });
                            }
                        }
                    }
                });
            });

            // set the main root navigation of the app accordingly
            setMainRootNavigation(navigation);
            // set the Cache to the global cache passed in from the App root component
            setGlobalCache(route.params.cache);
            // set the Marketplace Cache to the marketplace cache passed in from the App root component
            setMarketplaceCache(route.params.marketplaceCache);
            // set the current user's location passed in from the App root component
            setCurrentUserLocation(route.params.currentUserLocation);
            // set the expo push token accordingly, to be used in later stages, as part of the current user information object
            setExpoPushToken(route.params.expoPushToken);

            // set the current user's position accordingly, if not already set
            if (currentUserLocation === null) {
                Location.requestForegroundPermissionsAsync().then((foregroundPermissionStatus) => {
                    if (foregroundPermissionStatus.status !== 'granted') {
                        const message = `Permission to access location was not granted!`;
                        console.log(message);
                        logEvent(message, LoggingLevel.Warning, userIsAuthenticated).then(() => {
                        });

                        setCurrentUserLocation(null);
                    } else {
                        Location.getLastKnownPositionAsync().then(async (lastKnownPositionAsync) => {
                            setCurrentUserLocation(lastKnownPositionAsync !== null ? lastKnownPositionAsync : await Location.getCurrentPositionAsync());
                        });
                    }
                })
            }

            // load the store data, initialize Branch and check App Upgrade, if the user is authenticated and the user's status is VERIFIED
            if (userIsAuthenticated && userInformation["militaryStatus"] === MilitaryVerificationStatusType.Verified) {
                // depending on the stage find the limits at which we turn off the store loading
                if (envInfo.envName === Stages.PROD) {
                    if (nearbyOfferList !== undefined && nearbyOfferList !== null &&
                        onlineOfferList !== undefined && onlineOfferList !== null &&
                        clickOnlyOnlineOfferList !== undefined && clickOnlyOnlineOfferList !== null &&
                        (nearbyOfferList.length >= 6 || noNearbyOffersToLoad) && onlineOfferList.length >= 29 &&
                        clickOnlyOnlineOfferList.length >= 29 && areOffersForFullScreenMapLoaded && areOffersForMainHorizontalMapLoaded) {
                        isInitialStoreContentLoaded(true);
                    } else {
                        isInitialStoreContentLoaded(false);
                    }
                }
                if (envInfo.envName === Stages.DEV) {
                    if (nearbyOfferList !== undefined && nearbyOfferList !== null &&
                        onlineOfferList !== undefined && onlineOfferList !== null &&
                        clickOnlyOnlineOfferList !== undefined && clickOnlyOnlineOfferList !== null &&
                        (nearbyOfferList.length >= 6 || noNearbyOffersToLoad) && onlineOfferList.length >= 29 &&
                        clickOnlyOnlineOfferList.length >= 10 && areOffersForFullScreenMapLoaded && areOffersForMainHorizontalMapLoaded) {
                        isInitialStoreContentLoaded(true);
                    } else {
                        isInitialStoreContentLoaded(false);
                    }
                }
                // once a user is authenticated, load the store data until we get enough offers loaded
                !initialStoreContentLoaded && loadStoreData().then(() => {
                });

                // once a user is authenticated, then initialize the Branch.io SDK appropriately
                !branchInitialized && initializeBranch(userInformation).then(rootBUO => {
                    setBranchRootUniversalObject(rootBUO);
                    setIsBranchInitialized(true);
                });

                // check if the user needs to upgrade the app (forcefully or not - in case of breaking changes)
                !appUpgradeChecked && appUpgradeCheck(appUpgradeChecked, setAppUpgradeChecked).then(() => {
                    setAppUpgradeChecked(true);
                });
            }

            /**
             * initialize the Amplify Hub, and start listening to various events, that would help in capturing important metrics,
             * and/or making specific decisions.
             */
            registerListener('auth', 'amplify_auth_listener', async (data) => {
                switch (data.payload.event) {
                    case 'signIn':
                        const signInMessage = `user signed in`;
                        console.log(signInMessage);
                        await logEvent(signInMessage, LoggingLevel.Info, userIsAuthenticated);

                        setIsUserAuthenticated(true);
                        // update the user auth session statistics
                        const userAuthSessionResponse: UserAuthSessionResponse = await updateUserAuthStat(data.payload.data.attributes["custom:userId"]);
                        // check if the user auth stat has successfully been updated
                        if (userAuthSessionResponse.data !== null && userAuthSessionResponse.data !== undefined) {
                            const message = 'Successfully updated user auth stat during sign in!';
                            console.log(message);
                            await logEvent(message, LoggingLevel.Info, userIsAuthenticated);

                            // check if this sign in session, is the first time that the user logged in
                            if (userAuthSessionResponse.data.numberOfSessions === 1 &&
                                userAuthSessionResponse.data.createdAt === userAuthSessionResponse.data.updatedAt) {
                                const message = `User ${userAuthSessionResponse.data.id} logged in for the first time!`;
                                console.log(message);
                                await logEvent(message, LoggingLevel.Info, userIsAuthenticated);

                                setFirstTimeLoggedIn(true);
                            } else {
                                const message = `User ${userAuthSessionResponse.data.id} not logged in for the first time!`;
                                console.log(message);
                                await logEvent(message, LoggingLevel.Info, userIsAuthenticated);

                                setFirstTimeLoggedIn(false);
                            }
                        } else {
                            const message = 'Unsuccessfully updated user auth stat during sign in!';
                            console.log(message);
                            await logEvent(message, LoggingLevel.Error, userIsAuthenticated);
                        }
                        break;
                    case 'signOut':
                        setIsUserAuthenticated(false);
                        /**
                         * Amplify automatically manages the sessions, and when the session token expires, it will log out the user and send an event
                         * here. What we do then is intercept that event, and since the user Sign-Out has already happened, we will perform the cleanup that
                         * we usually do in our Sign-Out functionality, without actually signing the user out.
                         */
                        const signOutMessage = `user signed out`;
                        console.log(signOutMessage);
                        await logEvent(signOutMessage, LoggingLevel.Info, userIsAuthenticated);

                        // remove listener on sign out action
                        removeListener('auth', 'amplify_auth_listener');
                        break;
                    case 'configured':
                        const configuredMessage = 'the Auth module is successfully configured!';
                        console.log(configuredMessage);
                        await logEvent(configuredMessage, LoggingLevel.Info, userIsAuthenticated);

                        break;
                }
            });
            return () => {
                notificationListener.current && Notifications.removeNotificationSubscription(notificationListener.current!);
                responseListener.current && Notifications.removeNotificationSubscription(responseListener.current!);
            };
        }, [
            lastNotificationResponse, responseListener, notificationListener,
            userIsAuthenticated, reloadNearbyDueToPermissionsChange, appUrl,
            noNearbyOffersToLoad, nearbyOfferList, onlineOfferList,
            clickOnlyOnlineOfferList, loadingClickOnlyOnlineInProgress,
            noClickOnlyOnlineOffersToLoad, marketplaceCache, loadingOnlineInProgress,
            noOnlineOffersToLoad, appUpgradeChecked, authScreen,
            latestReferringParamsChecked, branchInitialized, userInformation["militaryStatus"],
            initialStoreContentLoaded, areOffersForFullScreenMapLoaded, areOffersForMainHorizontalMapLoaded
        ]);

        /**
         * Function used to load the click-only online data
         */
        const loadClickOnlyOnlineData = async (): Promise<void> => {
            setTimeout(async () => {
                setIsLoadingClickOnlyOnlineInProgress(true);

                const additionalClickOnlyOnlineOffers = await retrieveClickOnlyOnlineOffersList(
                    numberOfClickOnlyOnlineFailedCalls, setNumberOfClickOnlyOnlineFailedCalls,
                    numberOfClickOnlyOnlineOffers, setNumberOfClickOnlyOnlineOffers,
                    clickOnlyOnlineOffersPageNumber, setClickOnlyOnlineOffersPageNumber);
                if (additionalClickOnlyOnlineOffers !== undefined && additionalClickOnlyOnlineOffers !== null &&
                    additionalClickOnlyOnlineOffers.length === 0) {
                    // setNoOnlineOffersToLoad(true);
                    setClickOnlyOnlineOfferList(oldClickOnlyOnlineOfferList => {
                        return [...oldClickOnlyOnlineOfferList, ...additionalClickOnlyOnlineOffers]
                    });
                } else {
                    setNoClickOnlyOnlineOffersToLoad(false);
                    setClickOnlyOnlineOfferList(oldClickOnlyOnlineOfferList => {
                        return [...oldClickOnlyOnlineOfferList, ...additionalClickOnlyOnlineOffers]
                    });
                }

                setIsLoadingClickOnlyOnlineInProgress(false);
            }, 10);
        }

        /**
         * Function used to load the premier click-only online data
         */
        const loadPremierClickOnlyOnlineData = async (): Promise<void> => {
            setTimeout(async () => {
                setIsLoadingClickOnlyOnlineInProgress(true);

                const premierClickOnlyOnlineOffers = await retrievePremierClickOnlyOnlineOffersList(
                    numberOfClickOnlyOnlineFailedCalls, setNumberOfClickOnlyOnlineFailedCalls);
                if (premierClickOnlyOnlineOffers !== undefined && premierClickOnlyOnlineOffers !== null &&
                    premierClickOnlyOnlineOffers.length !== 0) {
                    // update the number of available total click-only offers
                    setNumberOfClickOnlyOnlineOffers(oldNumberOfPremierClickOnlyOnlineOffers => {
                        return oldNumberOfPremierClickOnlyOnlineOffers + premierClickOnlyOnlineOffers.length
                    });

                    setNoPremierClickOnlyOnlineOffersToLoad(false);
                    setClickOnlyOnlineOfferList(oldClickOnlyOnlineOfferList => {
                        return [...premierClickOnlyOnlineOffers, ...oldClickOnlyOnlineOfferList]
                    });
                } else {
                    // setNoPremierOnlineOffersToLoad(true);
                    setClickOnlyOnlineOfferList(oldClickOnlyOnlineOfferList => {
                        return [...premierClickOnlyOnlineOffers, ...oldClickOnlyOnlineOfferList]
                    });
                }
                setIsLoadingClickOnlyOnlineInProgress(false);
            }, 10);
        }

        /**
         * Function used to load the online data
         */
        const loadOnlineData = async (): Promise<void> => {
            setTimeout(async () => {
                setIsLoadingOnlineInProgress(true);

                const additionalOnlineOffers = await retrieveOnlineOffersList(
                    numberOfOnlineFailedCalls, setNumberOfOnlineFailedCalls,
                    numberOfOnlineOffers, setNumberOfOnlineOffers,
                    onlineOffersPageNumber, setOnlineOffersPageNumber);
                if (additionalOnlineOffers !== undefined &&
                    additionalOnlineOffers !== null) {
                    // no offers
                    if (additionalOnlineOffers.length === 0) {
                        setNoOnlineOffersToLoad(true);
                        setOnlineOfferList(oldOnlineOfferList => {
                            return [...oldOnlineOfferList, ...additionalOnlineOffers]
                        });
                    } else {
                        setOnlineOfferList(oldOnlineOfferList => {
                            return [...oldOnlineOfferList, ...additionalOnlineOffers]
                        });
                    }
                }

                setIsLoadingOnlineInProgress(false);
            }, 10);
        }

        /**
         * Function used to load the premier online data
         */
        const loadPremierOnlineData = async (): Promise<void> => {
            setTimeout(async () => {
                setIsLoadingOnlineInProgress(true);

                const premierOnlineOffers = await retrievePremierOnlineOffersList(numberOfOnlineFailedCalls, setNumberOfOnlineFailedCalls);
                if (premierOnlineOffers !== undefined &&
                    premierOnlineOffers !== null) {
                    // no offers
                    if (premierOnlineOffers.length === 0) {
                        setNoPremierOnlineOffersToLoad(true);
                        setOnlineOfferList(oldOnlineOfferList => {
                            return [...premierOnlineOffers, ...oldOnlineOfferList]
                        });
                    } else {
                        // update the number of available total online offers
                        setNumberOfOnlineOffers(oldNumberOfOnlineOffers => {
                            return oldNumberOfOnlineOffers + premierOnlineOffers.length
                        });

                        setNoPremierOnlineOffersToLoad(false);
                        setOnlineOfferList(oldOnlineOfferList => {
                            return [...premierOnlineOffers, ...oldOnlineOfferList]
                        });
                    }
                }
                setIsLoadingOnlineInProgress(false);
            }, 10);
        }

        /**
         * Function used to load the nearby offer data
         */
        const loadNearbyData = async (): Promise<void> => {
            setTimeout(async () => {
                setIsLoadingNearbyOffersInProgress(true);
                const offersNearby = await
                    retrieveOffersNearby(
                        numberOfNearbyFailedCalls, setNumberOfNearbyFailedCalls,
                        nearbyOffersPageNumber, setNearbyOffersPageNumber,
                        premierNearbyOffersPageNumber, setPremierNearbyOffersPageNumber,
                        userInformation, setOffersNearUserLocationFlag, marketplaceCache, currentUserLocation,
                        setCurrentUserLocation, numberOfOffersWithin25Miles, setNumberOfOffersWithin25Miles);
                if (offersNearby === null) {
                    setIsLoadingNearbyOffersInProgress(false);
                    setNoNearbyOffersToLoad(true);
                    setLocationServicesButtonState(true);
                } else if (offersNearby !== undefined && offersNearby !== null && offersNearby.length === 0) {
                    setIsLoadingNearbyOffersInProgress(false);
                    setNoNearbyOffersToLoad(true);
                } else {
                    setNoNearbyOffersToLoad(false);
                    setIsLoadingNearbyOffersInProgress(false);
                    setNearbyOfferList(oldNearbyOfferList => {
                        return [...oldNearbyOfferList, ...offersNearby]
                    });
                }
            }, 10);
        }

        /**
         * Function used to load the nearby offer data used for main horizontal map
         */
        const loadNearbyDataForMainHorizontalMap = async (): Promise<void> => {
            setTimeout(async () => {
                setIsLoadingNearbyOffersForHorizontalMapInProgress(true);
                const offersNearby = await
                    retrieveOffersNearbyForMap(
                        numberOfFailedHorizontalMapOfferCalls, setNumberOfFailedHorizontalMapOfferCalls,
                        userInformation, currentUserLocation, setCurrentUserLocation,
                        numberOfOffersWithin5Miles, setNumberOfOffersWithin5Miles);
                if (offersNearby === null) {
                    setIsLoadingNearbyOffersForHorizontalMapInProgress(false);
                    setAreOffersForMainHorizontalMapLoaded(true);
                } else if (offersNearby !== undefined && offersNearby !== null && offersNearby.length === 0) {
                    setIsLoadingNearbyOffersForHorizontalMapInProgress(false);
                    setAreOffersForMainHorizontalMapLoaded(true);
                } else {
                    setIsLoadingNearbyOffersForHorizontalMapInProgress(false);
                    setAreOffersForMainHorizontalMapLoaded(true);
                    setNearbyOffersListForMainHorizontalMap(oldNearbyOfferList => {
                        return [...oldNearbyOfferList, ...offersNearby]
                    });
                }
            }, 10);
        }

        /**
         * Function used to load the nearby offer data used for the full screen map
         */
        const loadNearbyDataForFullScreenMap = async (): Promise<void> => {
            setTimeout(async () => {
                setIsLoadingNearbyOffersForFullScreenMapInProgress(true);
                const offersNearby = await
                    retrieveOffersNearbyForMap(
                        numberOfFailedHorizontalMapOfferCalls, setNumberOfFailedHorizontalMapOfferCalls,
                        userInformation, currentUserLocation, setCurrentUserLocation,
                        undefined, undefined, true);
                if (offersNearby === null) {
                    setIsLoadingNearbyOffersForFullScreenMapInProgress(false);
                    setAreOffersForFullScreenMapLoaded(true);
                } else if (offersNearby !== undefined && offersNearby !== null && offersNearby.length === 0) {
                    setIsLoadingNearbyOffersForFullScreenMapInProgress(false);
                    setAreOffersForFullScreenMapLoaded(true);
                } else {
                    setIsLoadingNearbyOffersForFullScreenMapInProgress(false);
                    setAreOffersForFullScreenMapLoaded(true);
                    setNearbyOffersListForFullScreenMap(oldNearbyOfferList => {
                        return [...oldNearbyOfferList, ...offersNearby]
                    });
                }
            }, 10);
        }

        /**
         * Function used to load the premier nearby offer data
         */
        const loadPremierNearbyData = async (): Promise<void> => {
            setTimeout(async () => {
                setIsLoadingNearbyOffersInProgress(true);
                const premierOffersNearby = await
                    retrievePremierOffersNearby(
                        numberOfNearbyFailedCalls, setNumberOfNearbyFailedCalls, currentUserLocation, setCurrentUserLocation);
                if (premierOffersNearby === null) {
                    setIsLoadingNearbyOffersInProgress(false);
                } else if ((premierOffersNearby !== undefined && premierOffersNearby !== null && premierOffersNearby.length === 0) || nearbyOfferList.length >= 1) {
                    setIsLoadingNearbyOffersInProgress(false);
                } else {
                    setNoNearbyOffersToLoad(false);
                    setIsLoadingNearbyOffersInProgress(false);
                    setNearbyOfferList(oldNearbyOfferList => {
                        return [...premierOffersNearby, ...oldNearbyOfferList]
                    });
                }
            }, 10);
        }

        /**
         * Function used to load the marketplace/store data.
         *
         * @return a tuple of {@link Promise} of {@link void}
         */
        const loadStoreData = async (): Promise<void> => {
            // check to see if we have cached online Offers. If we do, set them appropriately
            const onlineOffersCached = await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-onlineOffers`);
            if (marketplaceCache !== null &&
                onlineOffersCached !== undefined && onlineOffersCached !== null && onlineOffersCached.length !== 0 && !checkedOnlineCache) {
                const message = 'pre-emptively loading - online offers are cached';
                console.log(message);
                await logEvent(message, LoggingLevel.Info, userIsAuthenticated);

                setCheckOnlineCache(true);
                const cachedOnlineOffers = await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-onlineOffers`);
                setOnlineOfferList(cachedOnlineOffers);

                setIsLoadingOnlineInProgress(false);
                (cachedOnlineOffers === null || (cachedOnlineOffers !== undefined && cachedOnlineOffers !== null && cachedOnlineOffers.length < 20)) &&
                await marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineOffers`, null);
            }

            // check to see if we have cached click-only online Offers. If we do, set them appropriately
            const onlineClickOnlyOffersCached = await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-clickOnlyOnlineOffers`);
            if (marketplaceCache !== null &&
                onlineClickOnlyOffersCached !== undefined &&
                onlineClickOnlyOffersCached !== null && onlineClickOnlyOffersCached.length !== 0 && !checkedClickOnlyOnlineCache) {
                const message = 'pre-emptively loading - click-only online offers are cached';
                console.log(message);
                await logEvent(message, LoggingLevel.Info, userIsAuthenticated);

                setCheckClickOnlyOnlineCache(true);
                const cachedClickOnlyOnlineOffers = await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-clickOnlyOnlineOffers`);
                setClickOnlyOnlineOfferList(cachedClickOnlyOnlineOffers);

                setIsLoadingClickOnlyOnlineInProgress(false);
                (cachedClickOnlyOnlineOffers === null || (cachedClickOnlyOnlineOffers !== undefined && cachedClickOnlyOnlineOffers !== null && cachedClickOnlyOnlineOffers.length < 20)) &&
                await marketplaceCache!.setItem(`${userInformation["custom:userId"]}-clickOnlyOnlineOffers`, null);
            }

            // stop caching online offers until we have at least 20 and at most 100 offers loaded, or until we run out of offers to load.
            if ((marketplaceCache &&
                onlineOfferList !== undefined && onlineOfferList !== null &&
                onlineOfferList.length >= 20 && onlineOfferList.length < 100) || (marketplaceCache && noOnlineOffersToLoad)) {
                marketplaceCache!.getItem(`${userInformation["custom:userId"]}-onlineOffers`).then(async onlineOffersCached => {
                    // check if there's really a need for caching
                    if (((onlineOffersCached !== undefined && onlineOffersCached !== null && onlineOffersCached.length < onlineOfferList.length) || onlineOffersCached === null)) {
                        const message = 'Caching additional online offers';
                        console.log(message);
                        await logEvent(message, LoggingLevel.Info, userIsAuthenticated);

                        marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineOffers`, onlineOfferList);
                    }
                });
            }

            // stop caching click-only online offers until we have at least 10 and at most 100 offers loaded, or until we run out of offers to load.
            if ((marketplaceCache &&
                clickOnlyOnlineOfferList !== undefined && clickOnlyOnlineOfferList !== null &&
                clickOnlyOnlineOfferList.length >= 10 && clickOnlyOnlineOfferList.length < 100) || (marketplaceCache && noClickOnlyOnlineOffersToLoad)) {
                marketplaceCache!.getItem(`${userInformation["custom:userId"]}-clickOnlyOnlineOffers`).then(async clickOnlyOnlineOffersCached => {
                    // check if there's really a need for caching
                    if (((clickOnlyOnlineOffersCached !== undefined && clickOnlyOnlineOffersCached !== null &&
                        clickOnlyOnlineOffersCached.length < clickOnlyOnlineOffersCached.length) || clickOnlyOnlineOffersCached === null)) {
                        const message = 'Caching additional click-only online offers';
                        console.log(message);
                        await logEvent(message, LoggingLevel.Info, userIsAuthenticated);

                        marketplaceCache!.setItem(`${userInformation["custom:userId"]}-clickOnlyOnlineOffers`, clickOnlyOnlineOfferList);
                    }
                });
            }

            // depending on the stage, load the offers appropriately
            if (envInfo.envName === Stages.DEV) {
                // sometimes recoil messes up the state, so we're here to correct it
                if (onlineOfferList === null) {
                    setOnlineOfferList([]);
                }
                if (clickOnlyOnlineOfferList === null) {
                    setClickOnlyOnlineOfferList([]);
                }
                if (nearbyOfferList === null) {
                    setNearbyOfferList([]);
                }
                if (nearbyOffersListForMainHorizontalMap === null) {
                    setNearbyOffersListForMainHorizontalMap([]);
                }
                if (nearbyOffersListForFullScreenMap === null) {
                    setNearbyOffersListForFullScreenMap([]);
                }

                if (reloadNearbyDueToPermissionsChange) {
                    setIsLoadingOnlineInProgress(false);
                    setIsLoadingClickOnlyOnlineInProgress(false);
                    setIsLoadingNearbyOffersInProgress(false);
                    setIsLoadingNearbyOffersForHorizontalMapInProgress(false)
                    setAreOffersForMainHorizontalMapLoaded(false);
                    setIsLoadingNearbyOffersForFullScreenMapInProgress(false);
                    setAreOffersForFullScreenMapLoaded(false);
                    setNoNearbyOffersToLoad(false);
                    setNoOnlineOffersToLoad(false);
                    setReloadNearbyDueToPermissionsChange(false);
                }

                /**
                 * pre-emptively load in parallel:
                 * - nearby offers for main horizontal map
                 * - nearby premier
                 * - nearby regular
                 * - online premier
                 * - online regular offers
                 * - click-only online premier
                 * - click-only online regular offers
                 * - all categorized offers (online + nearby)
                 */
                nearbyOfferList !== undefined && nearbyOfferList !== null && numberOfNearbyFailedCalls < 6 && nearbyOfferList.length < 6 && !loadingNearbyOffersInProgress &&
                !noNearbyOffersToLoad &&
                loadPremierNearbyData().then(() => {
                    loadNearbyData()
                });

                onlineOfferList !== undefined && onlineOfferList !== null && numberOfOnlineFailedCalls < 6 && onlineOfferList.length < 29 && !loadingOnlineInProgress &&
                loadPremierOnlineData().then(() => {
                    loadOnlineData()
                });

                clickOnlyOnlineOfferList !== undefined && clickOnlyOnlineOfferList !== null && numberOfClickOnlyOnlineFailedCalls < 6 && clickOnlyOnlineOfferList.length < 10 && !loadingClickOnlyOnlineInProgress &&
                loadPremierClickOnlyOnlineData().then(() => {
                    loadClickOnlyOnlineData()
                })

                nearbyOffersListForMainHorizontalMap !== undefined && nearbyOffersListForMainHorizontalMap !== null &&
                numberOfFailedHorizontalMapOfferCalls < 6 && !loadingNearbyOffersForHorizontalMapInProgress && !areOffersForMainHorizontalMapLoaded && nearbyOffersListForMainHorizontalMap.length === 0 &&
                loadNearbyDataForMainHorizontalMap().then(() => {
                });

                nearbyOffersListForFullScreenMap !== undefined && nearbyOffersListForFullScreenMap !== null &&
                numberOfFailedHorizontalMapOfferCalls < 6 && !loadingNearbyOffersForFullScreenMapInProgress && !areOffersForFullScreenMapLoaded && nearbyOffersListForFullScreenMap.length === 0 &&
                loadNearbyDataForFullScreenMap().then(() => {
                });
            }
            if (envInfo.envName === Stages.PROD) {
                // sometimes recoil messes up the state, so we're here to correct it
                if (onlineOfferList === null) {
                    setOnlineOfferList([]);
                }
                if (clickOnlyOnlineOfferList === null) {
                    setClickOnlyOnlineOfferList([]);
                }
                if (nearbyOfferList === null) {
                    setNearbyOfferList([]);
                }
                if (nearbyOffersListForMainHorizontalMap === null) {
                    setNearbyOffersListForMainHorizontalMap([]);
                }
                if (nearbyOffersListForFullScreenMap === null) {
                    setNearbyOffersListForFullScreenMap([]);
                }

                if (reloadNearbyDueToPermissionsChange) {
                    setIsLoadingOnlineInProgress(false);
                    setIsLoadingClickOnlyOnlineInProgress(false);
                    setIsLoadingNearbyOffersInProgress(false);
                    setIsLoadingNearbyOffersForHorizontalMapInProgress(false)
                    setAreOffersForMainHorizontalMapLoaded(false);
                    setIsLoadingNearbyOffersForFullScreenMapInProgress(false);
                    setAreOffersForFullScreenMapLoaded(false);
                    setNoNearbyOffersToLoad(false);
                    setNoOnlineOffersToLoad(false);
                    setReloadNearbyDueToPermissionsChange(false);
                }

                /**
                 * pre-emptively load in parallel:
                 * - nearby offers for main horizontal map
                 * - nearby premier
                 * - nearby regular
                 * - online premier
                 * - online regular offers
                 * - click-only online premier
                 * - click-only online regular offers
                 * - all categorized offers (online + nearby)
                 */
                nearbyOfferList !== undefined && nearbyOfferList !== null && numberOfNearbyFailedCalls < 6 && nearbyOfferList.length < 6 && !loadingNearbyOffersInProgress &&
                !noNearbyOffersToLoad &&
                loadPremierNearbyData().then(() => {
                    loadNearbyData()
                });

                onlineOfferList !== undefined && onlineOfferList !== null && numberOfOnlineFailedCalls < 6 && onlineOfferList.length < 29 && !loadingOnlineInProgress &&
                loadPremierOnlineData().then(() => {
                    loadOnlineData()
                });

                clickOnlyOnlineOfferList !== undefined && clickOnlyOnlineOfferList !== null && numberOfClickOnlyOnlineFailedCalls < 6 && clickOnlyOnlineOfferList.length < 29 && !loadingClickOnlyOnlineInProgress &&
                loadPremierClickOnlyOnlineData().then(() => {
                    loadClickOnlyOnlineData()
                })

                nearbyOffersListForMainHorizontalMap !== undefined && nearbyOffersListForMainHorizontalMap !== null &&
                numberOfFailedHorizontalMapOfferCalls < 6 && !loadingNearbyOffersForHorizontalMapInProgress && !areOffersForMainHorizontalMapLoaded && nearbyOffersListForMainHorizontalMap.length === 0 &&
                loadNearbyDataForMainHorizontalMap().then(() => {
                });

                nearbyOffersListForFullScreenMap !== undefined && nearbyOffersListForFullScreenMap !== null &&
                numberOfFailedHorizontalMapOfferCalls < 6 && !loadingNearbyOffersForFullScreenMapInProgress && !areOffersForFullScreenMapLoaded && nearbyOffersListForFullScreenMap.length === 0 &&
                loadNearbyDataForFullScreenMap().then(() => {
                });
            }
        }

        /**
         * Function used to contact support, via the native messaging application.
         */
        const contactSupport = async (): Promise<void> => {
            const isAvailable = await SMS.isAvailableAsync();
            if (isAvailable) {
                // customize the SMS message below
                const result = await SMS.sendSMSAsync(
                    ['210-744-6222'],
                    'Hello I would like some help with: ',
                    {}
                );
                // switch based on the result received from the async SMS action
                switch (result.result) {
                    case 'sent':
                        const messageSent = 'Message sent!';
                        console.log(messageSent);
                        await logEvent(messageSent, LoggingLevel.Info, userIsAuthenticated);
                        break;
                    case 'unknown':
                        const messageUnknown = 'Unknown error has occurred while attempting to send a message!';
                        console.log(messageUnknown);
                        await logEvent(messageUnknown, LoggingLevel.Info, userIsAuthenticated);
                        break;
                    case 'cancelled':
                        const messageWasCancelled = 'Message was cancelled!';
                        console.log(messageWasCancelled);
                        await logEvent(messageWasCancelled, LoggingLevel.Info, userIsAuthenticated);
                        break;
                }
            } else {
                // there's no SMS available on this device
                const messageWasCancelled = 'no SMS available';
                console.log(messageWasCancelled);
                await logEvent(messageWasCancelled, LoggingLevel.Warning, userIsAuthenticated);
            }
        }

        // return the component for the Authentication stack
        return (
            <>
                {
                    authScreen === null ?
                        <Spinner loadingSpinnerShown={loadingSpinnerShown} setLoadingSpinnerShown={setLoadingSpinnerShown}/>
                        :
                        <View style={{flex: 1, backgroundColor: '#313030'}}>
                            <Stack.Navigator
                                initialRouteName={authScreen == 'SignIn' ? "SignIn" : 'Registration'}
                                screenOptions={{
                                    headerShown: false,
                                    gestureEnabled: false
                                }}
                            >
                                <Stack.Screen
                                    name="SignIn"
                                    component={SignInComponent}
                                    initialParams={{}}
                                />
                                <Stack.Screen
                                    name="Registration"
                                    component={RegistrationComponent}
                                    options={({navigation}) => {
                                        return ({
                                            headerTitle: '',
                                            headerShown: true,
                                            headerTransparent: true,
                                            headerRight: () => {
                                                return useRecoilValue(registrationBackButtonShown) || (stepNumber >= 3 && stepNumber !== 8)
                                                    ? (
                                                        <IconButton
                                                            icon="help"
                                                            iconColor={"#F2FF5D"}
                                                            size={hp(3)}
                                                            style={[commonStyles.backButton, !isRegistrationReady && {display: 'none'}]}
                                                            onPress={async () => {
                                                                // go to the support
                                                                await contactSupport();
                                                            }}
                                                        />) : <>{}</>
                                            },
                                            headerLeft: () => {
                                                return useRecoilValue(registrationBackButtonShown)
                                                    ?
                                                    (<IconButton
                                                        icon="chevron-left"
                                                        iconColor={"#FFFFFF"}
                                                        size={hp(3)}
                                                        style={[commonStyles.backButton, !isRegistrationReady && {display: 'none'}]}
                                                        onPress={() => {
                                                            // clear the registration values
                                                            // step -1
                                                            setCurrentMemberAffiliation(null);
                                                            // step 0
                                                            setFirstName("");
                                                            setLastName("");
                                                            setEmail("");
                                                            setBirthday("");
                                                            setPhoneNumber("");
                                                            setDutyStatus("");
                                                            setEnlistingYear("");
                                                            // step 1
                                                            setAddressLine("");
                                                            setAddressCity("");
                                                            setAddressZip("");
                                                            setAddressState("");
                                                            setMilitaryBranch("");
                                                            // step 2
                                                            setPassword("");
                                                            setConfirmationPassword("");
                                                            setAccountRegistrationDisclaimer(false);
                                                            setAmplifySignUpErrors([]);
                                                            // do not need to clear next steps because back button won't be shown for subsequent ones

                                                            // main registration error reset
                                                            setRegistrationMainError(false);
                                                            setStepNumber(-1);

                                                            // navigate to the AppOverviewComponent page - in case we have not already been to the SignIn
                                                            if (isLoadingAppOverviewNeeded) {
                                                                // navigate to the SignIn page - in case we have already been there
                                                                mainRootNavigation && mainRootNavigation!.navigate('AppOverview', {
                                                                    marketplaceCache: route.params.marketplaceCache,
                                                                    cache: route.params.cache,
                                                                    expoPushToken: route.params.expoPushToken,
                                                                    onLayoutRootView: route.params.onLayoutRootView
                                                                });
                                                            } else {
                                                                // navigate to the SignIn page - in case we have already been there
                                                                navigation.navigate('SignIn', {});
                                                            }
                                                        }}
                                                    />)
                                                    : (stepNumber === 4 || stepNumber === 7 ?
                                                        <TouchableOpacity
                                                            style={[styles.buttonSkip, !isRegistrationReady && {display: 'none'}]}
                                                            onPress={async () => {
                                                                if (stepNumber === 4) {
                                                                    // skip the current step
                                                                    setStepNumber(stepNumber + 1);

                                                                    // clear the registration error
                                                                    setRegistrationMainError(false);
                                                                } else {
                                                                    // clear the registration error
                                                                    setRegistrationMainError(false);

                                                                    setIsReady(false);
                                                                    /**
                                                                     * if everything was successful, then:
                                                                     * - we just cache the list of:
                                                                     *      - Fidelis partners for initial load (for 1 week only)
                                                                     *     - the list of premier click-only online offers
                                                                     *      - the list of click-only online offers (first page only) for initial load (for 1 week only)
                                                                     *      - the list of online offers (first page only) for initial load (for 1 week only)
                                                                     *      - the list of offers near user's home address (first page only) for initial load (for 1 week only)
                                                                     *       - the list of categorized online offers
                                                                     * - we just cache an empty profile photo for the user for initial load
                                                                     */
                                                                    if (marketplaceCache && await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-fidelisPartners`) !== null) {
                                                                        const message = 'old Fidelis Partners are cached, needs cleaning up';
                                                                        console.log(message);
                                                                        await logEvent(message, LoggingLevel.Info, userIsAuthenticated);

                                                                        await marketplaceCache!.removeItem(`${userInformation["custom:userId"]}-fidelisPartners`);
                                                                        await marketplaceCache!.setItem(`${userInformation["custom:userId"]}-fidelisPartners`, await retrieveFidelisPartnerList());
                                                                    } else {
                                                                        const message = 'Fidelis Partners are not cached';
                                                                        console.log(message);
                                                                        await logEvent(message, LoggingLevel.Info, userIsAuthenticated);

                                                                        marketplaceCache && marketplaceCache!.setItem(`${userInformation["custom:userId"]}-fidelisPartners`, await retrieveFidelisPartnerList());
                                                                    }
                                                                    if (marketplaceCache && await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-onlineOffers`) !== null) {
                                                                        const message = 'online offers are cached, needs cleaning up';
                                                                        console.log(message);
                                                                        await logEvent(message, LoggingLevel.Info, userIsAuthenticated);

                                                                        await marketplaceCache!.removeItem(`${userInformation["custom:userId"]}-onlineOffers`);

                                                                        // retrieve the premier online, and regular online offers
                                                                        const onlineOffers = await retrieveOnlineOffersList(
                                                                            numberOfOnlineFailedCalls, setNumberOfOnlineFailedCalls,
                                                                            numberOfOnlineOffers, setNumberOfOnlineOffers);
                                                                        const premierOnlineOffers = await retrievePremierOnlineOffersList(numberOfOnlineFailedCalls, setNumberOfOnlineFailedCalls);

                                                                        // update the number of available total online offers
                                                                        premierOnlineOffers !== undefined && premierOnlineOffers !== null && setNumberOfOnlineOffers(oldNumberOfOnlineOffers => {
                                                                            return oldNumberOfOnlineOffers + premierOnlineOffers.length
                                                                        });

                                                                        await marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineOffers`,
                                                                            [...premierOnlineOffers, ...onlineOffers]);
                                                                    } else {
                                                                        const message = 'online offers are not cached';
                                                                        console.log(message);
                                                                        await logEvent(message, LoggingLevel.Info, userIsAuthenticated);

                                                                        // retrieve the premier online, and regular online offers
                                                                        const onlineOffers = await retrieveOnlineOffersList(
                                                                            numberOfOnlineFailedCalls, setNumberOfOnlineFailedCalls,
                                                                            numberOfOnlineOffers, setNumberOfOnlineOffers);
                                                                        const premierOnlineOffers = await retrievePremierOnlineOffersList(numberOfOnlineFailedCalls, setNumberOfOnlineFailedCalls);

                                                                        // update the number of available total online offers
                                                                        premierOnlineOffers !== undefined && premierOnlineOffers !== null && setNumberOfOnlineOffers(oldNumberOfOnlineOffers => {
                                                                            return oldNumberOfOnlineOffers + premierOnlineOffers.length
                                                                        });

                                                                        marketplaceCache && marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineOffers`,
                                                                            [...premierOnlineOffers, ...onlineOffers]);
                                                                    }
                                                                    if (marketplaceCache && await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-clickOnlyOnlineOffers`) !== null) {
                                                                        const message = 'click-only online offers are cached, needs cleaning up';
                                                                        console.log(message);
                                                                        await logEvent(message, LoggingLevel.Info, userIsAuthenticated);

                                                                        await marketplaceCache!.removeItem(`${userInformation["custom:userId"]}-clickOnlyOnlineOffers`);

                                                                        // retrieve the premier click-only online, and regular click-only online offers
                                                                        const clickOnlyOnlineOffers = await retrieveClickOnlyOnlineOffersList(
                                                                            numberOfClickOnlyOnlineFailedCalls, setNumberOfClickOnlyOnlineFailedCalls,
                                                                            numberOfClickOnlyOnlineOffers, setNumberOfClickOnlyOnlineOffers)
                                                                        const premierClickOnlyOnlineOffers = await retrievePremierClickOnlyOnlineOffersList(numberOfClickOnlyOnlineFailedCalls, setNumberOfClickOnlyOnlineFailedCalls);

                                                                        // update the number of available total online offers
                                                                        premierClickOnlyOnlineOffers !== undefined && premierClickOnlyOnlineOffers !== null && setNumberOfClickOnlyOnlineOffers(oldNumberOfClickOnlyOnlineOffers => {
                                                                            return oldNumberOfClickOnlyOnlineOffers + premierClickOnlyOnlineOffers.length
                                                                        });

                                                                        await marketplaceCache!.setItem(`${userInformation["custom:userId"]}-clickOnlyOnlineOffers`,
                                                                            [...premierClickOnlyOnlineOffers, ...clickOnlyOnlineOffers]);
                                                                    } else {
                                                                        const message = 'online click-only offers are not cached';
                                                                        console.log(message);
                                                                        await logEvent(message, LoggingLevel.Info, userIsAuthenticated);
                                                                        // retrieve the premier click-only online, and regular click-only online offers
                                                                        const clickOnlyOnlineOffers = await retrieveClickOnlyOnlineOffersList(
                                                                            numberOfClickOnlyOnlineFailedCalls, setNumberOfClickOnlyOnlineFailedCalls,
                                                                            numberOfClickOnlyOnlineOffers, setNumberOfClickOnlyOnlineOffers);
                                                                        const premierClickOnlyOnlineOffers = await retrievePremierClickOnlyOnlineOffersList(numberOfClickOnlyOnlineFailedCalls, setNumberOfClickOnlyOnlineFailedCalls);

                                                                        // update the number of available total online offers
                                                                        premierClickOnlyOnlineOffers !== undefined && premierClickOnlyOnlineOffers !== null && setNumberOfClickOnlyOnlineOffers(oldNumberOfClickOnlyOnlineOffers => {
                                                                            return oldNumberOfClickOnlyOnlineOffers + premierClickOnlyOnlineOffers.length
                                                                        });

                                                                        marketplaceCache && marketplaceCache!.setItem(`${userInformation["custom:userId"]}-clickOnlyOnlineOffers`,
                                                                            [...premierClickOnlyOnlineOffers, ...clickOnlyOnlineOffers]);
                                                                    }
                                                                    if (globalCache && await globalCache!.getItem(`${userInformation["custom:userId"]}-profilePictureURI`) !== null) {
                                                                        const message = 'old profile picture is cached, needs cleaning up';
                                                                        console.log(message);
                                                                        await logEvent(message, LoggingLevel.Info, userIsAuthenticated);
                                                                        await globalCache!.removeItem(`${userInformation["custom:userId"]}-profilePictureURI`);
                                                                        await globalCache!.setItem(`${userInformation["custom:userId"]}-profilePictureURI`, "");
                                                                    } else {
                                                                        const message = 'profile picture is not cached';
                                                                        console.log(message);
                                                                        await logEvent(message, LoggingLevel.Info, userIsAuthenticated);
                                                                        globalCache && globalCache!.setItem(`${userInformation["custom:userId"]}-profilePictureURI`, "");
                                                                    }
                                                                    setIsReady(true);

                                                                    // go to the dashboard
                                                                    navigation.navigate("AppDrawer", {});
                                                                }
                                                            }}
                                                        >
                                                            <Text style={styles.buttonSkipText}>Skip</Text>
                                                        </TouchableOpacity> : <></>)
                                            }
                                        })
                                    }}
                                    initialParams={{}}
                                />
                                <Stack.Screen
                                    name="AccountRecovery"
                                    component={AccountRecoveryComponent}
                                    initialParams={{}}
                                />
                                <Stack.Screen
                                    name="AppDrawer"
                                    component={AppDrawer}
                                    initialParams={{}}
                                />
                                <Stack.Screen
                                    name="DocumentsViewer"
                                    component={DocumentsViewer}
                                    initialParams={{}}
                                />
                            </Stack.Navigator>
                        </View>
                }
            </>
        );
    }
;

