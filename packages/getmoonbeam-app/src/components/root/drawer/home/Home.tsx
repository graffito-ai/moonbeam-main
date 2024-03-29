import React, {useEffect, useState} from 'react';
import {Icon} from "@rneui/base";
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
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {filteredByDiscountPressedState, filtersActiveState} from "../../../../recoil/StoreOfferAtom";
import {Spinner} from "../../../common/Spinner";
import {SafeAreaProvider} from "react-native-safe-area-context";
import {Services} from "./services/Services";

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
                        initialRouteName={bottomBarNavigation === null ? "DashboardController" : (bottomBarNavigation.getState().index === 0 ? "DashboardController" : (bottomBarNavigation.getState().index === 1 ? "Marketplace" : "Cards"))}
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
                                                 tabBarIcon: ({focused}) => (
                                                     <Icon
                                                         type={"antdesign"}
                                                         name={!focused ? 'linechart' : 'areachart'}
                                                         size={hp(3.5)}
                                                         color={!focused ? 'white' : '#F2FF5D'}
                                                     />
                                                     // <View style={{
                                                     //     left: wp(1),
                                                     //     right: wp(1),
                                                     //     alignItems: 'center',
                                                     //     justifyContent: 'center',
                                                     //     top: hp(0.5),
                                                     //     width: wp(15),
                                                     //     height: hp(6)
                                                     // }}>
                                                     //     <Icon
                                                     //         type={"antdesign"}
                                                     //         name={!focused ? 'linechart' : 'areachart'}
                                                     //         size={hp(3)}
                                                     //         color={!focused ? 'white' : '#F2FF5D'}
                                                     //     />
                                                     //     <Text style={{
                                                     //         top: hp(0.5),
                                                     //         fontFamily: 'Raleway-Bold',
                                                     //         fontSize: hp(1.6),
                                                     //         color: !focused ? 'white' : '#F2FF5D',
                                                     //         textAlign: 'center'
                                                     //     }}>
                                                     //         {'Home'}
                                                     //     </Text>
                                                     // </View>
                                                 )
                                             }}
                        />
                        <HomeTabStack.Screen name="Services"
                                             component={Services}
                                             initialParams={{}}
                                             options={({}) => ({
                                                 tabBarIcon: ({focused}) => (
                                                     <Icon
                                                         type={!focused ? "font-awesome" : "font-awesome-5"}
                                                         name={!focused ? 'handshake-o' : 'handshake'}
                                                         size={hp(3.5)}
                                                         color={!focused ? 'white' : '#F2FF5D'}
                                                     />
                                                     // <View style={{
                                                     //     left: wp(1),
                                                     //     right: wp(1),
                                                     //     alignItems: 'center',
                                                     //     justifyContent: 'center',
                                                     //     top: hp(0.55),
                                                     //     width: wp(15),
                                                     //     height: hp(6)
                                                     // }}>
                                                     //     <Icon
                                                     //         type={"ionicon"}
                                                     //         name={!focused ? 'pricetags-outline' : 'pricetags'}
                                                     //         size={hp(3)}
                                                     //         color={!focused ? 'white' : '#F2FF5D'}
                                                     //     />
                                                     //     <Text style={{
                                                     //         top: hp(0.5),
                                                     //         fontFamily: 'Raleway-Bold',
                                                     //         fontSize: hp(1.6),
                                                     //         color: !focused ? 'white' : '#F2FF5D',
                                                     //         textAlign: 'center'
                                                     //     }}>
                                                     //         {'Services'}
                                                     //     </Text>
                                                     // </View>
                                                 )
                                                 // tabBarButton: ({}) => (
                                                 //     <TouchableOpacity
                                                 //         activeOpacity={0.90}
                                                 //         onPress={() => {
                                                 //             // navigate to the Marketplace
                                                 //             navigation.navigate('Marketplace', {});
                                                 //         }}
                                                 //         style={{
                                                 //             zIndex: 10000,
                                                 //             justifyContent: 'center',
                                                 //             alignContent: 'center',
                                                 //             shadowColor: 'black',
                                                 //             shadowOffset: {width: -2, height: 10},
                                                 //             shadowOpacity: 0.65,
                                                 //             shadowRadius: 15,
                                                 //             elevation: 20,
                                                 //             borderRadius: 10,
                                                 //             bottom: hp(2.5)
                                                 //         }}>
                                                 //         <View style={{
                                                 //             right: wp(5),
                                                 //             width: hp(8),
                                                 //             height: hp(8),
                                                 //             borderRadius: 50,
                                                 //             backgroundColor: '#F2FF5D',
                                                 //             justifyContent: 'center',
                                                 //             alignItems: 'center',
                                                 //             alignContent: 'center'
                                                 //         }}>
                                                 //             <Icon
                                                 //                 type={"ionicon"}
                                                 //                 name={navigation.getState().index === 1 ? 'storefront' : 'storefront'}
                                                 //                 size={hp(5)}
                                                 //                 color={'#3b3b3b'}
                                                 //             />
                                                 //         </View>
                                                 //     </TouchableOpacity>
                                                 // )
                                             })}
                        />
                        <HomeTabStack.Screen name="Marketplace"
                                             component={Marketplace}
                                             initialParams={{}}
                                             options={({}) => ({
                                                 tabBarIcon: ({focused}) => (
                                                     <Icon
                                                         type={"ionicon"}
                                                         name={!focused ? 'storefront-outline' : 'storefront'}
                                                         size={hp(3.5)}
                                                         color={!focused ? 'white' : '#F2FF5D'}
                                                     />
                                                     // <View style={{
                                                     //     left: wp(1),
                                                     //     right: wp(1),
                                                     //     alignItems: 'center',
                                                     //     justifyContent: 'center',
                                                     //     top: hp(0.56),
                                                     //     width: wp(15),
                                                     //     height: hp(6)
                                                     // }}>
                                                     //     <Icon
                                                     //         type={"ionicon"}
                                                     //         name={!focused ? 'storefront-outline' : 'storefront'}
                                                     //         size={hp(3)}
                                                     //         color={!focused ? 'white' : '#F2FF5D'}
                                                     //     />
                                                     //     <Text style={{
                                                     //         top: hp(0.5),
                                                     //         fontFamily: 'Raleway-Bold',
                                                     //         fontSize: hp(1.6),
                                                     //         color: !focused ? 'white' : '#F2FF5D',
                                                     //         textAlign: 'center'
                                                     //     }}>
                                                     //         {'Offers'}
                                                     //     </Text>
                                                     // </View>
                                                 )
                                                 // tabBarButton: ({}) => (
                                                 //     <TouchableOpacity
                                                 //         activeOpacity={0.90}
                                                 //         onPress={() => {
                                                 //             // navigate to the Marketplace
                                                 //             navigation.navigate('Marketplace', {});
                                                 //         }}
                                                 //         style={{
                                                 //             zIndex: 10000,
                                                 //             justifyContent: 'center',
                                                 //             alignContent: 'center',
                                                 //             shadowColor: 'black',
                                                 //             shadowOffset: {width: -2, height: 10},
                                                 //             shadowOpacity: 0.65,
                                                 //             shadowRadius: 15,
                                                 //             elevation: 20,
                                                 //             borderRadius: 10,
                                                 //             bottom: hp(2.5)
                                                 //         }}>
                                                 //         <View style={{
                                                 //             left: wp(5),
                                                 //             width: hp(8),
                                                 //             height: hp(8),
                                                 //             borderRadius: 50,
                                                 //             backgroundColor: '#F2FF5D',
                                                 //             justifyContent: 'center',
                                                 //             alignItems: 'center',
                                                 //             alignContent: 'center'
                                                 //         }}>
                                                 //             <Icon
                                                 //                 type={"ionicon"}
                                                 //                 name={navigation.getState().index === 1 ? 'storefront' : 'storefront'}
                                                 //                 size={hp(5)}
                                                 //                 color={'#3b3b3b'}
                                                 //             />
                                                 //         </View>
                                                 //     </TouchableOpacity>
                                                 // )
                                             })}
                        />
                        <HomeTabStack.Screen name="Cards"
                                             component={Wallet}
                                             initialParams={{}}
                                             options={{
                                                 tabBarIcon: ({focused}) => (
                                                     <Icon
                                                         type={"ionicon"}
                                                         name={!focused ? 'card-outline' : 'card'}
                                                         size={hp(3.5)}
                                                         color={!focused ? 'white' : '#F2FF5D'}
                                                     />
                                                     // <View style={{
                                                     //     left: wp(1),
                                                     //     marginRight: wp(3),
                                                     //     alignItems: 'center',
                                                     //     justifyContent: 'center',
                                                     //     top: hp(0.43),
                                                     //     width: wp(15),
                                                     //     height: hp(6),
                                                     //     flexDirection: 'column'
                                                     // }}>
                                                     //     <Icon
                                                     //         type={"ionicon"}
                                                     //         name={!focused ? 'card-outline' : 'card'}
                                                     //         size={hp(3.35)}
                                                     //         color={!focused ? 'white' : '#F2FF5D'}
                                                     //     />
                                                     //     <Text style={{
                                                     //         top: hp(0.5),
                                                     //         fontFamily: 'Raleway-Bold',
                                                     //         fontSize: hp(1.6),
                                                     //         color: !focused ? 'white' : '#F2FF5D',
                                                     //         textAlign: 'center'
                                                     //     }}>
                                                     //         {'Wallet'}
                                                     //     </Text>
                                                     // </View>
                                                 )
                                             }}
                        />
                    </HomeTabStack.Navigator>
                </SafeAreaProvider>
            }
        </>
    );
};
