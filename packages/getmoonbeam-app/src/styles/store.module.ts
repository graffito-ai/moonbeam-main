import {StyleSheet} from "react-native";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';

// styles to be used within the Store component
export const styles = StyleSheet.create({
    mainView: {
        flex: 1,
        flexGrow: 1,
        width: wp(100),
        flexDirection: 'column',
        backgroundColor: '#313030'
    },
    titleView: {
        flexDirection: 'column',
        top: hp(5),
        width: wp(100)
    },
    mainTitle: {
        alignSelf: 'flex-start',
        marginLeft: wp(4),
        fontSize: hp(4.5),
        fontFamily: 'Saira-SemiBold',
        color: '#FFFFFF',
    },
    mainSubtitle: {
        marginLeft: wp(4),
        bottom: hp(1),
        fontSize: hp(2),
        fontFamily: 'Raleway-Light',
        color: '#FFFFFF'
    },
    toggleViewButton: {
        width: hp(5),
        height: hp(5)
    },
    searchBar: {
        marginTop: hp(2),
        width: wp(94),
        height: hp(5),
        alignSelf: 'flex-start',
        marginLeft: wp(4),
        backgroundColor: '#1c1a1f',
        borderRadius: 10
    },
    searchBarInput: {
        alignSelf: 'center',
        fontFamily: 'Raleway-Light',
        fontSize: hp(1.8),
        color: '#FFFFFF'
    },
    filterChip: {
        marginRight: wp(6),
        width: wp(27),
        borderColor: 'transparent'
    },
    filterChipText: {
        alignSelf: 'center',
        fontFamily: 'Raleway-Medium',
        fontSize: hp(1.4),
        color: '#F2FF5D'
    },
    filterChipView: {
        left: wp(4),
        alignSelf: 'flex-start',
        marginTop: hp(1.5),
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    content: {
        flex: 1,
        flexGrow: 1,
        alignItems: 'flex-start'
    },
    horizontalScrollView: {
        marginTop: hp(1),
        paddingBottom: hp(3),
        flexDirection: 'column',
        flex: 1,
        flexGrow: 1
    },
    featuredPartnersView: {
        height: '100%'
    },
    featuredPartnersTitleMain: {
        fontSize: hp(3),
        fontFamily: 'Changa-Medium',
        left: wp(6),
        alignSelf: 'flex-start',
        color: '#FFFFFF'
    },
    featuredPartnersTitle: {
        fontSize: hp(2.5),
        fontFamily: 'Changa-Medium',
        textDecorationLine: 'underline',
        left: wp(6),
        alignSelf: 'flex-start',
        color: '#FFFFFF'
    },
    featuredPartnersScrollView: {
        bottom: hp(2)
    },
    onlineOffersView: {
        height: '100%',
        bottom: hp(130),
        left: wp(2)
    },
    onlineOffersTitleView: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        top: hp(1)
    },
    onlineOffersLeftTitleView: {
        flexDirection: 'column'
    },
    onlineOffersTitleMain: {
        fontSize: hp(3),
        fontFamily: 'Changa-Medium',
        left: wp(4),
        alignSelf: 'flex-start',
        color: '#FFFFFF'
    },
    onlineOffersTitle: {
        fontSize: hp(2.5),
        fontFamily: 'Changa-Medium',
        textDecorationLine: 'underline',
        left: wp(4),
        alignSelf: 'flex-start',
        color: '#FFFFFF'
    },
    onlineOffersTitleButton: {
        right: wp(5),
        fontSize: hp(2),
        fontFamily: 'Raleway-Bold',
        color: '#F2FF5D',
        textDecorationLine: 'underline',
        alignSelf: 'flex-end',
        top: hp(1.5)
    },
    onlineOffersScrollView: {
        right: wp(3),
        height: '50%'
    },
    onlineOfferCard: {
        right: wp(2),
        backgroundColor: 'transparent',
        width: wp(33),
        height: hp(25),
        shadowColor: 'transparent',
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 0.5,
        shadowRadius: 0
    },
    onlineOfferCardTitle: {
        top: hp(0.5),
        fontFamily: 'Raleway-Medium',
        fontSize: hp(2),
        lineHeight: hp(2.2),
        alignSelf: 'center',
        textAlign: 'center',
        color: '#FFFFFF'
    },
    onlineOfferCardSubtitle: {
        top: hp(0.5),
        fontSize: hp(1.8),
        fontFamily: 'Raleway-Bold',
        alignSelf: 'center',
        textAlign: 'center',
        color: '#F2FF5D'
    },
    onlineOfferCardCover: {
        width: wp(25),
        height: hp(12),
        borderBottomRightRadius: 5,
        borderBottomLeftRadius: 5,
    },
    nearbyOffersView: {
        height: '100%',
        bottom: hp(65),
        left: wp(2)
    },
    nearbyOffersTitleView: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        top: hp(0.5)
    },
    nearbyOffersLeftTitleView: {
        flexDirection: 'column'
    },
    nearbyOffersTitleMain: {
        fontSize: hp(3),
        fontFamily: 'Changa-Medium',
        left: wp(4),
        alignSelf: 'flex-start',
        color: '#FFFFFF'
    },
    nearbyLoadingOffersTitleMain: {
        fontSize: hp(3),
        fontFamily: 'Changa-Medium',
        left: wp(4),
        alignSelf: 'flex-start',
        color: '#FFFFFF'
    },
    nearbyLoadingOffersTitle: {
        fontSize: hp(2.5),
        fontFamily: 'Changa-Medium',
        textDecorationLine: 'underline',
        left: wp(4),
        color: '#F2FF5D'
    },
    nearbyOffersTitle: {
        fontSize: hp(2.5),
        fontFamily: 'Changa-Medium',
        textDecorationLine: 'underline',
        left: wp(4),
        alignSelf: 'flex-start',
        color: '#FFFFFF'
    },
    nearbyOffersTitleSub: {
        fontSize: hp(1.5),
        fontFamily: 'Changa-Medium',
        textDecorationLine: 'none',
        color: '#F2FF5D',
        left: wp(4),
        bottom: hp(0.5),
        alignSelf: 'flex-start'
    },
    nearbyOffersTitleButton: {
        right: wp(5),
        fontSize: hp(2),
        fontFamily: 'Raleway-Bold',
        color: '#F2FF5D',
        textDecorationLine: 'underline',
        alignSelf: 'flex-end',
        top: hp(1.5)
    },
    nearbyOffersScrollView: {
        top: hp(1),
        height: '50%'
    },
    loadCard: {
        left: wp(3),
        width: wp(85),
        height: hp(30),
        backgroundColor: 'transparent',
        shadowColor: 'transparent',
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 0.5,
        shadowRadius: 0
    },
    featuredPartnerCard: {
        top: hp(2.5),
        left: wp(4),
        backgroundColor: '#5B5A5A',
        width: wp(85),
        height: hp(30),
        shadowColor: 'black',
        shadowOffset: {width: -2, height: 1},
        shadowOpacity: 0.6,
        shadowRadius: 2,
        elevation: 15
    },
    featuredPartnerCardCover: {
        alignSelf: 'flex-end',
        top: hp(1),
        left: wp(20),
        width: wp(25),
        height: hp(12),
    },
    featuredPartnerCardTitleMain: {
        top: hp(0.5),
        width: wp(40),
        marginBottom: hp(1)
    },
    featuredPartnerCardTitle: {
        right: wp(1),
        fontFamily: 'Raleway-Medium',
        fontSize: hp(2),
        width: wp(40),
        lineHeight: hp(2.4),
        alignSelf: 'flex-start',
        color: '#FFFFFF'
    },
    featuredPartnerCardSubtitle: {
        top: hp(0.5),
        right: wp(1),
        fontSize: hp(1.6),
        fontFamily: 'Raleway-SemiBold',
        alignSelf: 'flex-start',
        width: wp(40),
        lineHeight: hp(2),
        color: '#F2FF5D',
    },
    featuredPartnerCardParagraph: {
        top: hp(3),
        padding: 8,
        fontFamily: 'Raleway-Bold',
        width: wp(80),
        fontSize: hp(1.5),
        lineHeight: hp(2),
        color: '#FFFFFF'
    },
    loadNearbyCardActionButton: {
        top: hp(10),
        right: wp(2),
        width: wp(60),
        borderRadius: 5
    },
    loadOnlineCardActionButton: {
        top: hp(3),
        // width: wp(25),
        borderRadius: 5
    },
    loadCardActionButtonLabel: {
        alignSelf: 'center',
        fontFamily: 'Saira-SemiBold',
        fontSize: hp(1.8),
        color: '#FFFFFF'
    },
    loadOnlineCardActionButtonLabel: {
        alignSelf: 'center',
        fontFamily: 'Saira-SemiBold',
        fontSize: hp(2),
        color: '#FFFFFF'
    },
    nearbyOfferCardParagraph: {
        top: hp(1.5),
        left: wp(2),
        padding: 8,
        fontFamily: 'Raleway-Bold',
        width: wp(80),
        fontSize: hp(1.5),
        lineHeight: hp(2),
        color: '#FFFFFF'
    },
    nearbyLoadingOfferCard: {
        left: wp(2),
        backgroundColor: 'transparent',
        width: wp(85),
        height: hp(30),
        shadowColor: 'transparent',
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 0.5,
        shadowRadius: 0
    },
    nearbyOfferCard: {
        left: wp(3),
        backgroundColor: '#5B5A5A',
        width: wp(85),
        height: hp(27),
        shadowColor: 'black',
        shadowOffset: {width: -2, height: 1},
        shadowOpacity: 0.6,
        shadowRadius: 2,
        elevation: 15
    },
    locationServicesEnableView: {
        top: hp(2),
        right: wp(4),
        height: hp(33),
        backgroundColor: '#2c2c2c',
        flexDirection: 'column',
        alignItems: 'center',
        alignContent: 'center',
        alignSelf: 'flex-start'
    },
    locationServicesEnableWarningMessage: {
        top: hp(2),
        width: wp(85),
        fontSize: hp(1.8),
        fontFamily: 'Saira-Medium',
        textAlign: 'center',
        color: '#FFFFFF'
    },
    locationServicesButton: {
        backgroundColor: '#F2FF5D',
        width: wp(50),
        height: hp(5),
        top: hp(1),
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center'
    },
    locationServicesImage: {
        width: wp(30),
        height: hp(15),
    },
    locationServicesButtonText: {
        color: '#313030',
        fontFamily: 'Saira-Medium',
        fontSize: hp(2.3),
        marginTop: hp(1)
    },
    nearbyLoadingOfferCardCover: {
        alignSelf: 'center',
        bottom: hp(15),
        left: wp(5),
        width: wp(60),
        height: hp(45),
    },
    nearbyOfferCardCover: {
        alignSelf: 'flex-end',
        top: hp(1),
        left: wp(20),
        width: wp(25),
        height: hp(12),
    },
    nearbyOfferCardTitleMain: {
        marginTop: hp(1),
        width: wp(40)
    },
    nearbyOfferCardTitle: {
        right: wp(1),
        fontFamily: 'Raleway-Medium',
        fontSize: hp(2),
        width: wp(40),
        lineHeight: hp(2.4),
        alignSelf: 'flex-start',
        color: '#FFFFFF'
    },
    nearbyOfferCardSubtitle: {
        right: wp(1),
        fontSize: hp(2),
        fontFamily: 'Raleway-SemiBold',
        alignSelf: 'flex-start',
        width: wp(40),
        color: '#F2FF5D',
    },
    viewOfferButton: {
        top: hp(1.5),
        alignSelf: 'center',
        backgroundColor: '#F2FF5D',
        width: wp(30),
        height: hp(4.5),
        left: wp(4),
        borderRadius: 5
    },
    viewOfferButtonContent: {
        color: '#313030',
        fontFamily: 'Changa-Medium',
        fontSize: hp(1.8),
        marginTop: hp(0.5),
        alignItems: 'center',
        alignSelf: 'center'
    },
    verticalOfferBenefit: {
        fontFamily: 'Raleway-Bold',
        color: '#F2FF5D'
    },
    verticalOfferBenefits: {
        marginTop: '2%',
        fontFamily: 'Raleway-SemiBold',
        color: '#FFFFFF',
        fontSize: hp(1.8)
    },
    verticalOfferName: {
        fontFamily: 'Raleway-SemiBold',
        color: '#FFFFFF',
        fontSize: hp(1.8)
    },
});
