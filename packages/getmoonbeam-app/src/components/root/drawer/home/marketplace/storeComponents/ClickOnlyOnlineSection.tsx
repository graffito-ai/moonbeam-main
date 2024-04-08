import React, {useEffect, useMemo, useRef, useState} from "react";
import {Platform, Text, TouchableOpacity, View} from "react-native";
import {ActivityIndicator, Card, Paragraph, Portal} from "react-native-paper";
import {styles} from "../../../../../../styles/store.module";
import {LoggingLevel, Offer, RewardType} from "@moonbeam/moonbeam-models";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {useRecoilState, useRecoilValue} from "recoil";
import {
    clickOnlyOnlineOffersListState,
    noClickOnlyOnlineOffersToLoadState,
    showClickOnlyBottomSheetState,
    storeOfferState,
    toggleViewPressedState,
    uniqueClickOnlyOnlineOffersListState,
    verticalSectionActiveState
} from "../../../../../../recoil/StoreOfferAtom";
import {Image} from 'expo-image';
// @ts-ignore
import MoonbeamPlaceholderImage from "../../../../../../../assets/art/moonbeam-store-placeholder.png";
import {DataProvider, LayoutProvider, RecyclerListView} from "recyclerlistview";
import {userIsAuthenticatedState} from "../../../../../../recoil/AuthAtom";
import {logEvent} from "../../../../../../utils/AppSync";
import {cardLinkingStatusState} from "../../../../../../recoil/AppDrawerAtom";
import {BlurView} from 'expo-blur';

/**
 * ClickOnlineSection component.
 *
 * @param props properties to be passed into the component
 * @constructor constructor for the component.
 */
