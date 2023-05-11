import {useValidation} from 'react-native-form-validator';

/**
 * File used as a utility class, for validating field values for forms
 */
export class FieldValidator {
    // Validation utilities to be defined, and used for validating fields from state
    private readonly validate: any;
    private readonly isFieldInError: any;
    private readonly getErrorsInField: any;

    /**
     * Utility constructor
     * @param state state to be passed in, containing all the fields to be validated
     */
    constructor(state: object) {
        const {validate, isFieldInError, getErrorsInField} = useValidation({state});
        this.validate = validate;
        this.isFieldInError = isFieldInError;
        this.getErrorsInField = getErrorsInField;
    }

    /**
     * Helper function used to validate fields
     *
     * @param fieldValue value of the field to validate
     * @param fieldName name of the field to validate
     * @param setErrorsArray method to popular the array of errors for that state
     */
    public validateField = (fieldValue: string, fieldName: string, setErrorsArray: React.Dispatch<React.SetStateAction<any[]>>) => {
        switch (fieldName) {
            case 'email':
                this.validate({
                    ...({[fieldName]: {minLength: 7, email: true, required: true}}),
                });
                // this is done because the in-built library for emails, does not fully work properly
                if (this.isFieldInError('email') || !/^([^\s@]+@[^\s@]+\.[^\s@]+)$/.test(fieldValue)) {
                    setErrorsArray([...this.getErrorsInField('email'), "Invalid email address."]);
                } else {
                    setErrorsArray([]);
                }
                break;
            case 'password':
                this.validate({
                    ...({
                        [fieldName]: {
                            required: true,
                        }
                    }),
                });
                if (this.isFieldInError('password')) {
                    setErrorsArray([...this.getErrorsInField('password')]);
                } else {
                    setErrorsArray([]);
                }
                break;
            default:
                console.log('Unexpected field name!');
        }
    };
}
