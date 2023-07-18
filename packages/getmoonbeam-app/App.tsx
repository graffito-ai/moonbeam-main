import * as SplashScreen from 'expo-splash-screen';
import {Logs} from "expo";
import {initialize} from './src/utils/Setup';
import React, {useCallback, useEffect, useState} from 'react';
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
import {Hub} from "aws-amplify";
import {Spinner} from "./src/components/common/Spinner";

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
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
    const [appIsReady, setAppIsReady] = useState<boolean>(false);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
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
                // tell the application to render
                setAppIsReady(true);
            }
        }
        prepare().then(async () => {
            // clean the file system cache
            await FileSystem.deleteAsync(`${FileSystem.documentDirectory!}` + `files`, {
                idempotent: true
            });

            /**
             * initialize the Amplify Hub, and start listening to various events, that would help in capturing important metrics,
             * and/or making specific decisions.
             */
            return Hub.listen('auth', (data) => {
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
        });
    }, []);

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
                                initialParams={{onLayoutRootView: onLayoutRootView}}
                            />
                            <RootStack.Screen
                                name="Authentication"
                                component={AuthenticationComponent}
                                initialParams={{}}
                            />
                        </RootStack.Navigator>
                    </NavigationContainer>
                </PaperProvider>
            </RecoilRoot>
        );
    }
}
