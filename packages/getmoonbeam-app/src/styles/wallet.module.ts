import {StyleSheet} from "react-native";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';

// styles to be used within the Wallet component
export const styles = StyleSheet.create({
    cardView: {
        flexDirection: 'column',
        alignContent: 'center',
        alignItems: 'center',
        alignSelf: 'center'
    },
    mainCardView: {
        flex: 1,
        width: wp(100)
    },
    noCardImage: {
        height: hp(55),
        width: wp(55),
        bottom: hp(5),
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
        backgroundColor: '#F2FF5D',
        height: hp(25),
        width: wp(90),
        borderRadius: 20
    },
    cardItemTitle: {
        color: '#313030',
        fontFamily: 'Saira-Bold',
        fontSize: hp(2.3),
        width: wp(40),
        bottom: hp(2)
    },
    cardItemDetails: {
        color: '#313030',
        fontFamily: 'Saira-Regular',
        fontSize: hp(2)
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
    disclaimerText: {
        fontFamily: 'Saira-Regular',
        fontSize: hp(2.1),
        width: wp(70),
        textAlign: 'center',
        color: '#FFFFFF'
    },
    walletTextView: {
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
        fontSize: hp(3),
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
    }
});
