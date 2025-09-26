import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import BaseSelect from '@/components/common/form/select';
import FilterDateRange from '@/components/common/list-management/filter/filter-date-range';
import ReportFilter from '@/components/common/report-filter';
import Tab from '@/components/common/tab';
import { StaffGradeIndexDcDG, StaffGradeIndexPrograms, StaffGradeIndexProjects } from '@/components/reports/staff-grade-index-report';
import pathnames from '@/pathnames';
import staffGradeIndexReportService from '@/services/reports/staff-grade-index-report';
import { IFilterData } from '@/types/filter';
import { downloadFile, getWeekOptions } from '@/utils/common';
import { ORG_UNITS, TIME_FORMAT } from '@/utils/constants';
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';
import { ButtonProps, Form, FormInstance } from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { DefaultOptionType } from 'antd/es/select';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

export interface IStaffGradeFilterParams {
    fromDate: string;
    toDate: string;
    week: string;
    year: string;
    unitTypeLevel: string;
}

export interface WeekYear {
    value: string;
    label: string;
}

const StaffGradeIndexReportPage = () => {
    const { showNotification } = useNotify();
    const [filterForm] = Form.useForm();
    const { havePermission } = usePermissions('StaffGradeIndexReportList', 'StaffGradeIndexReport');

    const [loadingFilter, setLoadingFilter] = useState<boolean>(false);
    const [changeTabs, setChangeTabs] = useState<{ key: string }>({ key: '3' });
    const [weeksOptions, setWeeksOptions] = useState<DefaultOptionType[]>([]);
    const [filterParams, setFilterParams] = useState<IStaffGradeFilterParams>();
    const [loadingReport, setLoadingReport] = useState<boolean>(false);

    const pageTitle = pathnames.reports.staffGradeIndexReport.main.name;
    const breadcrumb: BreadcrumbItemType[] = [{ title: pathnames.reports.main.name }, { title: pathnames.reports.staffGradeIndexReport.main.name }];

    // Add export Report button
    const buttons: ButtonProps[] = havePermission('Export') && [
        { children: 'Export', onClick: () => handleGenerateReport(), loading: loadingReport }
    ];

    const getDateRangeFromWeek = (year: number, week: number) => {
        const fromDate = dayjs().year(year).week(week).startOf('week').format(TIME_FORMAT.DATE);
        const toDate = dayjs().year(year).week(week).endOf('week').format(TIME_FORMAT.DATE);
        return { fromDate, toDate };
    };

    const onResetFilter = () => {
        setDefaultFormValue(filterForm);
    };

    const onFilter = async (value: IStaffGradeFilterParams) => {
        const { week } = value;
        const weekArr = week.split('-');
        const { fromDate, toDate } = getDateRangeFromWeek(Number(weekArr[1]), Number(weekArr[0]));
        setFilterParams({ ...value, fromDate, toDate, week: weekArr[0], year: weekArr[1], unitTypeLevel: changeTabs.key });
    };

    const filterData: IFilterData[] = [
        {
            key: 'dateRange',
            forColumns: [],
            label: 'Staff Grade Index Report Date',
            alwaysShow: true,
            control: <FilterDateRange fromName="fromDate" toName="toDate" allowClear={false} />,
            colSpan: 12
        },
        {
            key: 'week',
            forColumns: [],
            label: 'Week',
            alwaysShow: true,
            control: <BaseSelect size="small" placeholder="Select week" options={weeksOptions} allowClear={false} filterSort={() => 0} />
        }
    ];

    const tabs = [
        {
            key: '3',
            label: `Staff Grade Index ${ORG_UNITS.DC}/${ORG_UNITS.DG}`,
            children: filterParams && <StaffGradeIndexDcDG filterParams={filterParams} />
        },
        {
            key: '2',
            label: `Staff Grade Index ${ORG_UNITS.Programs}`,
            children: filterParams && <StaffGradeIndexPrograms filterParams={filterParams} />
        },
        {
            key: '1',
            label: `Staff Grade Index ${ORG_UNITS.Projects}`,
            children: filterParams && <StaffGradeIndexProjects filterParams={filterParams} />
        }
    ];

    const setDefaultFormValue = (filterForm: FormInstance<IStaffGradeFilterParams>) => {
        setLoadingFilter(true);
        const fromDate = dayjs().startOf('year');
        const toDate = dayjs();
        filterForm.setFieldValue('dateRange', { fromDate, toDate });
        setLoadingFilter(false);
    };

    const onChangeTabs = (key: string) => {
        setChangeTabs({ key });
        filterParams && setFilterParams({ ...filterParams, unitTypeLevel: key });
    };

    const handleGenerateReport = async () => {
        try {
            setLoadingReport(true);

            const res = await staffGradeIndexReportService.exportExcel({
                fromDate: weeksOptions[0]?.value?.toString() || '',
                toDate: weeksOptions[weeksOptions.length - 1]?.value?.toString() || '',
                unitTypeLevel: changeTabs.key
            });

            downloadFile(res, 'StaffGradeLevelReport.xlsx');
            showNotification(true, 'Export report successfully');
        } catch (error) {
            const message = 'Failed to download report';
            showNotification(false, message);
        } finally {
            setLoadingReport(false);
        }
    };

    const watchDate = Form.useWatch('dateRange', filterForm);

    useEffect(() => {
        if (watchDate) {
            const { fromDate, toDate } = watchDate;
            const startWeek = fromDate.startOf('isoWeek').isoWeek();
            const startYear = fromDate.startOf('isoWeek').year();

            const newOptions = getWeekOptions(startWeek, startYear, fromDate, toDate);

            const week = filterForm.getFieldValue('week');

            if (newOptions.findIndex(option => option.value === week) < 0) {
                const value = newOptions[0]?.value;
                filterForm.setFieldValue('week', value);

                const weekArr = value.split('-');
                const { fromDate, toDate } = getDateRangeFromWeek(Number(weekArr[1]), Number(weekArr[0]));
                const newSearchPrams = { fromDate, toDate, year: weekArr[1], week: weekArr[0], unitTypeLevel: '3' };
                setFilterParams(newSearchPrams);
            }

            setWeeksOptions(newOptions);
        }
    }, [watchDate, filterForm]);

    useEffect(() => {
        setDefaultFormValue(filterForm);
    }, [filterForm]);

    return (
        <DetailContent>
            <BaseBreadcrumb dataItem={breadcrumb} />
            <ReportFilter
                pageTitle={pageTitle}
                moreButtons={buttons}
                loading={loadingFilter}
                data={filterData}
                filterForm={filterForm}
                onResetFilter={onResetFilter}
                onFilter={onFilter}
            />
            <Tab items={tabs} onChangeTabs={onChangeTabs} />
        </DetailContent>
    );
};

export default StaffGradeIndexReportPage;
