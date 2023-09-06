import 'react-native-get-random-values';
import React, {useEffect, useState} from "react";
import {FAQProps} from '../../../../models/props/SupportProps';
import {appDrawerHeaderShownState, drawerSwipeState} from "../../../../recoil/AppDrawerAtom";
import {useRecoilState} from 'recoil';
import {Dialog, List, Portal, Text} from "react-native-paper";
import {commonStyles} from "../../../../styles/common.module";
import {Button, Icon} from "@rneui/base";
import {Spinner} from '../../../common/Spinner';
import {View} from 'react-native';
import {FactType, Faq, FaqErrorType, getFAQs} from "@moonbeam/moonbeam-models";
import {API, graphqlOperation} from "aws-amplify";
import {styles} from "../../../../styles/faq.module";
import {ScrollView} from "react-native-gesture-handler";
import {dynamicSort} from '../../../../utils/Main';
import {faqListState} from "../../../../recoil/FaqAtom";
import {bottomBarNavigationState, drawerNavigationState} from "../../../../recoil/HomeAtom";
import {goToProfileSettingsState} from "../../../../recoil/Settings";
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';

/**
 * FAQ component.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component
 */
export const FAQ = ({navigation}: FAQProps) => {
    // constants used to keep track of local component state
    const [isReady, setIsReady] = useState<boolean>(false);
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
    const [faqErrorModalVisible, setFAQErrorModalVisible] = useState<boolean>(false);
    const [faqIDExpanded, setFAQIdExpanded] = useState<string | null>(null);
    // constants used to keep track of shared states
    const [, setGoToProfileSettings] = useRecoilState(goToProfileSettingsState);
    const [bottomBarNavigation, ] = useRecoilState(bottomBarNavigationState);
    const [drawerNavigation, ] = useRecoilState(drawerNavigationState);
    const [faqList, setFAQList] = useRecoilState(faqListState);
    const [, setDrawerHeaderShown] = useRecoilState(appDrawerHeaderShownState);
    const [, setDrawerSwipeEnabled] = useRecoilState(drawerSwipeState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // disable the drawer swipe
        setDrawerSwipeEnabled(false);

        // hide the drawer header
        setDrawerHeaderShown(false);

        // retrieve the FAQs
        if (faqList.length === 0) {
            !isReady && retrieveFAQs().then(_ => setIsReady(true));
        } else {
            setIsReady(true);
        }
    }, [faqList]);

    /**
     * Function used to retrieve the FAQs
     */
    const retrieveFAQs = async (): Promise<void> => {
        try {
            if (faqList.length === 0) {
                // call the internal getFAQs API
                const faqsResult = await API.graphql(graphqlOperation(getFAQs));

                // retrieve the data block from the response
                // @ts-ignore
                const responseData = faqsResult ? faqsResult.data : null;

                // check if there are any errors in the returned response
                if (responseData && responseData.getFAQs.errorMessage === null) {
                    // set the list of the FAQs, to be equal to the list of retrieved FAQs
                    setFAQList(responseData.getFAQs.data as Faq[]);
                } else {
                    // filter the error accordingly
                    if (responseData.getFAQs.errorType === FaqErrorType.NoneOrAbsent) {
                        console.log(`No FAQs found! ${JSON.stringify(faqsResult)}`);

                        // do not return an error, since we will display an empty FAQs message, in the lis of FAQs
                        setFAQList([]);
                    } else {
                        console.log(`Unexpected error while retrieving FAQs ${JSON.stringify(faqsResult)}`);

                        // release the loader
                        setIsReady(true);
                        setFAQErrorModalVisible(true);
                    }
                }
            }
        } catch (error) {
            console.log(`Unexpected error while attempting to retrieve FAQs ${JSON.stringify(error)} ${error}`);

            // release the loader
            setIsReady(true);
            setFAQErrorModalVisible(true);
        }
    }

    /**
     * Function used to filter and return FAQs, as a list of items.
     *
     * @return a {@link React.ReactNode} or {@link React.ReactNode[]} representing the
     * React node and/or nodes, representing the FAQs.
     */
    const populateFAQs = (): React.ReactNode | React.ReactNode[] => {
        // first sort the list alphabetically
        const filteredFaqs = faqList.slice().sort(dynamicSort("title"));

        if (filteredFaqs.length !== 0) {
            let results: React.ReactNode[] = [];
            for (const filteredFAQ of filteredFaqs) {
                // populate the list of Facts for the FAQ Object
                const facts: React.ReactNode[] = [];
                filteredFAQ.facts.forEach(fact => {
                    // act according to whether this is a Linkable or Non-Linkable Fact
                    let factDescription: React.ReactNode;
                    if (fact!.type === FactType.Linkable) {
                        // build the Fact description accordingly
                        if (fact!.linkLocation && fact!.linkableKeyword) {
                            let descriptionContent: React.ReactNode[] = [];
                            let descriptionIndex = 0;
                            fact!.description.split(" ").forEach((word) => {
                                if (word.includes(fact!.linkableKeyword!)) {
                                    descriptionContent.push(
                                        <>
                                            {descriptionIndex !== 0 && ' '}
                                            <Text
                                                style={styles.factItemTitle}
                                                onPress={async () => {
                                                    switch (fact!.linkLocation) {
                                                        case 'support':
                                                            // show the drawer header
                                                            setDrawerHeaderShown(true);

                                                            // enable the drawer swipe
                                                            setDrawerSwipeEnabled(true);

                                                            navigation.goBack();
                                                            break;
                                                        case 'wallet':
                                                            // show the drawer header
                                                            setDrawerHeaderShown(true);

                                                            // enable the drawer swipe
                                                            setDrawerSwipeEnabled(true);

                                                            navigation.goBack();

                                                            bottomBarNavigation && bottomBarNavigation!.navigate('Cards', {});
                                                            drawerNavigation && drawerNavigation!.navigate('Home', {});
                                                            break;
                                                        case 'profile':
                                                            // show the drawer header
                                                            setDrawerHeaderShown(true);

                                                            // enable the drawer swipe
                                                            setDrawerSwipeEnabled(true);

                                                            navigation.goBack();

                                                            setGoToProfileSettings(true);
                                                            drawerNavigation && drawerNavigation!.navigate('Settings', {});
                                                            break;
                                                        case 'store':
                                                            // show the drawer header
                                                            setDrawerHeaderShown(true);

                                                            // enable the drawer swipe
                                                            setDrawerSwipeEnabled(true);

                                                            navigation.goBack();

                                                            bottomBarNavigation && bottomBarNavigation!.navigate('Marketplace', {});
                                                            drawerNavigation && drawerNavigation!.navigate('Home', {});
                                                            break;
                                                        default:
                                                            console.log('Unknown location from FAQ');
                                                            break
                                                    }
                                                    console.log(fact!.linkLocation);
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
                            factDescription = <Text style={styles.factItemDescription}>{descriptionContent}</Text>;
                        } else {
                            factDescription = <Text style={styles.factItemDescription}>{fact!.description}</Text>
                        }
                        facts.push(<List.Item
                            style={styles.factItem}
                            titleStyle={styles.factItemTitle}
                            descriptionStyle={styles.factItemDescription}
                            titleNumberOfLines={500}
                            descriptionNumberOfLines={500}
                            title={''}
                            description={
                                <Text>
                                    {factDescription}
                                </Text>
                            }/>);
                    } else {
                        facts.push(<List.Item
                            style={styles.factItem}
                            titleStyle={styles.factItemTitle}
                            descriptionStyle={styles.factItemDescription}
                            titleNumberOfLines={500}
                            descriptionNumberOfLines={500}
                            title={''}
                            description={
                                <Text>
                                    {fact!.description}
                                </Text>
                            }/>);
                    }
                });

                results.push(
                    <>
                        <List.Accordion
                            theme={{colors: {background: '#313030'}}}
                            onPress={() => {
                                // set the setOfferIdExpanded accordingly
                                faqIDExpanded === filteredFAQ.id!
                                    ? setFAQIdExpanded(null)
                                    : setFAQIdExpanded(filteredFAQ.id!);
                            }}
                            expanded={faqIDExpanded === filteredFAQ.id!}
                            rippleColor={'transparent'}
                            style={styles.faqAccordionStyle}
                            titleStyle={styles.faqAccordionTitle}
                            titleNumberOfLines={10}
                            descriptionNumberOfLines={5}
                            title={filteredFAQ.title}
                            right={() =>
                                <Icon color={'#F2FF5D'}
                                      type={'material-community'}
                                      name={faqIDExpanded !== filteredFAQ.id! ? "plus" : "minus"}
                                      size={hp(3)}/>}>
                            {facts}
                        </List.Accordion>
                    </>);
            }
            return results;
        } else {
            return (<>
                <List.Accordion
                    theme={{colors: {background: '#313030'}}}
                    expanded={false}
                    rippleColor={'transparent'}
                    style={styles.faqAccordionStyle}
                    titleStyle={styles.faqAccordionTitle}
                    titleNumberOfLines={10}
                    descriptionNumberOfLines={5}
                    title={'No FAQs available!'}
                    right={() =>
                        <Icon color={'#F2FF5D'}
                              type={'material-community'}
                              name={""}
                              size={hp(3)}/>}><></>
                </List.Accordion>
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
                    <>
                        <Portal>
                            <Dialog style={commonStyles.dialogStyle} visible={faqErrorModalVisible}
                                    onDismiss={() => setFAQErrorModalVisible(false)}>
                                <Dialog.Icon icon="alert" color={"#F2FF5D"}
                                             size={hp(10)}/>
                                <Dialog.Title style={commonStyles.dialogTitle}>{'We hit a snag!'}</Dialog.Title>
                                <Dialog.Content>
                                    <Text
                                        style={commonStyles.dialogParagraph}>{`Unable to retrieve FAQs!`}</Text>
                                </Dialog.Content>
                                <Dialog.Actions>
                                    <Button buttonStyle={commonStyles.dialogButton}
                                            titleStyle={commonStyles.dialogButtonText}
                                            onPress={() => {
                                                setFAQErrorModalVisible(false);
                                                // go back to the support center
                                                navigation.goBack();

                                                // show the drawer header
                                                setDrawerHeaderShown(true);

                                                // enable the drawer swipe
                                                setDrawerSwipeEnabled(true);
                                            }}>
                                        {"Dismiss"}
                                    </Button>
                                </Dialog.Actions>
                            </Dialog>
                        </Portal>
                        <View style={styles.mainView}>
                            <ScrollView
                                persistentScrollbar={false}
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps={'handled'}
                                contentContainerStyle={{paddingBottom: hp(5)}}
                            >
                                <List.Section style={styles.faqsListView}>
                                    {
                                        populateFAQs()
                                    }
                                </List.Section>
                            </ScrollView>
                        </View>
                    </>
            }
        </>
    );
}
