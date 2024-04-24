import React, {useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {RoundupsDashboardProps} from "../../../../../../../models/props/RoundupsHomeProps";
import {styles} from "../../../../../../../styles/roundupsDashboard.module";
import {RoundupsBottomDashboard} from "./RoundupsBottomDashboard";
import {LinearGradient} from 'expo-linear-gradient';
import {RoundupsDashboardTopBar} from "./RoundupsDashboardTopBar";
import {RoundupsTopDashboard} from "./RoundupsTopDashboard";
import {MoonbeamRoundupTransaction} from "@moonbeam/moonbeam-models";
import {RoundupsDashboardBottomSheet} from "./RoundupsDashboardBottomSheet";
import {TouchableOpacity, View} from 'react-native';
import {useRecoilState} from "recoil";
import {showRoundupTransactionBottomSheetState} from "../../../../../../../recoil/DashboardAtom";

/**
 * RoundupsDashboard component.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const RoundupsDashboard = ({navigation}: RoundupsDashboardProps) => {
    // constants used to keep track of local component state
    const [selectedRoundupTransaction, setSelectedRoundupTransaction] = useState<MoonbeamRoundupTransaction | null>(null);

    // constants used to keep track of shared states
    const [showRoundupTransactionsBottomSheet, setShowRoundupTransactionsBottomSheet] = useRecoilState(showRoundupTransactionBottomSheetState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {

    }, [navigation.getState()]);

    // return the component for the RoundupsDashboard page
    return (
        <>
            <SafeAreaView style={{flex: 1}}>
                <TouchableOpacity
                    style={{flex: 1}}
                    activeOpacity={1}
                    disabled={!showRoundupTransactionsBottomSheet}
                    onPress={() => setShowRoundupTransactionsBottomSheet(false)}
                >
                    <View
                        style={[
                            showRoundupTransactionsBottomSheet && {pointerEvents: "none"},
                            showRoundupTransactionsBottomSheet && {
                                backgroundColor: 'transparent', opacity: 0.70
                            },
                            {flex: 1}
                        ]}
                    >
                        <LinearGradient
                            start={{x: 1, y: 0.1}}
                            end={{x: 1, y: 0.50}}
                            colors={['#5B5A5A', '#313030']}
                            style={styles.dashboardView}>
                            <RoundupsDashboardTopBar/>
                            <RoundupsTopDashboard/>
                        </LinearGradient>
                        <RoundupsBottomDashboard setSelectedRoundupTransaction={setSelectedRoundupTransaction}/>
                    </View>
                </TouchableOpacity>
                <RoundupsDashboardBottomSheet selectedRoundupTransaction={selectedRoundupTransaction}
                                              setSelectedRoundupTransaction={setSelectedRoundupTransaction}/>
            </SafeAreaView>
        </>
    );
};
