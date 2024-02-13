import React, {useEffect, useState} from "react";
import {TouchableOpacity, View} from "react-native";
import {LinearGradient} from "expo-linear-gradient";
import {styles} from "../../../../../../styles/dashboard.module";
import {TopDashboard} from "./TopDashboard";
import {CustomBanner} from "../../../../../common/CustomBanner";
import {BottomDashboard} from "./BottomDashboard";
import {useRecoilState} from "recoil";
import {showTransactionBottomSheetState} from "../../../../../../recoil/DashboardAtom";
import {customBannerState} from "../../../../../../recoil/CustomBannerAtom";
import {currentUserInformation} from "../../../../../../recoil/AuthAtom";
import {MoonbeamTransaction} from "@moonbeam/moonbeam-models";

/**
 * DashboardMain component.
 *
 * @param props component properties to be passed in.
 * @constructor constructor for the component.
 */
export const DashboardMain = (props: { setSelectedTransaction: React.Dispatch<React.SetStateAction<MoonbeamTransaction | null>> }) => {
    // constants used to keep track of local component state
    const [currentUserName, setCurrentUserName] = useState<string>("N/A");
    // constants used to keep track of shared states
    const [userInformation,] = useRecoilState(currentUserInformation);
    const [bannerState,] = useRecoilState(customBannerState);
    const [showTransactionsBottomSheet, setShowTransactionsBottomSheet] = useRecoilState(showTransactionBottomSheetState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // check to see if the user information object has been populated accordingly
        if (userInformation["family_name"]) {
            setCurrentUserName(`${userInformation["given_name"]}`);
        }
    }, [userInformation["family_name"]]);

    // return the component for the DashboardMain, part of the Dashboard page
    return (
        <>
            <TouchableOpacity
                activeOpacity={1}
                disabled={!showTransactionsBottomSheet}
                onPress={() => setShowTransactionsBottomSheet(false)}
            >
                <View
                    {...showTransactionsBottomSheet && {pointerEvents: "none"}}
                    {...showTransactionsBottomSheet && {
                        style: {backgroundColor: 'transparent', opacity: 0.3}
                    }}
                >
                    <LinearGradient
                        start={{x: 1, y: 0.1}}
                        end={{x: 1, y: 1}}
                        colors={['#5B5A5A', '#313030']}
                        style={styles.topDashboardView}>
                        <TopDashboard currentUserName={currentUserName}/>
                        <CustomBanner bannerVisibilityState={bannerState.bannerVisibilityState}
                                      bannerMessage={bannerState.bannerMessage}
                                      bannerButtonLabel={bannerState.bannerButtonLabel}
                                      bannerButtonLabelActionSource={bannerState.bannerButtonLabelActionSource}
                            // @ts-ignore
                                      bannerArtSource={bannerState.bannerArtSource}
                                      dismissing={bannerState.dismissing}
                        />
                    </LinearGradient>
                    <BottomDashboard setSelectedTransaction={props.setSelectedTransaction}/>
                </View>
            </TouchableOpacity>
        </>
    );
}
