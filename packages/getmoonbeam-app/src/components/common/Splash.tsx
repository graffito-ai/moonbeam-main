import React from 'react';
import {Image, ImageSourcePropType, SafeAreaView, Text, View} from "react-native";
import {styles} from '../../styles/splashScreen.module';

/**
 * Splash component used for confirmations and/or error messages.
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

