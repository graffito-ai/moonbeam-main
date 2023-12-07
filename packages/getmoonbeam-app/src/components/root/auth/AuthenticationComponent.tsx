import React, {useEffect, useState} from "react";
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
    amplifySignUpProcessErrorsState,
    birthdayState,
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
import {TouchableOpacity, View} from "react-native";
import {commonStyles} from "../../../styles/common.module";
import {AppDrawer} from "../drawer/AppDrawer";
import {DocumentsViewer} from "../../common/DocumentsViewer";
import * as SMS from "expo-sms";
import {styles} from "../../../styles/registration.module";
import {
    appUpgradeCheck,
    retrieveFidelisPartnerList,
    retrieveOffersNearby,
    retrieveOffersNearbyForMap,
    retrieveOnlineOffersList,
    retrievePremierOffersNearby,
    retrievePremierOnlineOffersList,
    updateUserAuthStat
} from "../../../utils/AppSync";
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';
import {PremierOnlineProdOfferIds, Stages, UserAuthSessionResponse} from "@moonbeam/moonbeam-models";
import {currentUserLocationState, firstTimeLoggedInState} from "../../../recoil/RootAtom";
import * as envInfo from "../../../../local-env-info.json";
import {
    locationServicesButtonState,
    nearbyOffersListForFullScreenMapState,
    nearbyOffersListForMainHorizontalMapState,
    nearbyOffersListState,
    nearbyOffersPageNumberState,
    noNearbyOffersToLoadState,
    noOnlineOffersToLoadState,
    numberOfOffersWithin25MilesState,
    numberOfOffersWithin5MilesState,
    numberOfOnlineOffersState,
    offersNearUserLocationFlagState,
    onlineOffersListState,
    onlineOffersPageNumberState,
    premierNearbyOffersPageNumberState,
    premierOnlineOffersPageNumberState,
    reloadNearbyDueToPermissionsChangeState,
} from "../../../recoil/StoreOfferAtom";
import {registerListener, removeListener} from "../../../utils/AmplifyHub";
import * as Location from "expo-location";
import {LocationObject} from "expo-location";
import {
    branchRootUniversalObjectState,
    referralCodeMarketingCampaignState,
    referralCodeState
} from "../../../recoil/BranchAtom";
import {initializeBranch} from "../../../utils/Branch";
import {Spinner} from "../../common/Spinner";
import branch from "react-native-branch";

/**
 * Authentication component.
 *
 * @constructor constructor for the component.
 */
