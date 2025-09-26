import { IFilterData } from '@/types/filter';
import { ITableShowedColumn } from '@/types/table';
import { TIME_FORMAT } from '@/utils/constants';
import { CheckboxOptionType, FormInstance, TableColumnType } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import DatePicker from '../../form/date-picker';
import TreeSelect, { ITreeSelectProps } from '../../form/tree-select';
import FilterDateRange, { IFilterDateRangeValue } from './filter-date-range';

// Check selected all tree nodes
const checkIsSelectedAllTreeNodes = (currentValue: string[] = [], treeData: any[] = []) => {
    let flag = true;

    if (currentValue?.length === treeData?.length) {
        currentValue?.forEach((value: any) => {
            if (treeData && treeData?.findIndex(data => data.value?.toString() === value.toString()) < 0) flag = false;
        });
    } else flag = false;

    return flag;
};

// Get valid option values
export const getValidTreeNodeOptionsValue = (values: any[] = [], treeData: any[] = [], validValues: any[] = []) => {
    treeData.forEach(treeNode => {
        const isValidValue = values.findIndex(item => item === treeNode.value) >= 0;

        if (isValidValue) {
            const isExistsInValidValues = validValues.findIndex(value => value === treeNode.value) >= 0;
            if (!isExistsInValidValues) validValues.push(treeNode.value);
        } else {
            if (treeNode.children?.length > 0) getValidTreeNodeOptionsValue(values, treeNode.children, validValues);
        }
    });

    return validValues;
};

export const isValidTreeNodeOptionValue = (value: any, treeData: any[] = []) => {
    let isValidValue = false;

    const checkValue = (options: any[]) => {
        if (options.findIndex(item => item.value === value) >= 0) isValidValue = true;

        options.forEach(option => {
            if (option.children) checkValue(option.children);
        });
    };

    checkValue(treeData);
    return isValidValue;
};

// Check selected all options
const checkIsSelectedAllOptions = (values: any[], options: (DefaultOptionType | CheckboxOptionType)[]) => {
    return values.length === options.length;
};

// Get valid option values
export const getValidOptionsValue = (values: any[] = [], options: (DefaultOptionType | CheckboxOptionType)[] = []) => {
    values.forEach((item, index) => {
        if (options.findIndex(option => item === option.value?.toString()) < 0) delete values[index];
    });

    if (!values?.toString()) return null;
    return values;
};

// Function to convert filter data into search parameters
export const getFilterValue = (form: FormInstance<any>, filterData: IFilterData[]) => {
    // Initialize the result object as an array or an object based on the resultType parameter
    let result: any = {};

    // Add new value
    const addToResult = (itemName: string, itemValue: any) => (result = { ...result, [itemName]: itemValue });

    filterData.forEach(item => {
        const { key } = item;
        const itemProps = item.control.props as any;
        let value = form.getFieldValue(key);

        // Skip if value invalid (null, undefined, empty)
        if (!value?.toString()) return;

        switch (item.control.type) {
            case TreeSelect: {
                const treeData = itemProps.treeData || []; // Get tree data

                if (Array.isArray(value)) {
                    value = getValidTreeNodeOptionsValue(value, treeData); // Get valid option values
                    if (!checkIsSelectedAllTreeNodes(value, treeData)) addToResult(key, value); // If select all tree node then don't add value
                } else {
                    if (isValidTreeNodeOptionValue(value, treeData)) addToResult(key, value);
                }

                break;
            }
            case FilterDateRange: {
                const { fromName, toName } = itemProps;
                const fromDate = value.fromDate;
                const toDate = value.toDate;

                // Add the result value if it has value
                if (fromDate) addToResult(fromName, fromDate.format(TIME_FORMAT.DATE));
                if (toDate) addToResult(toName, toDate.format(TIME_FORMAT.DATE));

                break;
            }

            default: {
                const options = itemProps.options;

                if (options) {
                    if (Array.isArray(value)) {
                        value = getValidOptionsValue(value, options); // Get valid option values
                        if (!checkIsSelectedAllOptions(value, options)) addToResult(key, value); // If select all options then don't add value
                    } else {
                        if (options.findIndex((option: any) => option.value === value) >= 0) addToResult(key, value);
                    }
                } else addToResult(key, value);
            }
        }
    });

    return result;
};

