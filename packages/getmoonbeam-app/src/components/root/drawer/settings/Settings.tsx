import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {IconButton} from "react-native-paper";
import {SettingsProps} from "../../../../models/props/AppDrawerProps";
import {SettingsStackParamList} from "../../../../models/props/SettingsProps";
import {SettingsList} from "./SettingsList";
import {Profile} from './profile/Profile';
import {useRecoilState} from "recoil";
import {appDrawerHeaderShownState, drawerDashboardState, drawerSwipeState} from "../../../../recoil/AppDrawerAtom";
import {deviceTypeState} from "../../../../recoil/RootAtom";
import * as Device from "expo-device";
import {DeviceType} from "expo-device";
import {Dimensions} from "react-native";
import {styles} from "../../../../styles/settingsList.module";
import {Spinner} from "../../../common/Spinner";
import {ResetPassword} from "./password/ResetPassword";
import {goToProfileSettingsState} from "../../../../recoil/Settings";

/**
 * Settings component
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const Settings = ({navigation}: SettingsProps) => {
    // constants used to keep track of local component state
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
    // constants used to keep track of shared states
    const [, setGoToProfileSettings] = useRecoilState(goToProfileSettingsState);
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

    // return the component for the Settings page
    return (
        <NavigationContainer independent={true}
                             fallback={
                                 <Spinner loadingSpinnerShown={loadingSpinnerShown}
                                          setLoadingSpinnerShown={setLoadingSpinnerShown}/>
                             }>
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

                                    // reset any navigation flags
                                    setGoToProfileSettings(false);

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
                <Stack.Screen
                    name="ResetPassword"
                    component={ResetPassword}
                    options={{
                        headerShown: true
                    }}
                    initialParams={{}}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};
