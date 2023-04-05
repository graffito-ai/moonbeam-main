import React, {useEffect, useState} from 'react';
import {BottomBarStackParamList} from '../../models/BottomBarProps';
import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import {DrawerActions, DrawerStatus, NavigationContainer} from '@react-navigation/native';
import {Home} from './home/Home';
import {Membership} from "./rewards/Membership";
import {DashboardProps} from "../../models/DrawerProps";
import {useDrawerStatus} from "@react-navigation/drawer";
import { Store } from './store/Store';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Ionicons} from "@expo/vector-icons";

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
                            let iconName: string;
                            let iconColor: string;

                            if (route.name === 'Home') {
                                iconName = focused ? 'home-variant' : 'home-variant-outline';
                                iconColor = !focused ? '#313030': '#2A3779';

                                return <Icon name={iconName} size={25} color={iconColor}/>;
                            } else if (route.name === 'Membership') {
                                iconName = focused ? 'ribbon-sharp' : 'ribbon-outline';
                                iconColor = !focused ? '#313030': '#2A3779';

                                // @ts-ignore
                                return <Ionicons name={iconName} size={25} color={iconColor}/>;
                            } else if (route.name === 'Marketplace') {
                                iconName = focused ? 'storefront': 'storefront-outline';
                                iconColor = !focused ? '#313030': '#2A3779';

                                return <Icon name={iconName} size={25} color={iconColor}/>;
                            }

                            return <></>;
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
                    <DashboardTab.Screen name="Marketplace"
                                         component={Store}
                                         initialParams={{
                                             currentUserInformation: route.params.currentUserInformation
                                         }}
                    />
                </DashboardTab.Navigator>
            </NavigationContainer>
        </>
    );
};
