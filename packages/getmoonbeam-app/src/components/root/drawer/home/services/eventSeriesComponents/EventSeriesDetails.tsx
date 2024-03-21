import React, {useEffect, useMemo, useRef, useState} from 'react';
import {SafeAreaProvider} from "react-native-safe-area-context";
import {EventSeriesDetailsProps} from "../../../../../../models/props/EventSeriesProps";
import {useRecoilState, useRecoilValue} from "recoil";
import {
    calendarEventState,
    eventToRegisterState,
    sortedEventSeriesDataState
} from "../../../../../../recoil/ServicesAtom";
import {styles} from "../../../../../../styles/eventSeriesDetails.module";
// @ts-ignore
import MoonbeamPlaceholderImage from "../../../../../../../assets/art/moonbeam-store-placeholder.png";
// @ts-ignore
import MoonbeamCalendarCircleImage from "../../../../../../../assets/art/moonbeam-calendar-circle.png";
// @ts-ignore
import MoonbeamLocationCircleImage from "../../../../../../../assets/art/moonbeam-location-circle.png";
import {Image, ImageBackground} from "expo-image";
import {Platform, Text, TouchableOpacity, View} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {Event, EventSeries} from '@moonbeam/moonbeam-models';
import {Divider} from "@rneui/base";
import {DataProvider, LayoutProvider, RecyclerListView} from "recyclerlistview";
import {ActivityIndicator, Portal} from "react-native-paper";

