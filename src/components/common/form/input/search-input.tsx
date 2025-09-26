import { Input, InputProps } from 'antd';
import SearchIcon from '/media/icons/search-gray.svg';
import { ChangeEvent, useState } from 'react';

export interface ISearchInputProps extends InputProps {
    setKeyword: (keyword: string) => void;
}

const SearchInput = (props: ISearchInputProps) => {
    const { allowClear = true, placeholder = 'Search by keywords', setKeyword, ...otherProps } = props;

    // Search input
    const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

    // Handle change keyword (search input)
    const onChangeKeyword = (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;

        if (typingTimeout) clearTimeout(typingTimeout);

        const newTimeout = setTimeout(() => {
            setKeyword(value);
        }, 1000);

        setTypingTimeout(newTimeout);
    };

    return (
        <Input
            {...otherProps}
            addonBefore={<img src={SearchIcon} alt="icon" />}
            allowClear={allowClear}
            placeholder={placeholder}
            onChange={onChangeKeyword}
        />
    );
};

export default SearchInput;
