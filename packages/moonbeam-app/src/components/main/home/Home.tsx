import {HomeTabProps} from '../../../models/BottomBarProps';
import React, {useEffect, useState} from 'react';
// @ts-ignore
import HomeDashboardLogo from '../../../../assets/login-logo.png';
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {HomeStackParamList} from "../../../models/HomeStackProps";
import {HomeDash} from "./HomeDash";
import {CommonActions, DrawerStatus} from "@react-navigation/native";
import {HomeReferral} from "./HomeReferral";
import {Navbar} from "../../common/Navbar";
import {useDrawerStatus} from "@react-navigation/drawer";

/**
 * Home component.
 */
export const Home = ({navigation, route}: HomeTabProps) => {
    // state driven key-value pairs for UI related elements
    const [currentHomeDashScreenKey, setCurrentHomeDashScreenKey] = useState<string>("");

    // create a native stack navigator, to be used for our Home navigation
    const Stack = createNativeStackNavigator<HomeStackParamList>();

    // create a state to keep track of whether the bottom tab navigation is shown or not
    const [bottomTabNavigationShown, setBottomTabNavigationShown] = useState<boolean>(true);

    // create a state to keep track of whether the sidebar is open or not
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

    // constant to keep track of the actual state of the drawer (not the application managed one)
    const isOpen: DrawerStatus = useDrawerStatus();

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // if the redeemed points are greater than 0
        if (route.params.pointValueRedeemed !== 0) {
            // dispatch a navigation event, which will update the home dash props for the points value redeemed
            navigation.dispatch({
                ...CommonActions.setParams({pointValueRedeemed: route.params.pointValueRedeemed}),
                source: currentHomeDashScreenKey
            });
        }
        if (isDrawerOpen && isOpen === 'closed') {
            route.params.setIsDrawerOpen(true);
        }
        if (isOpen) {
            setIsDrawerOpen(false);
        }
        // set the state for the bottom tab navigation, depending on which screen we are on
        route.params.setBottomTabNavigationShown(bottomTabNavigationShown);
    }, [route.name, bottomTabNavigationShown, isDrawerOpen, isOpen]);

    // return the component for the Home page once the state is not loading anymore
    return (
        <Stack.Navigator
            initialRouteName={"HomeDash"}
            screenOptions={{
                header: (props) => {
                    return (<Navbar
                        options={props.options}
                        route={props.route}
                        navigation={props.navigation}
                        currentUserInformation={route.params.currentUserInformation}
                        setCurrentScreenKey={setCurrentHomeDashScreenKey}
                        pointValueRedeemed={route.params.pointValueRedeemed}
                        setIsDrawerOpen={setIsDrawerOpen}
                    />)
                }
            }}
        >
            <Stack.Screen
                name="HomeDash"
                component={HomeDash}
                initialParams={{
                    currentUserInformation: route.params.currentUserInformation,
                    pointValueRedeemed: route.params.pointValueRedeemed,
                    setCurrentScreenKey: setCurrentHomeDashScreenKey,
                    setIsDrawerOpen: setIsDrawerOpen
                }}
            />
            <Stack.Screen
                name="HomeReferral"
                component={HomeReferral}
                options={{
                    headerShown: false,
                }}
                initialParams={{
                    setBottomTabNavigationShown: setBottomTabNavigationShown,
                    currentUserInformation: route.params.currentUserInformation
                }}
            />
        </Stack.Navigator>
    );
}

