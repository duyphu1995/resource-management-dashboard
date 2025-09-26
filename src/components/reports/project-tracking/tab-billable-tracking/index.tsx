import DetailInfo from '@/components/common/detail-management/detail-info';
import DatePicker from '@/components/common/form/date-picker';
import BaseSelect from '@/components/common/form/select';
import ReportFilter from '@/components/common/report-filter';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import TableNote, { ITableNoteData } from '@/components/common/table/table-note';
import projectTrackingService from '@/services/reports/project-tracking';
import reportService from '@/services/reports/report';
import { IFilterData } from '@/types/filter';
import { IBillableTrackingFilter, IBillableTrackingItem } from '@/types/reports/project-tracking';
import { downloadFile, formatDataTableFromOne, formatTimeMonthDayYear } from '@/utils/common';
import { ORG_UNITS } from '@/utils/constants';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';
import { createSorter } from '@/utils/table';
import { ButtonProps, Checkbox, Flex, Form } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import { ColumnType } from 'antd/es/table';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { useCallback, useEffect, useState } from 'react';

dayjs.extend(isoWeek);

const BillableTracking = () => {
    const [filterForm] = Form.useForm();
    const { showNotification } = useNotify();
    const today = dayjs();
    const currentYear = today.year();
    const weekNumber = today.isoWeek();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();
    const { havePermission } = usePermissions('ProjectTrackingList', 'ProjectTracking');

    const [isExportLoading, setIsExportLoading] = useState(false);
    const [newProjectDataTable, setNewProjectDataTable] = useState<any[]>([]);
    const [workingProjectDataTable, setWorkingProjectDataTable] = useState<any[]>([]);
    const [closedProjectDataTable, setClosedProjectDataTable] = useState<any[]>([]);
    const [loadingFilter, setLoadingFilter] = useState<boolean>(false);
    const [defaultFilterData, setDefaultFilterData] = useState<IBillableTrackingFilter>({
        week: String(weekNumber),
        year: dayjs(currentYear),
        isShowAll: false
    });
    const [weekOptions, setWeekOptions] = useState<DefaultOptionType[]>([]);

    const onResetFilter = () => {
        setLoadingFilter(true);
        fetchData(defaultFilterData);
        filterForm.setFieldsValue(defaultFilterData);
        setLoadingFilter(false);
    };

    const onExport = async () => {
        try {
            setIsExportLoading(true);
            const payload = {
                week: filterForm.getFieldValue('week'),
                year: filterForm.getFieldValue('year').year(),
                isShowAll: filterForm.getFieldValue('isShowAll')
            };

            const res = await projectTrackingService.exportBillableTracking(payload);
            downloadFile(res, 'Billable Tracking Report.xlsx');
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

    const filterDataColumn: IFilterData[] = [
        {
            key: 'week',
            label: 'Week',
            forColumns: [],
            alwaysShow: true,
            control: <BaseSelect size="small" options={weekOptions} placeholder="Select week" searchPlaceholder="Search week" filterSort={() => 0} />
        },
        {
            key: 'year',
            label: 'Year',
            forColumns: [],
            alwaysShow: true,
            control: <DatePicker format="YYYY" size="small" picker="year" />
        },
        {
            key: 'isShowAll',
            label: 'Show All',
            forColumns: [],
            alwaysShow: true,
            control: <Checkbox />,
            valuePropName: 'checked'
        }
    ];

    const getWeeksInYear = (year: number | string) => {
        const lastDayOfYear = dayjs(`${year}-12-31`);
        const lastWeek = lastDayOfYear.isoWeek();

        // Special case: The year starts in the last week of the previous year
        if (lastWeek === 1) {
            return lastDayOfYear.subtract(1, 'week').isoWeek() + 1;
        }

        return lastWeek;
    };

    const yearFilterForm = Form.useWatch('year', filterForm);
    useEffect(() => {
        const weeksInYear = getWeeksInYear(yearFilterForm);
        const weekOptions = [];
        for (let week = 1; week <= weeksInYear; week++) {
            weekOptions.push({
                label: `Week ${week}`,
                value: String(week)
            });
        }

        const isExistWeek = weekOptions.find(item => item.value === filterForm.getFieldValue('week'));
        if (!isExistWeek) {
            filterForm.setFieldValue('week', String(weekOptions[weekOptions.length - 1].value));
        }

        setWeekOptions(weekOptions);
    }, [yearFilterForm, filterForm]);

    const [currentPageNewProject, setCurrentPageNewProject] = useState(1);
    const [pageSizeNewProject, setPageSizeNewProject] = useState(10);
    const newProjectColumns: ColumnType<IBillableTrackingItem>[] = [
        {
            key: 'key',
            title: '#',
            width: 100,
            render: (_, __, index) => (currentPageNewProject - 1) * pageSizeNewProject + index + 1
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
            dataIndex: 'billableNextWeek',
            key: 'billableNextWeek',
            title: `Billable - W#${filterForm.getFieldValue('week')}`,
            width: 100,
            sorter: createSorter('billableNextWeek', 'number'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'createdDate',
            key: 'createdDate',
            title: 'Created Date',
            width: 139,
            sorter: createSorter('createdDate', 'date'),
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        }
    ];

    const [currentPageWorking, setCurrentPageWorking] = useState(1);
    const [pageSizeWorking, setPageSizeWorking] = useState(10);
    const workingProjectColumns: ColumnType<IBillableTrackingItem>[] = [
        {
            key: 'key',
            title: '#',
            width: 100,
            render: (_, __, index) => (currentPageWorking - 1) * pageSizeWorking + index + 1
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
            dataIndex: 'billableNextWeek',
            key: 'billableNextWeek',
            title: `Billable - W#${filterForm.getFieldValue('week')}-${filterForm.getFieldValue('year')?.year()}`,
            width: 200,
            sorter: createSorter('billableNextWeek', 'number'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'billableLastWeek',
            key: 'billableLastWeek',
            title: `Billable - W#${filterForm.getFieldValue('week') - 1}-${filterForm.getFieldValue('year')?.year()}`,
            width: 200,
            sorter: createSorter('billableLastWeek', 'number'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'billableChange',
            key: 'billableChange',
            title: 'Change',
            width: 150,
            sorter: createSorter('billableChange', 'number'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'createdDate',
            key: 'createdDate',
            title: 'Note',
            width: 200,
            sorter: createSorter('createdDate', 'date'),
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        }
    ];

    const [currentPageCloseProject, setCurrentPageCloseProject] = useState(1);
    const [pageSizeCloseProject, setPageSizeCloseProject] = useState(10);
    const closedProjectColumns: ColumnType<IBillableTrackingItem>[] = [
        {
            key: 'key',
            title: '#',
            width: 100,
            render: (_, __, index) => (currentPageCloseProject - 1) * pageSizeCloseProject + index + 1
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
            dataIndex: 'billableLatest',
            key: 'billableLatest',
            title: 'Lasted Billable',
            width: 150,
            sorter: createSorter('billableLatest', 'number'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'createdDate',
            key: 'createdDate',
            title: 'Closed Date',
            width: 200,
            sorter: createSorter('createdDate', 'date'),
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'billableLatestFrom',
            key: 'billableLatestFrom',
            title: 'Latest Billable From',
            width: 200,
            sorter: createSorter('billableLatestFrom'),
            render: item => renderWithFallback(item)
        }
    ];

    const fetchDefaultFilter = async () => {
        const res = await reportService.getMostRecentHaveData();
        const { data } = res;
        return data?.find(item => item.reportPage === 'HeadCountBaseLineReport');
    };

    const fetchData = useCallback(
        async (payload: IBillableTrackingFilter) => {
            turnOnLoading();
            const res = await projectTrackingService.getBillableTrackingList({ ...payload, year: payload.year.year() });
            const { data, succeeded } = res;

            if (data && succeeded) {
                setNewProjectDataTable(data.newProjectBillableTracking);
                setWorkingProjectDataTable(data.workingProjectBillableTracking);
                setClosedProjectDataTable(data.closedProjectBillableTracking);
            }
            turnOffLoading();
        },
        [turnOffLoading, turnOnLoading]
    );

    useEffect(() => {
        const updateFilterData = async () => {
            const defaultFilter = await fetchDefaultFilter();
            let defaultFilterCustom = { ...defaultFilterData };

            if (defaultFilter) {
                defaultFilterCustom = {
                    isShowAll: false,
                    week: String(defaultFilter.week),
                    year: dayjs(String(defaultFilter.year))
                };
            }

            fetchData(defaultFilterCustom);
            setDefaultFilterData(defaultFilterCustom);
            filterForm.setFieldsValue(defaultFilterCustom);
        };

        updateFilterData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const rowClassNameCustom = (record: IBillableTrackingItem, index: number) => {
        const { color } = record;

        const alternatingColor = index % 2 === 0 ? 'table-row-light' : 'table-row-dark';
        const specificClass = color ? `custom-color-${color.replace('#', '')}` : '';

        return specificClass || alternatingColor;
    };

    const dataTableNote: ITableNoteData[] = [
        {
            color: '#00b0f0',
            title: 'New project'
        },
        {
            color: '#00b050',
            title: 'Billable increased'
        },
        {
            color: '#ffff00',
            title: 'Billable decreased'
        }
    ];

    return (
        <div>
            <ReportFilter
                pageTitle="Billable Tracking"
                loading={loadingFilter}
                data={filterDataColumn}
                filterForm={filterForm}
                moreButtons={moreButtons}
                onFilter={fetchData}
                onResetFilter={onResetFilter}
            />
            <DetailInfo>
                <Flex vertical gap={24}>
                    <div className="title-header-table">
                        <h3 className="title">New project</h3>
                        <BaseTable
                            dataSource={formatDataTableFromOne(newProjectDataTable)}
                            columns={newProjectColumns}
                            loading={isLoading}
                            paginationTable={{
                                currentPage: currentPageNewProject,
                                pageSize: pageSizeNewProject,
                                onChange: (page, size) => {
                                    setCurrentPageNewProject(page);
                                    setPageSizeNewProject(size);
                                }
                            }}
                        />
                    </div>
                    <div className="title-header-table">
                        <h3 className="title">Working Project</h3>
                        <TableNote data={dataTableNote} />
                        <BaseTable
                            dataSource={formatDataTableFromOne(workingProjectDataTable)}
                            columns={workingProjectColumns}
                            rowClassName={rowClassNameCustom}
                            loading={isLoading}
                            bordered
                            onRow={record => ({
                                style: {
                                    backgroundColor: record.color ? record.color : 'default'
                                }
                            })}
                            paginationTable={{
                                currentPage: currentPageWorking,
                                pageSize: pageSizeWorking,
                                onChange: (page, size) => {
                                    setCurrentPageWorking(page);
                                    setPageSizeWorking(size);
                                }
                            }}
                        />
                    </div>
                    <div className="title-header-table">
                        <h3 className="title">Closed Project</h3>
                        <BaseTable
                            dataSource={formatDataTableFromOne(closedProjectDataTable)}
                            columns={closedProjectColumns}
                            loading={isLoading}
                            paginationTable={{
                                currentPage: currentPageCloseProject,
                                pageSize: pageSizeCloseProject,
                                onChange: (page, size) => {
                                    setCurrentPageCloseProject(page);
                                    setPageSizeCloseProject(size);
                                }
                            }}
                        />
                    </div>
                </Flex>
            </DetailInfo>
        </div>
    );
};

export default BillableTracking;
