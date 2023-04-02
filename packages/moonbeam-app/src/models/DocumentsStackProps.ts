import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from "react";

/**
 * The default list of params, to be used across all Documents derived stack props.
 */
export type DocumentsStackParamList = {
    DocumentsCenter: {
        setIsDrawerHeaderShown: React.Dispatch<React.SetStateAction<boolean>>
    },
    DocumentViewer: {
        name: string;
        privacyFlag: boolean;
        setIsDrawerHeaderShown?: React.Dispatch<React.SetStateAction<boolean>>
    }
};

// the SettingsList component props, within the Home stack
export type DocumentsCenterProps = NativeStackScreenProps<DocumentsStackParamList, 'DocumentsCenter'>
// the FAQ component props, within the Home stack
export type DocumentViewerDocumentCenterProps = NativeStackScreenProps<DocumentsStackParamList, 'DocumentViewer'>
