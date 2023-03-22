import React, {useEffect, useState} from 'react';
import {DashboardProps} from '../../models/RootProps';
import {BottomBarStackParamList} from '../../models/BottomBarProps';
import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import {CommonActions, NavigationContainer} from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {Home} from './home/Home';
import {Settings} from "./settings/Settings";
import {Membership} from "./rewards/Membership";
import {isCacheTokenValid} from '../../utils/Identity';
import * as SecureStore from "expo-secure-store";
import * as Linking from "expo-linking";

/**
 * Dashboard component.
 */
export const Dashboard = ({navigation, route}: DashboardProps) => {
    // create a native bottom navigator, to be used for our bottom bar navigation
    const DashboardTab = createMaterialBottomTabNavigator<BottomBarStackParamList>();

    // create a state to keep track of whether the bottom tab navigation is shown or not
    const [bottomTabNavigationShown, setBottomTabNavigationShown] = useState<boolean>(true);

    // create a state to keep track of whether the dashboard is ready or not
    const [isDashboardReady, setIsDashboardReady] = useState<boolean>(false);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        isOAuthRedirectAllowed().then(() => {setIsDashboardReady(true);});
    }, [route.params.oauthStateId, isDashboardReady]);

    /**
     * Function used to check, in case an oauth token is present, if we could do the redirect,
     * else reload the app (redirecting to login)
     */
    const isOAuthRedirectAllowed = async () => {
        // check in case an oauth token is present, if we could do the redirect
        if (route.params.oauthStateId) {
            const validToken = await isCacheTokenValid();
            if (!validToken) {
                navigation.navigate("SignIn", {initialRender: true});
            } else {
                navigation.dispatch({
                    ...CommonActions.setParams({currentUserInformation: JSON.parse(await SecureStore.getItemAsync('currentUserInformation') as string)}),
                    source: route.key
                });
            }
        }
    }

    // enabling the linking configuration for creating links to the application screens, based on the navigator
    const config = {
        screens: {
            Settings: {
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

    // return the component for the Dashboard page
    return (isDashboardReady &&
        <NavigationContainer linking={linking} independent={true}>
            <DashboardTab.Navigator
                initialRouteName={route.params.oauthStateId ? "Settings" : "Home" }
                barStyle={{
                    backgroundColor: '#f2f2f2',
                    height: 70,
                    ...(!bottomTabNavigationShown && {display: 'none'})
                }}
                screenOptions={({route}) => ({
                    tabBarIcon: ({focused}) => {
                        let iconName: any;

                        if (route.name === 'Home') {
                            iconName = focused ? 'ios-home-sharp' : 'ios-home-outline';
                        } else if (route.name === 'Membership') {
                            iconName = focused ? 'ribbon-sharp' : 'ribbon-outline';
                        } else if (route.name === 'Settings') {
                            iconName = focused ? 'settings-sharp' : 'settings-outline';
                        }

                        // You can return any component that you like here!
                        return <Ionicons name={iconName} size={25} color={'#313030'}/>;
                    }
                })}
            >
                <DashboardTab.Screen name="Home"
                                     component={Home}
                                     initialParams={{
                                         setBottomTabNavigationShown: setBottomTabNavigationShown,
                                         pointValueRedeemed: 0,
                                         currentUserInformation: route.params.currentUserInformation
                                     }}
                />
                <DashboardTab.Screen name="Membership"
                                     component={Membership}
                                     initialParams={{
                                         currentUserInformation: route.params.currentUserInformation
                                     }}
                />
                <DashboardTab.Screen name="Settings"
                                     component={Settings}
                                     initialParams={{
                                         oauthStateId: route.params.oauthStateId,
                                         setBottomTabNavigationShown: setBottomTabNavigationShown,
                                         currentUserInformation: route.params.currentUserInformation
                                     }}
                />
            </DashboardTab.Navigator>
        </NavigationContainer>
    );
};
