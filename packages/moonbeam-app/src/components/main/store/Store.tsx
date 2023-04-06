import 'react-native-get-random-values';
import React, {useEffect} from "react";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {NavigationContainer} from "@react-navigation/native";
import {IconButton} from "react-native-paper";
import {StoreTabProps} from "../../../models/BottomBarProps";
import {StoreStackParamList} from "../../../models/StoreStackProps";
import {Marketplace} from "./Marketplace";

/**
 * Store component.
 */
export const Store = ({}: StoreTabProps) => {
    // create a native stack navigator, to be used for our Store navigation
    const Stack = createNativeStackNavigator<StoreStackParamList>();

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {

    }, []);

    // return the component for the Store page
    return (
        <NavigationContainer independent={true}>
            <Stack.Navigator
                initialRouteName={"Marketplace"}
                screenOptions={({navigation}) => {
                    return({
                        headerLeft: () => {
                            return(<IconButton
                                icon="chevron-left"
                                iconColor={"#2A3779"}
                                size={40}
                                style={{marginTop: '-5%',  marginLeft: `-10%`}}
                                onPress={() => {
                                    navigation.navigate('StoreHorizontal', {});
                                }}
                            />)
                        },
                        headerTitle: '',
                        headerTransparent: true,
                        headerTintColor: '#2A3779'
                    })
                }}
            >
                <Stack.Screen
                    name="Marketplace"
                    component={Marketplace}
                    initialParams={{

                    }}
                    options={{
                        headerShown: false
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
