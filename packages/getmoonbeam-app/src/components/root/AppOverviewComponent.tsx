import React, {useEffect, useRef, useState} from "react";
import {ImageBackground, Linking, TouchableOpacity, View} from "react-native";
import {commonStyles} from '../../styles/common.module';
import {styles} from '../../styles/appOverview.module';
import {AppOverviewProps} from "../../models/props/RootProps";
import {LinearGradient} from "expo-linear-gradient";
import {Text} from "react-native-paper";
import GestureRecognizer from 'react-native-swipe-gestures';
import {useRecoilState} from "recoil";
import {
    appUrlState,
    deferToLoginState,
    initialAuthenticationScreen,
    userIsAuthenticatedState
} from "../../recoil/AuthAtom";
import {appOverviewSteps} from "../../models/Constants";
import {requestAppTrackingTransparencyPermission} from "../../utils/Permissions";
import * as SecureStore from "expo-secure-store";
import {referralCodeMarketingCampaignState, referralCodeState} from "../../recoil/BranchAtom";
import Constants from 'expo-constants';
import {AppOwnership} from "expo-constants/src/Constants.types";
import {logEvent} from "../../utils/AppSync";
import {LoggingLevel} from "@moonbeam/moonbeam-models";
import * as ExpoLinking from "expo-linking";
import * as Notifications from "expo-notifications";
/**
 * import branch only if the app is not running in Expo Go (so we can actually run the application without Branch for
 * Expo Go), for easier testing purposes.
 */
const isRunningInExpoGo = Constants.appOwnership === AppOwnership.Expo;

