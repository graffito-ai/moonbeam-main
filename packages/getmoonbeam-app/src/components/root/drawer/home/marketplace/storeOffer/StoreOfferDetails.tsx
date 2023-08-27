import React, {useEffect, useState} from 'react';
import {StoreOfferDetailsProps} from "../../../../../../models/props/StoreOfferProps";
import {Dimensions, ImageBackground, ScrollView, Text, TouchableOpacity, View} from "react-native";
import {styles} from '../../../../../../styles/storeOfferDetails.module';
import {useRecoilState} from "recoil";
import {storeOfferPhysicalLocationState, storeOfferState} from "../../../../../../recoil/StoreOfferAtom";
import {Avatar} from "@rneui/base";
import {List} from 'react-native-paper';
import {FidelisPartner, Offer, RewardType} from "@moonbeam/moonbeam-models";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {commonStyles} from "../../../../../../styles/common.module";
// @ts-ignore
import StoreDetailsBackgroundImage from "../../../../../../../assets/backgrounds/store-details-background.png";
import {LinearGradient} from "expo-linear-gradient";

/**
 * StoreOfferDetails component.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const StoreOfferDetails = ({navigation}: StoreOfferDetailsProps) => {
    // constants used to keep track of local component state
    const [offerIdExpanded, setOfferIdExpanded] = useState<string | null>(null);
    const [hasOnlineStore, setHasOnlineStore] = useState<boolean>(false);

    // constants used to keep track of shared states
    const [storeOfferClicked,] = useRecoilState(storeOfferState);
    const [storeOfferPhysicalLocation,] = useRecoilState(storeOfferPhysicalLocationState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // filter by the type of object clicked/passed in
        // @ts-ignore
        if (storeOfferClicked!.numberOfOffers !== undefined) {
            const retrievedClickedObject = storeOfferClicked as FidelisPartner;
            // filter through the retrieved offers for the partner, and decide if it has an online offer or not
            for (const retrievedPartnerOffer of retrievedClickedObject.offers) {
                retrievedPartnerOffer!.storeDetails && retrievedPartnerOffer!.storeDetails!.length !== 0 && retrievedPartnerOffer!.storeDetails!.forEach(store => {
                    if (store!.isOnline) {
                        setHasOnlineStore(true);
                    }
                });
            }
        } else {
            const retrievedClickedObject = storeOfferClicked as Offer;
            // filter through the retrieved offers, and decide whether they are online or not
            retrievedClickedObject!.storeDetails && retrievedClickedObject!.storeDetails!.length !== 0 && retrievedClickedObject!.storeDetails!.forEach(store => {
                if (store!.isOnline) {
                    setHasOnlineStore(true);
                }
            });
        }
    }, [hasOnlineStore]);

    /**
     * Function used to populate the online offers.
     *
     * @return a {@link React.ReactNode} or {@link React.ReactNode[]} representing the
     * React node and/or nodes, representing the online offers.
     */
    const populateOffersList = (): React.ReactNode | React.ReactNode[] => {
        let results: React.ReactNode[] = [];

        // filter by the type of object clicked/passed in
        // @ts-ignore
        if (storeOfferClicked!.numberOfOffers !== undefined) {
            const retrievedClickedObject = storeOfferClicked as FidelisPartner;
            let retrievedOfferCount = 0;

            // filter through the retrieved offers for the partner, and return them
            for (const retrievedPartnerOffer of retrievedClickedObject.offers) {
                // check the type of Fidelis partner offer
                const offerType = retrievedPartnerOffer!.title!.includes('Birthday')
                    ? 'Birthdays'
                    : (retrievedPartnerOffer!.title!.includes(`Veterans Day`)
                        ? `Veteran's Day`
                        : `Everyday`)

                // build the participating locations object
                let participatingLocationsNumber = 0;
                const participatingLocations: React.ReactNode[] = [];
                let hasOnlineStoreFlag = false;
                retrievedPartnerOffer!.storeDetails && retrievedPartnerOffer!.storeDetails!.length !== 0 && retrievedPartnerOffer!.storeDetails!.forEach(store => {
                    if (store!.isOnline && !hasOnlineStoreFlag) {
                        hasOnlineStoreFlag = true;
                        participatingLocations.push(<Text>{"• Available Online\n"}</Text>);
                    } else {
                        // only consider locations within 25 miles, 50 km, or 50,000 meters within user's location.
                        if (store!.distance && store!.distance! <= 50000) {
                            // only display the 5 closest locations
                            if (participatingLocationsNumber <= 4) {
                                participatingLocations.push(
                                    <Text>{`• ${store!.address1}, ${store!.city}, ${store!.state}, ${store!.postCode}\n`}</Text>)
                            }
                            participatingLocationsNumber += 1;
                        }
                    }
                });

                // also add any additional locations as a number
                if (participatingLocationsNumber > 4) {
                    participatingLocations.push(
                        <Text>{`• And ${6 - participatingLocationsNumber} more locations near you!\n`}</Text>)
                }

                results.push(
                    <>
                        <List.Accordion
                            onPress={() => {
                                // set the setOfferIdExpanded accordingly
                                offerIdExpanded === retrievedPartnerOffer!.id!
                                    ? setOfferIdExpanded(null)
                                    : setOfferIdExpanded(retrievedPartnerOffer!.id!);
                            }}
                            expanded={offerIdExpanded === retrievedPartnerOffer!.id!}
                            rippleColor={'transparent'}
                            style={styles.offerAccordionStyle}
                            titleStyle={styles.offerAccordionTitle}
                            titleNumberOfLines={2}
                            descriptionNumberOfLines={5}
                            title={offerType}
                            right={() =>
                                <Icon style={styles.offerRightIcon}
                                      color={'#F2FF5D'}
                                      name={offerIdExpanded !== retrievedPartnerOffer!.id! ? "chevron-down" : "chevron-up"}
                                      size={Dimensions.get('window').height / 28}/>}
                            left={() =>
                                <>
                                    <View style={styles.offerLeftView}>
                                        <Text style={styles.offerLeftDiscountPercentage}>
                                            {retrievedPartnerOffer!.reward!.type! === RewardType.RewardPercent
                                                ? `${retrievedPartnerOffer!.reward!.value}%`
                                                : `$${retrievedPartnerOffer!.reward!.value}`}
                                            <Text style={styles.offerLeftDiscount}>
                                                {" Off"}
                                            </Text>
                                        </Text>
                                    </View>
                                </>
                            }>
                            <List.Item
                                style={styles.offerItem}
                                titleStyle={styles.offerItemTitle}
                                descriptionStyle={styles.offerItemDescription}
                                titleNumberOfLines={500}
                                descriptionNumberOfLines={500}
                                title={'Offer Details'}
                                description={
                                    <Text>
                                        {(retrievedPartnerOffer!.qualifier && retrievedPartnerOffer!.qualifier!.length !== 0)
                                            ? retrievedPartnerOffer!.qualifier!
                                            : retrievedPartnerOffer!.title!}{"\n\n"}
                                        {
                                            <>
                                                <Text style={styles.offerItemTitle}>Additional Restrictions{"\n"}</Text>
                                                <Text>
                                                    {
                                                        offerType == `Everyday`
                                                            ? "• Offer applicable to every purchase, subject to the discounts aforementioned.\n• No limits on the minimum or maximum amount for purchase.\n• Offer available only at participating merchant locations."
                                                            : (offerType === `Birthdays`
                                                                    ? "• Offer limited to one purchase for your birthday, subject to the discounts aforementioned.\n• No limits on the minimum or maximum amount for purchase.\n• Offer available at merchant participant locations."
                                                                    : "• Offer limited to one purchase for Veteran's Day, subject to the discounts aforementioned.\n• No limits on the minimum or maximum amount for purchase.\n• Offer available at merchant participant locations."
                                                            )
                                                    }
                                                </Text>
                                            </>
                                        }
                                        {"\n\n"}
                                        {
                                            retrievedPartnerOffer!.storeDetails && retrievedPartnerOffer!.storeDetails.length !== 0 &&
                                            <>
                                                <Text style={styles.offerItemTitle}>Participating
                                                    Location/s{"\n"}</Text>
                                                <Text>
                                                    {participatingLocations}
                                                </Text>
                                            </>
                                        }
                                    </Text>
                                }/>
                        </List.Accordion>
                        {
                            retrievedOfferCount !== retrievedClickedObject.offers.length - 1 &&
                            <View style={{
                                backgroundColor: 'transparent',
                                height: Dimensions.get('window').height / 50,
                                top: Dimensions.get('window').height / 10,
                                width: Dimensions.get('window').width
                            }}/>
                        }
                    </>
                );
                retrievedOfferCount += 1;
            }
        } else {
            const retrievedClickedObject = storeOfferClicked as Offer;

            // build the participating locations object
            let participatingLocationsNumber = 0;
            const participatingLocations: React.ReactNode[] = [];
            let hasOnlineStoreFlag = false;
            retrievedClickedObject!.storeDetails && retrievedClickedObject!.storeDetails!.length !== 0 && retrievedClickedObject!.storeDetails!.forEach(store => {
                if (store!.isOnline && !hasOnlineStoreFlag) {
                    hasOnlineStoreFlag = true;
                    participatingLocations.push(<Text>{"• Available Online\n"}</Text>);
                } else {
                    // only consider locations within 25 miles, 50 km, or 50,000 meters within user's location.
                    if (store!.distance && store!.distance! <= 50000) {
                        // only display the 2 closest locations
                        if (participatingLocationsNumber <= 1) {
                            participatingLocations.push(
                                <Text>{`• ${store!.address1}, ${store!.city}, ${store!.state}, ${store!.postCode}\n`}</Text>)
                        }
                        participatingLocationsNumber += 1;
                    }
                }
            });

            // also add any additional locations as a number
            if (participatingLocationsNumber >= 2) {
                participatingLocations.push(
                    <Text>{`• And ${participatingLocationsNumber - 2 + 1} more location/s near you!\n`}</Text>)
            }

            results.push(
                <>
                    <List.Accordion
                        onPress={() => {
                            // set the setOfferIdExpanded accordingly
                            offerIdExpanded === retrievedClickedObject!.id!
                                ? setOfferIdExpanded(null)
                                : setOfferIdExpanded(retrievedClickedObject!.id!);
                        }}
                        expanded={offerIdExpanded === retrievedClickedObject!.id!}
                        rippleColor={'transparent'}
                        style={styles.offerAccordionStyle}
                        titleStyle={styles.offerAccordionTitle}
                        titleNumberOfLines={2}
                        descriptionNumberOfLines={5}
                        title={'Everyday'}
                        right={() =>
                            <Icon style={styles.offerRightIcon}
                                  color={'#F2FF5D'}
                                  name={offerIdExpanded !== retrievedClickedObject!.id! ? "chevron-down" : "chevron-up"}
                                  size={Dimensions.get('window').height / 28}/>}
                        left={() =>
                            <>
                                <View style={styles.offerLeftView}>
                                    <Text style={styles.offerLeftDiscountPercentage}>
                                        {retrievedClickedObject!.reward!.type! === RewardType.RewardPercent
                                            ? `${retrievedClickedObject!.reward!.value}%`
                                            : `$${retrievedClickedObject!.reward!.value}`}
                                        <Text style={styles.offerLeftDiscount}>
                                            {" Off"}
                                        </Text>
                                    </Text>
                                </View>
                            </>
                        }>
                        <List.Item
                            style={styles.offerItem}
                            titleStyle={styles.offerItemTitle}
                            descriptionStyle={styles.offerItemDescription}
                            titleNumberOfLines={500}
                            descriptionNumberOfLines={500}
                            title={'Offer Details'}
                            description={
                                <Text>
                                    {(retrievedClickedObject!.qualifier && retrievedClickedObject!.qualifier!.length !== 0)
                                        ? retrievedClickedObject!.qualifier!
                                        : retrievedClickedObject!.title!}{"\n\n"}
                                    {
                                        <>
                                            <Text style={styles.offerItemTitle}>Additional Restrictions{"\n"}</Text>
                                            <Text>
                                                {
                                                    "• Offer applicable to every purchase, subject to the discounts aforementioned.\n• Some limits on the minimum or maximum amounts for purchase might apply.\n• Offer available only at participating merchant locations."
                                                }
                                            </Text>
                                        </>
                                    }
                                    {"\n\n"}
                                    {
                                        retrievedClickedObject!.storeDetails && retrievedClickedObject!.storeDetails.length !== 0 &&
                                        <>
                                            <Text style={styles.offerItemTitle}>Participating
                                                Location/s{"\n"}</Text>
                                            <Text>
                                                <Text>
                                                    {participatingLocations}
                                                </Text>
                                            </Text>
                                        </>
                                    }
                                </Text>
                            }/>
                    </List.Accordion>
                </>
            );
        }

        return results;
    }

    // return the component for the StoreOfferDetails page
    return (
        <LinearGradient
            start={{x: 5, y: 1}}
            end={{x: 0, y: 1}}
            colors={['transparent', '#313030']}
            style={styles.mainView}>
            {
                // @ts-ignore
                storeOfferClicked!.numberOfOffers !== undefined
                    ?
                    <>
                        <View style={styles.brandView}>
                            <Avatar
                                containerStyle={styles.brandLogo}
                                imageProps={{
                                    resizeMode: 'contain'
                                }}
                                size={Dimensions.get('window').height / 5.5}
                                // @ts-ignore
                                source={{uri: storeOfferClicked!.offers[0].brandLogoSm!}}
                            />
                            {
                                !hasOnlineStore
                                    ?
                                    <Text style={styles.brandTitle}>{
                                        // @ts-ignore
                                        storeOfferClicked!.offers[0].brandDba!
                                    }
                                        <Text style={styles.brandTitleAddress}>
                                            {`\n${storeOfferPhysicalLocation}`}
                                        </Text>
                                    </Text>
                                    :
                                    <Text style={styles.brandTitle}>{
                                        // @ts-ignore
                                        `${storeOfferClicked!.offers[0].brandDba!}`
                                    }</Text>
                            }
                        </View>
                        <ImageBackground
                            style={[commonStyles.image, {top: Dimensions.get('window').height / 10}]}
                            imageStyle={{
                                resizeMode: 'stretch'
                            }}
                            resizeMethod={"scale"}
                            source={StoreDetailsBackgroundImage}>
                            <ScrollView
                                persistentScrollbar={false}
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps={'handled'}
                            >
                                {/*@ts-ignore*/}
                                <View style={[{height: storeOfferClicked!.numberOfOffers! === 2 ? Dimensions.get('window').height * 1.1 : (storeOfferClicked!.numberOfOffers! !== 1 ? Dimensions.get('window').height * 1.12 : Dimensions.get('window').height / 1.1)}, offerIdExpanded === null && {height: Dimensions.get('window').height / 4}]}>
                                    <List.Section style={styles.offerListView}>
                                        {
                                            populateOffersList()
                                        }
                                    </List.Section>
                                    {/*@ts-ignore*/}
                                    <View style={{top: offerIdExpanded === null ? (storeOfferClicked!.numberOfOffers! === 2 ? Dimensions.get('window').height / 5.2 : (storeOfferClicked!.numberOfOffers! !== 1 ? Dimensions.get('window').height / 7.2 : Dimensions.get('window').height / 3)) : (storeOfferClicked!.numberOfOffers! === 2 ? Dimensions.get('window').height / 6.2 : (storeOfferClicked!.numberOfOffers! !== 1 ? Dimensions.get('window').height / 15 : Dimensions.get('window').height / 25)), alignSelf: 'center'}}>
                                        {hasOnlineStore &&
                                            <TouchableOpacity
                                                style={styles.onlineShoppingButton}
                                                onPress={async () => {
                                                    // go to the offer's web view
                                                    navigation.navigate('StoreOfferWebView', {});
                                                }}
                                            >
                                                {/*@ts-ignore*/}
                                                <Text style={styles.onlineShoppingButtonContent}>Shop Online</Text>
                                            </TouchableOpacity>
                                        }
                                        <Text style={styles.footerTitle}>Moonbeam Exclusive</Text>
                                        <Text style={styles.footerDescription}>Offers and/or loyalty programs may
                                            change, and are subject to using your Linked Card at checkout (online and/or
                                            at physical merchant locations).</Text>
                                    </View>
                                </View>
                            </ScrollView>
                        </ImageBackground>
                    </>
                    :
                    <>
                        <View style={styles.brandView}>
                            <Avatar
                                containerStyle={styles.brandLogo}
                                imageProps={{
                                    resizeMode: 'contain'
                                }}
                                size={Dimensions.get('window').height / 5.5}
                                // @ts-ignore
                                source={{uri: storeOfferClicked!.brandLogoSm!}}
                            />
                            {
                                !hasOnlineStore
                                    ?
                                <Text style={styles.brandTitle}>{
                                    // @ts-ignore
                                    storeOfferClicked!.brandDba!
                                }
                                    <Text style={styles.brandTitleAddress}>
                                        {`\n${storeOfferPhysicalLocation}`}
                                    </Text>
                                </Text>
                                    :
                                <Text style={styles.brandTitle}>{
                                    // @ts-ignore
                                    `${storeOfferClicked!.brandDba!}`
                                }</Text>
                            }
                        </View>
                        <ImageBackground
                            style={[commonStyles.image, {top: Dimensions.get('window').height / 10}]}
                            imageStyle={{
                                resizeMode: 'stretch'
                            }}
                            resizeMethod={"scale"}
                            source={StoreDetailsBackgroundImage}>
                            <ScrollView
                                persistentScrollbar={false}
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps={'handled'}
                            >
                                {/*@ts-ignore*/}
                                <View style={[{height: storeOfferClicked!.qualifier! && storeOfferClicked.qualifier!.length > 200 ? Dimensions.get('window').height * 1.2 : Dimensions.get('window').height / 1.1}, offerIdExpanded === null && {height: Dimensions.get('window').height / 4}]}>
                                    <List.Section style={styles.offerListView}>
                                        {
                                            populateOffersList()
                                        }
                                    </List.Section>
                                    <View style={{
                                        top: offerIdExpanded === null
                                            ? Dimensions.get('window').height / 3
                                            : Dimensions.get('window').height / 20, alignSelf: 'center'
                                    }}>
                                        {hasOnlineStore &&
                                            <TouchableOpacity
                                                style={styles.onlineShoppingButton}
                                                onPress={async () => {
                                                    // go to the offer's web view
                                                    navigation.navigate('StoreOfferWebView', {});
                                                }}
                                            >
                                                {/*@ts-ignore*/}
                                                <Text style={styles.onlineShoppingButtonContent}>Shop Online</Text>
                                            </TouchableOpacity>
                                        }
                                        <Text style={styles.footerTitle}>Moonbeam Exclusive</Text>
                                        <Text style={styles.footerDescription}>Offers and loyalty programs may
                                            change, and are subject to using your Linked Card at checkout (online or
                                            in-person).</Text>
                                    </View>
                                </View>
                            </ScrollView>
                        </ImageBackground>
                    </>
            }
        </LinearGradient>
    );
};
