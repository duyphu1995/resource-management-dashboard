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

const GenderSummaryDetail = () => {
    const { id = '' } = useParams();
    const location = useLocation();
    const { showNotification } = useNotify();
    const dispatch = useDispatch();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();
    const queryParams = new URLSearchParams(location.search);
    const genderName = queryParams.get('genderName');
    const tab = queryParams.get('tab');
    const moduleName = queryParams.get('moduleName') || '';

    const [dataList, setDataList] = useState<IEmployeeBySomething[]>([]);

    const isContractor = tab === 'ContractorSummary';
    const isCompany = tab?.includes('CompanySummary');
    const titleText = isContractor ? `CONTRACTOR LIST OF GENDER: ${genderName}` : `EMPLOYEE LIST OF GENDER: ${genderName}`;

    const companyId = isCompany ? tab?.split('-')[1] : null;
    const employeeByGenderColumns: ColumnType<IEmployeeBySomething>[] = [
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
                const res = await employeeSummaryService.getEmployeeByGenderList(params, moduleName);

                const { succeeded, data } = res;

                if (succeeded && data) {
                    setDataList(data);
                }
            } catch (error) {
                showNotification(false, 'Error fetching get gender list');
            } finally {
                turnOffLoading();
            }
        };

        if (tab?.startsWith('CompanySummary')) {
            const companyId = tab?.split('-')[1];

            fetchDataList({ companyId: parseInt(companyId), genderId: Number(id) });
            return;
        }
        tab && fetchDataList({ tabType: tab, genderId: Number(id) });
    }, [tab, id, turnOnLoading, turnOffLoading, showNotification]);

    const managementType = isContractor ? 'ContractorManagement' : 'EmployeeManagement';
    const { havePermission } = usePermissions(`${managementType}List`, managementType);

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
                                        contractorManagement: { filter: { genderIds: [id], contractorStatuses: statusIds } }
                                    })
                                );
                            } else {
                                dispatch(searchParamsActions.resetAllSection('employeeManagement'));
                                dispatch(
                                    searchParamsActions.setFilterParamsRedux({
                                        employeeManagement: { filter: { genderIds: [id], statusIds, companyIds } }
                                    })
                                );
                            }
                        }}
                    >
                        {isContractor ? `View in HR's Contractors list` : `View in HR's employee list`}
                    </Link>
                )}
            </Flex>
            <BaseTable
                columns={employeeByGenderColumns}
                dataSource={formatDataTableFromOne(dataList)}
                loading={isLoading}
                pagination={false}
                bordered
                scroll={{}}
                rootClassName="table-report-window-open"
            />
        </DetailContent>
    );
};

export default GenderSummaryDetail;
