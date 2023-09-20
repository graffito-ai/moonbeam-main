import React, {useEffect, useState} from "react";
import {Dialog, Portal, Text} from "react-native-paper";
import {styles} from "../../../../../../styles/biometrics.module";
import {useRecoilState, useResetRecoilState} from "recoil";
import {firstTimeLoggedInState, moonbeamUserIdPassState, moonbeamUserIdState} from "../../../../../../recoil/RootAtom";
// @ts-ignore
import MoonbeamBiometricsFaceId from "../../../../../../../assets/art/moonbeam-biometrics-faceid.png";
// @ts-ignore
import MoonbeamBiometricsIris from "../../../../../../../assets/art/moonbeam-biometrics-iris.png";
// @ts-ignore
import MoonbeamBiometricsFingerprint from "../../../../../../../assets/art/moonbeam-biometrics-fingerprint.png";
// @ts-ignore
import MoonbeamBiometricsPin from "../../../../../../../assets/art/moonbeam-biometrics-pin.png";
import {Image, Platform} from "react-native";
import {Button} from "@rneui/base";
import * as LocalAuthentication from 'expo-local-authentication';
import {SecurityLevel} from 'expo-local-authentication';
import {Spinner} from "../../../../../common/Spinner";
import * as SecureStore from 'expo-secure-store';

/**
 * BiometricsPopUp component. This component will be used in the dashboard for the application,
 * to help with the biometrics registration/opt-in.
 *
 * @constructor constructor for the component.
 */
