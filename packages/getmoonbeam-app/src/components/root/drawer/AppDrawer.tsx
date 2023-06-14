import React, {useEffect} from 'react';
import {createDrawerNavigator} from "@react-navigation/drawer";
import {NavigationContainer} from "@react-navigation/native";
import {AppDrawerProps} from "../../../models/props/AuthenticationProps";
import {AppDrawerStackParamList} from "../../../models/props/AppDrawerProps";
import {CustomDrawer} from "../../common/CustomDrawer";
import {Dimensions} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {useRecoilState} from "recoil";
import {appDrawerHeaderShownState} from "../../../recoil/AppDrawerAtom";
import {Home} from "./home/Home";
import {Ionicons} from "@expo/vector-icons";
import * as Device from "expo-device";
import {DeviceType} from "expo-device";
import {deviceTypeState} from "../../../recoil/RootAtom";

/**
 * AppDrawer component.
 *
 * @constructor constructor for the component
 */
export const AppDrawer = ({}: AppDrawerProps) => {
    // constants used to keep track of shared states
    const [drawerHeaderShown,] = useRecoilState(appDrawerHeaderShownState);
    const [deviceType, setDeviceType] = useRecoilState(deviceTypeState);

    /**
     * create a drawer navigator, to be used for our sidebar navigation, which is the main driving
     * navigation of our application.
     */
    const ApplicationDrawer = createDrawerNavigator<AppDrawerStackParamList>();

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // check and set the type of device, to be used throughout the app
        Device.getDeviceTypeAsync().then(deviceType => {
            setDeviceType(deviceType);
        })
    }, []);

    // return the component for the AppDrawer page
    return (
        <>
            <NavigationContainer independent={true}>
                <ApplicationDrawer.Navigator
                    drawerContent={
                        props =>
                            <CustomDrawer {...props} />
                    }
                    initialRouteName={"Home"}
                    screenOptions={{
                        drawerLabelStyle: {
                            fontFamily: 'Raleway-Medium',
                            fontSize: deviceType === DeviceType.TABLET ? Dimensions.get('window').width/35 : Dimensions.get('window').width/25
                        },
                        drawerActiveBackgroundColor: 'transparent',
                        drawerActiveTintColor: '#F2FF5D',
                        drawerInactiveTintColor: 'white',
                        swipeEnabled: false,
                        drawerStyle: {
                            width: deviceType === DeviceType.TABLET ? Dimensions.get('window').width / 2 : Dimensions.get('window').width / 1.5,
                            backgroundColor: '#5B5A5A'
                        }
                    }}
                >
                    <ApplicationDrawer.Screen
                        name={"Home"}
                        component={Home}
                        options={{
                            drawerItemStyle: {marginBottom: deviceType === DeviceType.TABLET ? 20: 0},
                            drawerIcon: () => (
                                <Icon size={deviceType === DeviceType.TABLET ? Dimensions.get('window').width/25 : Dimensions.get('window').width/15} name={'home-variant-outline'} color={'#F2FF5D'}/>
                            ),
                            headerShown: true
                        }}
                        initialParams={{}}
                    />
                    <ApplicationDrawer.Screen
                        name={"Documents"}
                        component={() => <></>}
                        initialParams={{}}
                        options={{
                            drawerItemStyle: {marginBottom: deviceType === DeviceType.TABLET ? 20: 0},
                            drawerIcon: () => (
                                <Icon size={deviceType === DeviceType.TABLET ? Dimensions.get('window').width/25 : Dimensions.get('window').width/15} name={'file-document-multiple-outline'} color={'#F2FF5D'}/>
                            ),
                            header: () => {
                                return (<></>)
                            },
                            headerShown: drawerHeaderShown
                        }}
                    />
                    <ApplicationDrawer.Screen
                        name={"Settings"}
                        component={() => <></>}
                        options={{
                            drawerItemStyle: {marginBottom: deviceType === DeviceType.TABLET ? 20: 0},
                            drawerIcon: () => (
                                <Ionicons size={deviceType === DeviceType.TABLET ? Dimensions.get('window').width/25 : Dimensions.get('window').width/15} name={'settings-outline'} color={'#F2FF5D'}/>
                            ),
                            header: () => {
                                return (<></>)
                            },
                            headerShown: drawerHeaderShown
                        }}
                        initialParams={{}}
                    />
                    <ApplicationDrawer.Screen
                        name={"Support"}
                        component={() => <></>}
                        initialParams={{}}
                        options={{
                            drawerItemStyle: {marginBottom: deviceType === DeviceType.TABLET ? 20: 0},
                            drawerIcon: () => (
                                <Icon size={deviceType === DeviceType.TABLET ? Dimensions.get('window').width/25 : Dimensions.get('window').width/15} name={'help-circle-outline'} color={'#F2FF5D'}/>
                            ),
                            header: () => {
                                return (<></>)
                            },
                            headerShown: drawerHeaderShown
                        }}
                    />
                </ApplicationDrawer.Navigator>
            </NavigationContainer>
        </>
    );
};
