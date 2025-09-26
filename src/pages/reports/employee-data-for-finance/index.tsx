import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import TreeSelect from '@/components/common/form/tree-select';
import ReportFilter from '@/components/common/report-filter';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import pathnames from '@/pathnames';
import reportService from '@/services/reports/report';
import { IFilterData } from '@/types/filter';
import { IEmployeeUnit } from '@/types/hr-management/employee-management';
import { IEmployeeDataForFinance, IFormValues } from '@/types/reports/employee-data-for-finance';
import { convertToSimpleText, debounce, downloadFile, formatDataTableFromOne, remapUnits } from '@/utils/common';
import { ORG_UNITS, TIME_FORMAT } from '@/utils/constants';
import useNotify from '@/utils/hook/useNotify';
import { createSorter } from '@/utils/table';
import { SearchOutlined } from '@ant-design/icons';
import { ButtonProps, DatePicker, Form, Input, TableColumnType } from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import dayjs, { Dayjs } from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import './index.scss';
import employeeDataForFinanceReportServices from '@/services/reports/employee-data-for-finance-report';
import usePermissions from '@/utils/hook/usePermissions';
import useLoading from '@/utils/hook/useLoading';

const breadcrumb: BreadcrumbItemType[] = [
    { title: pathnames.reports.main.name },
    {
        title: pathnames.reports.employeeDataForFinanceReport.main.name,
        path: pathnames.reports.employeeDataForFinanceReport.main.path
    }
];

