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
import {Card, Paragraph, Text} from "react-native-paper";
import {Platform, ScrollView, TouchableOpacity, View} from 'react-native';
import {useRecoilState, useRecoilValue} from "recoil";
import {
    calendarEventState, eventToRegisterState, numberOfEventGroupsState,
    servicePartnerState,
    sortedServicePartnersDataState,
    sortedUpcomingEventsDataState
} from "../../../../../recoil/ServicesAtom";
import {DataProvider, LayoutProvider, RecyclerListView} from "recyclerlistview";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {Event, Partner} from "@moonbeam/moonbeam-models";
// @ts-ignore
import MoonbeamNoServicePartners from '../../../../../../assets/art/moonbeam-no-service-partners.png';
// @ts-ignore
import MoonbeamNoEvents from '../../../../../../assets/art/moonbeam-no-events.png';
// @ts-ignore
import MoonbeamPlaceholderImage from "../../../../../../assets/art/moonbeam-store-placeholder.png";
import {Icon} from "@rneui/base";

/**
 * ServiceOfferings component.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const ServiceOfferings = ({navigation}: ServiceOfferingsProps) => {
    // constants used to keep track of local component state
    const servicePartnerListView = useRef();
    const upcomingEventsListView = useRef();
    const calendarEventsListView = useRef();
    const [activeSection, setActiveSection] = useState<'organizations' | 'events' | 'all'>('all');
    const [servicePartnersDataProvider, setServicePartnersDataProvider] = useState<DataProvider | null>(null);
    const [servicePartnersLayoutProvider, setServicePartnersLayoutProvider] = useState<LayoutProvider | null>(null);
    const [upcomingEventsDataProvider, setUpcomingEventsDataProvider] = useState<DataProvider | null>(null);
    const [upcomingEventsLayoutProvider, setUpcomingEventsLayoutProvider] = useState<LayoutProvider | null>(null);
    const [calendarEventsDataProvider, setCalendarEventsDataProvider] = useState<DataProvider | null>(null);
    const [calendarEventsLayoutProvider, setCalendarEventsLayoutProvider] = useState<LayoutProvider | null>(null);
    // constants used to keep track of shared states
    const sortedUpcomingEvents = useRecoilValue(sortedUpcomingEventsDataState);
    const numberOfEventGroups = useRecoilValue(numberOfEventGroupsState);
    const sortedServicePartners = useRecoilValue(sortedServicePartnersDataState);
    const [, setServicePartner] = useRecoilState(servicePartnerState);
    const [, setCalendarEvent] = useRecoilState(calendarEventState);
    const [, setEventToRegister] = useRecoilState(eventToRegisterState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // populate the service partners and event series data provider and list view
        if (servicePartnersDataProvider === null && servicePartnersLayoutProvider === null &&
            upcomingEventsDataProvider === null && upcomingEventsLayoutProvider === null && calendarEventsDataProvider === null && calendarEventsLayoutProvider === null &&
            sortedServicePartners !== undefined && sortedServicePartners !== null && sortedUpcomingEvents !== null) {
            // upcoming events data
            setUpcomingEventsDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(
                // only display up to 6 events in this section, the rest go in the calendar
                sortedUpcomingEvents.length > 6
                    ? sortedUpcomingEvents.slice(0, 5)
                    : sortedUpcomingEvents
            ));
            setUpcomingEventsLayoutProvider(new LayoutProvider(
                _ => 0,
                (_, dim) => {
                    dim.width = wp(40);
                    dim.height = hp(30);
                }
            ));
            setCalendarEventsDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(sortedUpcomingEvents));
            setCalendarEventsLayoutProvider(new LayoutProvider(
                _ => 0,
                (_, dim) => {
                    dim.width = wp(100);
                    dim.height = hp(30);
                }
            ));
            // service partners data
            setServicePartnersDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(sortedServicePartners));
            setServicePartnersLayoutProvider(new LayoutProvider(
                _ => 0,
                (_, dim) => {
                    dim.width = wp(100);
                    dim.height = hp(30);
                }
            ));
        }
    }, [sortedServicePartners, sortedUpcomingEvents,
        servicePartnersDataProvider, servicePartnersLayoutProvider,
        upcomingEventsDataProvider, upcomingEventsLayoutProvider,
        calendarEventsDataProvider, calendarEventsLayoutProvider
    ]);

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
    const renderServicePartnerData = useMemo(() => (_type: string | number, data: Partner): React.JSX.Element | React.JSX.Element[] => {
        // return the service partner data or an appropriate message instead
        if (sortedServicePartners !== undefined && sortedServicePartners !== null && sortedServicePartners.length !== 0) {
            return (
                <View style={styles.servicePartnerCardItemView}>
                    <View style={{flexDirection: 'column'}}>
                        <View style={{flexDirection: 'row'}}>
                            <Text style={styles.servicePartnerCardTitle}>
                                {data.name}
                            </Text>
                            <ExpoImage
                                style={styles.servicePartnerCardImage}
                                source={{uri: data.logoUrl}}
                                placeholder={MoonbeamPlaceholderImage}
                                placeholderContentFit={'contain'}
                                contentFit={'contain'}
                                transition={1000}
                                cachePolicy={'memory-disk'}
                            />
                        </View>
                        <View style={{flexDirection: 'row'}}>
                            <Paragraph
                                numberOfLines={5}
                                style={styles.servicePartnerCardParagraph}
                            >
                                {data.shortDescription}
                            </Paragraph>
                            <TouchableOpacity
                                style={styles.viewServicePartnerButton}
                                onPress={() => {
                                    // set the clicked partner accordingly
                                    setServicePartner(data);
                                    // navigate to the appropriate Service Partner/Offering screen
                                    navigation.navigate('ServicePartner', {});
                                }}
                            >
                                <Text style={styles.viewServicePartnerButtonContent}>
                                    {'Organization'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            );
        } else {
            return (
                <></>
            );
        }
    }, [sortedServicePartners]);

    /**
     * Function used to populate the rows containing Events data for the Calendar.
     *
     * @param type row type to be passed in
     * @param data data to be passed in for the row
     * @param index number specifying the index of the data element to be rendered
     *
     * @return a {@link React.JSX.Element} or an {@link Array} of {@link React.JSX.Element} representing the
     * React node and/or nodes containing Events data for the Calendar.
     */
    const renderCalendarData = useMemo(() => (_type: string | number, data: (Event & { eventGroup: boolean }), index: number): React.JSX.Element | React.JSX.Element[] => {
        // return the Events data for the Calendar or an appropriate message instead
        if (sortedUpcomingEvents !== undefined && sortedUpcomingEvents !== null && sortedUpcomingEvents.length !== 0) {
            return (
                <View style={{flexDirection: 'column'}}>
                    {
                        data.eventGroup ?
                            <Text
                                style={[styles.calendarEventsGroupingTitle, index !== 0 && {marginTop: -hp(5)}]}>
                                {new Date(data.startTime.startsAtUTC).toLocaleDateString([], {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric"
                                })}
                            </Text> :
                            <Text style={{marginTop: -hp(7)}}>{""}</Text>
                    }
                    <TouchableOpacity
                        style={styles.calendarEventCardItemView}
                        onPress={() => {
                            // set the clicked event accordingly
                            setCalendarEvent(data);
                            // set the event to register accordingly
                            setEventToRegister({
                                description: data.description,
                                endTime: data.endTime,
                                eventLogoUrlBg: data.eventLogoUrlBg,
                                eventLogoUrlSm: data.eventLogoUrlSm,
                                externalEventID: data.externalEventID,
                                id: data.id,
                                registrationUrl: data.registrationUrl,
                                startTime: data.startTime,
                                title: data.title
                            });
                            // navigate to the appropriate Event/Event Series screen
                            navigation.navigate('EventSeries', {});
                        }}
                    >
                        <View style={[styles.calendarEventContentView]}>
                            <View style={styles.calendarEventImageBackground}>
                                <ExpoImage
                                    style={styles.calendarEventImage}
                                    source={{uri: data.eventLogoUrlSm}}
                                    placeholder={MoonbeamPlaceholderImage}
                                    placeholderContentFit={'contain'}
                                    contentFit={'cover'}
                                    transition={1000}
                                    cachePolicy={'memory-disk'}
                                />
                            </View>
                            <View style={styles.calendarEventInformationView}>
                                <Text
                                    numberOfLines={1}
                                    style={styles.calendarEventsInformationTitle}>
                                    {new Date(data.startTime.startsAtUTC).toLocaleDateString([], {
                                        weekday: "short",
                                        month: "short",
                                        day: "numeric"
                                    })}
                                </Text>
                                <Text
                                    numberOfLines={1}
                                    style={styles.calendarEventsInformationSubTitle}>
                                    {new Date(data.startTime.startsAtUTC).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hourCycle: 'h12'
                                    })}
                                </Text>
                                <Text
                                    numberOfLines={2}
                                    style={styles.calendarEventsInformationEventName}>
                                    {data.title}
                                </Text>
                            </View>
                            <Icon name="chevron-right"
                                  type={'material-community'}
                                  style={styles.calendarEventsRightIcon}
                                  size={hp(4)}
                                  color={'#F2FF5D'}/>
                        </View>
                    </TouchableOpacity>
                </View>
            );
        } else {
            return (
                <></>
            );
        }
    }, [sortedUpcomingEvents]);

    /**
     * Function used to populate the rows containing the upcoming Event-related data.
     *
     * @param type row type to be passed in
     * @param data data to be passed in for the row
     * @param index number specifying the index of the data element to be rendered
     *
     * @return a {@link React.JSX.Element} or an {@link Array} of {@link React.JSX.Element} representing the
     * React node and/or nodes containing upcoming Event-related data.
     */
    const renderUpcomingEventsData = useMemo(() => (_type: string | number, data: (Event & { eventGroup: boolean }), index: number): React.JSX.Element | React.JSX.Element[] => {
        // return the upcoming Event data or an appropriate message instead
        if (sortedUpcomingEvents !== undefined && sortedUpcomingEvents !== null && sortedUpcomingEvents.length !== 0) {
            return (
                <TouchableOpacity style={{left: '3%'}}
                                  onPress={() => {
                                      // set the clicked event accordingly
                                      setCalendarEvent(data);
                                      // set the event to register accordingly
                                      setEventToRegister({
                                          description: data.description,
                                          endTime: data.endTime,
                                          eventLogoUrlBg: data.eventLogoUrlBg,
                                          eventLogoUrlSm: data.eventLogoUrlSm,
                                          externalEventID: data.externalEventID,
                                          id: data.id,
                                          registrationUrl: data.registrationUrl,
                                          startTime: data.startTime,
                                          title: data.title
                                      });
                                      // navigate to the appropriate Event/Event Series screen
                                      navigation.navigate('EventSeries', {});
                                  }}>
                    <Card style={styles.upcomingEventCard}>
                        <Card.Content>
                            <View style={{flexDirection: 'column'}}>
                                <View style={styles.upcomingEventCardCoverBackground}>
                                    <ExpoImage
                                        style={styles.upcomingEventCardCover}
                                        source={{
                                            uri: data.eventLogoUrlSm
                                        }}
                                        placeholder={MoonbeamPlaceholderImage}
                                        placeholderContentFit={'contain'}
                                        contentFit={'cover'}
                                        transition={1000}
                                        cachePolicy={'memory-disk'}
                                    />
                                </View>
                                <Paragraph
                                    numberOfLines={1}
                                    style={styles.upcomingEventCardTitle}>{data.title}
                                </Paragraph>
                                <Paragraph
                                    numberOfLines={2}
                                    style={styles.upcomingEventCardSubtitle}>
                                    {new Date(data.startTime.startsAtUTC).toLocaleDateString([], {
                                        weekday: "short",
                                        month: "short",
                                        day: "numeric"
                                    })}
                                    <Text style={styles.upcomingEventCardSubtitle}>
                                        {`\n${new Date(data.startTime.startsAtUTC).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hourCycle: 'h12'
                                        })}`}
                                    </Text>
                                </Paragraph>
                                <Paragraph
                                    numberOfLines={1}
                                    style={styles.upcomingEventCardSubtitle}>
                                    {""}
                                </Paragraph>
                            </View>
                        </Card.Content>
                    </Card>
                    <View
                        style={{width: index === sortedUpcomingEvents.length - 1 ? wp(10) : wp(5)}}/>
                </TouchableOpacity>
            );
        } else {
            return (
                <></>
            );
        }
    }, [sortedUpcomingEvents]);

    // return the component for the ServiceOfferings page
    return (
        <>
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
                                    Organizations and Events for the Military Community!
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
                                    activeSection === "organizations" && setActiveSection("all");
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
                                    activeSection === "events" && setActiveSection("all");
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
                    calendarEventsLayoutProvider !== null && calendarEventsDataProvider !== null && activeSection === "events" && sortedUpcomingEvents.length > 0 &&
                    <>
                        <RecyclerListView
                            // @ts-ignore
                            ref={calendarEventsListView}
                            style={{
                                paddingTop: hp(2),
                                flex: 1,
                                height: sortedUpcomingEvents.length * hp(20) + numberOfEventGroups / 2 * hp(2)
                            }}
                            layoutProvider={calendarEventsLayoutProvider!}
                            dataProvider={calendarEventsDataProvider!}
                            rowRenderer={renderCalendarData}
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
                    </>
                }
                {
                    calendarEventsLayoutProvider !== null && calendarEventsDataProvider !== null && activeSection === "events" && sortedUpcomingEvents.length === 0 &&
                    <View
                        style={styles.noServicePartnersView}>
                        <ExpoImage
                            style={styles.noEventSeriesImage}
                            source={MoonbeamNoEvents}
                            contentFit={'contain'}
                            transition={1000}
                            cachePolicy={'memory-disk'}
                        />
                        <Text style={styles.noServicePartnersText}>
                            {
                                "No Events on the Calendar"
                            }
                        </Text>
                    </View>
                }
                {
                    servicePartnersLayoutProvider !== null && servicePartnersDataProvider !== null && activeSection === "organizations" && sortedServicePartners.length === 0 &&
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
                    servicePartnersLayoutProvider !== null && servicePartnersDataProvider !== null && activeSection === "organizations" && sortedServicePartners.length > 0 &&
                    <>
                        <View
                            style={{top: hp(2)}}>
                            <View style={{flexDirection: 'column'}}>
                                <Text style={styles.sectionTextBottom}>Veteran Non-Profit Organizations</Text>
                            </View>
                            <RecyclerListView
                                // @ts-ignore
                                ref={servicePartnerListView}
                                style={{
                                    width: wp(100),
                                    height: hp(33),
                                    bottom: hp(4),
                                    paddingLeft: wp(3)
                                }}
                                layoutProvider={servicePartnersLayoutProvider!}
                                dataProvider={servicePartnersDataProvider!}
                                rowRenderer={renderServicePartnerData}
                                isHorizontal={true}
                                forceNonDeterministicRendering={true}
                                {
                                    ...(Platform.OS === 'ios') ?
                                        {onEndReachedThreshold: 0} :
                                        {onEndReachedThreshold: 1}
                                }
                                scrollViewProps={{
                                    pagingEnabled: "true",
                                    decelerationRate: "fast",
                                    snapToInterval: Platform.OS === 'android' ? wp(33) * 3 : wp(33),
                                    snapToAlignment: "center",
                                    persistentScrollbar: false,
                                    showsHorizontalScrollIndicator: false
                                }}
                            />
                        </View>
                    </>
                }
                {
                    servicePartnersLayoutProvider !== null && servicePartnersDataProvider !== null &&
                    upcomingEventsLayoutProvider !== null && upcomingEventsDataProvider !== null &&
                    activeSection === "all" &&
                    <ScrollView
                        style={{
                            flex: 1
                        }}
                        horizontal={false}
                        showsVerticalScrollIndicator={false}
                    >
                        <>
                            {
                                sortedUpcomingEvents.length === 0
                                    ?
                                    <>
                                        <View style={{top: hp(2)}}>
                                            <View style={{flexDirection: 'column'}}>
                                                <Text style={styles.sectionTextTop}>Upcoming Events</Text>
                                            </View>
                                            <View
                                                style={styles.noElementsAllView}>
                                                <ExpoImage
                                                    style={styles.noElementsEventSeriesImage}
                                                    source={MoonbeamNoEvents}
                                                    contentFit={'contain'}
                                                    transition={1000}
                                                    cachePolicy={'memory-disk'}
                                                />
                                                <Text style={styles.noElementsText}>
                                                    {
                                                        "No Upcoming Events"
                                                    }
                                                </Text>
                                            </View>
                                        </View>
                                    </>
                                    :
                                    <>
                                        <View style={{top: hp(2)}}>
                                            <View style={{flexDirection: 'row', width: wp(100)}}>
                                                <Text style={styles.sectionTextTop}>Upcoming Events</Text>
                                                <TouchableOpacity onPress={() => {
                                                    // set the Calendar section as the one being active
                                                    setActiveSection("events");
                                                }}>
                                                    <Text style={styles.seeAllUpcomingEventsButton}>
                                                        See All
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                            <RecyclerListView
                                                // @ts-ignore
                                                ref={upcomingEventsListView}
                                                style={{
                                                    height: hp(25),
                                                    width: wp(100),
                                                    bottom: hp(4)
                                                }}
                                                layoutProvider={upcomingEventsLayoutProvider!}
                                                dataProvider={upcomingEventsDataProvider!}
                                                rowRenderer={renderUpcomingEventsData}
                                                isHorizontal={true}
                                                forceNonDeterministicRendering={true}
                                                {
                                                    ...(Platform.OS === 'ios') ?
                                                        {onEndReachedThreshold: 0} :
                                                        {onEndReachedThreshold: 1}
                                                }
                                                scrollViewProps={{
                                                    pagingEnabled: "true",
                                                    decelerationRate: "fast",
                                                    snapToInterval: Platform.OS === 'android' ? wp(33) * 3 : wp(33),
                                                    snapToAlignment: "center",
                                                    persistentScrollbar: false,
                                                    showsHorizontalScrollIndicator: false
                                                }}
                                            />
                                        </View>
                                    </>
                            }
                            {
                                sortedServicePartners.length === 0
                                    ?
                                    <>
                                        <View
                                            style={sortedUpcomingEvents.length > 0 ? {bottom: hp(3)} : {top: hp(2)}}>
                                            <View style={{flexDirection: 'column'}}>
                                                <Text style={styles.sectionTextBottom}>Veteran Non-Profit Organizations</Text>
                                            </View>
                                            <View
                                                style={styles.noElementsAllView}>
                                                <ExpoImage
                                                    style={styles.noElementsEventSeriesImage}
                                                    source={MoonbeamNoServicePartners}
                                                    contentFit={'contain'}
                                                    transition={1000}
                                                    cachePolicy={'memory-disk'}
                                                />
                                                <Text style={styles.noElementsText}>
                                                    {
                                                        "No Partners Available"
                                                    }
                                                </Text>
                                            </View>
                                        </View>
                                    </>
                                    :
                                    <>
                                        <View
                                            style={sortedUpcomingEvents.length > 0 ? {bottom: hp(3)} : {top: hp(2)}}>
                                            <View style={{flexDirection: 'column'}}>
                                                <Text style={styles.sectionTextBottom}>Veteran Non-Profit Organizations</Text>
                                            </View>
                                            <RecyclerListView
                                                // @ts-ignore
                                                ref={servicePartnerListView}
                                                style={{
                                                    width: wp(100),
                                                    height: hp(40),
                                                    bottom: hp(4),
                                                    paddingLeft: wp(3)
                                                }}
                                                layoutProvider={servicePartnersLayoutProvider!}
                                                dataProvider={servicePartnersDataProvider!}
                                                rowRenderer={renderServicePartnerData}
                                                isHorizontal={true}
                                                forceNonDeterministicRendering={true}
                                                {
                                                    ...(Platform.OS === 'ios') ?
                                                        {onEndReachedThreshold: 0} :
                                                        {onEndReachedThreshold: 1}
                                                }
                                                scrollViewProps={{
                                                    pagingEnabled: "true",
                                                    decelerationRate: "fast",
                                                    snapToInterval: Platform.OS === 'android' ? wp(33) * 3 : wp(33),
                                                    snapToAlignment: "center",
                                                    persistentScrollbar: false,
                                                    showsHorizontalScrollIndicator: false
                                                }}
                                            />
                                        </View>
                                    </>
                            }
                        </>
                    </ScrollView>
                }
            </SafeAreaProvider>
        </>
    );
};
