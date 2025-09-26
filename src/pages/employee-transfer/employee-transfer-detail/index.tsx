import DetailFields from '@/components/common/detail-management/detail-fields';
import DetailInfo from '@/components/common/detail-management/detail-info';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseToolTip from '@/components/common/tooltip';
import pathnames from '@/pathnames';
import employeeTransferService from '@/services/transfer-employee';
import { IDataBreadcrumb, IField } from '@/types/common';
import { ITransferEmployee } from '@/types/transfer-employee';
import { formatTimeMonthDayYear } from '@/utils/common';
import useNotify from '@/utils/hook/useNotify';
import { Checkbox, Col, Flex, Radio, Row } from 'antd';
import Title from 'antd/es/typography/Title';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TransferEmployeeInfo from '../employee-action/employee-transfer-info';
import './index.scss';

type ValidEmployeeTransferKey = keyof ITransferEmployee;

export interface SectionItem {
    label: string;
    tooltip: string;
    placeholder: string;
    name: ValidEmployeeTransferKey;
    input?: boolean;
    disable?: boolean;
    required: boolean;
}

const EmployeeTransferDetail = () => {
    const { id = '' } = useParams();
    const { showNotification } = useNotify();

    const [dataDetail, setDataDetail] = useState<ITransferEmployee>();

    const breadcrumbList: IDataBreadcrumb[] = [
        { title: pathnames.home.name },
        { title: pathnames.transferEmployee.main.name, path: pathnames.transferEmployee.main.path },
        { title: pathnames.transferEmployee.detail.name }
    ];

    const renderTransferStatus = (dataDetail: ITransferEmployee | undefined) => {
        const { transferStatusName, pendingApproveFullName, pendingApproveEmail } = dataDetail || {};

        let status = transferStatusName;
        if (transferStatusName?.includes('Pending')) {
            status = `Pending approval - (${pendingApproveFullName} - ${pendingApproveEmail})`;
        } else if (transferStatusName?.includes('Waiting')) {
            status = 'Waiting for Transfer Date';
        }

        return renderWithFallback(status);
    };

    const newTransferCols: IField[] = [
        {
            label: 'Full Name',
            value: renderWithFallback(dataDetail?.fullName)
        },
        {
            label: 'Email',
            value: renderWithFallback(dataDetail?.workEmail)
        },
        {
            label: 'Current Project',
            value: renderWithFallback(dataDetail?.fromProjectName)
        },
        {
            label: 'Target Project',
            value: renderWithFallback(dataDetail?.toProjectName)
        },
        {
            label: 'Current Location',
            value: renderWithFallback(dataDetail?.fromLocation)
        },
        {
            label: 'Target Location',
            value: renderWithFallback(dataDetail?.toLocation)
        },

        {
            label: 'Transfer Date',
            value: renderWithFallback(formatTimeMonthDayYear(dataDetail?.transferDate))
        },

        {
            label: 'Completed Date',
            value: renderWithFallback(formatTimeMonthDayYear(dataDetail?.completedDate))
        },
        {
            label: 'Transfer Status',
            value: renderTransferStatus(dataDetail)
        },
        {
            label: ''
        },
        {
            label: ''
        },
        {
            label: 'Transfer Note',
            value: renderWithFallback(dataDetail?.transferNotes),
            colSpan: 12
        },
        {
            label: 'Revoke Customer Access',
            value: renderWithFallback(dataDetail?.revokeNotes),
            colSpan: 12
        }
    ];

    const renderTransferTo = () => (
        <div className="transfer-to">
            <Title level={5} className="transfer-to__title">
                Transfer To
            </Title>
            <Flex vertical gap={8}>
                <Flex vertical gap={16}>
                    <Flex vertical>
                        <Radio disabled checked={dataDetail?.isSameCustomer}>
                            <span className="transfer-to">Transfer To Same Customer</span>
                        </Radio>

                        {dataDetail?.isSameCustomer && (
                            <>
                                <Col span={12} style={{ marginTop: 16, marginBottom: 4, fontWeight: 500 }}>
                                    Need IT To Take Action
                                </Col>
                                <Row>
                                    <Col span={12}>{dataDetail?.itActionNote || '-'}</Col>
                                </Row>
                            </>
                        )}
                    </Flex>
                    <div>
                        <Radio disabled checked={dataDetail?.isDifferentCustomer}>
                            <span className="transfer-to">Transfer To Different Customer</span>
                        </Radio>
                    </div>
                </Flex>

                {dataDetail?.isDifferentCustomer && (
                    <>
                        <Checkbox checked={dataDetail?.isKeepHDD} disabled style={{ marginTop: 16 }}>
                            Keep HDD
                        </Checkbox>

                        {dataDetail?.isKeepHDD && (
                            <>
                                <div className="keep-hdd-reason">Reason</div>
                                <Row className="keep-hdd-reason-value">
                                    <Col span={12}>{renderWithFallback(dataDetail?.keepHDDReason)}</Col>
                                </Row>
                            </>
                        )}
                    </>
                )}
            </Flex>
        </div>
    );

    const detailInfoSection = (
        <DetailInfo title="Transfer Information">
            <DetailFields data={newTransferCols} />
            {renderTransferTo()}
        </DetailInfo>
    );

    const sectionAdminTicket: {
        title: string;
        items: SectionItem[];
    }[] = [
        {
            title: 'Revoke Privileges',
            items: [
                {
                    label: 'Access to main door (Lab No.)',
                    tooltip: 'Revoke restricted room access granted at Lab',
                    placeholder: 'Enter access to main door',
                    name: 'revokeLabName',
                    required: true
                },
                {
                    label: 'Access to working room (Room No.)',
                    tooltip: 'Revoke restricted room access granted at Lab',
                    placeholder: 'Enter access to working room',
                    name: 'revokeWorkingRoomName',
                    required: true
                },
                {
                    label: 'Access to restricted area (Room No.)',
                    tooltip: 'Revoke restricted room access granted at Lab',
                    placeholder: 'Enter access to restricted area',
                    name: 'revokeRestrictRoomName',
                    required: true
                },
                {
                    label: 'Access to confidential cabinets (Key No.)',
                    tooltip: 'Revoke restricted room access granted at Lab',
                    placeholder: 'Enter access to confidential cabinets',
                    name: 'revokeConfidentialCabinetName',
                    required: false
                },
                {
                    label: 'Others (special equipments, facilities, etc.)',
                    tooltip: 'Revoke restricted room access granted at Lab',
                    placeholder: 'Enter others',
                    name: 'revokeOther',
                    required: false
                }
            ]
        },
        {
            title: 'Grant Privileges',
            items: [
                {
                    label: 'Access to main door (Lab No.)',
                    tooltip: 'Grant access to the working room',
                    placeholder: 'Enter access to main door',
                    name: 'grantLabName',
                    required: true
                },
                {
                    label: 'Access to working room (Room No.)',
                    tooltip: 'Grant access to the working room',
                    placeholder: 'Enter access to working room',
                    name: 'grantWorkingRoomName',
                    required: true
                },
                {
                    label: 'Access to restricted area (Room No.)',
                    tooltip: 'Grant access to the working room',
                    placeholder: 'Enter access to restricted area',
                    name: 'grantRestrictRoomName',
                    required: true
                },
                {
                    label: 'Access to confidential cabinets (Key No.)',
                    tooltip: 'Grant access to the working room',
                    placeholder: 'Enter access to confidential cabinets',
                    name: 'grantConfidentialCabinetName',
                    required: false
                },
                {
                    label: 'Others (special equipments, facilities, etc.)',
                    tooltip: 'Grant access to the working room',
                    placeholder: 'Enter others',
                    name: 'grantOther',
                    required: false
                }
            ]
        }
    ];

    const renderRow = (title: string, items: SectionItem[]) => (
        <div className="col-admin-ticket">
            <Row gutter={[24, 24]}>
                <Col span={12}>
                    <span className="admin-ticket-title">{title}</span>
                </Col>
            </Row>
            {items.map((item, index) => (
                <Row gutter={[24, 24]} key={index}>
                    <Col span={12}>
                        <Flex gap={12} align="center">
                            <div className="title">
                                {item.label}
                                {item.required && <span className="c-red">*</span>}
                            </div>
                            {item.required && <BaseToolTip title={item.tooltip} />}
                        </Flex>
                    </Col>
                    <Col span={12}>{(dataDetail && dataDetail[item.name]) || '-'}</Col>
                </Row>
            ))}
        </div>
    );

    const adminInfoSection = (
        <DetailInfo title="Admin Ticket">
            <Row gutter={[88, 24]}>
                {sectionAdminTicket.map((section, index) => (
                    <Col span={12} key={index}>
                        {renderRow(section.title, section.items)}
                    </Col>
                ))}
            </Row>
        </DetailInfo>
    );

    const renderTitleNote = (status: string | undefined) => {
        let title = '';
        let note = '';

        switch (status) {
            case 'Pending':
            case 'Waiting':
            case 'Done':
                title = 'Approval Note';
                note = dataDetail?.approveNotes || '';
                break;
            case 'Disapprove':
                title = 'Disapprove Note';
                note = dataDetail?.disApproveNotes || '';
                break;
            case 'Cancel':
                title = 'Cancel Note';
                note = dataDetail?.cancelNotes || '';
                break;
            default:
                title = 'Transfer Note';
                note = dataDetail?.transferNotes || '';
                break;
        }

        return { title, note };
    };

    const { title, note } = renderTitleNote(dataDetail?.transferStatusName);

    const approvalSection = (
        <DetailInfo title="Approval">
            <Row gutter={[88, 16]}>
                <Col span={24}>
                    <div className="approval-title">Employee Mailing List</div>
                    <div>{renderWithFallback(dataDetail?.employeeMaillingList.replace(/,/g, '; '))}</div>
                </Col>
                <Col span={24}>
                    <div className="approval-title">{title}</div>
                    <div>{renderWithFallback(note)}</div>
                </Col>
            </Row>
        </DetailInfo>
    );

    useEffect(() => {
        const getDataEmployeeTransferDetail = async () => {
            try {
                const res = await employeeTransferService.getEmployeeTransferDetail(id);
                const { data, succeeded } = res;

                if (succeeded && data) {
                    setDataDetail(data);
                }
            } catch (error) {
                showNotification(false, 'get employee transfer detail failed');
            }
        };

        getDataEmployeeTransferDetail();
    }, [id, showNotification]);

    return (
        <TransferEmployeeInfo
            breadcrumb={breadcrumbList}
            pageTitle="Transfer Details"
            detailInfoSection={detailInfoSection}
            adminInfoSection={adminInfoSection}
            approvalSection={approvalSection}
            className="employee-transfer__detail"
        />
    );
};

export default EmployeeTransferDetail;
