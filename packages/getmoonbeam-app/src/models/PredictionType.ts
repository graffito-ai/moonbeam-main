/**
 * Predictions for the Address Line.
 */
export interface PredictionType {
    description: string,
    place_id: string,
    reference: string,
    matched_substrings: any[],
    structured_formatting: Object,
    address_components: any[],
    terms: Object[],
    types: string[]
}
