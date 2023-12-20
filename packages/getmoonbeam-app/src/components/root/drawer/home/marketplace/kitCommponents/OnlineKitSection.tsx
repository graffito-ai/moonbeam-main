import React, {useEffect, useMemo, useRef, useState} from 'react';
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {MarketplaceStackParamList} from "../../../../../../models/props/MarketplaceProps";
import {Platform, TouchableOpacity, View} from "react-native";
import {styles} from '../../../../../../styles/kit.module';
import {ActivityIndicator, Card, List, Text} from "react-native-paper";
import {useRecoilState, useRecoilValue} from "recoil";
import {
    currentActiveKitState,
    fidelisPartnerListState,
    nearbyKitListIsExpandedState,
    noNearbyKitOffersAvailableState,
    noOnlineElectronicsCategorizedOffersToLoadState,
    noOnlineEntertainmentCategorizedOffersToLoadState,
    noOnlineFoodCategorizedOffersToLoadState,
    noOnlineHealthAndBeautyCategorizedOffersToLoadState,
    noOnlineHomeCategorizedOffersToLoadState,
    noOnlineOfficeAndBusinessCategorizedOffersToLoadState,
    noOnlineRetailCategorizedOffersToLoadState,
    noOnlineServicesAndSubscriptionsCategorizedOffersToLoadState,
    noOnlineVeteransDayCategorizedOffersToLoadState,
    onlineElectronicsCategorizedOfferListState,
    onlineElectronicsCategorizedOffersPageNumberState,
    onlineEntertainmentCategorizedOfferListState,
    onlineEntertainmentCategorizedOffersPageNumberState,
    onlineFoodCategorizedOfferListState,
    onlineFoodCategorizedOffersPageNumberState,
    onlineHealthAndBeautyCategorizedOfferListState,
    onlineHealthAndBeautyCategorizedOffersPageNumberState,
    onlineHomeCategorizedOfferListState,
    onlineHomeCategorizedOffersPageNumberState,
    onlineKitListIsExpandedState,
    onlineOfficeAndBusinessCategorizedOfferListState,
    onlineOfficeAndBusinessCategorizedOffersPageNumberState,
    onlineRetailCategorizedOfferListState,
    onlineRetailCategorizedOffersPageNumberState,
    onlineServicesAndSubscriptionsCategorizedOfferListState,
    onlineServicesAndSubscriptionsCategorizedOffersPageNumberState,
    onlineVeteransDayCategorizedOfferListState,
    onlineVeteransDayCategorizedOffersPageNumberState, showClickOnlyBottomSheetState,
    storeOfferState,
    uniqueOnlineElectronicsOffersListState,
    uniqueOnlineEntertainmentOffersListState,
    uniqueOnlineFoodOffersListState,
    uniqueOnlineHealthAndBeautyOffersListState,
    uniqueOnlineHomeOffersListState,
    uniqueOnlineOfficeAndBusinessOffersListState,
    uniqueOnlineRetailOffersListState,
    uniqueOnlineServicesAndSubscriptionsOffersListState,
    uniqueOnlineVeteransDayOffersListState
} from "../../../../../../recoil/StoreOfferAtom";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {DataProvider, LayoutProvider, RecyclerListView} from "recyclerlistview";
import {Offer, OfferCategory, RedemptionType, RewardType} from '@moonbeam/moonbeam-models';
import {Image} from "expo-image";
// @ts-ignore
import MoonbeamPlaceholderImage from "../../../../../../../assets/art/moonbeam-store-placeholder.png";
import {moonbeamKits} from "../storeComponents/KitsSection";
import {retrieveCategorizedOnlineOffersList} from "../../../../../../utils/AppSync";
// @ts-ignore
import MoonbeamNoOffersKit from "../../../../../../../assets/art/moonbeam-no-offers-kit.png";

/**
 * OnlineKitSection component.
 *
 * @param props properties to be passed into the component
 * @constructor constructor for the component.
 */
