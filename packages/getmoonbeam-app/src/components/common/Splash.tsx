import React from 'react';
import {Image, ImageSourcePropType, SafeAreaView, Text, View} from "react-native";
import {styles} from '../../styles/splashScreen.module';

/**
 * Splash component. This component will be used as a confirmation and/or error message screen
 * by various parent components for a better UI/UX experience.
 *
 * @param props component properties to be passed in.
 * @constructor constructor for the component.
 */
export const SplashScreen = (props: {
    splashTitle: string,
    splashDescription: string,
    splashButtonText: string,
    splashArtSource: ImageSourcePropType,
    withButton: boolean
}) => {
    // return the component for the Splash
    return (
        <SafeAreaView style={styles.splashScreenView}>
            <Image
                style={styles.splashArt}
                resizeMethod={'scale'}
                resizeMode={'contain'}
                source={props.splashArtSource}
            />
            <View style={styles.splashContentView}>
                <Text style={styles.splashTitle}>{props.splashTitle}</Text>
                <Text style={styles.splashDescription}>{props.splashDescription}</Text>
            </View>
            {
                props.withButton &&
                <>
                    {/*ToDo add a button functionality here*/}
                </>
            }
        </SafeAreaView>
    );
};

