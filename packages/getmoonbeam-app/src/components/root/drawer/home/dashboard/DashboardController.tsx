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
import {ReimbursementsController} from "./reimbursements/ReimbursementsController";

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
        const [, setAppDrawerHeaderShown] = useRecoilState(appDrawerHeaderShownState);
        const [, setBannerShown] = useRecoilState(customBannerShown);
        const [, setDrawerSwipeEnabled] = useRecoilState(drawerSwipeState);
        const [, setShowTransactionsBottomSheet] = useRecoilState(showTransactionBottomSheetState);
        const [, setShowWalletBottomSheet] = useRecoilState(showWalletBottomSheetState);
        const [, setShowClickOnlyBottomSheet] = useRecoilState(showClickOnlyBottomSheetState);

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
                setAppDrawerHeaderShown(true)
                setBannerShown(true);
                setDrawerSwipeEnabled(true);
                setShowTransactionsBottomSheet(false);
                setShowClickOnlyBottomSheet(false);
                setShowWalletBottomSheet(false);
            }
        }, [navigation.getState()]);

        /**
         * return the component for the DashboardController page
         */
        return (
            <>
                <View style={{flex: 1, backgroundColor: '#313030'}}>
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
                        <DashboardStack.Screen
                            name="ReimbursementsController"
                            component={ReimbursementsController}
                            initialParams={{}}
                        />
                        {/*ToDo : This screen will need to be implemented, and it will represent a way for users to see all their transactions and statements */}
                        <DashboardStack.Screen
                            name="TransactionsController"
                            component={() => {
                                return (<></>)
                            }}
                            initialParams={{}}
                        />
                    </DashboardStack.Navigator>
                </View>
            </>
        );
    }
;
