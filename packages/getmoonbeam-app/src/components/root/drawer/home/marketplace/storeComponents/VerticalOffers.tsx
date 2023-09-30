import React, {useEffect} from "react";
import {FidelisPartner, Offer, RewardType} from "@moonbeam/moonbeam-models";
import {List, Text} from "react-native-paper";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {styles} from "../../../../../../styles/store.module";
import {useRecoilState} from "recoil";
import {storeOfferState} from "../../../../../../recoil/StoreOfferAtom";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {MarketplaceStackParamList} from "../../../../../../models/props/MarketplaceProps";
import {currentUserInformation} from "../../../../../../recoil/AuthAtom";
import {Image} from 'expo-image';
// @ts-ignore
import MoonbeamPlaceholderImage from "../../../../../../../assets/art/moonbeam-store-placeholder.png";

/**
 * VerticalOffers component.
 *
 * @param props properties to be passed into the component
 * @constructor constructor for the component.
 */
export const VerticalOffers = (props: {
    filteredOffersList: Offer[],
    filteredFidelisList: FidelisPartner[],
    nearbyOfferList: Offer[],
    onlineOfferList: Offer[],
    navigation: NativeStackNavigationProp<MarketplaceStackParamList, 'Store'>,
    shouldCacheImages: boolean,
    noFilteredOffersAvailable: boolean,
    fidelisPartnerList: FidelisPartner[],
    setFilteredOffersSpinnerShown: React.Dispatch<React.SetStateAction<boolean>>,
    retrieveOnlineOffersList: () => Promise<void>,
    offersNearUserLocationFlag: boolean,
    retrieveNearbyOffersList: () => Promise<void>,
    searchQuery: string,
    retrieveOffersNearLocation: (string) => Promise<void>,
    toggleViewPressed: 'horizontal' | 'vertical'
}) => {
    // constants used to keep track of shared states
    const [, setStoreOfferClicked] = useRecoilState(storeOfferState);
    const [userInformation,] = useRecoilState(currentUserInformation);

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
     * Function used to populate the nearby offers.
     *
     * @param filtered flag indicating whether we are to display the filtered
     * offers or not
     *
     * @return a {@link React.ReactNode} or {@link React.ReactNode[]} representing the
     * React node and/or nodes, representing the vertical offers.
     */
    const populateVerticalOffers = (filtered: boolean): React.ReactNode | React.ReactNode[] => {
        let results: React.ReactNode[] = [];
        let verticalOffersNumber = 0;
        let offersShown = false;

        // check which offer arrays to observe (filtered or all the other ones)
        const offerList: Offer[] = filtered ? props.filteredOffersList : props.nearbyOfferList.concat(props.onlineOfferList);

        // fidelis partner listing - filtered
        if (filtered && props.filteredFidelisList.length !== 0) {
            offersShown = true;
            for (const fidelisPartner of props.filteredFidelisList) {
                // retrieve appropriate offer for partner (everyday)
                let offer: Offer | null = null;
                for (const matchedOffer of fidelisPartner.offers) {
                    if (matchedOffer!.title!.includes("Military Discount")) {
                        offer = matchedOffer!;
                        break;
                    }
                }
                offer && results.push(
                    <>
                        <List.Item
                            onPress={() => {
                                // set the clicked offer/partner accordingly
                                setStoreOfferClicked(fidelisPartner);
                                props.navigation.navigate('StoreOffer', {});
                            }}
                            style={{marginLeft: wp(2)}}
                            titleStyle={styles.verticalOfferName}
                            descriptionStyle={styles.verticalOfferBenefits}
                            titleNumberOfLines={1}
                            descriptionNumberOfLines={1}
                            title={fidelisPartner.brandName}
                            description={
                                <>
                                    {"Starting at "}
                                    <Text style={styles.verticalOfferBenefit}>
                                        {offer!.reward!.type! === RewardType.RewardPercent
                                            ? `${offer!.reward!.value}%`
                                            : `$${offer!.reward!.value}`}
                                    </Text>
                                    {" Off "}
                                </>
                            }
                            left={() =>
                                <Image
                                    style={styles.verticalOfferLogo}
                                    source={{
                                        uri: offer!.brandLogoSm!,
                                    }}
                                    placeholder={MoonbeamPlaceholderImage}
                                    placeholderContentFit={'fill'}
                                    contentFit={'fill'}
                                    transition={1000}
                                    cachePolicy={!props.shouldCacheImages ? 'none' : 'memory-disk'}
                                />}
                            right={() => <List.Icon color={'#F2FF5D'}
                                                    icon="chevron-right"/>}
                        />
                    </>
                )
            }
        }

        // fidelis partner listing - not filtered
        if (!filtered && !props.noFilteredOffersAvailable) {
            offersShown = true;
            for (const fidelisPartner of props.fidelisPartnerList) {
                // retrieve appropriate offer for partner (everyday)
                let offer: Offer | null = null;
                for (const matchedOffer of fidelisPartner.offers) {
                    if (matchedOffer!.title!.includes("Military Discount")) {
                        offer = matchedOffer!;
                        break;
                    }
                }
                offer && results.push(
                    <>
                        <List.Item
                            onPress={() => {
                                // set the clicked offer/partner accordingly
                                setStoreOfferClicked(fidelisPartner);
                                props.navigation.navigate('StoreOffer', {});
                            }}
                            style={{marginLeft: wp(2)}}
                            titleStyle={styles.verticalOfferName}
                            descriptionStyle={styles.verticalOfferBenefits}
                            titleNumberOfLines={1}
                            descriptionNumberOfLines={1}
                            title={fidelisPartner.brandName}
                            description={
                                <>
                                    {"Starting at "}
                                    <Text style={styles.verticalOfferBenefit}>
                                        {offer!.reward!.type! === RewardType.RewardPercent
                                            ? `${offer!.reward!.value}%`
                                            : `$${offer!.reward!.value}`}
                                    </Text>
                                    {" Off "}
                                </>
                            }
                            left={() =>
                                <Image
                                    style={styles.verticalOfferLogo}
                                    source={{
                                        uri: offer!.brandLogoSm!,
                                    }}
                                    placeholder={MoonbeamPlaceholderImage}
                                    placeholderContentFit={'fill'}
                                    contentFit={'fill'}
                                    transition={1000}
                                    cachePolicy={!props.shouldCacheImages ? 'none' : 'memory-disk'}
                                />}
                            right={() => <List.Icon color={'#F2FF5D'}
                                                    icon="chevron-right"/>}
                        />
                    </>
                )
            }
        }

        // offer listing
        if (offerList.length !== 0 && !props.noFilteredOffersAvailable) {
            offersShown = true;
            for (const verticalOffer of offerList) {
                results.push(
                    <>
                        {
                            verticalOffersNumber !== offerList.length - 1
                                ?
                                <>
                                    <List.Item
                                        onPress={() => {
                                            // set the clicked offer/partner accordingly
                                            setStoreOfferClicked(verticalOffer);
                                            props.navigation.navigate('StoreOffer', {});
                                        }}
                                        style={{marginLeft: wp(2)}}
                                        titleStyle={styles.verticalOfferName}
                                        descriptionStyle={styles.verticalOfferBenefits}
                                        titleNumberOfLines={1}
                                        descriptionNumberOfLines={1}
                                        title={verticalOffer.brandDba}
                                        description={
                                            <>
                                                <Text style={styles.verticalOfferBenefit}>
                                                    {verticalOffer.reward!.type! === RewardType.RewardPercent
                                                        ? `${verticalOffer.reward!.value}%`
                                                        : `$${verticalOffer.reward!.value}`}
                                                </Text>
                                                {" Off "}
                                            </>
                                        }
                                        left={() =>
                                            <Image
                                                style={styles.verticalOfferLogo}
                                                source={{
                                                    uri: verticalOffer.brandLogoSm!,
                                                }}
                                                placeholder={MoonbeamPlaceholderImage}
                                                placeholderContentFit={'fill'}
                                                contentFit={'fill'}
                                                transition={1000}
                                                cachePolicy={!props.shouldCacheImages ? 'none' : 'memory-disk'}
                                            />}
                                        right={() => <List.Icon color={'#F2FF5D'}
                                                                icon="chevron-right"/>}
                                    />
                                </>
                                :
                                <>
                                    <List.Item
                                        onPress={() => {
                                            // set the clicked offer/partner accordingly
                                            setStoreOfferClicked(verticalOffer);
                                            props.navigation.navigate('StoreOffer', {});
                                        }}
                                        style={{marginLeft: wp(2)}}
                                        titleStyle={styles.verticalOfferName}
                                        descriptionStyle={styles.verticalOfferBenefits}
                                        titleNumberOfLines={1}
                                        descriptionNumberOfLines={1}
                                        title={verticalOffer.brandDba}
                                        description={
                                            <>
                                                <Text style={styles.verticalOfferBenefit}>
                                                    {verticalOffer.reward!.type! === RewardType.RewardPercent
                                                        ? `${verticalOffer.reward!.value}%`
                                                        : `$${verticalOffer.reward!.value}`}
                                                </Text>
                                                {" Off "}
                                            </>
                                        }
                                        left={() =>
                                            <Image
                                                style={styles.verticalOfferLogo}
                                                source={{
                                                    uri: verticalOffer.brandLogoSm!,
                                                }}
                                                placeholder={MoonbeamPlaceholderImage}
                                                placeholderContentFit={'fill'}
                                                contentFit={'fill'}
                                                transition={1000}
                                                cachePolicy={!props.shouldCacheImages ? 'none' : 'memory-disk'}
                                            />}
                                        right={() => <List.Icon color={'#F2FF5D'}
                                                                icon="chevron-right"/>}
                                    />
                                    {!filtered &&
                                        <List.Item
                                            rippleColor={'transparent'}
                                            onPress={async () => {
                                                // set the loader
                                                props.setFilteredOffersSpinnerShown(true);

                                                // retrieve additional offers (either nearby, or near user's home location)
                                                await props.retrieveOnlineOffersList();
                                                !props.offersNearUserLocationFlag
                                                    ? await props.retrieveNearbyOffersList()
                                                    : await props.retrieveOffersNearLocation(userInformation["address"]["formatted"]);

                                                // release the loader
                                                props.setFilteredOffersSpinnerShown(false);
                                            }}
                                            style={{
                                                marginLeft: wp(36),
                                                top: hp(5)
                                            }}
                                            titleStyle={[styles.verticalOfferName, {color: '#F2FF5D'}]}
                                            titleNumberOfLines={1}
                                            title={'See More'}
                                        />
                                    }
                                    {
                                        (props.searchQuery === 'sort by: online'
                                            || props.searchQuery === 'sort by: nearby locations'
                                            || props.searchQuery === 'sort by: discount percentage') &&
                                        <List.Item
                                            rippleColor={'transparent'}
                                            onPress={async () => {
                                                // set the loader
                                                props.setFilteredOffersSpinnerShown(true);

                                                // retrieve additional offers (either nearby, or near user's home location)
                                                await props.retrieveOnlineOffersList();
                                                !props.offersNearUserLocationFlag
                                                    ? await props.retrieveNearbyOffersList()
                                                    : await props.retrieveOffersNearLocation(userInformation["address"]["formatted"]);

                                                // release the loader
                                                props.setFilteredOffersSpinnerShown(false);
                                            }}
                                            style={{
                                                marginLeft: wp(36),
                                                top: hp(5)
                                            }}
                                            titleStyle={[styles.verticalOfferName, {color: '#F2FF5D'}]}
                                            titleNumberOfLines={1}
                                            title={'See More'}
                                        />
                                    }
                                </>
                        }
                    </>
                );
                verticalOffersNumber += 1;
            }
        }

        // filtered no offers to be displayed
        if (props.filteredOffersList.length === 0 && props.filteredFidelisList.length === 0 && !offersShown) {
            results.push(
                <List.Item disabled={true}
                           rippleColor={'transparent'}
                           onPress={async () => {
                           }}
                           style={{
                               marginLeft: wp(28),
                               top: hp(5)
                           }}
                           titleStyle={[styles.verticalOfferName, {color: '#F2FF5D'}]}
                           titleNumberOfLines={1}
                           title={'No Matched Offers'}
                />
            )
        }
        return results;
    }


    // return the component for the Vertical Offers page
    return (
        <>
            {
                props.toggleViewPressed === 'vertical' &&
                <>
                    <List.Section
                        style={{width: wp(100), left: wp(2)}}
                    >
                        {
                            populateVerticalOffers(props.filteredOffersList.length !== 0 || props.filteredFidelisList.length !== 0)
                        }
                    </List.Section>
                </>
            }
        </>
    );
};