export const AuthenticationComponent = ({route, navigation}: AuthenticationProps) => {
        // constants used to keep track of local component state
        const [branchInitialized, setIsBranchInitialized] = useState<boolean>(false);
        const [latestReferringParamsChecked, setLatestReferringParamsChecked] = useState<boolean>(false);
        const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
        const [appUpgradeChecked, setAppUpgradeChecked] = useState<boolean>(false);
        const [checkedOnlineCache, setCheckOnlineCache] = useState<boolean>(false);
        const [loadingNearbyOffersInProgress, setIsLoadingNearbyOffersInProgress] = useState<boolean>(false);
        const [loadingOnlineInProgress, setIsLoadingOnlineInProgress] = useState<boolean>(false);
        const [noPremierOnlineOffersToLoad, setNoPremierOnlineOffersToLoad] = useState<boolean>(false);
        const [loadingNearbyOffersForHorizontalMapInProgress, setIsLoadingNearbyOffersForHorizontalMapInProgress] = useState<boolean>(false);
        const [areOffersForMainHorizontalMapLoaded, setAreOffersForMainHorizontalMapLoaded] = useState<boolean>(false);
        const [loadingNearbyOffersForFullScreenMapInProgress, setIsLoadingNearbyOffersForFullScreenMapInProgress] = useState<boolean>(false);
        const [areOffersForFullScreenMapLoaded, setAreOffersForFullScreenMapLoaded] = useState<boolean>(false);
        // constants used to keep track of shared states
        const [userIsAuthenticated, setIsUserAuthenticated] = useRecoilState(userIsAuthenticatedState);
        const [, setReferralCodeMarketingCampaign] = useRecoilState(referralCodeMarketingCampaignState);
        const [, setReferralCode] = useRecoilState(referralCodeState);
        const [authScreen, setAuthScreen] = useRecoilState(initialAuthenticationScreen);
        const [numberOfOnlineOffers, setNumberOfOnlineOffers] = useRecoilState(numberOfOnlineOffersState);
        const [numberOfOffersWithin5Miles, setNumberOfOffersWithin5Miles] = useRecoilState(numberOfOffersWithin5MilesState);
        const [numberOfOffersWithin25Miles, setNumberOfOffersWithin25Miles] = useRecoilState(numberOfOffersWithin25MilesState);
        const [currentUserLocation, setCurrentUserLocation] = useRecoilState(currentUserLocationState);
        const [nearbyOffersPageNumber, setNearbyOffersPageNumber] = useRecoilState(nearbyOffersPageNumberState);
        const [premierNearbyOffersPageNumber, setPremierNearbyOffersPageNumber] = useRecoilState(premierNearbyOffersPageNumberState);
        const [onlineOffersPageNumber, setOnlineOffersPageNumber] = useRecoilState(onlineOffersPageNumberState);
        const [premierOnlineOffersPageNumber, setPremierOnlineOffersPageNumber] = useRecoilState(premierOnlineOffersPageNumberState);
        const [noOnlineOffersToLoad, setNoOnlineOffersToLoad] = useRecoilState(noOnlineOffersToLoadState);
        const [noNearbyOffersToLoad, setNoNearbyOffersToLoad] = useRecoilState(noNearbyOffersToLoadState);
        const [, setOffersNearUserLocationFlag] = useRecoilState(offersNearUserLocationFlagState);
        const [reloadNearbyDueToPermissionsChange, setReloadNearbyDueToPermissionsChange] = useRecoilState(reloadNearbyDueToPermissionsChangeState);
        const [, setLocationServicesButtonState] = useRecoilState(locationServicesButtonState);
        const [nearbyOffersListForMainHorizontalMap, setNearbyOffersListForMainHorizontalMap] = useRecoilState(nearbyOffersListForMainHorizontalMapState);
        const [nearbyOffersListForFullScreenMap, setNearbyOffersListForFullScreenMap] = useRecoilState(nearbyOffersListForFullScreenMapState);
        const [nearbyOfferList, setNearbyOfferList] = useRecoilState(nearbyOffersListState);
        const [onlineOfferList, setOnlineOfferList] = useRecoilState(onlineOffersListState);
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

        /**
         * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
         * auth-related functionality for example), as well as any afferent API calls.
         *
         * Generally speaking, any functionality imperative prior to the full page-load should be
         * included in here.
         */
        useEffect(() => {
            // handle incoming deep-links through the latest referring params of the Branch SDK
            !latestReferringParamsChecked && branch.getLatestReferringParams(false).then(params => {
                setLatestReferringParamsChecked(true);
                if (params) {
                    if (params['~tags'] && params['~tags'].length === 2) {
                        // set the referral code to be used during registration
                        setReferralCode(params['~tags'][0].toString());

                        // set the marketing campaign code used for the referral
                        setReferralCodeMarketingCampaign(params['~tags'][1].toString());

                        // re-direct to the registration screen
                        setAuthScreen('Registration');
                    }
                }
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

            // load the store data if the cache is null
            userIsAuthenticated && loadStoreData().then(() => {
                // once a user is authenticated, then initialize the Branch.io SDK appropriately
                !branchInitialized && initializeBranch(userInformation).then(rootBUO => {
                    setBranchRootUniversalObject(rootBUO);
                    setIsBranchInitialized(true);
                });

                // check if the user needs to upgrade the app (forcefully or not - in case of breaking changes)
                !appUpgradeChecked && appUpgradeCheck().then(() => {
                    setAppUpgradeChecked(true);
                });
            });

            /**
             * initialize the Amplify Hub, and start listening to various events, that would help in capturing important metrics,
             * and/or making specific decisions.
             */
            registerListener('auth', 'amplify_auth_listener', async (data) => {
                switch (data.payload.event) {
                    case 'signIn':
                        console.log(`user signed in`);
                        setIsUserAuthenticated(true);
                        // update the user auth session statistics
                        const userAuthSessionResponse: UserAuthSessionResponse = await updateUserAuthStat(data.payload.data.attributes["custom:userId"]);
                        // check if the user auth stat has successfully been updated
                        if (userAuthSessionResponse.data !== null && userAuthSessionResponse.data !== undefined) {
                            console.log('Successfully updated user auth stat during sign in!');
                            // check if this sign in session, is the first time that the user logged in
                            if (userAuthSessionResponse.data.numberOfSessions === 1 &&
                                userAuthSessionResponse.data.createdAt === userAuthSessionResponse.data.updatedAt) {
                                console.log(`User ${userAuthSessionResponse.data.id} logged in for the first time!`);
                                setFirstTimeLoggedIn(true);
                            } else {
                                console.log(`User ${userAuthSessionResponse.data.id} not logged in for the first time!`);
                                setFirstTimeLoggedIn(false);
                            }
                        } else {
                            console.log('Unsuccessfully updated user auth stat during sign in!');
                        }
                        break;
                    case 'signOut':
                        setIsUserAuthenticated(false);
                        /**
                         * Amplify automatically manages the sessions, and when the session token expires, it will log out the user and send an event
                         * here. What we do then is intercept that event, and since the user Sign-Out has already happened, we will perform the cleanup that
                         * we usually do in our Sign-Out functionality, without actually signing the user out.
                         */
                        console.log(`user signed out`);
                        // remove listener on sign out action
                        removeListener('auth', 'amplify_auth_listener');
                        break;
                    case 'configured':
                        console.log('the Auth module is successfully configured!');
                        break;
                }
            });
        }, [
            userIsAuthenticated, reloadNearbyDueToPermissionsChange,
            noNearbyOffersToLoad, nearbyOfferList, onlineOfferList,
            marketplaceCache, loadingOnlineInProgress, noOnlineOffersToLoad,
            appUpgradeChecked, authScreen, latestReferringParamsChecked,
            branchInitialized
        ]);

        /**
         * Function used to load the online data
         */
        const loadOnlineData = async (): Promise<void> => {
            setTimeout(async () => {
                setIsLoadingOnlineInProgress(true);

                const additionalOnlineOffers = await retrieveOnlineOffersList(numberOfOnlineOffers, setNumberOfOnlineOffers, onlineOffersPageNumber, setOnlineOffersPageNumber);
                if (additionalOnlineOffers.length === 0) {
                    // setNoOnlineOffersToLoad(true);
                    setOnlineOfferList(oldOnlineOfferList => {
                        return [...oldOnlineOfferList, ...additionalOnlineOffers]
                    });
                } else {
                    setNoOnlineOffersToLoad(false);
                    setOnlineOfferList(oldOnlineOfferList => {
                        return [...oldOnlineOfferList, ...additionalOnlineOffers]
                    });
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

                const premierOnlineOffers = await retrievePremierOnlineOffersList(premierOnlineOffersPageNumber, setPremierOnlineOffersPageNumber);

                if (premierOnlineOffers.length !== 0) {
                    setNoPremierOnlineOffersToLoad(false);
                    setOnlineOfferList(oldOnlineOfferList => {
                        return [...premierOnlineOffers, ...oldOnlineOfferList]
                    });
                } else {
                    // setNoPremierOnlineOffersToLoad(true);
                    setOnlineOfferList(oldOnlineOfferList => {
                        return [...premierOnlineOffers, ...oldOnlineOfferList]
                    });
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
                    retrieveOffersNearby(nearbyOffersPageNumber, setNearbyOffersPageNumber,
                        premierNearbyOffersPageNumber, setPremierNearbyOffersPageNumber,
                        userInformation, setOffersNearUserLocationFlag, marketplaceCache, currentUserLocation,
                        setCurrentUserLocation, numberOfOffersWithin25Miles, setNumberOfOffersWithin25Miles);
                if (offersNearby === null) {
                    setIsLoadingNearbyOffersInProgress(false);
                    setNoNearbyOffersToLoad(true);
                    setLocationServicesButtonState(true);
                } else if (offersNearby.length === 0) {
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
                    retrieveOffersNearbyForMap(userInformation, currentUserLocation, setCurrentUserLocation,
                        numberOfOffersWithin5Miles, setNumberOfOffersWithin5Miles);
                if (offersNearby === null) {
                    setIsLoadingNearbyOffersForHorizontalMapInProgress(false);
                    setAreOffersForMainHorizontalMapLoaded(true);
                } else if (offersNearby.length === 0) {
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
                    retrieveOffersNearbyForMap(userInformation, currentUserLocation, setCurrentUserLocation,
                        undefined, undefined, true);
                if (offersNearby === null) {
                    setIsLoadingNearbyOffersForFullScreenMapInProgress(false);
                    setAreOffersForFullScreenMapLoaded(true);
                } else if (offersNearby.length === 0) {
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
                    retrievePremierOffersNearby(premierNearbyOffersPageNumber, setPremierNearbyOffersPageNumber, currentUserLocation, setCurrentUserLocation);
                if (premierOffersNearby === null) {
                    setIsLoadingNearbyOffersInProgress(false);
                } else if (premierOffersNearby.length === 0 || nearbyOfferList.length >= 1) {
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
            // set the current user's position accordingly, if not already set
            if (currentUserLocation === null) {
                const foregroundPermissionStatus = await Location.requestForegroundPermissionsAsync();
                if (foregroundPermissionStatus.status !== 'granted') {
                    const errorMessage = `Permission to access location was not granted!`;
                    console.log(errorMessage);

                    setCurrentUserLocation(null);
                } else {
                    const lastKnownPositionAsync: LocationObject | null = await Location.getLastKnownPositionAsync();
                    setCurrentUserLocation(lastKnownPositionAsync !== null ? lastKnownPositionAsync : await Location.getCurrentPositionAsync());
                }
            }

            // check to see if we have cached Online Offers. If we do, set them appropriately
            const onlineOffersCached = await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-onlineOffers`);
            if (marketplaceCache !== null && onlineOffersCached !== null && onlineOffersCached.length !== 0 && !checkedOnlineCache) {
                console.log('pre-emptively loading - online offers are cached');
                setCheckOnlineCache(true);
                const cachedOnlineOffers = await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-onlineOffers`);
                setOnlineOfferList(cachedOnlineOffers);

                setIsLoadingOnlineInProgress(false);
                (cachedOnlineOffers === null || cachedOnlineOffers.length < 20) && await marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineOffers`, null);
            }

            // stop caching online offers until we have at least 20 and at most 100 offers loaded, or until we run out of offers to load.
            if ((marketplaceCache && onlineOfferList.length >= 20 && onlineOfferList.length < 100) || (marketplaceCache && noOnlineOffersToLoad)) {
                marketplaceCache!.getItem(`${userInformation["custom:userId"]}-onlineOffers`).then(onlineOffersCached => {
                    // check if there's really a need for caching
                    if (((onlineOffersCached !== null && onlineOffersCached.length < onlineOfferList.length) || onlineOffersCached === null)) {
                        console.log('Caching additional online offers');
                        marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineOffers`, onlineOfferList);
                    }
                });
            }

            if (envInfo.envName === Stages.DEV) {
                if (reloadNearbyDueToPermissionsChange) {
                    setIsLoadingOnlineInProgress(false);
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
                 * - all categorized offers (online + nearby)
                 */
                await Promise.all([
                    !loadingNearbyOffersInProgress && !noNearbyOffersToLoad && loadPremierNearbyData(),
                    !loadingNearbyOffersInProgress && !noNearbyOffersToLoad && nearbyOfferList.length < 20 && loadNearbyData()
                ]);
                await Promise.all([
                    !loadingOnlineInProgress && !noPremierOnlineOffersToLoad && onlineOfferList.length < PremierOnlineProdOfferIds.length && loadPremierOnlineData(),
                    !loadingOnlineInProgress && !noOnlineOffersToLoad && ((PremierOnlineProdOfferIds.length <= onlineOfferList.length) || noPremierOnlineOffersToLoad) && onlineOfferList.length < 50 && loadOnlineData()
                ]);
                await Promise.all([
                    !loadingNearbyOffersForHorizontalMapInProgress && !areOffersForMainHorizontalMapLoaded && nearbyOffersListForMainHorizontalMap.length === 0 && loadNearbyDataForMainHorizontalMap(),
                    !loadingNearbyOffersForFullScreenMapInProgress && !areOffersForFullScreenMapLoaded && nearbyOffersListForFullScreenMap.length === 0 && loadNearbyDataForFullScreenMap()
                ]);
            }
            if (envInfo.envName === Stages.PROD) {
                if (reloadNearbyDueToPermissionsChange) {
                    setIsLoadingOnlineInProgress(false);
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
                 * - all categorized offers (online + nearby)
                 */
                nearbyOfferList.length < 6 && !loadingNearbyOffersInProgress && await Promise.all([
                    loadPremierNearbyData(),
                    loadNearbyData()
                ]);
                onlineOfferList.length < 29 && !loadingOnlineInProgress && await Promise.all([
                    loadPremierOnlineData(),
                    loadOnlineData()
                ]);
                await Promise.all([
                    !loadingNearbyOffersForHorizontalMapInProgress && !areOffersForMainHorizontalMapLoaded && nearbyOffersListForMainHorizontalMap.length === 0 && loadNearbyDataForMainHorizontalMap(),
                    !loadingNearbyOffersForFullScreenMapInProgress && !areOffersForFullScreenMapLoaded && nearbyOffersListForFullScreenMap.length === 0 && loadNearbyDataForFullScreenMap()
                ]);

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
                        console.log('Message sent!');
                        break;
                    case 'unknown':
                        console.log('Unknown error has occurred while attempting to send a message!');
                        break;
                    case 'cancelled':
                        console.log('Message was cancelled!');
                        break;
                }
            } else {
                // there's no SMS available on this device
                console.log('no SMS available');
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
                                                            // step 1
                                                            setFirstName("");
                                                            setLastName("");
                                                            setEmail("");
                                                            setBirthday("");
                                                            setPhoneNumber("");
                                                            setDutyStatus("");
                                                            setEnlistingYear("");
                                                            // step 2
                                                            setAddressLine("");
                                                            setAddressCity("");
                                                            setAddressZip("");
                                                            setAddressState("");
                                                            setMilitaryBranch("");
                                                            // step 3
                                                            setPassword("");
                                                            setConfirmationPassword("");
                                                            setAccountRegistrationDisclaimer(false);
                                                            setAmplifySignUpErrors([]);
                                                            // do not need to clear next steps because back button won't be shown for subsequent ones

                                                            // main
                                                            setRegistrationMainError(false);
                                                            setStepNumber(0);

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
                                                                     *      - the list of online offers (first page only) for initial load (for 1 week only)
                                                                     *      - the list of offers near user's home address (first page only) for initial load (for 1 week only)
                                                                     *       - the list of categorized online offers
                                                                     * - we just cache an empty profile photo for the user for initial load
                                                                     */
                                                                    if (marketplaceCache && await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-fidelisPartners`) !== null) {
                                                                        console.log('old Fidelis Partners are cached, needs cleaning up');
                                                                        await marketplaceCache!.removeItem(`${userInformation["custom:userId"]}-fidelisPartners`);
                                                                        await marketplaceCache!.setItem(`${userInformation["custom:userId"]}-fidelisPartners`, await retrieveFidelisPartnerList());
                                                                    } else {
                                                                        console.log('Fidelis Partners are not cached');
                                                                        marketplaceCache && marketplaceCache!.setItem(`${userInformation["custom:userId"]}-fidelisPartners`, await retrieveFidelisPartnerList());
                                                                    }
                                                                    if (marketplaceCache && await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-onlineOffers`) !== null) {
                                                                        console.log('online offers are cached, needs cleaning up');
                                                                        await marketplaceCache!.removeItem(`${userInformation["custom:userId"]}-onlineOffers`);
                                                                        await marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineOffers`,
                                                                            await retrieveOnlineOffersList(numberOfOnlineOffers, setNumberOfOnlineOffers));
                                                                    } else {
                                                                        console.log('online offers are not cached');
                                                                        marketplaceCache && marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineOffers`,
                                                                            await retrieveOnlineOffersList(numberOfOnlineOffers, setNumberOfOnlineOffers));
                                                                    }
                                                                    if (globalCache && await globalCache!.getItem(`${userInformation["custom:userId"]}-profilePictureURI`) !== null) {
                                                                        console.log('old profile picture is cached, needs cleaning up');
                                                                        await globalCache!.removeItem(`${userInformation["custom:userId"]}-profilePictureURI`);
                                                                        await globalCache!.setItem(`${userInformation["custom:userId"]}-profilePictureURI`, "");
                                                                    } else {
                                                                        console.log('profile picture is not cached');
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

