import React from 'react';
import {DashboardProps} from '../models/RootProps';
import {BottomBarStackParamList} from '../models/BottomBarProps';
import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {Home} from './Home';
import {Membership} from './Membership';
import {Settings} from "./Settings";

/**
 * Dashboard component.
 */
export const Dashboard = ({}: DashboardProps) => {
    // create a native bottom navigator, to be used for our bottom bar navigation
    const DashboardTab = createMaterialBottomTabNavigator<BottomBarStackParamList>();

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
                                     initialParams={{pointValueRedeemed: 0}}/>
                <DashboardTab.Screen name="Membership"
                                     component={Membership}/>
                <DashboardTab.Screen name="Settings"
                                     component={Settings}/>
            </DashboardTab.Navigator>
        </NavigationContainer>
    );
};
