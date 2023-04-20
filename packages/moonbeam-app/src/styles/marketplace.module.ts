import {Dimensions, Platform, StyleSheet} from "react-native";

// styles to be used within the Store/Marketplace component
export const styles = StyleSheet.create({
    rowContainer: {
        flex: 1,
        height: '100%',
        width: '100%'
    },
    androidSafeArea: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 25 : 0
    },
    mainView: {
        flex: 1,
        flexGrow: 1,
        flexDirection: 'column',
        marginTop: '12%'
    },
    titleView: {
        marginTop: '5%',
        marginLeft: '1%',
        alignContent: 'flex-end',
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    toggleViewButton: {
        width: Dimensions.get('window').width / 11,
        height: Dimensions.get('window').width / 11,
        marginTop: "2%"
    },
    content: {
        flex: 1,
        flexGrow: 1,
        alignItems: 'flex-start'
    },
    mainTitle: {
        alignSelf: 'flex-start',
        marginLeft: '7%',
        fontSize: 40,
        fontFamily: 'Raleway-Medium',
        color: '#313030',
    },
    mainSubtitle: {
        fontSize: 16,
        fontFamily: 'Raleway-Light',
        color: 'grey'
    },
    searchBar: {
        width: Dimensions.get('window').width / 1.1,
        height: Dimensions.get('window').height / 22,
        marginTop: '5%',
        alignSelf: 'flex-start',
        marginLeft: '5%'
    },
    searchBarInput: {
        fontFamily: 'Raleway-Regular',
        fontSize: 15,
        color: '#313030'
    },
    filterChip: {
        marginRight: '4%',
        width: Dimensions.get('window').width / 3.7,
        height: Dimensions.get('window').height / 25,
    },
    filterChipText: {
        fontFamily: 'Raleway-Medium'
    },
    filterChipView: {
        alignSelf: 'center',
        marginLeft: '5%',
        marginTop: '3%',
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    allPartnersView: {
        bottom: Dimensions.get('window').height / 2.8,
        marginLeft: '3%',
        justifyContent: 'space-between',
        flexDirection: 'row',
    },
    mapButton: {
        marginTop: '7%'
    },
    listTitleButton: {
        fontSize: Dimensions.get('window').height / 55,
        fontFamily: 'Raleway-Bold',
        alignSelf: 'flex-end',
        right: '30%',
        color: '#2A3779',
        textDecorationLine: 'underline'
    },
    listTitle2Text: {
        fontSize: Dimensions.get('window').height / 55,
        fontFamily: 'Raleway-Bold',
        left: '60%',
        alignSelf: 'flex-start'
    },
    listTitleText: {
        fontSize: Dimensions.get('window').height / 55,
        fontFamily: 'Raleway-Bold',
        left: '6%',
        alignSelf: 'flex-start',
        bottom: `9.5%`
    },
    horizontalScrollView: {
        marginTop: '22%',
        flexDirection: 'column'
    },
    featuredPartnersScrollView: {
        height: '100%',
        bottom: '18%'
    },
    regularPartnersScrollView: {
        height: '50%',
        bottom: '80%'
    },
    regularPartnerCard: {
        backgroundColor: 'transparent',
        width: Dimensions.get('window').width / 3,
        height: Dimensions.get('window').height / 3.8,
    },
    regularPartnerCardTitle: {
        fontFamily: 'Raleway-Medium',
        fontSize: Dimensions.get('window').height / 60,
        alignSelf: 'center',
        textAlign: 'center',
        bottom: Dimensions.get('window').height / 1200
    },
    regularPartnerCardSubtitle: {
        fontSize: Dimensions.get('window').height / 70,
        fontFamily: 'Raleway-Regular',
        alignSelf: 'center',
        textAlign: 'center',
        color: '#2A3779',
        bottom: Dimensions.get('window').height / 500
    },
    regularPartnerCardCover: {
        width: Dimensions.get('window').width / 3.8,
        height: Dimensions.get('window').height / 8.5,
        borderBottomRightRadius: 5,
        borderBottomLeftRadius: 5,
    },
    featuredPartnerCard: {
        left: '4%',
        backgroundColor: '#f5f5f5',
        width: Dimensions.get('window').width / 1.15,
        height: Dimensions.get('window').height / 3.4,
        shadowColor: '#313030',
        shadowOffset: {width: -2, height: 1},
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 10
    },
    featuredPartnerCardCover: {
        left: '100%',
        width: Dimensions.get('window').width / 3.3,
        height: Dimensions.get('window').height / 8,
    },
    featuredPartnerCardTitle: {
        fontFamily: 'Raleway-Medium',
        fontSize: Dimensions.get('window').height / 50,
        alignSelf: 'flex-start'
    },
    featuredPartnerCardParagraph: {
        top: '10%',
        padding: 8,
        textAlign: 'justify',
        fontFamily: 'Raleway-Regular',
        fontSize: Dimensions.get('window').height / 75
    },
    featuredPartnerCardActionButton: {
        top: '15%',
        left: '15%',
        height: Dimensions.get('window').height / 25,
        width: Dimensions.get('window').width / 5
    },
    featuredPartnerCardActionButtonLabel: {
        fontFamily: 'Raleway-Medium',
        fontSize: Dimensions.get('window').height / 60
    },
    featuredPartnerCardSubtitle: {
        fontSize: Dimensions.get('window').height / 60,
        fontFamily: 'Raleway-Bold',
        alignSelf: 'flex-start',
        top: '10%',
        width: Dimensions.get('window').width / 2,
        color: '#2A3779',
    },
    storeItemBenefit: {
        fontFamily: 'Raleway-Medium',
        color: '#2A3779'
    },
    storeItemBenefits: {
        marginTop: '2%',
        fontFamily: 'Raleway-Regular',
        color: 'grey',
        fontSize: 14
    },
    storeItemName: {
        fontFamily: 'Raleway-Bold',
        color: '#313030',
        fontSize: 17
    }
});
