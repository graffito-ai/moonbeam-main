import React, {useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import {StoreOfferProps} from "../../../../../../models/props/MarketplaceProps";
import {StoreOfferStackParamList} from "../../../../../../models/props/StoreOfferProps";
import {IconButton} from "react-native-paper";
import {Dimensions} from "react-native";
import {commonStyles} from "../../../../../../styles/common.module";
import {useRecoilState} from "recoil";
import {bottomTabShownState} from "../../../../../../recoil/HomeAtom";
import {StoreOfferDetails} from "./StoreOfferDetails";
import {StoreOfferWebView} from "./StoreOfferWebView";

/**
 * StoreOffer component.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const StoreOffer = ({navigation}: StoreOfferProps) => {
    // constants used to keep track of shared states
    const [, setBottomTabShown] = useRecoilState(bottomTabShownState);

    // create a native stack navigator, to be used for our StoreOffer navigation
    const Stack = createNativeStackNavigator<StoreOfferStackParamList>();

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        setBottomTabShown(false);
    }, []);

    // return the component for the StoreOffer page
    return (
        <NavigationContainer independent={true}>
            <Stack.Navigator
                initialRouteName={"StoreOfferDetails"}
                screenOptions={{
                    gestureEnabled: false,
                    headerTitle: '',
                    headerShown: true,
                    headerTransparent: true
                }}
            >
                <Stack.Screen
                    name="StoreOfferDetails"
                    component={StoreOfferDetails}
                    initialParams={{}}
                    options={{
                        headerLeft: () =>
                            <IconButton
                                rippleColor={'transparent'}
                                icon="close"
                                iconColor={"#F2FF5D"}
                                size={Dimensions.get('window').height / 28}
                                style={commonStyles.backButtonDismiss}
                                onPress={() => {
                                    setBottomTabShown(true);
                                    navigation.goBack();
                                }}
                            />
                    }}
                />
                <Stack.Screen
                    name="StoreOfferWebView"
                    component={StoreOfferWebView}
                    initialParams={{}}
                    options={({navigation}) => ({
                        headerLeft: () =>
                            <IconButton
                                rippleColor={'transparent'}
                                icon="close"
                                iconColor={"#F2FF5D"}
                                size={Dimensions.get('window').height / 28}
                                style={[commonStyles.backButtonDismiss, {right: Dimensions.get('window').width/15, bottom: Dimensions.get('window').height/250}]}
                                onPress={() => {
                                    navigation.navigate('StoreOfferDetails', {});
                                }}
                            />
                    })}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};
