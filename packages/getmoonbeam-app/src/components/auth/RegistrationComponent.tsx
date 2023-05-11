import React, {useEffect} from "react";
import {View} from "react-native";
import {commonStyles} from '../../styles/common.module';
import {RegistrationProps} from "../../models/AuthenticationProps";
import {Text} from "react-native-paper";

/**
 * RegistrationComponent component.
 */
export const RegistrationComponent = ({}: RegistrationProps) => {
    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
    }, []);

    // return the component for the Registration page
    return (
        <>
            <View style={commonStyles.rowContainer}>
                <Text>RegistrationComponent</Text>
            </View>
        </>
    );
};

