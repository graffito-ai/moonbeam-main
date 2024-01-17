import {TouchableOpacity, View} from "react-native";
import React, {useEffect} from "react";
import {Surface, Text, TouchableRipple} from "react-native-paper";
import {styles} from "../../../../styles/registration.module";
import {Image} from "expo-image";
// @ts-ignore
import MoonbeamServiceMemberImage from '../../../../../assets/art/moonbeam-service-member.png';
// @ts-ignore
import MoonbeamMilitarySpouseImage from '../../../../../assets/art/moonbeam-military-spouse.png';
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';

/**
 * MilitaryAffiliationStep component.
 *
 * @constructor constructor for the component.
 */
export const MilitaryAffiliationStep = () => {
    // constants used to keep track of local component state

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

    // return the component for the MilitaryAffiliationStep, part of the Registration page
    return (
        <>
            <View style={styles.militaryAffiliationView}>
                <TouchableRipple
                    style={styles.topMilitaryAffiliationTile}
                    onPress={() => {
                        // set the military affiliation for the user
                    }}
                    rippleColor="rgba(0, 0, 0, .32)"
                >
                    <Surface
                        style={styles.militaryAffiliationTileView}
                        mode={'elevated'}
                        elevation={5}>
                        <View style={styles.militaryAffiliationTopView}>
                            <Image
                                style={styles.militaryAffiliationImage}
                                source={MoonbeamServiceMemberImage}
                                contentFit={'contain'}
                                cachePolicy={'memory-disk'}
                            />
                        </View>
                        <Text style={styles.militaryAffiliationDescription}>
                            You are either Active Duty, National Guard, Reserves or a Veteran.
                        </Text>
                        <TouchableOpacity
                            style={styles.militaryAffiliationButton}
                            // we handle any pressed in the touchable ripple above
                            disabled={true}
                        >
                            <Text style={styles.militaryAffiliationButtonText}>Select</Text>
                        </TouchableOpacity>
                    </Surface>
                </TouchableRipple>
                <TouchableRipple
                    style={styles.militaryAffiliationTile}
                    onPress={() => {
                        // set the military affiliation for the user
                    }}
                    rippleColor="rgba(0, 0, 0, .32)"
                >
                    <Surface
                        style={styles.militaryAffiliationTileView}
                        mode={'elevated'}
                        elevation={5}>
                        <View style={styles.militaryAffiliationTopView}>
                            <Image
                                style={[styles.militaryAffiliationImage, {
                                    top: hp(0.5),
                                }]}
                                source={MoonbeamMilitarySpouseImage}
                                contentFit={'contain'}
                                cachePolicy={'memory-disk'}
                            />
                        </View>
                        <Text style={[styles.militaryAffiliationDescription, {top: hp(6.5)}]}>
                            You are a military spouse of either a Service Member or a Veteran.
                        </Text>
                        <TouchableOpacity
                            style={styles.militaryAffiliationButton}
                            // we handle any pressed in the touchable ripple above
                            disabled={true}
                        >
                            <Text style={styles.militaryAffiliationButtonText}>Select</Text>
                        </TouchableOpacity>
                    </Surface>
                </TouchableRipple>
            </View>
        </>
    );
}
