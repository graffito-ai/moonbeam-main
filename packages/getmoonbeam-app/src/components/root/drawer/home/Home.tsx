import React, {useEffect, useState} from 'react';
import {HomeProps} from "../../../../models/props/AppDrawerProps";
import {HomeStackParamList} from "../../../../models/props/HomeProps";
import {useRecoilState} from "recoil";
import {
    bottomBarNavigationState,
    bottomTabNeedsShowingState,
    bottomTabShownState,
    comingFromMarketplaceState,
    drawerNavigationState
} from "../../../../recoil/HomeAtom";
import {currentUserInformation} from "../../../../recoil/AuthAtom";
import {MilitaryVerificationStatusType} from "@moonbeam/moonbeam-models";
import {Wallet} from "./cards/Wallet";
import {DashboardController} from "./dashboard/DashboardController";
import {Marketplace} from "./marketplace/Marketplace";
import {drawerDashboardState} from "../../../../recoil/AppDrawerAtom";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {filteredByDiscountPressedState, filtersActiveState} from "../../../../recoil/StoreOfferAtom";
import {Spinner} from "../../../common/Spinner";
import {SafeAreaProvider} from "react-native-safe-area-context";
import {Services} from "./services/Services";
import {Image} from 'react-native';
// @ts-ignore
import ServicesActive from '../../../../../assets/icons/moonbeam-services-active.png';
// @ts-ignore
import ServicesInActive from '../../../../../assets/icons/moonbeam-services-inactive.png';
// @ts-ignore
import CardsActive from '../../../../../assets/icons/moonbeam-cards-active.png';
// @ts-ignore
import CardsInActive from '../../../../../assets/icons/moonbeam-cards-inactive.png';
// @ts-ignore
import MarketplaceActive from '../../../../../assets/icons/moonbeam-marketplace-active.png';
// @ts-ignore
import MarketplaceInActive from '../../../../../assets/icons/moonbeam-marketplace-inactive.png';
// @ts-ignore
import RoundupsActive from '../../../../../assets/icons/moonbeam-roundups-active.png';
// @ts-ignore
import RoundupsInActive from '../../../../../assets/icons/moonbeam-roundups-inactive.png';
// @ts-ignore
import DashboardActive from '../../../../../assets/icons/moonbeam-dashboard-active.png';
// @ts-ignore
import DashboardInActive from '../../../../../assets/icons/moonbeam-dashboard-inactive.png';
import {Roundups} from "./roundups/Roundups";

