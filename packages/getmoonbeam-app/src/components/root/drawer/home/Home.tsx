import React, {useEffect} from 'react';
import {NavigationContainer} from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {HomeProps} from "../../../../models/props/AppDrawerProps";
import {createMaterialBottomTabNavigator} from "@react-navigation/material-bottom-tabs";
import {HomeStackParamList} from "../../../../models/props/HomeProps";
import {useRecoilState} from "recoil";
import {bottomTabShownState} from "../../../../recoil/HomeAtom";
import {Text} from 'react-native';

/**
 * Home component. This is where the bottom bar components will reside, as well
 * any of their nested children views/navigators.
 *
 * @constructor constructor for the component
 */
export const Home = ({}: HomeProps) => {
    // constants used to keep track of shared states
    const [bottomTabShown,] = useRecoilState(bottomTabShownState);

    // create a bottom navigator, to be used for our Home bottom bar navigation
    const HomeTabStack = createMaterialBottomTabNavigator<HomeStackParamList>();

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
    }, []);

    // return the component for the Home page
    return (
        <>
            <NavigationContainer independent={true}>
                <HomeTabStack.Navigator
                    initialRouteName={"Dashboard"}
                    shifting={true}
                    labeled={true}
                    activeColor={'white'}
                    barStyle={{
                        backgroundColor: '#313030',
                        ...(!bottomTabShown && {display: 'none'})
                    }}
                    screenOptions={({route}) => ({
                        tabBarLabel: route.name === 'Dashboard' ? 'Home': route.name,
                        tabBarIcon: ({focused}) => {
                            let iconName: string;
                            let iconColor: string;

                            if (route.name === 'Dashboard') {
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
                    <HomeTabStack.Screen name="Dashboard"
                                         component={() => <><Text>Dashboard</Text></>}
                                         initialParams={{}}
                    />
                    <HomeTabStack.Screen name="Marketplace"
                                         component={() => <><Text>Marketplace</Text></>}
                                         initialParams={{}}
                    />
                    <HomeTabStack.Screen name="Cards"
                                         component={() => <><Text>Cards</Text></>}
                                         initialParams={{}}
                    />
                </HomeTabStack.Navigator>
            </NavigationContainer>
        </>
    );
};
