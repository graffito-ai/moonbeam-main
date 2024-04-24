import React, {useEffect, useRef} from "react";
import BottomSheet from "@gorhom/bottom-sheet";
import {heightPercentageToDP as hp} from "react-native-responsive-screen";
import {useRecoilState} from "recoil";
import {showRoundupTransactionBottomSheetState} from "../../../../../../../recoil/DashboardAtom";
import {MoonbeamRoundupTransaction} from "@moonbeam/moonbeam-models";
import {drawerSwipeState} from "../../../../../../../recoil/AppDrawerAtom";
import {styles} from "../../../../../../../styles/roundupsDashboard.module";
import {bottomTabShownState} from "../../../../../../../recoil/HomeAtom";

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
                    snapPoints={props.selectedRoundupTransaction && !props.selectedRoundupTransaction.transactionIsOnline ? [hp(55), hp(55)] : [hp(40), hp(40)]}
                    onChange={(index) => {
                        setShowRoundupTransactionsBottomSheet(index !== -1);
                    }}
                >
                    {/*{*/}
                    {/*    props.selectedTransaction &&*/}
                    {/*    <TransactionsBottomSheet*/}
                    {/*        brandName={props.selectedTransaction.transactionBrandName}*/}
                    {/*        brandImage={props.selectedTransaction.transactionBrandLogoUrl}*/}
                    {/*        {...props.selectedTransaction.transactionIsOnline && {*/}
                    {/*            transactionOnlineAddress: props.selectedTransaction.transactionBrandURLAddress*/}
                    {/*        }}*/}
                    {/*        {...!props.selectedTransaction.transactionIsOnline && {*/}
                    {/*            transactionStoreAddress: props.selectedTransaction.transactionBrandAddress*/}
                    {/*        }}*/}
                    {/*        transactionAmount={props.selectedTransaction.totalAmount.toFixed(2).toString()}*/}
                    {/*        transactionDiscountAmount={props.selectedTransaction.rewardAmount.toFixed(2).toString()}*/}
                    {/*        transactionTimestamp={props.selectedTransaction.timestamp.toString()}*/}
                    {/*        transactionStatus={*/}
                    {/*            props.selectedTransaction.transactionStatus === TransactionsStatus.Funded*/}
                    {/*                ? TransactionsStatus.Processed.toString()*/}
                    {/*                : (props.selectedTransaction.transactionStatus === TransactionsStatus.Fronted*/}
                    {/*                    ? TransactionsStatus.Credited.toString()*/}
                    {/*                    : props.selectedTransaction.transactionStatus.toString())*/}
                    {/*        }*/}
                    {/*        transactionType={props.selectedTransaction.transactionType}*/}
                    {/*    />*/}
                    {/*}*/}
                </BottomSheet>
            }
        </>
    );
}
