import React, {useEffect, useState} from 'react';
import {DashboardProps} from "../../../../../models/props/HomeProps";
import {useRecoilState} from "recoil";
import {appDrawerHeaderShownState, customBannerShown, drawerSwipeState} from "../../../../../recoil/AppDrawerAtom";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {NavigationContainer} from "@react-navigation/native";
import {DashboardControllerStackParamList} from "../../../../../models/props/DashboardControllerProps";
import {Dashboard} from "./Dashboard";
import {showTransactionBottomSheetState, showWalletBottomSheetState} from "../../../../../recoil/DashboardAtom";
import {Spinner} from "../../../../common/Spinner";
import {bottomBarNavigationState} from "../../../../../recoil/HomeAtom";

/**
 * DashboardController component. This component will be used as the dashboard for the application,
 * where the Home tab is highlighted from.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const DashboardController = ({navigation}: DashboardProps) => {
        // constants used to keep track of local component state
        const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
        // constants used to keep track of shared states
        const [, setBottomBarNavigation] = useRecoilState(bottomBarNavigationState);
        const [, setAppDrawerHeaderShown] = useRecoilState(appDrawerHeaderShownState);
        const [, setBannerShown] = useRecoilState(customBannerShown);
        const [, setDrawerSwipeEnabled] = useRecoilState(drawerSwipeState);
        const [, setShowTransactionsBottomSheet] = useRecoilState(showTransactionBottomSheetState);
        const [, setShowWalletBottomSheet] = useRecoilState(showWalletBottomSheetState);

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
                setShowWalletBottomSheet(false);
            }
        }, [navigation.getState()]);

        /**
         * return the component for the DashboardController page
         *
         * in the future we will have to implement the TransactionsController and CashbackController
         * in order to account for transaction and cashback statements. For now, we will load all
         * transactions and credits/cashback amounts in the Dashboard component, without allowing users to have
         * a detailed list-based view for them, split by week/month/year.
         *
         * (we will need to address this ASAP after release, because as transactions and cashback list sizes grow,
         * it will be harder and harder for us to load them in a timely manner)
         */
        return (
            <>
                <NavigationContainer independent={true}
                                     fallback={
                                         <Spinner loadingSpinnerShown={loadingSpinnerShown}
                                                  setLoadingSpinnerShown={setLoadingSpinnerShown}/>
                                     }>
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
                            name="TransactionsController"
                            component={() => {
                                return (<></>)
                            }}
                            initialParams={{}}
                        />
                        <DashboardStack.Screen
                            name="CashbackController"
                            component={() => {
                                return (<></>)
                            }}
                            initialParams={{}}
                        />
                    </DashboardStack.Navigator>
                </NavigationContainer>
            </>
        );
    }
;
