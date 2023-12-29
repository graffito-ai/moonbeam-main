import React, {useEffect, useMemo, useRef, useState} from "react";
import {Platform, TouchableOpacity, View} from "react-native";
import {ActivityIndicator, Card, Paragraph, Portal, Text} from "react-native-paper";
import {styles} from "../../../../../../styles/store.module";
import {LoggingLevel, Offer, RewardType} from "@moonbeam/moonbeam-models";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {MarketplaceStackParamList} from "../../../../../../models/props/MarketplaceProps";
import {useRecoilState, useRecoilValue} from "recoil";
import {
    locationServicesButtonState,
    nearbyOffersListState,
    noOnlineOffersToLoadState, numberOfOnlineOffersState,
    onlineOffersListState,
    storeOfferState, toggleViewPressedState, uniqueOnlineOffersListState, verticalSectionActiveState
} from "../../../../../../recoil/StoreOfferAtom";
import {Image} from 'expo-image';
// @ts-ignore
import MoonbeamPlaceholderImage from "../../../../../../../assets/art/moonbeam-store-placeholder.png";
import {DataProvider, LayoutProvider, RecyclerListView} from "recyclerlistview";
import {userIsAuthenticatedState} from "../../../../../../recoil/AuthAtom";
import {logEvent} from "../../../../../../utils/AppSync";

/**
 * OnlineSection component.
 *
 * @param props properties to be passed into the component
 * @constructor constructor for the component.
 */
