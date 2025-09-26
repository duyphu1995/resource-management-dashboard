import DetailContent from '@/components/common/detail-management/detail-content';
import BaseSelect from '@/components/common/form/select';
import ReportFilter from '@/components/common/report-filter';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import RenderRow from '@/components/reports/employee-summary/common-employee-summary/util/render-row-in-table';
import pathnames from '@/pathnames';
import { searchParamsActions } from '@/redux/search-params-slice';
import chartService from '@/services/group-management/org-chart';
import { IFilterData } from '@/types/filter';
import { IReportListForAll } from '@/types/reports/employee-summary';
import { downloadFile, formatDataTableFromOne, formatNumberWithDecimalPlaces, formatTimeMonthDayYear } from '@/utils/common';
import { ORG_UNITS } from '@/utils/constants';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';
import { ButtonProps, Flex, Form } from 'antd';
import { ColumnType } from 'antd/es/table';
import Title from 'antd/es/typography/Title';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useLocation, useParams } from 'react-router-dom';
import './index.scss';

export interface IReportListGroup extends IReportListForAll {
    unitReportProjectInforDtos: IUnitReportProjectInfo[];
}

interface IUnitReportProjectInfo {
    employeeId: number;
    projectName: string;
    dcName: string;
    grade: number;
    effort: number;
    billableStatus: string;
    billable: number;
    isMainProject: boolean;
    projectManager: string;
    beforeWorkExp: number;
    currentWorkExp: number;
    notes: string;
}

