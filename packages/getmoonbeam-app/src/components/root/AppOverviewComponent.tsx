import React, {useEffect, useState} from "react";
import {ImageBackground, TouchableOpacity, View} from "react-native";
import {commonStyles} from '../../styles/common.module';
import {styles} from '../../styles/appOverview.module';
import {AppOverviewProps} from "../../models/props/RootProps";
import {LinearGradient} from "expo-linear-gradient";
import {Text} from "react-native-paper";
import GestureRecognizer from 'react-native-swipe-gestures';
import {useRecoilState} from "recoil";
import {initialAuthenticationScreen} from "../../recoil/AuthAtom";
import {appOverviewSteps} from "../../models/Constants";

/**
 * AppOverview component.
 *
 * @param route route object to be passed in from the parent navigator.
 * @param navigation navigation object to be passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const AppOverviewComponent = ({route, navigation}: AppOverviewProps) => {
    // constants used to keep track of shared states
    const [_, setAuthScreen] = useRecoilState(initialAuthenticationScreen);
    // constants used to keep track of local component state
    const [stepNumber, setStepNumber] = useState<number>(0);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
    }, []);

    // return the component for the AppOverview page
    return (
        <>
            <View style={commonStyles.rowContainer}
                  onLayout={route.params.onLayoutRootView}>
                <LinearGradient
                    colors={['#5B5A5A', 'transparent']}
                    style={styles.topContainer}>
                    <ImageBackground
                        style={[commonStyles.image, styles.topContainerImage]}
                        imageStyle={{
                            resizeMode: 'contain'
                        }}
                        source={appOverviewSteps[stepNumber].stepImageSource}/>
                </LinearGradient>
                <GestureRecognizer
                    onSwipeLeft={() => {
                        if (stepNumber < 3) {
                            // increase the step number
                            let newStepValue = stepNumber + 1;
                            setStepNumber(newStepValue);
                        }
                    }}
                    onSwipeRight={() => {
                        if (stepNumber > 0) {
                            // decrease the step number
                            let newStepValue = stepNumber - 1;
                            setStepNumber(newStepValue);
                        }
                    }}
                    style={styles.bottomContainer}
                >
                    <Text style={styles.bottomContainerTitle}>
                        {appOverviewSteps[stepNumber].stepTitle}
                    </Text>
                    <Text style={styles.bottomContainerContent}>
                        {appOverviewSteps[stepNumber].stepDescription}
                    </Text>
                    <View style={[commonStyles.columnContainer, styles.progressSteps]}>
                        <View style={stepNumber === 0 ? styles.activeStep : styles.inactiveStep}></View>
                        <View style={stepNumber === 1 ? styles.activeStep : styles.inactiveStep}></View>
                        <View style={stepNumber === 2 ? styles.activeStep : styles.inactiveStep}></View>
                        <View style={stepNumber === 3 ? styles.activeStep : styles.inactiveStep}></View>
                    </View>
                    <View style={[commonStyles.columnContainer, styles.bottomContainerButtons]}>
                        <TouchableOpacity
                            style={styles.buttonLeft}
                            onPress={
                                () => {
                                    /**
                                     * navigate to the Authentication component, and set the recoil state accordingly,
                                     * in order to display the right subcomponent for Authentication.
                                     */
                                    setAuthScreen('Registration');
                                    navigation.navigate("Authentication", {
                                        expoPushToken: route.params.expoPushToken
                                    });
                                }
                            }
                        >
                            <Text style={styles.buttonText}>Apply</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.buttonRight}
                            onPress={
                                () => {
                                    /**
                                     * navigate to the Authentication component, and set the recoil state accordingly,
                                     * in order to display the right subcomponent for Authentication.
                                     */
                                    setAuthScreen('SignIn');
                                    navigation.navigate("Authentication", {
                                        expoPushToken: route.params.expoPushToken
                                    });
                                }
                            }
                        >
                            <Text style={styles.buttonText}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </GestureRecognizer>
            </View>
        </>
    );
};
