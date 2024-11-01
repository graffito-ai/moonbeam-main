import {StyleSheet} from "react-native";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';

// styles to be used within the Wallet component
export const styles = StyleSheet.create({
    membershipCardTitleView: {
        width: wp(75),
        height: hp(12),
        flexDirection: 'row',
        alignSelf: 'center',
        top: hp(1)
    },
    membershipCardActions: {
        width: wp(95),
        height: hp(10),
        alignSelf: 'center',
        flexDirection: 'row',
        position: 'absolute',
        bottom: hp(0)
    },
    membershipCard: {
        height: hp(55),
        width: wp(95),
        backgroundColor: '#313030',
        borderColor: '#FFFFFF',
        borderWidth: hp(0.075),
        borderRadius: hp(2),
        alignSelf: 'center',
        alignItems: 'center',
        bottom: hp(17),
        flexDirection: 'column'
    },
    priceTitle: {
        alignSelf: 'center',
        fontFamily: 'Saira-Bold',
        fontSize: hp(3.5),
        textDecorationLine: 'underline',
        textAlign: 'left',
        color: '#FFFFFF',
        left: wp(15),
        lineHeight: hp(4),
        top: hp(0.5)
    },
    basicMembershipTitle: {
        alignSelf: 'center',
        fontFamily: 'Saira-SemiBold',
        fontSize: hp(2.75),
        textAlign: 'left',
        color: '#F2FF5D',
        left: wp(10),
        lineHeight: hp(3.5)
    },
    membershipTitle: {
        alignSelf: 'center',
        fontFamily: 'Saira-SemiBold',
        fontSize: hp(3),
        textAlign: 'center',
        color: '#FFFFFF',
        bottom: hp(18.5)
    },
    cardView: {
        flexDirection: 'column',
        alignContent: 'center',
        alignItems: 'center',
        alignSelf: 'center'
    },
    mainCardView: {
        flex: 1,
        width: wp(100),
        paddingTop: hp(3)
    },
    noCardImage: {
        height: hp(55),
        width: wp(55),
        bottom: hp(15),
        alignSelf: 'center'
    },
    membershipImage: {
        height: hp(30),
        width: wp(30),
        bottom: hp(9),
        alignSelf: 'center'
    },
    basicMembershipImage: {
        height: hp(22),
        width: wp(22),
        left: wp(5),
        alignSelf: 'center'
    },
    walletTopTitleView: {
        height: hp(7),
        width: wp(100),
        flexDirection: 'column'
    },
    walletView: {
        flex: 1,
        width: wp(100),
        height: hp(100),
        flexDirection: 'column',
        alignContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: '#313030'
    },
    cardRemovalButton: {
        backgroundColor: '#F2FF5D',
        position: 'absolute',
        width: wp(40),
        height: hp(5),
        bottom: -hp(10),
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center'
    },
    linkingButtonDisabled: {
        display: "none"
    },
    splashButton: {
        backgroundColor: '#F2FF5D',
        width: wp(50),
        height: hp(5),
        marginBottom: hp(1),
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonText: {
        color: '#313030',
        fontFamily: 'Saira-Medium',
        fontSize: hp(2.3),
        marginTop: hp(1.3)
    },
    listSectionView: {
        left: wp(4),
        marginTop: hp(3),
        alignSelf: 'flex-start',
        width: wp(90),
        borderRadius: 10
    },
    cardItemStyle: {
        flex: 1,
        borderRadius: 20
    },
    cardItemTitle: {
        fontFamily: 'Saira-Bold',
        fontSize: hp(2.5),
        width: wp(40),
        bottom: hp(2.8),
        right: wp(20)
    },
    cardItemDetails: {
        fontFamily: 'Saira-Medium',
        fontSize: hp(2),
        left: wp(3.5),
        width: wp(85)
    },
    cardLinkingParentView: {
        backgroundColor: '#5B5A5A',
        alignContent: 'center',
        alignSelf: 'center',
        alignItems: 'center'
    },
    cardLinkingIframeView: {
        backgroundColor: 'transparent',
        width: wp(125),
        flexGrow: 1
    },
    disclaimerTextView: {
        position: 'absolute',
        bottom: hp(5),
        alignItems: 'center',
        alignSelf: 'center',
        textAlign: 'center'
    },
    membershipPerkText: {
        fontFamily: 'Saira-Regular',
        fontSize: hp(2.1),
        textAlign: 'left',
        alignSelf: 'flex-start',
        color: '#FFFFFF',
        left: wp(18),
        bottom: hp(2.5),
        lineHeight: hp(2.5)
    },
    membershipPerkNumberText: {
        fontFamily: 'Saira-Regular',
        fontSize: hp(3.5),
        textAlign: 'left',
        alignSelf: 'flex-start',
        top: hp(2),
        left: wp(5),
        color: '#F2FF5D'
    },
    disclaimerText: {
        fontFamily: 'Saira-Regular',
        fontSize: hp(2.1),
        width: wp(70),
        textAlign: 'center',
        color: '#FFFFFF'
    },
    walletTextView: {
        top: hp(2),
        flexDirection: 'column',
        marginTop: hp(4)
    },
    walletTitle: {
        alignSelf: 'flex-start',
        fontFamily: 'Saira-SemiBold',
        fontSize: hp(4),
        left: wp(6),
        color: '#FFFFFF'
    },
    cardRemovalTitle: {
        fontFamily: 'Saira-Medium',
        fontSize: hp(3.5),
        color: '#FFFFFF'
    },
    cardRemovalDetails: {
        fontFamily: 'Saira-Medium',
        fontSize: hp(2.5),
        bottom: hp(1.5),
        color: '#F2FF5D'
    },
    cardRemovalSubtitle: {
        fontFamily: 'Raleway-Regular',
        fontSize: hp(2),
        width: wp(90),
        top: hp(1),
        textAlign: 'center',
        color: '#FFFFFF'
    },
    bottomSheet: {
        backgroundColor: '#5B5A5A'
    },
    highlightedText: {
        color: '#F2FF5D'
    },
    infoCardButtonContentStyle: {
        color: '#F2FF5D',
        fontFamily: 'Saira-Bold',
        textDecorationLine: 'underline',
        fontSize: hp(2.20),
        marginTop: hp(0.5),
        alignItems: 'center',
        alignSelf: 'center'
    },
    infoCardButton: {
        right: wp(30),
        top: hp(18),
        backgroundColor: 'transparent',
        width: wp(50),
        height: hp(5),
        borderRadius: 0
    },
    startMembershipButton: {
        alignSelf: 'center',
        backgroundColor: '#F2FF5D',
        width: wp(30),
        height: hp(5.5),
        left: wp(35),
        borderRadius: 0
    },
    startMembershipButtonContentStyle: {
        color: '#313030',
        fontFamily: 'Saira-Medium',
        fontSize: hp(2.3),
        marginTop: hp(1),
        alignItems: 'center',
        alignSelf: 'center'
    }
});
