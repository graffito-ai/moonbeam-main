import 'react-native-get-random-values';
import React, {useEffect} from "react";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {DocumentsCenter} from './DocumentsCenter';
import {DocumentsStackParamList} from '../../../../models/props/DocumentsProps';
import {DocumentsViewer} from '../../../common/DocumentsViewer';
import {DocumentsProps} from '../../../../models/props/AppDrawerProps';
import {useRecoilState} from "recoil";
import {drawerDashboardState} from "../../../../recoil/AppDrawerAtom";
import {View} from "react-native";

/**
 * Documents component.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const Documents = ({navigation}: DocumentsProps) => {
    // constants used to keep track of shared states
    const [, setIsDrawerInDashboard] = useRecoilState(drawerDashboardState);

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
        // set the custom drawer header style accordingly
        if (navigation.getState().index === 1) {
            setIsDrawerInDashboard(false);
        }
    }, [navigation.getState()]);

    // return the component for the Documents page
    return (
        <View style={{flex: 1, backgroundColor: '#313030'}}>
            <Stack.Navigator
                initialRouteName={"DocumentsCenter"}
                screenOptions={{
                    headerTitle: '',
                    headerTransparent: true
                }}
            >
                <Stack.Screen
                    name="DocumentsCenter"
                    component={DocumentsCenter}
                    initialParams={{}}
                    options={{
                        headerShown: false
                    }}
                />
                <Stack.Screen
                    name="DocumentsViewer"
                    component={DocumentsViewer}
                    initialParams={{}}
                    options={{
                        headerShown: false
                    }}
                />
            </Stack.Navigator>
        </View>
    );
}
