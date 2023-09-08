import React, {useEffect} from "react";
import {Image, Text, View} from "react-native";
import {styles} from "../../../../styles/registration.module";
import {Checkbox} from "expo-checkbox";
import {useRecoilState} from "recoil";
import {
    authRegistrationNavigation,
    militaryRegistrationDisclaimerCheckState,
    militaryVerificationStatus,
    registrationMainErrorState
} from "../../../../recoil/AuthAtom";
import {MilitaryVerificationStatusType} from "@moonbeam/moonbeam-models";
// @ts-ignore
import MilitaryApprovalImage from '../../../../../assets/art/military-approval.png';
// @ts-ignore
import MilitaryVerificationImage from '../../../../../assets/art/military-verification.png';

/**
 * MilitaryStatusSplashStep component.
 *
 * @constructor constructor for the component.
 */
export const MilitaryStatusSplashStep = () => {
    // constants used to keep track of shared states
    const [navigation, ] = useRecoilState(authRegistrationNavigation);
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
                            source={MilitaryApprovalImage}/>
                        <Text style={styles.permissionsStepTitle}>{"Congratulations.\n"}</Text>
                        <Text
                            style={styles.permissionsStepDescription}>{"Your military status has been verified."}</Text>
                    </View>
                    :
                    <>
                        <Image
                            style={styles.militaryVerificationImage}
                            source={MilitaryVerificationImage}/>
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
                                'this claim, as well as pursue legal action in accordance with U.S. federal statutes and penal codes, if the claim is proven to be fraudulent.\nIn addition, this represents your consent ' +
                                'to Moonbeam storing any documentation or media that you have and/or will provide during this process.\n' +
                                'You also acknowledge that you read and agree to our '}
                                <Text style={styles.disclaimerTextHighlighted}
                                      onPress={() => {
                                          // navigate to the Documents Viewer
                                          navigation && navigation.navigate('DocumentsViewer', {
                                              name: 'privacy-policy.pdf',
                                              privacyFlag: false
                                          });
                                      }}>Privacy Policy</Text>{' and our'}
                                <Text style={styles.disclaimerTextHighlighted}
                                      onPress={() => {
                                          // navigate to the Documents Viewer
                                          navigation && navigation.navigate('DocumentsViewer', {
                                              name: 'terms-and-conditions.pdf',
                                              privacyFlag: false
                                          });
                                      }}> Terms & Conditions.</Text>
                            </Text>
                        </View>
                    </>

            }
        </>
    );
}
