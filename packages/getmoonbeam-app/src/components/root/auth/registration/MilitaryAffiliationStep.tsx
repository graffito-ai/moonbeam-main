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
import {useRecoilState} from "recoil";
import {currentMemberAffiliationState, registrationStepNumber} from "../../../../recoil/AuthAtom";
import {MilitaryAffiliation} from "@moonbeam/moonbeam-models";

/**
 * MilitaryAffiliationStep component.
 *
 * @constructor constructor for the component.
 */
export const MilitaryAffiliationStep = () => {
    // constants used to keep track of shared states
    const [, setStepNumber] = useRecoilState(registrationStepNumber);
    const [, setCurrentMemberAffiliation] = useRecoilState(currentMemberAffiliationState);

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
                    // we handle the click with the button below, so we avoid miss-clicking
                    disabled={true}
                    style={styles.topMilitaryAffiliationTile}
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
                            onPress={() => {
                                // set the military affiliation for the user
                                setCurrentMemberAffiliation(MilitaryAffiliation.ServiceMember);
                                // move on to the next step in the registration process
                                setStepNumber(0);
                            }}
                        >
                            <Text style={styles.militaryAffiliationButtonText}>Select</Text>
                        </TouchableOpacity>
                    </Surface>
                </TouchableRipple>
                <TouchableRipple
                    // we handle the click with the button below, so we avoid miss-clicking
                    disabled={true}
                    style={styles.militaryAffiliationTile}
                    rippleColor="rgba(0, 0, 0, .32)"
                >
                    <Surface
                        style={styles.militaryAffiliationTileView}
                        mode={'elevated'}
                        elevation={5}>
                        <View style={styles.militaryAffiliationTopView}>
                            <Image
                                style={[styles.militaryAffiliationImage, {
                                    top: hp(1),
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
                            onPress={() => {
                                // set the military affiliation for the user
                                setCurrentMemberAffiliation(MilitaryAffiliation.FamilySpouse);
                                // move on to the next step in the registration process
                                setStepNumber(0);
                            }}
                        >
                            <Text style={styles.militaryAffiliationButtonText}>Select</Text>
                        </TouchableOpacity>
                    </Surface>
                </TouchableRipple>
            </View>
        </>
    );
}
