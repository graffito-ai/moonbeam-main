import {Dimensions, StyleSheet} from "react-native";

// styles to be used within the CustomBanner component
export const styles = StyleSheet.create({
    bannerStyle: {
        backgroundColor: '#313030',
        borderTopWidth: Dimensions.get('window').width / 1000,
        borderBottomWidth: Dimensions.get('window').width / 1000,
        width: Dimensions.get('window').width,
        position: 'absolute',
        bottom: 0
    },
    buttonLabel: {
        fontFamily: 'Saira-Bold',
        color: '#F2FF5D',
        fontSize: Dimensions.get('window').width/25
    },
    buttonLabelTablet: {
        fontFamily: 'Saira-Bold',
        color: '#F2FF5D',
        marginRight: Dimensions.get('window').width/40,
        fontSize: Dimensions.get('window').width/58
    },
    bannerImage: {
        width: Dimensions.get('window').width/7,
        height: Dimensions.get('window').width/7,
    },
    bannerImageTablet: {
        width: Dimensions.get('window').width/10,
        height: Dimensions.get('window').width/10,
    },
    bannerDescription: {
        fontFamily: 'Saira-Medium',
        fontSize: Dimensions.get('window').width/27
    },
    bannerDescriptionTablet: {
        fontFamily: 'Saira-Medium',
        fontSize: Dimensions.get('window').width/40
    }
});