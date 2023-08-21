import {Dimensions, StyleSheet} from "react-native";

// styles to be used within the Store component
export const styles = StyleSheet.create({
    mainView: {
        flex: 1,
        flexGrow: 1,
        width: '100%',
        flexDirection: 'column',
        backgroundColor: '#313030'
    },
    titleView: {
        alignContent: 'flex-end',
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    mainTitle: {
        alignSelf: 'flex-start',
        marginLeft: '7%',
        fontSize: Dimensions.get('window').width / 11,
        fontFamily: 'Saira-SemiBold',
        color: '#FFFFFF',
    },
    mainSubtitle: {
        marginLeft: '7%',
        bottom: Dimensions.get('window').height / 100,
        fontSize: Dimensions.get('window').width / 25,
        fontFamily: 'Raleway-Light',
        color: '#FFFFFF'
    },
    toggleViewButton: {
        width: Dimensions.get('window').width / 11,
        height: Dimensions.get('window').width / 11,
        marginTop: "2%"
    },
    searchBar: {
        marginTop: "2%",
        width: Dimensions.get('window').width / 1.05,
        height: Dimensions.get('window').height / 22,
        alignSelf: 'flex-start',
        marginLeft: Dimensions.get('window').width / 30,
        backgroundColor: '#5B5A5A',
        borderRadius: 10
    },
    searchBarInput: {
        fontFamily: 'Raleway-Light',
        fontSize: Dimensions.get('window').width / 25,
        bottom: Dimensions.get('window').height / 120,
        color: '#FFFFFF'
    },
    filterChip: {
        marginRight: '5%',
        width: Dimensions.get('window').width / 3.7,
        height: Dimensions.get('window').height / 25,
        borderColor: 'transparent'
    },
    filterChipText: {
        fontFamily: 'Raleway-Medium',
        color: '#F2FF5D'
    },
    filterChipView: {
        left: '2%',
        alignSelf: 'flex-start',
        marginTop: '3%',
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    content: {
        flex: 1,
        flexGrow: 1,
        alignItems: 'flex-start'
    },
    horizontalScrollView: {
        marginTop: '5%',
        flexDirection: 'column',
        flex: 1,
        flexGrow: 1
    },
    featuredPartnersView: {
        height: '100%'
    },
    featuredPartnersTitleMain: {
        fontSize: Dimensions.get('window').height / 45,
        fontFamily: 'Changa-Medium',
        left: '5%',
        alignSelf: 'flex-start'
    },
    featuredPartnersTitle: {
        fontSize: Dimensions.get('window').height / 45,
        fontFamily: 'Changa-Medium',
        textDecorationLine: 'underline',
        left: '5%',
        alignSelf: 'flex-start'
    },
    featuredPartnersScrollView: {
        bottom: Dimensions.get('window').height/100
    },
    onlineOffersView: {
        height: '100%',
        bottom: '121%',
        left: '1.5%'
    },
    onlineOffersTitleView: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        top: '1%'
    },
    onlineOffersLeftTitleView: {
        flexDirection: 'column'
    },
    onlineOffersTitleMain: {
        fontSize: Dimensions.get('window').height / 45,
        fontFamily: 'Changa-Medium',
        left: '10%',
        alignSelf: 'flex-start'
    },
    onlineOffersTitle: {
        fontSize: Dimensions.get('window').height / 45,
        fontFamily: 'Changa-Medium',
        textDecorationLine: 'underline',
        left: '10%',
        alignSelf: 'flex-start'
    },
    onlineOffersTitleSub: {
        fontSize: Dimensions.get('window').height / 75,
        fontFamily: 'Changa-Medium',
        textDecorationLine: 'none',
        color: '#F2FF5D',
        left: '10%',
        alignSelf: 'flex-start'
    },
    onlineOffersTitleButton: {
        right: Dimensions.get('window').width / 25,
        fontSize: Dimensions.get('window').height / 55,
        fontFamily: 'Raleway-Bold',
        color: '#F2FF5D',
        textDecorationLine: 'underline',
        alignSelf: 'flex-end',
        top: '16%'
    },
    onlineOffersScrollView: {
        right: Dimensions.get('window').width / 30,
        height: '50%'
    },
    onlineOfferCard: {
        right: Dimensions.get('window').width / 40,
        backgroundColor: 'transparent',
        width: Dimensions.get('window').width / 3,
        height: Dimensions.get('window').height / 3.8,
    },
    onlineOfferCardTitle: {
        fontFamily: 'Raleway-Medium',
        fontSize: Dimensions.get('window').height / 60,
        alignSelf: 'center',
        textAlign: 'center',
        bottom: Dimensions.get('window').height / 1200
    },
    onlineOfferCardSubtitle: {
        fontSize: Dimensions.get('window').height / 70,
        fontFamily: 'Raleway-Bold',
        alignSelf: 'center',
        textAlign: 'center',
        color: '#F2FF5D',
        bottom: Dimensions.get('window').height / 500
    },
    onlineOfferCardCover: {
        width: Dimensions.get('window').width / 3.8,
        height: Dimensions.get('window').height / 8.5,
        borderBottomRightRadius: 5,
        borderBottomLeftRadius: 5,
    },
    nearbyOffersView: {
        height: '100%',
        bottom: '62%',
        left: '1.5%'
    },
    nearbyOffersTitleView: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        top: '1%'
    },
    nearbyOffersLeftTitleView: {
        flexDirection: 'column'
    },
    nearbyOffersTitleMain: {
        fontSize: Dimensions.get('window').height / 45,
        fontFamily: 'Changa-Medium',
        left: '10%',
        alignSelf: 'flex-start'
    },
    nearbyOffersTitle: {
        fontSize: Dimensions.get('window').height / 45,
        fontFamily: 'Changa-Medium',
        textDecorationLine: 'underline',
        left: '10%',
        alignSelf: 'flex-start'
    },
    nearbyOffersTitleSub: {
        fontSize: Dimensions.get('window').height / 75,
        fontFamily: 'Changa-Medium',
        textDecorationLine: 'none',
        color: '#F2FF5D',
        left: '10%',
        alignSelf: 'flex-start'
    },
    nearbyOffersTitleButton: {
        right: Dimensions.get('window').width / 25,
        fontSize: Dimensions.get('window').height / 55,
        fontFamily: 'Raleway-Bold',
        color: '#F2FF5D',
        textDecorationLine: 'underline',
        alignSelf: 'flex-end',
        top: '16%'
    },
    nearbyOffersScrollView: {
        top: '2%',
        height: '50%'
    },
    loadCard: {
        top: '0.5%',
        left: '2%',
        backgroundColor: 'transparent',
        width: Dimensions.get('window').width / 1.25,
        height: Dimensions.get('window').height / 3.5,
        shadowColor: 'black',
        shadowOffset: {width: -2, height: 1},
        shadowOpacity: 0.6,
        shadowRadius: 2,
        elevation: 15
    },
    featuredPartnerCard: {
        top: '0.5%',
        left: '2%',
        backgroundColor: '#5B5A5A',
        width: Dimensions.get('window').width / 1.15,
        height: Dimensions.get('window').height / 3.5,
        shadowColor: 'black',
        shadowOffset: {width: -2, height: 1},
        shadowOpacity: 0.6,
        shadowRadius: 2,
        elevation: 15
    },
    featuredPartnerCardCover: {
        alignSelf: 'flex-end',
        top: '10%',
        left: '65%',
        width: Dimensions.get('window').width / 3.5,
        height: Dimensions.get('window').width / 4,
    },
    featuredPartnerCardTitle: {
        top: '15%',
        right: '5%',
        fontFamily: 'Raleway-Medium',
        fontSize: Dimensions.get('window').height / 48,
        width: Dimensions.get('window').width / 1.9,
        alignSelf: 'flex-start',
        color: '#FFFFFF'
    },
    featuredPartnerCardSubtitle: {
        top: '15%',
        right: '5%',
        fontSize: Dimensions.get('window').height / 60,
        fontFamily: 'Raleway-SemiBold',
        alignSelf: 'flex-start',
        bottom: '3%',
        width: Dimensions.get('window').width / 2,
        color: '#F2FF5D',
    },
    featuredPartnerCardParagraph: {
        top: '20%',
        padding: 8,
        textAlign: 'justify',
        fontFamily: 'Raleway-Bold',
        width: Dimensions.get('window').width / 1.25,
        fontSize: Dimensions.get('window').height / 75,
        color: '#FFFFFF'
    },
    loadNearbyCardActionButton: {
        top: Dimensions.get('window').height/10,
        right: Dimensions.get('window').width/30,
        height: Dimensions.get('window').height / 25,
        width: Dimensions.get('window').width / 1.5,
        borderRadius: 5
    },
    loadOnlineCardActionButton: {
        top: Dimensions.get('window').height/30,
        right: Dimensions.get('window').width/60,
        height: Dimensions.get('window').height / 25,
        width: Dimensions.get('window').width / 4,
        borderRadius: 5
    },
    featuredPartnerCardActionButton: {
        top: '25%',
        left: '5%',
        height: Dimensions.get('window').height / 25,
        width: Dimensions.get('window').width / 3,
        borderRadius: 5
    },
    featuredPartnerCardActionButtonLabel: {
        fontFamily: 'Saira-SemiBold',
        fontSize: Dimensions.get('window').height / 60
    },
    nearbyOfferCardParagraph: {
        top: '20%',
        alignSelf: 'flex-start',
        left: '5%',
        textAlign: 'left',
        fontFamily: 'Raleway-Bold',
        width: Dimensions.get('window').width / 1.6,
        fontSize: Dimensions.get('window').height / 65,
        color: '#FFFFFF'
    },
    nearbyOfferCard: {
        left: '1.5%',
        backgroundColor: '#5B5A5A',
        width: Dimensions.get('window').width / 1.3,
        height: Dimensions.get('window').height / 3.5,
        shadowColor: 'black',
        shadowOffset: {width: -2, height: 1},
        shadowOpacity: 0.6,
        shadowRadius: 2,
        elevation: 15
    },
    nearbyOfferCardCover: {
        alignSelf: 'flex-start',
        top: '10%',
        left: '5%',
        width: Dimensions.get('window').width / 3.5,
        height: Dimensions.get('window').width / 4,
    },
    nearbyOfferCardTitle: {
        right: '5%',
        fontFamily: 'Raleway-Medium',
        fontSize: Dimensions.get('window').height / 48,
        width: Dimensions.get('window').width / 2.5,
        alignSelf: 'flex-start',
        color: '#FFFFFF'
    },
    nearbyOfferCardSubtitle: {
        top: '4%',
        right: '5%',
        fontSize: Dimensions.get('window').height / 55,
        fontFamily: 'Raleway-SemiBold',
        alignSelf: 'flex-start',
        bottom: '3%',
        width: Dimensions.get('window').width / 2,
        color: '#F2FF5D',
    },
    nearbyOfferCardActionButton: {
        top: '7%',
        alignSelf: 'flex-start',
        left: '5%',
        height: Dimensions.get('window').height / 25,
        width: Dimensions.get('window').width / 3,
        borderRadius: 5
    },
    nearbyOfferCardLocationDistance: {
        top: Dimensions.get('window').height/30,
        left: Dimensions.get('window').width/2.7,
        fontFamily: 'Raleway-Bold',
        color: '#FFFFFF',
        fontSize: Dimensions.get('window').height / 60
    },
    nearbyOfferCardActionButtonLabel: {
        fontFamily: 'Saira-SemiBold',
        fontSize: Dimensions.get('window').height / 60
    },
    verticalOfferBenefit: {
        fontFamily: 'Raleway-Bold',
        color: '#F2FF5D'
    },
    verticalOfferBenefits: {
        marginTop: '2%',
        fontFamily: 'Raleway-SemiBold',
        color: '#FFFFFF',
        fontSize: 14
    },
    verticalOfferName: {
        fontFamily: 'Raleway-SemiBold',
        color: '#FFFFFF',
        fontSize: Dimensions.get('window').height / 50
    },
    emptyOfferListItemTitle: {
        left: Dimensions.get('window').width / 4,
        fontSize: Dimensions.get('window').height / 50,
        color: '#F2FF5D',
        fontFamily: 'Saira-Medium',
        width: Dimensions.get('window').width / 1.15
    }
});
