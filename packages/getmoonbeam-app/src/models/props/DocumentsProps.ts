import type {NativeStackScreenProps} from '@react-navigation/native-stack';

/**
 * The default list of params, to be used across the Documents stack props.
 */
export type DocumentsStackParamList = {
    DocumentsCenter: {},
    DocumentsViewer: {
        name: string;
        privacyFlag: boolean;
    }
};

// the Documents Center component props, within the Documents stack
export type DocumentsCenterProps = NativeStackScreenProps<DocumentsStackParamList, 'DocumentsCenter'>;
// the Documents Viewer component props, within the Documents stack
export type DocumentsViewerProps = NativeStackScreenProps<DocumentsStackParamList, 'DocumentsViewer'>;
