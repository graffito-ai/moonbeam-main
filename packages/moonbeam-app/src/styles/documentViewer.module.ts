import {Dimensions, StyleSheet} from "react-native";

// styles to be used within the DocumentViewer component
export const styles = StyleSheet.create({
    modalParagraph: {
        textAlign: 'center',
        alignSelf: 'flex-start',
        fontFamily: 'Raleway-Regular',
        fontSize: 16,
        width: 350,
        color: '#313030'
    },
    modalContainer: {
        alignSelf: 'center',
        backgroundColor: 'white',
        height: Dimensions.get('window').height/6,
        borderRadius: 15,
        padding: 20,
        borderWidth: 1,
        borderColor: 'red'
    },
    modalButton: {
        borderRadius: 25,
        borderColor: 'red',
        height: 40,
        width: 350,
        marginTop: '10%'
    },
    topBar: {
        flex: 0.10,
        backgroundColor: '#f2f2f2',
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
        alignItems: 'flex-start'
    },
    shareButton: {
        top: Dimensions.get('window').height / 25,
        alignItems: 'flex-end'
    }
});
