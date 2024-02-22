import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Platform, Text, TouchableOpacity, View} from "react-native";
import {ReimbursementsSummaryProps} from "../../../../../../models/props/ReimbursementsControllerProps";
import {styles} from "../../../../../../styles/reimbursementsController.module";
import {DataProvider, LayoutProvider, RecyclerListView} from "recyclerlistview";
import {CardType, Transaction} from "@moonbeam/moonbeam-models";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
// @ts-ignore
import MoonbeamCashback from '../../../../../../../assets/art/moonbeam-cashback.png';
// @ts-ignore
import MoonbeamNoReimbursements from '../../../../../../../assets/art/moonbeam-no-reimbursements.png';
// @ts-ignore
import MoonbeamPiggyBank from '../../../../../../../assets/art/moonbeam-piggy-bank.png';
import {Image as ExpoImage} from "expo-image/build/Image";
import {List} from "react-native-paper";
import {convertMSToTimeframe} from "../../../../../../utils/Util";
import {ReimbursementBottomSheet} from "./ReimbursementBottomSheet";
import {useRecoilState, useRecoilValue} from "recoil";
import {
    cardChoiceDropdownOpenState, cardChoiceDropdownValueState,
    pendingReimbursementsDataState, processedReimbursementsDataState,
    reimbursementBottomSheetShownState,
    reimbursementDataState
} from "../../../../../../recoil/ReimbursementsAtom";

/**
 * Interface to be used for handling Reimbursements.
 *
 * ToDo: move this to the moonbeam-models package.
 */
export interface Reimbursement {
    id: string,
    timestamp: number,
    status: 'PENDING' | 'DECLINED' | 'PROCESSED',
    amount: number,
    cardId: string,
    cardLast4: string,
    cardType: CardType,
    transactions: Transaction[]
}

/**
 * Reimbursements Summary component. This component will be used as the main
 * component for Reimbursements.
 *
 * @constructor constructor for the component.
 */
