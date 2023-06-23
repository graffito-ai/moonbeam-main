import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {IconButton, Text} from "react-native-paper";
import {SettingsProps} from "../../../../models/props/AppDrawerProps";
import {SettingsStackParamList} from "../../../../models/props/SettingsProps";
import {SettingsList} from "./SettingsList";
import * as Linking from "expo-linking";

/**
 * Settings component
 *
 * @constructor constructor for the component.
 */
export const Settings = ({}: SettingsProps) => {
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

    // enabling the linking configuration for creating links to the application screens, based on the navigator
    const config = {
        screens: {
            SettingsList: {
                path: 'main/settings/list'
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
        <NavigationContainer independent={true} linking={linking} fallback={<Text>Loading...</Text>}>
            <Stack.Navigator
                initialRouteName={"SettingsList"}
                screenOptions={({navigation}) => {
                    return ({
                        headerLeft: () => {
                            return (<IconButton
                                icon="chevron-left"
                                iconColor={"#2A3779"}
                                size={40}
                                style={{marginTop: '-5%', marginLeft: `-10%`}}
                                onPress={() => {
                                    navigation.navigate('SettingsList', {});
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
                        headerShown: false
                    }}
                    initialParams={{}}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};