export const ClickOnlyOnlineSection = (props: {
    retrieveClickOnlineOffersList: () => Promise<void>
}) => {
    // constants used to keep track of local component state
    const clickOnlyOnlineListView = useRef();
    const [horizontalListLoading, setHorizontalListLoading] = useState<boolean>(false);
    const [dataProvider, setDataProvider] = useState<DataProvider | null>(null);
    const [layoutProvider, setLayoutProvider] = useState<LayoutProvider | null>(null);
    const [clickOnlyOnlineOffersSpinnerShown, setClickOnlyOnlineOffersSpinnerShown] = useState<boolean>(false);
    // constants used to keep track of shared states
    const [userIsAuthenticated,] = useRecoilState(userIsAuthenticatedState);
    const [, setToggleViewPressed] = useRecoilState(toggleViewPressedState);
    const [, setWhichVerticalSectionActive] = useRecoilState(verticalSectionActiveState);
    const deDuplicatedClickOnlyOnlineOfferList = useRecoilValue(uniqueClickOnlyOnlineOffersListState);
    const [clickOnlyOnlineOfferList,] = useRecoilState(clickOnlyOnlineOffersListState);
    const [, setStoreOfferClicked] = useRecoilState(storeOfferState);
    const [noClickOnlyOnlineOffersToLoad,] = useRecoilState(noClickOnlyOnlineOffersToLoadState);
    const [, setShowClickOnlyBottomSheet] = useRecoilState(showClickOnlyBottomSheetState);
    const [isCardLinked,] = useRecoilState(cardLinkingStatusState);

    /**
     * Function used to populate the rows containing the click-only online offers data.
     *
     * @param type row type to be passed in
     * @param data data to be passed in for the row
     * @param index row index
     *
     * @return a {@link React.JSX.Element} or an {@link Array} of {@link React.JSX.Element} representing the
     * React node and/or nodes containing the click-only online offers.
     */
    const renderRowData = useMemo(() => (_type: string | number, data: Offer, index: number): React.JSX.Element | React.JSX.Element[] => {
        if (clickOnlyOnlineOfferList !== undefined && clickOnlyOnlineOfferList !== null && clickOnlyOnlineOfferList.length !== 0) {
            return (
                <>
                    <TouchableOpacity style={{left: '3%'}}
                                      onPress={() => {
                                          /**
                                           * if the user is card linked, then display the click only bottom sheet
                                           * otherwise, display the click only bottom sheet but with the appropriate params
                                           * to essentially highlight that offers cannot be viewed without a linked card.
                                           */
                                          if (!isCardLinked) {
                                              // show the click only bottom sheet
                                              setShowClickOnlyBottomSheet(true);
                                          } else {
                                              // set the clicked offer/partner accordingly
                                              setStoreOfferClicked(data);
                                              // show the click only bottom sheet
                                              setShowClickOnlyBottomSheet(true);
                                          }
                                      }}>
                        <Card style={styles.onlineOfferCard}>
                            <Card.Content>
                                <View style={{flexDirection: 'column'}}>
                                    <View style={styles.clickOnlyOnlineOfferCardCoverBackground}>
                                        <Image
                                            style={styles.clickOnlyOnlineOfferCardCover}
                                            source={{
                                                uri: data.brandLogoSm!
                                            }}
                                            placeholder={MoonbeamPlaceholderImage}
                                            placeholderContentFit={'contain'}
                                            contentFit={'contain'}
                                            transition={1000}
                                            cachePolicy={'memory-disk'}
                                        />
                                    </View>
                                    <Paragraph
                                        numberOfLines={1}
                                        style={styles.clickOnlyOnlineOfferCardTitle}>{data.brandDba}
                                    </Paragraph>
                                    {
                                        isCardLinked ?
                                            <Paragraph
                                                numberOfLines={1}
                                                style={styles.clickOnlyOnlineOfferCardSubtitle}>
                                                {data.reward!.type! === RewardType.RewardPercent
                                                    ? `${data.reward!.value}% Off`
                                                    : `$${data.reward!.value} Off`}
                                            </Paragraph>
                                            :
                                            <>
                                                <Paragraph
                                                    numberOfLines={1}
                                                    style={styles.clickOnlyOnlineOfferCardSubtitle}>
                                                    {data.reward!.type! === RewardType.RewardPercent
                                                        ? `${data.reward!.value}% Off`
                                                        : `$${data.reward!.value} Off`}
                                                </Paragraph>
                                                <BlurView intensity={15}
                                                          style={styles.unlinkedClickOnlyOnlineOfferCardSubtitle}/>
                                            </>
                                    }
                                </View>
                            </Card.Content>
                        </Card>
                        <View
                            style={{width: index === clickOnlyOnlineOfferList.length - 1 ? wp(10) : wp(5)}}/>
                    </TouchableOpacity>
                </>
            );
        } else {
            return (<></>);
        }
    }, [clickOnlyOnlineOfferList]);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // update the list data providers if we are loading more offers accordingly
        if (horizontalListLoading) {
            setDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(deDuplicatedClickOnlyOnlineOfferList));
            setHorizontalListLoading(false);
            setClickOnlyOnlineOffersSpinnerShown(false);

            // setTimeout(() => {
            //     setDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(deDuplicatedOnlineOfferList));
            //     setHorizontalListLoading(false);
            //     setOnlineOffersSpinnerShown(false);
            // }, 2000);
        }

        // populate the click-only online offer data provider and list view
        if (clickOnlyOnlineOfferList !== undefined && clickOnlyOnlineOfferList !== null &&
            clickOnlyOnlineOfferList.length > 0 && layoutProvider === null && dataProvider === null) {
            setDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(deDuplicatedClickOnlyOnlineOfferList));
            setLayoutProvider(new LayoutProvider(
                _ => 0,
                (_, dim) => {
                    dim.width = wp(33);
                    dim.height = hp(25);
                }
            ));
        }
    }, [dataProvider, layoutProvider, clickOnlyOnlineOfferList, horizontalListLoading]);

    // return the component for the ClickOnlyOnlineSection page
    return (
        <>
            <View
                style={styles.clickOnlyOnlineOffersView}>
                <View style={styles.onlineOffersTitleView}>
                    {/*<View style={styles.onlineOffersLeftTitleView}>*/}
                    {/*    <Text style={styles.onlineOffersTitleMain}>*/}
                    {/*        <Text style={styles.onlineOffersTitle}>*/}
                    {/*            Premier Brands*/}
                    {/*        </Text>*/}
                    {/*    </Text>*/}
                    {/*</View>*/}
                    <View style={{flexDirection: 'column', top: hp(1.5)}}>
                        {/*<Text*/}
                        {/*    style={[styles.clickOnlyOnlineOffersTitleSub, {left: wp(6)}]}>*/}
                        {/*    {`In-app shopping from top brands.`}*/}
                        {/*</Text>*/}
                        <TouchableOpacity onPress={() => {
                            setToggleViewPressed('vertical');
                            // set the active vertical section manually
                            setWhichVerticalSectionActive('click-only-online');
                        }}>
                            <Text style={styles.onlineOffersTitleButton}>
                                See All
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <Portal.Host>
                    <View style={{flexDirection: 'row', height: hp(30), width: wp(100)}}>
                        {
                            dataProvider !== null && layoutProvider !== null &&
                            <RecyclerListView
                                // @ts-ignore
                                ref={clickOnlyOnlineListView}
                                style={styles.clickOnlyOnlineOffersScrollView}
                                layoutProvider={layoutProvider!}
                                dataProvider={dataProvider!}
                                rowRenderer={renderRowData}
                                isHorizontal={true}
                                forceNonDeterministicRendering={true}
                                {
                                    ...(Platform.OS === 'ios') ?
                                        {onEndReachedThreshold: 0} :
                                        {onEndReachedThreshold: undefined}
                                }
                                onEndReached={async () => {
                                    const message = `End of list reached. Trying to refresh more items.`;
                                    console.log(message);
                                    await logEvent(message, LoggingLevel.Info, userIsAuthenticated);

                                    // if there are items to load
                                    if (!noClickOnlyOnlineOffersToLoad) {
                                        // set the loader
                                        setClickOnlyOnlineOffersSpinnerShown(true);
                                        // retrieving more click-only online offers
                                        await props.retrieveClickOnlineOffersList();
                                        setHorizontalListLoading(true);
                                        // this makes the scrolling seem infinite - we artificially scroll up a little, so we have enough time to load
                                        // @ts-ignore
                                        clickOnlyOnlineListView.current?.scrollToIndex(deDuplicatedClickOnlyOnlineOfferList.length - 2);
                                    } else {
                                        const message = `Maximum number of click-only online offers reached ${deDuplicatedClickOnlyOnlineOfferList.length}`;
                                        console.log(message);
                                        await logEvent(message, LoggingLevel.Info, userIsAuthenticated);

                                        setClickOnlyOnlineOffersSpinnerShown(false);
                                        setHorizontalListLoading(false);
                                    }
                                }}
                                scrollViewProps={{
                                    pagingEnabled: "true",
                                    decelerationRate: "fast",
                                    snapToInterval: Platform.OS === 'android' ? wp(33) * 3 : wp(33),
                                    snapToAlignment: "center",
                                    persistentScrollbar: false,
                                    showsHorizontalScrollIndicator: false
                                }}
                            />
                        }
                        {
                            horizontalListLoading || clickOnlyOnlineOffersSpinnerShown ?
                                <>
                                    <View
                                        style={{width: wp(90)}}/>
                                    <Card
                                        style={styles.clickOnlyOnlineLoadCard}>
                                        <Card.Content>
                                            <View style={{flexDirection: 'column'}}>
                                                <View style={{
                                                    flexDirection: 'row'
                                                }}>
                                                    <View style={{top: hp(3)}}>
                                                        <ActivityIndicator
                                                            style={{
                                                                right: wp(15)
                                                            }}
                                                            animating={true}
                                                            color={'#F2FF5D'}
                                                            size={hp(5)}
                                                        />

                                                    </View>
                                                </View>
                                            </View>
                                        </Card.Content>
                                    </Card>
                                </> : <></>
                        }
                    </View>
                </Portal.Host>
            </View>
        </>
    );
};