/**
 * Home component. This is where the bottom bar components will reside, as well
 * any of their nested children views/navigators.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const Home = ({navigation}: HomeProps) => {
    // constants used to keep track of shared states
    const [isReady,] = useState<boolean>(true);
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
    const [, setFilteredByDiscountPressed] = useRecoilState(filteredByDiscountPressedState);
    const [, setAreFiltersActive] = useRecoilState(filtersActiveState);
    const [, setDrawerNavigation] = useRecoilState(drawerNavigationState);
    const [bottomTabShown,] = useRecoilState(bottomTabShownState);
    const [userInformation,] = useRecoilState(currentUserInformation);
    const [, setIsDrawerInDashboard] = useRecoilState(drawerDashboardState);
    const [bottomTabNeedsShowing,] = useRecoilState(bottomTabNeedsShowingState);
    const [bottomBarNavigation,] = useRecoilState(bottomBarNavigationState);
    const [comingFromMarketplace,] = useRecoilState(comingFromMarketplaceState);

    // create a bottom navigator, to be used for our Home bottom bar navigation
    const HomeTabStack = createBottomTabNavigator<HomeStackParamList>();

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

            // prevent the bounciness for Dashboard and Wallet
            if (comingFromMarketplace) {
                // do nothing for now
            }
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
            {!isReady ?
                <Spinner loadingSpinnerShown={loadingSpinnerShown} setLoadingSpinnerShown={setLoadingSpinnerShown}/>
                :
                <SafeAreaProvider style={{flex: 1, backgroundColor: '#313030'}}>
                    <HomeTabStack.Navigator
                        initialRouteName={bottomBarNavigation === null ? "DashboardController" : (bottomBarNavigation.getState().index === 0 ? "DashboardController" : (bottomBarNavigation.getState().index === 1 ? "Roundups" : (bottomBarNavigation.getState().index === 2) ?  "Marketplace" : (bottomBarNavigation.getState().index === 3 ? "Cards" : "Services")))}
                        screenOptions={() => ({
                            tabBarShowLabel: false,
                            header: () => {
                                return (<></>)
                            },
                            tabBarStyle: {
                                ...(bottomTabShown && {height: hp(10)}),
                                backgroundColor: '#3b3b3b',
                                shadowColor: 'black',
                                shadowOffset: {width: -2, height: 10},
                                shadowOpacity: 0.95,
                                shadowRadius: 15,
                                elevation: 20,
                                // ...((toggleViewPressed === 'vertical' && storeOfferClicked === null) && {position: 'relative'}),
                                ...((!bottomTabShown || !bottomTabNeedsShowing) && {display: 'none'})
                            }
                        })}
                    >
                        <HomeTabStack.Screen name="DashboardController"
                                             component={DashboardController}
                                             initialParams={{}}
                                             options={{
                                                 tabBarLabel: 'Discounts',
                                                 tabBarLabelStyle: {
                                                     fontSize: hp(1.5),
                                                     fontFamily: 'Raleway-Bold',
                                                     color: 'white',
                                                     textAlign: 'center'
                                                 },
                                                 tabBarIcon: ({focused}) => (
                                                     <Image
                                                         style={{alignSelf: 'center', height: hp(12), width: wp(12)}}
                                                         source={focused ? DashboardActive : DashboardInActive}
                                                         resizeMethod={"scale"}
                                                         resizeMode={"contain"}
                                                     />
                                                 )
                                             }}
                        />
                        <HomeTabStack.Screen name="Roundups"
                                             component={Roundups}
                                             initialParams={{}}
                                             options={{
                                                 tabBarLabel: 'Savings',
                                                 tabBarLabelStyle: {
                                                     fontSize: hp(1.5),
                                                     fontFamily: 'Raleway-Bold',
                                                     color: 'white',
                                                     textAlign: 'center'
                                                 },
                                                 tabBarIcon: ({focused}) => (
                                                     <Image
                                                         style={{alignSelf: 'center', height: hp(12), width: wp(12)}}
                                                         source={focused ? RoundupsActive : RoundupsInActive}
                                                         resizeMethod={"scale"}
                                                         resizeMode={"contain"}
                                                     />
                                                 )
                                             }}
                        />
                        <HomeTabStack.Screen name="Marketplace"
                                             component={Marketplace}
                                             initialParams={{}}
                                             options={({}) => ({
                                                 tabBarLabel: 'Offers',
                                                 tabBarLabelStyle: {
                                                     fontSize: hp(1.5),
                                                     fontFamily: 'Raleway-Bold',
                                                     color: 'white',
                                                     textAlign: 'center'
                                                 },
                                                 tabBarIcon: ({focused}) => (
                                                     <Image
                                                         style={{alignSelf: 'center', height: hp(12), width: wp(12)}}
                                                         source={focused ? MarketplaceActive : MarketplaceInActive}
                                                         resizeMethod={"scale"}
                                                         resizeMode={"contain"}
                                                     />
                                                 )
                                             })}
                        />
                        <HomeTabStack.Screen name="Cards"
                                             component={Wallet}
                                             initialParams={{}}
                                             options={{
                                                 tabBarLabel: 'Wallet',
                                                 tabBarLabelStyle: {
                                                     fontSize: hp(1.5),
                                                     fontFamily: 'Raleway-Bold',
                                                     color: 'white',
                                                     textAlign: 'center'
                                                 },
                                                 tabBarIcon: ({focused}) => (
                                                     <Image
                                                         style={{alignSelf: 'center', height: hp(12), width: wp(12)}}
                                                         source={focused ? CardsActive : CardsInActive}
                                                         resizeMethod={"scale"}
                                                         resizeMode={"contain"}
                                                     />
                                                 )
                                             }}
                        />
                        <HomeTabStack.Screen name="Services"
                                             component={Services}
                                             initialParams={{}}
                                             options={({}) => ({
                                                 tabBarLabel: 'Services',
                                                 tabBarLabelStyle: {
                                                     fontSize: hp(1.5),
                                                     fontFamily: 'Raleway-Bold',
                                                     color: 'white',
                                                     textAlign: 'center'
                                                 },
                                                 tabBarIcon: ({focused}) => (
                                                     <Image
                                                         style={{alignSelf: 'center', height: hp(12), width: wp(12)}}
                                                         source={focused ? ServicesActive : ServicesInActive}
                                                         resizeMethod={"scale"}
                                                         resizeMode={"contain"}
                                                     />
                                                 )
                                             })}
                        />
                    </HomeTabStack.Navigator>
                </SafeAreaProvider>
            }
        </>
    );
};
