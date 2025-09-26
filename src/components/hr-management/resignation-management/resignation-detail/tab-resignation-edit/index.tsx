import DetailContent from '@/components/common/detail-management/detail-content';
import DetailFields from '@/components/common/detail-management/detail-fields';
import DetailHeader from '@/components/common/detail-management/detail-header';
import DetailInfo from '@/components/common/detail-management/detail-info';
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
    IResignation,
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
import { DefaultOptionType } from 'antd/es/select';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

dayjs.extend(isSameOrAfter);

export interface ITabResignationEditProps {
    isReload?: any;
}

const TabResignationEdit = (props: ITabResignationEditProps) => {
    const { isReload } = props;

    const { resignationFormId = '' } = useParams();
    const { showNotification } = useNotify();
    const [form] = Form.useForm();
    const navigation = useNavigate();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const pageTitle = pathnames.hrManagement.resignationManagement.edit.name;
    const [loadingForm, setLoadingForm] = useState(false);
    const [employeeInfo, setEmployeeInfo] = useState<IEmployee | null>(null);

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
            resignationFormId,
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

        const res = await resignationService.updateResignation(value);
        const { succeeded, message } = res;
        succeeded && navigation(pathnames.hrManagement.resignationManagement.detail.path + '/' + resignationFormId);
        showNotification(succeeded, message);
        setLoadingForm(false);
    };

    const handleBack = () => navigation(pathnames.hrManagement.resignationManagement.main.path);
    const handleCancel = () => navigation(pathnames.hrManagement.resignationManagement.detail.path + '/' + resignationFormId);

    const buttons: ButtonProps[] = [
        { onClick: handleCancel, children: 'Cancel' },
        { type: 'primary', htmlType: 'submit', loading: loadingForm, children: 'Save' }
    ];

    const addKeyForData = (data: any[] = []) => {
        return data.map((item, index) => ({ ...item, key: index }));
    };

    // Fetch resignation data
    const [allIndexes, setAllIndexes] = useState<IResignationIndexes | undefined>(undefined);

    // More information
    const [moreInfo, setMoreInfo] = useState<IResignationMoreInformation | null>();
    const [loadingMoreInfo, setLoadingMoreInfo] = useState(true);

    const fetchMoreInfo = async (employeeInfo: IEmployee | null | undefined) => {
        setLoadingMoreInfo(true);
        if (employeeInfo) {
            const res = await resignationService.getMoreInfo((employeeInfo?.employeeId || '0').toString());
            setMoreInfo(res.data);
        } else setMoreInfo(null);
        setLoadingMoreInfo(false);
    };

    const validateCancelledDate = (_: any, value: any) => {
        if (!disabledCancelledDate && !value) return Promise.reject(new Error('Please select valid value'));
        return Promise.resolve();
    };

    const [preStatusId, setPreStatusId] = useState<number>();
    const [disabledAttrition, setDisabledAttrition] = useState(true);
    const [disabledCancelledDate, setDisabledCancelledDate] = useState(true);
    const [dataResignation, setDataResignation] = useState<IResignation>();
    const [changedStatus, setChangedStatus] = useState(false);

    const watchStatusId = Form.useWatch('resignationStatusId', form);
    const watchReasonId = Form.useWatch('reasonId', form);
    const watchResignDate = Form.useWatch('resignDate', form);
    const statusResignation = allIndexes?.resignationStatuses?.find(item => item.statusId.toString() === watchStatusId.toString());

    const onChangeStatus = (value: any) => {
        setChangedStatus(!!value);
    };

    // Disable or enable cancelled date
    useEffect(() => {
        const resignationStatusId = form.getFieldValue('resignationStatusId');
        const isCancelledStatus = statusResignation?.statusName === 'Cancelled';

        let isDisableCancelledDate = false;

        if (!isCancelledStatus) {
            // Case 1: Status is not cancelled
            setPreStatusId(resignationStatusId);
            isDisableCancelledDate = true;
            form.setFieldValue('cancelledDate', undefined);
        } else if (!changedStatus) {
            // Case 2: Status is cancelled but not changed
            isDisableCancelledDate = true;
            form.setFieldValue('cancelledDate', dataResignation?.cancelledDate);
        } else {
            // Case 3: Status is cancelled and changed
            isDisableCancelledDate = preStatusId !== statusResignation?.statusId;
            form.setFieldValue('cancelledDate', dayjs());
        }

        setDisabledCancelledDate(isDisableCancelledDate);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [preStatusId, form]);

    // Disable or enable attrition
    useEffect(() => {
        setPreStatusId(parseInt(watchStatusId));
        const isAttrition = allIndexes?.reasonForLeave?.find(item => item.reasonId === watchReasonId)?.isAttrition;

        if (statusResignation?.statusName === 'Resigned') {
            form.setFieldValue('isAttrition', isAttrition);
            setDisabledAttrition(false);
        } else {
            form.setFieldValue('isAttrition', false);
            setDisabledAttrition(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watchReasonId, form, watchStatusId]);

    // This effect only runs on the initial load to enable fields when status is pending
    const [isDisableFields, setIsDisableFields] = useState({
        status: false,
        applyDate: false,
        resignDate: false,
        resignationType: false
    });
    useEffect(() => {
        const isAfterOrEqualToday = dayjs(watchResignDate).isSameOrAfter(dayjs(), 'day');
        if (dataResignation?.resignationStatusName === 'Pending') {
            setIsDisableFields({ status: false, applyDate: false, resignDate: false, resignationType: false });
        } else if (dataResignation?.resignationStatusName === 'Resigned' && isAfterOrEqualToday) {
            setIsDisableFields({ status: false, applyDate: true, resignDate: true, resignationType: true });
        } else {
            setIsDisableFields({ status: true, applyDate: true, resignDate: true, resignationType: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataResignation]);

    useEffect(() => {
        const isAfterOrEqualToday = dayjs(watchResignDate).isSameOrAfter(dayjs(), 'day');
        const newStatusOptions = statusOptions.filter(
            item => !(dataResignation?.resignationStatusName === 'Resigned' && isAfterOrEqualToday && item.label === 'Cancelled')
        );
        setStatusOptions(newStatusOptions);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watchResignDate]);

    // MODE: ADD, EDIT
    // Form options
    const [statusOptions, setStatusOptions] = useState<DefaultOptionType[]>([]);
    const [reasonOptions, setReasonOptions] = useState<DefaultOptionType[]>([]);
    const [typeOptions, setTypeOptions] = useState<DefaultOptionType[]>([]);

    const resignationUpdatedColumns: (IField | undefined)[] = [
        {
            label: 'Full Name',
            value: renderWithFallback(employeeInfo?.fullName)
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
            label: 'Status',
            name: 'resignationStatusId',
            value: (
                <BaseSelect
                    options={statusOptions}
                    placeholder="Select status"
                    searchPlaceholder="Search status"
                    disabled={isDisableFields.status}
                    onChange={onChangeStatus}
                />
            ),
            validation: [{ required: true, message: 'Please select valid value' }]
        },
        {
            label: 'Apply Date',
            name: 'applyDate',
            value: <DatePicker disabled={isDisableFields.applyDate} />,
            validation: [{ required: true, message: 'Please select valid value' }]
        },
        {
            label: 'Resign Date',
            name: 'resignDate',
            value: (
                <DatePicker
                    disabled={isDisableFields.resignDate}
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
            label: 'Cancelled Date',
            name: 'cancelledDate',
            value: <DatePicker disabled={disabledCancelledDate} />,
            validation: [{ validator: validateCancelledDate }]
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
            value: (
                <BaseSelect
                    placeholder="Select resignation type"
                    options={typeOptions}
                    searchPlaceholder="Search resignation type"
                    disabled={isDisableFields.resignationType}
                />
            ),
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
            value: <Checkbox disabled={disabledAttrition}>Attrition</Checkbox>
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

    useEffect(() => {
        const fetchAllIndexes = async (employeeInfo: IEmployee | null) => {
            const res = await resignationService.getAllIndexes();
            const { data } = res;

            const newStatusOptions = data?.resignationStatuses.map(item => ({
                label: item.statusName,
                value: item.statusId
            })) as DefaultOptionType[];

            const newReasonOptions = data?.reasonForLeave.map(item => ({ label: item.reasonName, value: item.reasonId })) as DefaultOptionType[];

            // Get resignation type options by employee type (official employee or informal employee)
            const newResignationOptions =
                data?.resignationTypes
                    ?.filter(item => item.isOfficialEmployee === employeeInfo?.isOfficialEmployee)
                    .map(item => ({ value: item.resignationTypeId, label: item.resignationTypeName })) || [];

            setAllIndexes(data);
            setStatusOptions(newStatusOptions);
            setReasonOptions(newReasonOptions);
            setTypeOptions(newResignationOptions);
        };

        const fetchDetail = async () => {
            try {
                const res = await resignationService.getDetail(resignationFormId.toString());
                const { succeeded, data: newData } = res;

                if (succeeded && newData) {
                    const newEmployeeInfo = {
                        employeeId: newData?.employeeId,
                        fullName: newData?.fullName,
                        badgeId: newData?.badgeId,
                        projectName: newData?.projectName,
                        workEmail: newData?.workEmail,
                        mobilePhone: newData?.mobilePhone,
                        isOfficialEmployee: newData?.isOfficialEmployee
                    } as IEmployee;

                    await fetchAllIndexes(newEmployeeInfo);
                    form.setFieldsValue({
                        resignationStatusId: newData?.resignationStatusId,
                        applyDate: newData?.applyDate ? dayjs(newData?.applyDate, TIME_FORMAT.VN_DATE) : null,
                        resignDate: newData?.resignDate ? dayjs(newData?.resignDate, TIME_FORMAT.VN_DATE) : null,
                        cancelledDate: newData?.cancelledDate ? dayjs(newData?.cancelledDate, TIME_FORMAT.VN_DATE) : null,
                        reasonId: newData?.reasonId,
                        resignationTypeId: newData?.resignationTypeId,
                        notes: newData?.notes,
                        isAttrition: newData?.isAttrition,
                        personalContact: newData?.personalContact,
                        mobilePhone: newData?.mobilePhone
                    });
                    setEmployeeInfo(newEmployeeInfo);
                    setDataResignation(newData);
                    await fetchMoreInfo(newEmployeeInfo);
                }
            } catch (error) {
                showNotification(false, 'Error fetching resignation detail');
            }
        };

        const fetchData = async () => {
            turnOnLoading();
            await fetchDetail();
            turnOffLoading();
        };

        fetchData();
    }, [resignationFormId, form, isReload, turnOnLoading, turnOffLoading, showNotification]);

    return (
        <Spin spinning={isLoading || loadingMoreInfo}>
            <DetailContent>
                <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={RequiredMark}>
                    <DetailHeader pageTitle={pageTitle} buttons={buttons} goBack={handleBack} />

                    <Flex gap={24} vertical>
                        {/* INFO */}
                        <DetailInfo title="Resignation information">
                            <DetailFields data={resignationUpdatedColumns} />
                        </DetailInfo>

                        {/* MORE INFO*/}
                        {moreInfo && (
                            <DetailInfo title="More Information">
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

export default TabResignationEdit;
