import React, {useEffect} from 'react';
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {ReimbursementsControllerStackParamList} from "../../../../../../models/props/ReimbursementsControllerProps";
import {useRecoilState, useRecoilValue} from "recoil";
import {appDrawerHeaderShownState, drawerSwipeState} from "../../../../../../recoil/AppDrawerAtom";
import {bottomTabShownState} from "../../../../../../recoil/HomeAtom";
import {Text, TouchableOpacity, View} from "react-native";
import {styles} from "../../../../../../styles/reimbursementsController.module";
import {LinearGradient} from 'expo-linear-gradient';
import {Icon} from '@rneui/base';
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';
import {ReimbursementsControllerProps} from "../../../../../../models/props/DashboardControllerProps";
import {currentBalanceState} from "../../../../../../recoil/DashboardAtom";
import {ReimbursementsSummary} from "./ReimbursementsSummary";

/**
 * Reimbursements Controller component. This component will be used as the main
 * component for Reimbursements.
 *
 * @constructor constructor for the component.
 */
export const ReimbursementsController = ({navigation}: ReimbursementsControllerProps) => {
    // constants used to keep track of shared states
    const currentBalance = useRecoilValue(currentBalanceState);
    const [appDrawerHeaderShown, setAppDrawerHeaderShown] = useRecoilState(appDrawerHeaderShownState);
    const [drawerSwipeEnabled, setDrawerSwipeEnabled] = useRecoilState(drawerSwipeState);
    const [bottomTabShown, setBottomTabShown] = useRecoilState(bottomTabShownState);

    // create a native stack navigator, to be used for our Dashboard Controller application navigation
    const ReimbursementsStack = createNativeStackNavigator<ReimbursementsControllerStackParamList>();

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // do not show the app drawer or bottom bar, and disable and swipe-based navigation for screen
        appDrawerHeaderShown && setAppDrawerHeaderShown(false);
        drawerSwipeEnabled && setDrawerSwipeEnabled(false);
        bottomTabShown && setBottomTabShown(false);
    }, [appDrawerHeaderShown, drawerSwipeEnabled, bottomTabShown]);

    /**
     * return the component for the ReimbursementsController page
     */
    return (
        <>
            <View style={{flex: 1}}>
                <ReimbursementsStack.Navigator
                    initialRouteName={'ReimbursementsSummary'}
                    screenOptions={({}) => ({
                        headerShown: true,
                        gestureEnabled: false,
                        header: () =>
                            <>
                                <LinearGradient
                                    start={{x: 0.2, y: 1.5}}
                                    end={{x: 2, y: 5.5}}
                                    colors={['#313030', '#FFFFFF']}
                                    style={styles.headerView}>
                                    <View style={styles.topHeaderView}>
                                        <View style={styles.headerBalanceView}>
                                            <Text style={styles.headerAvailableBalanceTop}>
                                                Available Balance
                                            </Text>
                                            <Text style={styles.headerAvailableBalanceBottom}>
                                                {`$ ${currentBalance.toFixed(2)}`}
                                            </Text>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => {
                                                // go back to the Home/Dashboard screen
                                                navigation.goBack();
                                                setAppDrawerHeaderShown(true);
                                                setDrawerSwipeEnabled(true);
                                                setBottomTabShown(true);
                                            }}
                                            activeOpacity={0.65}
                                            style={styles.headerCloseIcon}>
                                            <Icon
                                                type={"antdesign"}
                                                name={"close"}
                                                color={"white"}
                                                size={hp(3.75)}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </LinearGradient>
                                <View style={styles.headerButtonView}>

                                </View>
                            </>
                    })}
                >
                    <ReimbursementsStack.Screen
                        name="ReimbursementsSummary"
                        component={ReimbursementsSummary}
                        initialParams={{}}
                    />
                    <ReimbursementsStack.Screen
                        name="NewReimbursement"
                        component={() => {
                            return (<></>)
                        }}
                        initialParams={{}}
                    />
                </ReimbursementsStack.Navigator>
            </View>
        </>
    );
};

