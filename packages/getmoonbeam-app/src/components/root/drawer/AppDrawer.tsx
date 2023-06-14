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

/**
 * AppDrawer component.
 *
 * @constructor constructor for the component
 */
export const AppDrawer = ({}: AppDrawerProps) => {
    // constants used to keep track of shared states
    const [drawerHeaderShown,] = useRecoilState(appDrawerHeaderShownState);

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
                        drawerLabelStyle: {fontFamily: 'Raleway-Medium', fontSize: 16},
                        drawerActiveBackgroundColor: 'transparent',
                        drawerActiveTintColor: 'black',
                        drawerInactiveTintColor: 'black',
                        swipeEnabled: false,
                        drawerStyle: {width: Dimensions.get('window').width / 1.5}
                    }}
                >
                    <ApplicationDrawer.Screen
                        name={"Home"}
                        component={Home}
                        options={{
                            drawerIcon: () => (
                                <Icon size={25} name={'dots-circle'}/>
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
                            drawerIcon: () => (
                                <Icon size={25} name={'file-document-multiple-outline'}/>
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
                            drawerIcon: () => (
                                <Icon size={25} name={'cellphone-settings'}/>
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
                            drawerIcon: () => (
                                <Icon size={25} name={'help-circle-outline'}/>
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
