import React, {useEffect, useState} from 'react';
import {Text, TouchableOpacity, View} from "react-native";
import {ReimbursementsSummaryProps} from "../../../../../../models/props/ReimbursementsControllerProps";
import {styles} from "../../../../../../styles/reimbursementsController.module";

/**
 * Reimbursements Summary component. This component will be used as the main
 * component for Reimbursements.
 *
 * @constructor constructor for the component.
 */
export const ReimbursementsSummary = ({navigation}: ReimbursementsSummaryProps) => {
    // constants used to keep track of local component state
    const [activeSummaryState, setActiveSummaryState] = useState<'all' | 'ongoing' | 'complete'>('all');

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
            <View
                style={styles.reimbursementSummaryMainView}>
                <View style={styles.reimbursementSummaryTab}>
                    <Text style={styles.reimbursementSummaryTabTitle}>
                        My Cashback
                    </Text>
                    <View style={styles.reimbursementSummaryTabButtonView}>
                        <TouchableOpacity
                            onPress={() => {
                                // set the appropriate active summary state
                                setActiveSummaryState('all');
                            }}
                            style={activeSummaryState === 'all'
                                ? styles.reimbursementSummaryTabButtonActive
                                : styles.reimbursementSummaryTabButton}>
                            <Text style={activeSummaryState === 'all'
                                ? styles.reimbursementSummaryTabButtonTextActive
                                : styles.reimbursementSummaryTabButtonText}>
                                All
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                // set the appropriate active summary state
                                setActiveSummaryState('ongoing');
                            }}
                            style={activeSummaryState === 'ongoing'
                                ? styles.reimbursementSummaryTabButtonActive
                                : styles.reimbursementSummaryTabButton}>
                            <Text style={activeSummaryState === 'ongoing'
                                ? styles.reimbursementSummaryTabButtonTextActive
                                : styles.reimbursementSummaryTabButtonText}>
                                Ongoing
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                // set the appropriate active summary state
                                setActiveSummaryState('complete');
                            }}
                            style={activeSummaryState === 'complete'
                                ? styles.reimbursementSummaryTabButtonActive
                                : styles.reimbursementSummaryTabButton}>
                            <Text style={activeSummaryState === 'complete'
                                ? styles.reimbursementSummaryTabButtonTextActive
                                : styles.reimbursementSummaryTabButtonText}>
                                Complete
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </>
    );
};

