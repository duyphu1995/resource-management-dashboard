import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import BaseSelect from '@/components/common/form/select';
import FilterDateRange from '@/components/common/list-management/filter/filter-date-range';
import ReportFilter from '@/components/common/report-filter';
import SubTab from '@/components/common/tab/sub-tab';
import TabDCAndDG from '@/components/reports/headcount-baseline-report/tab-dc-dg';
import TabProgram from '@/components/reports/headcount-baseline-report/tab-program';
import TabProject from '@/components/reports/headcount-baseline-report/tab-project';
import pathnames from '@/pathnames';
import headcountBaselineService from '@/services/reports/headcount-baseline-report';
import reportService from '@/services/reports/report';
import { IFilterData } from '@/types/filter';
import { IBaselineHeadcount } from '@/types/reports/headcount-baseline-report';
import { downloadFile, getWeekOptions } from '@/utils/common';
import { ORG_UNITS } from '@/utils/constants';
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';
import { ButtonProps, Form, FormInstance } from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { DefaultOptionType } from 'antd/es/select';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import isLeapYear from 'dayjs/plugin/isLeapYear'; // dependent on isLeapYear plugin
import isoWeeksInYear from 'dayjs/plugin/isoWeeksInYear';
import updateLocale from 'dayjs/plugin/updateLocale';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import weekYear from 'dayjs/plugin/weekYear';
import weekday from 'dayjs/plugin/weekday';
import { useEffect, useState } from 'react';

dayjs.extend(weekOfYear);
dayjs.extend(isLeapYear);
dayjs.extend(weekYear);
dayjs.extend(weekday);
dayjs.extend(updateLocale);
dayjs.extend(isoWeeksInYear);
dayjs.updateLocale('en', {
    weekStart: 1
});

export interface IReportTabProps {
    searchParams: IBaselineHeadcount;
    apply: boolean;
}

