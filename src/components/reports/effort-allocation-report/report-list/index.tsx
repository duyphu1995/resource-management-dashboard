import DetailContent from '@/components/common/detail-management/detail-content';
import BaseSelect from '@/components/common/form/select';
import ReportFilter from '@/components/common/report-filter';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import { IReportListGroup } from '@/components/group-management/right-content/tab-data/report-list';
import pathnames from '@/pathnames';
import { searchParamsActions } from '@/redux/search-params-slice';
import chartService from '@/services/group-management/org-chart';
import { IFilterData } from '@/types/filter';
import { IEffortAllocationReportList, IUnitReportProjectInfo } from '@/types/reports/effort-allocation';
import { downloadFile, formatDataTableFromOne, formatTimeMonthDayYear } from '@/utils/common';
import { ORG_UNITS } from '@/utils/constants';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import { ButtonProps, Flex, Form } from 'antd';
import { ColumnType } from 'antd/es/table';
import Title from 'antd/es/typography/Title';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useLocation, useParams } from 'react-router-dom';
import RenderRow from '../../employee-summary/common-employee-summary/util/render-row-in-table';
import usePermissions from '@/utils/hook/usePermissions';

const EffortAllocationReportList = () => {
    const { showNotification } = useNotify();
    const [filterForm] = Form.useForm();
    const { id = '' } = useParams();
    const dispatch = useDispatch();
    const location = useLocation();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();
    const { havePermission } = usePermissions('EmployeeManagementList', 'EmployeeManagement');

    const queryParams = new URLSearchParams(location.search);
    const unitName = queryParams.get('unitName');
    const filterBy = queryParams.get('filterBy') || undefined;
    const excludeContractor = queryParams.get('excludeContractor') === 'true';

    const [reportList, setReportList] = useState<IEffortAllocationReportList[]>([]);
    const [filterEffort, setFilterEffort] = useState<string>('0');
    const [isExportLoading, setIsExportLoading] = useState<boolean>(false);

    const employeeByGenderColumns: ColumnType<IReportListGroup>[] = [
        {
            dataIndex: 'key',
            key: 'key',
            title: 'No.',
            fixed: 'left',
            width: 60
        },
        {
            dataIndex: 'badgeId',
            key: 'badgeId',
            title: 'Badge ID',
            fixed: 'left',
            width: 80,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'fullName',
            title: 'Full Name',
            fixed: 'left',
            width: 300,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'genderName',
            title: 'Gender',
            width: 130,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'birthday',
            title: 'Birthday',
            width: 130,
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'permanentAddress',
            title: 'Permanent Address',
            width: 200,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'contactAddress',
            title: 'Contact Address',
            width: 200,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'universityName',
            title: 'University',
            width: 250,
            render: item => renderWithFallback(item, true, 30)
        },
        {
            dataIndex: 'graduatedYear',
            title: 'Graduated year',
            width: 130,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'positionName',
            title: 'Position',
            width: 200,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'joinDate',
            title: 'Join Date',
            width: 130,
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'workEmail',
            title: 'Email',
            width: 200,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'mainDCName',
            title: 'Internal Outsources',
            width: 180,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'totalExp',
            title: 'Total Exp. (Month)',
            width: 170,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'unitReportProjectInforDtos',
            title: ORG_UNITS.Project,
            width: 200,
            className: 'table-padding-0',
            render: (record: IReportListGroup[]) => <RenderRow rows={record} type="projectName" onRowChildren="div" boldRows="isMainProject" />
        },
        {
            dataIndex: 'unitReportProjectInforDtos',
            title: 'DC of Project',
            width: 170,
            className: 'table-padding-0',
            render: (record: IReportListGroup[]) => <RenderRow rows={record} type="dcName" onRowChildren="div" boldRows="isMainProject" />
        },
        {
            dataIndex: 'unitReportProjectInforDtos',
            title: 'Grade',
            width: 100,
            className: 'table-padding-0',
            render: (record: IReportListGroup[]) => <RenderRow rows={record} type="grade" onRowChildren="div" />
        },
        ...(filterBy === 'Redeployable'
            ? [
                  {
                      dataIndex: 'unitReportProjectInforDtos',
                      title: 'Manager',
                      width: 100,
                      className: 'table-padding-0',
                      render: (record: IUnitReportProjectInfo[]) => <RenderRow rows={record} type="projectManager" onRowChildren="div" />
                  },
                  {
                      dataIndex: 'unitReportProjectInforDtos',
                      title: 'Exp. Before TMA (Month)',
                      width: 200,
                      className: 'table-padding-0',
                      render: (record: IUnitReportProjectInfo[]) => <RenderRow rows={record} type="beforeWorkExp" onRowChildren="div" />
                  },
                  {
                      dataIndex: 'unitReportProjectInforDtos',
                      title: 'Exp. At TMA (Month)',
                      width: 200,
                      className: 'table-padding-0',
                      render: (record: IUnitReportProjectInfo[]) => <RenderRow rows={record} type="currentWorkExp" onRowChildren="div" />
                  }
              ]
            : [
                  {
                      dataIndex: 'unitReportProjectInforDtos',
                      title: 'Effort(%)',
                      width: 100,
                      className: 'table-padding-0',
                      render: (record: IReportListGroup[]) => <RenderRow rows={record} type="effort" onRowChildren="div" />
                  },
                  {
                      dataIndex: 'unitReportProjectInforDtos',
                      title: 'Type',
                      width: 100,
                      className: 'table-padding-0',
                      render: (record: IReportListGroup[]) => <RenderRow rows={record} type="billableStatus" onRowChildren="div" />
                  },
                  {
                      dataIndex: 'unitReportProjectInforDtos',
                      title: 'Billable',
                      width: 100,
                      className: 'table-padding-0',
                      render: (record: IReportListGroup[]) => <RenderRow rows={record} type="billable" onRowChildren="div" />
                  }
              ]),
        {
            dataIndex: 'unitReportProjectInforDtos',
            title: 'Note',
            width: 250,
            className: 'table-padding-0',
            render: (record: IReportListGroup[]) => <RenderRow rows={record} type="notes" onRowChildren="div" />
        }
    ];

    const optionEffort = [
        {
            label: 'All',
            value: '0'
        },
        {
            label: 'Equal 0%',
            value: '1'
        },
        {
            label: 'Greater than 0%',
            value: '2'
        }
    ];

    const filterDataColumn: IFilterData[] = [
        {
            key: 'effort',
            forColumns: [],
            label: 'Effort',
            alwaysShow: true,
            control: <BaseSelect options={optionEffort} placeholder="Select effort" allowClear={false} />,
            initialValue: '0'
        }
    ];

    const onExport = async () => {
        try {
            setIsExportLoading(true);
            const isEffort = filterEffort === '0' ? undefined : filterEffort === '1' ? false : true;
            const res = await chartService.exportReportGroup(
                {
                    unitId: id === 'all-units' ? undefined : id,
                    filterBy: filterBy === 'All' ? undefined : filterBy,
                    isEffort,
                    excludeContractor
                },
                'EffortLocationReport'
            );

            downloadFile(res, 'Report_List.xlsx');
            showNotification(true, 'Export report successful');
        } catch {
            showNotification(false, 'Export report failed');
        } finally {
            setIsExportLoading(false);
        }
    };

    const moreButtons: ButtonProps[] = [{ children: 'Export', loading: isExportLoading, onClick: onExport, type: 'primary' }];

    const filterData = useCallback(
        (data: IReportListGroup[]) =>
            data
                .map(item => ({
                    ...item,
                    unitReportProjectInforDtos: item.unitReportProjectInforDtos.filter(project => {
                        if (filterEffort === '1') return project.effort === 0;
                        if (filterEffort === '2') return project.effort > 0;
                        return true;
                    })
                }))
                .filter(item => item.unitReportProjectInforDtos.length > 0),
        [filterEffort]
    );

    const onFilter = (value: any) => {
        setFilterEffort(value.effort || '0');
    };

    const onResetFilter = () => {
        filterForm.setFieldsValue({ effort: '0' });
        setFilterEffort('0');
    };

    const filteredDataList = useMemo(() => filterData(reportList), [reportList, filterData]);

    useEffect(() => {
        const fetchData = async () => {
            turnOnLoading();
            try {
                const payload = {
                    id: id === 'all-units' ? undefined : id,
                    filterBy: filterBy === 'All' ? undefined : filterBy,
                    excludeContractor
                };

                const res = await chartService.openReportList(payload, 'EffortLocationReport');
                const { data } = res;

                setReportList(data || []);
            } catch (error) {
                showNotification(false, 'Error fetching get EmployeeByUnit list');
            } finally {
                turnOffLoading();
            }
        };

        fetchData();
    }, [id, filterBy, excludeContractor, showNotification, turnOnLoading, turnOffLoading]);

    return (
        <DetailContent rootClassName="layout-page-report-group-window-open">
            <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
                <Title level={3} style={{ margin: 0, textTransform: 'uppercase' }}>
                    REPORT LIST FOR{' '}
                    {(filterBy === 'NonBillable' && 'BACKUP EMPLOYEES') ||
                        (filterBy === 'Billable' && 'BILLABLE EMPLOYEES') ||
                        (filterBy === 'Redeployable' && 'Redeployable EMPLOYEES') ||
                        'ALL EMPLOYEES'}{' '}
                    {!excludeContractor ? 'AND CONTRACTOR' : ''} OF {unitName || 'TMA SOLUTIONS'}
                </Title>
                {filterBy === 'All' && havePermission('View') && (
                    <Link
                        to={pathnames.hrManagement.employeeManagement.main.path}
                        onClick={() => {
                            dispatch(searchParamsActions.resetAllSection('employeeManagement'));

                            const filterParams = {
                                unitIds: id === 'all-units' ? undefined : [id],
                                mainProjectValues: ['1'],
                                statusIds: ['4', '5', '6', '8', '10']
                            };
                            dispatch(
                                searchParamsActions.setFilterParamsRedux({
                                    employeeManagement: { filter: filterParams }
                                })
                            );
                        }}
                    >
                        View in HR's employee list
                    </Link>
                )}
            </Flex>
            <ReportFilter
                pageTitle={
                    <Flex vertical style={{ fontSize: 14, lineHeight: '120%', fontWeight: 400 }}>
                        <span>*Note:</span>
                        <span>- This list contains employees whose project is in {unitName}</span>
                        <span>
                            - The project in bold is <strong>main</strong> project
                        </span>
                        <span>
                            - The Internal Outsources column show the <strong>Main DC</strong> of outsourcing who come from other Project/ DC
                        </span>
                    </Flex>
                }
                filterForm={filterForm}
                loading={false}
                data={filterDataColumn}
                moreButtons={moreButtons}
                onResetFilter={onResetFilter}
                onFilter={onFilter}
                rootClassName="report-filter-group"
            />
            <BaseTable
                columns={employeeByGenderColumns}
                dataSource={formatDataTableFromOne(filteredDataList)}
                loading={isLoading}
                scroll={{ x: 'max-content', y: 700 }}
                bordered
                footer={() =>
                    `Total Effort: ${filteredDataList?.reduce((acc, cur) => acc + cur?.unitReportProjectInforDtos.reduce((acc2, cur2) => acc2 + cur2.effort, 0), 0)}`
                }
                rootClassName="table-report-window-open"
            />
        </DetailContent>
    );
};

export default EffortAllocationReportList;
