import DetailContent from '@/components/common/detail-management/detail-content';
import DetailFields from '@/components/common/detail-management/detail-fields';
import DetailHeader from '@/components/common/detail-management/detail-header';
import DetailInfo from '@/components/common/detail-management/detail-info';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import TableHaveAdd from '@/components/common/table/table-add';
import pathnames from '@/pathnames';
import resignationService from '@/services/hr-management/resignation-management';
import { IField } from '@/types/common';
import {
    IResignation,
    IResignationCancelled,
    IResignationEmployeeCommitment,
    IResignationEmployeeContract,
    IResignationEmployeeOnsiteHistory,
    IResignationEmployeeProject,
    IResignationEmployeeTemporaryLeave,
    IResignationMoreInformation
} from '@/types/hr-management/resignation-management';
import { formatTimeMonthDayYear } from '@/utils/common';
import { ORG_UNITS } from '@/utils/constants';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';
import { ButtonProps, Checkbox, Flex, Spin } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export interface ITabResignationDetailProps {
    isReload?: any;
}

const TabResignationDetail = (props: ITabResignationDetailProps) => {
    const { isReload } = props;
    const navigation = useNavigate();
    const { resignationFormId = '' } = useParams();
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const { havePermission } = usePermissions('ResignationDetails', 'ResignationManagement');

    const [data, setData] = useState<IResignation>();

    const addKeyForData = (data: any[] = []) => {
        return data.map((item, index) => ({ ...item, key: index }));
    };

    // More information
    const [moreInfo, setMoreInfo] = useState<IResignationMoreInformation | null>();
    const pageTitle = pathnames.hrManagement.resignationManagement.detail.name;

    const resignationColumns: IField[] = [
        {
            label: 'Full Name',
            value: renderWithFallback(data?.fullName)
        },
        {
            label: 'Badge ID',
            value: renderWithFallback(data?.badgeId)
        },
        {
            label: ORG_UNITS.Project,
            value: renderWithFallback(data?.projectName)
        },
        {
            label: 'Status',
            value: renderWithFallback(data?.resignationStatusName)
        },
        {
            label: 'Apply Date',
            value: renderWithFallback(formatTimeMonthDayYear(data?.applyDate))
        },
        {
            label: 'Resign Date',
            value: renderWithFallback(formatTimeMonthDayYear(data?.resignDate))
        },
        {
            label: 'Cancelled Date',
            value: renderWithFallback(formatTimeMonthDayYear(data?.cancelledDate))
        },
        {
            label: 'Reason',
            value: renderWithFallback(data?.reasonName)
        },
        {
            label: 'Resignation Type',
            value: renderWithFallback(data?.resignationTypeName)
        },
        {
            label: 'Personal Contact',
            value: renderWithFallback(data?.personalContact)
        },
        {
            label: 'Mobile Phone',
            value: renderWithFallback(data?.mobilePhone)
        },
        {
            label: <span></span>,
            value: (
                <Checkbox checked={data?.isAttrition} disabled>
                    Attrition
                </Checkbox>
            )
        },
        {
            label: 'Note',
            value: renderWithFallback(data?.notes)
        }
    ];

    const handleBack = () => navigation(pathnames.hrManagement.resignationManagement.main.path);
    const handleEdit = () => {
        navigation(pathnames.hrManagement.resignationManagement.edit.path + '/' + resignationFormId);
    };

    const addButton: ButtonProps = havePermission('ViewEmployeeDetails') && {
        children: 'View Employee Details',
        onClick: () => navigation(pathnames.hrManagement.employeeManagement.detail.path + '/' + data?.employeeId)
    };

    const editButton: ButtonProps = havePermission('Edit') && {
        type: 'primary',
        htmlType: 'button',
        onClick: handleEdit,
        children: 'Edit'
    };

    const buttons: ButtonProps[] = [addButton, editButton].filter(Boolean);

    // More information table columns
    const projectColumns: ColumnsType<IResignationEmployeeProject> = [
        {
            dataIndex: 'projectName',
            key: 'projectName',
            title: ORG_UNITS.Project,
            width: 240,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'dgName',
            key: 'dgName',
            title: ORG_UNITS.DG,
            width: 160,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'dcName',
            key: 'dcName',
            title: ORG_UNITS.DC,
            width: 160,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'startDate',
            key: 'startDate',
            title: 'Join Date',
            width: 160,
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'endDate',
            key: 'endDate',
            title: 'Leave Date',
            width: 160,
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'managerName',
            key: 'managerName',
            title: 'Manager',
            width: 294,
            render: item => renderWithFallback(item)
        }
    ];

    const onsiteColumns: ColumnsType<IResignationEmployeeOnsiteHistory> = [
        {
            dataIndex: 'projectName',
            key: 'projectName',
            title: ORG_UNITS.Project,
            width: 300,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'countryName',
            key: 'countryName',
            title: 'Country',
            width: 160,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'cityName',
            key: 'cityName',
            title: 'City',
            width: 160,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'customer',
            key: 'customer',
            title: 'Customer',
            width: 160,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'visaTypeName',
            key: 'visaTypeName',
            title: 'Visa Type',
            width: 160,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'flightDeparture',
            key: 'flightDeparture',
            title: 'Flight Departure',
            width: 160,
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'actualEndDate',
            key: 'actualEndDate',
            title: 'Actual End Date',
            width: 160,
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        }
    ];

    const brokenCommitmentColumns: ColumnsType<IResignationEmployeeCommitment> = [
        {
            dataIndex: 'commitmentName',
            key: 'commitmentName',
            title: 'Commitment Type',
            width: 300,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'signedDate',
            key: 'signedDate',
            title: 'Signed Date',
            width: 160,
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'fromDate',
            key: 'fromDate',
            title: 'From',
            width: 160,
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'toDate',
            key: 'toDate',
            title: 'To',
            width: 160,
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'costFee',
            key: 'costFee',
            title: 'Fee',
            width: 160,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'notes',
            key: 'notes',
            title: 'Note',
            width: 234,
            render: item => renderWithFallback(item)
        }
    ];

    const workingStatusColumns: ColumnsType<IResignationEmployeeTemporaryLeave> = [
        {
            dataIndex: 'statusName',
            key: 'statusName',
            title: 'Working Status',
            width: 294,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'projectName',
            key: 'projectName',
            title: ORG_UNITS.Project,
            width: 294,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'effort',
            key: 'effort',
            title: 'Effort',
            width: 294,
            render: item => renderWithFallback(item + '%')
        },
        {
            dataIndex: 'startDate',
            key: 'startDate',
            title: 'Start Date',
            width: 294,
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'endDate',
            key: 'endDate',
            title: 'End Date',
            width: 294,
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'actualEndDate',
            key: 'actualEndDate',
            title: 'Actual End Date',
            width: 160,
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        }
    ];

    const cancelledColumns: ColumnsType<IResignationCancelled> = [
        {
            dataIndex: 'projectName',
            key: 'projectName',
            title: ORG_UNITS.Project,
            width: 240,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'dgName',
            key: 'dgName',
            title: ORG_UNITS.DG,
            width: 160,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'dcName',
            key: 'dcName',
            title: ORG_UNITS.DC,
            width: 160,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'appliedDate',
            key: 'appliedDate',
            title: 'Applied Date',
            width: 160,
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'cancelledDate',
            key: 'cancelledDate',
            title: 'Cancelled Date',
            width: 160,
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'reasonName',
            key: 'reasonName',
            title: 'Reason',
            width: 294,
            render: item => renderWithFallback(item)
        }
    ];

    const contractColumns: ColumnsType<IResignationEmployeeContract> = [
        {
            dataIndex: 'contractTypeName',
            key: 'contractTypeName',
            title: 'Contract Type',
            width: 294,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'fromDate',
            key: 'fromDate',
            title: 'Start Date',
            width: 220,
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'toDate',
            key: 'toDate',
            title: 'End Date',
            width: 220,
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'signOrder',
            key: 'signOrder',
            title: 'Sign Order',
            width: 220,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'renewApprovalStatusName',
            key: 'renewApprovalStatusName',
            title: 'Renew Approval',
            width: 220,
            render: item => renderWithFallback(item)
        }
    ];

    // Fetch resignation data
    useEffect(() => {
        const fetchDetail = async () => {
            turnOnLoading();
            try {
                const res = await resignationService.getDetail(resignationFormId);
                const { succeeded = false, data = null } = res;

                if (succeeded && data) {
                    setData(data);

                    const res = await resignationService.getMoreInfo((data?.employeeId || '0').toString());
                    setMoreInfo(res.data);
                }
            } catch (error) {
                showNotification(false, 'Error fetching resignation detail');
            } finally {
                turnOffLoading();
            }
        };

        fetchDetail();
    }, [isReload, resignationFormId, turnOnLoading, turnOffLoading, showNotification]);

    useEffect(() => {
        const handlePopState = () => {
            navigation(pathnames.hrManagement.resignationManagement.main.path);
        };
        window.addEventListener('popstate', handlePopState);

        return () => {
            setTimeout(() => {
                window.removeEventListener('popstate', handlePopState);
            }, 0);
        };
    }, [navigation]);

    return (
        <Spin spinning={isLoading}>
            <DetailContent>
                <DetailHeader pageTitle={pageTitle} buttons={buttons} goBack={handleBack} />

                <Flex gap={24} vertical>
                    {/* INFO */}
                    <DetailInfo title="Resignation information">
                        <DetailFields data={resignationColumns} />
                    </DetailInfo>

                    {/* MORE INFO*/}
                    {moreInfo && (
                        <DetailInfo title="More Information">
                            {moreInfo?.employeeProjects && (
                                <TableHaveAdd
                                    title="On-going project"
                                    dataSource={addKeyForData(moreInfo?.employeeProjects)}
                                    columns={projectColumns}
                                />
                            )}
                            {moreInfo?.employeeOnsiteHistories && (
                                <TableHaveAdd
                                    title="On-going Onsite"
                                    dataSource={addKeyForData(moreInfo?.employeeOnsiteHistories)}
                                    columns={onsiteColumns}
                                />
                            )}
                            {moreInfo?.employeeCommitments && (
                                <TableHaveAdd
                                    title="Broken Commitment"
                                    dataSource={addKeyForData(moreInfo?.employeeCommitments)}
                                    columns={brokenCommitmentColumns}
                                />
                            )}
                            {moreInfo?.employeeTemporaryLeaves && (
                                <TableHaveAdd
                                    title="Working Status"
                                    dataSource={addKeyForData(moreInfo?.employeeTemporaryLeaves)}
                                    columns={workingStatusColumns}
                                />
                            )}
                            {moreInfo?.resignationFormCancelled && (
                                <TableHaveAdd
                                    title="Cancelled Resignation"
                                    dataSource={addKeyForData(moreInfo?.resignationFormCancelled)}
                                    columns={cancelledColumns}
                                />
                            )}
                            {moreInfo?.employeeContracts && (
                                <TableHaveAdd title="Contract" dataSource={addKeyForData(moreInfo?.employeeContracts)} columns={contractColumns} />
                            )}
                        </DetailInfo>
                    )}
                </Flex>
            </DetailContent>
        </Spin>
    );
};

export default TabResignationDetail;
