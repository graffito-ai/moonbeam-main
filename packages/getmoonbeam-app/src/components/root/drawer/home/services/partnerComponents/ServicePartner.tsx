import React, {useEffect} from 'react';
import {SafeAreaProvider} from "react-native-safe-area-context";
import {ServicePartnerProps} from "../../../../../../models/props/ServicesProps";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {ServicePartnerStackParamList} from "../../../../../../models/props/ServicePartnerProps";
import {IconButton} from "react-native-paper";
import {heightPercentageToDP as hp} from "react-native-responsive-screen";
import {commonStyles} from "../../../../../../styles/common.module";
import {useRecoilState} from "recoil";
import {bottomTabShownState} from "../../../../../../recoil/HomeAtom";
import {servicePartnerState} from "../../../../../../recoil/ServicesAtom";
import {ServicePartnerDetails} from "./ServicePartnerDetails";
import {ServicePartnerWebView} from "./ServicePartnerWebView";

/**
 * ServicePartner component.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const ServicePartner = ({navigation}: ServicePartnerProps) => {
    // constants used to keep track of local component state

    // constants used to keep track of shared states
    const [, setServicePartner] = useRecoilState(servicePartnerState);
    const [bottomTabShown, setBottomTabShown] = useRecoilState(bottomTabShownState);

    // create a native stack navigator, to be used for our ServicePartner navigation
    const Stack = createNativeStackNavigator<ServicePartnerStackParamList>();

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        if (navigation.getState().index === 1) {
            // hide the bottom bar if shown
            bottomTabShown && setBottomTabShown(false);
        }
    }, [navigation.getState(), bottomTabShown]);

    // return the component for the ServicePartner page
    return (
        <SafeAreaProvider style={{flex: 1, backgroundColor: '#313030'}}>
            <Stack.Navigator
                initialRouteName={"ServicePartnerDetails"}
                screenOptions={{
                    gestureEnabled: false,
                    headerTitle: '',
                    headerShown: true,
                    headerTransparent: true
                }}
            >
                <Stack.Screen
                    name="ServicePartnerDetails"
                    component={ServicePartnerDetails}
                    initialParams={{}}
                    options={{
                        headerLeft: () =>
                            <IconButton
                                rippleColor={'transparent'}
                                icon="close"
                                iconColor={"#F2FF5D"}
                                size={hp(4)}
                                style={commonStyles.backButtonDismiss}
                                onPress={() => {
                                    // show the bottom bar
                                    setBottomTabShown(true);
                                    // reset the service partner clicked state
                                    setServicePartner(null);
                                    // go back to the previous screen which led us here
                                    navigation.goBack();
                                }}
                            />
                    }}
                />
                <Stack.Screen
                    name="ServicePartnerWebView"
                    component={ServicePartnerWebView}
                    options={{
                        headerShown: false
                    }}
                />
            </Stack.Navigator>
        </SafeAreaProvider>
    );
};
