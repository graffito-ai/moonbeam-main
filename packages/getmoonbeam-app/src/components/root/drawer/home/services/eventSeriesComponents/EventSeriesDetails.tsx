import React, {useEffect, useState} from 'react';
import {SafeAreaProvider} from "react-native-safe-area-context";
import {EventSeriesDetailsProps} from "../../../../../../models/props/EventSeriesProps";
import {useRecoilState, useRecoilValue} from "recoil";
import {calendarEventState, sortedEventSeriesDataState} from "../../../../../../recoil/ServicesAtom";
import {styles} from "../../../../../../styles/eventSeriesDetails.module";
// @ts-ignore
import MoonbeamPlaceholderImage from "../../../../../../../assets/art/moonbeam-store-placeholder.png";
// @ts-ignore
import MoonbeamCalendarCircleImage from "../../../../../../../assets/art/moonbeam-calendar-circle.png";
// @ts-ignore
import MoonbeamLocationCircleImage from "../../../../../../../assets/art/moonbeam-location-circle.png";
import {Image, ImageBackground} from "expo-image";
import {Text, TouchableOpacity, View} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import { EventSeries } from '@moonbeam/moonbeam-models';
import {Divider} from "@rneui/base";

/**
 * EventSeriesDetails component.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const EventSeriesDetails = ({}: EventSeriesDetailsProps) => {
    // constants used to keep track of local component state
    const [eventSeriesMatched, setEventSeriesMatched] = useState<boolean>(false);
    const [eventSeries, setEventSeries] = useState<EventSeries | null>(null);
    // constants used to keep track of shared states
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
        if (!eventSeriesMatched) {
            setEventSeriesMatched(true);
            sortedEventSeries.forEach(eventSeries => {
                eventSeries !== null && eventSeries.events !== null && eventSeries.events.length !== 0 && eventSeries!.events!.forEach(event => {
                    if (event !== null && event.id === calendarEvent!.id!) {
                        setEventSeries(eventSeries);

                    }
                });
            });
        }
    }, [eventSeriesMatched]);

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
                        <View style={{
                            top: hp(10),
                            height: hp(20),
                            width: wp(100)
                        }}>
                            <Text
                                numberOfLines={1}
                                style={styles.calendarEventSectionTitle}>
                                Event Occurrences
                            </Text>

                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.eventRegistrationButton}
                        onPress={async () => {

                        }}
                    >
                        <Text style={styles.eventRegistrationButtonContent}>Register</Text>
                    </TouchableOpacity>
                </>
            }
        </SafeAreaProvider>
    );
};