/**
 * EventSeriesDetails component.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const EventSeriesDetails = ({navigation}: EventSeriesDetailsProps) => {
    // constants used to keep track of local component state
    const eventOccurrencesListView = useRef();
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(false);
    const [eventOccurrencesDataProvider, setEventOccurrencesDataProvider] = useState<DataProvider | null>(null);
    const [eventOccurrencesLayoutProvider, setEventOccurrencesLayoutProvider] = useState<LayoutProvider | null>(null);
    const [eventSeriesMatched, setEventSeriesMatched] = useState<boolean>(false);
    const [eventSeries, setEventSeries] = useState<EventSeries | null>(null);
    // constants used to keep track of shared states
    const [eventToRegister, setEventToRegister] = useRecoilState(eventToRegisterState);
    const [calendarEvent,] = useRecoilState(calendarEventState);
    const sortedEventSeries = useRecoilValue(sortedEventSeriesDataState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // attempt to find the event in the list of sorted event series
        if (!eventSeriesMatched && eventOccurrencesDataProvider === null && eventOccurrencesLayoutProvider === null) {
            setEventSeriesMatched(true);
            sortedEventSeries.forEach(eventSeries => {
                eventSeries !== null && eventSeries.events !== null && eventSeries.events.length !== 0 && eventSeries!.events!.forEach(event => {
                    if (event !== null && event.id === calendarEvent!.id!) {
                        setEventSeries(eventSeries);
                        // event series event occurrences data
                        if (eventSeries.events && eventSeries.events.length !== 0) {
                            setEventOccurrencesDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(eventSeries.events!));
                            setEventOccurrencesLayoutProvider(new LayoutProvider(
                                _ => 0,
                                (_, dim) => {
                                    dim.width = wp(7);
                                    dim.height = hp(7);
                                }
                            ));
                        }
                    }
                });
            });
        }
    }, [eventSeriesMatched, eventOccurrencesLayoutProvider, eventOccurrencesDataProvider]);

    /**
     * Function used to populate the rows containing the Event occurrences data.
     *
     * @param type row type to be passed in
     * @param data data to be passed in for the row
     *
     * @return a {@link React.JSX.Element} or an {@link Array} of {@link React.JSX.Element} representing the
     * React node and/or nodes containing Event occurrences data.
     */
    const renderEventOccurrencesData = useMemo(() => (_type: string | number, data: Event): React.JSX.Element | React.JSX.Element[] => {
        /**
         * return the upcoming Event occurrences data or an appropriate message instead.
         * Make sure to render only future events.
         *
         */
        if (eventSeries && eventSeries.events && eventSeries.events.length !== 0 && Date.parse(new Date().toISOString()) <= Date.parse(new Date(data.startTime.startsAtUTC).toISOString())) {
            return (
                <TouchableOpacity
                    style={eventToRegister !== null && eventToRegister.id === data.id ? styles.eventOccurrenceViewActive : styles.eventOccurrenceViewInactive}
                    onPress={() => {
                        // show the loader so the glitching effect disappears
                        setLoadingSpinnerShown(true);

                        // set the event to register to accordingly
                        setEventToRegister(data);
                        setEventOccurrencesDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(eventSeries.events!));
                        setEventOccurrencesLayoutProvider(new LayoutProvider(
                            _ => 0,
                            (_, dim) => {
                                dim.width = wp(7);
                                dim.height = hp(7);
                            }
                        ));

                        // after half a second, show the event occurrence list
                        setTimeout(() => {
                            setLoadingSpinnerShown(false);
                        }, 500);
                    }}
                >
                    <Text
                        numberOfLines={1}
                        style={styles.eventOccurrenceDay}>
                        {new Date(data.startTime.startsAtUTC).toLocaleDateString([], {
                            weekday: "long"
                        })}
                    </Text>
                    <Divider
                        style={styles.eventOccurrenceDivider}
                        width={hp(0.25)}
                        color={'#394fa6'}
                        orientation={'horizontal'}
                    />
                    <Text
                        numberOfLines={1}
                        style={styles.eventOccurrenceMonth}>
                        {new Date(data.startTime.startsAtUTC).toLocaleDateString([], {
                            month: "long"
                        })}
                    </Text>
                    <View
                        style={eventToRegister !== null && eventToRegister.id === data.id ? styles.eventOccurrenceDateViewActive : styles.eventOccurrenceDateViewInactive}>
                        <Text
                            numberOfLines={1}
                            style={eventToRegister !== null && eventToRegister.id === data.id ? styles.eventOccurrenceDateActive : styles.eventOccurrenceDateInactive}>
                            {new Date(data.startTime.startsAtUTC).toLocaleDateString([], {
                                day: "numeric"
                            })}
                        </Text>
                    </View>
                    <Text
                        numberOfLines={1}
                        style={styles.eventOccurrenceTime}>
                        {new Date(data.startTime.startsAtUTC).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            hourCycle: 'h12'
                        })}
                    </Text>
                </TouchableOpacity>
            );
        } else {
            return (
                <></>
            );
        }
    }, [eventToRegister, eventSeries, sortedEventSeries]);

    // return the component for the EventSeriesDetails page
    return (
        <SafeAreaProvider style={{flex: 1, backgroundColor: '#313030'}}>
            <ImageBackground
                style={styles.topSectionView}
                imageStyle={styles.topSectionBackground}
                source={{uri: calendarEvent!.eventLogoUrlBg!}}
                placeholder={MoonbeamPlaceholderImage}
                placeholderContentFit={'fill'}
                contentFit={'fill'}
                transition={1000}
                cachePolicy={'memory-disk'}
            />
            {
                eventSeries !== null &&
                <>
                    <View style={styles.calendarEventContentView}>
                        <Text
                            numberOfLines={2}
                            style={styles.eventTitle}>
                            {eventSeries.title}
                        </Text>
                        <View style={styles.calendarEventDetailsView}>
                            <View style={styles.calendarEventDetailContentView}>
                                <Image
                                    style={styles.calendarEventDetailImage}
                                    source={MoonbeamCalendarCircleImage}
                                    placeholderContentFit={'contain'}
                                    contentFit={'contain'}
                                    transition={1000}
                                    cachePolicy={'memory-disk'}
                                />
                                <Divider
                                    style={styles.calendarEventDivider}
                                    width={hp(0.075)}
                                    color={'#F2FF5D'}
                                    orientation={'vertical'}
                                />
                                <View style={styles.calendarEventDetailsText}>
                                    <Text
                                        numberOfLines={1}
                                        style={styles.calendarEventDetailTextTop}>
                                        {new Date(calendarEvent!.startTime.startsAtUTC).toLocaleDateString([], {
                                            weekday: "short",
                                            month: "short",
                                            day: "numeric"
                                        })}
                                    </Text>
                                    <Text
                                        numberOfLines={1}
                                        style={styles.calendarEventDetailTextBottom}>
                                        {new Date(calendarEvent!.startTime.startsAtUTC).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hourCycle: 'h12'
                                        })}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.calendarEventDetailContentView}>
                                <Image
                                    style={styles.calendarEventDetailImage}
                                    source={MoonbeamLocationCircleImage}
                                    placeholderContentFit={'contain'}
                                    contentFit={'contain'}
                                    transition={1000}
                                    cachePolicy={'memory-disk'}
                                />
                                <Divider
                                    style={styles.calendarEventDivider}
                                    width={hp(0.075)}
                                    color={'#F2FF5D'}
                                    orientation={'vertical'}
                                />
                                <View style={styles.calendarEventDetailsText}>
                                    <Text
                                        numberOfLines={1}
                                        style={styles.calendarEventDetailTextTop}>
                                        {`${eventSeries.name}`}
                                    </Text>
                                    <Text
                                        numberOfLines={1}
                                        style={styles.calendarEventDetailTextBottom}>
                                        {"Online"}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.calendarEventAboutSectionView}>
                            <Text
                                numberOfLines={1}
                                style={styles.calendarEventSectionTitle}>
                                About this Event
                            </Text>
                            <Text
                                numberOfLines={3}
                                style={styles.calendarEventSectionContent}>
                                {calendarEvent!.description!}
                            </Text>
                        </View>
                        <Text
                            numberOfLines={1}
                            style={[styles.calendarEventSectionTitle, {top: hp(11)}]}>
                            Event Occurrences
                        </Text>
                        <View style={styles.eventOccurrencesView}>
                            {
                                !loadingSpinnerShown &&
                                <RecyclerListView
                                    // @ts-ignore
                                    ref={eventOccurrencesListView}
                                    style={{top: hp(1), left: wp(1)}}
                                    layoutProvider={eventOccurrencesLayoutProvider!}
                                    dataProvider={eventOccurrencesDataProvider!}
                                    rowRenderer={renderEventOccurrencesData}
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
                                        snapToInterval: Platform.OS === 'android' ? wp(10) * 3 : wp(7.5),
                                        snapToAlignment: "center",
                                        persistentScrollbar: false,
                                        showsHorizontalScrollIndicator: false
                                    }}
                                />
                            }
                            {
                                loadingSpinnerShown &&
                                <Portal.Host>
                                    <View style={{
                                        top: hp(6),
                                        height: hp(6),
                                        width: wp(100),
                                        alignItems: 'center',
                                        alignContent: 'center'
                                    }}>
                                        <ActivityIndicator
                                            animating={loadingSpinnerShown} color={'#F2FF5D'}
                                            size={wp(10)}/>
                                    </View>
                                </Portal.Host>
                            }
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.eventRegistrationButton}
                        onPress={async () => {
                            // go to the Events Web View component
                            navigation.navigate("EventSeriesWebView", {});
                        }}
                    >
                        <Text style={styles.eventRegistrationButtonContent}>Register</Text>
                    </TouchableOpacity>
                </>
            }
        </SafeAreaProvider>
    );
};
