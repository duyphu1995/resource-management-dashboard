import { IEmployee } from '@/types/hr-management/employee-management';
import useLoading from '@/utils/hook/useLoading';
import { AutoComplete, AutoCompleteProps, Avatar, Space } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import { useEffect, useState } from 'react';
import EmptyBox from '../empty-box';

export interface IEmployeeAutoCompleteProps extends AutoCompleteProps {
    width?: number | string;
    getAPI: (searchText: string) => Promise<any>;
}

const { Option } = AutoComplete;

const EmployeeAutoComplete = (props: IEmployeeAutoCompleteProps) => {
    const { getAPI, width, placeholder = 'Search by Badge ID, Full Name, Work Email', ...otherProps } = props;
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    // All state
    const [searchValue, setSearchValue] = useState('');
    const [options, setOptions] = useState<DefaultOptionType[]>([]);
    const [keyword, setKeyword] = useState<string>('');

    // Update keyword after user doesn't enter input 500 ms
    useEffect(() => {
        const timer = setTimeout(() => setKeyword(searchValue), searchValue !== '' ? 500 : 0);
        return () => clearTimeout(timer);
    }, [searchValue]);

    // Fetch options by keyword
    useEffect(() => {
        const fetchOptions = async () => {
            turnOnLoading();
            const res = await getAPI(keyword);
            const { data } = res;
            const newOptions = (data || []).map((employee: IEmployee) => {
                return {
                    key: employee.employeeId,
                    value: employee.fullName,
                    label: employee.fullName,
                    employee: employee
                };
            });

            // Update new options and hide loading animation
            setOptions(newOptions);
            turnOffLoading();
        };

        if (!keyword) setOptions([]);
        else fetchOptions();
    }, [keyword, getAPI, turnOnLoading, turnOffLoading]);

    return (
        <AutoComplete
            {...otherProps}
            className="employee-select-root"
            popupMatchSelectWidth={true}
            popupClassName="employee-select-popup"
            showSearch
            searchValue={searchValue}
            onSearch={setSearchValue}
            optionFilterProp="label"
            style={{ width: width || 250 }}
            filterOption={() => true}
            allowClear
            placeholder={placeholder}
            notFoundContent={<EmptyBox loading={isLoading} isInitial={!searchValue} />}
            listHeight={200}
            getPopupContainer={triggerNode => triggerNode.parentNode}
        >
            {options?.map((option, index) => (
                <Option key={index} value={option.value?.toString()} label={option.label} title={option.label} employee={option.employee}>
                    <Space>
                        <div className="employee-select-item" about={option.employee}>
                            <div className="employee-select-avatar">
                                <Avatar size={32} src={option.employee.employeeImageUrl} alt={option.employee.fullName} />
                            </div>
                            <div className="employee-select-name-group">
                                <span className="employee-select-full-name">{option.employee.fullName}</span>
                                <span className="employee-select-badge-id">Badge ID: {option.employee.badgeId}</span>
                            </div>
                        </div>
                    </Space>
                </Option>
            ))}
        </AutoComplete>
    );
};

export default EmployeeAutoComplete;
