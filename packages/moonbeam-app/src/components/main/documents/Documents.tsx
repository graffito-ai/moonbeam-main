import 'react-native-get-random-values';
import React, {useEffect, useState} from "react";
import {DocumentsProps} from "../../../models/DrawerProps";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {NavigationContainer} from "@react-navigation/native";
import {IconButton} from "react-native-paper";
import {DocumentsStackParamList} from "../../../models/DocumentsStackProps";
import {DocumentViewer} from '../../common/DocumentViewer';
import { DocumentsCenter } from './DocumentsCenter';

/**
 * Documents component.
 */
export const Documents = ({route}: DocumentsProps) => {
    // create a state to keep track of whether the drawer header is shown or not
    const [isDrawerHeaderShown, setIsDrawerHeaderShown] = useState<boolean>(true);

    // create a native stack navigator, to be used for our Documents navigation
    const Stack = createNativeStackNavigator<DocumentsStackParamList>();

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        !isDrawerHeaderShown && route.params.setIsDrawerHeaderShown(isDrawerHeaderShown);
    }, [isDrawerHeaderShown]);

    // return the component for the Documents page
    return (
        <NavigationContainer independent={true}>
            <Stack.Navigator
                initialRouteName={"DocumentsCenter"}
                screenOptions={({navigation}) => {
                    return({
                        headerLeft: () => {
                            return(<IconButton
                                icon="chevron-left"
                                iconColor={"#2A3779"}
                                size={40}
                                style={{marginTop: '-5%',  marginLeft: `-10%`}}
                                onPress={() => {
                                    route.params.setIsDrawerHeaderShown(true);
                                    navigation.navigate('DocumentsCenter', {});
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
                    name="DocumentsCenter"
                    component={DocumentsCenter}
                    initialParams={{
                        setIsDrawerHeaderShown: setIsDrawerHeaderShown
                    }}
                    options={{
                        headerShown: false
                    }}
                />
                <Stack.Screen
                    name="DocumentViewer"
                    component={DocumentViewer}
                    initialParams={{
                        name: '',
                        privacyFlag: false,
                        setIsDrawerHeaderShown: setIsDrawerHeaderShown
                    }}
                    options={{
                        headerShown: true
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
