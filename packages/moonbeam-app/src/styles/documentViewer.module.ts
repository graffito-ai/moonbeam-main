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
    bottomView: {
        alignItems: 'center'
    },
    shareButton: {
        borderRadius: 25,
        borderColor: '#313030',
        height: 50,
        width: 150,
        marginTop: '5%'
    }
});