export const ReimbursementsSummary = ({}: ReimbursementsSummaryProps) => {
    // constants used to keep track of local component state
    const reimbursementsListView = useRef();
    const pendingReimbursementsListView = useRef();
    const processedReimbursementsListView = useRef();
    const [activeSummaryState, setActiveSummaryState] = useState<'all' | 'ongoing' | 'complete'>('all');
    const [dataProvider, setDataProvider] = useState<DataProvider | null>(null);
    const [layoutProvider, setLayoutProvider] = useState<LayoutProvider | null>(null);
    const [pendingReimbursementsDataProvider, setPendingReimbursementsDataProvider] = useState<DataProvider | null>(null);
    const [pendingReimbursementsLayoutProvider, setPendingReimbursementsLayoutProvider] = useState<LayoutProvider | null>(null);
    const [processedReimbursementsDataProvider, setProcessedReimbursementsDataProvider] = useState<DataProvider | null>(null);
    const [processedReimbursementsLayoutProvider, setProcessedReimbursementsLayoutProvider] = useState<LayoutProvider | null>(null);
    // constants used to keep track of shared states
    const [, setIsCardChoiceDropdownOpen] = useRecoilState(cardChoiceDropdownOpenState);
    const [, setCardChoiceDropdownValue] = useRecoilState(cardChoiceDropdownValueState);
    const [showReimbursementBottomSheet, setShowReimbursementBottomSheet] = useRecoilState(reimbursementBottomSheetShownState);
    const [reimbursements, setReimbursements] = useRecoilState(reimbursementDataState);
    const pendingReimbursements = useRecoilValue(pendingReimbursementsDataState);
    const processedReimbursements = useRecoilValue(processedReimbursementsDataState);
    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // populate the reimbursements data provider and list view
        if (reimbursements !== undefined && reimbursements !== null && layoutProvider === null && dataProvider === null &&
            pendingReimbursementsDataProvider === null && pendingReimbursementsLayoutProvider === null &&
            processedReimbursementsDataProvider === null && processedReimbursementsLayoutProvider === null) {
            // all reimbursements data
            setDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(reimbursements));
            setLayoutProvider(new LayoutProvider(
                _ => 0,
                (_, dim) => {
                    dim.width = wp(100);
                    dim.height = hp(10);
                }
            ));
            // pending reimbursements data
            setPendingReimbursementsDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(pendingReimbursements));
            setPendingReimbursementsLayoutProvider(new LayoutProvider(
                _ => 0,
                (_, dim) => {
                    dim.width = wp(100);
                    dim.height = hp(10);
                }
            ));
            // pending reimbursements data
            setProcessedReimbursementsDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(processedReimbursements));
            setProcessedReimbursementsLayoutProvider(new LayoutProvider(
                _ => 0,
                (_, dim) => {
                    dim.width = wp(100);
                    dim.height = hp(10);
                }
            ));
        }
    }, [dataProvider, layoutProvider, reimbursements,
        pendingReimbursementsDataProvider, pendingReimbursementsLayoutProvider, pendingReimbursements,
        processedReimbursementsDataProvider, processedReimbursementsLayoutProvider, processedReimbursements]);

    /**
     * Function used to populate the rows containing reimbursements-related data.
     *
     * @param type row type to be passed in
     * @param data data to be passed in for the row
     *
     * @return a {@link React.JSX.Element} or an {@link Array} of {@link React.JSX.Element} representing the
     * React node and/or nodes containing reimbursements data.
     */
    const renderReimbursementData = useMemo(() => (_type: string | number, data: Reimbursement): React.JSX.Element | React.JSX.Element[] => {
        // switch based on the active summary state
        let reimbursementsData: Reimbursement[] = [];
        switch (activeSummaryState) {
            case "all":
                reimbursementsData = reimbursements;
                break;
            case "complete":
                reimbursementsData = processedReimbursements;
                break;
            case "ongoing":
                reimbursementsData = pendingReimbursements;
                break;
            default:
                break;
        }

        if (reimbursementsData !== undefined && reimbursementsData !== null && reimbursementsData.length !== 0) {
            return (
                <View
                    style={styles.reimbursementItemView}>
                    <List.Item
                        titleStyle={styles.reimbursementItemTitle}
                        descriptionStyle={styles.reimbursementDescription}
                        titleNumberOfLines={2}
                        descriptionNumberOfLines={2}
                        title={"Cashback"}
                        description={`${data.cardType}••••${data.cardLast4}\n\n${convertMSToTimeframe(Date.parse(new Date().toISOString()) - data.timestamp)}`}
                        left={() =>
                            <ExpoImage
                                style={styles.reimbursementMoonbeamLogo}
                                source={MoonbeamPiggyBank}
                                contentFit={'contain'}
                                transition={1000}
                                cachePolicy={'memory-disk'}
                            />
                        }
                        right={() =>
                            <View style={styles.reimbursementRightView}>
                                <View style={styles.reimbursementRightDetailsView}>
                                    <Text
                                        style={styles.reimbursementRightDetailTop}>{`$ ${data.amount.toFixed(2)}`}</Text>
                                    <Text
                                        style={styles.reimbursementRightDetailBottom}>{data.status}</Text>
                                </View>
                            </View>
                        }
                    />
                </View>
            );
        } else {
            return (
                <View
                    {...showReimbursementBottomSheet && {pointerEvents: "none"}}
                    style={[styles.noReimbursementsView, showReimbursementBottomSheet && {
                        backgroundColor: 'transparent',
                        opacity: 0.3
                    }]}>
                    <ExpoImage
                        style={styles.noReimbursementsImage}
                        source={activeSummaryState === 'all' ? MoonbeamCashback : MoonbeamNoReimbursements}
                        contentFit={'contain'}
                        transition={1000}
                        cachePolicy={'memory-disk'}
                    />
                    <Text style={styles.noReimbursementsText}>
                        {
                            activeSummaryState === 'all'
                                ? "You have not Cashed Out yet!"
                                : (activeSummaryState === 'ongoing'
                                    ? "No Pending Cashback available!"
                                    : "No Processed Cashback Available!"
                                )
                        }
                    </Text>
                </View>
            );
        }
    }, [reimbursements]);

    /**
     * return the component for the ReimbursementsSummary page
     */
    return (
        <>
            <TouchableOpacity
                style={styles.reimbursementSummaryMainView}
                activeOpacity={1}
                disabled={!showReimbursementBottomSheet}
                onPress={() => {
                    // reset the card choice dropdown value and open state
                    setCardChoiceDropdownValue("");
                    setIsCardChoiceDropdownOpen(false);

                    // close the bottom sheet
                    setShowReimbursementBottomSheet(false);
                }}
            >
                <View
                    {...showReimbursementBottomSheet && {pointerEvents: "none"}}
                    style={styles.reimbursementSummaryTab}>
                    <Text style={[styles.reimbursementSummaryTabTitle, showReimbursementBottomSheet && {
                        backgroundColor: 'transparent',
                        opacity: 0.3
                    }]}>
                        My Cashback
                    </Text>
                    <View
                        {...showReimbursementBottomSheet && {pointerEvents: "none"}}
                        style={[styles.reimbursementSummaryTabButtonView, showReimbursementBottomSheet && {
                            backgroundColor: 'transparent',
                            opacity: 0.3
                        }]}>
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
                {
                    ((reimbursements === undefined || reimbursements === null) || (reimbursements.length === 0)) && activeSummaryState === 'all' &&
                    <View
                        {...showReimbursementBottomSheet && {pointerEvents: "none"}}
                        style={[styles.noReimbursementsView, showReimbursementBottomSheet && {
                            backgroundColor: 'transparent',
                            opacity: 0.3
                        }]}>
                        <ExpoImage
                            style={styles.noReimbursementsImage}
                            source={MoonbeamCashback}
                            contentFit={'contain'}
                            transition={1000}
                            cachePolicy={'memory-disk'}
                        />
                        <Text style={styles.noReimbursementsText}>
                            You have not Cashed Out yet!
                        </Text>
                    </View>
                }
                {
                    reimbursements !== undefined && reimbursements !== null && reimbursements.length !== 0 && activeSummaryState === 'all' &&
                    <View
                        {...showReimbursementBottomSheet && {pointerEvents: "none"}}
                        style={[{flex: 1}, showReimbursementBottomSheet && {
                            backgroundColor: 'transparent',
                            opacity: 0.3
                        }]}>
                        <RecyclerListView
                            // @ts-ignore
                            ref={reimbursementsListView}
                            style={{
                                width: wp(100)
                            }}
                            layoutProvider={layoutProvider!}
                            dataProvider={dataProvider!}
                            rowRenderer={renderReimbursementData}
                            isHorizontal={false}
                            forceNonDeterministicRendering={true}
                            {
                                ...(Platform.OS === 'ios') ?
                                    {onEndReachedThreshold: 0} :
                                    {onEndReachedThreshold: 1}
                            }
                            scrollViewProps={{
                                pagingEnabled: "true",
                                decelerationRate: "fast",
                                snapToAlignment: "start",
                                persistentScrollbar: false,
                                showsVerticalScrollIndicator: false,
                            }}
                        />
                    </View>
                }
                {
                    ((pendingReimbursements === undefined || pendingReimbursements === null) || (pendingReimbursements.length === 0)) && activeSummaryState === 'ongoing' &&
                    <View
                        {...showReimbursementBottomSheet && {pointerEvents: "none"}}
                        style={[styles.noReimbursementsView, showReimbursementBottomSheet && {
                            backgroundColor: 'transparent',
                            opacity: 0.3
                        }]}>
                        <ExpoImage
                            style={styles.noReimbursementsImage}
                            source={MoonbeamNoReimbursements}
                            contentFit={'contain'}
                            transition={1000}
                            cachePolicy={'memory-disk'}
                        />
                        <Text style={styles.noReimbursementsText}>
                            No Pending Cashback available!
                        </Text>
                    </View>
                }
                {
                    pendingReimbursements !== undefined && pendingReimbursements !== null && pendingReimbursements.length !== 0 && activeSummaryState === 'ongoing' &&
                    <View
                        {...showReimbursementBottomSheet && {pointerEvents: "none"}}
                        style={[{flex: 1}, showReimbursementBottomSheet && {
                            backgroundColor: 'transparent',
                            opacity: 0.3
                        }]}>
                        <RecyclerListView
                            // @ts-ignore
                            ref={pendingReimbursementsListView}
                            style={{
                                width: wp(100)
                            }}
                            layoutProvider={pendingReimbursementsLayoutProvider!}
                            dataProvider={pendingReimbursementsDataProvider!}
                            rowRenderer={renderReimbursementData}
                            isHorizontal={false}
                            forceNonDeterministicRendering={true}
                            {
                                ...(Platform.OS === 'ios') ?
                                    {onEndReachedThreshold: 0} :
                                    {onEndReachedThreshold: 1}
                            }
                            scrollViewProps={{
                                pagingEnabled: "true",
                                decelerationRate: "fast",
                                snapToAlignment: "start",
                                persistentScrollbar: false,
                                showsVerticalScrollIndicator: false,
                            }}
                        />
                    </View>
                }
                {
                    ((processedReimbursements === undefined || processedReimbursements === null) || (processedReimbursements.length === 0)) && activeSummaryState === 'complete' &&
                    <View
                        {...showReimbursementBottomSheet && {pointerEvents: "none"}}
                        style={[styles.noReimbursementsView, showReimbursementBottomSheet && {
                            backgroundColor: 'transparent',
                            opacity: 0.3
                        }]}>
                        <ExpoImage
                            style={styles.noReimbursementsImage}
                            source={MoonbeamNoReimbursements}
                            contentFit={'contain'}
                            transition={1000}
                            cachePolicy={'memory-disk'}
                        />
                        <Text style={styles.noReimbursementsText}>
                            No Processed Cashback Available!
                        </Text>
                    </View>
                }
                {
                    processedReimbursements !== undefined && processedReimbursements !== null && processedReimbursements.length !== 0 && activeSummaryState === 'complete' &&
                    <View
                        {...showReimbursementBottomSheet && {pointerEvents: "none"}}
                        style={[{flex: 1}, showReimbursementBottomSheet && {
                            backgroundColor: 'transparent',
                            opacity: 0.3
                        }]}>
                        <RecyclerListView
                            // @ts-ignore
                            ref={processedReimbursementsListView}
                            style={{
                                width: wp(100)
                            }}
                            layoutProvider={processedReimbursementsLayoutProvider!}
                            dataProvider={processedReimbursementsDataProvider!}
                            rowRenderer={renderReimbursementData}
                            isHorizontal={false}
                            forceNonDeterministicRendering={true}
                            {
                                ...(Platform.OS === 'ios') ?
                                    {onEndReachedThreshold: 0} :
                                    {onEndReachedThreshold: 1}
                            }
                            scrollViewProps={{
                                pagingEnabled: "true",
                                decelerationRate: "fast",
                                snapToAlignment: "start",
                                persistentScrollbar: false,
                                showsVerticalScrollIndicator: false,
                            }}
                        />
                    </View>
                }
                <ReimbursementBottomSheet/>
            </TouchableOpacity>
        </>
    );
};

