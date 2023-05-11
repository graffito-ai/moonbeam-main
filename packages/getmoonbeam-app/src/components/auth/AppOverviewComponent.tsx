import React, {useEffect, useState} from "react";
import {ImageBackground, TouchableOpacity, View} from "react-native";
import {commonStyles} from '../../styles/common.module';
import {styles} from '../../styles/appOverview.module';
import {AppOverviewProps} from "../../models/RootProps";
import {LinearGradient} from "expo-linear-gradient";
import {Text} from "react-native-paper";
import GestureRecognizer from 'react-native-swipe-gestures';

/**
 * AppOverview component.
 */
export const AppOverviewComponent = ({route}: AppOverviewProps) => {
    // constants used to keep track of local component state
    const [stepNumber, setStepNumber] = useState<number>(0);
    const stepTitles = [
        "Card-Linked Military\n Discounts",
        "Verify your\n Valor",
        "Link & Start Earning\n Cashback",
        "Earn Discounts\n Seamlessly"
    ]
    const stepContent = [
        "Access exclusive military discounts and rewards just by linking your existing debit or credit card.",
        "Go through our secure and trusted military verification process to ensure exclusive access.",
        "Link your Visa, MasterCard or American Express debit or credit cards, and earn through qualifying transactions.",
        "Discounts are automatically applied and will show on your statements daily. No need to ask the cashier."
    ]
    const stepImage = [
        require('../../../assets/art/moonbeam-card-overview.png'),
        require('../../../assets/art/moonbeam-verification-overview.png'),
        require('../../../assets/art/moonbeam-linking-overview.png'),
        require('../../../assets/art/moonbeam-rewards-overview.png')
    ]

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
                        source={stepImage[stepNumber]}/>
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
                        {stepTitles[stepNumber]}
                    </Text>
                    <Text style={styles.bottomContainerContent}>
                        {stepContent[stepNumber]}
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
                                    console.log('here');
                                }
                            }
                        >
                            <Text style={styles.buttonText}>Apply</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.buttonRight}
                            onPress={
                                () => {
                                    console.log('here');
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

