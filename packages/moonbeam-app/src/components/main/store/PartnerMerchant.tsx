import 'react-native-get-random-values';
import React, {useEffect, useState} from "react";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {NavigationContainer} from "@react-navigation/native";
import {IconButton} from "react-native-paper";
import {PartnerMerchantProps} from "../../../models/StoreStackProps";
import {PartnerMerchantStackParamList} from "../../../models/PartnerMerchantStackProps";
import {PartnerMerchantStore} from './PartnerMerchantStore';
import {PartnerMerchantWebView} from './PartnerMerchantWebView';
import {WebViewNavbar} from '../../common/WebViewNavbar';

/**
 * PartnerMerchant component.
 */
export const PartnerMerchant = ({route, navigation}: PartnerMerchantProps) => {
    // create a native stack navigator, to be used for our PartnerMerchant navigation
    const Stack = createNativeStackNavigator<PartnerMerchantStackParamList>();

    // create a state to keep track of the reload state passed from the WebViewNavbar component button
    const [reloadState, setReloadState] = useState<boolean>(false);

    // create a state to keep track of the webViewRef from the PartnerMerchantWebView
    const [webViewRef, setWebViewRef] = useState<any>();

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        if (reloadState) {
            // reset reload state
            setReloadState(false);
            // reload the page appropriately
            // @ts-ignore
            reloadState && webViewRef && webViewRef.current.reload();
        }
        route.params.setBottomTabNavigationShown && route.params.setBottomTabNavigationShown(false);
    }, [reloadState]);

    // return the component for the PartnerMerchant page
    return (
        <NavigationContainer independent={true}>
            <Stack.Navigator
                initialRouteName={"PartnerMerchantStore"}
                screenOptions={{
                    headerLeft: () => {
                        return (
                            <IconButton
                                rippleColor={'#ecebeb'}
                                icon="close"
                                iconColor={"#2A3779"}
                                size={30}
                                style={{marginTop: '-5%', marginLeft: `-5%`}}
                                onPress={() => {
                                    route.params.setBottomTabNavigationShown && route.params.setBottomTabNavigationShown(true);
                                    navigation.goBack();
                                }}
                            />)
                    },
                    headerTitle: '',
                    headerTransparent: true,
                    headerTintColor: '#2A3779'
                }}
            >
                <Stack.Screen
                    name="PartnerMerchantStore"
                    component={PartnerMerchantStore}
                    initialParams={{
                        currentUserInformation: route.params.currentUserInformation
                    }}
                    options={{
                        headerShown: true
                    }}
                />
                <Stack.Screen
                    name="PartnerMerchantWebView"
                    component={PartnerMerchantWebView}
                    initialParams={{
                        setWebViewRef: setWebViewRef,
                        currentUserInformation: route.params.currentUserInformation
                    }}
                    options={{
                        header: () => {
                            return (
                                <WebViewNavbar navigation={navigation} route={route} setReloadState={setReloadState}/>
                            )
                        }
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