/**
 * AppOverview component.
 *
 * @param route route object to be passed in from the parent navigator.
 * @param navigation navigation object to be passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const AppOverviewComponent = ({route, navigation}: AppOverviewProps) => {
    // constants used to keep track of shared states
    const [userIsAuthenticated, ] = useRecoilState(userIsAuthenticatedState);
    const [appUrl, setAppUrl] = useRecoilState(appUrlState);
    const [appTrackingPermissionsDone, setAreAppTrackingPermissionsDone] = useState<boolean>(false);
    const [, setReferralCodeMarketingCampaign] = useRecoilState(referralCodeMarketingCampaignState);
    const [, setReferralCode] = useRecoilState(referralCodeState);
    const [authScreen, setAuthScreen] = useRecoilState(initialAuthenticationScreen);
    const [deferToLogin, setDeferToLogin] = useRecoilState(deferToLoginState);
    // constants used to keep track of local component state
    const [latestReferringParamsChecked, setLatestReferringParamsChecked] = useState<boolean>(false);
    const [deepLinkingSourced, setDeepLinkingSourced] = useState<boolean>(false);
    const [stepNumber, setStepNumber] = useState<number>(0);

    // notification states and listeners
    const notificationListener = useRef<Notifications.Subscription>();
    const notificationResponseListener = useRef<Notifications.Subscription>();
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
        notificationResponseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            // Do something with the notification/response
            const message = `Incoming notification interaction response received`;
            console.log(message);
            logEvent(message, LoggingLevel.Info, true).then(() => {
            });

            // filter incoming notification action, and set the app url accordingly
            if (response.notification.request.content.data && response.notification.request.content.data.clickAction) {
                // filters for notification click actions for cashback notifications
                if (response.notification.request.content.data.clickAction === 'https://app.moonbeam.vet/transaction/cashback') {
                    ExpoLinking.getInitialURL().then(baseUrl => {
                        setAppUrl(`${baseUrl}/notifications/cashback`);
                    });
                }
            }
        });

        // subscribe to incoming deep-linking attempts in the app overview component
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
            logEvent(errorMessage, LoggingLevel.Error, true).then(() => {});
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

        // import branch accordingly and subscribe to incoming URIs
        let branchUnsubscribe : any = null;
        !isRunningInExpoGo && import('react-native-branch').then((branch) => {
            branchUnsubscribe = branch.default.subscribe({
                onOpenStart: ({ uri, cachedInitialEvent }) => {
                    const message = `Branch subscribe onOpenStart, will open ${uri}, with cachedInitialEvent ${cachedInitialEvent}`;
                    console.log(message);
                    logEvent(message, LoggingLevel.Info, userIsAuthenticated).then(() => {});
                },
                onOpenComplete: async (event) => {
                    const params = event.params;
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
                },
            });
        });
        // import branch accordingly and subscribe to latest referring params
        !isRunningInExpoGo && import('react-native-branch').then((branch) => {
            // handle incoming deep-links through the latest referring params of the Branch SDK
            branch !== null && branch.default !== null && !latestReferringParamsChecked && branch.default.getLatestReferringParams(false).then(async params => {
                setLatestReferringParamsChecked(true);
                setDeepLinkingSourced(true);
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

        // necessary for iOS compliance purposes
        if (!appTrackingPermissionsDone) {
            setAreAppTrackingPermissionsDone(true);
            requestAppTrackingTransparencyPermission().then(_ => {});
        }

        /**
         * We're going to do a try and catch for retrieving items from the Secure Store, since in case
         * of decryption issues this will cause log in errors.
         */
        try {
            // check if we need to skip on the overview screen
            !deepLinkingSourced && SecureStore.getItemAsync(`moonbeam-skip-overview`, {
                requireAuthentication: false // we don't need this to be under authentication, so we can check at login
            }).then(moonbeamSkipOverviewPreference => {
                if (moonbeamSkipOverviewPreference !== null && moonbeamSkipOverviewPreference.length !== 0 && moonbeamSkipOverviewPreference === '1') {
                    /**
                     * navigate to the Authentication component, and set the recoil state accordingly,
                     * in order to display the right subcomponent for Authentication.
                     */
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
        } catch (error) {
            const message = `Unexpected error while retrieving item \'moonbeam-skip-overview\' from SecureStore`;
            console.log(message);
            logEvent(message, LoggingLevel.Warning, userIsAuthenticated).then(() => {});
        }
        if (deferToLogin && !deepLinkingSourced) {
            /**
             * navigate to the Authentication component, and set the recoil state accordingly,
             * in order to display the right subcomponent for Authentication.
             */
            setAuthScreen('SignIn');
            navigation.navigate("Authentication", {
                marketplaceCache: route.params.marketplaceCache,
                cache: route.params.cache,
                currentUserLocation: route.params.currentUserLocation,
                expoPushToken: route.params.expoPushToken,
                onLayoutRootView: route.params.onLayoutRootView
            });
            setDeferToLogin(false);
        }
        return () => {
            notificationListener.current && Notifications.removeNotificationSubscription(notificationListener.current!);
            notificationResponseListener.current && Notifications.removeNotificationSubscription(notificationResponseListener.current!);
            Linking.removeAllListeners('url');
            branchUnsubscribe !== null && branchUnsubscribe();
        };
    }, [lastNotificationResponse, notificationResponseListener, notificationListener,
        deferToLogin, authScreen, deepLinkingSourced, latestReferringParamsChecked,
        appTrackingPermissionsDone, appUrl]);

    // return the component for the AppOverview page
    return (
        <>
            <View style={commonStyles.rowContainer}
                  onLayout={route.params.onLayoutRootView}>
                <LinearGradient
                    colors={['#5B5A5A', 'transparent']}
                    style={styles.topContainer}>
                    <ImageBackground
                        style={[commonStyles.image, styles.topContainerImage]}
                        imageStyle={{
                            resizeMode: 'contain'
                        }}
                        resizeMethod={"scale"}
                        source={appOverviewSteps[stepNumber].stepImageSource}/>
                </LinearGradient>
                <GestureRecognizer
                    onSwipeLeft={() => {
                        if (stepNumber < 3) {
                            // increase the step number
                            let newStepValue = stepNumber + 1;
                            setStepNumber(newStepValue);
                        }
                    }}
                    onSwipeRight={() => {
                        if (stepNumber > 0) {
                            // decrease the step number
                            let newStepValue = stepNumber - 1;
                            setStepNumber(newStepValue);
                        }
                    }}
                    style={styles.bottomContainer}
                >
                    <Text style={styles.bottomContainerTitle}>
                        {appOverviewSteps[stepNumber].stepTitle}
                    </Text>
                    <Text style={styles.bottomContainerContent}>
                        {appOverviewSteps[stepNumber].stepDescription}
                    </Text>
                    <View style={[commonStyles.columnContainer, styles.progressSteps]}>
                        <View style={stepNumber === 0 ? styles.activeStep : styles.inactiveStep}></View>
                        <View style={stepNumber === 1 ? styles.activeStep : styles.inactiveStep}></View>
                        <View style={stepNumber === 2 ? styles.activeStep : styles.inactiveStep}></View>
                        <View style={stepNumber === 3 ? styles.activeStep : styles.inactiveStep}></View>
                    </View>
                    <View style={[commonStyles.columnContainer, styles.bottomContainerButtons]}>
                        <TouchableOpacity
                            style={styles.buttonLeft}
                            onPress={
                                () => {
                                    /**
                                     * navigate to the Authentication component, and set the recoil state accordingly,
                                     * in order to display the right subcomponent for Authentication.
                                     */
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
                        >
                            <Text style={styles.buttonText}>Apply</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.buttonRight}
                            onPress={
                                () => {
                                    /**
                                     * navigate to the Authentication component, and set the recoil state accordingly,
                                     * in order to display the right subcomponent for Authentication.
                                     */
                                    setAuthScreen('SignIn');
                                    navigation.navigate("Authentication", {
                                        marketplaceCache: route.params.marketplaceCache,
                                        cache: route.params.cache,
                                        currentUserLocation: route.params.currentUserLocation,
                                        expoPushToken: route.params.expoPushToken,
                                        onLayoutRootView: route.params.onLayoutRootView
                                    });
                                }
                            }
                        >
                            <Text style={styles.buttonText}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </GestureRecognizer>
            </View>
        </>
    );
};

