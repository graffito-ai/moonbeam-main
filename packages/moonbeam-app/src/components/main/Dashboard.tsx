import React, {useEffect, useState} from 'react';
import {BottomBarStackParamList} from '../../models/BottomBarProps';
import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import {DrawerActions, DrawerStatus, NavigationContainer} from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {Home} from './home/Home';
import {Membership} from "./rewards/Membership";
import {DashboardProps} from "../../models/DrawerProps";
import {useDrawerStatus} from "@react-navigation/drawer";

/**
 * Dashboard component.
 */
export const Dashboard = ({navigation, route}: DashboardProps) => {
    // create a bottom navigator, to be used for our bottom bar navigation
    const DashboardTab = createMaterialBottomTabNavigator<BottomBarStackParamList>();

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
        if (isDrawerOpen && isOpen === 'closed') {
            navigation.dispatch(DrawerActions.openDrawer());
        }
        if (isOpen) {
            setIsDrawerOpen(false);
        }
    }, [isDrawerOpen, isOpen]);

    // return the component for the Dashboard page
    return (
        <>
            <NavigationContainer independent={true}>
                <DashboardTab.Navigator
                    initialRouteName={"Home"}
                    barStyle={{
                        backgroundColor: 'white',
                        height: 70,
                        ...(!bottomTabNavigationShown && {display: 'none'})
                    }}
                    screenOptions={({route}) => ({
                        tabBarIcon: ({focused}) => {
                            let iconName: any;

                            if (route.name === 'Home') {
                                iconName = focused ? 'ios-home-sharp' : 'ios-home-outline';
                            } else if (route.name === 'Membership') {
                                iconName = focused ? 'ribbon-sharp' : 'ribbon-outline';
                            }

                            // You can return any component that you like here!
                            return <Ionicons name={iconName} size={25} color={'#313030'}/>;
                        }
                    })}
                >
                    <DashboardTab.Screen name="Home"
                                         component={Home}
                                         initialParams={{
                                             setIsDrawerOpen: setIsDrawerOpen,
                                             setBottomTabNavigationShown: setBottomTabNavigationShown,
                                             pointValueRedeemed: 0,
                                             currentUserInformation: route.params.currentUserInformation
                                         }}
                    />
                    <DashboardTab.Screen name="Membership"
                                         component={Membership}
                                         initialParams={{
                                             currentUserInformation: route.params.currentUserInformation
                                         }}
                    />
                </DashboardTab.Navigator>
            </NavigationContainer>
        </>
    );
};
