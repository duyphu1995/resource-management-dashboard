import DetailFields from '@/components/common/detail-management/detail-fields';
import DetailInfo from '@/components/common/detail-management/detail-info';
import EmptyBox from '@/components/common/empty-box';
import BaseSelect from '@/components/common/form/select';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseToolTip from '@/components/common/tooltip';
import pathnames from '@/pathnames';
import employeeTransferService from '@/services/transfer-employee';
import { IDataBreadcrumb, IField } from '@/types/common';
import { IMailingList, ITransferEmployee } from '@/types/transfer-employee';
import { formatTimeMonthDayYear } from '@/utils/common';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import { ButtonProps, Checkbox, Col, Flex, Form, FormInstance, Input, Radio, Row, Spin } from 'antd';
import Title from 'antd/es/typography/Title';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SectionItem } from '../../employee-transfer-detail';
import TransferEmployeeInfo from '../employee-transfer-info';

const EmployeeTransferApproval = () => {
    const navigation = useNavigate();
    const { id = '' } = useParams();
    const { showNotification } = useNotify();
    const [form] = Form.useForm();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [dataDetail, setDataDetail] = useState<ITransferEmployee>();

    const breadcrumbList: IDataBreadcrumb[] = [
        { title: pathnames.home.name },
        { title: pathnames.transferEmployee.main.name, path: pathnames.transferEmployee.main.path },
        { title: pathnames.transferEmployee.detail.name }
    ];

    const goBack = () => {
        navigation(pathnames.transferEmployee.main.path);
    };

    const buttons: ButtonProps[] = [
        {
            onClick: goBack,
            children: 'Cancel'
        },
        {
            htmlType: 'submit',
            type: 'primary',
            children: 'Approve'
        }
    ];

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
            value: renderWithFallback(dataDetail?.transferStatusName)
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
            <Title level={5}>Transfer To</Title>
            <Flex vertical gap={8}>
                <Flex vertical gap={24}>
                    <Flex vertical>
                        <Radio disabled checked={dataDetail?.isSameCustomer}>
                            Transfer To Same Customer
                        </Radio>

                        {dataDetail?.isSameCustomer && (
                            <>
                                <Col span={12} style={{ marginTop: 16, marginBottom: 4, fontWeight: 500 }}>
                                    Need IT To Take Action
                                </Col>
                                <Row>
                                    <Col span={12}>{renderWithFallback(dataDetail?.itActionNote)}</Col>
                                </Row>
                            </>
                        )}
                    </Flex>
                    <div>
                        <Radio disabled checked={dataDetail?.isDifferentCustomer}>
                            <span>Transfer To Different Customer</span>
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
                    input: true,
                    required: true
                },
                {
                    label: 'Access to working room (Room No.)',
                    tooltip: 'Grant access to the working room',
                    placeholder: 'Enter access to working room',
                    name: 'grantWorkingRoomName',
                    input: true,
                    required: true
                },
                {
                    label: 'Access to restricted area (Room No.)',
                    tooltip: 'Grant access to the working room',
                    placeholder: 'Enter access to restricted area',
                    name: 'grantRestrictRoomName',
                    input: true,
                    required: true
                },
                {
                    label: 'Access to confidential cabinets (Key No.)',
                    tooltip: 'Grant access to the working room',
                    placeholder: 'Enter access to confidential cabinets',
                    name: 'grantConfidentialCabinetName',
                    input: true,
                    required: false
                },
                {
                    label: 'Others (special equipments, facilities, etc.)',
                    tooltip: 'Grant access to the working room',
                    placeholder: 'Enter others',
                    name: 'grantOther',
                    input: true,
                    required: false
                }
            ]
        }
    ];

    const renderRow = (title: string, items: SectionItem[], form: FormInstance) => (
        <div className="col-admin-ticket">
            <Row gutter={[24, 24]}>
                <Col span={12}>
                    <span className="admin-ticket-title">{title}</span>
                </Col>
            </Row>
            {items.map((item, index) => (
                <Row gutter={[24, 24]} key={index} align={'middle'}>
                    <Col span={12}>
                        <Flex gap={12} align="center">
                            <div className="title">
                                {item.label}
                                {item.required && <span className="c-red">*</span>}
                            </div>
                            {item.required && <BaseToolTip title={item.tooltip} />}
                        </Flex>
                    </Col>
                    <Col span={12}>
                        {item.input ? (
                            <Form.Item name={item.name} rules={[{ required: item.required, message: 'Please enter valid value' }]}>
                                <Input disabled={item.disable} onChange={e => form.setFieldsValue({ [item.name]: e.target.value })} />
                            </Form.Item>
                        ) : (
                            <Form.Item>{renderWithFallback(dataDetail && dataDetail[item.name])}</Form.Item>
                        )}
                    </Col>
                </Row>
            ))}
        </div>
    );

    const adminInfoSection = (
        <DetailInfo title="Admin Ticket">
            <Row gutter={[24, 24]}>
                {sectionAdminTicket.map((section, index) => (
                    <Col span={12} key={index}>
                        {renderRow(section.title, section.items, form)}
                    </Col>
                ))}
            </Row>
        </DetailInfo>
    );

    const [mailList, setMailList] = useState<IMailingList[]>([]);
    const [employeeMailList, setEmployeeMailList] = useState<IMailingList[]>([]);
    const [removeMailList, setRemoveMailList] = useState<IMailingList[]>([]);

    const [selectedRecordMail, setSelectedRecordMail] = useState<IMailingList>();
    const [selectedRecordEmployeeMail, setSelectedRecordEmployeeMail] = useState<IMailingList>();

    useEffect(() => {
        if (!dataDetail) return;

        const fetchDataMailList = async () => {
            const res = await employeeTransferService.getEmployeeMailList(dataDetail?.workEmail);
            const { data } = res;

            if (data) {
                const maillist = data.maillist?.map((item: any) => ({
                    label: item,
                    value: item,
                    flagTransfer: '1',
                    flagDisableTransfer: 1
                }));

                setMailList(maillist);
            }
        };

        fetchDataMailList();
    }, [dataDetail]);

    const renderTransferButton = (type: string) => {
        const handleClick = (direction: string) => {
            // updatedData is used to update the flagTransfer of each item based on the conditions of the 4 buttons
            const updateMailList = [...mailList];
            const updateEmployeeMailList = [...employeeMailList];
            const updateRemoveMailList = [...removeMailList];

            //move record from this list to another list
            const moveRecord = (flag: string, selectedRecord: any, fromList: any[], toList: any[]) => {
                let alreadyExists = false;
                toList.forEach(item => {
                    if (item.value === selectedRecord?.value) {
                        alreadyExists = true;
                    }
                });

                if (!alreadyExists) {
                    toList.push({
                        ...selectedRecord,
                        flagTransfer: flag
                    });
                }

                fromList.forEach((item, index) => {
                    if (item.value === selectedRecord?.value) {
                        fromList.splice(index, 1);
                    }
                });
            };

            if (type && direction) {
                switch (true) {
                    case direction === 'right' && type === 'one' && selectedRecordMail?.flagTransfer === '1':
                        moveRecord('2', selectedRecordMail, updateMailList, updateEmployeeMailList);
                        break;
                    case direction === 'left' && type === 'one' && selectedRecordEmployeeMail?.flagTransfer === '2':
                        if (selectedRecordEmployeeMail?.flagDisableTransfer !== 1) {
                            showNotification(false, "You can't move this field");
                            return;
                        }
                        moveRecord('1', selectedRecordEmployeeMail, updateEmployeeMailList, updateMailList);
                        break;
                    case direction === 'right' && type === 'two' && selectedRecordEmployeeMail?.flagTransfer === '2':
                        if (selectedRecordEmployeeMail?.flagDisableTransfer === 1) {
                            showNotification(false, "You can't move this field");
                            return;
                        }
                        moveRecord('3', selectedRecordEmployeeMail, updateEmployeeMailList, updateRemoveMailList);
                        break;
                    default:
                        return;
                }
            }

            //update data for lists
            setMailList(updateMailList);
            setEmployeeMailList(updateEmployeeMailList);
            setRemoveMailList(updateRemoveMailList);
        };

        return (
            <Flex vertical align="center" justify="center" gap={24} className="transfer-container">
                <Flex align="center" justify="center" className={`transfer-box transfer-box-${type} `} onClick={() => handleClick('right')}>
                    <img src="/media/icons/chevron-right-gray.svg" alt="arrow" className="transfer-icon" />
                </Flex>
                <Flex align="center" justify="center" className={`transfer-box transfer-box-${type} `} onClick={() => handleClick('left')}>
                    <img src="/media/icons/chevron-left-gray.svg" alt="arrow" className="transfer-icon" />
                </Flex>
            </Flex>
        );
    };

    const locale = { emptyText: <EmptyBox loading={false} imageSize={100} minHeight={234} /> };

    const renderRemoveMailingList = () => (
        <div className="table-transfer-mailing-list">
            <Flex style={{ justifyContent: 'space-between' }}>
                <Flex vertical style={{ width: '100%' }}>
                    <Flex align="center" gap={8}>
                        <div style={{ fontWeight: 500 }}>Mailing List</div>
                        <BaseToolTip title="Click on this link to open New Transfer Guide page" />
                    </Flex>
                    <Col style={{ margin: '16px 12px 12px 0px', backgroundColor: '#fff', padding: 'unset' }}>
                        <BaseSelect
                            options={mailList}
                            style={{ width: '100%' }}
                            open={true}
                            className="select-mail"
                            notFoundContent={locale.emptyText}
                            onChange={(value: string, event: any) =>
                                setSelectedRecordMail({
                                    label: event.label,
                                    value: value,
                                    flagTransfer: event.flagTransfer,
                                    flagDisableTransfer: event.flagDisableTransfer
                                })
                            }
                        />
                    </Col>
                </Flex>

                <Col span={3}>{renderTransferButton('one')}</Col>

                <Flex vertical style={{ width: '100%' }}>
                    <Flex align="center" gap={8}>
                        <div style={{ fontWeight: 500 }}>Employee Mailing List </div>
                    </Flex>
                    <Col style={{ margin: '16px 0px 12px 0px', backgroundColor: '#fff', padding: 'unset' }}>
                        <BaseSelect
                            options={employeeMailList}
                            style={{ width: '100%' }}
                            open={true}
                            className="select-mail"
                            notFoundContent={locale.emptyText}
                            onChange={(value: string, event: any) =>
                                setSelectedRecordEmployeeMail({
                                    label: event.label,
                                    value: value,
                                    flagTransfer: event.flagTransfer,
                                    flagDisableTransfer: event.flagDisableTransfer
                                })
                            }
                        />
                    </Col>
                </Flex>
            </Flex>
        </div>
    );

    const approvalSection = (
        <DetailInfo title="Approval">
            <Col span={12}>{renderRemoveMailingList()}</Col>
            <Col span={12}>
                <div className="pt-10 font-weight-500">Approval Note</div>
                <Form.Item name="approveNotes" className="pt-10">
                    <Input.TextArea placeholder="Enter note" className="text-area-item" />
                </Form.Item>
            </Col>
        </DetailInfo>
    );

    const handleSubmit = async (values: any) => {
        turnOnLoading();
        const strEmployeeMail = employeeMailList.map((item: any) => item.value).join(',');
        const strRemoveMail = removeMailList.map((item: any) => item.value).join(',');

        values = {
            ...values,
            employeeTransferId: Number(id),
            managerId: 0,
            action: 'Approve',
            transferNotes: dataDetail?.transferNotes,
            revokeNotes: dataDetail?.revokeNotes,
            disApproveNotes: dataDetail?.disApproveNotes,
            cancelNotes: dataDetail?.cancelNotes,
            employeeMaillingList: strEmployeeMail,
            removeMaillingList: strRemoveMail,
            revokeLabName: dataDetail?.revokeLabName,
            revokeWorkingRoomName: dataDetail?.revokeWorkingRoomName,
            revokeRestrictRoomName: dataDetail?.revokeRestrictRoomName,
            revokeConfidentialCabinetName: dataDetail?.revokeConfidentialCabinetName,
            revokeOther: dataDetail?.revokeOther
        };

        if (values) {
            const res = await employeeTransferService.updateTransfer(values, 'ApprovalTransferDetails');
            const { succeeded, message } = res;

            succeeded && navigation(pathnames.transferEmployee.main.path);
            showNotification(succeeded, message);
        }
        turnOffLoading();
    };

    useEffect(() => {
        const getDataEmployeeTransferDetail = async () => {
            try {
                const res = await employeeTransferService.getEmployeeTransferDetail(id);
                const { data, succeeded } = res;

                if (succeeded && data) {
                    setDataDetail(data);

                    const employeeMaillist =
                        (data.employeeMaillingList &&
                            data.employeeMaillingList.split(',')?.map((item: any) => ({
                                label: item,
                                value: item,
                                flagTransfer: '2',
                                flagDisableTransfer: 2
                            }))) ||
                        [];

                    setEmployeeMailList(employeeMaillist);

                    const removeMaillist = data.removeMaillingList
                        ? data.removeMaillingList.split(',')?.map((item: any) => ({
                              label: item,
                              value: item,
                              flagTransfer: '3',
                              flagDisableTransfer: 1
                          }))
                        : [];
                    setRemoveMailList(removeMaillist);

                    form.setFieldsValue({
                        grantLabName: data?.grantLabName,
                        grantWorkingRoomName: data?.grantWorkingRoomName,
                        grantRestrictRoomName: data?.grantRestrictRoomName,
                        grantConfidentialCabinetName: data?.grantConfidentialCabinetName,
                        grantOther: data?.grantOther,
                        approveNotes: data?.approveNotes
                    });
                }
            } catch (error) {
                showNotification(false, 'get detail employee transfer failed');
            }
        };

        getDataEmployeeTransferDetail();
    }, [id, form, showNotification]);

    return (
        <Spin spinning={isLoading}>
            <TransferEmployeeInfo
                breadcrumb={breadcrumbList}
                pageTitle="Transfer Approval"
                detailInfoSection={detailInfoSection}
                adminInfoSection={adminInfoSection}
                approvalSection={approvalSection}
                buttons={buttons}
                name="transfer_form_approval"
                handleSubmit={handleSubmit}
                form={form}
                className="employee-transfer__detail"
            />
        </Spin>
    );
};

export default EmployeeTransferApproval;
