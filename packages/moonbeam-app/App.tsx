import * as SplashScreen from 'expo-splash-screen';
// @ts-ignore
import * as envInfo from "./amplify/.config/local-env-info.json";
import {Logs} from "expo";
import {initialize} from './src/utils/Setup';
import React, {useCallback, useEffect, useState} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RootStackParamList} from './src/models/RootProps';
import {theme} from "./src/utils/Theme";
import {NavigationContainer} from '@react-navigation/native';
import {SignInComponent} from './src/components/auth/SignIn';
import {SignUpComponent} from './src/components/auth/SignUp';
import {EmailVerify} from './src/components/auth/EmailVerify';
import {ForgotPassword} from './src/components/auth/ForgotPassword';
import {Dashboard} from './src/components/main/Dashboard';
import {IconButton, Provider as PaperProvider, Text} from 'react-native-paper';
import * as Linking from 'expo-linking';
import * as Font from 'expo-font';

// keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().then(() => {
});

// initialize the application according to the current Amplify environment
initialize();

// enable CLI logging with Expo
Logs.enableExpoCliLogging();

/**
 * Main application entrypoint.
 */
export default function App() {
    // state used to keep track of whether the application is ready to load or not
    const [appIsReady, setAppIsReady] = useState<boolean>(false);

    // state used to keep track of whether a deep link is used for the SignUp component, in order to display the back button
    const [isSignUpBackButtonVisible, setSignUpBackButtonVisible] = useState<boolean>(true);

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
        prepare().then(async () => {});
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
        const config = {
            screens: {
                SignIn: {
                    path: '*'
                },
                SignUp: {
                    path: 'signup/:referralId',
                    parse: {
                        referralId: (referralId: string) => referralId
                    }
                },
                Dashboard: {
                    path: 'dashboard/:oauthStateId',
                    parse: {
                        oauthStateId: (oauthStateId: string) => oauthStateId
                    }
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

        // return the main component for the application
        return (
            <PaperProvider theme={theme}>
                <NavigationContainer linking={linking} fallback={<Text>Loading...</Text>}>
                    <Stack.Navigator
                        initialRouteName={"SignIn"}
                        screenOptions={({route, navigation}) => {
                            return ({
                                headerLeft: () => {
                                    return (route.name !== 'SignIn' ? <IconButton
                                        icon="chevron-left"
                                        iconColor={"#2A3779"}
                                        size={40}
                                        style={{marginTop: '-5%', marginLeft: `-10%`}}
                                        onPress={() => navigation.goBack()}
                                    /> : <></>)
                                },
                                headerTitle: '',
                                headerTransparent: true,
                                headerTintColor: '#2A3779'
                            })
                        }}
                    >
                        <Stack.Screen
                            name="SignIn"
                            component={SignInComponent}
                            initialParams={{onLayoutRootView: onLayoutRootView, initialRender: true}}
                        />
                        <Stack.Screen
                            name="SignUp"
                            component={SignUpComponent}
                            options={{
                                headerShown: isSignUpBackButtonVisible
                            }}
                            initialParams={{
                                onLayoutRootView: onLayoutRootView,
                                initialRender: true,
                                setSignUpBackButtonVisible: setSignUpBackButtonVisible
                            }}
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
                            initialParams={{initialRender: true}}
                        />
                        <Stack.Screen
                            name="Dashboard"
                            // @ts-ignore
                            component={Dashboard}
                            options={{
                                headerShown: false
                            }}
                            initialParams={{currentUserInformation: {}}}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PaperProvider>
        );
    }
}
