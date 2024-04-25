import React, {useEffect, useRef} from "react";
import BottomSheet from "@gorhom/bottom-sheet";
import {heightPercentageToDP as hp} from "react-native-responsive-screen";
import {useRecoilState} from "recoil";
import {showRoundupTransactionBottomSheetState} from "../../../../../../../recoil/DashboardAtom";
import {MoonbeamRoundupTransaction, RoundupTransactionsStatus} from "@moonbeam/moonbeam-models";
import {drawerSwipeState} from "../../../../../../../recoil/AppDrawerAtom";
import {styles} from "../../../../../../../styles/roundupsDashboard.module";
import {bottomTabShownState} from "../../../../../../../recoil/HomeAtom";
import {RoundupTransactionsBottomSheet} from "../../transactions/RoundupTransactionsBottomSheet";

/**
 * RoundupsDashboardBottomSheet component.
 *
 * @param props component properties to be passed in.
 * @constructor constructor for the component.
 */
export const RoundupsDashboardBottomSheet = (props: {
    selectedRoundupTransaction: MoonbeamRoundupTransaction | null,
    setSelectedRoundupTransaction: React.Dispatch<React.SetStateAction<MoonbeamRoundupTransaction | null>>
}) => {
    // constants used to keep track of local component state
    const bottomSheetRef = useRef(null);
    // constants used to keep track of shared states
    const [showRoundupTransactionsBottomSheet, setShowRoundupTransactionsBottomSheet] = useRecoilState(showRoundupTransactionBottomSheetState);
    const [, setDrawerSwipeEnabled] = useRecoilState(drawerSwipeState);
    const [, setBottomTabShown] = useRecoilState(bottomTabShownState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // manipulate the bottom sheet
        if (!showRoundupTransactionsBottomSheet && bottomSheetRef) {
            // reset the selected roundup transaction on bottom sheet close
            props.setSelectedRoundupTransaction(null);

            // @ts-ignore
            bottomSheetRef.current?.close?.();

            // show the bottom tab
            setBottomTabShown(true);

            // enable drawer swipe
            setDrawerSwipeEnabled(true);
        }
        if (showRoundupTransactionsBottomSheet && bottomSheetRef) {
            // hide the bottom tab
            setBottomTabShown(false);

            // disable the drawer swipe
            setDrawerSwipeEnabled(false);

            // @ts-ignore
            bottomSheetRef.current?.expand?.();
        }
    }, [bottomSheetRef, showRoundupTransactionsBottomSheet]);

    // return the component for the RoundupsDashboardBottomSheet, part of the RoundupsDashboard page
    return (
        <>
            {
                showRoundupTransactionsBottomSheet &&
                <BottomSheet
                    handleIndicatorStyle={{backgroundColor: '#F2FF5D'}}
                    ref={bottomSheetRef}
                    backgroundStyle={[styles.bottomSheet, props.selectedRoundupTransaction && props.selectedRoundupTransaction.transactionIsOnline && {backgroundColor: '#313030'}]}
                    enablePanDownToClose={true}
                    index={showRoundupTransactionsBottomSheet ? 0 : -1}
                    snapPoints={
                        props.selectedRoundupTransaction &&
                        props.selectedRoundupTransaction.transactionIsOnline
                            ? [hp(22), hp(22)]
                            : (props.selectedRoundupTransaction && props.selectedRoundupTransaction.storeLocation.addressLine && props.selectedRoundupTransaction.storeLocation.addressLine.length !== 0 &&
                            props.selectedRoundupTransaction.storeLocation.city && props.selectedRoundupTransaction.storeLocation.city.length !== 0 &&
                            props.selectedRoundupTransaction.storeLocation.region && props.selectedRoundupTransaction.storeLocation.region.length !== 0 &&
                            props.selectedRoundupTransaction.storeLocation.zipCode && props.selectedRoundupTransaction.storeLocation.zipCode.length !== 0)
                                ? [hp(55), hp(55)]
                                : [hp(22), hp(22)]
                    }
                    onChange={(index) => {
                        setShowRoundupTransactionsBottomSheet(index !== -1);
                    }}
                >
                    {
                        props.selectedRoundupTransaction &&
                        <RoundupTransactionsBottomSheet
                            brandName={props.selectedRoundupTransaction.transactionBrandName}
                            brandImage={props.selectedRoundupTransaction.transactionBrandLogoUrl}
                            {...props.selectedRoundupTransaction.transactionIsOnline && {
                                transactionOnlineAddress: props.selectedRoundupTransaction.transactionBrandURLAddress
                            }}
                            {...!props.selectedRoundupTransaction.transactionIsOnline &&
                            props.selectedRoundupTransaction.storeLocation.addressLine && props.selectedRoundupTransaction.storeLocation.addressLine.length !== 0 &&
                            props.selectedRoundupTransaction.storeLocation.city && props.selectedRoundupTransaction.storeLocation.city.length !== 0 &&
                            props.selectedRoundupTransaction.storeLocation.region && props.selectedRoundupTransaction.storeLocation.region.length !== 0 &&
                            props.selectedRoundupTransaction.storeLocation.zipCode && props.selectedRoundupTransaction.storeLocation.zipCode.length !== 0 && {
                                transactionStoreAddress: `${props.selectedRoundupTransaction.storeLocation.addressLine}, ${props.selectedRoundupTransaction.storeLocation.city}, ${props.selectedRoundupTransaction.storeLocation.region}, ${props.selectedRoundupTransaction.storeLocation.zipCode}`
                            }}
                            transactionAmount={props.selectedRoundupTransaction.totalAmount.toFixed(2).toString()}
                            transactionRoundupAmount={
                                props.selectedRoundupTransaction.transactionStatus === RoundupTransactionsStatus.Pending
                                    ? props.selectedRoundupTransaction.pendingRoundupAmount.toFixed(2).toString()
                                    : props.selectedRoundupTransaction.transactionStatus === RoundupTransactionsStatus.Processed
                                      ? props.selectedRoundupTransaction.availableRoundupAmount.toFixed(2).toString()
                                      : props.selectedRoundupTransaction.creditedRoundupAmount.toFixed(2).toString()
                            }
                            transactionTimestamp={props.selectedRoundupTransaction.timestamp.toString()}
                            transactionStatus={props.selectedRoundupTransaction.transactionStatus}
                            transactionType={props.selectedRoundupTransaction.transactionType}
                        />
                    }
                </BottomSheet>
            }
        </>
    );
}
