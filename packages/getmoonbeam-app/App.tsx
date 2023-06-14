import * as SplashScreen from 'expo-splash-screen';
import {Logs} from "expo";
import {initialize} from './src/utils/Setup';
import React, {useCallback, useEffect, useState} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {theme} from "./src/utils/Theme";
import {NavigationContainer} from '@react-navigation/native';
import {Provider as PaperProvider, Text} from 'react-native-paper';
import * as Linking from 'expo-linking';
import * as Font from 'expo-font';
import * as SecureStore from "expo-secure-store";
import * as FileSystem from "expo-file-system";
import {StatusBar} from 'expo-status-bar';
import {RecoilRoot} from 'recoil';
import {AppOverviewComponent} from './src/components/root/AppOverviewComponent';
import {AuthenticationComponent} from "./src/components/root/auth/AuthenticationComponent";
import {RootStackParamList} from "./src/models/props/RootProps";

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
    // state used to keep track of whether the application is ready to load or not
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

                // clear any cached items from the SecureStore
                await SecureStore.deleteItemAsync('bankAccounts');
            } catch (e) {
                console.warn(e);
            } finally {
                // clean the file system cache
                await FileSystem.deleteAsync(`${FileSystem.documentDirectory!}` + `files`, {
                    idempotent: true
                });

                // tell the application to render
                setAppIsReady(true);
            }
        }
        prepare().then(async () => {
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

        // enabling the linking configuration for creating links to the application screens, based on the navigator
        const config = {
            screens: {
                SignIn: {
                    path: '*'
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

        // return the main component for the application stack
        return (
            <RecoilRoot>
                <PaperProvider theme={theme}>
                    <StatusBar style="light" animated={true}/>
                    <NavigationContainer linking={linking} fallback={<Text>Loading...</Text>}>
                        <RootStack.Navigator
                            initialRouteName={"AppOverview"}
                            screenOptions={{
                                headerShown: false
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
