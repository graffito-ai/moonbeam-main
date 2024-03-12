import {LinearGradient} from 'expo-linear-gradient';
import React, {useEffect, useState} from 'react';
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
import {Text} from "react-native-paper";
import {TouchableOpacity, View} from 'react-native';

/**
 * ServiceOfferings component.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const ServiceOfferings = ({}: ServiceOfferingsProps) => {
    // constants used to keep track of local component state
    const [activeSection, setActiveSection] = useState<'organizations' | 'events' | 'all'>('all');

    // constants used to keep track of shared states

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
    }, []);

    // return the component for the ServiceOfferings page
    return (
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
                                activeSection === "organizations" && setActiveSection("all");
                            }}
                            style={activeSection === "organizations" ? styles.activeTileLeft : styles.inactiveTileLeft}>
                            <ExpoImage
                                style={styles.inactiveTileImageLeft}
                                source={MoonbeamOrganizations}
                                contentFit={'contain'}
                                cachePolicy={'memory-disk'}
                            />
                            <Text style={activeSection === "organizations" ? styles.activeTileTextLeft : styles.inactiveTileTextLeft}>
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
                                source={MoonbeamEvents}
                                contentFit={'contain'}
                                cachePolicy={'memory-disk'}
                            />
                            <Text style={activeSection === "events" ? styles.activeTileTextRight : styles.inactiveTileTextRight}>
                                Calendar
                            </Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </View>
        </SafeAreaProvider>
    );
};