const HeadcountBaselineReportPage = () => {
    const [filterForm] = Form.useForm();
    const { showNotification } = useNotify();
    const { section } = usePermissions('HeadcountBaseline', 'HeadCountBaselineReport');

    const [keyActive, setKeyActive] = useState<string>(
        ['HeadcountBaselineDCBU', 'HeadcountBaselinePrograms', 'HeadcountBaselineProjects'].find(item =>
            section?.children?.some((child: any) => child.name === item)
        ) ?? ''
    );
    const [weekOptions, setWeekOptions] = useState<DefaultOptionType[]>([]);
    const [loadingFilter, setLoadingFilter] = useState(false);
    const [searchParams, setSearchParams] = useState<IBaselineHeadcount>();
    const [isExportLoading, setIsExportLoading] = useState(false);
    const [apply, setApply] = useState(true);

    const breadcrumb: BreadcrumbItemType[] = [{ title: pathnames.reports.main.name }, { title: pathnames.reports.headcountBaselineReport.main.name }];
    const pageTitle = pathnames.reports.headcountBaselineReport.main.name;

    const getExportFileName = (key: string) => {
        const fileNames = {
            HeadcountBaselineProjects: 'Headcount Project Report.xlsx',
            HeadcountBaselinePrograms: 'Headcount Program Report.xlsx',
            HeadcountBaselineDCBU: 'Headcount Summary Report.xlsx'
        };
        return fileNames[key as 'HeadcountBaselineProjects' | 'HeadcountBaselinePrograms' | 'HeadcountBaselineDCBU'];
    };

    const onExport = async () => {
        try {
            setIsExportLoading(true);
            const res = await headcountBaselineService.export(
                {
                    from: weekOptions[0].value?.toString() || '',
                    to: weekOptions[weekOptions.length - 1]?.value?.toString() || '',
                    unitTypeLevel: (keyActive === 'HeadcountBaselineProjects' && '1') || (keyActive === 'HeadcountBaselinePrograms' && '2') || '3'
                },
                keyActive
            );

            const { succeeded, message } = res;
            if (succeeded === false) {
                showNotification(succeeded, message);
                return;
            }

            downloadFile(res, getExportFileName(keyActive));
            showNotification(true, 'Export report successfully');
        } catch {
            showNotification(false, 'Export report failed');
        } finally {
            setIsExportLoading(false);
        }
    };

    const buttons: ButtonProps[] = [
        usePermissions(keyActive, 'HeadcountBaseline')?.havePermission('Export') && {
            children: 'Export',
            loading: isExportLoading,
            onClick: onExport
        }
    ].filter(Boolean);

    // Handle set filter
    const onResetFilter = () => setDefaultFormValue(filterForm);

    // Handle filter
    const onFilter = (value: any) => {
        const { week } = value;
        const arrWeek = week.split('-');
        const newSearchPrams = { year: arrWeek[1], week: arrWeek[0], tab: keyActive };

        setSearchParams(newSearchPrams);
        setApply(true);
    };

    const filterData: IFilterData[] = [
        {
            key: 'date',
            label: 'Date Range filter',
            forColumns: [],
            colSpan: 12,
            show: true,
            control: <FilterDateRange fromName="fromDate" toName="toDate" allowClear={false} onChange={() => setApply(false)} />
        },
        {
            key: 'week',
            label: 'Week',
            forColumns: [],
            show: true,
            control: <BaseSelect size="small" options={weekOptions} allowClear={false} filterSort={() => 0} />
        }
    ];

    // Declare default data
    const setDefaultFormValue = (filterForm: FormInstance) => {
        setLoadingFilter(true);
        const fromDate = dayjs().startOf('year');
        const toDate = dayjs();

        filterForm.setFieldValue('date', { fromDate, toDate });
        setLoadingFilter(false);
    };

    const tabs = [
        {
            key: 'HeadcountBaselineDCBU',
            label: `Headcount Baseline By ${ORG_UNITS.DC}/${ORG_UNITS.DG}`,
            children: searchParams && <TabDCAndDG searchParams={searchParams} apply={apply} />
        },
        {
            key: 'HeadcountBaselinePrograms',
            label: `Headcount Baseline By ${ORG_UNITS.Programs}`,
            children: searchParams && <TabProgram searchParams={searchParams} apply={apply} />
        },
        {
            key: 'HeadcountBaselineProjects',
            label: `Headcount Baseline By ${ORG_UNITS.Projects}`,
            children: searchParams && <TabProject searchParams={searchParams} apply={apply} />
        }
    ].filter(item => section?.children?.some((child: any) => child.name === item.key));

    const onChangeTab = (key: string) => {
        setKeyActive(key);
        searchParams && setSearchParams({ ...searchParams, tab: key });
    };

    // Watch date
    const watchDate = Form.useWatch('date', filterForm);

    const fetchDefaultFilter = async () => {
        const res = await reportService.getMostRecentHaveData();
        const { data } = res;
        return data?.find(item => item.reportPage === 'HeadCountBaseLineReport');
    };

    // Update week options when date was changed
    useEffect(() => {
        if (!watchDate) return;

        const updateWeekOptions = async () => {
            const { fromDate: startDate, toDate: endDate } = watchDate;
            const startWeek = startDate.startOf('isoWeek').isoWeek();
            const startYear = startDate.startOf('isoWeek').year();

            const newOptions = getWeekOptions(startWeek, startYear, startDate, endDate);

            // If the week value does not exist in newOptions then the value is set as the current week of date
            const week = filterForm.getFieldValue('week');
            if (!newOptions.some(option => option.value === week)) {
                const value = newOptions[newOptions.length - 1]?.value;
                let valueWeek = value;

                const arrWeek = value.split('-');
                let newSearchPrams = { year: arrWeek[1], week: arrWeek[0], tab: keyActive };

                if (!week) {
                    const defaultFilter = await fetchDefaultFilter();
                    if (defaultFilter) {
                        valueWeek = `${defaultFilter.week}-${defaultFilter.year}`;
                        newSearchPrams = {
                            ...newSearchPrams,
                            ...defaultFilter
                        };
                    }
                }

                filterForm.setFieldsValue({ week: valueWeek });
                setSearchParams(newSearchPrams);
            }

            // Update new options
            setWeekOptions(newOptions);
        };

        updateWeekOptions();
    }, [watchDate, filterForm, keyActive]);

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
            <SubTab items={tabs} onChangeTabs={onChangeTab} />
        </DetailContent>
    );
};

export default HeadcountBaselineReportPage;
