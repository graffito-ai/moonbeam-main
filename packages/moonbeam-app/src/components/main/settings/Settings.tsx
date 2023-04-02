import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {SettingsStackParamList} from "../../../models/SettingsStackProps";
import {SettingsList} from "./SettingsList";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {IconButton} from "react-native-paper";
import {SettingsProps} from "../../../models/DrawerProps";

/**
 * Settings component.
 */
export const Settings = ({route}: SettingsProps) => {
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
            <Stack.Navigator
                initialRouteName={"SettingsList"}
                screenOptions={({navigation}) => {
                    return({
                        headerLeft: () => {
                            return(<IconButton
                                icon="chevron-left"
                                iconColor={"#2A3779"}
                                size={40}
                                style={{marginTop: '-5%',  marginLeft: `-10%`}}
                                onPress={() => {
                                    navigation.navigate('SettingsList', {currentUserInformation: route.params.currentUserInformation});
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
                    initialParams={{
                        currentUserInformation: route.params.currentUserInformation
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};
