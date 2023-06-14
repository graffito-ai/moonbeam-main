import React, {useEffect} from 'react';
import {NavigationContainer} from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {HomeProps} from "../../../../models/props/AppDrawerProps";
import {createMaterialBottomTabNavigator} from "@react-navigation/material-bottom-tabs";
import {HomeStackParamList} from "../../../../models/props/HomeProps";
import {useRecoilState} from "recoil";
import {bottomTabShownState} from "../../../../recoil/HomeAtom";

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
                    barStyle={{
                        backgroundColor: 'white',
                        height: 70,
                        ...(!bottomTabShown && {display: 'none'})
                    }}
                    screenOptions={({route}) => ({
                        tabBarIcon: ({focused}) => {
                            let iconName: string;
                            let iconColor: string;

                            if (route.name === 'Dashboard') {
                                iconName = focused ? 'home-variant' : 'home-variant-outline';
                                iconColor = !focused ? '#313030': '#2A3779';

                                return <Icon name={iconName} size={25} color={iconColor}/>;
                            } else if (route.name === 'Marketplace') {
                                iconName = focused ? 'ribbon-sharp' : 'ribbon-outline';
                                iconColor = !focused ? '#313030': '#2A3779';

                                // @ts-ignore
                                return <Ionicons name={iconName} size={25} color={iconColor}/>;
                            } else if (route.name === 'Cards') {
                                iconName = focused ? 'storefront': 'storefront-outline';
                                iconColor = !focused ? '#313030': '#2A3779';

                                return <Icon name={iconName} size={25} color={iconColor}/>;
                            }

                            return <></>;
                        }
                    })}
                >
                    <HomeTabStack.Screen name="Dashboard"
                                         component={() => <></>}
                                         initialParams={{}}
                    />
                    <HomeTabStack.Screen name="Marketplace"
                                         component={() => <></>}
                                         initialParams={{}}
                    />
                    <HomeTabStack.Screen name="Cards"
                                         component={() => <></>}
                                         initialParams={{}}
                    />
                </HomeTabStack.Navigator>
            </NavigationContainer>
        </>
    );
};
