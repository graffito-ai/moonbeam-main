import React, {useEffect} from 'react';
import {DashboardHomeProps} from "../../../../../models/props/HomeProps";
import {useRecoilState} from "recoil";
import {appDrawerHeaderShownState, customBannerShown, drawerSwipeState} from "../../../../../recoil/AppDrawerAtom";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {DashboardControllerStackParamList} from "../../../../../models/props/DashboardControllerProps";
import {Dashboard} from "./dashboardComponents/Dashboard";
import {showTransactionBottomSheetState, showWalletBottomSheetState} from "../../../../../recoil/DashboardAtom";
import {bottomBarNavigationState} from "../../../../../recoil/HomeAtom";
import {View} from "react-native";
import {showClickOnlyBottomSheetState} from "../../../../../recoil/StoreOfferAtom";
import {SafeAreaProvider} from "react-native-safe-area-context";

/**
 * DashboardController component. This component will be used as the dashboard for the application,
 * where the Home tab is highlighted from.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const DashboardController = ({navigation}: DashboardHomeProps) => {
        // constants used to keep track of shared states
        const [, setBottomBarNavigation] = useRecoilState(bottomBarNavigationState);
        const [appDrawerHeaderShown, setAppDrawerHeaderShown] = useRecoilState(appDrawerHeaderShownState);
        const [bannerShown, setBannerShown] = useRecoilState(customBannerShown);
        const [drawerSwipeEnabled, setDrawerSwipeEnabled] = useRecoilState(drawerSwipeState);
        const [showTransactionsBottomSheet, setShowTransactionsBottomSheet] = useRecoilState(showTransactionBottomSheetState);
        const [showWalletBottomSheet, setShowWalletBottomSheet] = useRecoilState(showWalletBottomSheetState);
        const [showClickOnlyBottomSheet, setShowClickOnlyBottomSheet] = useRecoilState(showClickOnlyBottomSheetState);

        // create a native stack navigator, to be used for our Dashboard Controller application navigation
        const DashboardStack = createNativeStackNavigator<DashboardControllerStackParamList>();

        /**
         * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
         * auth-related functionality for example), as well as any afferent API calls.
         *
         * Generally speaking, any functionality imperative prior to the full page-load should be
         * included in here.
         */
        useEffect(() => {
            // set the bottom bar navigation
            setBottomBarNavigation(navigation);
            // set the app drawer status accordingly,custom banner visibility and drawer swipe actions accordingly
            if (navigation.getState().index === 0) {
                !appDrawerHeaderShown && setAppDrawerHeaderShown(true)
                !bannerShown && setBannerShown(true);
                !drawerSwipeEnabled && setDrawerSwipeEnabled(true);
                showTransactionsBottomSheet && setShowTransactionsBottomSheet(false);
                showClickOnlyBottomSheet && setShowClickOnlyBottomSheet(false);
                showWalletBottomSheet && setShowWalletBottomSheet(false);
            }
        }, [navigation.getState()]);

        /**
         * return the component for the DashboardController page
         */
        return (
            <>
                <SafeAreaProvider style={{flex: 1, backgroundColor: '#313030'}}>
                    <DashboardStack.Navigator
                        initialRouteName={'Dashboard'}
                        screenOptions={{
                            headerShown: false,
                            gestureEnabled: false
                        }}
                    >
                        <DashboardStack.Screen
                            name="Dashboard"
                            component={Dashboard}
                            initialParams={{}}
                        />
                    </DashboardStack.Navigator>
                </SafeAreaProvider>
            </>
        );
    }
;
