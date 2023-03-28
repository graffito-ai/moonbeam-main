import React, {useEffect} from 'react';
import {MainDashProps} from '../../models/RootProps';
import * as Linking from "expo-linking";
import {createDrawerNavigator} from "@react-navigation/drawer";
import {DrawerPropsParamList} from "../../models/DrawerProps";
import {NavigationContainer} from "@react-navigation/native";
import {Dashboard} from "./Dashboard";
import {CustomDrawer} from '../common/CustomDrawer';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {Navbar} from '../common/Navbar';

/**
 * MainDash component.
 */
export const MainDash = ({route}: MainDashProps) => {
    // create a drawer navigator, to be used for our sidebar navigation
    const Drawer = createDrawerNavigator<DrawerPropsParamList>();

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
    });

    // enabling the linking configuration for creating links to the application screens, based on the navigator
    const config = {
        screens: {
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

    // return the component for the Dashboard page
    return (
        <>
            <NavigationContainer linking={linking} independent={true}>
                <Drawer.Navigator
                    drawerContent={props => <CustomDrawer
                        currentUserInformation={route.params.currentUserInformation} {...props} />}
                    initialRouteName={"Dashboard"}
                    screenOptions={{
                        drawerLabelStyle: {fontFamily: 'Raleway-Medium', fontSize: 16},
                        drawerActiveBackgroundColor: 'transparent',
                        drawerActiveTintColor: 'black',
                        drawerInactiveTintColor: 'black',
                        swipeEnabled: false

                    }}
                >
                    <Drawer.Screen
                        name={"Dashboard"}
                        component={Dashboard}
                        options={{
                            drawerIcon: () => (
                                <Icon size={25} name={'dots-circle'}/>
                            ),
                            headerShown: false
                        }}
                        initialParams={{
                            currentUserInformation: route.params.currentUserInformation
                        }}
                    />
                    <Drawer.Screen
                        name={"Bank Accounts"}
                        component={() => {
                            return (<></>)
                        }}
                        options={{
                            drawerIcon: () => (
                                <Icon size={25} name={'bank-plus'}/>
                            ),
                            headerShown: false
                        }}
                    />
                    <Drawer.Screen
                        name={"Card Services"}
                        component={() => {
                            return (<></>)
                        }}
                        options={{
                            drawerIcon: () => (
                                <Icon size={25} name={'credit-card-settings-outline'}/>
                            ),
                            headerShown: false
                        }}
                    />
                    <Drawer.Screen
                        name={"Documents"}
                        component={() => {
                            return (<></>)
                        }}
                        options={{
                            drawerIcon: () => (
                                <Icon size={25} name={'file-settings-outline'}/>
                            ),
                            headerShown: false
                        }}
                    />
                    <Drawer.Screen
                        name={"Settings"}
                        component={() => {
                            return (<></>)
                        }}
                        options={{
                            drawerIcon: () => (
                                <Icon size={25} name={'cellphone-settings'}/>
                            ),
                            headerShown: false
                        }}
                    />
                    <Drawer.Screen
                        name={"Support"}
                        component={() => {
                            return (<></>)
                        }}
                        options={{
                            drawerIcon: () => (
                                <Icon size={25} name={'help-circle-outline'}/>
                            ),
                            header: (props) => {
                                return (
                                    <Navbar options={props.options} route={props.route} navigation={props.navigation}
                                            layout={props.layout}/>)
                            },
                            headerTitle: 'Support Center'
                        }}
                    />
                </Drawer.Navigator>
            </NavigationContainer>
        </>
    );
};
