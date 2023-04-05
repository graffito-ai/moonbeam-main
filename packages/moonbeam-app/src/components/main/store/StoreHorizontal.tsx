import 'react-native-get-random-values';
import React, {useEffect, useState} from "react";
import {Dimensions, ScrollView, View} from "react-native";
import {styles} from "../../../styles/storeHorizontal.module";
import {StoreHorizontalProps} from "../../../models/StoreStackProps";
import {Button, Card, Chip, Paragraph, Searchbar, Text, IconButton} from "react-native-paper";
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
// @ts-ignore
import BattleThreadsLogo from "../../../../assets/companies/battleThreads.jpg";

/**
 * StoreHorizontal component.
 */
export const StoreHorizontal = ({}: StoreHorizontalProps) => {
    // state driven key-value pairs for UI related elements
    const [horizontalPressed, setHorizontalPressed] = useState<boolean>(true);
    const [verticalPressed, setVerticalPressed] = useState<boolean>(false);
    const [mapPressed, setMapPressed] = useState<boolean>(false);

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

    // return the component for the horizontal Store page
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
                    <View>
                        <Text style={styles.mainTitle}>
                            Shop
                            {"\n"}
                            <Text style={styles.mainSubtitle}>
                                at select merchant partners.
                            </Text>
                        </Text>
                    </View>
                    {/*<View style={styles.bottomBarViewLeft}>*/}
                    {/*    <IconButton*/}
                    {/*        style={styles.mapButton}*/}
                    {/*        mode={'contained-tonal'}*/}
                    {/*        containerColor={'transparent'}*/}
                    {/*        icon="map-marker-radius"*/}
                    {/*        iconColor={mapPressed ? '#313030' : '#babbbd'}*/}
                    {/*        size={Dimensions.get('window').width / 15}*/}
                    {/*        onPress={() => {*/}
                    {/*            // setMapPressed(true);*/}
                    {/*            // setHorizontalPressed(false);*/}
                    {/*            // setVerticalPressed(false);*/}
                    {/*        }}*/}
                    {/*    />*/}
                    {/*</View>*/}
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
                        scrollEnabled={false}
                        persistentScrollbar={false}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps={'handled'}
                    >
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
                                            Veteran-owned shop sells comfy shirts perfect for impressing your date at
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
                                            Veteran-owned shop sells comfy shirts perfect for impressing your date at
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
                                            Veteran-owned shop sells comfy shirts perfect for impressing your date at
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
                                            Veteran-owned shop sells comfy shirts perfect for impressing your date at
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
                                            Veteran-owned shop sells comfy shirts perfect for impressing your date at
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
                                <Text style={styles.listTitleButton}>
                                    See All
                                </Text>
                            </View>
                            <ScrollView
                                style={styles.regularPartnersScrollView}
                                horizontal={true}
                                decelerationRate={"fast"}
                                snapToInterval={Dimensions.get('window').width / 1.30}
                                snapToAlignment={"start"}
                                scrollEnabled={true}
                                persistentScrollbar={false}
                                showsHorizontalScrollIndicator={false}>
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
                                <View style={{width: 0.5}}></View>
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
                                <View style={{width: 0.5}}></View>
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
                                <View style={{width: 0.5}}></View>
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
                                <View style={{width: 0.5}}></View>
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
                                <View style={{width: 5}}></View>
                            </ScrollView>
                        </View>
                    </ScrollView>
                    {/*<View style={styles.bottomBarViewLeft}>*/}
                    {/*    <IconButton*/}
                    {/*        style={styles.mapButton}*/}
                    {/*        mode={'contained-tonal'}*/}
                    {/*        containerColor={'transparent'}*/}
                    {/*        icon="map-marker-radius"*/}
                    {/*        iconColor={mapPressed ? '#313030' : '#babbbd'}*/}
                    {/*        size={Dimensions.get('window').width / 15}*/}
                    {/*        onPress={() => {*/}
                    {/*            // setMapPressed(true);*/}
                    {/*            // setHorizontalPressed(false);*/}
                    {/*            // setVerticalPressed(false);*/}
                    {/*        }}*/}
                    {/*    />*/}
                    {/*</View>*/}
                    {/*<View style={styles.bottomBarViewRight}>*/}
                    {/*    <IconButton*/}
                    {/*        style={{bottom: '20%'}}*/}
                    {/*        mode={'contained-tonal'}*/}
                    {/*        containerColor={'transparent'}*/}
                    {/*        icon="collage"*/}
                    {/*        iconColor={horizontalPressed ? '#313030' : '#babbbd'}*/}
                    {/*        size={horizontalPressed ? Dimensions.get('window').width / 15 : Dimensions.get('window').width / 18}*/}
                    {/*        onPress={() => {*/}
                    {/*            setHorizontalPressed(true);*/}
                    {/*            setVerticalPressed(false);*/}
                    {/*            setMapPressed(false);*/}
                    {/*        }}*/}
                    {/*    />*/}
                    {/*    <IconButton*/}
                    {/*        style={{bottom: '20%'}}*/}
                    {/*        mode={'contained-tonal'}*/}
                    {/*        containerColor={'transparent'}*/}
                    {/*        icon="format-list-bulleted-type"*/}
                    {/*        iconColor={verticalPressed ? '#313030' : '#babbbd'}*/}
                    {/*        size={verticalPressed ? Dimensions.get('window').width / 15 : Dimensions.get('window').width / 17}*/}
                    {/*        onPress={() => {*/}
                    {/*            setMapPressed(false);*/}
                    {/*            setHorizontalPressed(false);*/}
                    {/*            setVerticalPressed(true);*/}
                    {/*        }}*/}
                    {/*    />*/}
                    {/*</View>*/}
                </View>
            </View>
        </KeyboardAwareScrollView>
    );
}
