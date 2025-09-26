import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import DetailFields from '@/components/common/detail-management/detail-fields';
import DetailHeader from '@/components/common/detail-management/detail-header';
import DetailInfo from '@/components/common/detail-management/detail-info';
import { EmployeeSelect } from '@/components/common/employee-select';
import DatePicker from '@/components/common/form/date-picker';
import InputCommon from '@/components/common/form/input';
import RequiredMark from '@/components/common/form/required-mark';
import BaseSelect from '@/components/common/form/select';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import TableHaveAdd from '@/components/common/table/table-add';
import pathnames from '@/pathnames';
import resignationService from '@/services/hr-management/resignation-management';
import { IField } from '@/types/common';
import { IEmployee } from '@/types/hr-management/employee-management';
import {
    IResignationCancelled,
    IResignationEmployeeCommitment,
    IResignationEmployeeContract,
    IResignationEmployeeOnsiteHistory,
    IResignationEmployeeProject,
    IResignationEmployeeTemporaryLeave,
    IResignationIndexes,
    IResignationMoreInformation
} from '@/types/hr-management/resignation-management';
import { validate1000Characters, validate500Characters } from '@/utils/common';
import { ORG_UNITS, TIME_FORMAT } from '@/utils/constants';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import { ButtonProps, Checkbox, Flex, Form, Input, Spin } from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { DefaultOptionType } from 'antd/es/select';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ResignationAddPage = () => {
    const navigation = useNavigate();
    const [form] = Form.useForm();
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [loadingForm, setLoadingForm] = useState(false);
    const [employeeInfo, setEmployeeInfo] = useState<IEmployee | null>();

    const pageTitle = pathnames.hrManagement.resignationManagement.add.name;

    const breadcrumbItems: BreadcrumbItemType[] = [
        { title: pathnames.hrManagement.main.name },
        {
            title: pathnames.hrManagement.resignationManagement.main.name,
            path: pathnames.hrManagement.resignationManagement.main.path
        },
        { title: pathnames.hrManagement.resignationManagement.add.name }
    ];

    // Update detail data and more info when employee info changed
    useEffect(() => {
        const fetchMoreInfo = async () => {
            if (employeeInfo) {
                const res = await resignationService.getMoreInfo((employeeInfo.employeeId || '0').toString());
                setMoreInfo(res.data);
            } else setMoreInfo(null);
        };

        fetchMoreInfo();
    }, [employeeInfo]);

    const onFinish = async (value: any) => {
        setLoadingForm(true);

        // Handle value
        const employeeId = employeeInfo?.employeeId;
        const { reasonId, resignationTypeId, resignationStatusId, isAttrition, personalContact, mobilePhone, notes } = value;

        let { applyDate, resignDate, cancelledDate } = value;
        if (applyDate) applyDate = value.applyDate.format(TIME_FORMAT.DATE);
        if (resignDate) resignDate = value.resignDate.format(TIME_FORMAT.DATE);
        if (cancelledDate) cancelledDate = value.cancelledDate.format(TIME_FORMAT.DATE);

        value = {
            employeeId,
            reasonId,
            resignationTypeId,
            resignationStatusId,
            applyDate,
            resignDate,
            cancelledDate,
            isAttrition,
            personalContact,
            mobilePhone,
            notes
        };

        const res = await resignationService.addNewResignation(value);
        const { succeeded, message } = res;

        succeeded && navigation(pathnames.hrManagement.resignationManagement.main.path);
        showNotification(succeeded, message);
        setLoadingForm(false);
    };

    const handleBack = () => navigation(pathnames.hrManagement.resignationManagement.main.path);
    const handleCancel = () => navigation(pathnames.hrManagement.resignationManagement.main.path);

    const buttons: ButtonProps[] = [
        { onClick: handleCancel, children: 'Cancel' },
        { type: 'primary', htmlType: 'submit', loading: loadingForm, children: 'Save' }
    ];

    const addKeyForData = (data: any[] = []) => {
        return data.map((item, index) => ({ ...item, key: index }));
    };

    // Fetch resignation data
    const [allIndexes, setAllIndexes] = useState<IResignationIndexes | undefined>(undefined);
    useEffect(() => {
        const fetchAllIndexes = async () => {
            turnOnLoading();
            const res = await resignationService.getAllIndexes();
            const { succeeded = false, data = null } = res;

            if (succeeded && data) {
                const newReasonOptions = data?.reasonForLeave.map(item => ({ label: item.reasonName, value: item.reasonId })) as DefaultOptionType[];

                setAllIndexes(data);
                setReasonOptions(newReasonOptions);
            }
            turnOffLoading();
        };

        fetchAllIndexes();
    }, [turnOnLoading, turnOffLoading]);

    // More information
    const [moreInfo, setMoreInfo] = useState<IResignationMoreInformation | null>();

    // Employee Id changed => Update Resignation options
    useEffect(() => {
        if (allIndexes && employeeInfo) {
            // Update resignation type options by employee type (official employee or informal employee)
            const newResignationOptions =
                allIndexes?.resignationTypes
                    ?.filter(item => item.isOfficialEmployee === employeeInfo?.isOfficialEmployee)
                    .map(item => ({ value: item.resignationTypeId, label: item.resignationTypeName })) || [];
            setTypeOptions(newResignationOptions);

            // If current resignationTypeId invalid then remove current value
            const resignationTypeId = form.getFieldValue('resignationTypeId');
            if (newResignationOptions.findIndex(option => option.value === resignationTypeId) < 0) form.setFieldValue('resignationTypeId', null);
        }
    }, [form, employeeInfo, allIndexes]);

    // Resign date changed => Update status options
    const watchResignDate: dayjs.Dayjs = Form.useWatch('resignDate', form);
    useEffect(() => {
        if (watchResignDate) {
            const now = dayjs(dayjs().format(TIME_FORMAT.DATE));
            const resignDate = dayjs(watchResignDate.format(TIME_FORMAT.DATE));
            let newStatusOptions = allIndexes?.resignationStatuses?.map(item => ({ value: item.statusId, label: item.statusName })) || [];

            // If now is greater than resign date then hide Resigned option
            if (now < resignDate) {
                newStatusOptions = newStatusOptions.filter(item => item.label !== 'Resigned');

                // Check current status valid
                const resignationStatusId = form.getFieldValue('resignationStatusId');

                // If resignationStatusId is't exists in status options then auto select the first option
                if (!newStatusOptions.find(item => item.value === resignationStatusId))
                    form.setFieldValue('resignationStatusId', newStatusOptions?.[0]?.value || null);
            }
        }
    }, [watchResignDate, allIndexes, form]);

    // Form options
    const [reasonOptions, setReasonOptions] = useState<DefaultOptionType[]>([]);
    const [typeOptions, setTypeOptions] = useState<DefaultOptionType[]>([]);

    const resignationUpdatedColumns: (IField | undefined)[] = [
        {
            label: 'Full Name',
            name: 'employeeId',
            value: <EmployeeSelect width={'100%'} getAPI={resignationService.getEmployeeInformation} onSelectedEmployee={setEmployeeInfo} />,
            validation: [{ required: true, message: 'Please enter valid value' }]
        },
        {
            label: 'Badge ID',
            value: renderWithFallback(employeeInfo?.badgeId)
        },
        {
            label: ORG_UNITS.Project,
            value: renderWithFallback(employeeInfo?.projectName)
        },
        {
            label: 'Apply Date',
            name: 'applyDate',
            value: <DatePicker />,
            initValue: dayjs(),
            validation: [{ required: true, message: 'Please select valid value' }]
        },
        {
            label: 'Resign Date',
            name: 'resignDate',
            value: (
                <DatePicker
                    disabledDate={current => {
                        const applyDate = form.getFieldValue('applyDate');
                        // Disable dates that are before or equal to applyDate
                        return applyDate && current.isSameOrBefore(applyDate, 'day');
                    }}
                />
            ),
            validation: [{ required: true, message: 'Please select valid value' }]
        },
        {
            label: 'Reason',
            name: 'reasonId',
            value: <BaseSelect placeholder="Select reason" options={reasonOptions} searchPlaceholder="Search reason" />,
            validation: [{ required: true, message: 'Please select valid value' }]
        },
        {
            label: 'Resignation Type',
            name: 'resignationTypeId',
            required: true,
            value: <BaseSelect placeholder="Select resignation type" options={typeOptions} searchPlaceholder="Search resignation type" />,
            validation: [{ required: true, message: 'Please select valid value' }]
        },
        {
            label: 'Personal Contact',
            name: 'personalContact',
            value: <Input placeholder="Enter personal contact" />,
            validation: [validate500Characters]
        },
        {
            label: 'Mobile Phone',
            name: 'mobilePhone',
            value: <InputCommon placeholder="Enter mobile phone" typeInput="phone-number" />,
            validation: [validate500Characters]
        },
        {
            label: ' ',
            name: 'isAttrition',
            valuePropName: 'checked',
            value: <Checkbox disabled>Attrition</Checkbox>
        },
        {
            label: 'Note',
            name: 'notes',
            value: <Input.TextArea placeholder="Enter note" className="text-area-item" />,
            validation: [validate1000Characters]
        }
    ];

    // More information table columns
    const projectColumns: ColumnsType<IResignationEmployeeProject> = [
        {
            key: 'projectName',
            title: ORG_UNITS.Project,
            width: 240,
            render: (record: IResignationEmployeeProject) => renderWithFallback(record.projectName)
        },
        {
            key: 'dgName',
            title: ORG_UNITS.DG,
            width: 160,
            render: (record: IResignationEmployeeProject) => renderWithFallback(record.dgName)
        },
        {
            key: 'dcName',
            title: ORG_UNITS.DC,
            width: 160,
            render: (record: IResignationEmployeeProject) => renderWithFallback(record.dcName)
        },
        {
            key: 'startDate',
            title: 'Join Date',
            width: 160,
            render: (record: IResignationEmployeeProject) => renderWithFallback(record.startDate)
        },
        {
            key: 'endDate',
            title: 'Leave Date',
            width: 160,
            render: (record: IResignationEmployeeProject) => renderWithFallback(record.endDate)
        },
        {
            key: 'managerName',
            title: 'Manager',
            width: 294,
            render: (record: IResignationEmployeeProject) => renderWithFallback(record.managerName)
        }
    ];

    const onsiteColumns: ColumnsType<IResignationEmployeeOnsiteHistory> = [
        {
            key: 'projectName',
            title: ORG_UNITS.Project,
            width: 300,
            render: (record: IResignationEmployeeOnsiteHistory) => renderWithFallback(record.projectName)
        },
        {
            key: 'countryName',
            title: 'Country',
            width: 160,
            render: (record: IResignationEmployeeOnsiteHistory) => renderWithFallback(record.countryName)
        },
        {
            key: 'cityName',
            title: 'City',
            width: 160,
            render: (record: IResignationEmployeeOnsiteHistory) => renderWithFallback(record.cityName)
        },
        {
            key: 'customer',
            title: 'Customer',
            width: 160,
            render: (record: IResignationEmployeeOnsiteHistory) => renderWithFallback(record.customer)
        },
        {
            key: 'visaTypeName',
            title: 'Visa Type',
            width: 160,
            render: (record: IResignationEmployeeOnsiteHistory) => renderWithFallback(record.visaTypeName)
        },
        {
            key: 'flightDeparture',
            title: 'Flight Departure',
            width: 160,
            render: (record: IResignationEmployeeOnsiteHistory) => renderWithFallback(record.flightDeparture)
        },
        {
            key: 'actualEndDate',
            title: 'Actual End Date',
            width: 160,
            render: (record: IResignationEmployeeOnsiteHistory) => renderWithFallback(record.actualEndDate)
        }
    ];

    const brokenCommitmentColumns: ColumnsType<IResignationEmployeeCommitment> = [
        {
            key: 'commitmentName',
            title: 'Commitment Type',
            width: 300,
            render: (record: IResignationEmployeeCommitment) => renderWithFallback(record.commitmentName)
        },
        {
            key: 'signedDate',
            title: 'Signed Date',
            width: 160,
            render: (record: IResignationEmployeeCommitment) => renderWithFallback(record.signedDate)
        },
        {
            key: 'fromDate',
            title: 'From',
            width: 160,
            render: (record: IResignationEmployeeCommitment) => renderWithFallback(record.fromDate)
        },
        {
            key: 'toDate',
            title: 'To',
            width: 160,
            render: (record: IResignationEmployeeCommitment) => renderWithFallback(record.toDate)
        },
        {
            key: 'costFee',
            title: 'Fee',
            width: 160,
            render: (record: IResignationEmployeeCommitment) => renderWithFallback(record.costFee)
        },
        {
            key: 'notes',
            title: 'Note',
            width: 234,
            render: (record: IResignationEmployeeCommitment) => renderWithFallback(record.notes)
        }
    ];

    const workingStatusColumns: ColumnsType<IResignationEmployeeTemporaryLeave> = [
        {
            key: 'statusName',
            title: 'Working Status',
            width: 294,
            render: (record: IResignationEmployeeTemporaryLeave) => renderWithFallback(record.statusName)
        },
        {
            key: 'projectName',
            title: ORG_UNITS.Project,
            width: 294,
            render: (record: IResignationEmployeeTemporaryLeave) => renderWithFallback(record.projectName)
        },
        {
            key: 'effort',
            title: 'Effort',
            width: 294,
            render: (record: IResignationEmployeeTemporaryLeave) => renderWithFallback(record.effort + '%')
        },
        {
            key: 'startDate',
            title: 'Start Date',
            width: 294,
            render: (record: IResignationEmployeeTemporaryLeave) => renderWithFallback(record.startDate)
        },
        {
            key: 'endDate',
            title: 'End Date',
            width: 294,
            render: (record: IResignationEmployeeTemporaryLeave) => renderWithFallback(record.endDate)
        },
        {
            key: 'actualEndDate',
            title: 'Actual End Date',
            width: 160,
            render: (record: IResignationEmployeeTemporaryLeave) => renderWithFallback(record.actualEndDate)
        }
    ];

    const cancelledColumns: ColumnsType<IResignationCancelled> = [
        {
            key: 'projectName',
            title: ORG_UNITS.Project,
            width: 240,
            render: (record: IResignationCancelled) => renderWithFallback(record.projectName)
        },
        {
            key: 'dgName',
            title: ORG_UNITS.DG,
            width: 160,
            render: (record: IResignationCancelled) => renderWithFallback(record.dgName)
        },
        {
            key: 'dcName',
            title: ORG_UNITS.DC,
            width: 160,
            render: (record: IResignationCancelled) => renderWithFallback(record.dcName)
        },
        {
            key: 'appliedDate',
            title: 'Applied Date',
            width: 160,
            render: (record: IResignationCancelled) => renderWithFallback(record.applyDate)
        },
        {
            key: 'cancelledDate',
            title: 'Cancelled Date',
            width: 160,
            render: (record: IResignationCancelled) => renderWithFallback(record.cancelledDate)
        },
        {
            key: 'reasonName',
            title: 'Reason',
            width: 294,
            render: (record: IResignationCancelled) => renderWithFallback(record.reasonName)
        }
    ];

    const contractColumns: ColumnsType<IResignationEmployeeContract> = [
        {
            key: 'contractTypeName',
            title: 'Contract Type',
            width: 294,
            render: (record: IResignationEmployeeContract) => renderWithFallback(record.contractTypeName)
        },
        {
            key: 'fromDate',
            title: 'Start Date',
            width: 220,
            render: (record: IResignationEmployeeContract) => renderWithFallback(record.fromDate)
        },
        {
            key: 'toDate',
            title: 'End Date',
            width: 220,
            render: (record: IResignationEmployeeContract) => renderWithFallback(record.toDate)
        },
        {
            key: 'signOrder',
            title: 'Sign Order',
            width: 220,
            render: (record: IResignationEmployeeContract) => renderWithFallback(record.signOrder)
        },
        {
            key: 'renewApprovalStatusName',
            title: 'Renew Approval',
            width: 220,
            render: (record: IResignationEmployeeContract) => renderWithFallback(record.renewApprovalStatusName)
        }
    ];

    return (
        <Spin spinning={isLoading}>
            <DetailContent>
                <BaseBreadcrumb dataItem={breadcrumbItems} />
                <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={RequiredMark}>
                    <DetailHeader pageTitle={pageTitle} buttons={buttons} goBack={handleBack} />

                    <Flex gap={24} vertical>
                        {/* INFO */}
                        <DetailInfo title="Resignation information">
                            <DetailFields data={resignationUpdatedColumns} />
                        </DetailInfo>

                        {/* MORE INFO*/}
                        {moreInfo && (
                            <DetailInfo title="More information">
                                {moreInfo?.employeeProjects && (
                                    <TableHaveAdd
                                        title="On-going Project"
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
                                    <TableHaveAdd
                                        title="Contract"
                                        dataSource={addKeyForData(moreInfo?.employeeContracts)}
                                        columns={contractColumns}
                                    />
                                )}
                            </DetailInfo>
                        )}
                    </Flex>
                </Form>
            </DetailContent>
        </Spin>
    );
};

export default ResignationAddPage;
