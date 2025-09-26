import { IEmployee } from '@/types/hr-management/employee-management';
import { Select, SelectProps, Space } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import { useEffect, useState } from 'react';
import Avatar from '../avatar';
import EmptyBox from '../empty-box';
import './index.scss';
import useLoading from '@/utils/hook/useLoading';

export interface IEmployeeSelectProps extends SelectProps {
    width?: number | string;
    getAPI: (searchText: string) => Promise<any>;
    onSelectedEmployee: (value: any | null) => void;
}

const { Option } = Select;

export const EmployeeSelect = (props: IEmployeeSelectProps) => {
    const {
        getAPI,
        width,
        onSelectedEmployee,
        placeholder = 'Search by Badge ID, Full Name, Work Email',
        value: valueProp,
        onChange: onChangeProp,
        ...otherProps
    } = props;
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [options, setOptions] = useState<DefaultOptionType[]>([]);
    const [searchValue, setSearchValue] = useState('');
    const [keyword, setKeyword] = useState('');
    const [selectedOption, setSelectedOption] = useState<DefaultOptionType | null>(null);
    const [valueState, onChangeState] = useState<string | null>(null);
    const value = valueProp ?? valueState;
    const onChange = onChangeProp ?? onChangeState;

    // Update keyword after user doesn't enter input 500 ms
    useEffect(() => {
        const timer = setTimeout(() => setKeyword(searchValue), searchValue !== '' ? 500 : 0);
        return () => clearTimeout(timer);
    }, [searchValue]);

    // Fetch options when keyword and selectedOption were changed
    useEffect(() => {
        const fetchOptions = async () => {
            turnOnLoading();
            // Call api to get employee options by keyword
            const res = await getAPI(keyword);
            const { data } = res;
            const newOptions = (data || []).map((employee: IEmployee) => {
                return {
                    key: employee.employeeId,
                    value: employee.employeeId,
                    label: employee.fullName,
                    employee: employee
                };
            });

            // Update new options and hide loading animation
            setOptions(newOptions);
            turnOffLoading();
        };

        if (!keyword) {
            if (selectedOption) setOptions([selectedOption]);
            else setOptions([]);
        } else {
            fetchOptions();
        }
    }, [keyword, getAPI, selectedOption, turnOnLoading, turnOffLoading]);

    // Handle change value
    const handleChange = (_value: any, option: any) => {
        setKeyword('');
        const newSelectedOption = option ? { ...option, children: undefined } : null;
        setSelectedOption(newSelectedOption);
        onChange(_value, option);
    };

    // Update selected option and
    const onClear = () => {
        setSelectedOption(null);
        onChange(null, {} as any);
    };

    // Update selected employee when selected option updated
    useEffect(() => {
        onSelectedEmployee(selectedOption?.employee);
    }, [selectedOption, onSelectedEmployee]);

    return (
        <Select
            {...otherProps}
            className="employee-select-root"
            popupMatchSelectWidth={true}
            popupClassName="employee-select-popup"
            showSearch
            searchValue={searchValue}
            onSearch={setSearchValue}
            optionLabelProp="label"
            optionFilterProp="label"
            style={{ width: width || 250 }}
            value={value}
            onChange={handleChange}
            filterOption={() => true}
            allowClear
            onClear={onClear}
            placeholder={placeholder}
            notFoundContent={searchValue && <EmptyBox loading={isLoading} isInitial={!searchValue} />}
            listHeight={200}
            getPopupContainer={triggerNode => triggerNode.parentNode}
        >
            {options?.map((option, index) => (
                <Option key={index} value={option.value} label={option.label} title={option.label} employee={option.employee}>
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
        </Select>
    );
};

export default EmployeeSelect;