const EmployeeDataForFinancePage = () => {
    const [filterForm] = Form.useForm();
    const { showNotification } = useNotify();
    const currentDate = useMemo(() => dayjs(dayjs().format(TIME_FORMAT.US_DATE)), []);
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();
    const { havePermission } = usePermissions('EmployeeDataForFinanceList', 'EmployeeDataForFinance');

    const [units, setUnits] = useState<IEmployeeUnit[]>([]);
    const [dataReport, setDataReport] = useState<IEmployeeDataForFinance[]>([]);
    const [searchInput, setSearchInput] = useState('');
    const [isLoadingFilter, setIsLoadingFilter] = useState(true);
    const [isLoadingExport, setIsLoadingExport] = useState(false);

    const handleExportReport = async () => {
        setIsLoadingExport(true);
        try {
            const paramsExport = filterForm.getFieldsValue();
            const params = {
                ...paramsExport,
                date: paramsExport.date.format(TIME_FORMAT.DATE)
            };

            const response = await employeeDataForFinanceReportServices.exportEmployeeDataForFinanceReport(params);
            downloadFile(response, 'EmployeeDataForFinanceReport.xlsx');
            showNotification(true, 'Export successful');
        } catch (error) {
            showNotification(false, 'Export failed. Please try again later');
        } finally {
            setIsLoadingExport(false);
        }
    };

    const buttons: ButtonProps[] = havePermission('Export') && [{ children: 'Export', onClick: handleExportReport, loading: isLoadingExport }];

    const onResetFilter = () => {
        filterForm.setFieldValue('selectedDate', dayjs());
        filterForm.setFieldsValue({ unit: [] });
        onFilterFormSubmit({ date: currentDate, unitIds: undefined });
    };

    const filterData: IFilterData[] = [
        {
            key: 'date',
            label: 'Select Date',
            forColumns: [],
            show: true,
            initialValue: currentDate,
            control: <DatePicker allowClear={false} format={TIME_FORMAT.US_DATE} />
        },
        {
            key: 'unitIds',
            label: 'Select Unit',
            forColumns: ['buName', 'dcName', 'projectName'],
            alwaysShow: true,
            control: (
                <TreeSelect
                    multiple
                    treeCheckable={false}
                    showSelectAll={false}
                    treeData={remapUnits(units)}
                    placeholder="Select units options"
                    searchPlaceholder="Search Unit"
                />
            )
        }
    ];

    const columns: TableColumnType<IEmployeeDataForFinance>[] = [
        {
            dataIndex: 'key',
            key: 'key',
            title: 'ID',
            width: 50,
            align: 'center',
            sorter: createSorter('key', 'number'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'badgeId',
            key: 'badgeId',
            title: 'Badge ID',
            width: 120,
            align: 'center',
            sorter: createSorter('badgeId'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'fullName',
            key: 'fullName',
            title: 'Full Name',
            width: 200,
            sorter: createSorter('fullName'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'workEmail',
            key: 'workEmail',
            title: 'Email',
            width: 200,
            sorter: createSorter('workEmail'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'dgName',
            key: 'dgName',
            title: ORG_UNITS.DG,
            width: 200,
            sorter: createSorter('dgName'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'dcName',
            key: 'dcName',
            title: ORG_UNITS.DC,
            width: 150,
            sorter: createSorter('dcName'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'projectName',
            key: 'projectName',
            title: ORG_UNITS.Project,
            width: 150,
            sorter: createSorter('projectName'),
            render: item => renderWithFallback(item)
        }
    ];

    const rowClassName = (row: IEmployeeDataForFinance, index: number) =>
        row.statusName?.toLocaleLowerCase() === 'resigned' ? 'table-row-resigned' : index % 2 === 0 ? 'table-row-light' : 'table-row-dark';

    const handleSearchTable = (dataList: IEmployeeDataForFinance[]) => {
        const normalizedSearchInput = convertToSimpleText(searchInput.toLowerCase().trim());

        return dataList.filter(item => {
            const normalizedFullName = convertToSimpleText(item.fullName.toLowerCase());
            const normalizedWorkEmail = convertToSimpleText(item.workEmail.toLowerCase());
            const normalizedProjectName = convertToSimpleText(item.projectName.toLowerCase());
            const normalizedStatusName = item.statusName ? convertToSimpleText(item.statusName.toLowerCase()) : '';

            return (
                normalizedFullName.includes(normalizedSearchInput) ||
                normalizedWorkEmail.includes(normalizedSearchInput) ||
                normalizedProjectName.includes(normalizedSearchInput) ||
                (normalizedStatusName === 'resigned' && normalizedSearchInput === 'resigned')
            );
        });
    };

    const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.trim();
        setSearchInput(value);
    };

    const debouncedHandleSearch = debounce(onChangeInput, 500);

    const renderTitleFilter = (
        <div className="report-filter__title">
            <h3>{pathnames.reports.employeeDataForFinanceReport.main.name}</h3>
            <Input
                className="report-filter__title__search"
                addonBefore={<SearchOutlined />}
                placeholder="Search by Full Name, Email, Project, Resigned,..."
                onChange={debouncedHandleSearch}
            />
        </div>
    );

    const onFilterFormSubmit = async (values: IFormValues) => {
        turnOnLoading();
        try {
            const unitIds = values.unitIds?.map(Number);
            const response = await employeeDataForFinanceReportServices.updateUnitSelectedFinance(unitIds ?? []);
            const { succeeded } = response;
            if (succeeded) {
                fetchData(values.date);
            }
        } catch (error) {
            showNotification(false, 'Failed to submit data');
        } finally {
            turnOffLoading();
        }
    };

    const fetchData = useCallback(
        async (date: Dayjs) => {
            turnOnLoading();
            try {
                const response = await employeeDataForFinanceReportServices.getReportList({ date: date.format(TIME_FORMAT.DATE) });
                const { data, succeeded } = response;

                if (succeeded) {
                    setDataReport(formatDataTableFromOne(data));
                }
            } catch (error) {
                showNotification(false, 'Failed to fetch data');
            } finally {
                turnOffLoading();
            }
        },
        [showNotification, turnOnLoading, turnOffLoading]
    );

    useEffect(() => {
        const fetchFilterData = async () => {
            setIsLoadingFilter(true);
            try {
                const res = await reportService.getAllIndexes();
                const { data, succeeded } = res;
                if (succeeded) {
                    setUnits(data?.units || []);
                }
            } catch (error) {
                showNotification(false, 'Failed to fetch filter data');
            } finally {
                setIsLoadingFilter(false);
            }
        };

        fetchFilterData();
    }, [filterForm, showNotification]);

    useEffect(() => {
        const fetchUnitsSelected = async () => {
            turnOnLoading();
            try {
                const responseUnits = await employeeDataForFinanceReportServices.getUnitSelectedFinance();
                const { data: units, succeeded } = responseUnits;
                if (succeeded) {
                    const values = units?.map(unit => unit.unitId.toString());
                    filterForm.setFieldValue('unitIds', values);
                    fetchData(currentDate);
                }
            } catch (error) {
                showNotification(false, 'Failed to fetch units selected for employee data for finance report');
            } finally {
                turnOffLoading();
            }
        };

        fetchUnitsSelected();
    }, [fetchData, filterForm, currentDate, showNotification, turnOnLoading, turnOffLoading]);

    return (
        <DetailContent>
            <div className="employee-data-for-finance">
                <BaseBreadcrumb dataItem={breadcrumb} />
                <ReportFilter
                    pageTitle={renderTitleFilter}
                    moreButtons={buttons}
                    loading={isLoadingFilter}
                    data={filterData}
                    filterForm={filterForm}
                    onResetFilter={onResetFilter}
                    onFilter={onFilterFormSubmit}
                    showFilter={true}
                />
                <div className="employee-data-for-finance__note">
                    <span>Employee Total: {dataReport.length}</span>
                    <span>Resigned: {dataReport.filter(item => item.statusName?.toLocaleLowerCase() === 'resigned').length}</span>
                </div>
                <BaseTable
                    dataSource={handleSearchTable(dataReport)}
                    columns={columns}
                    loading={isLoading}
                    className="employee-data-for-finance__table"
                    bordered
                    rowClassName={rowClassName}
                />
            </div>
        </DetailContent>
    );
};

export default EmployeeDataForFinancePage;
