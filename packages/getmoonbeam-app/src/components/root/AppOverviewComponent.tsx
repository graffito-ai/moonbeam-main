import React, {useEffect, useState} from "react";
import {ImageBackground, Linking, TouchableOpacity, View} from "react-native";
import {commonStyles} from '../../styles/common.module';
import {styles} from '../../styles/appOverview.module';
import {AppOverviewProps} from "../../models/props/RootProps";
import {LinearGradient} from "expo-linear-gradient";
import {Text} from "react-native-paper";
import GestureRecognizer from 'react-native-swipe-gestures';
import {useRecoilState} from "recoil";
import {deferToLoginState, initialAuthenticationScreen} from "../../recoil/AuthAtom";
import {appOverviewSteps} from "../../models/Constants";
import {requestAppTrackingTransparencyPermission} from "../../utils/Permissions";
import * as SecureStore from "expo-secure-store";
import {referralCodeMarketingCampaignState, referralCodeState} from "../../recoil/BranchAtom";
import branch from "react-native-branch";

/**
 * AppOverview component.
 *
 * @param route route object to be passed in from the parent navigator.
 * @param navigation navigation object to be passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const AppOverviewComponent = ({route, navigation}: AppOverviewProps) => {
    // constants used to keep track of shared states
    const [, setReferralCodeMarketingCampaign] = useRecoilState(referralCodeMarketingCampaignState);
    const [, setReferralCode] = useRecoilState(referralCodeState);
    const [authScreen, setAuthScreen] = useRecoilState(initialAuthenticationScreen);
    const [deferToLogin, setDeferToLogin] = useRecoilState(deferToLoginState);
    // constants used to keep track of local component state
    const [deepLinkingSourced, setDeepLinkingSourced] = useState<boolean>(false);
    const [stepNumber, setStepNumber] = useState<number>(0);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // handle incoming links through the branch subscription mechanism
        // branch.subscribe({
        //     onOpenStart: ({uri, cachedInitialEvent}) => {
        //         console.log(`subscribe onOpenStart, will open ${uri} cachedInitialEvent is ${cachedInitialEvent}`);
        //     },
        //     onOpenComplete: ({error, params, uri}) => {
        //         if (error) {
        //             console.log(params);
        //             console.log(`subscribe onOpenComplete, Error from opening uri ${uri} error ${error}`);
        //             return;
        //         } else if (params) {
        //             if (params['$android_url'] && params['$android_url'].toString().includes('moonbeamfin://register?r=')) {
        //                 // set the referral code to be used during registration
        //                 setReferralCode(params['$android_url'].toString().split('moonbeamfin://register?r=')[1].split('&')[0]);
        //             }
        //
        //             // set the marketing campaign code used for the referral
        //             if (params['~campaign']) {
        //                 setReferralCodeMarketingCampaign(params['~campaign'].toString());
        //             }
        //
        //             // re-direct to the registration screen
        //             setAuthScreen('Registration');
        //             navigation.navigate("Authentication", {
        //                 marketplaceCache: route.params.marketplaceCache,
        //                 cache: route.params.cache,
        //                 currentUserLocation: route.params.currentUserLocation,
        //                 expoPushToken: route.params.expoPushToken,
        //                 onLayoutRootView: route.params.onLayoutRootView
        //             });
        //             return;
        //         }
        //     },
        // });

        // handle incoming deep-links through the linking module
        Linking.getInitialURL().then((url) => {
            if (url !== null) {
                /**
                 * most (if not all) of these links will be coming from Branch.IO through universal link redirects,
                 * so we need to handle them all, depending on where they redirect to.
                 */
                console.log(`app opened through external URL and/or deep-link: ${url}`);
                setDeepLinkingSourced(true);

                // for deep-links coming from any campaigns meant to re-direct to the registration screen
                if (url.includes('moonbeamfin://register?r=')) {
                    // set the referral code to be used during registration
                    setReferralCode(url.split('moonbeamfin://register?r=')[1].split('&')[0]);

                    // set the marketing campaign code used for the referral
                    if (url.includes('&utm_campaign=')) {
                        setReferralCodeMarketingCampaign(url.split('&utm_campaign=')[1].split('&')[0]);
                    }

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
        });

        // necessary for iOS compliance purposes
        requestAppTrackingTransparencyPermission().then(_ => {
        });

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
    }, [deferToLogin, authScreen, deepLinkingSourced]);

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

