import * as SplashScreen from 'expo-splash-screen';
import {Logs} from "expo";
import {initialize} from './Setup';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import * as Font from 'expo-font';
import * as FileSystem from "expo-file-system";
import {StatusBar} from 'expo-status-bar';
import {RecoilRoot} from 'recoil';
import {AppOverviewComponent} from './src/components/root/AppOverviewComponent';
import {AuthenticationComponent} from "./src/components/root/auth/AuthenticationComponent";
import {RootStackParamList} from "./src/models/props/RootProps";
import {PaperProvider, useTheme} from "react-native-paper";
import {Cache, Hub} from "aws-amplify";
import {Spinner} from "./src/components/common/Spinner";
import * as Notifications from 'expo-notifications';
import {AndroidNotificationPriority, ExpoPushToken} from 'expo-notifications';
import Constants from "expo-constants";
import {Platform} from "react-native";
import * as Device from 'expo-device';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from 'expo-location';

// this handler determines how your app handles notifications that come in while the app is foregrounded.
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        priority: AndroidNotificationPriority.MAX
    }),
});

/**
 * Function used to register the app for async push notifications, and return
 * an expo push token, associated to this user's physical device.
 *
 * @returns a {@link ExpoPushToken} expo push token to be return for this user's
 * physical device.
 */
async function registerForPushNotificationsAsync(): Promise<ExpoPushToken> {
    // expo push token to be returned
    let token: ExpoPushToken = {
        type: 'expo',
        data: ''
    };
    // check to see if this is a physical device first
    if (Device.isDevice) {
        const {status: existingStatus} = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const {status} = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return token;
        }
        token = (
            await Notifications.getExpoPushTokenAsync({
                projectId: Constants.expoConfig && Constants.expoConfig.extra ? Constants.expoConfig.extra.eas.projectId : '',
            })
        );
    } else {
        console.log('Must use physical device for Push Notifications');
    }
    // further configure the push notification for Android only
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#F2FF5D',
            sound: 'default',
            showBadge: true,
            enableVibrate: true
        });
    }
    return token;
}

// keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().then(() => {
});

// initialize the application according to the current Amplify environment
initialize();

// enable CLI logging with Expo
Logs.enableExpoCliLogging();

/**
 * App component, representing the main application entrypoint.
 *
 * @constructor constructor for the component.
 */