export const convertFilterValueToString = (form: FormInstance<any>, filterData: IFilterData) => {
    try {
        const { key } = filterData;
        let value = form.getFieldValue(key);

        // Skip if value invalid (null, undefined, empty)
        if (!value?.toString()) return JSON.stringify(null);

        switch (filterData.control.type) {
            case FilterDateRange: {
                const fromDate = value.fromDate ? dayjs(value.fromDate).format(TIME_FORMAT.DATE) : null;
                const toDate = value.toDate ? dayjs(value.toDate).format(TIME_FORMAT.DATE) : null;

                return JSON.stringify({ fromDate, toDate });
            }
            case DatePicker: {
                return dayjs(value).format(TIME_FORMAT.DATE);
            }
            case TreeSelect: {
                const { multiple, treeData = [] } = filterData.control.props as any as ITreeSelectProps;

                if (multiple && checkIsSelectedAllTreeNodes(value, treeData)) {
                    value = getValidTreeNodeOptionsValue(value, treeData);
                    if (checkIsSelectedAllTreeNodes(value, treeData)) return 'SelectAll';
                }
                return JSON.stringify(value);
            }
            default: {
                const { options } = filterData.control.props as any;

                if (options && Array.isArray(value)) {
                    value = getValidOptionsValue(value, options);
                    if (checkIsSelectedAllOptions(value, options)) return 'SelectAll';
                }

                return JSON.stringify(value);
            }
        }
    } catch (error) {
        return JSON.stringify(null);
    }
};

export const convertStringToFilterValue = (stringValue: string = '', filterData: IFilterData) => {
    if (stringValue === 'null') return null;

    try {
        switch (filterData.control.type) {
            case FilterDateRange: {
                const value = JSON.parse(stringValue);
                const fromDate = value.fromDate ? dayjs(value.fromDate, TIME_FORMAT.DATE) : null;
                const toDate = value.toDate ? dayjs(value.toDate, TIME_FORMAT.DATE) : null;

                return { fromDate, toDate } as IFilterDateRangeValue;
            }
            case DatePicker: {
                return dayjs(stringValue, TIME_FORMAT.DATE);
            }
            case TreeSelect: {
                const { multiple, treeData = [] } = filterData.control.props as any as ITreeSelectProps;

                if (multiple && stringValue === 'SelectAll') {
                    return treeData.map(item => item.value);
                } else {
                    return JSON.parse(stringValue);
                }
            }
            default: {
                const { options } = filterData.control.props as any;

                if (options && stringValue === 'SelectAll') {
                    return options.map((option: any) => option.value);
                }
                return JSON.parse(stringValue);
            }
        }
    } catch {
        return null;
    }
};

// Get showed columns by showed columns data
export const getShowedColumns = <T>(columns: TableColumnType<T>[], showedColumns: ITableShowedColumn[]) => {
    const result = columns.filter(item => {
        const showedColumn = showedColumns.find(filterColItem => filterColItem.key === item.key);

        if (showedColumn?.alwaysShow || showedColumn?.show || item.key === 'action') return true;
        return false;
    });

    return result;
};

// Initialize the showed columns from the always-show array of column names
export const initializeShowedColumns = <T>(alwaysShowColumnNames: string[], tableColumns: ColumnsType<T>, enabledSearchCols: string[]) => {
    let result: ITableShowedColumn[] = [];

    tableColumns.forEach(item => {
        if (item.key !== 'action') {
            const alwaysShow = alwaysShowColumnNames.find(name => name === item.key) ? true : false;
            const enabledSearch = enabledSearchCols.find(name => name === item.key) ? true : false;

            result = [
                ...result,
                {
                    label: item.title,
                    alwaysShow,
                    // show: alwaysShow,
                    enabledSearch,
                    key: item.key
                } as ITableShowedColumn
            ];
        }
    });

    return result;
};
