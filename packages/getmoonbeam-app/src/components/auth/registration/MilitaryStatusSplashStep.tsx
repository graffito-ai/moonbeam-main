import React, {useEffect} from "react";

/**
 * MilitaryStatusSplashStep component.
 */
export const MilitaryStatusSplashStep = () => {

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


    // return the component for the MilitaryStatusSplashStep, part of the Registration page
    return (
        <>
            {/*<View style={styles.disclaimerView}>*/}
            {/*    <Checkbox*/}
            {/*        style={styles.disclaimerCheckbox}*/}
            {/*        color={disclaimerChecked ? 'blue' : '#F2FF5D'}*/}
            {/*        value={disclaimerChecked}*/}
            {/*        onValueChange={(newValue) => {*/}
            {/*            setIsDisclaimerChecked(newValue);*/}
            {/*        }}*/}
            {/*    />*/}
            {/*    <Text*/}
            {/*        style={styles.disclaimerText}>{'By checking this box, you are confirming your status as a military service member, thereby granting Moonbeam the authority to document and review ' +*/}
            {/*        'this claim, as well as pursue legal action in accordance with U.S. federal statutes and penal codes, if the claim is proven to be fraudulent.\n' +*/}
            {/*        'You also acknowledge that you read and agree to our '}*/}
            {/*        <Text style={styles.disclaimerTextHighlighted}*/}
            {/*              onPress={() => {*/}
            {/*              }}>Privacy Policy</Text>{' and our'}*/}
            {/*        <Text style={styles.disclaimerTextHighlighted}*/}
            {/*              onPress={() => {*/}
            {/*              }}> Terms & Conditions.</Text>*/}
            {/*    </Text>*/}
            {/*</View>*/}
        </>
    );
}
