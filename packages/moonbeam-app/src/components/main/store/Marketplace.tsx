import 'react-native-get-random-values';
import React, {useEffect, useState} from "react";
import {Dimensions, ScrollView, TouchableOpacity, View} from "react-native";
import {styles} from "../../../styles/marketplace.module";
import {MarketplaceProps} from "../../../models/StoreStackProps";
import {Button, Card, Chip, List, Paragraph, Searchbar, Text, ToggleButton} from "react-native-paper";
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
// @ts-ignore
import BattleThreadsLogo from "../../../../assets/companies/battleThreads.jpg";
import {CommonActions} from "@react-navigation/native";
import {listPartnerStores, PartnerStore} from "@moonbeam/moonbeam-models";
import {API, Cache, graphqlOperation} from "aws-amplify";
import {PartnerMerchantType} from "../../../../../moonbeam-models/src";
import {dynamicSort} from "../../../utils/Main";
import {Spinner} from "../../../common/Spinner";
import {Avatar} from '@rneui/base';

/**
 * Marketplace component.
 */
export const Marketplace = ({route, navigation}: MarketplaceProps) => {
    // state driven key-value pairs for UI related elements
    const [isReady, setIsReady] = useState<boolean>(false);
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
    const [toggleViewPressed, setToggleViewPressed] = useState<string>('horizontal');

    // state driven key-value pairs for any specific data values
    const [searchQuery, setSearchQuery] = React.useState('');
    const [partnerList, setPartnerList] = useState<PartnerStore[]>([]);
    const [featuredPartnerList, setFeaturedPartnerList] = useState<PartnerStore[]>([]);
    const [nonFeaturedPartnerList, setNonFeaturedPartnerList] = useState<PartnerStore[]>([]);
    const [filteredPartnerList, setFilteredPartnerList] = useState<PartnerStore[]>([]);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // change the filtered partner list, based on the search query
        if (searchQuery !== '') {
            switch (searchQuery) {
                case 'sort by: points':
                    setFilteredPartnerList(
                        partnerList.sort((a, b) =>
                            parseInt(a.pointsMultiplier.split('x')[0]) > parseInt(b.pointsMultiplier.split('x')[0])
                                ? -1
                                : parseInt(a.pointsMultiplier.split('x')[0]) < parseInt(b.pointsMultiplier.split('x')[0])
                                    ? 1
                                    : 0
                        )
                    )
                    break;
                case 'sort by: discount percentage':
                    setFilteredPartnerList(
                        partnerList.sort((a, b) =>
                            a.discountPercentage > b.discountPercentage ? -1 : a.discountPercentage < b.discountPercentage ? 1 : 0)
                    )
                    break;
                default:
                    searchQuery !== '' && setFilteredPartnerList(partnerList.filter(
                        partner => {
                            return (
                                partner
                                    .name
                                    .toLowerCase()
                                    .includes(searchQuery.toLowerCase())
                            );
                        }
                    ));
                    break;
            }
            setToggleViewPressed('vertical');
        }
        searchQuery === '' && setFilteredPartnerList([]);

        // set up the views after retrieving the partner merchants
        retrieveMarketplacePartnersByType(PartnerMerchantType.Featured).then((featuredPartners) => {
            retrieveMarketplacePartnersByType(PartnerMerchantType.NonFeatured).then((nonFeaturedPartners) => {

                // sort the marketplace partners alphabetically (featured and non-featured)
                featuredPartners.sort(dynamicSort("name"));
                nonFeaturedPartners.sort(dynamicSort("name"));

                // merge the marketplace partners (featured and non-featured) into an array
                let tempPartnerList = [...featuredPartners, ...nonFeaturedPartners];
                tempPartnerList.sort(dynamicSort("name"));

                setPartnerList(tempPartnerList);
                setFeaturedPartnerList(featuredPartners);
                setNonFeaturedPartnerList(nonFeaturedPartners);

                setIsReady(true);
            });
        });

        // if we get a redirect from the store web view
        if (route.params.storeDismissed) {
            // reset the flag appropriately
            navigation.dispatch({
                ...CommonActions.setParams({storeDismissed: false}),
                source: route.key
            });
            route.params.setBottomTabNavigationShown && route.params.setBottomTabNavigationShown(true);
        }
    }, [toggleViewPressed, searchQuery, route.params.storeDismissed]);

    /**
     * Function used to populate Marketplace/Partner horizontal view, depending on their type
     */
    const populateHorizontalPartnerList = (type: PartnerMerchantType): React.ReactNode | React.ReactNode[] => {
        let results: React.ReactNode[] = [];

        switch (type) {
            case PartnerMerchantType.Featured:
                if (featuredPartnerList.length !== 0) {
                    let featuredPartnerIndex = 0;
                    for (const featuredPartner of featuredPartnerList) {
                        results.push(
                            <>
                                <Card
                                    style={styles.featuredPartnerCard}>
                                    <Card.Content>
                                        <View style={{flexDirection: 'column'}}>
                                            <View style={{flexDirection: 'row', marginTop: -10}}>
                                                <View>
                                                    <Card.Title title={featuredPartner.name}
                                                                subtitle={`${featuredPartner.pointsMultiplier} Points\n${featuredPartner.discountPercentage}% Discount`}
                                                                titleStyle={[styles.featuredPartnerCardTitle, {
                                                                    width: Dimensions.get('window').width / 2
                                                                }]}
                                                                subtitleStyle={styles.featuredPartnerCardSubtitle}
                                                                titleNumberOfLines={2}
                                                                subtitleNumberOfLines={2}/>
                                                    <Button
                                                        uppercase={false}
                                                        disabled={false}
                                                        onPress={() => {
                                                            navigation.navigate('PartnerMerchant', {
                                                                partnerStore: featuredPartner,
                                                                currenUserInformation: route.params.currenUserInformation
                                                            })
                                                        }}
                                                        style={[styles.featuredPartnerCardActionButton]}
                                                        textColor={"#f2f2f2"}
                                                        buttonColor={"#2A3779"}
                                                        mode="outlined"
                                                        labelStyle={styles.featuredPartnerCardActionButtonLabel}>
                                                        Shop
                                                    </Button>
                                                </View>
                                                <View>
                                                    <Avatar
                                                        containerStyle={styles.featuredPartnerCardCover}
                                                        imageProps={{
                                                            resizeMode: 'stretch'
                                                        }}
                                                        size={130}
                                                        source={{uri: featuredPartner.logo}}
                                                    />
                                                </View>
                                            </View>
                                            <Paragraph
                                                style={styles.featuredPartnerCardParagraph}
                                            >
                                                {featuredPartner.description}
                                            </Paragraph>
                                        </View>
                                    </Card.Content>
                                </Card>
                                <View
                                    style={{width: featuredPartnerIndex === featuredPartnerList.length - 1 ? Dimensions.get('window').width / 10 : Dimensions.get('window').width / 20}}></View>
                            </>
                        );
                        featuredPartnerIndex++;
                    }
                }
                break;
            case PartnerMerchantType.NonFeatured:
                if (nonFeaturedPartnerList.length !== 0) {
                    let nonFeaturedPartnerIndex = 0;
                    for (const nonFeaturedPartner of nonFeaturedPartnerList) {
                        results.push(
                            <>
                                <TouchableOpacity style={{left: '3%'}} onPress={() => {
                                    navigation.navigate('PartnerMerchant', {
                                        partnerStore: nonFeaturedPartner,
                                        currenUserInformation: route.params.currenUserInformation
                                    });
                                }}>
                                    <Card style={styles.regularPartnerCard}>
                                        <Card.Content>
                                            <View style={{flexDirection: 'column'}}>
                                                <Avatar
                                                    containerStyle={styles.regularPartnerCardCover}
                                                    imageProps={{
                                                        resizeMode: 'stretch'
                                                    }}
                                                    size={25}
                                                    source={{uri: nonFeaturedPartner.logo}}
                                                />
                                                <Paragraph style={styles.regularPartnerCardTitle}>
                                                    {nonFeaturedPartner.name}
                                                </Paragraph>
                                                <Paragraph style={styles.regularPartnerCardSubtitle}>
                                                    {`${nonFeaturedPartner.pointsMultiplier} Points\n${nonFeaturedPartner.discountPercentage}% Discount`}
                                                </Paragraph>
                                            </View>
                                        </Card.Content>
                                    </Card>
                                </TouchableOpacity>
                                <View
                                    style={{width: nonFeaturedPartnerIndex === nonFeaturedPartnerList.length - 1 ? Dimensions.get('window').width / 100 : Dimensions.get('window').width / 1000}}></View>
                            </>
                        );
                        nonFeaturedPartnerIndex++;
                    }
                }
                break;
            default:
                break;
        }
        return results;
    }

    /**
     * Function used to populate Marketplace/Partner vertical view
     */
    const populateVerticalPartnerList = (): React.ReactNode | React.ReactNode[] => {
        let results: React.ReactNode[] = [];
        const listOfPartners = filteredPartnerList.length !== 0 ? filteredPartnerList : partnerList;

        if (listOfPartners.length !== 0) {
            for (const partner of listOfPartners) {
                results.push(
                    <>
                        <List.Item
                            onPress={() => {
                                navigation.navigate('PartnerMerchant', {
                                    partnerStore: partner,
                                    currenUserInformation: route.params.currenUserInformation
                                });
                            }}
                            style={{marginLeft: '2%'}}
                            titleStyle={styles.storeItemName}
                            descriptionStyle={styles.storeItemBenefits}
                            titleNumberOfLines={1}
                            descriptionNumberOfLines={1}
                            title={partner.name}
                            description={
                                <>
                                    <Text
                                        style={styles.storeItemBenefit}>{partner.pointsMultiplier}</Text>
                                    {" Points and "}
                                    <Text
                                        style={styles.storeItemBenefit}>{partner.discountPercentage}%</Text>
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
                                    source={{uri: partner.logo}}
                                />}
                            right={() => <List.Icon color={'#313030'} icon="chevron-right"/>}
                        />
                    </>
                );
            }
        }
        return results;
    }

    /**
     * Function used to retrieve Marketplace Partners, depending on their type
     *
     * @param type type of partner merchant
     */
    const retrieveMarketplacePartnersByType = async (type: PartnerMerchantType): Promise<PartnerStore[]> => {
        try {
            let merchantPartnerList: PartnerStore[];
            switch (type) {
                case PartnerMerchantType.Featured:
                    merchantPartnerList = featuredPartnerList;
                    break;
                case PartnerMerchantType.NonFeatured:
                    merchantPartnerList = nonFeaturedPartnerList;
                    break;
                default:
                    merchantPartnerList = partnerList;
                    break;
            }

            if (merchantPartnerList.length === 0) {
                // first check if there are Partner Merchants already loaded
                let retrievedPartnerMerchants = await Cache.getItem(`PartnerMerchants${type}`);
                if (retrievedPartnerMerchants && retrievedPartnerMerchants !== '{}' && Object.keys(retrievedPartnerMerchants).length !== 0) {
                    return JSON.parse(retrievedPartnerMerchants) as PartnerStore[];
                } else {
                    // perform the query to retrieve the Partner Merchant
                    const retrievedPartnerMerchantResult = await API.graphql(graphqlOperation(listPartnerStores, {
                        listPartnerStoresInput: {
                            type: type
                        }
                    }));
                    // @ts-ignore
                    if (retrievedPartnerMerchantResult && retrievedPartnerMerchantResult.data.listPartnerStores.errorMessage === null) {
                        // store the retrieved Partner Merchants in the store
                        await Cache.setItem(`PartnerMerchants${type}`,
                            // @ts-ignore
                            JSON.stringify(retrievedPartnerMerchantResult.data.listPartnerStores.data));

                        // @ts-ignore
                        return retrievedPartnerMerchantResult.data.listPartnerStores.data as PartnerStore[];
                    } else {
                        console.log(`Unexpected error while attempting to retrieve Partner Merchants ${JSON.stringify(retrievedPartnerMerchantResult)}`);
                        // ToDo: need to create a modal with errors

                        return [];
                    }
                }
            }
            return merchantPartnerList;
        } catch (error) {
            // @ts-ignore
            console.log(error.message
                // @ts-ignore
                ? `Unexpected error while retrieving Partner Merchants: ${JSON.stringify(error.message)}`
                : `Unexpected error while retrieving Partner Merchants: ${JSON.stringify(error)}`);
            // ToDo: need to create a modal with errors

            return [];
        }
    }

    // return the component for the Marketplace page
    return (
        <>
            {
                !isReady ?
                    <Spinner loadingSpinnerShown={loadingSpinnerShown}
                             setLoadingSpinnerShown={setLoadingSpinnerShown}/>
                    :
                    <KeyboardAwareScrollView
                        enableOnAndroid={true}
                        scrollEnabled={false}
                        keyboardShouldPersistTaps={'handled'}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={[styles.rowContainer, styles.androidSafeArea]}
                    >
                        <View style={[styles.mainView]}>
                            <View style={styles.titleView}>
                                <View style={{
                                    paddingRight: Dimensions.get('window').width / 8
                                }}>
                                    <Text style={styles.mainTitle}>
                                        Shop
                                        {"\n"}
                                        <Text style={styles.mainSubtitle}>
                                            at select merchant partners.
                                        </Text>
                                    </Text>
                                </View>
                                <ToggleButton.Group
                                    style={{}}
                                    onValueChange={(value) => {
                                        value === 'horizontal' && searchQuery !== '' && setSearchQuery('');
                                        value !== null && setToggleViewPressed(value);
                                    }}
                                    value={toggleViewPressed}>
                                    <ToggleButton
                                        style={styles.toggleViewButton}
                                        size={toggleViewPressed === 'horizontal' ? Dimensions.get('window').width / 15 : Dimensions.get('window').width / 18}
                                        icon="collage"
                                        value="horizontal"
                                        iconColor={toggleViewPressed === 'horizontal' ? '#A2B000' : '#babbbd'}
                                    />
                                    <ToggleButton
                                        style={styles.toggleViewButton}
                                        size={toggleViewPressed === 'vertical' ? Dimensions.get('window').width / 15 : Dimensions.get('window').width / 18}
                                        icon="format-list-bulleted-type"
                                        value="vertical"
                                        iconColor={toggleViewPressed === 'vertical' ? '#A2B000' : '#babbbd'}
                                    />
                                    <ToggleButton
                                        disabled={true}
                                        style={styles.toggleViewButton}
                                        size={toggleViewPressed === 'map' ? Dimensions.get('window').width / 15 : Dimensions.get('window').width / 18}
                                        icon="map-marker-radius"
                                        value="map"
                                        iconColor={toggleViewPressed === 'map' ? '#A2B000' : '#babbbd'}
                                    />
                                </ToggleButton.Group>
                            </View>
                            <Searchbar
                                selectionColor={'#2A3779'}
                                inputStyle={styles.searchBarInput}
                                style={styles.searchBar}
                                placeholder="Search for a merchant partner"
                                onChangeText={(query) => setSearchQuery(query)}
                                value={searchQuery}
                            />
                            <View style={styles.filterChipView}>
                                <Chip mode={'outlined'}
                                      style={[styles.filterChip, searchQuery === 'sort by: points' ? {backgroundColor: '#A2B000'} : {backgroundColor: 'white'}]}
                                      textStyle={styles.filterChipText} icon="file-excel-box-outline"
                                      onPress={() => {
                                          searchQuery === 'sort by: points' ? setSearchQuery('') : setSearchQuery('sort by: points');
                                      }}>Points</Chip>
                                <Chip mode={'outlined'}
                                      style={[styles.filterChip, searchQuery === 'sort by: discount percentage' ? {backgroundColor: '#A2B000'} : {backgroundColor: 'white'}]}
                                      textStyle={styles.filterChipText} icon="percent-outline"
                                      onPress={() => {
                                          searchQuery === 'sort by: discount percentage' ? setSearchQuery('') : setSearchQuery('sort by: discount percentage');
                                      }}>Discount</Chip>
                                <Chip mode={'outlined'} style={styles.filterChip}
                                      disabled={true}
                                      textStyle={styles.filterChipText} icon="map-marker"
                                      onPress={() => console.log('Pressed')}>Location</Chip>
                            </View>
                            <View style={styles.content}>
                                <ScrollView
                                    scrollEnabled={toggleViewPressed !== 'horizontal'}
                                    persistentScrollbar={false}
                                    showsVerticalScrollIndicator={false}
                                    keyboardShouldPersistTaps={'handled'}
                                >
                                    {
                                        (toggleViewPressed === 'vertical' || filteredPartnerList.length !== 0) &&
                                        <>
                                            <List.Section
                                                style={{width: Dimensions.get('window').width}}
                                            >
                                                {
                                                    populateVerticalPartnerList()
                                                }
                                            </List.Section>
                                        </>
                                    }
                                    {
                                        (toggleViewPressed === 'horizontal' && filteredPartnerList.length === 0) &&
                                        <>
                                            <View style={styles.horizontalScrollView}>
                                                <Text style={styles.listTitleText}>
                                                    Featured
                                                </Text>
                                                <ScrollView
                                                    style={styles.featuredPartnersScrollView}
                                                    horizontal={true}
                                                    decelerationRate={"fast"}
                                                    snapToInterval={Dimensions.get('window').width / 1.1}
                                                    snapToAlignment={"start"}
                                                    scrollEnabled={true}
                                                    persistentScrollbar={false}
                                                    showsHorizontalScrollIndicator={false}>
                                                    {
                                                        populateHorizontalPartnerList(PartnerMerchantType.Featured)
                                                    }
                                                </ScrollView>
                                                <View style={styles.allPartnersView}>
                                                    <Text style={styles.listTitle2Text}>
                                                        All Partners
                                                    </Text>
                                                    <TouchableOpacity onPress={() => {
                                                        setToggleViewPressed('vertical');
                                                    }}>
                                                        <Text style={styles.listTitleButton}>
                                                            See All
                                                        </Text>
                                                    </TouchableOpacity>
                                                </View>
                                                <ScrollView
                                                    style={styles.regularPartnersScrollView}
                                                    horizontal={true}
                                                    decelerationRate={"fast"}
                                                    snapToInterval={Dimensions.get('window').width / 3 * 3}
                                                    snapToAlignment={"start"}
                                                    scrollEnabled={true}
                                                    persistentScrollbar={false}
                                                    showsHorizontalScrollIndicator={false}>
                                                    {
                                                        populateHorizontalPartnerList(PartnerMerchantType.NonFeatured)
                                                    }
                                                </ScrollView>
                                            </View>
                                        </>
                                    }
                                </ScrollView>
                            </View>
                        </View>
                    </KeyboardAwareScrollView>
            }
        </>
    );
}
