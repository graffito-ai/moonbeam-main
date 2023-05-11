import React, {useEffect} from "react";
import {View} from "react-native";
import {commonStyles} from '../../styles/common.module';
import {AuthenticationProps} from "../../models/RootProps";

/**
 * Authentication component.
 */
export const AuthenticationComponent = ({}: AuthenticationProps) => {
    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
    }, []);

    // return the component for the Authentication page
    return (
        <>
            <View style={commonStyles.container}>

            </View>
        </>
    );
};

