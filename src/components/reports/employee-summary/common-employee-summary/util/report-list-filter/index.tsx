import DetailContent from '@/components/common/detail-management/detail-content';
import BaseSelect from '@/components/common/form/select';
import ReportFilter from '@/components/common/report-filter';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import pathnames from '@/pathnames';
import { searchParamsActions } from '@/redux/search-params-slice';
import employeeSummaryService from '@/services/reports/employee-summary';
import { IFilterData } from '@/types/filter';
import { IParamsList, IReportListForAll } from '@/types/reports/employee-summary';
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

const ReportListFilter = () => {
    const { showNotification } = useNotify();
    const [filterForm] = Form.useForm();
    const { id = '' } = useParams();
    const location = useLocation();
    const dispatch = useDispatch();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();
    const queryParams = new URLSearchParams(location.search);
    const unitName = decodeURIComponent(queryParams.get('unitName') || '');
    const tab = queryParams.get('tab');
    const moduleName = queryParams.get('moduleName') || '';

    const [dataList, setDataList] = useState<IReportListForAll[]>([]);
    const [filterEffort, setFilterEffort] = useState<string>('0');
    const [isExportLoading, setIsExportLoading] = useState(false);

    const isContractor = tab === 'ContractorSummary';
    const titleText = isContractor ? `REPORT LIST FOR ALL CONTRACTORS OF: ${unitName}` : `REPORT LIST FOR ALL EMPLOYEES OF : ${unitName}`;
    const isCompany = tab?.includes('CompanySummary');
    const companyId = isCompany ? tab?.split('-')[1] : null;

    const employeeByGenderColumns: ColumnType<IReportListForAll>[] = [
        {
            dataIndex: 'key',
            key: 'key',
            title: 'No.',
            width: 60
        },
        {
            dataIndex: 'badgeId',
            key: 'badgeId',
            title: 'Badge ID',
            width: 80,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'fullName',
            title: 'Full Name',
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
            width: 200,
            render: item => renderWithFallback(item)
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
            dataIndex: 'projectName',
            title: ORG_UNITS.Project,
            width: 200,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'dcName',
            title: 'DC of Project',
            width: 170,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'grade',
            title: 'Grade',
            width: 100,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'effort',
            title: 'Effort(%)',
            width: 100,
            render: item => renderWithFallback(item + '%')
        },
        {
            dataIndex: 'dcName',
            title: 'Internal Outsources',
            width: 180,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'billableStatus',
            title: 'Type',
            width: 100,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'billable',
            title: 'Billable',
            width: 100,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'totalExp',
            title: 'Total Exp. (Month)',
            width: 170,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'notes',
            title: 'Note',
            width: 100,
            render: item => renderWithFallback(item)
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
        if (!tab) return;

        try {
            setIsExportLoading(true);
            const isEffort = filterEffort === '1' ? 0 : filterEffort === '2' ? 1 : undefined;
            const isCompanySummary = tab.startsWith('CompanySummary');
            const requestData = isCompanySummary
                ? { companyId: parseInt(tab.split('-')[1]), unitId: Number(id), isEffort }
                : { tabType: tab, unitId: Number(id), isEffort };
            const res = await employeeSummaryService.exportEmployeeByUnit(requestData, moduleName);

            downloadFile(res, 'Report_List.xlsx');
            showNotification(true, 'Export report successfully');
        } catch {
            showNotification(false, 'Export report failed');
        } finally {
            setIsExportLoading(false);
        }
    };

    const moreButtons: ButtonProps[] = [{ children: 'Export', loading: isExportLoading, onClick: onExport, type: 'primary' }];

    const filterData = useCallback(
        (data: IReportListForAll[]) => {
            if (filterEffort === '1') {
                return data.filter(item => item.effort === 0);
            } else if (filterEffort === '2') {
                return data.filter(item => item.effort > 0);
            }
            return data;
        },
        [filterEffort]
    );

    const filteredDataList = useMemo(() => filterData(dataList), [dataList, filterData]);

    const calculateTotalEffort = (data: IReportListForAll[]) => {
        const totalEffort = data.reduce((total, item) => total + item.effort, 0) / 100;
        return totalEffort.toFixed(2);
    };

    const totalEffort = useMemo(() => calculateTotalEffort(filteredDataList), [filteredDataList]);

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
        const fetchDataList = async (params: IParamsList) => {
            turnOnLoading();
            try {
                const res = await employeeSummaryService.getEmployeeByUnit(params, moduleName);

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

        if (tab?.startsWith('CompanySummary')) {
            const companyId = tab?.split('-')[1];

            fetchDataList({ companyId: parseInt(companyId), unitId: Number(id) });
            return;
        }
        tab && fetchDataList({ tabType: tab, unitId: Number(id) });
    }, [tab, id, showNotification, turnOnLoading, turnOffLoading]);

    const managementType = isContractor ? 'ContractorManagement' : 'EmployeeManagement';
    const { havePermission } = usePermissions(`${managementType}List`, managementType);

    return (
        <DetailContent rootClassName="layout-page-report-window-open">
            <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
                <Title level={3} style={{ margin: 0, textTransform: 'uppercase' }}>
                    {titleText}
                </Title>
                {havePermission('View') && (
                    <Link
                        to={
                            isContractor ? pathnames.hrManagement.contractorManagement.main.path : pathnames.hrManagement.employeeManagement.main.path
                        }
                        onClick={() => {
                            const statusIds = isContractor ? ['14'] : ['4', '5', '6', '8', '10'];
                            const companyIds = companyId ? [Number(companyId)] : [0];

                            if (isContractor) {
                                dispatch(searchParamsActions.resetAllSection('contractorManagement'));
                                dispatch(
                                    searchParamsActions.setFilterParamsRedux({
                                        contractorManagement: { filter: { unitIds: [id], contractorStatuses: statusIds } }
                                    })
                                );
                            } else {
                                dispatch(searchParamsActions.resetAllSection('employeeManagement'));
                                dispatch(
                                    searchParamsActions.setFilterParamsRedux({
                                        employeeManagement: { filter: { companyIds, unitIds: [id], mainProjectValues: ['1'], statusIds } }
                                    })
                                );
                            }
                        }}
                    >
                        {isContractor ? `View in HR's Contractors list` : `View in HR's employee list`}
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
                rootClassName="report-filter-group"
            />
            <BaseTable
                columns={employeeByGenderColumns}
                dataSource={formatDataTableFromOne(filteredDataList)}
                loading={isLoading}
                bordered
                rootClassName="table-report-window-open"
                pagination={false}
            />
            <div className="total-effort-table">
                <span>Total Effort: {formatNumberWithDecimalPlaces(Number(totalEffort))}</span>
            </div>
        </DetailContent>
    );
};

export default ReportListFilter;
