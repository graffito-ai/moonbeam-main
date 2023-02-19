import {Amplify} from 'aws-amplify';
import awsconfig from './src/aws-exports';
import React, {useCallback, useEffect, useState} from 'react';
import * as SplashScreen from 'expo-splash-screen';
import {SignInComponent} from './src/components/SignIn'
import {SignUpComponent} from './src/components/SignUp'
import * as Font from 'expo-font';
import {Provider as PaperProvider, Text} from 'react-native-paper';
import {theme} from './src/utils/Theme';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RootStackParamList} from './src/models/RootProps';
import { EmailVerify } from './src/components/EmailVerify';
import { ForgotPassword } from './src/components/ForgotPassword';
import { Dashboard } from './src/components/Dashboard';
import {Logs} from "expo";
import * as Linking from 'expo-linking';

// keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// set up Amplify
Amplify.configure(awsconfig);

// enable CLI logging with Expo
Logs.enableExpoCliLogging()

/**
 * Main application entrypoint.
 */
export default function App() {
    // state used to keep track of whether the application is ready to load or not
    const [appIsReady, setAppIsReady] = useState(false);

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
                    'Raleway-Black': require('assets/fonts/static/Raleway-Black.ttf'),
                    'Raleway-BlackItalic': require('assets/fonts/static/Raleway-BlackItalic.ttf'),
                    'Raleway-Bold': require('assets/fonts/static/Raleway-Bold.ttf'),
                    'Raleway-BoldItalic': require('assets/fonts/static/Raleway-BoldItalic.ttf'),
                    'Raleway-ExtraBold': require('assets/fonts/static/Raleway-ExtraBold.ttf'),
                    'Raleway-ExtraBoldItalic': require('assets/fonts/static/Raleway-ExtraBoldItalic.ttf'),
                    'Raleway-ExtraLight': require('assets/fonts/static/Raleway-ExtraLight.ttf'),
                    'Raleway-ExtraLightItalic': require('assets/fonts/static/Raleway-ExtraLightItalic.ttf'),
                    'Raleway-Italic': require('assets/fonts/static/Raleway-Italic.ttf'),
                    'Raleway-Light': require('assets/fonts/static/Raleway-Light.ttf'),
                    'Raleway-LightItalic': require('assets/fonts/static/Raleway-LightItalic.ttf'),
                    'Raleway-Medium': require('assets/fonts/static/Raleway-Medium.ttf'),
                    'Raleway-MediumItalic': require('assets/fonts/static/Raleway-MediumItalic.ttf'),
                    'Raleway-Regular': require('assets/fonts/static/Raleway-Regular.ttf'),
                    'Raleway-SemiBold': require('assets/fonts/static/Raleway-SemiBold.ttf'),
                    'Raleway-SemiBoldItalic': require('assets/fonts/static/Raleway-SemiBoldItalic.ttf'),
                    'Raleway-Thin': require('assets/fonts/static/Raleway-Thin.ttf'),
                    'Raleway-ThinItalic': require('assets/fonts/static/Raleway-ThinItalic.ttf')
                });
            } catch (e) {
                console.warn(e);
            } finally {
                // tell the application to render
                setAppIsReady(true);
            }
        }
        prepare();
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
        const Stack = createNativeStackNavigator<RootStackParamList>();

        // enabling the linking configuration for creating links to the application screens, based on the navigator
        const linkingConfig = {
            screens: {
                SignIn: 'singin',
                SignUp: 'signup'
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
            linkingConfig,
        };

        // return the component for the application
        return (
            <PaperProvider theme={theme}>
                <NavigationContainer linking={linking} fallback={<Text>Loading...</Text>}>
                    <Stack.Navigator>
                        <Stack.Screen
                            name="SignIn"
                            component={SignInComponent}
                            options={{headerShown: false}}
                            initialParams={{onLayoutRootView: onLayoutRootView, initialRender: true}}
                        />
                        <Stack.Screen
                            name="SignUp"
                            component={SignUpComponent}
                            options={{
                                headerTransparent: true,
                                title: '',
                                headerBackTitleVisible: false,
                                headerTintColor: '#2A3779'
                            }}
                            initialParams={{initialRender: true}}
                        />
                        <Stack.Screen
                            name="EmailVerify"
                            component={EmailVerify}
                            options={{
                                headerShown: false
                            }}
                        />
                        <Stack.Screen
                            name="ForgotPassword"
                            component={ForgotPassword}
                            options={{
                                headerTransparent: true,
                                title: '',
                                headerBackTitleVisible: false,
                                headerTintColor: '#2A3779'
                            }}
                        />
                        <Stack.Screen
                            name="Dashboard"
                            component={Dashboard}
                            options={{
                                headerShown: false
                            }}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PaperProvider>
        );
    }
}
