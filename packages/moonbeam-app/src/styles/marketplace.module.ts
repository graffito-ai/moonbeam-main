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
        bottom: '68%',
        marginLeft: '5%',
        justifyContent: 'space-between',
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    mapButton: {
        marginTop: '7%'
    },
    listTitleButton: {
        fontSize: Dimensions.get('window').height / 55,
        fontFamily: 'Raleway-Bold',
        marginRight: '5%',
        bottom: '8%',
        color: '#2A3779',
        textDecorationLine: 'underline'
    },
    listTitleText: {
        fontSize: Dimensions.get('window').height / 55,
        fontFamily: 'Raleway-Bold',
        left: '5%',
        alignSelf: 'flex-start',
        bottom: '8%'
    },
    horizontalScrollView: {
        marginTop: '25%'
    },
    featuredPartnersScrollView: {
        height: '100%',
        bottom: '18%'
    },
    regularPartnersScrollView: {
        height: '100%',
        bottom: '66%'
    },
    regularPartnerCard: {
        backgroundColor: 'transparent'
    },
    regularPartnerCardTitle: {
        fontFamily: 'Raleway-Medium',
        fontSize: Dimensions.get('window').height / 60,
        alignSelf: 'flex-start',
        right: '5%',
        bottom: `${Dimensions.get('window').height / 135}%`
    },
    regularPartnerCardSubtitle: {
        fontSize: Dimensions.get('window').height / 70,
        fontFamily: 'Raleway-Regular',
        alignSelf: 'flex-start',
        left: '5%',
        color: '#2A3779',
        bottom: `${Dimensions.get('window').height / 120}%`
    },
    regularPartnerCardCover: {
        width: Dimensions.get('window').width / 3.5,
        height: Dimensions.get('window').height / 7.5,
        borderBottomRightRadius: 5,
        borderBottomLeftRadius: 5,
    },
    featuredPartnerCard: {
        left: '4%',
        backgroundColor: '#f5f5f5',
        width: Dimensions.get('window').width / 1.15,
        height: Dimensions.get('window').height / 3.3,
        shadowColor: '#313030',
        shadowOffset: {width: -2, height: 1},
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 10
    },
    featuredPartnerCardCover: {
        right: '5%',
        top: '5%',
        alignSelf: 'flex-end',
        width: Dimensions.get('window').width / 3.5,
        height: Dimensions.get('window').height / 7.5,
        borderBottomRightRadius: 5,
        borderBottomLeftRadius: 5,
    },
    featuredPartnerCardTitle: {
        fontFamily: 'Raleway-Medium',
        fontSize: Dimensions.get('window').height / 40,
        alignSelf: 'flex-start',
        bottom: `${Dimensions.get('window').height / 6}%`
    },
    featuredPartnerCardParagraph: {
        textAlign: 'justify',
        bottom: '50%',
        fontFamily: 'Raleway-Regular',
        fontSize: Dimensions.get('window').height / 65
    },
    featuredPartnerCardActions: {
        alignSelf: 'flex-start'
    },
    featuredPartnerCardActionButton: {
        left: '15%',
        bottom: '15%',
        height: Dimensions.get('window').height / 25,
        width: Dimensions.get('window').width / 5
    },
    featuredPartnerCardActionButtonLabel: {
        fontFamily: 'Raleway-Medium',
        fontSize: Dimensions.get('window').height / 60
    },
    featuredPartnerCardSubtitle: {
        fontSize: Dimensions.get('window').height / 55,
        fontFamily: 'Raleway-Bold',
        alignSelf: 'flex-start',
        bottom: `${Dimensions.get('window').height / 7}%`,
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
