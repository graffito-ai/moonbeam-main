import 'react-native-get-random-values';
import React, {useEffect, useState} from "react";
import {Dimensions, Image, SafeAreaView, ScrollView, Text, View} from "react-native";
import {commonStyles} from "../../../styles/common.module";
import {FAQProps} from '../../../models/SupportStackProps';
import {Divider, List} from "react-native-paper";
import {styles} from "../../../styles/faq.module";
import {AccountVerificationStatus, Faq, FaqType, listFAQs} from "@moonbeam/moonbeam-models";
import * as SecureStore from "expo-secure-store";
import {API, graphqlOperation} from "aws-amplify";
import * as Linking from "expo-linking";
import {Spinner} from "../../../common/Spinner";
import { dynamicSort } from '../../../utils/Main';

/**
 * FAQ component.
 */
export const FAQ = ({route, navigation}: FAQProps) => {
    // state driven key-value pairs for UI related elements
    const [isReady, setIsReady] = useState<boolean>(true);
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);

    // state driven key-value pairs for any specific data values
    const [faqList, setFAQList] = useState<Faq[]>([]);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        route.params.setIsDrawerHeaderShown(false);
        retrieveFAQs().then(() => {
            setIsReady(true);
        });
    }, [faqList]);

    /**
     * Function used to retrieve the FAQs
     */
    const retrieveFAQs = async (): Promise<void> => {
        setIsReady(false);
        try {
            if (faqList.length === 0) {
                // first check if there are FAQs already loaded
                let retrievedFAQs = await SecureStore.getItemAsync('FAQs');
                if (retrievedFAQs) {
                    setFAQList(JSON.parse(retrievedFAQs) as Faq[]);
                } else {
                    // perform the query to retrieve FAQs
                    const retrievedFAQsResult = await API.graphql(graphqlOperation(listFAQs, {
                        listFAQInput: {}
                    }));
                    // @ts-ignore
                    if (retrievedFAQsResult && retrievedFAQsResult.data.listFAQs.errorMessage === null) {
                        // @ts-ignore
                        setFAQList(retrievedFAQsResult.data.listFAQs.data);

                        // store the retrieved FAQs in the store
                        // @ts-ignore
                        await SecureStore.setItemAsync('FAQs', JSON.stringify(retrievedFAQsResult.data.listFAQs.data));
                    } else {
                        console.log(`Unexpected error while attempting to retrieve FAQs ${JSON.stringify(retrievedFAQsResult)}`);
                        // ToDo: need to create a modal with errors
                    }
                }
            }
        } catch (error) {
            // @ts-ignore
            console.log(error.message
                // @ts-ignore
                ? `Unexpected error while retrieving FAQs: ${JSON.stringify(error.message)}`
                : `Unexpected error while retrieving FAQS: ${JSON.stringify(error)}`);
            // ToDo: need to create a modal with errors
        }
    }

    /**
     * Function used to redirect to a particular link in the application.
     *
     * @param link application link to redirect to
     */
    const goToLink = async (link: string): Promise<void> => {
        // go back and do the linking from the parent stack (Support Center)
        route.params.setIsDrawerHeaderShown(true);
        navigation.goBack();

        // navigate to the appropriate location
        await Linking.openURL(Linking.createURL(`${link}`));
    }

    /**
     * Function used to filter and return FAQs, as a list of items.
     */
    const filterFAQs = (): React.ReactNode | React.ReactNode[] => {
        // first sort the list alphabetically
        faqList.sort(dynamicSort("title"));

        if (faqList.length !== 0) {
            let results: React.ReactNode[] = [];
            let filteredFAQIndex = 0;
            for (const filteredFAQ of faqList) {
                // facts to add to a NonLinkable FAQ
                let facts: React.ReactNode[] = [];
                switch (filteredFAQ.type) {
                    case FaqType.NonLinkable:
                        // build the facts array for each FAQ
                        if (filteredFAQ.facts && filteredFAQ.facts.length > 0) {
                            for (const filteredFact of filteredFAQ.facts) {
                                let factDescription: React.ReactNode;
                                // build the description with a built-in link for each fact, where applicable
                                if (filteredFact!.link && filteredFact!.linkTitle) {
                                    let descriptionContent: React.ReactNode[] = [];
                                    let descriptionIndex = 0;
                                    filteredFact!.description.split(" ").forEach((word) => {
                                        if (word.includes(filteredFact!.linkTitle!)) {
                                            descriptionContent.push(
                                                <>
                                                    {descriptionIndex !== 0 && ' '}
                                                    <Text
                                                        style={{
                                                            color: '#2A3779',
                                                            fontFamily: 'Raleway-Bold',
                                                            textDecorationLine: 'underline'
                                                        }}
                                                        onPress={async () => {
                                                            console.log(filteredFact!.link!);
                                                            await goToLink(filteredFact!.link!);
                                                        }}
                                                    >
                                                        {word}
                                                    </Text>
                                                </>
                                            );
                                        } else {
                                            descriptionContent.push(descriptionIndex !== 0 ? ' ' + word : word);
                                        }
                                        descriptionIndex++;
                                    })
                                    factDescription = <Text>{descriptionContent}</Text>;
                                } else {
                                    factDescription = <Text>{filteredFact!.description}</Text>
                                }
                                facts.push(
                                    <>
                                        <List.Item
                                            key={`${filteredFAQ.id}-${filteredFact!.title}`}
                                            style={styles.faqItemStyle}
                                            titleStyle={styles.faqItemTitle}
                                            descriptionStyle={styles.faqItemDetails}
                                            titleNumberOfLines={2}
                                            descriptionNumberOfLines={10}
                                            title={filteredFact!.title}
                                            description={factDescription}/>
                                    </>
                                )
                            }
                        }
                        results.push(
                            <>
                                <List.Accordion
                                    key={filteredFAQ.id}
                                    style={styles.faqAccordionStyle}
                                    titleStyle={styles.faqAccordionTitle}
                                    titleNumberOfLines={2}
                                    descriptionNumberOfLines={5}
                                    title={filteredFAQ.title}
                                    left={() =>
                                        <List.Icon color={'#2A3779'} icon="information-outline"
                                                   key={`${filteredFAQ.id}-leftIcon`}/>}>
                                    {facts}
                                </List.Accordion>
                                {filteredFAQIndex !== faqList.length - 1 &&
                                    <Divider
                                        key={`${filteredFAQ.id}-divider`}
                                        style={[commonStyles.divider, {width: Dimensions.get('window').width / 1.15}]}/>}
                            </>
                        );
                        break;
                    case FaqType.Linkable:
                        results.push(
                            <>
                                <List.Accordion
                                    onPress={async () => {
                                        await goToLink(filteredFAQ.applicationLink!);
                                    }}
                                    style={styles.faqAccordionStyle}
                                    titleStyle={styles.faqItemTitleFaceID}
                                    titleNumberOfLines={2}
                                    descriptionNumberOfLines={5}
                                    title={filteredFAQ.title}
                                    left={() =>
                                        <List.Icon style={{bottom: '3%'}} color={'#2A3779'}
                                                   icon="information-outline"/>}
                                    right={() =>
                                        <View style={styles.faqItemRightView}>
                                            <Image style={styles.faqItemRightFaceID}
                                                   source={require('../../../../assets/face-id.png')}/>
                                            <List.Icon icon="chevron-right"/>
                                        </View>
                                    }>
                                </List.Accordion>
                                {filteredFAQIndex !== faqList.length &&
                                    <Divider
                                        style={[commonStyles.divider, {width: Dimensions.get('window').width / 1.15}]}/>}
                            </>
                        )
                        break;
                    default:
                        break;
                }
                filteredFAQIndex++;
            }
            return results;
        } else {
            return (<>
                <List.Item
                    key={`${AccountVerificationStatus.Pending}_Key`}
                    style={styles.faqItemStyle}
                    titleStyle={styles.faqItemTitle}
                    descriptionStyle={styles.faqItemDetails}
                    titleNumberOfLines={1}
                    descriptionNumberOfLines={2}
                    title="Oh no :("
                    description='No FAQs available at the moment'
                    right={() =>
                        <List.Icon color={'red'} icon="question-answer"
                                   key={`${AccountVerificationStatus.Pending}_faqNotAvailableKey`}/>}
                />
            </>);
        }
    }

    // return the component for the FAQ page
    return (
        <>
            {
                !isReady ?
                    <Spinner loadingSpinnerShown={loadingSpinnerShown} setLoadingSpinnerShown={setLoadingSpinnerShown}/>
                    :
                    <SafeAreaView style={[styles.rowContainer, styles.androidSafeArea]}>
                        <ScrollView
                            scrollEnabled={true}
                            keyboardShouldPersistTaps={'handled'}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={[styles.mainView]}>
                                <View style={styles.titleView}>
                                    <Text style={styles.mainTitle}>FAQ Center</Text>
                                </View>
                                <View style={styles.content}>
                                    <List.Section style={styles.listSectionView}>
                                        {
                                            filterFAQs()
                                        }
                                    </List.Section>
                                </View>
                            </View>
                        </ScrollView>
                    </SafeAreaView>
            }
        </>
    );
}
