import React, {useEffect} from 'react';
import {SafeAreaProvider} from "react-native-safe-area-context";
import {ServiceOfferingDetailsProps} from "../../../../../models/props/ServicesProps";

/**
 * ServiceOfferings component.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const ServiceOfferingDetails = ({}: ServiceOfferingDetailsProps) => {
    // constants used to keep track of local component state

    // constants used to keep track of shared states

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
    }, []);

    // return the component for the ServiceOfferingDetails page
    return (
        <SafeAreaProvider style={{flex: 1, backgroundColor: '#313030'}}>

        </SafeAreaProvider>
    );
};