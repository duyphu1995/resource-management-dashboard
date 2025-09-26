import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import DetailHeader from '@/components/common/detail-management/detail-header';
import DetailInfo from '@/components/common/detail-management/detail-info';
import RequiredMark from '@/components/common/form/required-mark';
import BaseToolTip from '@/components/common/tooltip';
import SectionFieldTransfer from '@/components/employee-transfer/employee-transfer-add/section-transfer information/section-field-transfer';
import SectionRemoveMailingList from '@/components/employee-transfer/employee-transfer-add/section-transfer information/section-remove-mailing-list';
import SectionTransferTo from '@/components/employee-transfer/employee-transfer-add/section-transfer information/section-transfer-to';
import pathnames from '@/pathnames';
import employeeTransferService from '@/services/transfer-employee';
import { IDataBreadcrumb } from '@/types/common';
import { IEmployeeInfo, IMailingList, ITransferEmployee } from '@/types/transfer-employee';
import { TIME_FORMAT } from '@/utils/constants';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import icons from '@/utils/icons';
import { ButtonProps, Col, Flex, Form, FormInstance, Input, Row, Spin } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './index.scss';

const AddEmployeeTransferPage = () => {
    const navigation = useNavigate();
    const { showNotification } = useNotify();
    const [form] = Form.useForm();
    const location = useLocation();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [isKeepHDD, setIsKeepHDD] = useState(false);
    const [employeeInfo, setEmployeeInfo] = useState<IEmployeeInfo | null>(null);
    const [employeeMailList, setEmployeeMailList] = useState<IMailingList[]>([]);
    const [removeMailList, setRemoveMailList] = useState<IMailingList[]>([]);
    const [checkedCustomer, setCheckedCustomer] = useState<any>({
        isSameCustomer: false,
        isDifferentCustomer: false
    });

    const pageTitle = 'Add New Transfer';
    const infoTooltipContent = (
        <BaseToolTip
            title="Click on this link to open New Transfer Guide page"
            icon={icons.infoTooltip.info_gray}
            onClick={() => window.open(pathnames.transferEmployee.transferGuide.path)}
        />
    );

    const breadcrumbList: IDataBreadcrumb[] = [
        { title: pathnames.home.name },
        { title: pathnames.transferEmployee.main.name, path: pathnames.transferEmployee.main.path },
        { title: pathnames.transferEmployee.add.name }
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
            children: 'Save'
        }
    ];

    // handle change employee

    const searchParams = new URLSearchParams(location.search);
    const badgeId = searchParams.get('badgeId');

    useEffect(() => {
        if (employeeInfo) {
            form.setFieldsValue({ transferOnBehalfOf: employeeInfo?.managerWorkEmail });
        }
    }, [employeeInfo, form]);

    const sectionAdminTicket = [
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

    const renderRow = (
        title: string,
        items: { label: string; tooltip: string; placeholder: string; name: string; required: boolean }[],
        form: FormInstance
    ) => (
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
                        <Form.Item name={item.name} rules={[{ required: item.required, message: 'Please enter valid value' }]}>
                            <Input placeholder={item.placeholder} onChange={e => form.setFieldsValue({ [item.name]: e.target.value })} />
                        </Form.Item>
                    </Col>
                </Row>
            ))}
        </div>
    );

    const handleSubmit = async (values: ITransferEmployee) => {
        turnOnLoading();
        //convert list mail from array to string
        const strEmployeeMail = employeeMailList.map((item: any) => item.value).join(',');
        const strRemoveMail = removeMailList.map((item: any) => item.value).join(',');
        const employeeId = employeeInfo?.employeeId;

        const checkTargetProject = await employeeTransferService.checkTargetProject(values.toProjectId);
        const { succeeded, message } = checkTargetProject;

        if (!succeeded) {
            form.setFields([{ name: 'toProjectId', errors: [message] }]);
            turnOffLoading();
            return;
        }

        //update values
        values = {
            ...values,
            transferOnBehalfOf: values.transferOnBehalfOf ?? employeeInfo?.managerWorkEmail,
            employeeId: employeeId ?? values.employeeId,
            fromLocation: employeeInfo?.employeeBuildingName,
            fromProjectId: employeeInfo?.projectId,
            transferDate: dayjs(values.transferDate).format(TIME_FORMAT.DATE),
            maillingList: strEmployeeMail,
            removeMaillingList: strRemoveMail,
            itActionNote: values?.itActionNote,
            isKeepHDD: values?.isKeepHDD || false,
            keepHDDReason: values?.keepHDDReason,
            isSameCustomer: checkedCustomer?.isSameCustomer,
            isDifferentCustomer: checkedCustomer?.isDifferentCustomer,
            revokeConfidentialCabinetName: values?.revokeConfidentialCabinetName,
            revokeOther: values?.revokeOther,
            grantConfidentialCabinetName: values?.grantConfidentialCabinetName,
            grantOther: values?.grantOther,
            transferNotes: values?.transferNotes,
            revokeNotes: values?.revokeNotes
        };

        if (values) {
            const res = await employeeTransferService.createNewTransfer(values);
            const { succeeded, message } = res;

            showNotification(succeeded, message);
            if (succeeded) {
                navigation(pathnames.transferEmployee.main.path);
            }
        }

        turnOffLoading();
    };

    // Set data employee info if transfer to group management
    useEffect(() => {
        const getInfoEmployee = async () => {
            const res = await employeeTransferService.getEmployeeInformation(badgeId);
            const { succeeded, data } = res;

            if (succeeded && data) {
                setEmployeeInfo(data[0]);
            }
        };

        badgeId && getInfoEmployee();
    }, [badgeId]);

    return (
        <DetailContent rootClassName="employee-transfer-add">
            <Spin spinning={isLoading}>
                <Form form={form} name="add_new_transfer_form" layout="vertical" requiredMark={RequiredMark} onFinish={handleSubmit}>
                    <BaseBreadcrumb dataItem={breadcrumbList} />
                    <DetailHeader pageTitle={pageTitle} infoTooltip={infoTooltipContent} buttons={buttons} goBack={goBack} />
                    <div className="box-content-container">
                        <DetailInfo title="Transfer information">
                            <SectionFieldTransfer employeeInfo={employeeInfo} setEmployeeInfo={setEmployeeInfo} />
                            <SectionTransferTo
                                checkedCustomer={checkedCustomer}
                                setCheckedCustomer={setCheckedCustomer}
                                isKeepHDD={isKeepHDD}
                                setIsKeepHDD={setIsKeepHDD}
                            />
                            <SectionRemoveMailingList
                                employeeInfo={employeeInfo}
                                employeeMailList={employeeMailList}
                                setEmployeeMailList={setEmployeeMailList}
                                removeMailList={removeMailList}
                                setRemoveMailList={setRemoveMailList}
                                turnOnLoading={turnOnLoading}
                                turnOffLoading={turnOffLoading}
                            />
                        </DetailInfo>

                        <DetailInfo title="Admin Ticket">
                            <Row gutter={[24, 24]}>
                                {sectionAdminTicket.map((section, index) => (
                                    <Col span={12} key={index}>
                                        {renderRow(section.title, section.items, form)}
                                    </Col>
                                ))}
                            </Row>
                        </DetailInfo>
                    </div>
                </Form>
            </Spin>
        </DetailContent>
    );
};

export default AddEmployeeTransferPage;
