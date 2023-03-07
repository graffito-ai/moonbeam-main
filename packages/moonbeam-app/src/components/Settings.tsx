import React, {useEffect} from 'react';
import {SettingsTabProps} from '../models/BottomBarProps';
import {NavigationContainer} from '@react-navigation/native';
import {SettingsStackParamList} from "../models/SettingsStackProps";
import {SettingsList} from "./SettingsList";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {BankAccounts} from "./BankAccounts";

/**
 * Settings component.
 */
export const Settings = ({route}: SettingsTabProps) => {
    // create a native stack navigator, to be used for our Settings navigation
    const Stack = createNativeStackNavigator<SettingsStackParamList>();

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
    }, []);

    // return the component for the Settings page
    return (
        <NavigationContainer independent={true}>
            <Stack.Navigator>
                <Stack.Screen
                    name="SettingsList"
                    component={SettingsList}
                    options={{
                        headerShown: false
                    }}
                    initialParams={{
                        currentUserInformation: route.params.currentUserInformation
                    }}
                />
                <Stack.Screen
                    name="BankAccounts"
                    component={BankAccounts}
                    options={{
                        headerTransparent: true,
                        title: '',
                        headerBackTitleVisible: true,
                        headerTintColor: '#2A3779'
                    }}
                    initialParams={{}}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};