export const BiometricsPopUp = () => {
    // constants used to keep track of local component state
    const [isReady, setIsReady] = useState<boolean>(false);
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
    const [biometricAvailabilityCheck, setBiometricAvailabilityCheck] = useState<boolean>(false);
    const [enabledBiometric, setEnabledBiometric] = useState<string | null>(null);
    // constants used to keep track of shared states
    const [moonbeamUserId,] = useRecoilState(moonbeamUserIdState);
    const [moonbeamUserIdPass,] = useRecoilState(moonbeamUserIdPassState);
    const [firstTimeLoggedIn, setFirstTimeLoggedIn] = useRecoilState(firstTimeLoggedInState);
    const moonbeamUserIdStateReset = useResetRecoilState(moonbeamUserIdState);
    const moonbeamUserIdPassStateReset = useResetRecoilState(moonbeamUserIdPassState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // if you're a first time log in user
        if (firstTimeLoggedIn) {
            if (!biometricAvailabilityCheck && enabledBiometric === null) {
                setUpBiometricsPopUp().then(_ => {
                    /**
                     * we will store the user's credentials in the Expo Secure Store, so we can then access them at a later time,
                     * in order to allow users to login without inputting them into the app, if they enable biometric login.
                     */
                    SecureStore.setItemAsync(`moonbeam-user-id`, moonbeamUserId, {
                        requireAuthentication: false // we don't need this to be under authentication, so we can check at login
                    }).then(_ => {
                        SecureStore.setItemAsync(`moonbeam-user-passcode`, moonbeamUserIdPass, {
                            requireAuthentication: false // we don't need this to be under authentication, so we can check at login
                        }).then(_ => {});
                    });
                });
            }
        } else {
            /**
             * if you're not a first time log in user, but you have to re-opt into setting up your biometrics
             * use cases include logging into a new account for example.
             */
            SecureStore.getItemAsync(`biometrics-enabled`, {
                requireAuthentication: false // we don't need this to be under authentication, so we can check at login
            }).then(biometricsEnabledPreference => {
                if(biometricsEnabledPreference === null || biometricsEnabledPreference.length === 0) {
                    console.log('Need to re-prompt existing user, previously logged in to set-up biometrics.');
                    // override the existing first time logged in flag in this case, so we can show the biometrics set-up popup
                    setFirstTimeLoggedIn(true);
                    setUpBiometricsPopUp().then(_ => {
                        /**
                         * we will store the user's credentials in the Expo Secure Store, so we can then access them at a later time,
                         * in order to allow users to login without inputting them into the app, if they enable biometric login.
                         */
                        SecureStore.setItemAsync(`moonbeam-user-id`, moonbeamUserId, {
                            requireAuthentication: false // we don't need this to be under authentication, so we can check at login
                        }).then(_ => {
                            SecureStore.setItemAsync(`moonbeam-user-passcode`, moonbeamUserIdPass, {
                                requireAuthentication: false // we don't need this to be under authentication, so we can check at login
                            }).then(_ => {});
                        });
                    });
                }
            });
        }
    }, [firstTimeLoggedIn, biometricAvailabilityCheck, enabledBiometric]);

    /**
     * Function used to set up the biometrics popup accordingly.
     *
     * @returns a {@link Promise} of {@link void} since we do not need to
     * return anything other than setting up the necessary popup information.
     */
    const setUpBiometricsPopUp = async (): Promise<void> => {
        try {
            // check whether any biometric is available on the device
            LocalAuthentication.hasHardwareAsync().then(available => {
                // if the hardware is available, then proceed with additional checks
                if (available) {
                    // determine whether the device has any saved biometric data available to use for authentication
                    LocalAuthentication.isEnrolledAsync().then(enrolled => {
                        // if the device has enrolled biometric data, then proceed with additional checks
                        if (enrolled) {
                            // determine what kind of authentication is enrolled on the device
                            LocalAuthentication.getEnrolledLevelAsync().then(async enrollmentLevel => {
                                switch (enrollmentLevel) {
                                    case SecurityLevel.NONE:
                                        console.log(`No enrollment identified for device ${enrollmentLevel}`);
                                        // set the biometric availability flag accordingly
                                        setBiometricAvailabilityCheck(true);
                                        // set the readiness to true
                                        setIsReady(true);
                                        // we destroy anything in here that could've been used for biometrics
                                        moonbeamUserIdStateReset();
                                        moonbeamUserIdPassStateReset();
                                        break;
                                    case SecurityLevel.SECRET:
                                        console.log('Non-biometric authentication identified for device');
                                        // set the biometric enablement flag accordingly
                                        setEnabledBiometric('PIN/Pattern');
                                        // set the biometric store flag type accordingly, so we can retrieve it in Settings List
                                        await SecureStore.setItemAsync(`biometrics-type`, 'PIN/Pattern', {
                                            requireAuthentication: false // we don't need this to be under authentication, so we can check at login
                                        });
                                        // set the biometric availability flag accordingly
                                        setBiometricAvailabilityCheck(true);
                                        // set the readiness to true
                                        setIsReady(true);
                                        break;
                                    case SecurityLevel.BIOMETRIC:
                                        console.log('Biometric authentication identified for device');
                                        // determine what type of biometric authentication is supported for device
                                        LocalAuthentication.supportedAuthenticationTypesAsync().then(async biometricTypes => {
                                            // ensure that the biometric types available, return a valid array
                                            if (biometricTypes.length !== 0) {
                                                // depending on the Platform, set the biometric enablement flag accordingly
                                                if (Platform.OS === 'ios') {
                                                    // filter the biometric enablement flag accordingly, since a device can support multiple types of auth
                                                    let biometricPriorityChecked = false;
                                                    if (biometricTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION) &&
                                                        !biometricPriorityChecked) {
                                                        // set the biometric enablement flag accordingly
                                                        setEnabledBiometric('Face ID');
                                                        // set the biometric store flag type accordingly, so we can retrieve it in Settings List
                                                        await SecureStore.setItemAsync(`biometrics-type`, 'Face ID', {
                                                            requireAuthentication: false // we don't need this to be under authentication, so we can check at login
                                                        });
                                                        biometricPriorityChecked = true;
                                                        // set the biometric availability flag accordingly
                                                        setBiometricAvailabilityCheck(true);
                                                        // set the readiness to true
                                                        setIsReady(true);

                                                        return;
                                                    } else if (biometricTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT) &&
                                                        !biometricPriorityChecked) {
                                                        // set the biometric enablement flag accordingly
                                                        setEnabledBiometric('Fingerprint/TouchID');
                                                        // set the biometric store flag type accordingly, so we can retrieve it in Settings List
                                                        await SecureStore.setItemAsync(`biometrics-type`, 'Fingerprint/TouchID', {
                                                            requireAuthentication: false // we don't need this to be under authentication, so we can check at login
                                                        });
                                                        biometricPriorityChecked = true;
                                                        // set the biometric availability flag accordingly
                                                        setBiometricAvailabilityCheck(true);
                                                        // set the readiness to true
                                                        setIsReady(true);

                                                        return;
                                                    }
                                                } else if (Platform.OS === 'android') {
                                                    // filter the biometric enablement flag accordingly, since a device can support multiple types of auth
                                                    let biometricPriorityChecked = false;
                                                    if (biometricTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION) &&
                                                        !biometricPriorityChecked) {
                                                        // set the biometric enablement flag accordingly
                                                        setEnabledBiometric('Face ID');
                                                        // set the biometric store flag type accordingly, so we can retrieve it in Settings List
                                                        await SecureStore.setItemAsync(`biometrics-type`, 'Face ID', {
                                                            requireAuthentication: false // we don't need this to be under authentication, so we can check at login
                                                        });
                                                        biometricPriorityChecked = true;
                                                        // set the biometric availability flag accordingly
                                                        setBiometricAvailabilityCheck(true);
                                                        // set the readiness to true
                                                        setIsReady(true);

                                                        return;
                                                    } else if (biometricTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT) &&
                                                        !biometricPriorityChecked) {
                                                        // set the biometric enablement flag accordingly
                                                        setEnabledBiometric('Fingerprint/TouchID');
                                                        // set the biometric store flag type accordingly, so we can retrieve it in Settings List
                                                        await SecureStore.setItemAsync(`biometrics-type`, 'Fingerprint/TouchID', {
                                                            requireAuthentication: false // we don't need this to be under authentication, so we can check at login
                                                        });
                                                        biometricPriorityChecked = true;
                                                        // set the biometric availability flag accordingly
                                                        setBiometricAvailabilityCheck(true);
                                                        // set the readiness to true
                                                        setIsReady(true);

                                                        return;
                                                    } else if (biometricTypes.includes(LocalAuthentication.AuthenticationType.IRIS) &&
                                                        !biometricPriorityChecked) {
                                                        // set the biometric enablement flag accordingly
                                                        setEnabledBiometric('Iris Recognition');
                                                        // set the biometric store flag type accordingly, so we can retrieve it in Settings List
                                                        await SecureStore.setItemAsync(`biometrics-type`, 'Iris Recognition', {
                                                            requireAuthentication: false // we don't need this to be under authentication, so we can check at login
                                                        });
                                                        biometricPriorityChecked = true;
                                                        // set the biometric availability flag accordingly
                                                        setBiometricAvailabilityCheck(true);
                                                        // set the readiness to true
                                                        setIsReady(true);

                                                        return;
                                                    }
                                                }
                                            } else {
                                                console.log('Device does not support any type of biometric authentication!');
                                                // set the biometric availability flag accordingly
                                                setBiometricAvailabilityCheck(true);
                                                // set the readiness to true
                                                setIsReady(true);
                                                // we destroy anything in here that could've been used for biometrics
                                                moonbeamUserIdStateReset();
                                                moonbeamUserIdPassStateReset();

                                                return;
                                            }
                                        });
                                        break;
                                    default:
                                        console.log(`Unrecognized enrollment level for device ${enrollmentLevel}`);
                                        // set the biometric availability flag accordingly
                                        setBiometricAvailabilityCheck(true);
                                        // set the readiness to true
                                        setIsReady(true);
                                        // we destroy anything in here that could've been used for biometrics
                                        moonbeamUserIdStateReset();
                                        moonbeamUserIdPassStateReset();
                                        break;
                                }
                            });
                        } else {
                            console.log('Device does not have any type of authentication data saved/enrolled!');
                            // set the biometric availability flag accordingly
                            setBiometricAvailabilityCheck(true);
                            // set the readiness to true
                            setIsReady(true);

                            // we destroy anything in here that could've been used for biometrics
                            moonbeamUserIdStateReset();
                            moonbeamUserIdPassStateReset();
                            return;
                        }
                    });
                } else {
                    console.log('Device does not have any type of authentication hardware available!');
                    // set the biometric availability flag accordingly
                    setBiometricAvailabilityCheck(true);
                    // set the readiness to true
                    setIsReady(true);

                    // we destroy anything in here that could've been used for biometrics
                    moonbeamUserIdStateReset();
                    moonbeamUserIdPassStateReset();
                    return;
                }
            });
        } catch (error) {
            console.log('Unexpected error while setting up biometrics popup!');
            // set the biometric availability flag accordingly
            setBiometricAvailabilityCheck(true);
            // set the readiness to true
            setIsReady(true);

            // we destroy anything in here that could've been used for biometrics
            moonbeamUserIdStateReset();
            moonbeamUserIdPassStateReset();
            return;
        }
    }


    // return the component for the BiometricsPopUp
    return (
        <>
            {
                enabledBiometric !== null &&
                <Portal>
                    <Portal.Host>
                        <Dialog dismissable={false}
                                style={styles.dialogStyle} visible={firstTimeLoggedIn}
                                onDismiss={() => {
                                    setFirstTimeLoggedIn(false);
                                    // we destroy anything in here that could've been used for biometrics
                                    moonbeamUserIdStateReset();
                                    moonbeamUserIdPassStateReset();
                                }}>
                            <>
                                {
                                    !isReady ?
                                        <Spinner loadingSpinnerShown={loadingSpinnerShown}
                                                 setLoadingSpinnerShown={setLoadingSpinnerShown}/> :
                                        <>
                                            <Image source={
                                                enabledBiometric === 'Face ID'
                                                    ? MoonbeamBiometricsFaceId
                                                    : enabledBiometric === 'Fingerprint/TouchID'
                                                        ? MoonbeamBiometricsFingerprint
                                                        : enabledBiometric === 'Iris Recognition'
                                                            ? MoonbeamBiometricsIris
                                                            : MoonbeamBiometricsPin
                                            }
                                                   style={styles.topBiometricsImage}/>
                                            <Dialog.Title
                                                style={styles.dialogTitle}>{`Allow authentication with ${enabledBiometric} ?`}</Dialog.Title>
                                            <Dialog.Actions style={styles.dialogActionButtons}>
                                                <Button buttonStyle={styles.enableButton}
                                                        titleStyle={styles.enableButtonText}
                                                        onPress={async () => {
                                                            // authenticate using the chosen authentication option
                                                            const localAuthenticationResult: LocalAuthentication.LocalAuthenticationResult = await LocalAuthentication.authenticateAsync({
                                                                promptMessage: 'Use your biometrics or FingerPrint/TouchID to authenticate with Moonbeam!',
                                                            });
                                                            // check if the authentication was successful or not
                                                            if (localAuthenticationResult.success) {
                                                                // we will store the user's biometrics preferences.
                                                                await SecureStore.setItemAsync(`biometrics-enabled`, '1', {
                                                                    requireAuthentication: false // we don't need this to be under authentication, so we can check at login
                                                                });

                                                                // we destroy anything in here that could've been used for biometrics
                                                                moonbeamUserIdStateReset();
                                                                moonbeamUserIdPassStateReset();

                                                                // dismiss the modal
                                                                setFirstTimeLoggedIn(false);
                                                            }
                                                        }}>
                                                    {`Use ${enabledBiometric}`}
                                                </Button>
                                                <Button buttonStyle={styles.dismissButton}
                                                        titleStyle={styles.dismissButtonText}
                                                        onPress={async () => {
                                                            // dismiss the modal
                                                            setFirstTimeLoggedIn(false);

                                                            // we will set the biometrics enabled flag to 0, so we don't keep showing this popup to returning users whom do not wish to use this feature
                                                            await SecureStore.setItemAsync(`biometrics-enabled`, '0', {
                                                                requireAuthentication: false // we don't need this to be under authentication, so we can check at login
                                                            });

                                                            // we destroy anything in here that could've been used for biometrics
                                                            moonbeamUserIdStateReset();
                                                            moonbeamUserIdPassStateReset();
                                                        }}>
                                                    Maybe Later
                                                </Button>
                                            </Dialog.Actions>
                                            <Dialog.Content>
                                                <Text
                                                    style={styles.dialogParagraph}>{`We will use your ${enabledBiometric}, in order to allow you to sign into the app or access various sensitive data! You can change this preference this in your app settings.`}</Text>
                                            </Dialog.Content>
                                        </>
                                }
                            </>
                        </Dialog>
                    </Portal.Host>
                </Portal>
            }
        </>
    )
}