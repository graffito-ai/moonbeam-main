import {LinearGradient} from 'expo-linear-gradient';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {SafeAreaProvider} from "react-native-safe-area-context";
import {ServiceOfferingsProps} from "../../../../../models/props/ServicesProps";
import {styles} from "../../../../../styles/serviceOfferings.module";
import {Image as ExpoImage} from "expo-image/build/Image";
// @ts-ignore
import MoonbeamServices from "../../../../../../assets/art/moonbeam-services.png";
// @ts-ignore
import MoonbeamOrganizations from "../../../../../../assets/art/moonbeam-organizations.png";
// @ts-ignore
import MoonbeamEvents from "../../../../../../assets/art/moonbeam-events.png";
// @ts-ignore
import MoonbeamOrganizationsSelected from "../../../../../../assets/art/moonbeam-organizations-selected.png";
// @ts-ignore
import MoonbeamEventsSelected from "../../../../../../assets/art/moonbeam-events-selected.png";
import {Text} from "react-native-paper";
import {Platform, TouchableOpacity, View} from 'react-native';
import {Spinner} from "../../../../common/Spinner";
import {useRecoilState} from "recoil";
import {bottomTabShownState} from "../../../../../recoil/HomeAtom";
import {retrieveEventSeries, retrieveServicePartners} from "../../../../../utils/AppSync";
import {eventSeriesDataState, servicePartnersDataState} from "../../../../../recoil/ServicesAtom";
import {DataProvider, LayoutProvider, RecyclerListView} from "recyclerlistview";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {Partner} from "@moonbeam/moonbeam-models";
// @ts-ignore
import MoonbeamNoServicePartners from '../../../../../../assets/art/moonbeam-no-service-partners.png';
// @ts-ignore
import MoonbeamNoEvents from '../../../../../../assets/art/moonbeam-no-events.png';

