import {Dimensions, Platform, StyleSheet} from "react-native";

// styles to be used within the FAQ component
export const styles = StyleSheet.create({
    rowContainer: {
        flex: 1,
        width: '100%',
        height: '100%'
    },
    androidSafeArea: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 25 : 0
    },
    mainView: {
        flex: 1,
        flexGrow: 1,
        flexDirection: 'column',
        alignItems: 'center'
    },
    titleView: {
        left: '1.5%',
        alignSelf: 'flex-start'
    },
    content: {
        alignItems: 'flex-start',
    },
    mainTitle: {
        marginLeft: '5%',
        marginTop: '5%',
        fontSize: 30,
        fontFamily: 'Raleway-Medium',
        color: '#313030'
    },
    listSectionView: {
        marginTop: '10%',
        alignSelf: 'center',
        width: Dimensions.get('window').width/1.15,
        backgroundColor: '#f2f2f2',
        shadowColor: '#313030',
        shadowOffset: {width: -2, height: 2},
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 15,
        borderRadius: 10
    },
    faqItemStyle: {
        backgroundColor: '#f2f2f2',
        marginTop: '-2%'
    },
    faqAccordionStyle: {
        backgroundColor: '#f2f2f2',
        height: Dimensions.get('window').height/16
    },
    faqAccordionTitle: {
        color: '#313030',
        fontFamily: 'Raleway-Bold'
    },
    faqItemTitle: {
        color: '#313030',
        fontFamily: 'Raleway-Medium',
        marginLeft: '5%'
    },
    faqItemTitleFaceID: {
        color: '#313030',
        fontFamily: 'Raleway-Bold',
        bottom: '19%'
    },
    faqItemDetails: {
        color: 'grey',
        fontFamily: 'Raleway-Medium',
        textAlign: 'justify',
        width: Dimensions.get("window").width/1.35,
        marginTop: '1.5%',
        marginLeft: '5%'
    },
    faqItemRightView: {
        flexDirection: 'row',
        left: '30%',
        bottom: '12%'
    },
    faqItemRightFaceID: {
        marginTop: '15%',
        left: '15%'
    },
    faqItemRightIcon: {
        top: '3.5%',
        marginRight: '2%'
    }
});
