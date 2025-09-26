import { TIME_FORMAT } from '@/utils/constants';
import { DatePickerProps } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import DatePicker from '../../form/date-picker';

export interface IFilterDateRangeProps {
    fromName: string;
    toName: string;
    allowClear?: boolean;
    onChange?: (value: IFilterDateRangeValue | undefined) => void;
    value?: IFilterDateRangeValue;
    disabled?: boolean;
    disableToDateProps?: (currentDate?: dayjs.Dayjs) => boolean;
}

export interface IFilterDateRangeValue {
    fromDate: dayjs.Dayjs | null;
    toDate: dayjs.Dayjs | null;
}

const FilterDateRange = (props: IFilterDateRangeProps) => {
    const { value, allowClear = true, onChange, disabled, disableToDateProps } = props;

    const style = { flex: 1 };
    const size = 'small';
    const fromDatePlaceholder = 'From MMM DD, YYYY';
    const toDatePlaceholder = 'To MMM DD, YYYY';
    const fromDateFormat: DatePickerProps['format'] = value => `From ${value.format(TIME_FORMAT.US_DATE)}`;
    const toDateFormat: DatePickerProps['format'] = value => `To ${value.format(TIME_FORMAT.US_DATE)}`;
    const fromDateDisabled = (currentDate: dayjs.Dayjs) => (toDate && currentDate?.startOf('day') > toDate) || false;
    const toDateDisabled = (currentDate: dayjs.Dayjs) =>
        (fromDate && currentDate?.startOf('day').isBefore(fromDate)) || currentDate?.startOf('day').isAfter(dayjs().startOf('day'));

    const [currentValue, setCurrentValue] = useState<IFilterDateRangeValue | undefined>(undefined);

    const fromDate = currentValue?.fromDate ? dayjs(currentValue.fromDate)?.startOf('day') : null;
    const toDate = currentValue?.toDate ? dayjs(currentValue.toDate)?.startOf('day') : null;

    // Update currentValue when value was changed
    useEffect(() => {
        setCurrentValue(value);
    }, [value]);

    const onChangeDateRange = (fromDate: dayjs.Dayjs | null, toDate: dayjs.Dayjs | null) => {
        const newValue = fromDate || toDate ? { fromDate: fromDate, toDate: toDate } : undefined;

        onChange?.(newValue);
        setCurrentValue(newValue);
    };

    const onChangeStartDate = (fromDate: dayjs.Dayjs | null) => {
        if (fromDate && toDate && fromDate > toDate) fromDate = toDate;
        onChangeDateRange(fromDate, toDate);
    };
    const onChangeEndDate = (toDate: dayjs.Dayjs | null) => {
        if (fromDate && toDate && toDate < fromDate) toDate = fromDate;
        onChangeDateRange(fromDate, toDate);
    };

    return (
        <div className="filter-date-range">
            <DatePicker
                size={size}
                format={fromDateFormat}
                disabledDate={fromDateDisabled}
                placeholder={fromDatePlaceholder}
                allowClear={allowClear}
                style={style}
                value={fromDate}
                onChange={onChangeStartDate}
                disabled={disabled}
            />
            <span> - </span>
            <DatePicker
                size={size}
                format={toDateFormat}
                disabledDate={disableToDateProps ?? toDateDisabled}
                placeholder={toDatePlaceholder}
                allowClear={allowClear}
                style={style}
                value={toDate}
                onChange={onChangeEndDate}
                disabled={disabled}
            />
        </div>
    );
};

export default FilterDateRange;
