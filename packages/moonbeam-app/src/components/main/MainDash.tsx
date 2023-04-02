import React, {useEffect, useState} from 'react';
import {MainDashProps} from '../../models/RootProps';
import * as Linking from "expo-linking";
import {createDrawerNavigator} from "@react-navigation/drawer";
import {DrawerPropsParamList} from "../../models/DrawerProps";
import {CommonActions, NavigationContainer} from "@react-navigation/native";
import {Dashboard} from "./Dashboard";
import {CustomDrawer} from '../common/CustomDrawer';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {Navbar} from '../common/Navbar';
import {Dimensions} from 'react-native';
import {Support} from './support/Support';
import {isCacheTokenValid} from "../../utils/Identity";
import * as SecureStore from "expo-secure-store";
import {Settings} from "./settings/Settings";
import {BankAccounts} from "./accounts/BankAccounts";
import {Documents} from './documents/Documents';

/**
 * MainDash component.
 */
export const MainDash = ({navigation, route}: MainDashProps) => {
    // create a state to keep track of whether the drawer header is shown or not
    const [isDrawerHeaderShown, setIsDrawerHeaderShown] = useState<boolean>(true);

    // create a drawer navigator, to be used for our sidebar navigation
    const Drawer = createDrawerNavigator<DrawerPropsParamList>();

    // create a state to keep track of whether the main dash is ready or not
    const [isDashboardReady, setIsDashboardReady] = useState<boolean>(false);

    // create a state to keep track of the oauthStateId passed into the Bank Accounts screen
    const [oauthStateId, setOauthStateId] = useState<string>();

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        isOAuthRedirectAllowed().then((result) => {
            if (!result) {
                navigation.navigate("SignIn", {initialRender: true});
            }
            setIsDashboardReady(result);
        });
    }, [oauthStateId, isDashboardReady]);

    /**
     * Function used to check, in case an oauth token is present, if we could do the redirect,
     * else reload the app (redirecting to login)
     */
    const isOAuthRedirectAllowed = async (): Promise<boolean> => {
        // @ts-ignore
        route.params.params && route.params.params.oauthStateId && setOauthStateId(route.params.params.oauthStateId);
        // check in case an oauth token is present, if we could do the redirect
        if (oauthStateId) {
            const validToken = await isCacheTokenValid();
            if (!validToken) {
                return false;
            } else {
                navigation.dispatch({
                    ...CommonActions.setParams({currentUserInformation: JSON.parse(await SecureStore.getItemAsync('currentUserInformation') as string)}),
                    source: route.key
                });
                return true;
            }
        } else {
            return true;
        }
    }

    // enabling the linking configuration for creating links to the application screens, based on the navigator
    const config = {
        screens: {
            Support: {
                path: 'dashboard/support',
            },
            ["Bank Accounts"]: {
                path: 'dashboard/accounts/:oauthStateId',
                parse: {
                    oauthStateId: (oauthStateId: string) => oauthStateId
                }
            }
        }
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
            {isDashboardReady &&
                <NavigationContainer linking={linking} independent={true}>
                    <Drawer.Navigator
                        drawerContent={props => <CustomDrawer
                            currentUserInformation={route.params.currentUserInformation} {...props} />}
                        initialRouteName={oauthStateId ? "Bank Accounts" : "Dashboard"}
                        screenOptions={{
                            drawerLabelStyle: {fontFamily: 'Raleway-Medium', fontSize: 16},
                            drawerActiveBackgroundColor: 'transparent',
                            drawerActiveTintColor: 'black',
                            drawerInactiveTintColor: 'black',
                            swipeEnabled: false,
                            drawerStyle: {width: Dimensions.get('window').width / 1.5}
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
                            component={BankAccounts}
                            options={{
                                drawerIcon: () => (
                                    <Icon size={25} name={'bank-plus'}/>
                                ),
                                header: (props) => {
                                    return (
                                        <Navbar options={props.options} route={props.route}
                                                navigation={props.navigation}
                                                layout={props.layout}/>)
                                },
                                headerShown: isDrawerHeaderShown
                            }}
                            initialParams={{
                                oauthStateId: oauthStateId,
                                currentUserInformation: route.params.currentUserInformation,
                                setIsDrawerHeaderShown: setIsDrawerHeaderShown
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
                                header: (props) => {
                                    return (
                                        <Navbar options={props.options} route={props.route}
                                                navigation={props.navigation}
                                                layout={props.layout}/>)
                                }
                            }}
                        />
                        <Drawer.Screen
                            name={"Documents"}
                            component={Documents}
                            initialParams={{
                                setIsDrawerHeaderShown: setIsDrawerHeaderShown
                            }}
                            options={{
                                drawerIcon: () => (
                                    <Icon size={25} name={'file-document-multiple-outline'}/>
                                ),
                                header: (props) => {
                                    return (
                                        <Navbar options={props.options} route={props.route}
                                                navigation={props.navigation}
                                                layout={props.layout}/>)
                                },
                                headerShown: isDrawerHeaderShown
                            }}
                        />
                        <Drawer.Screen
                            name={"Settings"}
                            component={Settings}
                            options={{
                                drawerIcon: () => (
                                    <Icon size={25} name={'cellphone-settings'}/>
                                ),
                                header: (props) => {
                                    return (
                                        <Navbar options={props.options} route={props.route}
                                                navigation={props.navigation}
                                                layout={props.layout}/>)
                                },
                            }}
                            initialParams={{
                                oauthStateId: oauthStateId,
                                currentUserInformation: route.params.currentUserInformation
                            }}
                        />
                        <Drawer.Screen
                            name={"Support"}
                            component={Support}
                            initialParams={{
                                setIsDrawerHeaderShown: setIsDrawerHeaderShown
                            }}
                            options={{
                                drawerIcon: () => (
                                    <Icon size={25} name={'help-circle-outline'}/>
                                ),
                                header: (props) => {
                                    return (
                                        <Navbar options={props.options} route={props.route}
                                                navigation={props.navigation}
                                                layout={props.layout}/>)
                                },
                                headerShown: isDrawerHeaderShown
                            }}
                        />
                    </Drawer.Navigator>
                </NavigationContainer>
            }
        </>
    );
};
