import React, {useEffect} from 'react';
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {IconButton} from "react-native-paper";
import {SettingsProps} from "../../../../models/props/AppDrawerProps";
import {SettingsStackParamList} from "../../../../models/props/SettingsProps";
import {SettingsList} from "./SettingsList";
import {Profile} from './profile/Profile';
import {useRecoilState} from "recoil";
import {appDrawerHeaderShownState, drawerDashboardState, drawerSwipeState} from "../../../../recoil/AppDrawerAtom";
import {styles} from "../../../../styles/settingsList.module";
import {ResetPassword} from "./password/ResetPassword";
import {goToProfileSettingsState} from "../../../../recoil/Settings";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {TouchableOpacity, View} from "react-native";
import {codeVerificationSheetShown} from "../../../../recoil/CodeVerificationAtom";

/**
 * Settings component
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const Settings = ({navigation}: SettingsProps) => {
    // constants used to keep track of shared states
    const [, setGoToProfileSettings] = useRecoilState(goToProfileSettingsState);
    const [, setAppDrawerHeaderShown] = useRecoilState(appDrawerHeaderShownState);
    const [, setDrawerSwipeEnabled] = useRecoilState(drawerSwipeState);
    const [, setIsDrawerInDashboard] = useRecoilState(drawerDashboardState);
    const [showCodeVerificationBottomSheet, setShowCodeVerificationBottomSheet] = useRecoilState(codeVerificationSheetShown);
    // create a native stack navigator, to be used for our Settings navigation
    const Stack = createNativeStackNavigator<SettingsStackParamList>();

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // set the custom drawer header style accordingly
        if (navigation.getState().index === 2) {
            setIsDrawerInDashboard(false);
        }
    }, [navigation.getState()]);

    // return the component for the Settings page
    return (
        <View style={{flex: 1, backgroundColor: '#313030'}}>
            <Stack.Navigator
                initialRouteName={"SettingsList"}
                screenOptions={({navigation}) => {
                    return ({
                        ...(showCodeVerificationBottomSheet && {
                            header: () =>
                                <>
                                    <TouchableOpacity
                                        activeOpacity={1}
                                        disabled={showCodeVerificationBottomSheet}
                                        onPress={() => {
                                            // @ts-ignore
                                            bottomSheetRef.current?.close?.();
                                            setShowCodeVerificationBottomSheet(true);
                                        }}
                                    >
                                        <View
                                            {...showCodeVerificationBottomSheet && {pointerEvents: "none"}}
                                            {...showCodeVerificationBottomSheet && {
                                                style: {backgroundColor: 'transparent', opacity: 0.3}
                                            }}
                                            style={{backgroundColor: 'grey', opacity: 0.7}}
                                        >
                                            <View style={{
                                                height: hp(11),
                                                width: wp(100),
                                                flexDirection: 'column'
                                            }}>
                                                <IconButton
                                                    icon="chevron-left"
                                                    iconColor={"#F2FF5D"}
                                                    size={hp(4.5)}
                                                    style={[styles.backButton, {top: hp(4.5), right: wp(1)}]}
                                                    onPress={() => {
                                                        // enable swipes for the App Drawer
                                                        setDrawerSwipeEnabled(true);

                                                        // set the visibility of the App Header
                                                        setAppDrawerHeaderShown(true);

                                                        // reset any navigation flags
                                                        setGoToProfileSettings(false);

                                                        // navigate back to the SettingsList component
                                                        navigation.navigate('SettingsList', {});
                                                    }}
                                                />
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                </>
                        }),
                        headerLeft: () => {
                            return (
                                <IconButton
                                    icon="chevron-left"
                                    iconColor={"#F2FF5D"}
                                    size={hp(4.5)}
                                    style={styles.backButton}
                                    onPress={() => {
                                        // enable swipes for the App Drawer
                                        setDrawerSwipeEnabled(true);

                                        // set the visibility of the App Header
                                        setAppDrawerHeaderShown(true);

                                        // reset any navigation flags
                                        setGoToProfileSettings(false);

                                        // navigate back to the SettingsList component
                                        navigation.navigate('SettingsList', {});
                                    }}
                                />
                            )
                        },
                        headerTitle: '',
                        headerTransparent: false,
                        headerStyle: {backgroundColor: '#313030'},
                        gestureEnabled: false
                    })
                }}
            >
                <Stack.Screen
                    name="Profile"
                    component={Profile}
                    options={{
                        headerShown: true
                    }}
                    initialParams={{}}
                />
                <Stack.Screen
                    name="SettingsList"
                    component={SettingsList}
                    options={{
                        headerShown: false
                    }}
                    initialParams={{}}
                />
                <Stack.Screen
                    name="ResetPassword"
                    component={ResetPassword}
                    options={{
                        headerShown: true
                    }}
                    initialParams={{}}
                />
            </Stack.Navigator>
        </View>
    );
};
