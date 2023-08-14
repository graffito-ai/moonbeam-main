import React, {useEffect, useRef, useState} from 'react';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {StoreProps} from "../../../../../models/props/MarketplaceProps";
import {Spinner} from '../../../../common/Spinner';
import {Dimensions, Image, Platform, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View} from "react-native";
import {commonStyles} from "../../../../../styles/common.module";
import {Button, Card, Chip, List, Paragraph, Searchbar, Text, ToggleButton} from 'react-native-paper';
import {styles} from '../../../../../styles/store.module';
import {Avatar, Icon} from '@rneui/base';
import MapView, {Marker} from "react-native-maps";
import * as Location from "expo-location";

/**
 * Interface to be used for determining the location of a nearby offer's
 * store, to be used when displaying it on a map.
 */
interface NearbyOfferStoreLocation {
    latitude: number,
    longitude: number,
    latitudeDelta: number,
    longitudeDelta: number
}

/**
 * Store component.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const Store = ({navigation}: StoreProps) => {
    // constants used to keep track of local component state
    const mapViewRef = useRef(null);
    const [nearbyOfferStoreGeoLocation, setNearbyOfferStoreGeoLocation] = useState<NearbyOfferStoreLocation | null>(null);
    const [isReady, setIsReady] = useState<boolean>(true);
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
    const [toggleViewPressed, setToggleViewPressed] = useState<string>('horizontal');
    const [searchQuery, setSearchQuery] = React.useState('');
    const [featuredPartnerList, setFeaturedPartnerList] = useState<[]>([]);
    const [filteredOfferList, setFilteredOfferList] = useState<[]>([]);

    // constants used to keep track of shared states

    /**
     * retrieves the geolocation (latitude and longitude of a nearby offer's store)
     *
     * @param address address of a given nearby offer's store.
     */
    const retrieveNearbyOfferGeolocation = async (address: string): Promise<void> => {
        const geoLocationArray = await Location.geocodeAsync(address);
        /**
         * get the first location point in the array of geolocation returned, since we will have the full address of the store,
         * which will result in a 100% accuracy for 1 location match
         */
        const geoLocation = geoLocationArray[0];

        // building the nearby offer's store geolocation object
        let nearbyOfferStoreGeoLocation: NearbyOfferStoreLocation | null = null;
        if (geoLocation) {
            // set the store location details accordingly
            nearbyOfferStoreGeoLocation = {
                latitude: geoLocation.latitude!,
                longitude: geoLocation.longitude!,
                latitudeDelta: 0.001,
                longitudeDelta: 0.003
            }

            // go to the current region on the map, based on the retrieved store location
            // @ts-ignore
            mapViewRef && mapViewRef.current && mapViewRef.current.animateToRegion({
                latitude: nearbyOfferStoreGeoLocation.latitude,
                longitude: nearbyOfferStoreGeoLocation.longitude,
                latitudeDelta: nearbyOfferStoreGeoLocation.latitudeDelta,
                longitudeDelta: nearbyOfferStoreGeoLocation.longitudeDelta,
            }, 0);
        }
        setNearbyOfferStoreGeoLocation(nearbyOfferStoreGeoLocation);
    }

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        mapViewRef && mapViewRef.current && retrieveNearbyOfferGeolocation('11414 W Nadine Way, Peoria, AZ, 85382');
    }, []);

    // return the component for the Store page
    return (
        <>
            {
                !isReady ?
                    <Spinner loadingSpinnerShown={loadingSpinnerShown}
                             setLoadingSpinnerShown={setLoadingSpinnerShown}/>
                    :
                    <KeyboardAwareScrollView
                        scrollEnabled={false}
                        showsVerticalScrollIndicator={false}
                        enableAutomaticScroll={(Platform.OS === 'ios')}
                        contentContainerStyle={commonStyles.rowContainer}
                        keyboardShouldPersistTaps={'handled'}
                    >
                        <SafeAreaView style={[styles.mainView]}>
                            <View style={styles.titleView}>
                                <View style={{
                                    paddingRight: Dimensions.get('window').width / 4.5
                                }}>
                                    <Text style={styles.mainTitle}>
                                        Shop
                                    </Text>
                                    <Text style={styles.mainSubtitle}>
                                        at select merchant partners.
                                    </Text>
                                </View>
                                <ToggleButton.Group
                                    onValueChange={(value) => {
                                        value === 'horizontal' && searchQuery !== '' && setSearchQuery('');
                                        value !== null && setToggleViewPressed(value);
                                    }}
                                    value={toggleViewPressed}>
                                    <ToggleButton
                                        style={styles.toggleViewButton}
                                        size={toggleViewPressed === 'horizontal' ? Dimensions.get('window').width / 13 : Dimensions.get('window').width / 15}
                                        icon="collage"
                                        value="horizontal"
                                        iconColor={toggleViewPressed === 'horizontal' ? '#F2FF5D' : '#5B5A5A'}
                                    />
                                    <ToggleButton
                                        style={styles.toggleViewButton}
                                        size={toggleViewPressed === 'vertical' ? Dimensions.get('window').width / 13 : Dimensions.get('window').width / 15}
                                        icon="format-list-bulleted-type"
                                        value="vertical"
                                        iconColor={toggleViewPressed === 'vertical' ? '#F2FF5D' : '#5B5A5A'}
                                    />
                                </ToggleButton.Group>
                            </View>
                            <Searchbar
                                selectionColor={'#F2FF5D'}
                                iconColor={'#F2FF5D'}
                                inputStyle={styles.searchBarInput}
                                style={styles.searchBar}
                                placeholder="Search for a merchant partner"
                                onChangeText={(query) => setSearchQuery(query)}
                                value={searchQuery}
                            />
                            <View style={styles.filterChipView}>
                                <Chip mode={'flat'}
                                      style={[styles.filterChip, searchQuery === 'sort by: points' ? {backgroundColor: '#F2FF5D'} : {backgroundColor: '#5B5A5A'}]}
                                      textStyle={[styles.filterChipText, searchQuery === 'sort by: points' ? {color: '#5B5A5A'} : {color: '#F2FF5D'}]}
                                      icon={() => (
                                          <Icon name="web"
                                                type={'material-community'}
                                                size={Dimensions.get('window').height / 40}
                                                color={searchQuery === 'sort by: points' ? '#5B5A5A' : '#F2FF5D'}/>
                                      )}
                                      onPress={() => {
                                          searchQuery === 'sort by: points' ? setSearchQuery('') : setSearchQuery('sort by: points');
                                      }}>Online</Chip>
                                <Chip mode={'outlined'}
                                      style={[styles.filterChip, searchQuery === 'sort by: discount percentage' ? {backgroundColor: '#F2FF5D'} : {backgroundColor: '#5B5A5A'}]}
                                      textStyle={[styles.filterChipText, searchQuery === 'sort by: discount percentage' ? {color: '#5B5A5A'} : {color: '#F2FF5D'}]}
                                      icon={() => (
                                          <Icon name="percent-outline"
                                                type={'material-community'}
                                                size={Dimensions.get('window').height / 45}
                                                color={searchQuery === 'sort by: discount percentage' ? '#5B5A5A' : '#F2FF5D'}/>
                                      )}
                                      onPress={() => {
                                          searchQuery === 'sort by: discount percentage' ? setSearchQuery('') : setSearchQuery('sort by: discount percentage');
                                      }}>Discount</Chip>
                                <Chip mode={'outlined'}
                                      style={[styles.filterChip, searchQuery === 'sort by: nearby locations' ? {backgroundColor: '#F2FF5D'} : {backgroundColor: '#5B5A5A'}]}
                                      icon={() => (
                                          <Icon name="map-marker"
                                                type={'material-community'}
                                                size={Dimensions.get('window').height / 45}
                                                color={searchQuery === 'sort by: nearby locations' ? '#5B5A5A' : '#F2FF5D'}/>
                                      )}
                                      textStyle={[styles.filterChipText, searchQuery === 'sort by: nearby locations' ? {color: '#5B5A5A'} : {color: '#F2FF5D'}]}
                                      onPress={() => {
                                          searchQuery === 'sort by: nearby locations' ? setSearchQuery('') : setSearchQuery('sort by: nearby locations');
                                      }}>Nearby</Chip>
                            </View>
                            <View style={{height: Dimensions.get('window').height / 100, backgroundColor: '#313030'}}/>
                            <View style={styles.content}>
                                <ScrollView
                                    scrollEnabled={true}
                                    persistentScrollbar={false}
                                    showsVerticalScrollIndicator={false}
                                    keyboardShouldPersistTaps={'handled'}
                                    contentContainerStyle={{paddingBottom: Dimensions.get('window').height / 10}}
                                >
                                    {
                                        (toggleViewPressed === 'vertical' || filteredOfferList.length !== 0) &&
                                        <>
                                            <List.Section
                                                style={{width: Dimensions.get('window').width}}
                                            >
                                                <List.Item
                                                    onPress={() => {
                                                        navigation.navigate('StoreOffer', {});
                                                    }}
                                                    style={{marginLeft: '2%'}}
                                                    titleStyle={styles.verticalOfferName}
                                                    descriptionStyle={styles.verticalOfferBenefits}
                                                    titleNumberOfLines={1}
                                                    descriptionNumberOfLines={1}
                                                    title={'Amigo Provisions Co.'}
                                                    description={
                                                        <>
                                                            <Text
                                                                style={styles.verticalOfferBenefit}>{'15'}%</Text>
                                                            {" Discount "}
                                                        </>
                                                    }
                                                    left={() =>
                                                        <Avatar
                                                            containerStyle={{
                                                                marginRight: '5%'
                                                            }}
                                                            imageProps={{
                                                                resizeMode: 'stretch'
                                                            }}
                                                            size={60}
                                                            rounded
                                                            source={{uri: 'https://www.flaticon.com/free-icon/facebook_5968764?term=logo&page=1&position=4&origin=search&related_id=5968764'}}
                                                        />}
                                                    right={() => <List.Icon color={'#F2FF5D'} icon="chevron-right"/>}
                                                />
                                                <List.Item
                                                    onPress={() => {
                                                        navigation.navigate('StoreOffer', {});
                                                    }}
                                                    style={{marginLeft: '2%'}}
                                                    titleStyle={styles.verticalOfferName}
                                                    descriptionStyle={styles.verticalOfferBenefits}
                                                    titleNumberOfLines={1}
                                                    descriptionNumberOfLines={1}
                                                    title={'Amigo Provisions Co.'}
                                                    description={
                                                        <>
                                                            <Text
                                                                style={styles.verticalOfferBenefit}>{'15'}%</Text>
                                                            {" Discount "}
                                                        </>
                                                    }
                                                    left={() =>
                                                        <Avatar
                                                            containerStyle={{
                                                                marginRight: '5%'
                                                            }}
                                                            imageProps={{
                                                                resizeMode: 'stretch'
                                                            }}
                                                            size={60}
                                                            rounded
                                                            source={{uri: 'https://www.flaticon.com/free-icon/facebook_5968764?term=logo&page=1&position=4&origin=search&related_id=5968764'}}
                                                        />}
                                                    right={() => <List.Icon color={'#F2FF5D'} icon="chevron-right"/>}
                                                />
                                                <List.Item
                                                    onPress={() => {
                                                        navigation.navigate('StoreOffer', {});
                                                    }}
                                                    style={{marginLeft: '2%'}}
                                                    titleStyle={styles.verticalOfferName}
                                                    descriptionStyle={styles.verticalOfferBenefits}
                                                    titleNumberOfLines={1}
                                                    descriptionNumberOfLines={1}
                                                    title={'Amigo Provisions Co.'}
                                                    description={
                                                        <>
                                                            <Text
                                                                style={styles.verticalOfferBenefit}>{'15'}%</Text>
                                                            {" Discount "}
                                                        </>
                                                    }
                                                    left={() =>
                                                        <Avatar
                                                            containerStyle={{
                                                                marginRight: '5%'
                                                            }}
                                                            imageProps={{
                                                                resizeMode: 'stretch'
                                                            }}
                                                            size={60}
                                                            rounded
                                                            source={{uri: 'https://www.flaticon.com/free-icon/facebook_5968764?term=logo&page=1&position=4&origin=search&related_id=5968764'}}
                                                        />}
                                                    right={() => <List.Icon color={'#F2FF5D'} icon="chevron-right"/>}
                                                />
                                                <List.Item
                                                    onPress={() => {
                                                        navigation.navigate('StoreOffer', {});
                                                    }}
                                                    style={{marginLeft: '2%'}}
                                                    titleStyle={styles.verticalOfferName}
                                                    descriptionStyle={styles.verticalOfferBenefits}
                                                    titleNumberOfLines={1}
                                                    descriptionNumberOfLines={1}
                                                    title={'Amigo Provisions Co.'}
                                                    description={
                                                        <>
                                                            <Text
                                                                style={styles.verticalOfferBenefit}>{'15'}%</Text>
                                                            {" Discount "}
                                                        </>
                                                    }
                                                    left={() =>
                                                        <Avatar
                                                            containerStyle={{
                                                                marginRight: '5%'
                                                            }}
                                                            imageProps={{
                                                                resizeMode: 'stretch'
                                                            }}
                                                            size={60}
                                                            rounded
                                                            source={{uri: 'https://www.flaticon.com/free-icon/facebook_5968764?term=logo&page=1&position=4&origin=search&related_id=5968764'}}
                                                        />}
                                                    right={() => <List.Icon color={'#F2FF5D'} icon="chevron-right"/>}
                                                />
                                                <List.Item
                                                    onPress={() => {
                                                        navigation.navigate('StoreOffer', {});
                                                    }}
                                                    style={{marginLeft: '2%'}}
                                                    titleStyle={styles.verticalOfferName}
                                                    descriptionStyle={styles.verticalOfferBenefits}
                                                    titleNumberOfLines={1}
                                                    descriptionNumberOfLines={1}
                                                    title={'Amigo Provisions Co.'}
                                                    description={
                                                        <>
                                                            <Text
                                                                style={styles.verticalOfferBenefit}>{'15'}%</Text>
                                                            {" Discount "}
                                                        </>
                                                    }
                                                    left={() =>
                                                        <Avatar
                                                            containerStyle={{
                                                                marginRight: '5%'
                                                            }}
                                                            imageProps={{
                                                                resizeMode: 'stretch'
                                                            }}
                                                            size={60}
                                                            rounded
                                                            source={{uri: 'https://www.flaticon.com/free-icon/facebook_5968764?term=logo&page=1&position=4&origin=search&related_id=5968764'}}
                                                        />}
                                                    right={() => <List.Icon color={'#F2FF5D'} icon="chevron-right"/>}
                                                />
                                                <List.Item
                                                    onPress={() => {
                                                        navigation.navigate('StoreOffer', {});
                                                    }}
                                                    style={{marginLeft: '2%'}}
                                                    titleStyle={styles.verticalOfferName}
                                                    descriptionStyle={styles.verticalOfferBenefits}
                                                    titleNumberOfLines={1}
                                                    descriptionNumberOfLines={1}
                                                    title={'Amigo Provisions Co.'}
                                                    description={
                                                        <>
                                                            <Text
                                                                style={styles.verticalOfferBenefit}>{'15'}%</Text>
                                                            {" Discount "}
                                                        </>
                                                    }
                                                    left={() =>
                                                        <Avatar
                                                            containerStyle={{
                                                                marginRight: '5%'
                                                            }}
                                                            imageProps={{
                                                                resizeMode: 'stretch'
                                                            }}
                                                            size={60}
                                                            rounded
                                                            source={{uri: 'https://www.flaticon.com/free-icon/facebook_5968764?term=logo&page=1&position=4&origin=search&related_id=5968764'}}
                                                        />}
                                                    right={() => <List.Icon color={'#F2FF5D'} icon="chevron-right"/>}
                                                />
                                                <List.Item
                                                    onPress={() => {
                                                        navigation.navigate('StoreOffer', {});
                                                    }}
                                                    style={{marginLeft: '2%'}}
                                                    titleStyle={styles.verticalOfferName}
                                                    descriptionStyle={styles.verticalOfferBenefits}
                                                    titleNumberOfLines={1}
                                                    descriptionNumberOfLines={1}
                                                    title={'Amigo Provisions Co.'}
                                                    description={
                                                        <>
                                                            <Text
                                                                style={styles.verticalOfferBenefit}>{'15'}%</Text>
                                                            {" Discount "}
                                                        </>
                                                    }
                                                    left={() =>
                                                        <Avatar
                                                            containerStyle={{
                                                                marginRight: '5%'
                                                            }}
                                                            imageProps={{
                                                                resizeMode: 'stretch'
                                                            }}
                                                            size={60}
                                                            rounded
                                                            source={{uri: 'https://www.flaticon.com/free-icon/facebook_5968764?term=logo&page=1&position=4&origin=search&related_id=5968764'}}
                                                        />}
                                                    right={() => <List.Icon color={'#F2FF5D'} icon="chevron-right"/>}
                                                />
                                            </List.Section>
                                        </>
                                    }
                                    {
                                        (toggleViewPressed === 'horizontal' && filteredOfferList.length === 0) &&
                                        <>
                                            <View style={styles.horizontalScrollView}>
                                                <View style={styles.featuredPartnersView}>
                                                    <Text style={styles.featuredPartnersTitle}>
                                                        Fidelis Partner Offers
                                                    </Text>
                                                    <ScrollView
                                                        horizontal={true}
                                                        decelerationRate={"fast"}
                                                        snapToInterval={Dimensions.get('window').width/1.1}
                                                        snapToAlignment={"start"}
                                                        scrollEnabled={true}
                                                        persistentScrollbar={false}
                                                        showsHorizontalScrollIndicator={false}>
                                                        {
                                                            <>
                                                                <Card
                                                                    style={styles.featuredPartnerCard}>
                                                                    <Card.Content>
                                                                        <View style={{flexDirection: 'column'}}>
                                                                            <View style={{
                                                                                flexDirection: 'row',
                                                                                marginTop: -10
                                                                            }}>
                                                                                <View>
                                                                                    <Card.Title
                                                                                        title={'Amigo Provisions Co.'}
                                                                                        subtitle={`3 Offers Available`}
                                                                                        titleStyle={styles.featuredPartnerCardTitle}
                                                                                        subtitleStyle={styles.featuredPartnerCardSubtitle}
                                                                                        titleNumberOfLines={5}
                                                                                        subtitleNumberOfLines={3}/>
                                                                                    <Button
                                                                                        uppercase={false}
                                                                                        disabled={false}
                                                                                        onPress={() => {
                                                                                            navigation.navigate('StoreOffer', {})
                                                                                        }}
                                                                                        style={[styles.featuredPartnerCardActionButton]}
                                                                                        textColor={"#313030"}
                                                                                        buttonColor={"#F2FF5D"}
                                                                                        mode="outlined"
                                                                                        labelStyle={styles.featuredPartnerCardActionButtonLabel}>
                                                                                        View Offers
                                                                                    </Button>
                                                                                </View>
                                                                                <View>
                                                                                    <Avatar
                                                                                        containerStyle={styles.featuredPartnerCardCover}
                                                                                        imageProps={{
                                                                                            resizeMode: 'stretch'
                                                                                        }}
                                                                                        source={{uri: 'https://www.flaticon.com/free-icon/facebook_5968764?term=logo&page=1&position=4&origin=search&related_id=5968764'}}
                                                                                    />
                                                                                </View>
                                                                            </View>
                                                                            <Paragraph
                                                                                style={styles.featuredPartnerCardParagraph}
                                                                            >
                                                                                {'Outdoor apparel and gear, including custom camo individually created with college logos.'}
                                                                            </Paragraph>
                                                                        </View>
                                                                    </Card.Content>
                                                                </Card>
                                                                <View
                                                                    style={{width: Dimensions.get('window').width / 20}}/>
                                                                <Card
                                                                    style={styles.featuredPartnerCard}>
                                                                    <Card.Content>
                                                                        <View style={{flexDirection: 'column'}}>
                                                                            <View style={{
                                                                                flexDirection: 'row',
                                                                                marginTop: -10
                                                                            }}>
                                                                                <View>
                                                                                    <Card.Title
                                                                                        title={'Amigo Provisions Co.'}
                                                                                        subtitle={`3 Offers Available`}
                                                                                        titleStyle={styles.featuredPartnerCardTitle}
                                                                                        subtitleStyle={styles.featuredPartnerCardSubtitle}
                                                                                        titleNumberOfLines={5}
                                                                                        subtitleNumberOfLines={3}/>
                                                                                    <Button
                                                                                        uppercase={false}
                                                                                        disabled={false}
                                                                                        onPress={() => {
                                                                                            navigation.navigate('StoreOffer', {})
                                                                                        }}
                                                                                        style={[styles.featuredPartnerCardActionButton]}
                                                                                        textColor={"#313030"}
                                                                                        buttonColor={"#F2FF5D"}
                                                                                        mode="outlined"
                                                                                        labelStyle={styles.featuredPartnerCardActionButtonLabel}>
                                                                                        View Offers
                                                                                    </Button>
                                                                                </View>
                                                                                <View>
                                                                                    <Avatar
                                                                                        containerStyle={styles.featuredPartnerCardCover}
                                                                                        imageProps={{
                                                                                            resizeMode: 'stretch'
                                                                                        }}
                                                                                        source={{uri: 'https://www.flaticon.com/free-icon/facebook_5968764?term=logo&page=1&position=4&origin=search&related_id=5968764'}}
                                                                                    />
                                                                                </View>
                                                                            </View>
                                                                            <Paragraph
                                                                                style={styles.featuredPartnerCardParagraph}
                                                                            >
                                                                                {'Outdoor apparel and gear, including custom camo individually created with college logos.'}
                                                                            </Paragraph>
                                                                        </View>
                                                                    </Card.Content>
                                                                </Card>
                                                                <View
                                                                    style={{width: Dimensions.get('window').width / 20}}/>
                                                                <Card
                                                                    style={styles.featuredPartnerCard}>
                                                                    <Card.Content>
                                                                        <View style={{flexDirection: 'column'}}>
                                                                            <View style={{
                                                                                flexDirection: 'row',
                                                                                marginTop: -10
                                                                            }}>
                                                                                <View>
                                                                                    <Card.Title
                                                                                        title={'Amigo Provisions Co.'}
                                                                                        subtitle={`3 Offers Available`}
                                                                                        titleStyle={styles.featuredPartnerCardTitle}
                                                                                        subtitleStyle={styles.featuredPartnerCardSubtitle}
                                                                                        titleNumberOfLines={5}
                                                                                        subtitleNumberOfLines={3}/>
                                                                                    <Button
                                                                                        uppercase={false}
                                                                                        disabled={false}
                                                                                        onPress={() => {
                                                                                            navigation.navigate('StoreOffer', {})
                                                                                        }}
                                                                                        style={[styles.featuredPartnerCardActionButton]}
                                                                                        textColor={"#313030"}
                                                                                        buttonColor={"#F2FF5D"}
                                                                                        mode="outlined"
                                                                                        labelStyle={styles.featuredPartnerCardActionButtonLabel}>
                                                                                        View Offers
                                                                                    </Button>
                                                                                </View>
                                                                                <View>
                                                                                    <Avatar
                                                                                        containerStyle={styles.featuredPartnerCardCover}
                                                                                        imageProps={{
                                                                                            resizeMode: 'stretch'
                                                                                        }}
                                                                                        source={{uri: 'https://www.flaticon.com/free-icon/facebook_5968764?term=logo&page=1&position=4&origin=search&related_id=5968764'}}
                                                                                    />
                                                                                </View>
                                                                            </View>
                                                                            <Paragraph
                                                                                style={styles.featuredPartnerCardParagraph}
                                                                            >
                                                                                {'Outdoor apparel and gear, including custom camo individually created with college logos.'}
                                                                            </Paragraph>
                                                                        </View>
                                                                    </Card.Content>
                                                                </Card>
                                                                <View
                                                                    style={{width: Dimensions.get('window').width / 20}}/>
                                                                <Card
                                                                    style={styles.featuredPartnerCard}>
                                                                    <Card.Content>
                                                                        <View style={{flexDirection: 'column'}}>
                                                                            <View style={{
                                                                                flexDirection: 'row',
                                                                                marginTop: -10
                                                                            }}>
                                                                                <View>
                                                                                    <Card.Title
                                                                                        title={'Amigo Provisions Co.'}
                                                                                        subtitle={`3 Offers Available`}
                                                                                        titleStyle={styles.featuredPartnerCardTitle}
                                                                                        subtitleStyle={styles.featuredPartnerCardSubtitle}
                                                                                        titleNumberOfLines={5}
                                                                                        subtitleNumberOfLines={3}/>
                                                                                    <Button
                                                                                        uppercase={false}
                                                                                        disabled={false}
                                                                                        onPress={() => {
                                                                                            navigation.navigate('StoreOffer', {})
                                                                                        }}
                                                                                        style={[styles.featuredPartnerCardActionButton]}
                                                                                        textColor={"#313030"}
                                                                                        buttonColor={"#F2FF5D"}
                                                                                        mode="outlined"
                                                                                        labelStyle={styles.featuredPartnerCardActionButtonLabel}>
                                                                                        View Offers
                                                                                    </Button>
                                                                                </View>
                                                                                <View>
                                                                                    <Avatar
                                                                                        containerStyle={styles.featuredPartnerCardCover}
                                                                                        imageProps={{
                                                                                            resizeMode: 'stretch'
                                                                                        }}
                                                                                        source={{uri: 'https://www.flaticon.com/free-icon/facebook_5968764?term=logo&page=1&position=4&origin=search&related_id=5968764'}}
                                                                                    />
                                                                                </View>
                                                                            </View>
                                                                            <Paragraph
                                                                                style={styles.featuredPartnerCardParagraph}
                                                                            >
                                                                                {'Outdoor apparel and gear, including custom camo individually created with college logos.'}
                                                                            </Paragraph>
                                                                        </View>
                                                                    </Card.Content>
                                                                </Card>
                                                                <View
                                                                    style={{width: Dimensions.get('window').width / 10}}/>
                                                            </>
                                                        }
                                                    </ScrollView>
                                                </View>
                                                <View style={styles.nearbyOffersView}>
                                                    <View style={styles.nearbyOffersTitleView}>
                                                        <View style={styles.nearbyOffersLeftTitleView}>
                                                            <Text style={styles.nearbyOffersTitle}>
                                                                Offers near you
                                                            </Text>
                                                            <Text style={styles.nearbyOffersTitleSub}>
                                                                (within 25 miles)
                                                            </Text>
                                                        </View>
                                                        <TouchableOpacity onPress={() => {
                                                            setToggleViewPressed('vertical');
                                                        }}>
                                                            <Text style={styles.nearbyOffersTitleButton}>
                                                                See All
                                                            </Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                    <ScrollView
                                                        horizontal={true}
                                                        decelerationRate={"fast"}
                                                        snapToInterval={Dimensions.get('window').width / 1.3}
                                                        snapToAlignment={"start"}
                                                        scrollEnabled={true}
                                                        persistentScrollbar={false}
                                                        showsHorizontalScrollIndicator={false}>
                                                        {
                                                            <>
                                                                <Card
                                                                    style={styles.nearbyOfferCard}>
                                                                    <Card.Content>
                                                                        <View style={{flexDirection: 'column'}}>
                                                                            <View style={styles.offerMapView}>
                                                                                <MapView
                                                                                    zoomControlEnabled={true}
                                                                                    ref={mapViewRef}
                                                                                    style={[StyleSheet.absoluteFillObject, {borderRadius: 15}]}
                                                                                >
                                                                                    {nearbyOfferStoreGeoLocation &&
                                                                                        <Marker
                                                                                            onPress={async () => {
                                                                                                await retrieveNearbyOfferGeolocation('11414 W Nadine Way, Peoria, AZ, 85383');
                                                                                            }}
                                                                                            coordinate={{
                                                                                                latitude: nearbyOfferStoreGeoLocation.latitude!,
                                                                                                longitude: nearbyOfferStoreGeoLocation.longitude!
                                                                                            }}
                                                                                        >
                                                                                            <TouchableOpacity
                                                                                                onPress={async () => {
                                                                                                    await retrieveNearbyOfferGeolocation('11414 W Nadine Way, Peoria, AZ, 85383');
                                                                                                }}>
                                                                                                <View
                                                                                                    style={styles.mapTooltipArrow}/>
                                                                                                <View
                                                                                                    style={styles.mapTooltip}>
                                                                                                    <View
                                                                                                        style={styles.mapTooltipArrowOverlay}/>
                                                                                                    <View
                                                                                                        style={styles.mapTooltipSquare}/>
                                                                                                </View>
                                                                                                <View
                                                                                                    style={styles.toolTipDetailsView}>
                                                                                                    <Image
                                                                                                        style={styles.toolTipImageDetail}
                                                                                                        resizeMethod={"scale"}
                                                                                                        resizeMode={'cover'}
                                                                                                        source={{
                                                                                                            uri: 'https://www.flaticon.com/free-icon/facebook_5968764?term=logo&page=1&position=4&origin=search&related_id=5968764',
                                                                                                            height: Dimensions.get('window').height / 40,
                                                                                                            width: Dimensions.get('window').width / 18
                                                                                                        }}
                                                                                                    />
                                                                                                    <Text
                                                                                                        style={styles.toolTipImagePrice}>
                                                                                                        {'15%'}
                                                                                                    </Text>
                                                                                                </View>
                                                                                            </TouchableOpacity>
                                                                                        </Marker>
                                                                                    }
                                                                                </MapView>
                                                                            </View>
                                                                            <Card.Title
                                                                                title={'Amigo Provisions Co.'}
                                                                                subtitle={`📍 1.5 miles away`}
                                                                                titleStyle={styles.nearbyOfferCardTitle}
                                                                                subtitleStyle={styles.nearbyOfferCardSubtitle}
                                                                                titleNumberOfLines={5}
                                                                                subtitleNumberOfLines={3}/>
                                                                            <Button
                                                                                uppercase={false}
                                                                                disabled={false}
                                                                                onPress={() => {
                                                                                    navigation.navigate('StoreOffer', {})
                                                                                }}
                                                                                style={[styles.nearbyOfferCardActionButton]}
                                                                                textColor={"#313030"}
                                                                                buttonColor={"#F2FF5D"}
                                                                                mode="outlined"
                                                                                labelStyle={styles.nearbyOfferCardActionButtonLabel}>
                                                                                View Offer
                                                                            </Button>
                                                                        </View>
                                                                    </Card.Content>
                                                                </Card>
                                                                <View style={{width: Dimensions.get('window').width / 20}}/>
                                                                <Card
                                                                    style={styles.nearbyOfferCard}>
                                                                    <Card.Content>
                                                                        <View style={{flexDirection: 'column'}}>
                                                                            <View style={styles.offerMapView}>
                                                                                <MapView
                                                                                    zoomControlEnabled={true}
                                                                                    ref={mapViewRef}
                                                                                    style={[StyleSheet.absoluteFillObject, {borderRadius: 15}]}
                                                                                >
                                                                                    {nearbyOfferStoreGeoLocation &&
                                                                                        <Marker
                                                                                            onPress={async () => {
                                                                                                await retrieveNearbyOfferGeolocation('11414 W Nadine Way, Peoria, AZ, 85383');
                                                                                            }}
                                                                                            coordinate={{
                                                                                                latitude: nearbyOfferStoreGeoLocation.latitude!,
                                                                                                longitude: nearbyOfferStoreGeoLocation.longitude!
                                                                                            }}
                                                                                        >
                                                                                            <TouchableOpacity
                                                                                                onPress={async () => {
                                                                                                    await retrieveNearbyOfferGeolocation('11414 W Nadine Way, Peoria, AZ, 85383');
                                                                                                }}>
                                                                                                <View
                                                                                                    style={styles.mapTooltipArrow}/>
                                                                                                <View
                                                                                                    style={styles.mapTooltip}>
                                                                                                    <View
                                                                                                        style={styles.mapTooltipArrowOverlay}/>
                                                                                                    <View
                                                                                                        style={styles.mapTooltipSquare}/>
                                                                                                </View>
                                                                                                <View
                                                                                                    style={styles.toolTipDetailsView}>
                                                                                                    <Image
                                                                                                        style={styles.toolTipImageDetail}
                                                                                                        resizeMethod={"scale"}
                                                                                                        resizeMode={'cover'}
                                                                                                        source={{
                                                                                                            uri: 'https://www.flaticon.com/free-icon/facebook_5968764?term=logo&page=1&position=4&origin=search&related_id=5968764',
                                                                                                            height: Dimensions.get('window').height / 40,
                                                                                                            width: Dimensions.get('window').width / 18
                                                                                                        }}
                                                                                                    />
                                                                                                    <Text
                                                                                                        style={styles.toolTipImagePrice}>
                                                                                                        {'15%'}
                                                                                                    </Text>
                                                                                                </View>
                                                                                            </TouchableOpacity>
                                                                                        </Marker>
                                                                                    }
                                                                                </MapView>
                                                                            </View>
                                                                            <Card.Title
                                                                                title={'Amigo Provisions Co.'}
                                                                                subtitle={`📍 1.5 miles away`}
                                                                                titleStyle={styles.nearbyOfferCardTitle}
                                                                                subtitleStyle={styles.nearbyOfferCardSubtitle}
                                                                                titleNumberOfLines={5}
                                                                                subtitleNumberOfLines={3}/>
                                                                            <Button
                                                                                uppercase={false}
                                                                                disabled={false}
                                                                                onPress={() => {
                                                                                    navigation.navigate('StoreOffer', {})
                                                                                }}
                                                                                style={[styles.nearbyOfferCardActionButton]}
                                                                                textColor={"#313030"}
                                                                                buttonColor={"#F2FF5D"}
                                                                                mode="outlined"
                                                                                labelStyle={styles.nearbyOfferCardActionButtonLabel}>
                                                                                View Offer
                                                                            </Button>
                                                                        </View>
                                                                    </Card.Content>
                                                                </Card>
                                                                <View style={{width: Dimensions.get('window').width / 20}}/>
                                                                <Card
                                                                    style={styles.nearbyOfferCard}>
                                                                    <Card.Content>
                                                                        <View style={{flexDirection: 'column'}}>
                                                                            <View style={styles.offerMapView}>
                                                                                <MapView
                                                                                    zoomControlEnabled={true}
                                                                                    ref={mapViewRef}
                                                                                    style={[StyleSheet.absoluteFillObject, {borderRadius: 15}]}
                                                                                >
                                                                                    {nearbyOfferStoreGeoLocation &&
                                                                                        <Marker
                                                                                            onPress={async () => {
                                                                                                await retrieveNearbyOfferGeolocation('11414 W Nadine Way, Peoria, AZ, 85383');
                                                                                            }}
                                                                                            coordinate={{
                                                                                                latitude: nearbyOfferStoreGeoLocation.latitude!,
                                                                                                longitude: nearbyOfferStoreGeoLocation.longitude!
                                                                                            }}
                                                                                        >
                                                                                            <TouchableOpacity
                                                                                                onPress={async () => {
                                                                                                    await retrieveNearbyOfferGeolocation('11414 W Nadine Way, Peoria, AZ, 85383');
                                                                                                }}>
                                                                                                <View
                                                                                                    style={styles.mapTooltipArrow}/>
                                                                                                <View
                                                                                                    style={styles.mapTooltip}>
                                                                                                    <View
                                                                                                        style={styles.mapTooltipArrowOverlay}/>
                                                                                                    <View
                                                                                                        style={styles.mapTooltipSquare}/>
                                                                                                </View>
                                                                                                <View
                                                                                                    style={styles.toolTipDetailsView}>
                                                                                                    <Image
                                                                                                        style={styles.toolTipImageDetail}
                                                                                                        resizeMethod={"scale"}
                                                                                                        resizeMode={'cover'}
                                                                                                        source={{
                                                                                                            uri: 'https://www.flaticon.com/free-icon/facebook_5968764?term=logo&page=1&position=4&origin=search&related_id=5968764',
                                                                                                            height: Dimensions.get('window').height / 40,
                                                                                                            width: Dimensions.get('window').width / 18
                                                                                                        }}
                                                                                                    />
                                                                                                    <Text
                                                                                                        style={styles.toolTipImagePrice}>
                                                                                                        {'15%'}
                                                                                                    </Text>
                                                                                                </View>
                                                                                            </TouchableOpacity>
                                                                                        </Marker>
                                                                                    }
                                                                                </MapView>
                                                                            </View>
                                                                            <Card.Title
                                                                                title={'Amigo Provisions Co.'}
                                                                                subtitle={`📍 1.5 miles away`}
                                                                                titleStyle={styles.nearbyOfferCardTitle}
                                                                                subtitleStyle={styles.nearbyOfferCardSubtitle}
                                                                                titleNumberOfLines={5}
                                                                                subtitleNumberOfLines={3}/>
                                                                            <Button
                                                                                uppercase={false}
                                                                                disabled={false}
                                                                                onPress={() => {
                                                                                    navigation.navigate('StoreOffer', {})
                                                                                }}
                                                                                style={[styles.nearbyOfferCardActionButton]}
                                                                                textColor={"#313030"}
                                                                                buttonColor={"#F2FF5D"}
                                                                                mode="outlined"
                                                                                labelStyle={styles.nearbyOfferCardActionButtonLabel}>
                                                                                View Offer
                                                                            </Button>
                                                                        </View>
                                                                    </Card.Content>
                                                                </Card>
                                                                <View style={{width: Dimensions.get('window').width / 20}}/>
                                                                <Card
                                                                    style={styles.nearbyOfferCard}>
                                                                    <Card.Content>
                                                                        <View style={{flexDirection: 'column'}}>
                                                                            <View style={styles.offerMapView}>
                                                                                <MapView
                                                                                    zoomControlEnabled={true}
                                                                                    ref={mapViewRef}
                                                                                    style={[StyleSheet.absoluteFillObject, {borderRadius: 15}]}
                                                                                >
                                                                                    {nearbyOfferStoreGeoLocation &&
                                                                                        <Marker
                                                                                            onPress={async () => {
                                                                                                await retrieveNearbyOfferGeolocation('11414 W Nadine Way, Peoria, AZ, 85383');
                                                                                            }}
                                                                                            coordinate={{
                                                                                                latitude: nearbyOfferStoreGeoLocation.latitude!,
                                                                                                longitude: nearbyOfferStoreGeoLocation.longitude!
                                                                                            }}
                                                                                        >
                                                                                            <TouchableOpacity
                                                                                                onPress={async () => {
                                                                                                    await retrieveNearbyOfferGeolocation('11414 W Nadine Way, Peoria, AZ, 85383');
                                                                                                }}>
                                                                                                <View
                                                                                                    style={styles.mapTooltipArrow}/>
                                                                                                <View
                                                                                                    style={styles.mapTooltip}>
                                                                                                    <View
                                                                                                        style={styles.mapTooltipArrowOverlay}/>
                                                                                                    <View
                                                                                                        style={styles.mapTooltipSquare}/>
                                                                                                </View>
                                                                                                <View
                                                                                                    style={styles.toolTipDetailsView}>
                                                                                                    <Image
                                                                                                        style={styles.toolTipImageDetail}
                                                                                                        resizeMethod={"scale"}
                                                                                                        resizeMode={'cover'}
                                                                                                        source={{
                                                                                                            uri: 'https://www.flaticon.com/free-icon/facebook_5968764?term=logo&page=1&position=4&origin=search&related_id=5968764',
                                                                                                            height: Dimensions.get('window').height / 40,
                                                                                                            width: Dimensions.get('window').width / 18
                                                                                                        }}
                                                                                                    />
                                                                                                    <Text
                                                                                                        style={styles.toolTipImagePrice}>
                                                                                                        {'15%'}
                                                                                                    </Text>
                                                                                                </View>
                                                                                            </TouchableOpacity>
                                                                                        </Marker>
                                                                                    }
                                                                                </MapView>
                                                                            </View>
                                                                            <Card.Title
                                                                                title={'Amigo Provisions Co.'}
                                                                                subtitle={`📍 1.5 miles away`}
                                                                                titleStyle={styles.nearbyOfferCardTitle}
                                                                                subtitleStyle={styles.nearbyOfferCardSubtitle}
                                                                                titleNumberOfLines={5}
                                                                                subtitleNumberOfLines={3}/>
                                                                            <Button
                                                                                uppercase={false}
                                                                                disabled={false}
                                                                                onPress={() => {
                                                                                    navigation.navigate('StoreOffer', {})
                                                                                }}
                                                                                style={[styles.nearbyOfferCardActionButton]}
                                                                                textColor={"#313030"}
                                                                                buttonColor={"#F2FF5D"}
                                                                                mode="outlined"
                                                                                labelStyle={styles.nearbyOfferCardActionButtonLabel}>
                                                                                View Offer
                                                                            </Button>
                                                                        </View>
                                                                    </Card.Content>
                                                                </Card>
                                                                <View style={{width: Dimensions.get('window').width / 15}}/>
                                                            </>
                                                        }
                                                    </ScrollView>
                                                </View>
                                                <View style={styles.onlineOffersView}>
                                                    <View style={styles.onlineOffersTitleView}>
                                                        <View style={styles.onlineOffersLeftTitleView}>
                                                            <Text style={styles.onlineOffersTitle}>
                                                                Shop Online at
                                                            </Text>
                                                        </View>
                                                        <TouchableOpacity onPress={() => {
                                                            setToggleViewPressed('vertical');
                                                        }}>
                                                            <Text style={styles.onlineOffersTitleButton}>
                                                                See All
                                                            </Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                    <ScrollView
                                                        style={styles.onlineOffersScrollView}
                                                        horizontal={true}
                                                        decelerationRate={"fast"}
                                                        snapToInterval={Dimensions.get('window').width / 3 * 3}
                                                        snapToAlignment={"start"}
                                                        scrollEnabled={true}
                                                        persistentScrollbar={false}
                                                        showsHorizontalScrollIndicator={false}
                                                    >
                                                        {
                                                            <>
                                                                <TouchableOpacity style={{left: '3%'}} onPress={() => {
                                                                    navigation.navigate('StoreOffer', {});
                                                                }}>
                                                                    <Card style={styles.onlineOfferCard}>
                                                                        <Card.Content>
                                                                            <View style={{flexDirection: 'column'}}>
                                                                                <Avatar
                                                                                    containerStyle={styles.onlineOfferCardCover}
                                                                                    imageProps={{
                                                                                        resizeMode: 'stretch'
                                                                                    }}
                                                                                    size={25}
                                                                                    source={{uri: 'https://www.flaticon.com/free-icon/facebook_5968764?term=logo&page=1&position=4&origin=search&related_id=5968764'}}
                                                                                />
                                                                                <Paragraph style={styles.onlineOfferCardTitle}>
                                                                                    {'Daily Drip Coffee & Desserts'}
                                                                                </Paragraph>
                                                                                <Paragraph style={styles.onlineOfferCardSubtitle}>
                                                                                    {`15% Discount`}
                                                                                </Paragraph>
                                                                            </View>
                                                                        </Card.Content>
                                                                    </Card>
                                                                    <View style={{width: Dimensions.get('window').width / 15}}/>
                                                                </TouchableOpacity>
                                                                <TouchableOpacity style={{left: '3%'}} onPress={() => {
                                                                    navigation.navigate('StoreOffer', {});
                                                                }}>
                                                                    <Card style={styles.onlineOfferCard}>
                                                                        <Card.Content>
                                                                            <View style={{flexDirection: 'column'}}>
                                                                                <Avatar
                                                                                    containerStyle={styles.onlineOfferCardCover}
                                                                                    imageProps={{
                                                                                        resizeMode: 'stretch'
                                                                                    }}
                                                                                    size={25}
                                                                                    source={{uri: 'https://www.flaticon.com/free-icon/facebook_5968764?term=logo&page=1&position=4&origin=search&related_id=5968764'}}
                                                                                />
                                                                                <Paragraph style={styles.onlineOfferCardTitle}>
                                                                                    {'Daily Drip Coffee & Desserts'}
                                                                                </Paragraph>
                                                                                <Paragraph style={styles.onlineOfferCardSubtitle}>
                                                                                    {`15% Discount`}
                                                                                </Paragraph>
                                                                            </View>
                                                                        </Card.Content>
                                                                    </Card>
                                                                    <View style={{width: Dimensions.get('window').width / 15}}/>
                                                                </TouchableOpacity>
                                                                <TouchableOpacity style={{left: '3%'}} onPress={() => {
                                                                    navigation.navigate('StoreOffer', {});
                                                                }}>
                                                                    <Card style={styles.onlineOfferCard}>
                                                                        <Card.Content>
                                                                            <View style={{flexDirection: 'column'}}>
                                                                                <Avatar
                                                                                    containerStyle={styles.onlineOfferCardCover}
                                                                                    imageProps={{
                                                                                        resizeMode: 'stretch'
                                                                                    }}
                                                                                    size={25}
                                                                                    source={{uri: 'https://www.flaticon.com/free-icon/facebook_5968764?term=logo&page=1&position=4&origin=search&related_id=5968764'}}
                                                                                />
                                                                                <Paragraph style={styles.onlineOfferCardTitle}>
                                                                                    {'Daily Drip Coffee & Desserts'}
                                                                                </Paragraph>
                                                                                <Paragraph style={styles.onlineOfferCardSubtitle}>
                                                                                    {`15% Discount`}
                                                                                </Paragraph>
                                                                            </View>
                                                                        </Card.Content>
                                                                    </Card>
                                                                    <View style={{width: Dimensions.get('window').width / 15}}/>
                                                                </TouchableOpacity>
                                                                <TouchableOpacity style={{left: '3%'}} onPress={() => {
                                                                    navigation.navigate('StoreOffer', {});
                                                                }}>
                                                                    <Card style={styles.onlineOfferCard}>
                                                                        <Card.Content>
                                                                            <View style={{flexDirection: 'column'}}>
                                                                                <Avatar
                                                                                    containerStyle={styles.onlineOfferCardCover}
                                                                                    imageProps={{
                                                                                        resizeMode: 'stretch'
                                                                                    }}
                                                                                    size={25}
                                                                                    source={{uri: 'https://www.flaticon.com/free-icon/facebook_5968764?term=logo&page=1&position=4&origin=search&related_id=5968764'}}
                                                                                />
                                                                                <Paragraph style={styles.onlineOfferCardTitle}>
                                                                                    {'Daily Drip Coffee & Desserts'}
                                                                                </Paragraph>
                                                                                <Paragraph style={styles.onlineOfferCardSubtitle}>
                                                                                    {`15% Discount`}
                                                                                </Paragraph>
                                                                            </View>
                                                                        </Card.Content>
                                                                    </Card>
                                                                    <View style={{width: Dimensions.get('window').width / 15}}/>
                                                                </TouchableOpacity>
                                                                <TouchableOpacity style={{left: '3%'}} onPress={() => {
                                                                    navigation.navigate('StoreOffer', {});
                                                                }}>
                                                                    <Card style={styles.onlineOfferCard}>
                                                                        <Card.Content>
                                                                            <View style={{flexDirection: 'column'}}>
                                                                                <Avatar
                                                                                    containerStyle={styles.onlineOfferCardCover}
                                                                                    imageProps={{
                                                                                        resizeMode: 'stretch'
                                                                                    }}
                                                                                    size={25}
                                                                                    source={{uri: 'https://www.flaticon.com/free-icon/facebook_5968764?term=logo&page=1&position=4&origin=search&related_id=5968764'}}
                                                                                />
                                                                                <Paragraph style={styles.onlineOfferCardTitle}>
                                                                                    {'Daily Drip Coffee & Desserts'}
                                                                                </Paragraph>
                                                                                <Paragraph style={styles.onlineOfferCardSubtitle}>
                                                                                    {`15% Discount`}
                                                                                </Paragraph>
                                                                            </View>
                                                                        </Card.Content>
                                                                    </Card>
                                                                    <View style={{width: Dimensions.get('window').width / 15}}/>
                                                                </TouchableOpacity>
                                                                <TouchableOpacity style={{left: '3%'}} onPress={() => {
                                                                    navigation.navigate('StoreOffer', {});
                                                                }}>
                                                                    <Card style={styles.onlineOfferCard}>
                                                                        <Card.Content>
                                                                            <View style={{flexDirection: 'column'}}>
                                                                                <Avatar
                                                                                    containerStyle={styles.onlineOfferCardCover}
                                                                                    imageProps={{
                                                                                        resizeMode: 'stretch'
                                                                                    }}
                                                                                    size={25}
                                                                                    source={{uri: 'https://www.flaticon.com/free-icon/facebook_5968764?term=logo&page=1&position=4&origin=search&related_id=5968764'}}
                                                                                />
                                                                                <Paragraph style={styles.onlineOfferCardTitle}>
                                                                                    {'Daily Drip Coffee & Desserts'}
                                                                                </Paragraph>
                                                                                <Paragraph style={styles.onlineOfferCardSubtitle}>
                                                                                    {`15% Discount`}
                                                                                </Paragraph>
                                                                            </View>
                                                                        </Card.Content>
                                                                    </Card>
                                                                    <View style={{width: Dimensions.get('window').width / 15}}/>
                                                                </TouchableOpacity>
                                                                <TouchableOpacity style={{left: '3%'}} onPress={() => {
                                                                    navigation.navigate('StoreOffer', {});
                                                                }}>
                                                                    <Card style={styles.onlineOfferCard}>
                                                                        <Card.Content>
                                                                            <View style={{flexDirection: 'column'}}>
                                                                                <Avatar
                                                                                    containerStyle={styles.onlineOfferCardCover}
                                                                                    imageProps={{
                                                                                        resizeMode: 'stretch'
                                                                                    }}
                                                                                    size={25}
                                                                                    source={{uri: 'https://www.flaticon.com/free-icon/facebook_5968764?term=logo&page=1&position=4&origin=search&related_id=5968764'}}
                                                                                />
                                                                                <Paragraph style={styles.onlineOfferCardTitle}>
                                                                                    {'Daily Drip Coffee & Desserts'}
                                                                                </Paragraph>
                                                                                <Paragraph style={styles.onlineOfferCardSubtitle}>
                                                                                    {`15% Discount`}
                                                                                </Paragraph>
                                                                            </View>
                                                                        </Card.Content>
                                                                    </Card>
                                                                    <View style={{width: Dimensions.get('window').width / 15}}/>
                                                                </TouchableOpacity>
                                                                <TouchableOpacity style={{left: '3%'}} onPress={() => {
                                                                    navigation.navigate('StoreOffer', {});
                                                                }}>
                                                                    <Card style={styles.onlineOfferCard}>
                                                                        <Card.Content>
                                                                            <View style={{flexDirection: 'column'}}>
                                                                                <Avatar
                                                                                    containerStyle={styles.onlineOfferCardCover}
                                                                                    imageProps={{
                                                                                        resizeMode: 'stretch'
                                                                                    }}
                                                                                    size={25}
                                                                                    source={{uri: 'https://www.flaticon.com/free-icon/facebook_5968764?term=logo&page=1&position=4&origin=search&related_id=5968764'}}
                                                                                />
                                                                                <Paragraph style={styles.onlineOfferCardTitle}>
                                                                                    {'Daily Drip Coffee & Desserts'}
                                                                                </Paragraph>
                                                                                <Paragraph style={styles.onlineOfferCardSubtitle}>
                                                                                    {`15% Discount`}
                                                                                </Paragraph>
                                                                            </View>
                                                                        </Card.Content>
                                                                    </Card>
                                                                    <View style={{width: Dimensions.get('window').width / 15}}/>
                                                                </TouchableOpacity>
                                                                <TouchableOpacity style={{left: '3%'}} onPress={() => {
                                                                    navigation.navigate('StoreOffer', {});
                                                                }}>
                                                                    <Card style={styles.onlineOfferCard}>
                                                                        <Card.Content>
                                                                            <View style={{flexDirection: 'column'}}>
                                                                                <Avatar
                                                                                    containerStyle={styles.onlineOfferCardCover}
                                                                                    imageProps={{
                                                                                        resizeMode: 'stretch'
                                                                                    }}
                                                                                    size={25}
                                                                                    source={{uri: 'https://www.flaticon.com/free-icon/facebook_5968764?term=logo&page=1&position=4&origin=search&related_id=5968764'}}
                                                                                />
                                                                                <Paragraph style={styles.onlineOfferCardTitle}>
                                                                                    {'Daily Drip Coffee & Desserts'}
                                                                                </Paragraph>
                                                                                <Paragraph style={styles.onlineOfferCardSubtitle}>
                                                                                    {`15% Discount`}
                                                                                </Paragraph>
                                                                            </View>
                                                                        </Card.Content>
                                                                    </Card>
                                                                    <View style={{width: Dimensions.get('window').width / 15}}/>
                                                                </TouchableOpacity>
                                                            </>
                                                        }
                                                    </ScrollView>
                                                </View>
                                            </View>
                                        </>
                                    }
                                </ScrollView>
                            </View>
                        </SafeAreaView>
                    </KeyboardAwareScrollView>
            }
        </>
    );
};
