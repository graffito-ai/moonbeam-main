import {HomeTabProps} from '../models/BottomBarProps';
import React, {useEffect, useState} from 'react';
// @ts-ignore
import HomeDashboardLogo from '../../assets/login-logo.png';
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {IconButton} from "react-native-paper";
import {HomeStackParamList} from "../models/HomeStackProps";
import {HomeDash} from "./HomeDash";
import {CommonActions} from "@react-navigation/native";
import {HomeReferral} from "./HomeReferral";
import {Navbar} from "./Navbar";

/**
 * Home component.
 */
export const Home = ({navigation, route}: HomeTabProps) => {
    // state driven key-value pairs for UI related elements
    const [currentHomeDashScreenKey, setCurrentHomeDashScreenKey] = useState<string>("");

    // create a native stack navigator, to be used for our Home navigation
    const Stack = createNativeStackNavigator<HomeStackParamList>();

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
            console.log('yes bitch');
            // dispatch a navigation event, which will update the home dash props for the points value redeemed
            navigation.dispatch({
                ...CommonActions.setParams({pointValueRedeemed: route.params.pointValueRedeemed}),
                source: currentHomeDashScreenKey
            });
        }
    }, [route.name]);

    // return the component for the Home page once the state is not loading anymore
    return (
        <Stack.Navigator
            initialRouteName={"HomeDash"}
            screenOptions={{
                headerTitle: '',
                headerTransparent: true,
                headerTintColor: '#2A3779'
            }}
        >
            <Stack.Screen
                name="HomeDash"
                component={HomeDash}
                options={{
                    header: (props) => {
                        return(<Navbar
                            options={props.options}
                            route={props.route}
                            navigation={props.navigation}
                            currentUserInformation={route.params.currentUserInformation}
                            setCurrentScreenKey={setCurrentHomeDashScreenKey}
                            pointValueRedeemed={route.params.pointValueRedeemed}
                        />)
                    }
                }}
                initialParams={{
                    currentUserInformation: route.params.currentUserInformation,
                    pointValueRedeemed: route.params.pointValueRedeemed,
                    setCurrentScreenKey: setCurrentHomeDashScreenKey
                }}
            />
            <Stack.Screen
                name="HomeReferral"
                component={HomeReferral}
                options={{
                    headerTitleStyle: {
                        fontSize: 18,
                        fontFamily: 'Raleway-Medium'
                    },
                    title: 'Alpha Program',
                    headerBackTitleVisible: false,
                    headerBackVisible: false,
                    headerRight: () => (
                        <IconButton
                            icon="close"
                            iconColor={"#313030"}
                            size={30}
                            style={{marginTop: '-1%'}}
                            onPress={() => navigation.goBack()}
                        />
                    ),
                }}
                initialParams={{
                    currentUserInformation: route.params.currentUserInformation
                }}
            />
        </Stack.Navigator>
    );
}

