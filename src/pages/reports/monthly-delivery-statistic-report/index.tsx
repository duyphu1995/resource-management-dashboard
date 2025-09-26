import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import ReportFilter from '@/components/common/report-filter';
import Tab from '@/components/common/tab';
import BillableGrowth from '@/components/reports/monthly-delivery-statistic-report/billable-growth';
import Resignation from '@/components/reports/monthly-delivery-statistic-report/resignation';
import StaffGradeIndex from '@/components/reports/monthly-delivery-statistic-report/staff-grade-index';
import pathnames from '@/pathnames';
import { IFilterData } from '@/types/filter';
import { dateMappings } from '@/utils/common';
import keyTab from '@/utils/key-tab';
import { DatePicker, Form } from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import dayjs from 'dayjs';
import { useState } from 'react';
import './index.scss';

const MonthlyDeliveryStatisticReport = () => {
    const [filterForm] = Form.useForm();

    const pageTitle = pathnames.reports.monthlyDeliveryStatisticReport.main.name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    const currentDate = dayjs();
    const currentMonth = dayjs().format('MM');
    const currentYear = dayjs().format('YYYY');

    const [changeTabs, setChangeTabs] = useState<{ key: string }>({ key: 'BillableGrowth_Group' });
    const [loadingFilter, setLoadingFilter] = useState<boolean>(false);
    const [filterData, setFilterData] = useState({
        month: currentMonth,
        year: currentYear
    });

    const breadcrumb: BreadcrumbItemType[] = [
        { title: pathnames.reports.main.name },
        { title: pathnames.reports.monthlyDeliveryStatisticReport.main.name }
    ];

    const onFilter = async (value: any) => {
        if (value?.month) {
            const formattedMonth = dayjs(value?.month).format('MM');
            const formattedYear = dayjs(value?.month).format('YYYY');
            setFilterData({ month: formattedMonth, year: formattedYear });
        }
    };

    const onResetFilter = () => {
        setLoadingFilter(true);
        filterForm.setFieldsValue({ month: currentDate, year: currentDate });
        setFilterData({ month: currentMonth, year: currentYear });
        setLoadingFilter(false);
    };

    const disabledMonthPicker = (current: dayjs.Dayjs) => {
        return current && current > dayjs().endOf('day');
    };

    const filterDataColumn: IFilterData[] = [
        {
            key: 'month',
            forColumns: [],
            label: 'Month',
            alwaysShow: true,
            initialValue: currentDate,
            control: <DatePicker.MonthPicker placeholder="Select month" allowClear={false} format="MM-YYYY" disabledDate={disabledMonthPicker} />
        }
    ];

    const tabs = [
        {
            key: keyTab.billableGrowthGroup.name,
            label: keyTab.billableGrowthGroup.label,
            children: <BillableGrowth reloadData={changeTabs} filterData={filterData} />
        },
        {
            key: keyTab.StaffGradeIndexGroup.name,
            label: keyTab.StaffGradeIndexGroup.label,
            children: <StaffGradeIndex filterData={filterData} reloadData={changeTabs} />
        },
        {
            key: keyTab.resignationGroup.name,
            label: keyTab.resignationGroup.label,
            children: (
                <Resignation
                    reloadData={changeTabs}
                    filterValue={`${dateMappings[parseInt(filterData?.month, 10)]} ${filterData?.year}`}
                    filterData={filterData}
                />
            )
        }
    ];

    return (
        <DetailContent rootClassName="monthly-delivery">
            <BaseBreadcrumb dataItem={breadcrumb} />
            <ReportFilter
                pageTitle={pageTitle}
                loading={loadingFilter}
                data={filterDataColumn}
                filterForm={filterForm}
                onResetFilter={onResetFilter}
                onFilter={onFilter}
            />
            <Tab items={tabs} onChangeTabs={key => setChangeTabs({ key })} />
        </DetailContent>
    );
};

export default MonthlyDeliveryStatisticReport;
