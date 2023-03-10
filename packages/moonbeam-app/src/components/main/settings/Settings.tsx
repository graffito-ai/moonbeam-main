import React, {useEffect, useState} from 'react';
import {SettingsTabProps} from '../../../models/BottomBarProps';
import {NavigationContainer} from '@react-navigation/native';
import {SettingsStackParamList} from "../../../models/SettingsStackProps";
import {SettingsList} from "./SettingsList";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {BankAccounts} from "./accounts/BankAccounts";
import {Navbar} from "../../common/Navbar";
import {IconButton} from "react-native-paper";
import * as Linking from "expo-linking";

/**
 * Settings component.
 */
export const Settings = ({route}: SettingsTabProps) => {
    // create a native stack navigator, to be used for our Settings navigation
    const Stack = createNativeStackNavigator<SettingsStackParamList>();

    // create a state to keep track of whether the bottom tab navigation is shown or not
    const [bottomTabNavigationShown, setBottomTabNavigationShown] = useState<boolean>(true);

    // create a state to keep track of whether the top header is shown or not
    const [headerIsShown, setIsHeaderShown] = useState<boolean>(true);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        route.params.setBottomTabNavigationShown(bottomTabNavigationShown);
    }, [route, bottomTabNavigationShown]);

    // enabling the linking configuration for creating links to the application screens, based on the navigator
    const config = {
        screens: {
            BankAccounts: {
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

    // return the component for the Settings page
    return (
        <NavigationContainer linking={linking} independent={true}>
            <Stack.Navigator
                initialRouteName={route.params.oauthStateId ? "BankAccounts" : "SettingsList"}
                screenOptions={({navigation}) => {
                    return({
                        headerLeft: () => {
                            return(<IconButton
                                icon="chevron-left"
                                iconColor={"#2A3779"}
                                size={40}
                                style={{marginTop: '-5%',  marginLeft: `-10%`}}
                                onPress={() => {
                                    setBottomTabNavigationShown(true);
                                    navigation.goBack();
                                }}
                            />)
                        },
                        headerTitle: '',
                        headerTransparent: true,
                        headerTintColor: '#2A3779'
                    })
                }}
            >
                <Stack.Screen
                    name="SettingsList"
                    component={SettingsList}
                    options={{
                        header: (props) => {
                            return(<Navbar options={props.options} route={props.route} navigation={props.navigation}/>)
                        },
                        headerTitle: 'Settings'
                    }}
                    initialParams={{
                        currentUserInformation: route.params.currentUserInformation
                    }}
                />
                <Stack.Screen
                    name="BankAccounts"
                    component={BankAccounts}
                    initialParams={{
                        oauthStateId: route.params.oauthStateId,
                        currentUserInformation: route.params.currentUserInformation,
                        setIsHeaderShown: setIsHeaderShown,
                        setBottomTabNavigationShown: setBottomTabNavigationShown
                    }}
                    options={{
                        headerShown: headerIsShown
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};
