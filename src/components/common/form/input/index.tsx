import { Input, InputProps } from 'antd';
import { ChangeEvent, FocusEvent } from 'react';

interface CustomInputProps extends InputProps {
    placeholder?: string;
    value?: string;
    onChange?: (value: any) => void;
    typeInput?: 'no-spaces' | 'phone-number' | 'capitalize-lettersOnly' | 'numbers-only';
}

// This is a custom input component that formats the input value based on the specified typeInput.
const InputCommon = (props: CustomInputProps) => {
    const { onChange, typeInput, value, ...otherProps } = props;

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        let formattedValue = inputValue;

        switch (typeInput) {
            case 'no-spaces':
                // Remove all spaces from the input value.
                formattedValue = inputValue.replace(/ /g, '');
                break;
            case 'capitalize-lettersOnly':
                // Capitalize the first letter of each word and remove all numbers from the input value.
                formattedValue = inputValue
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                break;
            case 'phone-number':
                // Remove all non-numeric characters from the input value.
                formattedValue = formatPhoneNumber(inputValue.replace(/\D/g, ''));
                break;
            default:
                formattedValue = inputValue;
        }

        onChange && onChange(formattedValue);
    };

    const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        let formattedValue = '';

        switch (typeInput) {
            case 'numbers-only':
                // Ensure the input value is a non-negative number on blur.
                formattedValue = inputValue.replace(/[^0-9]/g, '');
                break;
            default:
                formattedValue = inputValue;
        }

        onChange && onChange(formattedValue);
    };

    const formatPhoneNumber = (phoneNumber: string) => {
        const match = phoneNumber.match(/(\d{0,4})(\d{0,3})(\d{0,3})/);
        if (match) {
            return [match[1], match[2], match[3]].filter(Boolean).join(' ');
        }
        return phoneNumber;
    };

    return <Input onChange={handleInputChange} onBlur={handleBlur} value={value} {...otherProps} />;
};

export default InputCommon;
