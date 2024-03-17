import React, {useEffect} from 'react';
import {SafeAreaProvider} from "react-native-safe-area-context";
import {EventSeriesProps} from "../../../../../../models/props/ServicesProps";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {IconButton} from "react-native-paper";
import {useRecoilState} from "recoil";
import {bottomTabShownState} from "../../../../../../recoil/HomeAtom";
import {calendarEventState} from "../../../../../../recoil/ServicesAtom";
import {EventSeriesStackParamList} from "../../../../../../models/props/EventSeriesProps";
import {EventSeriesDetails} from "./EventSeriesDetails";
import {EventSeriesWebView} from "./EventSeriesWebView";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";

/**
 * EventSeries component.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const EventSeries = ({navigation}: EventSeriesProps) => {
    // constants used to keep track of local component state

    // constants used to keep track of shared states
    const [, setCalendarEvent] = useRecoilState(calendarEventState);
    const [bottomTabShown, setBottomTabShown] = useRecoilState(bottomTabShownState);

    // create a native stack navigator, to be used for our EventSeries navigation
    const Stack = createNativeStackNavigator<EventSeriesStackParamList>();

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

    // return the component for the EventSeries page
    return (
        <SafeAreaProvider style={{flex: 1, backgroundColor: '#313030'}}>
            <Stack.Navigator
                initialRouteName={"EventSeriesDetails"}
                screenOptions={{
                    gestureEnabled: false,
                    headerTitle: '',
                    headerShown: true,
                    headerTransparent: true
                }}
            >
                <Stack.Screen
                    name="EventSeriesDetails"
                    component={EventSeriesDetails}
                    initialParams={{}}
                    options={{
                        headerLeft: () =>
                            <IconButton
                                rippleColor={'transparent'}
                                icon="close"
                                iconColor={"#F2FF5D"}
                                size={hp(4)}
                                style={{
                                    right: wp(4)
                                }}
                                onPress={() => {
                                    // show the bottom bar
                                    setBottomTabShown(true);
                                    // reset the calendar event clicked state
                                    setCalendarEvent(null);
                                    // go back to the previous screen which led us here
                                    navigation.goBack();
                                }}
                            />
                    }}
                />
                <Stack.Screen
                    name="EventSeriesWebView"
                    component={EventSeriesWebView}
                    options={{
                        headerShown: false
                    }}
                />
            </Stack.Navigator>
        </SafeAreaProvider>
    );
};
