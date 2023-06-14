import React, {useEffect} from "react";
import {Image, Text, View} from "react-native";
import {styles} from "../../../../styles/registration.module";
import {useRecoilState} from "recoil";
import {registrationMainErrorState} from "../../../../recoil/AuthAtom";

/**
 * UserPermissionsStep component.
 *
 * @constructor constructor for the component.
 */
export const UserPermissionsStep = () => {
    // constants used to keep track of shared states
    const [registrationMainError, ] = useRecoilState(registrationMainErrorState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {}, []);

    // return the component for the UserPermissionsStep, part of the Registration page
    return (
        <>
            {registrationMainError
                ? <Text style={styles.errorMessage}>Unexpected error while requesting user permissions. Try again!</Text>
                : <></>
            }
            <View style={styles.permissionsView}>
                <Image
                    style={styles.permissionsImage}
                    source={require('../../../../../assets/art/permissions.png')}/>
                <Text style={styles.permissionsStepTitle}>{"Make the most out of Moonbeam.\n"}</Text>
                <Text style={styles.permissionsStepDescription}>{"• Get notified when you receive cash back for your purchases.\n• Get help faster, by enabling access to your contacts.\n• Enable location services so you don't miss any deals."}</Text>
            </View>
        </>
    );
}
