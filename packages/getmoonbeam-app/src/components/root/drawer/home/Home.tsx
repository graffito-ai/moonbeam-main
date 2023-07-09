import React, {useEffect} from 'react';
import {NavigationContainer} from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {HomeProps} from "../../../../models/props/AppDrawerProps";
import {createMaterialBottomTabNavigator} from "@react-navigation/material-bottom-tabs";
import {HomeStackParamList} from "../../../../models/props/HomeProps";
import {useRecoilState} from "recoil";
import {bottomTabShownState} from "../../../../recoil/HomeAtom";
import {Dimensions, Text} from 'react-native';
import {currentUserInformation} from "../../../../recoil/AuthAtom";
import {MilitaryVerificationStatusType} from "@moonbeam/moonbeam-models";
import {Wallet} from "./cards/Wallet";
import {DashboardController} from "./dashboard/DashboardController";
import {Marketplace} from "./marketplace/Marketplace";
import * as Linking from "expo-linking";
import {drawerDashboardState} from "../../../../recoil/AppDrawerAtom";

/**
 * Home component. This is where the bottom bar components will reside, as well
 * any of their nested children views/navigators.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const Home = ({navigation}: HomeProps) => {
    // constants used to keep track of shared states
    const [bottomTabShown,] = useRecoilState(bottomTabShownState);
    const [userInformation,] = useRecoilState(currentUserInformation);
    const [, setIsDrawerInDashboard] = useRecoilState(drawerDashboardState);

    // create a bottom navigator, to be used for our Home bottom bar navigation
    const HomeTabStack = createMaterialBottomTabNavigator<HomeStackParamList>();

    // enabling the linking configuration for creating links to the application screens, based on the navigator
    const config = {
        screens: {
            DashboardController: {
                path: 'home/dashboard'
            },
            Marketplace: {
                path: 'home/marketplace'
            },
            Cards: {
                path: 'home/wallet'
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

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // set the custom drawer header style accordingly
        if (navigation.getState().index === 0) {
            setIsDrawerInDashboard(true);
        }
        // show the application wall accordingly
        if (userInformation["militaryStatus"] !== MilitaryVerificationStatusType.Verified) {
            navigation.navigate('AppWall', {});
        }
    }, [userInformation["militaryStatus"], navigation.getState()]);

    // return the component for the Home page
    return (
        <>
            <NavigationContainer independent={true} linking={linking} fallback={<Text>Loading...</Text>}>
                <HomeTabStack.Navigator
                    initialRouteName={"DashboardController"}
                    shifting={true}
                    labeled={true}
                    activeColor={'white'}
                    barStyle={{
                        borderTopWidth: Dimensions.get('window').width / 1000,
                        borderTopColor: '#FFFFFF',
                        backgroundColor: '#313030',
                        ...(!bottomTabShown && {display: 'none'}),
                    }}
                    screenOptions={({route}) => ({
                        tabBarLabel: route.name === 'DashboardController' ? 'Home' : route.name,
                        tabBarIcon: ({focused}) => {
                            let iconName: string;
                            let iconColor: string;

                            if (route.name === 'DashboardController') {
                                iconName = focused ? 'home-variant' : 'home-variant-outline';
                                iconColor = !focused ? 'white' : '#F2FF5D';

                                return <Icon name={iconName} size={30} color={iconColor}/>;
                            } else if (route.name === 'Marketplace') {
                                iconName = focused ? 'store-marker' : 'store-marker-outline';
                                iconColor = !focused ? 'white' : '#F2FF5D';

                                return <Icon name={iconName} size={30} color={iconColor}/>;
                            } else if (route.name === 'Cards') {
                                iconName = focused ? 'credit-card-multiple' : 'credit-card-multiple-outline';
                                iconColor = !focused ? 'white' : '#F2FF5D';

                                return <Icon name={iconName} size={30} color={iconColor}/>;
                            }

                            return <></>;
                        }
                    })}
                >
                    <HomeTabStack.Screen name="DashboardController"
                                         component={DashboardController}
                                         initialParams={{}}
                    />
                    <HomeTabStack.Screen name="Marketplace"
                                         component={Marketplace}
                                         initialParams={{}}
                    />
                    <HomeTabStack.Screen name="Cards"
                                         component={Wallet}
                                         initialParams={{}}
                    />
                </HomeTabStack.Navigator>
            </NavigationContainer>
        </>
    );
};
