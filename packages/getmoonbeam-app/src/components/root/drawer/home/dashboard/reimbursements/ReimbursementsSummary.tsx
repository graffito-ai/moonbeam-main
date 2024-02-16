import React, {useEffect} from 'react';
import {View} from "react-native";
import {ReimbursementsSummaryProps} from "../../../../../../models/props/ReimbursementsControllerProps";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';

/**
 * Reimbursements Summary component. This component will be used as the main
 * component for Reimbursements.
 *
 * @constructor constructor for the component.
 */
export const ReimbursementsSummary = ({navigation}: ReimbursementsSummaryProps) => {
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

    /**
     * return the component for the ReimbursementsSummary page
     */
    return (
        <>
            <View style={{flex: 1, backgroundColor: '#e5e5e5'}}>
                <View style={{
                    flex: 0.10,
                    backgroundColor: '#FFFFFF',
                    shadowColor: 'black',
                    shadowOffset: {width: -2, height: 8},
                    shadowOpacity: 0.35,
                    shadowRadius: 12,
                    elevation: 15
                }}>

                </View>
            </View>
        </>
    );
};

