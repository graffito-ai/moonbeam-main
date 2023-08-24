import {Dimensions, StyleSheet} from "react-native";

// styles to be used within the DocumentsViewer component
export const styles = StyleSheet.create({
    topBar: {
        flex: 0.11,
        backgroundColor: '#313030',
        flexDirection: 'column',
    },
    containerView: {
        flex: 0.10,
        justifyContent: 'space-between',
        flexDirection: 'row',
        flexWrap: 'nowrap'
    },
    backButton: {
        top: Dimensions.get('window').height / 25,
        left: Dimensions.get('window').width/30,
        alignItems: 'flex-start'
    },
    shareButton: {
        top: Dimensions.get('window').height / 22,
        right: Dimensions.get('window').width/30,
        alignItems: 'flex-end'
    }
});
