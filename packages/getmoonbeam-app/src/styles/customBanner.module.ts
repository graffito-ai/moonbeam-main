import {Dimensions, StyleSheet} from "react-native";

// styles to be used within the CustomBanner component
export const styles = StyleSheet.create({
    buttonLabel: {
        fontFamily: 'Saira-Bold',
        color: '#F2FF5D',
        fontSize: Dimensions.get('window').width/25
    },
    bannerImage: {
        width: Dimensions.get('window').width/7,
        height: Dimensions.get('window').width/7,
    },
    bannerDescription: {
        fontFamily: 'Saira-Medium',
        fontSize: Dimensions.get('window').width/27
    }
});
