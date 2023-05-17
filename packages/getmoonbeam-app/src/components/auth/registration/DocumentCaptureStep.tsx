import React, {useEffect} from "react";
import {Image, Text, TouchableOpacity, View} from "react-native";
import {Divider} from "react-native-paper";
import {useRecoilState} from "recoil";
import {registrationBackButtonShown, registrationStepNumber} from "../../../recoil/AuthAtom";
import {styles} from "../../../styles/registration.module";

/**
 * DocumentCaptureStep component.
 */
export const DocumentCaptureStep = () => {
    // constants used to keep track of shared states
    const [stepNumber, setStepNumber] = useRecoilState(registrationStepNumber);
    const [, setIsBackButtonShown] = useRecoilState(registrationBackButtonShown);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // perform field validations on every state change, for the specific field that is being validated

    }, []);


    // return the component for the DocumentCaptureStep, part of the Registration page
    return (
        <>
            <View style={styles.documentSelectionView}>
                {/*change the document view according to the step number*/}
                {stepNumber === 1
                    ?
                    <>
                        <View style={styles.documentSelectionOptionTop}>
                            <Image
                                resizeMethod={"scale"}
                                style={styles.documentSelectionOptionImage}
                                resizeMode={'stretch'}
                                source={require('../../../../assets/art/moonbeam-document-upload-1.png')}/>
                            <View style={styles.documentSelectionDescriptionView}>
                                <Text style={styles.documentSelectionOptionDescription}>Upload or capture your military
                                    ID.</Text>
                                <TouchableOpacity
                                    style={styles.documentSelectionButton}
                                    onPress={
                                        () => {
                                            // show back button on previous step
                                            setIsBackButtonShown(true);

                                            // change the step number accordingly
                                            setStepNumber(2);
                                        }
                                    }
                                >
                                    <Text style={styles.buttonText}>Continue</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <Divider
                            style={styles.documentSelectionDivider}/>
                        <View style={styles.documentSelectionOptionBottom}>
                            <Image
                                resizeMethod={"scale"}
                                style={styles.documentSelectionOptionImage}
                                resizeMode={'stretch'}
                                source={require('../../../../assets/art/moonbeam-document-upload-2.png')}/>
                            <View style={styles.documentSelectionDescriptionView}>
                                <Text style={styles.documentSelectionOptionDescription}>Upload or capture your DD214
                                    form.</Text>
                                <TouchableOpacity
                                    style={styles.documentSelectionButton}
                                    onPress={
                                        () => {
                                            // show back button on previous step
                                            setIsBackButtonShown(true);

                                            // change the step number accordingly
                                            setStepNumber(3);
                                        }
                                    }
                                >
                                    <Text style={styles.buttonText}>Continue</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <Divider
                            style={styles.documentSelectionDivider}/>
                    </>
                    : stepNumber === 2
                        ? <></>
                        : stepNumber === 3
                            ? <></>
                            : <></>
                }
            </View>
        </>
    );
}
