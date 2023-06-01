import React, {useEffect} from "react";
import {Image, Text, View} from "react-native";
import {styles} from "../../../styles/registration.module";
import {Checkbox} from "expo-checkbox";
import {useRecoilState} from "recoil";
import {
    militaryRegistrationDisclaimerCheckState,
    militaryVerificationStatus,
    registrationMainErrorState
} from "../../../recoil/AuthAtom";
import {MilitaryVerificationStatusType} from "@moonbeam/moonbeam-models";

/**
 * MilitaryStatusSplashStep component.
 */
export const MilitaryStatusSplashStep = () => {

    // constants used to keep track of shared states
    const [militaryStatusDisclaimer, setMilitaryStatusDisclaimer] = useRecoilState(militaryRegistrationDisclaimerCheckState);
    const [militaryStatus,] = useRecoilState(militaryVerificationStatus);
    const [registrationMainError, setRegistrationMainError] = useRecoilState(registrationMainErrorState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {}, []);

    // return the component for the MilitaryStatusSplashStep, part of the Registration page
    return (
        <>
            {registrationMainError
                ? <Text style={styles.errorMessage}>Unexpected error while verifying military status. Try again!</Text>
                : <></>
            }
            {
                militaryStatus === MilitaryVerificationStatusType.Verified ?
                    <View style={styles.permissionsView}>
                        <Image
                            style={styles.permissionsImage}
                            source={require('../../../../assets/art/military-approval.png')}/>
                        <Text style={styles.permissionsStepTitle}>{"Congratulations.\n"}</Text>
                        <Text
                            style={styles.permissionsStepDescription}>{"Your military status has been verified."}</Text>
                    </View>
                    :
                    <View style={styles.disclaimerView}>
                        <Checkbox
                            style={styles.disclaimerCheckbox}
                            color={militaryStatusDisclaimer ? 'blue' : '#F2FF5D'}
                            value={militaryStatusDisclaimer}
                            onValueChange={(newValue) => {
                                setMilitaryStatusDisclaimer(newValue);

                                // clear any errors (if any)
                                setRegistrationMainError(false);
                            }}
                        />
                        <Text
                            style={styles.disclaimerText}>{'By checking this box, you are confirming your status as a military service member, thereby granting Moonbeam the authority to document and review ' +
                            'this claim, as well as pursue legal action in accordance with U.S. federal statutes and penal codes, if the claim is proven to be fraudulent.\n' +
                            'You also acknowledge that you read and agree to our '}
                            <Text style={styles.disclaimerTextHighlighted}
                                  onPress={() => {
                                  }}>Privacy Policy</Text>{' and our'}
                            <Text style={styles.disclaimerTextHighlighted}
                                  onPress={() => {
                                  }}> Terms & Conditions.</Text>
                        </Text>
                    </View>
            }
        </>
    );
}
