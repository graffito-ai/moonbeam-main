import React, {useEffect, useRef} from "react";
import BottomSheet from "@gorhom/bottom-sheet";
import {styles} from "../../../../../../styles/dashboard.module";
import {heightPercentageToDP as hp} from "react-native-responsive-screen";
import {TransactionsBottomSheet} from "../transactions/TransactionsBottomSheet";
import {useRecoilState} from "recoil";
import {showTransactionBottomSheetState} from "../../../../../../recoil/DashboardAtom";
import {MoonbeamTransaction} from "@moonbeam/moonbeam-models";
import {bottomTabShownState} from "../../../../../../recoil/HomeAtom";
import {drawerSwipeState} from "../../../../../../recoil/AppDrawerAtom";

/**
 * DashboardBottomSheet component.
 *
 * @param props component properties to be passed in.
 * @constructor constructor for the component.
 */
export const DashboardBottomSheet = (props: {
    selectedTransaction: MoonbeamTransaction | null,
    setSelectedTransaction: React.Dispatch<React.SetStateAction<MoonbeamTransaction | null>>
}) => {
    // constants used to keep track of local component state
    const bottomSheetRef = useRef(null);
    // constants used to keep track of shared states
    const [showTransactionsBottomSheet, setShowTransactionsBottomSheet] = useRecoilState(showTransactionBottomSheetState);
    const [, setBottomTabShown] = useRecoilState(bottomTabShownState);
    const [, setDrawerSwipeEnabled] = useRecoilState(drawerSwipeState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // manipulate the bottom sheet
        if (!showTransactionsBottomSheet && bottomSheetRef) {
            // reset the selected transaction on bottom sheet close
            props.setSelectedTransaction(null);

            // @ts-ignore
            bottomSheetRef.current?.close?.();

            // show the bottom tab
            setBottomTabShown(true);

            // enable drawer swipe
            setDrawerSwipeEnabled(true);
        }
        if (showTransactionsBottomSheet && bottomSheetRef) {
            // hide the bottom tab
            setBottomTabShown(false);

            // disable the drawer swipe
            setDrawerSwipeEnabled(false);

            // @ts-ignore
            bottomSheetRef.current?.expand?.();
        }
    }, [bottomSheetRef, showTransactionsBottomSheet]);

    // return the component for the DashboardBottomSheet, part of the Dashboard page
    return (
        <>
            {
                showTransactionsBottomSheet &&
                <BottomSheet
                    handleIndicatorStyle={{backgroundColor: '#F2FF5D'}}
                    ref={bottomSheetRef}
                    backgroundStyle={[styles.bottomSheet, props.selectedTransaction && props.selectedTransaction.transactionIsOnline && {backgroundColor: '#5B5A5A'}]}
                    enablePanDownToClose={true}
                    index={showTransactionsBottomSheet ? 0 : -1}
                    snapPoints={props.selectedTransaction && !props.selectedTransaction.transactionIsOnline ? [hp(55), hp(55)] : [hp(22), hp(22)]}
                    onChange={(index) => {
                        setShowTransactionsBottomSheet(index !== -1);
                    }}
                >
                    {
                        props.selectedTransaction &&
                        <TransactionsBottomSheet
                            brandName={props.selectedTransaction.transactionBrandName}
                            brandImage={props.selectedTransaction.transactionBrandLogoUrl}
                            {...props.selectedTransaction.transactionIsOnline && {
                                transactionOnlineAddress: props.selectedTransaction.transactionBrandURLAddress
                            }}
                            {...!props.selectedTransaction.transactionIsOnline && {
                                transactionStoreAddress: props.selectedTransaction.transactionBrandAddress
                            }}
                            transactionAmount={props.selectedTransaction.totalAmount.toFixed(2).toString()}
                            transactionDiscountAmount={props.selectedTransaction.rewardAmount.toFixed(2).toString()}
                            transactionTimestamp={props.selectedTransaction.timestamp.toString()}
                            transactionStatus={props.selectedTransaction.transactionStatus.toString()}
                        />
                    }
                </BottomSheet>
            }
        </>
    );
}
