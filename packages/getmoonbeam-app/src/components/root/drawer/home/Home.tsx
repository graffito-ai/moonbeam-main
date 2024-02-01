import React, {useEffect} from 'react';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {HomeProps} from "../../../../models/props/AppDrawerProps";
import {createMaterialBottomTabNavigator} from "@react-navigation/material-bottom-tabs";
import {HomeStackParamList} from "../../../../models/props/HomeProps";
import {useRecoilState} from "recoil";
import {bottomTabShownState, drawerNavigationState} from "../../../../recoil/HomeAtom";
import {currentUserInformation} from "../../../../recoil/AuthAtom";
import {MilitaryVerificationStatusType} from "@moonbeam/moonbeam-models";
import {Wallet} from "./cards/Wallet";
import {DashboardController} from "./dashboard/DashboardController";
import {Marketplace} from "./marketplace/Marketplace";
import {drawerDashboardState} from "../../../../recoil/AppDrawerAtom";
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';
import {View} from "react-native";
import {
    filteredByDiscountPressedState,
    filtersActiveState,
    searchQueryState
} from "../../../../recoil/StoreOfferAtom";

/**
 * Home component. This is where the bottom bar components will reside, as well
 * any of their nested children views/navigators.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const Home = ({navigation}: HomeProps) => {
    // constants used to keep track of shared states
    const [, setFilteredByDiscountPressed] = useRecoilState(filteredByDiscountPressedState);
    const [, setAreFiltersActive] = useRecoilState(filtersActiveState);
    const [, setSearchQuery] = useRecoilState(searchQueryState);
    const [, setDrawerNavigation] = useRecoilState(drawerNavigationState);
    const [bottomTabShown,] = useRecoilState(bottomTabShownState);
    const [userInformation,] = useRecoilState(currentUserInformation);
    const [, setIsDrawerInDashboard] = useRecoilState(drawerDashboardState);

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
        // set the drawer navigation
        setDrawerNavigation(navigation);
        // set the custom drawer header style accordingly
        if (navigation.getState().index === 0) {
            setIsDrawerInDashboard(true);

            // reset any store/marketplace related items
            setFilteredByDiscountPressed(false);
            setAreFiltersActive(false);
        }
        // show the application wall accordingly
        if (userInformation["militaryStatus"] !== MilitaryVerificationStatusType.Verified) {
            // @ts-ignore
            navigation.navigate('AppWall', {});
        }
    }, [userInformation["militaryStatus"], navigation.getState()]);

    // return the component for the Home page
    return (
        <>
            <View style={{flex: 1, backgroundColor: '#313030'}}>
                <HomeTabStack.Navigator
                    initialRouteName={"DashboardController"}
                    shifting={true}
                    labeled={true}
                    activeColor={'white'}
                    barStyle={{
                        borderTopWidth: hp(0.05),
                        ...(bottomTabShown && {height: hp(11)}),
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

                                return <Icon name={iconName} size={25} color={iconColor}/>;
                            } else if (route.name === 'Marketplace') {
                                iconName = focused ? 'store-marker' : 'store-marker-outline';
                                iconColor = !focused ? 'white' : '#F2FF5D';

                                return <Icon name={iconName} size={25} color={iconColor}/>;
                            } else if (route.name === 'Cards') {
                                iconName = focused ? 'credit-card-multiple' : 'credit-card-multiple-outline';
                                iconColor = !focused ? 'white' : '#F2FF5D';

                                return <Icon name={iconName} size={25} color={iconColor}/>;
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
            </View>
        </>
    );
};