export default function App() {
    // Setting up the  theme to be used in application
    const theme = useTheme();
    theme.colors.secondaryContainer = 'transparent';

    // constants used to keep track of local component state
    const [marketplaceCache, setMarketplaceCache] = useState<typeof Cache | null>(null);
    const [cache, setCache] = useState<typeof Cache | null>(null);
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
    const [appIsReady, setAppIsReady] = useState<boolean>(false);
    const [expoPushToken, setExpoPushToken] = useState<ExpoPushToken>({
        type: 'expo',
        data: ''
    })
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
            console.log('incoming notification and/or notification response received (last notification handle)');
        }

        const prepare = async () => {
            try {
                // preload fonts, make any API calls that we need in here
                // preloading all Raleway fonts
                await Font.loadAsync({
                    'Changa-Bold': require('assets/fonts/Changa/static/Changa-Bold.ttf'),
                    'Changa-ExtraBold': require('assets/fonts/Changa/static/Changa-ExtraBold.ttf'),
                    'Changa-ExtraLight': require('assets/fonts/Changa/static/Changa-ExtraLight.ttf'),
                    'Changa-Light': require('assets/fonts/Changa/static/Changa-Light.ttf'),
                    'Changa-Medium': require('assets/fonts/Changa/static/Changa-Medium.ttf'),
                    'Changa-Regular': require('assets/fonts/Changa/static/Changa-Regular.ttf'),
                    'Changa-SemiBold': require('assets/fonts/Changa/static/Changa-SemiBold.ttf'),
                    'Saira-Bold': require('assets/fonts/Saira/static/Saira-Bold.ttf'),
                    'Saira-ExtraBold': require('assets/fonts/Saira/static/Saira-ExtraBold.ttf'),
                    'Saira-ExtraLight': require('assets/fonts/Saira/static/Saira-ExtraLight.ttf'),
                    'Saira-Light': require('assets/fonts/Saira/static/Saira-Light.ttf'),
                    'Saira-Medium': require('assets/fonts/Saira/static/Saira-Medium.ttf'),
                    'Saira-Regular': require('assets/fonts/Saira/static/Saira-Regular.ttf'),
                    'Saira-SemiBold': require('assets/fonts/Saira/static/Saira-SemiBold.ttf'),
                    'Raleway-Bold': require('assets/fonts/Raleway/static/Raleway-Bold.ttf'),
                    'Raleway-ExtraBold': require('assets/fonts/Raleway/static/Raleway-ExtraBold.ttf'),
                    'Raleway-ExtraLight': require('assets/fonts/Raleway/static/Raleway-ExtraLight.ttf'),
                    'Raleway-Light': require('assets/fonts/Raleway/static/Raleway-Light.ttf'),
                    'Raleway-Medium': require('assets/fonts/Raleway/static/Raleway-Medium.ttf'),
                    'Raleway-Regular': require('assets/fonts/Raleway/static/Raleway-Regular.ttf'),
                    'Raleway-SemiBold': require('assets/fonts/Raleway/static/Raleway-SemiBold.ttf'),
                });
            } catch (e) {
                console.warn(e);
            } finally {
                // clean the file system cache
                await FileSystem.deleteAsync(`${FileSystem.documentDirectory!}` + `files`, {
                    idempotent: true
                });

                // prepare the application for notifications
                setExpoPushToken(await registerForPushNotificationsAsync());

                // This listener is fired whenever a notification is received while the app is foregrounded.
                notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
                    // Do something with the notification
                    console.log(`Incoming push notification received ${notification}`);
                });

                // This listener is fired whenever a user taps on or interacts with a notification (works when an app is foregrounded, backgrounded, or killed).
                responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
                    // Do something with the notification/response
                    console.log(`Incoming notification interaction response received ${response}`);
                });

                // configure the Global Cache - @link https://docs.amplify.aws/lib/utilities/cache/q/platform/js/#api-reference
                setCache(Cache.createInstance({
                    keyPrefix: 'global-amplify-cache',
                    capacityInBytes: 5000000, // 5 MB max cache size
                    itemMaxSize: 500000, // 500 KB max per item
                    defaultTTL: 32000000000, // in milliseconds, about 8000 something hours, which is roughly 1 year (365 days)
                    warningThreshold: 0.8, // when to get warned that the cache is full, at 80% capacity
                    storage: AsyncStorage
                }));

                // configure the Marketplace specific Cache - @link https://docs.amplify.aws/lib/utilities/cache/q/platform/js/#api-reference
                setMarketplaceCache(Cache.createInstance({
                    keyPrefix: 'marketplace-amplify-cache',
                    capacityInBytes: 5000000, // 5 MB max cache size
                    itemMaxSize: 2500000, // 2.5 MB max per item
                    defaultTTL: 600000000, // in milliseconds, about 7 days
                    warningThreshold: 0.8, // when to get warned that the cache is full, at 80% capacity
                    storage: AsyncStorage
                }));

                // set appropriate Google API Key
                Location.setGoogleApiKey(Platform.OS === 'android'
                    ? 'AIzaSyB8OpXoKULaEO8t46npUBbmIAM-ranxVfk'
                    : 'AIzaSyBlj5BVB9ZxZS0V_Usf9pAhuCnw2mQhcaQ');

                // tell the application to render
                setAppIsReady(true);

                return () => {
                    notificationListener.current && Notifications.removeNotificationSubscription(notificationListener.current!);
                    responseListener.current && Notifications.removeNotificationSubscription(responseListener.current!);

                    /**
                     * initialize the Amplify Hub, and start listening to various events, that would help in capturing important metrics,
                     * and/or making specific decisions.
                     */
                    Hub.listen('auth', (data) => {
                        switch (data.payload.event) {
                            case 'signIn':
                                console.log(`user signed in`);
                                break;
                            case 'signOut':
                                /**
                                 * Amplify automatically manages the sessions, and when the session token expires, it will log out the user and send an event
                                 * here. What we do then is intercept that event, and since the user Sign-Out has already happened, we will perform the cleanup that
                                 * we usually do in our Sign-Out functionality, without actually signing the user out.
                                 */
                                console.log(`user signed out ${JSON.stringify(data.payload)}`);
                                console.log(`user signed out ${JSON.stringify(data)}`);
                                break;
                            case 'configured':
                                console.log('the Auth module is successfully configured!');
                                break;
                        }
                    });
                };
            }
        }
        prepare().then(() => {
        });
    }, [lastNotificationResponse]);

    /**
     * Invoked when the application is mounted and the layout changes
     */
    const onLayoutRootView = useCallback(async () => {
        if (appIsReady) {
            // artificially delay for 1 seconds to simulate loading experience.
            await new Promise(resolve => setTimeout(resolve, 1000));
            await SplashScreen.hideAsync();
        }
    }, [appIsReady]);

    if (!appIsReady) {
        return null;
    } else {
        // create a native stack navigator, to be used for our root application navigation
        const RootStack = createNativeStackNavigator<RootStackParamList>();

        // return the main component for the application stack
        return (
            <RecoilRoot>
                <PaperProvider>
                    <StatusBar style="light" animated={true}/>
                    <NavigationContainer
                        fallback={
                            <Spinner loadingSpinnerShown={loadingSpinnerShown}
                                     setLoadingSpinnerShown={setLoadingSpinnerShown}/>
                        }>
                        <RootStack.Navigator
                            initialRouteName={"AppOverview"}
                            screenOptions={{
                                headerShown: false,
                                gestureEnabled: false
                            }}
                        >
                            <RootStack.Screen
                                name="AppOverview"
                                component={AppOverviewComponent}
                                initialParams={{
                                    marketplaceCache: marketplaceCache!,
                                    cache: cache!,
                                    expoPushToken: expoPushToken,
                                    onLayoutRootView: onLayoutRootView
                                }}
                            />
                            <RootStack.Screen
                                name="Authentication"
                                component={AuthenticationComponent}
                                initialParams={{
                                    marketplaceCache: marketplaceCache!,
                                    cache: cache!,
                                    expoPushToken: expoPushToken,
                                    onLayoutRootView: onLayoutRootView
                                }}
                            />
                        </RootStack.Navigator>
                    </NavigationContainer>
                </PaperProvider>
            </RecoilRoot>
        );
    }
}