/**
 * ServiceOfferings component.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const ServiceOfferings = ({}: ServiceOfferingsProps) => {
    // constants used to keep track of local component state
    const servicePartnerListView = useRef();
    const [serviceDataLoaded, setIsServiceDataLoaded] = useState<boolean>(false);
    const [isReady, setIsReady] = useState<boolean>(true);
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
    const [activeSection, setActiveSection] = useState<'organizations' | 'events'>('organizations');
    const [servicePartnersDataProvider, setServicePartnersDataProvider] = useState<DataProvider | null>(null);
    const [servicePartnersLayoutProvider, setServicePartnersLayoutProvider] = useState<LayoutProvider | null>(null);
    const [eventSeriesDataProvider, setEventSeriesDataProvider] = useState<DataProvider | null>(null);
    const [eventSeriesLayoutProvider, setEventSeriesLayoutProvider] = useState<LayoutProvider | null>(null);

    // constants used to keep track of shared states
    const [bottomTabShown, setBottomTabShown] = useRecoilState(bottomTabShownState);
    const [servicePartnerData, setServicePartnerData] = useRecoilState(servicePartnersDataState);
    const [eventSeriesData, setEventSeriesData] = useRecoilState(eventSeriesDataState)

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
            });
        }
        // make sure we hide the bottom bar if the screen is not ready to be loaded
        if (!isReady) {
            bottomTabShown && setBottomTabShown(false);
        }
        if (isReady) {
            !bottomTabShown && setBottomTabShown(true);
        }

        // populate the service partners and event series data provider and list view
        if (serviceDataLoaded && eventSeriesDataProvider === null && eventSeriesLayoutProvider === null &&
            servicePartnersDataProvider === null && servicePartnersLayoutProvider === null) {
            // event series data
            setEventSeriesDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(eventSeriesData));
            setEventSeriesLayoutProvider(new LayoutProvider(
                _ => 0,
                (_, dim) => {
                    dim.width = wp(100);
                    dim.height = hp(30);
                }
            ));
            // service partners data
            setServicePartnersDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(servicePartnerData));
            setServicePartnersLayoutProvider(new LayoutProvider(
                _ => 0,
                (_, dim) => {
                    dim.width = wp(100);
                    dim.height = hp(30);
                }
            ));
        }

    }, [isReady, bottomTabShown, serviceDataLoaded,
        servicePartnersDataProvider, servicePartnersLayoutProvider,
        eventSeriesDataProvider, eventSeriesLayoutProvider]);

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

        // release the loaded accordingly
        setIsReady(true);
    }

    /**
     * Function used to populate the rows containing Service Partners-related data.
     *
     * @param type row type to be passed in
     * @param data data to be passed in for the row
     * @param index number specifying the index of the data element to be rendered
     *
     * @return a {@link React.JSX.Element} or an {@link Array} of {@link React.JSX.Element} representing the
     * React node and/or nodes containing Service Partner data.
     */
    const renderServicePartnerData = useMemo(() => (_type: string | number, data: Partner, index: number): React.JSX.Element | React.JSX.Element[] => {
        // return the service partner data or an appropriate message instead
        if (servicePartnerData !== undefined && servicePartnerData !== null && servicePartnerData.length !== 0) {
            return (
                <View
                    style={styles.servicePartnerItemView}>

                </View>
            );
        } else {
            return (
                <View
                    style={styles.noServicePartnersView}>
                    <ExpoImage
                        style={styles.noServicePartnersImage}
                        source={MoonbeamNoServicePartners}
                        contentFit={'contain'}
                        transition={1000}
                        cachePolicy={'memory-disk'}
                    />
                    <Text style={styles.noServicePartnersText}>
                        {
                            "No Service Partners Available"
                        }
                    </Text>
                </View>
            );
        }
    }, [servicePartnerData]);

    // return the component for the ServiceOfferings page
    return (
        <>
            {!isReady ?
                <Spinner loadingSpinnerShown={loadingSpinnerShown} setLoadingSpinnerShown={setLoadingSpinnerShown}/>
                :
                <SafeAreaProvider style={{flex: 1, backgroundColor: '#313030'}}>
                    <View
                        style={styles.topSection}>
                        <LinearGradient
                            start={{x: 1, y: 0.1}}
                            end={{x: 1, y: 1}}
                            colors={['#5B5A5A', '#313030']}
                            style={styles.topSection}>
                            <View style={styles.topTitleSection}>
                                <Text style={styles.mainTitle}>
                                    {"Discover\n"}
                                    <Text style={styles.mainSubtitle}>
                                        Organizations and Events for military service members and family!
                                    </Text>
                                </Text>
                                <ExpoImage
                                    style={styles.servicesPhoto}
                                    source={MoonbeamServices}
                                    contentFit={'contain'}
                                    cachePolicy={'memory-disk'}
                                />
                            </View>
                            <View style={styles.topActiveTileSection}>
                                <TouchableOpacity
                                    onPress={() => {
                                        activeSection !== "organizations" && setActiveSection("organizations");
                                    }}
                                    style={activeSection === "organizations" ? styles.activeTileLeft : styles.inactiveTileLeft}>
                                    <ExpoImage
                                        style={styles.inactiveTileImageLeft}
                                        source={activeSection === "organizations" ? MoonbeamOrganizationsSelected : MoonbeamOrganizations}
                                        contentFit={'contain'}
                                        cachePolicy={'memory-disk'}
                                    />
                                    <Text
                                        style={activeSection === "organizations" ? styles.activeTileTextLeft : styles.inactiveTileTextLeft}>
                                        Organizations
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        activeSection !== "events" && setActiveSection("events");
                                    }}
                                    style={activeSection === "events" ? styles.activeTileRight : styles.inactiveTileRight}>
                                    <ExpoImage
                                        style={styles.inactiveTileImageRight}
                                        source={activeSection === "events" ? MoonbeamEventsSelected : MoonbeamEvents}
                                        contentFit={'contain'}
                                        cachePolicy={'memory-disk'}
                                    />
                                    <Text
                                        style={activeSection === "events" ? styles.activeTileTextRight : styles.inactiveTileTextRight}>
                                        Calendar
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>
                    </View>
                    {
                        activeSection === "organizations" && serviceDataLoaded && servicePartnerData.length === 0 &&
                        <View
                            style={styles.noServicePartnersView}>
                            <ExpoImage
                                style={styles.noServicePartnersImage}
                                source={MoonbeamNoServicePartners}
                                contentFit={'contain'}
                                transition={1000}
                                cachePolicy={'memory-disk'}
                            />
                            <Text style={styles.noServicePartnersText}>
                                {
                                    "No Service Partners Available"
                                }
                            </Text>
                        </View>
                    }
                    {
                        activeSection === "organizations" && serviceDataLoaded && servicePartnerData.length > 0 &&
                        <View style={{
                            flex: 1
                        }}>
                            <RecyclerListView
                                // @ts-ignore
                                ref={servicePartnerListView}
                                style={{flex: 1}}
                                layoutProvider={servicePartnersLayoutProvider!}
                                dataProvider={servicePartnersDataProvider!}
                                rowRenderer={renderServicePartnerData}
                                isHorizontal={false}
                                forceNonDeterministicRendering={true}
                                {
                                    ...(Platform.OS === 'ios') ?
                                        {onEndReachedThreshold: 0} :
                                        {onEndReachedThreshold: 1}
                                }
                                scrollViewProps={{
                                    pagingEnabled: "true",
                                    decelerationRate: "fast",
                                    snapToAlignment: "start",
                                    persistentScrollbar: false,
                                    showsVerticalScrollIndicator: false,
                                }}
                            />
                        </View>
                    }
                </SafeAreaProvider>
            }
        </>
    );
};
