import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {IconButton, Text} from "react-native-paper";
import {SettingsProps} from "../../../../models/props/AppDrawerProps";
import {SettingsStackParamList} from "../../../../models/props/SettingsProps";
import {SettingsList} from "./SettingsList";
import * as Linking from "expo-linking";
import {Profile} from './profile/Profile';
import {useRecoilState} from "recoil";
import {appDrawerHeaderShownState, drawerDashboardState, drawerSwipeState} from "../../../../recoil/AppDrawerAtom";
import {deviceTypeState} from "../../../../recoil/RootAtom";
import * as Device from "expo-device";
import {DeviceType} from "expo-device";
import {Dimensions} from "react-native";
import {styles} from "../../../../styles/settingsList.module";

/**
 * Settings component
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const Settings = ({navigation}: SettingsProps) => {
    // constants used to keep track of shared states
    const [, setAppDrawerHeaderShown] = useRecoilState(appDrawerHeaderShownState);
    const [, setDrawerSwipeEnabled] = useRecoilState(drawerSwipeState);
    const [deviceType, setDeviceType] = useRecoilState(deviceTypeState);
    const [, setIsDrawerInDashboard] = useRecoilState(drawerDashboardState);

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
        // set the custom drawer header style accordingly
        if (navigation.getState().index === 2) {
            setIsDrawerInDashboard(false);
        }
        // check and set the type of device, to be used throughout the app
        Device.getDeviceTypeAsync().then(deviceType => {
            setDeviceType(deviceType);
        });
    }, [deviceType, navigation.getState()]);

    // enabling the linking configuration for creating links to the application screens, based on the navigator
    const config = {
        screens: {
            SettingsList: {
                path: 'settings/list'
            },
            Profile: {
                path: 'settings/profile'
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
                                iconColor={"#F2FF5D"}
                                size={deviceType === DeviceType.TABLET ? Dimensions.get('window').height / 28 : Dimensions.get('window').height / 22}
                                style={deviceType === DeviceType.TABLET ? styles.backButtonTablet : styles.backButton}
                                onPress={() => {
                                    // enable swipes for the App Drawer
                                    setDrawerSwipeEnabled(true);

                                    // set the visibility of the App Header
                                    setAppDrawerHeaderShown(true);

                                    // navigate back to the SettingsList component
                                    navigation.navigate('SettingsList', {});
                                }}
                            />)
                        },
                        headerTitle: '',
                        headerTransparent: false,
                        headerStyle: {backgroundColor: '#313030'},
                        gestureEnabled: false
                    })
                }}
            >
                <Stack.Screen
                    name="Profile"
                    component={Profile}
                    options={{
                        headerShown: true
                    }}
                    initialParams={{}}
                />
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
