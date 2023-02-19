import {HomeTabProps} from '../models/BottomBarProps';
import React, {useEffect, useState} from 'react';
// @ts-ignore
import HomeDashboardLogo from '../../assets/login-logo.png';
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {IconButton, Provider as PaperProvider} from "react-native-paper";
import {theme} from "../utils/Theme";
import {HomeStackParamList} from "../models/HomeStackProps";
import {HomeDash} from "./HomeDash";
import {CommonActions} from "@react-navigation/native";
import {HomeReferral} from "./HomeReferral";

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
            // dispatch a navigation event, which will update the home dash props for the points value redeemed
            navigation.dispatch({
                ...CommonActions.setParams({pointValueRedeemed: route.params.pointValueRedeemed}),
                source: currentHomeDashScreenKey
            });
        }
    }, [route.params.pointValueRedeemed]);

    // return the component for the Home page
    return (
        <PaperProvider theme={theme}>
            <Stack.Navigator>
                <Stack.Screen
                    name="HomeDash"
                    component={HomeDash}
                    options={{
                        headerShown: false
                    }}
                    initialParams={{
                        pointValueRedeemed: route.params.pointValueRedeemed,
                        setCurrentScreenKey: setCurrentHomeDashScreenKey
                    }}
                />
                <Stack.Screen
                    name="HomeReferral"
                    component={HomeReferral}
                    options={{
                        headerTransparent: true,
                        headerTitleStyle: {
                            fontSize: 18,
                            fontFamily: 'Raleway-Medium'
                        },
                        title: 'Alpha Program',
                        headerBackTitleVisible: false,
                        headerBackVisible: false,
                        headerTintColor: '#2A3779',
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
                />
            </Stack.Navigator>
        </PaperProvider>
    );
}