const ReportListFilterGroupManagement = () => {
    const [filterForm] = Form.useForm();
    const { id = '' } = useParams();
    const location = useLocation();
    const { showNotification } = useNotify();
    const dispatch = useDispatch();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();
    const { havePermission } = usePermissions('EmployeeManagementList', 'EmployeeManagement');

    const queryParams = new URLSearchParams(location.search);
    const filterBy = decodeURIComponent(queryParams.get('filterBy') || '');
    const title = decodeURIComponent(queryParams.get('title') || '');
    const unitName = decodeURIComponent(queryParams.get('unitName') || '');
    const tab = queryParams.get('tab');
    const hiddenButtonFilter = queryParams.get('hiddenButtonFilter') === 'true';
    const viewHR = queryParams.get('viewHR') === 'true';

    const titleName = title.replace(/[^a-zA-Z]/g, '');

    const [dataList, setDataList] = useState<IReportListGroup[]>([]);
    const [filterEffort, setFilterEffort] = useState<string>('0');
    const [isExportLoading, setIsExportLoading] = useState(false);

    const titleText =
        (tab === 'employee' && `report list for all employees of ${unitName}`) ||
        (tab === 'all' && `report list for ${titleName} list employees and contractors of ${unitName}`);

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
        },
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

    const onExport = async () => {
        try {
            setIsExportLoading(true);
            const isEffort = filterEffort === '0' ? undefined : filterEffort === '1' ? false : true;

            const res = await chartService.exportReportGroup({ unitId: id, isEffort, filterBy });
            downloadFile(res, 'Report_Group_List.xlsx');
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
                        if (filterEffort === '1') return project.effort === 0; // Filter for zero effort
                        if (filterEffort === '2') return project.effort > 0; // Filter for non-zero effort
                        return true;
                    })
                }))
                .filter(item => item.unitReportProjectInforDtos.length > 0),
        [filterEffort]
    );

    const filteredDataList = useMemo(() => filterData(dataList), [dataList, filterData]);

    const calculateTotals = (data: IReportListGroup[], titleName: string) => {
        const totalEffort =
            data.reduce((total, item) => total + item.unitReportProjectInforDtos.reduce((itemTotal, project) => itemTotal + project.effort, 0), 0) /
            100;

        const totalBillable = data.reduce(
            (total, item) =>
                total +
                item.unitReportProjectInforDtos.reduce(
                    (itemTotal, project) => itemTotal + (project.billableStatus === 'Billable' ? project.billable : 0),
                    0
                ),
            0
        );

        const totalNonBillable =
            data.reduce(
                (total, item) =>
                    total +
                    item.unitReportProjectInforDtos.reduce(
                        (itemTotal, project) => itemTotal + (project.billableStatus !== 'Billable' ? project.effort : 0),
                        0
                    ),
                0
            ) / 100;

        switch (titleName) {
            case 'Headcount':
            case 'ProductivityFactor':
            case 'NBR':
            case 'Effort':
                return { label: 'Total Effort', value: formatNumberWithDecimalPlaces(totalEffort) };
            case 'Coremember':
            case 'Redeployable':
                return { label: `Total ${titleName}`, value: data.length };
            case 'Billable':
                return { label: 'Total Billable', value: formatNumberWithDecimalPlaces(totalBillable) };
            case 'NonBillable':
                return { label: 'Total Non-Billable', value: formatNumberWithDecimalPlaces(totalNonBillable) };
            default:
                return { label: 'Total', value: '0' };
        }
    };

    const totalData = useMemo(() => calculateTotals(filteredDataList, titleName), [filteredDataList, titleName]);

    const onFilter = (value: any) => {
        setFilterEffort(value.effort || '0');
    };

    const onResetFilter = () => {
        filterForm.setFieldsValue({ effort: '0' });
        setFilterEffort('0');
    };

    const filterDataColumn: IFilterData[] = [
        {
            key: 'effort',
            forColumns: [],
            label: 'Effort',
            alwaysShow: true,
            control: <BaseSelect options={optionEffort} placeholder="Select effort" />
        }
    ];

    useEffect(() => {
        filterForm.setFieldsValue({ effort: '0' });
    }, [filterForm]);

    useEffect(() => {
        const fetchDataList = async (params: { id: string; filterBy: string }) => {
            turnOnLoading();
            try {
                const res = await chartService.openReportList(params);

                const { succeeded, data } = res;

                if (succeeded && data) {
                    setDataList(data);
                }
            } catch (error) {
                showNotification(false, 'Error fetching get EmployeeByUnit list');
            } finally {
                turnOffLoading();
            }
        };

        fetchDataList({ id: id, filterBy: filterBy });
    }, [tab, id, turnOnLoading, turnOffLoading, showNotification, filterBy]);

    return (
        <DetailContent rootClassName="layout-page-report-group-window-open">
            <Flex justify="space-between" align="center" gap={24} className="mg-b-16">
                <Title level={3} className="title-header">
                    {titleText}
                </Title>
                {viewHR && havePermission('View') && (
                    <Link
                        to={pathnames.hrManagement.employeeManagement.main.path}
                        onClick={() => {
                            const statusIds = ['4', '5', '6', '8', '10'];
                            dispatch(searchParamsActions.resetAllSection('employeeManagement'));
                            dispatch(
                                searchParamsActions.setFilterParamsRedux({
                                    employeeManagement: { filter: { unitIds: [id], mainProjectValues: ['1'], statusIds } }
                                })
                            );
                        }}
                        className="view-employee-list"
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
                        <span>- The project in bold is main project</span>
                        <span>- The Internal Outsources column show the Main DC of outsourcing who come from other Project/ DC</span>
                    </Flex>
                }
                filterForm={filterForm}
                loading={false}
                data={filterDataColumn}
                moreButtons={moreButtons}
                onResetFilter={onResetFilter}
                onFilter={onFilter}
                hiddenButtonFilter={hiddenButtonFilter}
                rootClassName="report-filter-group"
            />
            <BaseTable
                columns={employeeByGenderColumns}
                dataSource={formatDataTableFromOne(filteredDataList)}
                loading={isLoading}
                scroll={{ x: 'max-content', y: 589 }}
                bordered
                rootClassName="table-report-window-open min-h-589"
                pagination={false}
            />
            <div>
                <span className="total-effort-table">
                    {totalData.label}: {formatNumberWithDecimalPlaces(Number(totalData.value))}
                </span>
            </div>
        </DetailContent>
    );
};

export default ReportListFilterGroupManagement;
