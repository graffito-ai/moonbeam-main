import React, {useEffect, useState} from 'react';
import {ServicesProps} from "../../../../../models/props/HomeProps";
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from "react-native-safe-area-context";
import {ServicesStackParamList} from "../../../../../models/props/ServicesProps";
import {useRecoilState} from "recoil";
import {appDrawerHeaderShownState, customBannerShown, drawerSwipeState} from "../../../../../recoil/AppDrawerAtom";
import {ServiceOfferings} from "./ServiceOfferings";
import {retrieveEventSeries, retrieveServicePartners} from "../../../../../utils/AppSync";
import {eventSeriesDataState, servicePartnersDataState} from "../../../../../recoil/ServicesAtom";
import {Spinner} from "../../../../common/Spinner";
import {ServicePartner} from "./partnerComponents/ServicePartner";
import {EventSeries} from "./eventSeriesComponents/EventSeries";

/**
 * Services component.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const Services = ({navigation}: ServicesProps) => {
    // constants used to keep track of local component state
    const [isReady, setIsReady] = useState<boolean>(true);
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
    const [serviceDataLoaded, setIsServiceDataLoaded] = useState<boolean>(false);
    // constants used to keep track of shared states
    const [appDrawerHeaderShown, setAppDrawerHeaderShown] = useRecoilState(appDrawerHeaderShownState);
    const [drawerSwipeEnabled, setDrawerSwipeEnabled] = useRecoilState(drawerSwipeState);
    const [bannerShown, setBannerShown] = useRecoilState(customBannerShown);
    const [, setServicePartnerData] = useRecoilState(servicePartnersDataState);
    const [, setEventSeriesData] = useRecoilState(eventSeriesDataState)

    // create a native stack navigator, to be used for our Services navigation
    const Stack = createNativeStackNavigator<ServicesStackParamList>();

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // load the service data, if needed
        if (!serviceDataLoaded) {
            setIsServiceDataLoaded(true);
            retrieveServicesData().then(() => {
                // release the loaded accordingly
                setIsReady(true);
            });
        }
        // set the app drawer status accordingly, custom banner visibility and drawer swipe actions accordingly
        if (navigation.getState().index === 4) {
            appDrawerHeaderShown && setAppDrawerHeaderShown(false);
            bannerShown && setBannerShown(false);
            drawerSwipeEnabled && setDrawerSwipeEnabled(false);
        }
    }, [serviceDataLoaded, navigation.getState()]);

    /**
     * Function used to retrieve the services and events data accordingly.
     *
     * @returns a {@link Promise} of {@link void} since we do not need to return
     * anything, given that this function will set the React state accordingly.
     */
    const retrieveServicesData = async (): Promise<void> => {
        // first set the loader to appear accordingly
        setIsReady(false);

        // execute the two calls for retrieving Service Partners and Event Series in parallel.
        const serviceDataResults = await Promise.all([
            retrieveServicePartners(),
            retrieveEventSeries()
        ]);

        // set the data obtained from the parallelized result calls accordingly
        setServicePartnerData(serviceDataResults[0]);
        setEventSeriesData(serviceDataResults[1]);
    }

    // return the component for the Services page
    return (
        <>
            {
                !isReady ?
                    <Spinner loadingSpinnerShown={loadingSpinnerShown} setLoadingSpinnerShown={setLoadingSpinnerShown}/>
                    :
                    <SafeAreaProvider style={{flex: 1, backgroundColor: '#313030'}}>
                        <Stack.Navigator
                            initialRouteName={"ServiceOfferings"}
                            screenOptions={{
                                headerShown: false,
                                gestureEnabled: false
                            }}
                        >
                            <Stack.Screen
                                name="ServiceOfferings"
                                component={ServiceOfferings}
                                initialParams={{}}
                            />
                            <Stack.Screen
                                name="ServicePartner"
                                component={ServicePartner}
                                initialParams={{}}
                            />
                            <Stack.Screen
                                name="EventSeries"
                                component={EventSeries}
                                initialParams={{}}
                            />
                        </Stack.Navigator>
                    </SafeAreaProvider>
            }
        </>
    );
};
