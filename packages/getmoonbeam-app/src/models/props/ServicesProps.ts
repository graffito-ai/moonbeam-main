import type {NativeStackScreenProps} from '@react-navigation/native-stack';

/**
 * The default list of params, to be used across the Services stack props.
 */
export type ServicesStackParamList = {
    ServiceOfferings: {},
    ServiceOfferingDetails: {},
    EventSeriesDetails: {}
};

// the ServiceOfferings component props, within the Services stack
export type ServiceOfferingsProps = NativeStackScreenProps<ServicesStackParamList, 'ServiceOfferings'>;
// the ServiceOfferingDetails component props, within the Services stack
export type ServiceOfferingDetailsProps = NativeStackScreenProps<ServicesStackParamList, 'ServiceOfferingDetails'>;
// the EventSeriesDetails component props, within the Services stack
export type EventSeriesDetailsProps = NativeStackScreenProps<ServicesStackParamList, 'EventSeriesDetails'>;
