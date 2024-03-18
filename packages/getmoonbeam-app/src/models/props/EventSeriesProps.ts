import type {NativeStackScreenProps} from '@react-navigation/native-stack';

/**
 * The default list of params, to be used across the Event Series stack props.
 */
export type EventSeriesStackParamList = {
    EventSeriesDetails: {},
    EventSeriesWebView: {}
};

// the EventSeriesDetails component props, within the Event Series stack
export type EventSeriesDetailsProps = NativeStackScreenProps<EventSeriesStackParamList, 'EventSeriesDetails'>;
// the EventSeriesWebView component props, within the Service Partner stack
export type EventSeriesWebViewProps = NativeStackScreenProps<EventSeriesStackParamList, 'EventSeriesWebView'>;