export const OnlineKitSection = (props: {
    navigation: NativeStackNavigationProp<MarketplaceStackParamList, 'Kit'>
}) => {
    // constants used to keep track of local component state
    const onlineListView = useRef();
    const [kitName, setKitName] = useState<string>('Kit');
    const [numberOfOnlineOffers, setNumberOfOnlineOffers] = useState<number>(0);
    const [noOnlineOffersToLoad, setNoOnlineOffersToLoad] = useState<boolean | null>(null);
    const [onlineOfferList, setOnlineOfferList] = useState<Offer[]>([]);
    const [deDuplicatedOnlineOfferList, setDeduplicatedOnlineOfferList] = useState<Offer[]>([]);
    const [verticalListLoading, setVerticalListLoading] = useState<boolean>(false);
    const [onlineOffersSpinnerShown, setOnlineOffersSpinnerShown] = useState<boolean>(false);
    const [dataProvider, setDataProvider] = useState<DataProvider | null>(null);
    const [layoutProvider, setLayoutProvider] = useState<LayoutProvider | null>(null);
    // constants used to keep track of shared states
    const [, setShowClickOnlyBottomSheet] = useRecoilState(showClickOnlyBottomSheetState);
    const [onlineKitListExpanded, setIsOnlineKitListExpanded] = useRecoilState(onlineKitListIsExpandedState);
    const [nearbyKitListExpanded, setNearbyKitListExpanded] = useRecoilState(nearbyKitListIsExpandedState);
    const [, setStoreOfferClicked] = useRecoilState(storeOfferState);
    const [fidelisPartnerList,] = useRecoilState(fidelisPartnerListState);
    const [currentActiveKit,] = useRecoilState(currentActiveKitState);
    const [onlineVeteransDayCategorizedPageNumber, setOnlineVeteransDayCategorizedPageNumber] = useRecoilState(onlineVeteransDayCategorizedOffersPageNumberState);
    const [onlineFoodCategorizedPageNumber, setOnlineFoodCategorizedPageNumber] = useRecoilState(onlineFoodCategorizedOffersPageNumberState);
    const [onlineRetailCategorizedPageNumber, setOnlineRetailCategorizedPageNumber] = useRecoilState(onlineRetailCategorizedOffersPageNumberState);
    const [onlineEntertainmentCategorizedPageNumber, setOnlineEntertainmentCategorizedPageNumber] = useRecoilState(onlineEntertainmentCategorizedOffersPageNumberState);
    const [onlineElectronicsCategorizedPageNumber, setOnlineElectronicsCategorizedPageNumber] = useRecoilState(onlineElectronicsCategorizedOffersPageNumberState);
    const [onlineHomeCategorizedPageNumber, setOnlineHomeCategorizedPageNumber] = useRecoilState(onlineHomeCategorizedOffersPageNumberState);
    const [onlineHealthAndBeautyCategorizedPageNumber, setOnlineHealthAndBeautyCategorizedPageNumber] = useRecoilState(onlineHealthAndBeautyCategorizedOffersPageNumberState);
    const [onlineOfficeAndBusinessCategorizedPageNumber, setOnlineOfficeAndBusinessCategorizedPageNumber] = useRecoilState(onlineOfficeAndBusinessCategorizedOffersPageNumberState);
    const [onlineServicesAndSubscriptionsCategorizedPageNumber, setOnlineServicesAndSubscriptionsCategorizedPageNumber] = useRecoilState(onlineServicesAndSubscriptionsCategorizedOffersPageNumberState);
    const [noOnlineVeteransDayCategorizedOffersToLoad, setNoOnlineVeteransDayCategorizedOffersToLoad] = useRecoilState(noOnlineVeteransDayCategorizedOffersToLoadState);
    const [noOnlineFoodCategorizedOffersToLoad, setNoOnlineFoodCategorizedOffersToLoad] = useRecoilState(noOnlineFoodCategorizedOffersToLoadState);
    const [noOnlineRetailCategorizedOffersToLoad, setNoOnlineRetailCategorizedOffersToLoad] = useRecoilState(noOnlineRetailCategorizedOffersToLoadState);
    const [noOnlineEntertainmentCategorizedOffersToLoad, setNoOnlineEntertainmentCategorizedOffersToLoad] = useRecoilState(noOnlineEntertainmentCategorizedOffersToLoadState);
    const [noOnlineElectronicsCategorizedOffersToLoad, setNoOnlineElectronicsCategorizedOffersToLoad] = useRecoilState(noOnlineElectronicsCategorizedOffersToLoadState);
    const [noOnlineHomeCategorizedOffersToLoad, setNoOnlineHomeCategorizedOffersToLoad] = useRecoilState(noOnlineHomeCategorizedOffersToLoadState);
    const [noOnlineHealthAndBeautyCategorizedOffersToLoad, setNoOnlineHealthAndBeautyCategorizedOffersToLoad] = useRecoilState(noOnlineHealthAndBeautyCategorizedOffersToLoadState);
    const [noOnlineOfficeAndBusinessCategorizedOffersToLoad, setNoOnlineOfficeAndBusinessCategorizedOffersToLoad] = useRecoilState(noOnlineOfficeAndBusinessCategorizedOffersToLoadState);
    const [noOnlineServicesAndSubscriptionsCategorizedOffersToLoad, setNoOnlineServicesAndSubscriptionsCategorizedOffersToLoad] = useRecoilState(noOnlineServicesAndSubscriptionsCategorizedOffersToLoadState);
    const uniqueOnlineVeteransDayOffersList = useRecoilValue(uniqueOnlineVeteransDayOffersListState);
    const [onlineVeteransDayCategorizedOfferList, setOnlineVeteransDayCategorizedOfferList] = useRecoilState(onlineVeteransDayCategorizedOfferListState);
    const uniqueOnlineFoodOffersList = useRecoilValue(uniqueOnlineFoodOffersListState);
    const [onlineFoodCategorizedOfferList, setOnlineFoodCategorizedOfferList] = useRecoilState(onlineFoodCategorizedOfferListState);
    const uniqueOnlineRetailOffersList = useRecoilValue(uniqueOnlineRetailOffersListState);
    const [onlineRetailCategorizedOfferList, setOnlineRetailCategorizedOfferList] = useRecoilState(onlineRetailCategorizedOfferListState);
    const uniqueOnlineEntertainmentOffersList = useRecoilValue(uniqueOnlineEntertainmentOffersListState);
    const [onlineEntertainmentCategorizedOfferList, setOnlineEntertainmentCategorizedOfferList] = useRecoilState(onlineEntertainmentCategorizedOfferListState);
    const uniqueOnlineElectronicsOffersList = useRecoilValue(uniqueOnlineElectronicsOffersListState);
    const [onlineElectronicsCategorizedOfferList, setOnlineElectronicsCategorizedOfferList] = useRecoilState(onlineElectronicsCategorizedOfferListState);
    const uniqueOnlineHomeOffersList = useRecoilValue(uniqueOnlineHomeOffersListState);
    const [onlineHomeCategorizedOfferList, setOnlineHomeCategorizedOfferList] = useRecoilState(onlineHomeCategorizedOfferListState);
    const uniqueOnlineHealthAndBeautyOffersList = useRecoilValue(uniqueOnlineHealthAndBeautyOffersListState);
    const [onlineHealthAndBeautyCategorizedOfferList, setOnlineHealthAndBeautyCategorizedOfferList] = useRecoilState(onlineHealthAndBeautyCategorizedOfferListState);
    const uniqueOnlineOfficeAndBusinessOffersList = useRecoilValue(uniqueOnlineOfficeAndBusinessOffersListState);
    const [onlineOfficeAndBusinessCategorizedOfferList, setOnlineOfficeAndBusinessCategorizedOfferList] = useRecoilState(onlineOfficeAndBusinessCategorizedOfferListState);
    const uniqueOnlineServicesAndSubscriptionsOffersList = useRecoilValue(uniqueOnlineServicesAndSubscriptionsOffersListState);
    const [onlineServicesAndSubscriptionsCategorizedOfferList, setOnlineServicesAndSubscriptionsCategorizedOfferList] = useRecoilState(onlineServicesAndSubscriptionsCategorizedOfferListState);
    const [noNearbyKitOffersAvailable,] = useRecoilState(noNearbyKitOffersAvailableState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // set the kit title, according to the user selected option
        if (currentActiveKit !== null) {
            if (kitName === 'Kit') {
                const filteredKit = moonbeamKits.filter(kit => kit.type === currentActiveKit);
                filteredKit.length === 1 && setKitName(filteredKit[0].secondaryTitle.toString());
            }

            // set the online offer list, according to the type of kit that's active
            switch (currentActiveKit as OfferCategory) {
                case OfferCategory.VeteranDay:
                    setDeduplicatedOnlineOfferList(uniqueOnlineVeteransDayOffersList);
                    setOnlineOfferList(onlineVeteransDayCategorizedOfferList);
                    setNoOnlineOffersToLoad(noOnlineVeteransDayCategorizedOffersToLoad);
                    break;
                case OfferCategory.Food:
                    setDeduplicatedOnlineOfferList(uniqueOnlineFoodOffersList);
                    setOnlineOfferList(onlineFoodCategorizedOfferList);
                    setNoOnlineOffersToLoad(noOnlineFoodCategorizedOffersToLoad);
                    break;
                case OfferCategory.Retail:
                    setDeduplicatedOnlineOfferList(uniqueOnlineRetailOffersList);
                    setOnlineOfferList(onlineRetailCategorizedOfferList);
                    setNoOnlineOffersToLoad(noOnlineRetailCategorizedOffersToLoad);
                    break;
                case OfferCategory.Entertainment:
                    setDeduplicatedOnlineOfferList(uniqueOnlineEntertainmentOffersList);
                    setOnlineOfferList(onlineEntertainmentCategorizedOfferList);
                    setNoOnlineOffersToLoad(noOnlineEntertainmentCategorizedOffersToLoad);
                    break;
                case OfferCategory.Electronics:
                    setDeduplicatedOnlineOfferList(uniqueOnlineElectronicsOffersList);
                    setOnlineOfferList(onlineElectronicsCategorizedOfferList);
                    setNoOnlineOffersToLoad(noOnlineElectronicsCategorizedOffersToLoad);
                    break;
                case OfferCategory.Home:
                    setDeduplicatedOnlineOfferList(uniqueOnlineHomeOffersList);
                    setOnlineOfferList(onlineHomeCategorizedOfferList);
                    setNoOnlineOffersToLoad(noOnlineHomeCategorizedOffersToLoad);
                    break;
                case OfferCategory.HealthAndBeauty:
                    setDeduplicatedOnlineOfferList(uniqueOnlineHealthAndBeautyOffersList);
                    setOnlineOfferList(onlineHealthAndBeautyCategorizedOfferList);
                    setNoOnlineOffersToLoad(noOnlineHealthAndBeautyCategorizedOffersToLoad);
                    break;
                case OfferCategory.OfficeAndBusiness:
                    setDeduplicatedOnlineOfferList(uniqueOnlineOfficeAndBusinessOffersList);
                    setOnlineOfferList(onlineOfficeAndBusinessCategorizedOfferList);
                    setNoOnlineOffersToLoad(noOnlineOfficeAndBusinessCategorizedOffersToLoad);
                    break;
                case OfferCategory.ServicesAndSubscriptions:
                    setDeduplicatedOnlineOfferList(uniqueOnlineServicesAndSubscriptionsOffersList);
                    setOnlineOfferList(onlineServicesAndSubscriptionsCategorizedOfferList);
                    setNoOnlineOffersToLoad(noOnlineServicesAndSubscriptionsCategorizedOffersToLoad);
                    break;
                default:
                    break;
            }
        }

        // for the Veterans Day kit list should be expanded
        if (currentActiveKit === OfferCategory.VeteranDay && !onlineKitListExpanded) {
            setIsOnlineKitListExpanded(true);
        }

        // update the list data providers if we are loading more offers accordingly
        if (verticalListLoading && onlineKitListExpanded) {
            setDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(deDuplicatedOnlineOfferList));
            setVerticalListLoading(false);
            setOnlineOffersSpinnerShown(false);
        }
        // populate the online offer data provider and list view
        if ((onlineOfferList && onlineOfferList.length > 0 && layoutProvider === null && dataProvider === null)) {
            setDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(
                currentActiveKit === OfferCategory.VeteranDay
                    ? deDuplicatedOnlineOfferList
                    : deDuplicatedOnlineOfferList.slice(0, 2))
            );
            setLayoutProvider(new LayoutProvider(
                _ => 0,
                (_, dim) => {
                    dim.width = wp(33);
                    dim.height = hp(25);
                }
            ));
        }
    }, [currentActiveKit, dataProvider, layoutProvider, deDuplicatedOnlineOfferList, verticalListLoading,
        uniqueOnlineVeteransDayOffersList, uniqueOnlineFoodOffersList, uniqueOnlineRetailOffersList, uniqueOnlineEntertainmentOffersList,
        uniqueOnlineElectronicsOffersList, uniqueOnlineHomeOffersList, uniqueOnlineHealthAndBeautyOffersList, uniqueOnlineOfficeAndBusinessOffersList,
        uniqueOnlineServicesAndSubscriptionsOffersList, onlineVeteransDayCategorizedOfferList, onlineFoodCategorizedOfferList, onlineRetailCategorizedOfferList,
        onlineEntertainmentCategorizedOfferList, onlineElectronicsCategorizedOfferList, onlineHomeCategorizedOfferList, onlineHealthAndBeautyCategorizedOfferList,
        onlineOfficeAndBusinessCategorizedOfferList, onlineServicesAndSubscriptionsCategorizedOfferList
    ]);

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
    const renderOnlineRowData = useMemo(() => (_type: string | number, data: Offer, index: number): JSX.Element | JSX.Element[] => {
        // flag to determine whether there are any offers shown at all - so we can display the empty message otherwise
        let offersShown = false;

        // offer listing
        if (deDuplicatedOnlineOfferList.length !== 0) {
            offersShown = true;
            return (
                <>
                    {
                        index === 0
                            ?
                            <>
                                <View style={{flexDirection: 'column'}}>
                                    <Card style={styles.kitOfferCard}
                                          onPress={() => {
                                              // set the clicked offer/partner accordingly
                                              if (currentActiveKit === OfferCategory.VeteranDay) {
                                                  setStoreOfferClicked(fidelisPartnerList.filter(fidelisPartner => fidelisPartner.brandName === data.brandDba)[0]);
                                                  // @ts-ignore
                                                  props.navigation.navigate('StoreOffer', {});
                                              } else {
                                                  // for click-only offers do not navigate anywhere, just open the bottom sheet
                                                  if (data.redemptionType === RedemptionType.Click) {
                                                      setStoreOfferClicked(data);
                                                      setShowClickOnlyBottomSheet(true);
                                                  } else {
                                                      setStoreOfferClicked(data);
                                                      // @ts-ignore
                                                      props.navigation.navigate('StoreOffer', {});
                                                  }
                                              }
                                          }}>
                                        <Card.Content>
                                            <List.Icon color={'#F2FF5D'}
                                                       icon="chevron-right"
                                                       style={{alignSelf: 'flex-end', top: hp(1.5)}}/>
                                            <View style={{flexDirection: 'row', bottom: hp(1.5)}}>
                                                <View style={styles.kitOfferLogoBackground}>
                                                    <Image
                                                        style={styles.kitOfferLogo}
                                                        source={{
                                                            uri: data.brandLogoSm!,
                                                        }}
                                                        placeholder={MoonbeamPlaceholderImage}
                                                        placeholderContentFit={'contain'}
                                                        contentFit={'contain'}
                                                        transition={1000}
                                                        cachePolicy={'none'}
                                                    />
                                                </View>
                                                <View style={{flexDirection: 'column', bottom: hp(1.5)}}>
                                                    <Text numberOfLines={2}
                                                          style={styles.kitOfferName}>{data.brandDba}</Text>
                                                    <Text numberOfLines={2} style={styles.kitOfferBenefitsView}>
                                                        <Text style={styles.kitOfferBenefit}>
                                                            {data.reward!.type! === RewardType.RewardPercent
                                                                ? `${data.reward!.value}%`
                                                                : `$${data.reward!.value}`}
                                                        </Text>
                                                        {
                                                            currentActiveKit === OfferCategory.VeteranDay
                                                                ? " Off 🇺🇸"
                                                                : " Off "
                                                        }
                                                    </Text>
                                                </View>
                                            </View>
                                        </Card.Content>
                                    </Card>
                                </View>
                            </>
                            :
                            <Card
                                style={[styles.kitOfferCard, !onlineKitListExpanded && index === 1 && {bottom: hp(1.5)}]}
                                onPress={() => {
                                    // set the clicked offer/partner accordingly
                                    if (currentActiveKit === OfferCategory.VeteranDay) {
                                        setStoreOfferClicked(fidelisPartnerList.filter(fidelisPartner => fidelisPartner.brandName === data.brandDba)[0]);
                                        // @ts-ignore
                                        props.navigation.navigate('StoreOffer', {});
                                    } else {
                                        // for click-only offers do not navigate anywhere, just open the bottom sheet
                                        if (data.redemptionType === RedemptionType.Click) {
                                            setStoreOfferClicked(data);
                                            setShowClickOnlyBottomSheet(true);
                                        } else {
                                            setStoreOfferClicked(data);
                                            // @ts-ignore
                                            props.navigation.navigate('StoreOffer', {});
                                        }
                                    }
                                }}>
                                <Card.Content>
                                    <List.Icon color={'#F2FF5D'}
                                               icon="chevron-right"
                                               style={{alignSelf: 'flex-end', top: hp(1.5)}}/>
                                    <View style={{flexDirection: 'row', bottom: hp(1.5)}}>
                                        <View style={styles.kitOfferLogoBackground}>
                                            <Image
                                                style={styles.kitOfferLogo}
                                                source={{
                                                    uri: data.brandLogoSm!,
                                                }}
                                                placeholder={MoonbeamPlaceholderImage}
                                                placeholderContentFit={'contain'}
                                                contentFit={'contain'}
                                                transition={1000}
                                                cachePolicy={'none'}
                                            />
                                        </View>
                                        <View style={{flexDirection: 'column', bottom: hp(1.5)}}>
                                            <Text numberOfLines={2}
                                                  style={styles.kitOfferName}>{data.brandDba}</Text>
                                            <Text numberOfLines={2} style={styles.kitOfferBenefitsView}>
                                                <Text style={styles.kitOfferBenefit}>
                                                    {data.reward!.type! === RewardType.RewardPercent
                                                        ? `${data.reward!.value}%`
                                                        : `$${data.reward!.value}`}
                                                </Text>
                                                {
                                                    currentActiveKit === OfferCategory.VeteranDay
                                                        ? " Off 🇺🇸"
                                                        : " Off "
                                                }
                                            </Text>
                                        </View>
                                    </View>
                                </Card.Content>
                            </Card>
                    }
                </>
            )
        }

        // filtered no offers to be displayed
        if (!offersShown) {
            return (
                <Card style={styles.kitOfferCard}>
                    <Card.Content>
                        <View style={{flexDirection: 'row'}}>
                            <Text
                                style={[styles.kitNoOffersName, {color: '#F2FF5D'}]}>{`No Online ${kitName} Offers Available`}</Text>
                        </View>
                    </Card.Content>
                </Card>
            )
        }

        return (<></>);
    }, [onlineOfferList, deDuplicatedOnlineOfferList]);

    // return the component for the OnlineKitSection page
    return (
        <>
            {
                <View style={[
                    styles.kitOffersView,
                    !onlineKitListExpanded ? {height: hp(30)} : {height: hp(100)},
                    nearbyKitListExpanded && {display: 'none'},
                    noNearbyKitOffersAvailable && !onlineKitListExpanded && {marginBottom: hp(18)}]}>
                    {
                        <>
                            <View style={styles.kitOffersTitleView}>
                                {
                                    currentActiveKit !== null && currentActiveKit !== OfferCategory.VeteranDay &&
                                    <>
                                        <Text style={styles.kitOffersTitleMain}>
                                            {`Online Offers`}
                                        </Text>
                                        <TouchableOpacity
                                            style={styles.moreButton}
                                            onPress={() => {
                                                console.log('button pressed');
                                                if (!onlineKitListExpanded) {
                                                    // display all offers loaded in the list
                                                    setVerticalListLoading(true);
                                                    setNearbyKitListExpanded(false);
                                                    setIsOnlineKitListExpanded(true);
                                                } else {
                                                    setDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(deDuplicatedOnlineOfferList.slice(0, 2)));
                                                    setLayoutProvider(new LayoutProvider(
                                                        _ => 0,
                                                        (_, dim) => {
                                                            dim.width = wp(33);
                                                            dim.height = hp(25);
                                                        }
                                                    ));
                                                    setVerticalListLoading(false);
                                                    setOnlineOffersSpinnerShown(false);
                                                    setIsOnlineKitListExpanded(false);
                                                }
                                            }}
                                        >
                                            <Text
                                                style={styles.moreButtonText}>{onlineKitListExpanded ? 'See Less' : 'See All'}</Text>
                                        </TouchableOpacity>
                                    </>
                                }
                            </View>
                            {
                                !deDuplicatedOnlineOfferList || !onlineOfferList ||
                                deDuplicatedOnlineOfferList.length === 0 || onlineOfferList.length === 0 ?
                                    <>
                                        <Card
                                            style={[styles.nearbyLoadingOfferCard, currentActiveKit !== null && currentActiveKit === OfferCategory.VeteranDay && {
                                                top: hp(7),
                                                left: wp(8)
                                            }]}>
                                            <Card.Content>
                                                <View
                                                    style={[styles.locationServicesEnableView, {height: hp(23)}]}>
                                                    <Image
                                                        style={styles.noOffersKitImage}
                                                        source={MoonbeamNoOffersKit}
                                                        contentFit={'contain'}
                                                        cachePolicy={'memory-disk'}
                                                    />
                                                    <Text
                                                        style={[styles.locationServicesEnableWarningMessage, {
                                                            color: '#F2FF5D',
                                                            fontSize: hp(2.2),
                                                            top: hp(1)
                                                        }]}>
                                                        {`No ${kitName} online offers!`}
                                                    </Text>
                                                </View>
                                            </Card.Content>
                                        </Card>
                                    </>
                                    :
                                    dataProvider !== null && layoutProvider !== null &&
                                    <RecyclerListView
                                        // @ts-ignore
                                        ref={onlineListView}
                                        style={[{
                                            width: wp(100),
                                            right: wp(1),
                                            flexGrow: 1
                                        }, currentActiveKit === OfferCategory.VeteranDay && {
                                            marginTop: hp(8)
                                        }]}
                                        layoutProvider={layoutProvider!}
                                        dataProvider={dataProvider!}
                                        rowRenderer={renderOnlineRowData}
                                        isHorizontal={false}
                                        forceNonDeterministicRendering={true}
                                        renderFooter={() => {
                                            return (
                                                onlineOffersSpinnerShown && onlineKitListExpanded ?
                                                    <>
                                                        <View
                                                            style={{
                                                                width: wp(100),
                                                                alignSelf: 'center'
                                                            }}/>
                                                        <Card
                                                            style={[styles.loadCard,
                                                                {
                                                                    width: wp(100),
                                                                    height: hp(10),
                                                                    bottom: hp(2)
                                                                }
                                                            ]}>
                                                            <Card.Content>
                                                                <View style={{flexDirection: 'column'}}>
                                                                    <View style={{
                                                                        flexDirection: 'row'
                                                                    }}>
                                                                        <View>
                                                                            <ActivityIndicator
                                                                                style={{
                                                                                    alignSelf: 'center',
                                                                                    top: hp(2),
                                                                                    left: wp(40)
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
                                            )
                                        }}
                                        {
                                            ...(Platform.OS === 'ios') ?
                                                {onEndReachedThreshold: 0} :
                                                {onEndReachedThreshold: 1}
                                        }
                                        onEndReached={async () => {
                                            console.log(`End of list reached. Trying to refresh more items.`);

                                            // if there are items to load
                                            if (onlineKitListExpanded && !noOnlineOffersToLoad && currentActiveKit !== null) {
                                                // set the loader
                                                setOnlineOffersSpinnerShown(true);
                                                // retrieving more online offers
                                                switch (currentActiveKit as OfferCategory) {
                                                    case OfferCategory.VeteranDay:
                                                        const additionalVeteransDayOffersToLoad = await retrieveCategorizedOnlineOffersList(numberOfOnlineOffers, setNumberOfOnlineOffers,
                                                            currentActiveKit, onlineVeteransDayCategorizedPageNumber, setOnlineVeteransDayCategorizedPageNumber)
                                                        setOnlineVeteransDayCategorizedOfferList(oldOnlineOffers => {
                                                            return [...oldOnlineOffers, ...additionalVeteransDayOffersToLoad]
                                                        });
                                                        additionalVeteransDayOffersToLoad.length === 0 && setNoOnlineVeteransDayCategorizedOffersToLoad(true);
                                                        break;
                                                    case OfferCategory.Food:
                                                        const additionalFoodOffersToLoad = await retrieveCategorizedOnlineOffersList(numberOfOnlineOffers, setNumberOfOnlineOffers,
                                                            currentActiveKit, onlineFoodCategorizedPageNumber, setOnlineFoodCategorizedPageNumber)
                                                        setOnlineFoodCategorizedOfferList(oldOnlineOffers => {
                                                            return [...oldOnlineOffers, ...additionalFoodOffersToLoad]
                                                        });
                                                        additionalFoodOffersToLoad.length === 0 && setNoOnlineFoodCategorizedOffersToLoad(true);
                                                        break;
                                                    case OfferCategory.Retail:
                                                        const additionalRetailOffersToLoad = await retrieveCategorizedOnlineOffersList(numberOfOnlineOffers, setNumberOfOnlineOffers,
                                                            currentActiveKit, onlineRetailCategorizedPageNumber, setOnlineRetailCategorizedPageNumber)
                                                        setOnlineRetailCategorizedOfferList(oldOnlineOffers => {
                                                            return [...oldOnlineOffers, ...additionalRetailOffersToLoad]
                                                        });
                                                        additionalRetailOffersToLoad.length === 0 && setNoOnlineRetailCategorizedOffersToLoad(true);
                                                        break;
                                                    case OfferCategory.Entertainment:
                                                        const additionalEntertainmentOffersToLoad = await retrieveCategorizedOnlineOffersList(numberOfOnlineOffers, setNumberOfOnlineOffers,
                                                            currentActiveKit, onlineEntertainmentCategorizedPageNumber, setOnlineEntertainmentCategorizedPageNumber)
                                                        setOnlineEntertainmentCategorizedOfferList(oldOnlineOffers => {
                                                            return [...oldOnlineOffers, ...additionalEntertainmentOffersToLoad]
                                                        });
                                                        additionalEntertainmentOffersToLoad.length === 0 && setNoOnlineEntertainmentCategorizedOffersToLoad(true);
                                                        break;
                                                    case OfferCategory.Electronics:
                                                        const additionalElectronicsOffersToLoad = await retrieveCategorizedOnlineOffersList(numberOfOnlineOffers, setNumberOfOnlineOffers,
                                                            currentActiveKit, onlineElectronicsCategorizedPageNumber, setOnlineElectronicsCategorizedPageNumber)
                                                        setOnlineElectronicsCategorizedOfferList(oldOnlineOffers => {
                                                            return [...oldOnlineOffers, ...additionalElectronicsOffersToLoad]
                                                        });
                                                        additionalElectronicsOffersToLoad.length === 0 && setNoOnlineElectronicsCategorizedOffersToLoad(true);
                                                        break;
                                                    case OfferCategory.Home:
                                                        const additionalHomeOffersToLoad = await retrieveCategorizedOnlineOffersList(numberOfOnlineOffers, setNumberOfOnlineOffers,
                                                            currentActiveKit, onlineHomeCategorizedPageNumber, setOnlineHomeCategorizedPageNumber)
                                                        setOnlineHomeCategorizedOfferList(oldOnlineOffers => {
                                                            return [...oldOnlineOffers, ...additionalHomeOffersToLoad]
                                                        });
                                                        additionalHomeOffersToLoad.length === 0 && setNoOnlineHomeCategorizedOffersToLoad(true);
                                                        break;
                                                    case OfferCategory.HealthAndBeauty:
                                                        const additionalHealthAndBeautyOffersToLoad = await retrieveCategorizedOnlineOffersList(numberOfOnlineOffers, setNumberOfOnlineOffers,
                                                            currentActiveKit, onlineHealthAndBeautyCategorizedPageNumber, setOnlineHealthAndBeautyCategorizedPageNumber)
                                                        setOnlineHealthAndBeautyCategorizedOfferList(oldOnlineOffers => {
                                                            return [...oldOnlineOffers, ...additionalHealthAndBeautyOffersToLoad]
                                                        });
                                                        additionalHealthAndBeautyOffersToLoad.length === 0 && setNoOnlineHealthAndBeautyCategorizedOffersToLoad(true);
                                                        break;
                                                    case OfferCategory.OfficeAndBusiness:
                                                        const additionalOfficeAndBusinessOffersToLoad = await retrieveCategorizedOnlineOffersList(numberOfOnlineOffers, setNumberOfOnlineOffers,
                                                            currentActiveKit, onlineOfficeAndBusinessCategorizedPageNumber, setOnlineOfficeAndBusinessCategorizedPageNumber)
                                                        setOnlineOfficeAndBusinessCategorizedOfferList(oldOnlineOffers => {
                                                            return [...oldOnlineOffers, ...additionalOfficeAndBusinessOffersToLoad]
                                                        });
                                                        additionalOfficeAndBusinessOffersToLoad.length === 0 && setNoOnlineOfficeAndBusinessCategorizedOffersToLoad(true);
                                                        break;
                                                    case OfferCategory.ServicesAndSubscriptions:
                                                        const additionalServicesAndSubscriptionsOffersToLoad = await retrieveCategorizedOnlineOffersList(numberOfOnlineOffers, setNumberOfOnlineOffers,
                                                            currentActiveKit, onlineServicesAndSubscriptionsCategorizedPageNumber, setOnlineServicesAndSubscriptionsCategorizedPageNumber)
                                                        setOnlineServicesAndSubscriptionsCategorizedOfferList(oldOnlineOffers => {
                                                            return [...oldOnlineOffers, ...additionalServicesAndSubscriptionsOffersToLoad]
                                                        });
                                                        additionalServicesAndSubscriptionsOffersToLoad.length === 0 && setNoOnlineServicesAndSubscriptionsCategorizedOffersToLoad(true);
                                                        break;
                                                    default:
                                                        break;
                                                }
                                                setVerticalListLoading(true);
                                                // this makes the scrolling seem infinite - we artificially scroll up a little, so we have enough time to load
                                                // @ts-ignore
                                                onlineListView.current?.scrollToIndex(deDuplicatedOnlineOfferList.length - 2);
                                            } else {
                                                setVerticalListLoading(true);
                                                console.log(`Maximum number of categorized online offers reached for category ${currentActiveKit} ${deDuplicatedOnlineOfferList.length}`);
                                            }
                                        }}
                                        scrollViewProps={{
                                            scrollEnabled: onlineKitListExpanded,
                                            pagingEnabled: "true",
                                            decelerationRate: "fast",
                                            snapToAlignment: "start",
                                            persistentScrollbar: false,
                                            showsVerticalScrollIndicator: false,
                                            showsHorizontalScrollIndicator: false
                                        }}
                                    />
                            }
                        </>
                    }
                </View>
            }
        </>
    );
};
