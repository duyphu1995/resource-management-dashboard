import TreeSelect from '@/components/common/form/tree-select';
import FilterDateRange from '@/components/common/list-management/filter/filter-date-range';
import ReportFilter from '@/components/common/report-filter';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import UnitService from '@/services/group-management/unit';
import projectTrackingService from '@/services/reports/project-tracking';
import { IFilterData } from '@/types/filter';
import { IEmployeeUnit } from '@/types/hr-management/employee-management';
import { IProjectTracking, IProjectTrackingList } from '@/types/reports/project-tracking';
import { downloadFile, formatDataTableFromOne, formatTimeMonthDayYear, remapUnits } from '@/utils/common';
import { ORG_UNITS, TIME_FORMAT } from '@/utils/constants';
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';
import { createSorter } from '@/utils/table';
import { ButtonProps, Form } from 'antd';
import { ColumnType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

const ProjectTracking = () => {
    const [filterForm] = Form.useForm();
    const { showNotification } = useNotify();
    const { havePermission } = usePermissions('ProjectTrackingList', 'ProjectTracking');

    const today = dayjs().format(TIME_FORMAT.DATE);

    const [isExportLoading, setIsExportLoading] = useState(false);
    const [isLoadingDataTable, setIsLoadingDataTable] = useState(true);
    const [dataTable, setDataTable] = useState<any[]>([]);
    const [loadingFilter, setLoadingFilter] = useState<boolean>(false);
    const [filterData, setFilterData] = useState<IProjectTracking>({
        fromDate: today
    });
    const [units, setUnits] = useState<IEmployeeUnit[]>([]);

    const onFilter = async (value: IProjectTracking) => {
        setFilterData(value);
    };

    const onResetFilter = () => {
        setLoadingFilter(true);
        setFilterData({ fromDate: '1990-01-01' });
        filterForm.setFieldsValue({
            unitIds: ['1'],
            updateDate: { fromDate: dayjs() }
        });
        setLoadingFilter(false);
    };

    const filterDataColumn: IFilterData[] = [
        {
            key: 'unitIds',
            label: 'Business Unit',
            forColumns: [],
            alwaysShow: true,
            control: (
                <TreeSelect
                    multiple
                    size="small"
                    treeData={remapUnits(units)}
                    placeholder="Select business unit"
                    searchPlaceholder="Search business unit"
                />
            )
        },
        {
            key: 'updateDate',
            label: 'Update Date',
            forColumns: [],
            alwaysShow: true,
            colSpan: 12,
            control: <FilterDateRange fromName="fromDate" toName="toDate" />
        }
    ];

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const columns: ColumnType<IProjectTrackingList>[] = [
        {
            key: 'key',
            title: '#',
            width: 50,
            fixed: 'left',
            render: (_, __, index) => (currentPage - 1) * pageSize + index + 1
        },
        {
            dataIndex: 'dgName',
            key: 'dgName',
            title: ORG_UNITS.DG,
            width: 210,
            sorter: createSorter('dgName'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'dcName',
            key: 'dcName',
            title: ORG_UNITS.DC,
            width: 137,
            sorter: createSorter('dcName'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'projectName',
            key: 'projectName',
            title: ORG_UNITS.Project,
            width: 139,
            sorter: createSorter('projectName'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'createdOn',
            key: 'createdOn',
            title: 'Updated Date',
            width: 139,
            sorter: createSorter('createdOn', 'date'),
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'author',
            key: 'author',
            title: 'Author',
            width: 300,
            sorter: createSorter('author'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'action',
            key: 'action',
            title: 'Action',
            width: 300,
            sorter: createSorter('action'),
            render: item => renderWithFallback(item)
        }
    ];

    const onExport = async () => {
        try {
            setIsExportLoading(true);
            const res = await projectTrackingService.exportProjectTracking(filterData);
            downloadFile(res, 'Project Tracking Report.xlsx');
            showNotification(true, 'Export report successfully');
        } catch {
            showNotification(false, 'Export report failed');
        } finally {
            setIsExportLoading(false);
        }
    };

    const moreButtons: ButtonProps[] = havePermission('Export') && [
        { children: 'Export', loading: isExportLoading, onClick: onExport, type: 'primary' }
    ];

    // Fetch filter data
    useEffect(() => {
        const fetchFilterData = async () => {
            setLoadingFilter(true);
            try {
                const res = await UnitService.getByManaged('ProjectTrackingReport');
                const { data, succeeded } = res;

                if (succeeded) {
                    setUnits(data || []);
                    filterForm.setFieldsValue({
                        unitIds: data?.map((item: any) => item?.unitId.toString()),
                        updateDate: { fromDate: dayjs() }
                    });
                }
            } catch (error) {
                showNotification(false, 'Failed to fetch the unit list');
            } finally {
                setLoadingFilter(false);
            }
        };

        fetchFilterData();
    }, [filterForm, showNotification]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoadingDataTable(true);
            const res = await projectTrackingService.getProjectTrackingList(filterData);
            const { data = [] } = res;

            setDataTable(data);
            setIsLoadingDataTable(false);
        };

        fetchData();
    }, [filterData]);

    return (
        <div>
            <ReportFilter
                pageTitle="Project Tracking"
                loading={loadingFilter}
                data={filterDataColumn}
                filterForm={filterForm}
                moreButtons={moreButtons}
                onFilter={onFilter}
                onResetFilter={onResetFilter}
            />
            <BaseTable
                bordered
                dataSource={formatDataTableFromOne(dataTable)}
                columns={columns}
                loading={isLoadingDataTable}
                paginationTable={{
                    currentPage: currentPage,
                    pageSize: pageSize,
                    onChange: (page, size) => {
                        setCurrentPage(page);
                        setPageSize(size);
                    }
                }}
            />
        </div>
    );
};

export default ProjectTracking;
