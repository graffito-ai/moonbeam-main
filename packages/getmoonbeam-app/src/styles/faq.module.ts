import {StyleSheet} from "react-native";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';

// styles to be used within the FAQ component
export const styles = StyleSheet.create({
    mainView: {
        flex: 1,
        flexGrow: 1,
        backgroundColor: '#313030',
        flexDirection: 'column'
    },
    faqsListView: {
        alignSelf: 'center',
        width: wp(95),
        backgroundColor: '#5B5A5A',
        bottom: hp(2)
    },
    faqAccordionStyle: {
        marginTop: hp(4),
        alignSelf: 'center',
        width: wp(95),
        backgroundColor: '#5B5A5A'
    },
    faqAccordionTitle: {
        alignSelf: 'flex-start',
        fontFamily: 'Raleway-Medium',
        left: wp(2),
        fontSize: hp(1.8),
        width: wp(70),
        color: '#FFFFFF',
    },
    factItem: {
        borderColor: '#FFFFFF',
        borderTopWidth: hp(0.05),
        backgroundColor: '#5B5A5A',
    },
    factItemTitle: {
        fontFamily: 'Saira-Medium',
        fontSize: hp(1.75),
        width: wp(80),
        right: wp(2),
        textAlign: 'justify',
        alignSelf: 'flex-start',
        textDecorationLine: 'underline',
        color: '#F2FF5D'
    },
    factItemDescription: {
        fontFamily: 'Saira-Medium',
        fontSize: wp(3.5),
        width: wp(85),
        bottom: hp(1),
        textAlign: 'left',
        alignSelf: 'center',
        color: '#FFFFFF'
    },
});
