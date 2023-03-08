import React, {useEffect} from 'react';
import {DashboardProps} from '../models/RootProps';
import {BottomBarStackParamList} from '../models/BottomBarProps';
import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {Home} from './Home';
import {Settings} from "./Settings";
import {Membership} from "./Membership";

/**
 * Dashboard component.
 */
export const Dashboard = ({route}: DashboardProps) => {
    // create a native bottom navigator, to be used for our bottom bar navigation
    const DashboardTab = createMaterialBottomTabNavigator<BottomBarStackParamList>();

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
    }, []);

    // return the component for the Dashboard page
    return (
        <NavigationContainer independent={true}>
            <DashboardTab.Navigator
                initialRouteName={"Home"}
                barStyle={{backgroundColor: '#f2f2f2', height: 70}}
                screenOptions={({route}) => ({
                    tabBarIcon: ({focused}) => {
                        let iconName: any;

                        if (route.name === 'Home') {
                            iconName = focused ? 'ios-home-sharp' : 'ios-home-outline';
                        } else if (route.name === 'Membership') {
                            iconName = focused ? 'ribbon-sharp' : 'ribbon-outline';
                        } else if (route.name === 'Settings') {
                            iconName = focused ? 'settings-sharp' : 'settings-outline';
                        }

                        // You can return any component that you like here!
                        return <Ionicons name={iconName} size={25} color={'#313030'}/>;
                    }
                })}
            >
                <DashboardTab.Screen name="Home"
                                     component={Home}
                                     initialParams={{
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
                <DashboardTab.Screen name="Settings"
                                     component={Settings}
                                     initialParams={{
                                         currentUserInformation: route.params.currentUserInformation
                                     }}
                />
            </DashboardTab.Navigator>
        </NavigationContainer>
    );
};