export const OnlineSection = (props: {
    navigation: NativeStackNavigationProp<MarketplaceStackParamList, 'Store'>,
    retrieveOnlineOffersList: () => Promise<void>,
    areNearbyOffersReady: boolean,
    locationServicesButton: boolean
}) => {
    // constants used to keep track of local component state
    const onlineListView = useRef();
    const [horizontalListLoading, setHorizontalListLoading] = useState<boolean>(false);
    const [dataProvider, setDataProvider] = useState<DataProvider | null>(null);
    const [layoutProvider, setLayoutProvider] = useState<LayoutProvider | null>(null);
    const [onlineOffersSpinnerShown, setOnlineOffersSpinnerShown] = useState<boolean>(false);
    // constants used to keep track of shared states
    const [userIsAuthenticated, ] = useRecoilState(userIsAuthenticatedState);
    const [numberOfOnlineOffers,] = useRecoilState(numberOfOnlineOffersState);
    const [locationServicesButton,] = useRecoilState(locationServicesButtonState);
    const [nearbyOfferList,] = useRecoilState(nearbyOffersListState);
    const [, setToggleViewPressed] = useRecoilState(toggleViewPressedState);
    const [, setWhichVerticalSectionActive] = useRecoilState(verticalSectionActiveState);
    const deDuplicatedOnlineOfferList = useRecoilValue(uniqueOnlineOffersListState);
    const [onlineOfferList,] = useRecoilState(onlineOffersListState);
    const [, setStoreOfferClicked] = useRecoilState(storeOfferState);
    const [noOnlineOffersToLoad,] = useRecoilState(noOnlineOffersToLoadState);

    /**
     * Function used to populate the rows containing the online offers data.
     *
     * @param type row type to be passed in
     * @param data data to be passed in for the row
     * @param index row index
     *
     * @return a {@link JSX.Element} or an {@link Array} of {@link JSX.Element} representing the
     * React node and/or nodes containing the online offers.
     */
    const renderRowData = useMemo(() => (_type: string | number, data: Offer, index: number): JSX.Element | JSX.Element[] => {
        if (onlineOfferList.length !== 0) {
            return (
                <TouchableOpacity style={{left: '3%'}}
                                  onPress={() => {
                                      // set the clicked offer/partner accordingly
                                      setStoreOfferClicked(data);
                                      // @ts-ignore
                                      props.navigation.navigate('StoreOffer', {});
                                  }}>
                    <Card style={styles.onlineOfferCard}>
                        <Card.Content>
                            <View style={{flexDirection: 'column'}}>
                                <View style={styles.onlineOfferCardCoverBackground}>
                                    <Image
                                        style={styles.onlineOfferCardCover}
                                        source={{
                                            uri: data.brandLogoSm!
                                        }}
                                        placeholder={MoonbeamPlaceholderImage}
                                        placeholderContentFit={'fill'}
                                        contentFit={'fill'}
                                        transition={1000}
                                        cachePolicy={'memory-disk'}
                                    />
                                </View>
                                <Paragraph
                                    numberOfLines={3}
                                    style={styles.onlineOfferCardTitle}>{data.brandDba}
                                </Paragraph>
                                <Paragraph
                                    style={styles.onlineOfferCardSubtitle}>
                                    {data.reward!.type! === RewardType.RewardPercent
                                        ? `${data.reward!.value}% Off`
                                        : `$${data.reward!.value} Off`}
                                </Paragraph>
                            </View>
                        </Card.Content>
                    </Card>
                    <View
                        style={{width: index === onlineOfferList.length - 1 ? wp(10) : wp(5)}}/>
                </TouchableOpacity>
            );
        } else {
            return (<></>);
        }
    }, [onlineOfferList]);

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
            setDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(deDuplicatedOnlineOfferList));
            setHorizontalListLoading(false);
            setOnlineOffersSpinnerShown(false);

            // setTimeout(() => {
            //     setDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(deDuplicatedOnlineOfferList));
            //     setHorizontalListLoading(false);
            //     setOnlineOffersSpinnerShown(false);
            // }, 2000);
        }

        // populate the online offer data provider and list view
        if (onlineOfferList.length > 0 && layoutProvider === null && dataProvider === null) {
            setDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(deDuplicatedOnlineOfferList));
            setLayoutProvider(new LayoutProvider(
                _ => 0,
                (_, dim) => {
                    dim.width = wp(33);
                    dim.height = hp(25);
                }
            ));
        }
    }, [dataProvider, layoutProvider, onlineOfferList, horizontalListLoading]);

    // return the component for the OnlineSection page
    return (
        <>
            <View
                style={[styles.onlineOffersView,
                    nearbyOfferList.length < 6 &&
                    {
                        height: hp(5),
                        bottom: hp(35)
                    },
                    locationServicesButton &&
                    {
                        height: hp(15),
                        bottom: hp(25)
                    }
                ]}>
                <View style={styles.onlineOffersTitleView}>
                    <View style={styles.onlineOffersLeftTitleView}>
                        <Text style={styles.onlineOffersTitleMain}>
                            <Text style={styles.onlineOffersTitle}>
                                Shop Online
                            </Text>
                            {/*{`   🛍️`}*/}
                        </Text>
                    </View>
                    <View style={{flexDirection: 'column', bottom: hp(3)}}>
                        <Text
                            style={[styles.onlineOffersTitleSub, {left: wp(6)}]}>
                            {`${numberOfOnlineOffers} online offers available`}
                        </Text>
                        <TouchableOpacity onPress={() => {
                            setToggleViewPressed('vertical');
                            // set the active vertical section manually
                            setWhichVerticalSectionActive('online');
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
                                ref={onlineListView}
                                style={styles.onlineOffersScrollView}
                                layoutProvider={layoutProvider!}
                                dataProvider={dataProvider!}
                                rowRenderer={renderRowData}
                                isHorizontal={true}
                                forceNonDeterministicRendering={true}
                                {
                                    ...(Platform.OS === 'ios') ?
                                        {onEndReachedThreshold: 0} :
                                        {onEndReachedThreshold: 1}
                                }
                                onEndReached={async () => {
                                    const errorMessage = `End of list reached. Trying to refresh more items.`;
                                    console.log(errorMessage);
                                    await logEvent(errorMessage, LoggingLevel.Info, userIsAuthenticated);

                                    // if there are items to load
                                    if (!noOnlineOffersToLoad) {
                                        // set the loader
                                        setOnlineOffersSpinnerShown(true);
                                        // retrieving more online offers
                                        await props.retrieveOnlineOffersList();
                                        setHorizontalListLoading(true);
                                        // this makes the scrolling seem infinite - we artificially scroll up a little, so we have enough time to load
                                        // @ts-ignore
                                        onlineListView.current?.scrollToIndex(deDuplicatedOnlineOfferList.length - 2);
                                    } else {
                                        const errorMessage = `Maximum number of online offers reached ${deDuplicatedOnlineOfferList.length}`;
                                        console.log(errorMessage);
                                        await logEvent(errorMessage, LoggingLevel.Info, userIsAuthenticated);

                                        setOnlineOffersSpinnerShown(false);
                                        setHorizontalListLoading(false);
                                    }
                                }}
                                scrollViewProps={{
                                    pagingEnabled: "true",
                                    decelerationRate: "fast",
                                    snapToInterval: Platform.OS === 'android' ?  wp(33) * 3 : wp(33),
                                    snapToAlignment: "center",
                                    persistentScrollbar: false,
                                    showsHorizontalScrollIndicator: false
                                }}
                            />
                        }
                        {
                            horizontalListLoading || onlineOffersSpinnerShown ?
                                <>
                                    <View
                                        style={{width: wp(100)}}/>
                                    <Card
                                        style={styles.onlineLoadCard}>
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
