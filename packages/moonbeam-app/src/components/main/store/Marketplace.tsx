import 'react-native-get-random-values';
import React, {useEffect, useState} from "react";
import {Dimensions, ScrollView, TouchableOpacity, View} from "react-native";
import {styles} from "../../../styles/marketplace.module";
import {MarketplaceProps} from "../../../models/StoreStackProps";
import {Avatar, Button, Card, Chip, List, Paragraph, Searchbar, Text, ToggleButton} from "react-native-paper";
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
// @ts-ignore
import BattleThreadsLogo from "../../../../assets/companies/battleThreads.jpg";

/**
 * Marketplace component.
 */
export const Marketplace = ({}: MarketplaceProps) => {
    // state driven key-value pairs for UI related elements
    const [toggleViewPressed, setToggleViewPressed] = useState<string>('horizontal');

    // state driven key-value pairs for any specific data values
    const [searchQuery, setSearchQuery] = React.useState('');
    const onChangeSearch = query => setSearchQuery(query);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {

    }, []);

    // return the component for the Marketplace page
    return (
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
                        onValueChange={value => setToggleViewPressed(value)}
                        value={toggleViewPressed}>
                        <ToggleButton
                            style={styles.toggleViewButton}
                            size={toggleViewPressed === 'horizontal' ? Dimensions.get('window').width / 15 : Dimensions.get('window').width / 18}
                            icon="collage"
                            value="horizontal"
                            iconColor={toggleViewPressed === 'horizontal' ? '#313030' : '#babbbd'}
                        />
                        <ToggleButton
                            style={styles.toggleViewButton}
                            size={toggleViewPressed === 'vertical' ? Dimensions.get('window').width / 15 : Dimensions.get('window').width / 18}
                            icon="format-list-bulleted-type"
                            value="vertical"
                            iconColor={toggleViewPressed === 'vertical' ? '#313030' : '#babbbd'}
                        />
                        <ToggleButton
                            disabled={true}
                            style={styles.toggleViewButton}
                            size={toggleViewPressed === 'map' ? Dimensions.get('window').width / 15 : Dimensions.get('window').width / 18}
                            icon="map-marker-radius"
                            value="map"
                            iconColor={toggleViewPressed === 'map' ? '#313030' : '#babbbd'}
                        />
                    </ToggleButton.Group>
                </View>
                <Searchbar
                    selectionColor={'#2A3779'}
                    inputStyle={styles.searchBarInput}
                    style={styles.searchBar}
                    placeholder="Search for a merchant partner"
                    onChangeText={onChangeSearch}
                    value={searchQuery}
                />
                <View style={styles.filterChipView}>
                    <Chip mode={'outlined'} style={styles.filterChip}
                          textStyle={styles.filterChipText} icon="file-excel-box-outline"
                          onPress={() => console.log('Pressed')}>Points</Chip>
                    <Chip mode={'outlined'} style={styles.filterChip}
                          textStyle={styles.filterChipText} icon="percent-outline"
                          onPress={() => console.log('Pressed')}>Discount</Chip>
                    <Chip mode={'outlined'} style={styles.filterChip}
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
                            toggleViewPressed === 'vertical' &&
                            <>
                                <List.Section
                                    style={{width: Dimensions.get('window').width}}
                                >
                                    <List.Item
                                        style={{marginLeft: '2%'}}
                                        titleStyle={styles.storeItemName}
                                        descriptionStyle={styles.storeItemBenefits}
                                        titleNumberOfLines={1}
                                        descriptionNumberOfLines={1}
                                        title="Battle Threads"
                                        description={
                                            <>
                                                <Text style={styles.storeItemBenefit}>3X</Text>
                                                {" Points and "}
                                                <Text style={styles.storeItemBenefit}>10%</Text>
                                                {" Discount "}
                                            </>
                                        }
                                        left={() => <Avatar.Image size={60} source={BattleThreadsLogo}/>}
                                        right={() => <List.Icon color={'#313030'} icon="chevron-right"/>}
                                    />
                                    <List.Item
                                        style={{marginLeft: '2%'}}
                                        titleStyle={styles.storeItemName}
                                        descriptionStyle={styles.storeItemBenefits}
                                        titleNumberOfLines={1}
                                        descriptionNumberOfLines={1}
                                        title="Battle Threads"
                                        description={
                                            <>
                                                <Text style={styles.storeItemBenefit}>3X</Text>
                                                {" Points and "}
                                                <Text style={styles.storeItemBenefit}>10%</Text>
                                                {" Discount "}
                                            </>
                                        }
                                        left={() => <Avatar.Image size={60} source={BattleThreadsLogo}/>}
                                        right={() => <List.Icon color={'#313030'} icon="chevron-right"/>}
                                    />
                                    <List.Item
                                        style={{marginLeft: '2%'}}
                                        titleStyle={styles.storeItemName}
                                        descriptionStyle={styles.storeItemBenefits}
                                        titleNumberOfLines={1}
                                        descriptionNumberOfLines={1}
                                        title="Battle Threads"
                                        description={
                                            <>
                                                <Text style={styles.storeItemBenefit}>3X</Text>
                                                {" Points and "}
                                                <Text style={styles.storeItemBenefit}>10%</Text>
                                                {" Discount "}
                                            </>
                                        }
                                        left={() => <Avatar.Image size={60} source={BattleThreadsLogo}/>}
                                        right={() => <List.Icon color={'#313030'} icon="chevron-right"/>}
                                    />
                                    <List.Item
                                        style={{marginLeft: '2%'}}
                                        titleStyle={styles.storeItemName}
                                        descriptionStyle={styles.storeItemBenefits}
                                        titleNumberOfLines={1}
                                        descriptionNumberOfLines={1}
                                        title="Battle Threads"
                                        description={
                                            <>
                                                <Text style={styles.storeItemBenefit}>3X</Text>
                                                {" Points and "}
                                                <Text style={styles.storeItemBenefit}>10%</Text>
                                                {" Discount "}
                                            </>
                                        }
                                        left={() => <Avatar.Image size={60} source={BattleThreadsLogo}/>}
                                        right={() => <List.Icon color={'#313030'} icon="chevron-right"/>}
                                    />
                                    <List.Item
                                        style={{marginLeft: '2%'}}
                                        titleStyle={styles.storeItemName}
                                        descriptionStyle={styles.storeItemBenefits}
                                        titleNumberOfLines={1}
                                        descriptionNumberOfLines={1}
                                        title="Battle Threads"
                                        description={
                                            <>
                                                <Text style={styles.storeItemBenefit}>3X</Text>
                                                {" Points and "}
                                                <Text style={styles.storeItemBenefit}>10%</Text>
                                                {" Discount "}
                                            </>
                                        }
                                        left={() => <Avatar.Image size={60} source={BattleThreadsLogo}/>}
                                        right={() => <List.Icon color={'#313030'} icon="chevron-right"/>}
                                    />
                                    <List.Item
                                        style={{marginLeft: '2%'}}
                                        titleStyle={styles.storeItemName}
                                        descriptionStyle={styles.storeItemBenefits}
                                        titleNumberOfLines={1}
                                        descriptionNumberOfLines={1}
                                        title="Battle Threads"
                                        description={
                                            <>
                                                <Text style={styles.storeItemBenefit}>3X</Text>
                                                {" Points and "}
                                                <Text style={styles.storeItemBenefit}>10%</Text>
                                                {" Discount "}
                                            </>
                                        }
                                        left={() => <Avatar.Image size={60} source={BattleThreadsLogo}/>}
                                        right={() => <List.Icon color={'#313030'} icon="chevron-right"/>}
                                    />
                                    <List.Item
                                        style={{marginLeft: '2%'}}
                                        titleStyle={styles.storeItemName}
                                        descriptionStyle={styles.storeItemBenefits}
                                        titleNumberOfLines={1}
                                        descriptionNumberOfLines={1}
                                        title="Battle Threads"
                                        description={
                                            <>
                                                <Text style={styles.storeItemBenefit}>3X</Text>
                                                {" Points and "}
                                                <Text style={styles.storeItemBenefit}>10%</Text>
                                                {" Discount "}
                                            </>
                                        }
                                        left={() => <Avatar.Image size={60} source={BattleThreadsLogo}/>}
                                        right={() => <List.Icon color={'#313030'} icon="chevron-right"/>}
                                    />
                                    <List.Item
                                        style={{marginLeft: '2%'}}
                                        titleStyle={styles.storeItemName}
                                        descriptionStyle={styles.storeItemBenefits}
                                        titleNumberOfLines={1}
                                        descriptionNumberOfLines={1}
                                        title="Battle Threads"
                                        description={
                                            <>
                                                <Text style={styles.storeItemBenefit}>3X</Text>
                                                {" Points and "}
                                                <Text style={styles.storeItemBenefit}>10%</Text>
                                                {" Discount "}
                                            </>
                                        }
                                        left={() => <Avatar.Image size={60} source={BattleThreadsLogo}/>}
                                        right={() => <List.Icon color={'#313030'} icon="chevron-right"/>}
                                    />
                                    <List.Item
                                        style={{marginLeft: '2%'}}
                                        titleStyle={styles.storeItemName}
                                        descriptionStyle={styles.storeItemBenefits}
                                        titleNumberOfLines={1}
                                        descriptionNumberOfLines={1}
                                        title="Battle Threads"
                                        description={
                                            <>
                                                <Text style={styles.storeItemBenefit}>3X</Text>
                                                {" Points and "}
                                                <Text style={styles.storeItemBenefit}>10%</Text>
                                                {" Discount "}
                                            </>
                                        }
                                        left={() => <Avatar.Image size={60} source={BattleThreadsLogo}/>}
                                        right={() => <List.Icon color={'#313030'} icon="chevron-right"/>}
                                    />
                                    <List.Item
                                        style={{marginLeft: '2%'}}
                                        titleStyle={styles.storeItemName}
                                        descriptionStyle={styles.storeItemBenefits}
                                        titleNumberOfLines={1}
                                        descriptionNumberOfLines={1}
                                        title="Battle Threads"
                                        description={
                                            <>
                                                <Text style={styles.storeItemBenefit}>3X</Text>
                                                {" Points and "}
                                                <Text style={styles.storeItemBenefit}>10%</Text>
                                                {" Discount "}
                                            </>
                                        }
                                        left={() => <Avatar.Image size={60} source={BattleThreadsLogo}/>}
                                        right={() => <List.Icon color={'#313030'} icon="chevron-right"/>}
                                    />
                                    <List.Item
                                        style={{marginLeft: '2%'}}
                                        titleStyle={styles.storeItemName}
                                        descriptionStyle={styles.storeItemBenefits}
                                        titleNumberOfLines={1}
                                        descriptionNumberOfLines={1}
                                        title="Battle Threads"
                                        description={
                                            <>
                                                <Text style={styles.storeItemBenefit}>3X</Text>
                                                {" Points and "}
                                                <Text style={styles.storeItemBenefit}>10%</Text>
                                                {" Discount "}
                                            </>
                                        }
                                        left={() => <Avatar.Image size={60} source={BattleThreadsLogo}/>}
                                        right={() => <List.Icon color={'#313030'} icon="chevron-right"/>}
                                    />
                                    <List.Item
                                        style={{marginLeft: '2%'}}
                                        titleStyle={styles.storeItemName}
                                        descriptionStyle={styles.storeItemBenefits}
                                        titleNumberOfLines={1}
                                        descriptionNumberOfLines={1}
                                        title="Battle Threads"
                                        description={
                                            <>
                                                <Text style={styles.storeItemBenefit}>3X</Text>
                                                {" Points and "}
                                                <Text style={styles.storeItemBenefit}>10%</Text>
                                                {" Discount "}
                                            </>
                                        }
                                        left={() => <Avatar.Image size={60} source={BattleThreadsLogo}/>}
                                        right={() => <List.Icon color={'#313030'} icon="chevron-right"/>}
                                    />
                                    <List.Item
                                        style={{marginLeft: '2%'}}
                                        titleStyle={styles.storeItemName}
                                        descriptionStyle={styles.storeItemBenefits}
                                        titleNumberOfLines={1}
                                        descriptionNumberOfLines={1}
                                        title="Battle Threads"
                                        description={
                                            <>
                                                <Text style={styles.storeItemBenefit}>3X</Text>
                                                {" Points and "}
                                                <Text style={styles.storeItemBenefit}>10%</Text>
                                                {" Discount "}
                                            </>
                                        }
                                        left={() => <Avatar.Image size={60} source={BattleThreadsLogo}/>}
                                        right={() => <List.Icon color={'#313030'} icon="chevron-right"/>}
                                    />
                                    <List.Item
                                        style={{marginLeft: '2%'}}
                                        titleStyle={styles.storeItemName}
                                        descriptionStyle={styles.storeItemBenefits}
                                        titleNumberOfLines={1}
                                        descriptionNumberOfLines={1}
                                        title="Battle Threads"
                                        description={
                                            <>
                                                <Text style={styles.storeItemBenefit}>3X</Text>
                                                {" Points and "}
                                                <Text style={styles.storeItemBenefit}>10%</Text>
                                                {" Discount "}
                                            </>
                                        }
                                        left={() => <Avatar.Image size={60} source={BattleThreadsLogo}/>}
                                        right={() => <List.Icon color={'#313030'} icon="chevron-right"/>}
                                    />
                                </List.Section>
                            </>
                        }
                        {toggleViewPressed === 'horizontal' &&
                            <>
                                <View style={styles.horizontalScrollView}>
                                    <Text style={styles.listTitleText}>
                                        Featured
                                    </Text>
                                    <ScrollView
                                        style={styles.featuredPartnersScrollView}
                                        horizontal={true}
                                        decelerationRate={"fast"}
                                        snapToInterval={Dimensions.get('window').width / 1.10}
                                        snapToAlignment={"start"}
                                        scrollEnabled={true}
                                        persistentScrollbar={false}
                                        showsHorizontalScrollIndicator={false}>
                                        <Card
                                            style={styles.featuredPartnerCard}>
                                            <Card.Cover
                                                source={BattleThreadsLogo}
                                                style={styles.featuredPartnerCardCover}
                                            />
                                            <Card.Title title={"Battle Threads"}
                                                        subtitle={'3X Points\n10% Discount'}
                                                        titleStyle={styles.featuredPartnerCardTitle}
                                                        subtitleStyle={styles.featuredPartnerCardSubtitle}
                                                        subtitleNumberOfLines={2}/>
                                            <Card.Content style={{bottom: '8%'}}>
                                                <Paragraph
                                                    style={styles.featuredPartnerCardParagraph}
                                                >
                                                    Veteran-owned shop sells comfy shirts perfect for impressing your
                                                    date at
                                                    the
                                                    gun
                                                    range
                                                    or lounging around the barracks!
                                                </Paragraph>
                                            </Card.Content>
                                            <Card.Actions style={styles.featuredPartnerCardActions}>
                                                <Button
                                                    uppercase={false}
                                                    disabled={false}
                                                    onPress={() => {
                                                    }}
                                                    style={styles.featuredPartnerCardActionButton}
                                                    textColor={"#f2f2f2"}
                                                    buttonColor={"#2A3779"}
                                                    mode="outlined"
                                                    labelStyle={styles.featuredPartnerCardActionButtonLabel}>
                                                    Shop
                                                </Button>
                                            </Card.Actions>
                                        </Card>
                                        <View style={{width: 15}}></View>
                                        <Card
                                            style={styles.featuredPartnerCard}>
                                            <Card.Cover
                                                source={BattleThreadsLogo}
                                                style={styles.featuredPartnerCardCover}
                                            />
                                            <Card.Title title={"Battle Threads"}
                                                        subtitle={'3X Points\n10% Discount'}
                                                        titleStyle={styles.featuredPartnerCardTitle}
                                                        subtitleStyle={styles.featuredPartnerCardSubtitle}
                                                        subtitleNumberOfLines={2}/>
                                            <Card.Content style={{bottom: '8%'}}>
                                                <Paragraph
                                                    style={styles.featuredPartnerCardParagraph}
                                                >
                                                    Veteran-owned shop sells comfy shirts perfect for impressing your
                                                    date at
                                                    the
                                                    gun
                                                    range
                                                    or lounging around the barracks!
                                                </Paragraph>
                                            </Card.Content>
                                            <Card.Actions style={styles.featuredPartnerCardActions}>
                                                <Button
                                                    uppercase={false}
                                                    disabled={false}
                                                    onPress={() => {
                                                    }}
                                                    style={styles.featuredPartnerCardActionButton}
                                                    textColor={"#f2f2f2"}
                                                    buttonColor={"#2A3779"}
                                                    mode="outlined"
                                                    labelStyle={styles.featuredPartnerCardActionButtonLabel}>
                                                    Shop
                                                </Button>
                                            </Card.Actions>
                                        </Card>
                                        <View style={{width: 15}}></View>
                                        <Card
                                            style={styles.featuredPartnerCard}>
                                            <Card.Cover
                                                source={BattleThreadsLogo}
                                                style={styles.featuredPartnerCardCover}
                                            />
                                            <Card.Title title={"Battle Threads"}
                                                        subtitle={'3X Points\n10% Discount'}
                                                        titleStyle={styles.featuredPartnerCardTitle}
                                                        subtitleStyle={styles.featuredPartnerCardSubtitle}
                                                        subtitleNumberOfLines={2}/>
                                            <Card.Content style={{bottom: '8%'}}>
                                                <Paragraph
                                                    style={styles.featuredPartnerCardParagraph}
                                                >
                                                    Veteran-owned shop sells comfy shirts perfect for impressing your
                                                    date at
                                                    the
                                                    gun
                                                    range
                                                    or lounging around the barracks!
                                                </Paragraph>
                                            </Card.Content>
                                            <Card.Actions style={styles.featuredPartnerCardActions}>
                                                <Button
                                                    uppercase={false}
                                                    disabled={false}
                                                    onPress={() => {
                                                    }}
                                                    style={styles.featuredPartnerCardActionButton}
                                                    textColor={"#f2f2f2"}
                                                    buttonColor={"#2A3779"}
                                                    mode="outlined"
                                                    labelStyle={styles.featuredPartnerCardActionButtonLabel}>
                                                    Shop
                                                </Button>
                                            </Card.Actions>
                                        </Card>
                                        <View style={{width: 15}}></View>
                                        <Card
                                            style={styles.featuredPartnerCard}>
                                            <Card.Cover
                                                source={BattleThreadsLogo}
                                                style={styles.featuredPartnerCardCover}
                                            />
                                            <Card.Title title={"Battle Threads"}
                                                        subtitle={'3X Points\n10% Discount'}
                                                        titleStyle={styles.featuredPartnerCardTitle}
                                                        subtitleStyle={styles.featuredPartnerCardSubtitle}
                                                        subtitleNumberOfLines={2}/>
                                            <Card.Content style={{bottom: '8%'}}>
                                                <Paragraph
                                                    style={styles.featuredPartnerCardParagraph}
                                                >
                                                    Veteran-owned shop sells comfy shirts perfect for impressing your
                                                    date at
                                                    the
                                                    gun
                                                    range
                                                    or lounging around the barracks!
                                                </Paragraph>
                                            </Card.Content>
                                            <Card.Actions style={styles.featuredPartnerCardActions}>
                                                <Button
                                                    uppercase={false}
                                                    disabled={false}
                                                    onPress={() => {
                                                    }}
                                                    style={styles.featuredPartnerCardActionButton}
                                                    textColor={"#f2f2f2"}
                                                    buttonColor={"#2A3779"}
                                                    mode="outlined"
                                                    labelStyle={styles.featuredPartnerCardActionButtonLabel}>
                                                    Shop
                                                </Button>
                                            </Card.Actions>
                                        </Card>
                                        <View style={{width: 15}}></View>
                                        <Card
                                            style={styles.featuredPartnerCard}>
                                            <Card.Cover
                                                source={BattleThreadsLogo}
                                                style={styles.featuredPartnerCardCover}
                                            />
                                            <Card.Title title={"Battle Threads"}
                                                        subtitle={'3X Points\n10% Discount'}
                                                        titleStyle={styles.featuredPartnerCardTitle}
                                                        subtitleStyle={styles.featuredPartnerCardSubtitle}
                                                        subtitleNumberOfLines={2}/>
                                            <Card.Content style={{bottom: '8%'}}>
                                                <Paragraph
                                                    style={styles.featuredPartnerCardParagraph}
                                                >
                                                    Veteran-owned shop sells comfy shirts perfect for impressing your
                                                    date at
                                                    the
                                                    gun
                                                    range
                                                    or lounging around the barracks!
                                                </Paragraph>
                                            </Card.Content>
                                            <Card.Actions style={styles.featuredPartnerCardActions}>
                                                <Button
                                                    uppercase={false}
                                                    disabled={false}
                                                    onPress={() => {
                                                    }}
                                                    style={styles.featuredPartnerCardActionButton}
                                                    textColor={"#f2f2f2"}
                                                    buttonColor={"#2A3779"}
                                                    mode="outlined"
                                                    labelStyle={styles.featuredPartnerCardActionButtonLabel}>
                                                    Shop
                                                </Button>
                                            </Card.Actions>
                                        </Card>
                                        <View style={{width: 35}}></View>
                                    </ScrollView>
                                    <View style={styles.allPartnersView}>
                                        <Text style={styles.listTitleText}>
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
                                        snapToInterval={Dimensions.get('window').width / 3.5 * 3.5}
                                        snapToAlignment={"start"}
                                        scrollEnabled={true}
                                        persistentScrollbar={false}
                                        showsHorizontalScrollIndicator={false}>
                                        <TouchableOpacity style={{left: '4%'}} onPress={() => {
                                            console.log('this shit is pressed')
                                        }}>
                                            <Card style={styles.regularPartnerCard}>
                                                <Card.Cover
                                                    source={BattleThreadsLogo}
                                                    style={styles.regularPartnerCardCover}
                                                />
                                                <Card.Title title={"Battle Threads"}
                                                            subtitle={'3X Points\n10% Discount'}
                                                            titleStyle={styles.regularPartnerCardTitle}
                                                            subtitleStyle={styles.regularPartnerCardSubtitle}
                                                            subtitleNumberOfLines={2}/>
                                            </Card>
                                        </TouchableOpacity>
                                        <View style={{width: 0.5}}></View>
                                        <TouchableOpacity style={{left: '4%'}} onPress={() => {
                                            console.log('this shit is pressed')
                                        }}>
                                            <Card style={styles.regularPartnerCard}>
                                                <Card.Cover
                                                    source={BattleThreadsLogo}
                                                    style={styles.regularPartnerCardCover}
                                                />
                                                <Card.Title title={"Battle Threads"}
                                                            subtitle={'3X Points\n10% Discount'}
                                                            titleStyle={styles.regularPartnerCardTitle}
                                                            subtitleStyle={styles.regularPartnerCardSubtitle}
                                                            subtitleNumberOfLines={2}/>
                                            </Card>
                                        </TouchableOpacity>
                                        <View style={{width: 0.5}}></View>
                                        <TouchableOpacity style={{left: '4%'}} onPress={() => {
                                            console.log('this shit is pressed')
                                        }}>
                                            <Card style={styles.regularPartnerCard}>
                                                <Card.Cover
                                                    source={BattleThreadsLogo}
                                                    style={styles.regularPartnerCardCover}
                                                />
                                                <Card.Title title={"Battle Threads"}
                                                            subtitle={'3X Points\n10% Discount'}
                                                            titleStyle={styles.regularPartnerCardTitle}
                                                            subtitleStyle={styles.regularPartnerCardSubtitle}
                                                            subtitleNumberOfLines={2}/>
                                            </Card>
                                        </TouchableOpacity>
                                        <View style={{width: 0.5}}></View>
                                        <TouchableOpacity style={{left: '4%'}} onPress={() => {
                                            console.log('this shit is pressed')
                                        }}>
                                            <Card style={styles.regularPartnerCard}>
                                                <Card.Cover
                                                    source={BattleThreadsLogo}
                                                    style={styles.regularPartnerCardCover}
                                                />
                                                <Card.Title title={"Battle Threads"}
                                                            subtitle={'3X Points\n10% Discount'}
                                                            titleStyle={styles.regularPartnerCardTitle}
                                                            subtitleStyle={styles.regularPartnerCardSubtitle}
                                                            subtitleNumberOfLines={2}/>
                                            </Card>
                                        </TouchableOpacity>
                                        <View style={{width: 0.5}}></View>
                                        <TouchableOpacity style={{left: '4%'}} onPress={() => {
                                            console.log('this shit is pressed')
                                        }}>
                                            <Card style={styles.regularPartnerCard}>
                                                <Card.Cover
                                                    source={BattleThreadsLogo}
                                                    style={styles.regularPartnerCardCover}
                                                />
                                                <Card.Title title={"Battle Threads"}
                                                            subtitle={'3X Points\n10% Discount'}
                                                            titleStyle={styles.regularPartnerCardTitle}
                                                            subtitleStyle={styles.regularPartnerCardSubtitle}
                                                            subtitleNumberOfLines={2}/>
                                            </Card>
                                        </TouchableOpacity>
                                        <View style={{width: 0.5}}></View>
                                        <TouchableOpacity style={{left: '4%'}} onPress={() => {
                                            console.log('this shit is pressed')
                                        }}>
                                            <Card style={styles.regularPartnerCard}>
                                                <Card.Cover
                                                    source={BattleThreadsLogo}
                                                    style={styles.regularPartnerCardCover}
                                                />
                                                <Card.Title title={"Battle Threads"}
                                                            subtitle={'3X Points\n10% Discount'}
                                                            titleStyle={styles.regularPartnerCardTitle}
                                                            subtitleStyle={styles.regularPartnerCardSubtitle}
                                                            subtitleNumberOfLines={2}/>
                                            </Card>
                                        </TouchableOpacity>
                                        <View style={{width: 0.5}}></View>
                                        <TouchableOpacity style={{left: '4%'}} onPress={() => {
                                            console.log('this shit is pressed')
                                        }}>
                                            <Card style={styles.regularPartnerCard}>
                                                <Card.Cover
                                                    source={BattleThreadsLogo}
                                                    style={styles.regularPartnerCardCover}
                                                />
                                                <Card.Title title={"Battle Threads"}
                                                            subtitle={'3X Points\n10% Discount'}
                                                            titleStyle={styles.regularPartnerCardTitle}
                                                            subtitleStyle={styles.regularPartnerCardSubtitle}
                                                            subtitleNumberOfLines={2}/>
                                            </Card>
                                        </TouchableOpacity>
                                        <View style={{width: 0.5}}></View>
                                        <TouchableOpacity style={{left: '4%'}} onPress={() => {
                                            console.log('this shit is pressed')
                                        }}>
                                            <Card style={styles.regularPartnerCard}>
                                                <Card.Cover
                                                    source={BattleThreadsLogo}
                                                    style={styles.regularPartnerCardCover}
                                                />
                                                <Card.Title title={"Battle Threads"}
                                                            subtitle={'3X Points\n10% Discount'}
                                                            titleStyle={styles.regularPartnerCardTitle}
                                                            subtitleStyle={styles.regularPartnerCardSubtitle}
                                                            subtitleNumberOfLines={2}/>
                                            </Card>
                                        </TouchableOpacity>
                                        <View style={{width: 0.5}}></View>
                                        <TouchableOpacity style={{left: '4%'}} onPress={() => {
                                            console.log('this shit is pressed')
                                        }}>
                                            <Card style={styles.regularPartnerCard}>
                                                <Card.Cover
                                                    source={BattleThreadsLogo}
                                                    style={styles.regularPartnerCardCover}
                                                />
                                                <Card.Title title={"Battle Threads"}
                                                            subtitle={'3X Points\n10% Discount'}
                                                            titleStyle={styles.regularPartnerCardTitle}
                                                            subtitleStyle={styles.regularPartnerCardSubtitle}
                                                            subtitleNumberOfLines={2}/>
                                            </Card>
                                        </TouchableOpacity>
                                        <View style={{width: 0.5}}></View>
                                        <TouchableOpacity style={{left: '4%'}} onPress={() => {
                                            console.log('this shit is pressed')
                                        }}>
                                            <Card style={styles.regularPartnerCard}>
                                                <Card.Cover
                                                    source={BattleThreadsLogo}
                                                    style={styles.regularPartnerCardCover}
                                                />
                                                <Card.Title title={"Battle Threads"}
                                                            subtitle={'3X Points\n10% Discount'}
                                                            titleStyle={styles.regularPartnerCardTitle}
                                                            subtitleStyle={styles.regularPartnerCardSubtitle}
                                                            subtitleNumberOfLines={2}/>
                                            </Card>
                                        </TouchableOpacity>
                                        <View style={{width: 0.5}}></View>
                                        <TouchableOpacity style={{left: '4%'}} onPress={() => {
                                            console.log('this shit is pressed')
                                        }}>
                                            <Card style={styles.regularPartnerCard}>
                                                <Card.Cover
                                                    source={BattleThreadsLogo}
                                                    style={styles.regularPartnerCardCover}
                                                />
                                                <Card.Title title={"Battle Threads"}
                                                            subtitle={'3X Points\n10% Discount'}
                                                            titleStyle={styles.regularPartnerCardTitle}
                                                            subtitleStyle={styles.regularPartnerCardSubtitle}
                                                            subtitleNumberOfLines={2}/>
                                            </Card>
                                        </TouchableOpacity>
                                        <View style={{width: 0.5}}></View>
                                        <TouchableOpacity style={{left: '4%'}} onPress={() => {
                                            console.log('this shit is pressed')
                                        }}>
                                            <Card style={styles.regularPartnerCard}>
                                                <Card.Cover
                                                    source={BattleThreadsLogo}
                                                    style={styles.regularPartnerCardCover}
                                                />
                                                <Card.Title title={"Battle Threads"}
                                                            subtitle={'3X Points\n10% Discount'}
                                                            titleStyle={styles.regularPartnerCardTitle}
                                                            subtitleStyle={styles.regularPartnerCardSubtitle}
                                                            subtitleNumberOfLines={2}/>
                                            </Card>
                                        </TouchableOpacity>
                                        <View style={{width: 0.5}}></View>
                                        <TouchableOpacity style={{left: '4%'}} onPress={() => {
                                            console.log('this shit is pressed')
                                        }}>
                                            <Card style={styles.regularPartnerCard}>
                                                <Card.Cover
                                                    source={BattleThreadsLogo}
                                                    style={styles.regularPartnerCardCover}
                                                />
                                                <Card.Title title={"Battle Threads"}
                                                            subtitle={'3X Points\n10% Discount'}
                                                            titleStyle={styles.regularPartnerCardTitle}
                                                            subtitleStyle={styles.regularPartnerCardSubtitle}
                                                            subtitleNumberOfLines={2}/>
                                            </Card>
                                        </TouchableOpacity>
                                        <View style={{width: 0.5}}></View>
                                        <TouchableOpacity style={{left: '4%'}} onPress={() => {
                                            console.log('this shit is pressed')
                                        }}>
                                            <Card style={styles.regularPartnerCard}>
                                                <Card.Cover
                                                    source={BattleThreadsLogo}
                                                    style={styles.regularPartnerCardCover}
                                                />
                                                <Card.Title title={"Battle Threads"}
                                                            subtitle={'3X Points\n10% Discount'}
                                                            titleStyle={styles.regularPartnerCardTitle}
                                                            subtitleStyle={styles.regularPartnerCardSubtitle}
                                                            subtitleNumberOfLines={2}/>
                                            </Card>
                                        </TouchableOpacity>
                                        <View style={{width: 10}}></View>
                                    </ScrollView>
                                </View>
                            </>
                        }
                    </ScrollView>
                </View>
            </View>
        </KeyboardAwareScrollView>
    );
}
