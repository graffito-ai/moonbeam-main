import React from 'react';
import {Dimensions} from 'react-native';
import {ActivityIndicator, Modal, Portal} from 'react-native-paper';
// @ts-ignore
import LoginLogo from '../../../assets/login-logo.png';
// @ts-ignore
import {useValidation} from 'react-native-form-validator';

/**
 * Spinner component.
 */
export const Spinner = (props: {loadingSpinnerShown: boolean, setLoadingSpinnerShown: React.Dispatch<React.SetStateAction<boolean>>}) => {
    // return the component for the Spinner/loading view
    return (
        <Portal>
            <Modal dismissable={false} visible={props.loadingSpinnerShown}
                   onDismiss={() => props.setLoadingSpinnerShown(false)}>
                <ActivityIndicator animating={true} color={'#A2B000'} size={Dimensions.get('window').height / 18}/>
            </Modal>
        </Portal>
    );
};

