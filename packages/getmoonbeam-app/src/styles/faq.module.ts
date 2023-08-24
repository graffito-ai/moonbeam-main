import {Dimensions, StyleSheet} from "react-native";

// styles to be used within the FAQ component
export const styles = StyleSheet.create({
    mainView: {
        flex: 1,
        flexGrow: 1,
        backgroundColor: '#313030',
        flexDirection: 'column'
    },
    mainTitleView: {
        backgroundColor: '#313030',
        paddingTop: Dimensions.get('window').height/10
    },
    mainTitle: {
        fontFamily: 'Raleway-Medium',
        fontSize: Dimensions.get('window').width / 18,
        width: Dimensions.get('window').width / 1.15,
        bottom: Dimensions.get('window').height / 43,
        left: Dimensions.get('window').width / 2.7,
        textAlign: 'justify',
        alignSelf: 'center',
        color: '#FFFFFF'
    },
    faqsListView: {
        alignSelf: 'center',
        width: Dimensions.get('window').width/1.05,
        backgroundColor: '#5B5A5A',
        bottom: Dimensions.get('window').height/25
    },
    faqAccordionStyle: {
        marginTop: '8%',
        alignSelf: 'center',
        width: Dimensions.get('window').width/1.05,
        backgroundColor: '#5B5A5A'
    },
    faqAccordionTitle: {
        alignSelf: 'flex-start',
        fontFamily: 'Raleway-Medium',
        left: Dimensions.get('window').width / 45,
        fontSize: Dimensions.get('window').width / 28,
        width: Dimensions.get('window').width / 1.5,
        color: '#FFFFFF',
    },
    factItem: {
        borderColor: '#FFFFFF',
        borderTopWidth: Dimensions.get('window').height / 2000,
        backgroundColor: '#5B5A5A',
    },
    factItemTitle: {
        fontFamily: 'Saira-Medium',
        fontSize: Dimensions.get('window').width / 30,
        width: Dimensions.get('window').width / 1.15,
        right: Dimensions.get('window').width / 15,
        textAlign: 'justify',
        alignSelf: 'flex-start',
        textDecorationLine: 'underline',
        color: '#F2FF5D'
    },
    factItemDescription: {
        fontFamily: 'Saira-Medium',
        fontSize: Dimensions.get('window').width / 30,
        width: Dimensions.get('window').width / 1.22,
        bottom: Dimensions.get('window').height / 120,
        textAlign: 'justify',
        alignSelf: 'center',
        color: '#FFFFFF'
    },
});
