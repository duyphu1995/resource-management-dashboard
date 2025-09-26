import DetailContent from '@/components/common/detail-management/detail-content';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import pathnames from '@/pathnames';
import { searchParamsActions } from '@/redux/search-params-slice';
import employeeSummaryService from '@/services/reports/employee-summary';
import { IEmployeeBySomething, IParamsList } from '@/types/reports/employee-summary';
import { formatDataTableFromOne, formatTimeMonthDayYear } from '@/utils/common';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';
import { Flex } from 'antd';
import { ColumnType } from 'antd/es/table';
import Title from 'antd/es/typography/Title';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useLocation, useParams } from 'react-router-dom';

const PositionSummaryDetail = () => {
    const { id = '' } = useParams();
    const location = useLocation();
    const { showNotification } = useNotify();
    const dispatch = useDispatch();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const queryParams = new URLSearchParams(location.search);
    const positionName = queryParams.get('positionName');
    const tab = queryParams.get('tab');
    const moduleName = queryParams.get('moduleName') || '';

    const [dataList, setDataList] = useState<IEmployeeBySomething[]>([]);

    const isContractor = tab === 'ContractorSummary';
    const isCompany = tab?.includes('CompanySummary');
    const titleText = isContractor ? `CONTRACTOR LIST OF POSITION: ${positionName}` : `EMPLOYEE LIST OF POSITION: ${positionName}`;

    const managementType = isContractor ? 'ContractorManagement' : 'EmployeeManagement';
    const { havePermission } = usePermissions(`${managementType}List`, managementType);

    const companyId = isCompany ? tab?.split('-')[1] : null;

    const employeeByPositionColumns: ColumnType<IEmployeeBySomething>[] = [
        {
            dataIndex: 'key',
            key: 'key',
            title: 'No.',
            fixed: 'left',
            width: 80
        },
        {
            dataIndex: 'badgeId',
            key: 'badgeId',
            title: 'Badge ID',
            width: 80,
            fixed: 'left',
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'fullName',
            title: 'Full Name',
            width: 300,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'workEmail',
            title: 'Email',
            width: 300,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'joinDate',
            title: 'Joined Date',
            width: 100,
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        }
    ];

    useEffect(() => {
        const fetchDataList = async (params: IParamsList) => {
            turnOnLoading();
            try {
                const res = await employeeSummaryService.getEmployeeByPositionList(params, moduleName);
                const { succeeded, data } = res;

                if (succeeded && data) {
                    setDataList(data);
                }
            } catch (error) {
                showNotification(false, 'Error fetching get position list');
            } finally {
                turnOffLoading();
            }
        };

        if (tab?.startsWith('CompanySummary')) {
            const companyId = tab?.split('-')[1];

            fetchDataList({ companyId: parseInt(companyId), positionId: Number(id) });
            return;
        }
        tab && fetchDataList({ tabType: tab, positionId: Number(id) });
    }, [tab, id, moduleName, turnOnLoading, turnOffLoading, showNotification]);

    return (
        <DetailContent rootClassName="layout-page-report-window-open">
            <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
                <Title level={3} style={{ margin: 0 }}>
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
                                        contractorManagement: { filter: { positionIds: [id], contractorStatuses: statusIds } }
                                    })
                                );
                            } else {
                                dispatch(searchParamsActions.resetAllSection('employeeManagement'));
                                dispatch(
                                    searchParamsActions.setFilterParamsRedux({
                                        employeeManagement: { filter: { positionIds: [id], statusIds, companyIds } }
                                    })
                                );
                            }
                        }}
                    >
                        {isContractor ? `View this position in HR's Contractors list` : `View this position in HR's employee list`}
                    </Link>
                )}
            </Flex>
            <BaseTable
                columns={employeeByPositionColumns}
                dataSource={formatDataTableFromOne(dataList)}
                loading={isLoading}
                bordered
                pagination={false}
                scroll={{}}
                rootClassName="table-report-window-open"
            />
        </DetailContent>
    );
};

export default PositionSummaryDetail;
