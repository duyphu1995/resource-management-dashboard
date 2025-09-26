import DialogCommon from '@/components/common/dialog/dialog-common/dialog-common';
import DialogHaveField from '@/components/common/dialog/dialog-have-field';
import DatePicker from '@/components/common/form/date-picker';
import FileUpload from '@/components/common/form/field-upload';
import BaseSelect from '@/components/common/form/select';
import ButtonsIcon from '@/components/common/table/buttons-icon';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import TableHaveAdd from '@/components/common/table/table-add';
import contractorService from '@/services/hr-management/contractor-management';
import { IField, ITableHaveActionAddProps, IUploadFile } from '@/types/common';
import { IFilterOption } from '@/types/filter';
import { IContractor } from '@/types/hr-management/contractor-management';
import { IHealthTracking } from '@/types/hr-management/employee-management';
import {
    filterNullProperties,
    formatDataTable,
    formatTime,
    formatTimeMonthDayYear,
    generateUniqueId,
    handleUploadFile,
    validate1000Characters
} from '@/utils/common';
import { TIME_FORMAT } from '@/utils/constants';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';
import icons from '@/utils/icons';
import { Form, Input, Spin } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

const TableHealthTrackingContractor = (props: ITableHaveActionAddProps<IContractor>) => {
    const { dataProps, setIsReload, healthTrackings } = props;

    const [form] = Form.useForm();
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();
    const { havePermission } = usePermissions('HealthTracking', 'ContractorManagement');

    const [isShowModalAddHealthTracking, setIsShowModalAddHealthTracking] = useState<boolean>(false);
    const [healthTrackingOptions, setHealthTrackingOptions] = useState<IFilterOption[]>([]);
    const [uploadFile, setUploadFile] = useState<IUploadFile[]>([]);
    const [changeFileUpload, setChangeFileUpload] = useState<boolean>(false);
    const [isShowModalDelete, setIsShowModalDelete] = useState<boolean>(false);
    const [valueEdit, setValueEdit] = useState<IHealthTracking>();
    const [valueDelete, setValueDelete] = useState<IHealthTracking>();
    const [isShowModalDuplicate, setIsShowModalDuplicate] = useState<boolean>(false);
    const [pendingHealthTracking, setPendingHealthTracking] = useState<IHealthTracking>();
    const [selectedCertificateName, setSelectedCertificateName] = useState<string>();
    const [fileLimit, setFileLimit] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);

    const titleDialog = valueEdit ? 'Edit Health Tracking' : 'Add New Health Tracking';
    const contentDelete = (
        <>
            The Health tracking <strong>{valueDelete?.certificateType}</strong> - <strong>{valueDelete?.issueDate}</strong> will be deleted. Are you
            sure you want to delete?
        </>
    );
    const contentDuplicate = (
        <>
            The Health tracking <strong>{selectedCertificateName}</strong> -{' '}
            <strong>{dayjs(pendingHealthTracking?.issueDate).format(TIME_FORMAT.US_DATE)}</strong> will be overridden. Are you sure you want to save?
        </>
    );

    // Props upload file popup
    const propsUpload = {
        name: 'file',
        beforeUpload: (file: File) => {
            setUploadFile([file]);
            if (file.size > 1024 * 1024 * 4) {
                setFileLimit(true);
            } else {
                setFileLimit(false);
            }
            return false;
        },
        fileList: uploadFile,
        maxCount: 1
    };

    //Table Health tracking
    const columnsHealthTracking: ColumnsType<IHealthTracking> = [
        {
            dataIndex: 'certificateType',
            key: 'certificateType',
            title: 'Certificate Type',
            width: 252,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'issueDate',
            key: 'issueDate',
            title: 'Certificate Date',
            width: 128,
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'submitDate',
            key: 'submitOn',
            title: 'Submit On',
            width: 128,
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'attachmentName',
            key: 'attachmentName',
            title: 'Attachment',
            width: 138,
            render: item => renderWithFallback(item)
        },
        {
            key: 'action',
            title: 'Action',
            align: 'center',
            width: 44,
            render: (item: IHealthTracking) => {
                // Delete health tracking
                const handleDelete = (item: IHealthTracking) => {
                    setIsShowModalDelete(true);
                    setValueDelete(item);
                };
                // Edit health tracking
                const handleEdit = (item: IHealthTracking) => {
                    // Set value for form
                    form.setFieldsValue({
                        certificateId: item?.certificateId,
                        issueDate: item?.issueDate ? dayjs(item?.issueDate.toString(), TIME_FORMAT.VN_DATE) : undefined,
                        notes: item?.notes
                    });

                    setValueEdit(item);
                    setUploadFile(item.attachmentName ? [{ name: item.attachmentName, attachment: item.attachment }] : []);
                    setIsShowModalAddHealthTracking(true);
                };

                return (
                    <ButtonsIcon
                        items={[
                            {
                                icon: icons.tableAction.edit,
                                onClick: () => handleEdit(item),
                                disabled: dataProps?.isContractorDisabled,
                                tooltip: 'Edit'
                            },
                            {
                                icon: icons.tableAction.delete,
                                onClick: () => handleDelete(item),
                                disabled: dataProps?.isContractorDisabled,
                                tooltip: 'Delete'
                            }
                        ]}
                    />
                );
            }
        }
    ];

    // Handle change file upload
    const onChangeFileUpload = () => {
        setChangeFileUpload(true);
        // if fileLimit is true validate file size
        if (fileLimit) {
            form.validateFields(['file']);
        }
    };

    // Handle clear file
    const handleClearFile = () => {
        setUploadFile([]);
        setFileLimit(false);
        if (valueEdit) {
            setValueEdit({
                ...valueEdit,
                file: undefined,
                attachment: undefined
            });
        }
        form.validateFields(['file']);
    };

    // Add health tracking field
    const filedAddNewHealthTracking: IField[] = [
        {
            name: 'certificateId',
            label: 'Certificate Type',
            value: (
                <BaseSelect
                    options={healthTrackingOptions}
                    placeholder="Select certificate type"
                    onChange={(_, option) => {
                        setSelectedCertificateName(String((option as DefaultOptionType).label));
                    }}
                />
            ),
            validation: [{ required: true, message: 'Please enter the valid value' }]
        },
        {
            name: 'issueDate',
            label: 'Certificate Date',
            value: <DatePicker />,
            validation: [{ required: true, message: 'Please enter the valid value' }]
        },
        {
            name: 'notes',
            label: 'More Details',
            value: <Input placeholder="Enter more details" />,
            validation: [validate1000Characters]
        },
        {
            name: 'file',
            label: 'Attachment',
            value: (
                <FileUpload
                    keyId={generateUniqueId()}
                    propsUpload={propsUpload}
                    uploadFile={uploadFile}
                    fileLimit={fileLimit}
                    error={error}
                    onChange={onChangeFileUpload}
                    handleClearFile={handleClearFile}
                    infoAttachment={valueEdit}
                />
            ),
            validation: [
                {
                    required: true,
                    validator: () => {
                        if (fileLimit || uploadFile.length === 0) {
                            setError(true);
                            if (fileLimit) {
                                return Promise.reject(new Error('File size must be less than 4MB!'));
                            } else {
                                return Promise.reject(new Error('Please enter the valid value'));
                            }
                        } else {
                            setError(false);
                            return Promise.resolve();
                        }
                    }
                }
            ]
        }
    ];

    const clearData = () => {
        setUploadFile([]);
        setValueEdit(undefined);
        setValueDelete(undefined);
        setChangeFileUpload(false);
    };

    // Function format data table health tracking
    const formatHealthTrackingData = (data: IHealthTracking) => {
        const { certificateId, issueDate } = data;

        return {
            ...data,
            employeeCertificateId: valueEdit?.employeeCertificateId,
            employeeId: props.dataProps?.employeeId,
            certificateId: certificateId,
            issueDate: issueDate ? formatTime(issueDate) : undefined,
            file: undefined // Remove file upload
        };
    };

    const UploadFile = async (dataFormat: IHealthTracking) => {
        try {
            turnOnLoading();
            const nameUploadFile = await handleUploadFile(uploadFile, changeFileUpload, contractorService.uploadFile);
            nameUploadFile && (dataFormat.attachment = nameUploadFile);
        } catch (error) {
            showNotification(false, 'Upload file failed');
        } finally {
            turnOffLoading();
        }
    };

    // Handle add health tracking
    const handleAddHealthTracking = async (data: IHealthTracking) => {
        setIsShowModalAddHealthTracking(false);
        const dataFormat = filterNullProperties(formatHealthTrackingData(data));

        // Check duplicate
        const isDuplicate = healthTrackings?.some(
            (item: IHealthTracking) =>
                item.certificateId === dataFormat.certificateId && item.issueDate === dayjs(dataFormat.issueDate).format(TIME_FORMAT.VN_DATE)
        );

        if (isDuplicate) {
            setPendingHealthTracking(dataFormat);
            setIsShowModalDuplicate(true);
            return;
        }

        await UploadFile(dataFormat);

        try {
            turnOnLoading();
            const res = await contractorService.addHealthTrackingContractor(dataFormat);
            const { succeeded, message } = res;
            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Add health tracking failed');
        } finally {
            turnOffLoading();
        }

        clearData();
        setIsReload?.({});
    };

    // Handle save duplicate
    const handleSaveDuplicate = async () => {
        setIsShowModalDuplicate(false);

        try {
            turnOnLoading();
            if (pendingHealthTracking) {
                await UploadFile(pendingHealthTracking);
                if (valueEdit) {
                    const res = await contractorService.updateHealthTrackingContractor(pendingHealthTracking);
                    const { succeeded, message } = res;
                    showNotification(succeeded, message);
                } else {
                    const res = await contractorService.addHealthTrackingContractor(pendingHealthTracking);
                    const { succeeded, message } = res;
                    showNotification(succeeded, message);
                }
            }
        } catch (error) {
            showNotification(false, valueEdit ? 'Edit healthTracking failed' : 'Add healthTracking failed');
        } finally {
            turnOffLoading();
        }

        clearData();
        setIsReload?.({});
    };

    // Handle cancel modal duplicate
    const handleCancelModalDuplicate = () => {
        setIsShowModalDuplicate(false);
        clearData();
    };

    // Handle edit health tracking
    const handleEditHealthTracking = async (data: IHealthTracking) => {
        setIsShowModalAddHealthTracking(false);
        const dataFormat = filterNullProperties(formatHealthTrackingData(data));

        const isDuplicate = healthTrackings?.some(
            (item: IHealthTracking) =>
                item.certificateId === dataFormat.certificateId &&
                item.issueDate === dayjs(dataFormat.issueDate).format(TIME_FORMAT.VN_DATE) &&
                item.employeeCertificateId !== valueEdit?.employeeCertificateId
        );

        if (isDuplicate) {
            setPendingHealthTracking(dataFormat);
            setIsShowModalDuplicate(true);
            return;
        }

        await UploadFile(dataFormat);

        try {
            turnOnLoading();
            const res = await contractorService.updateHealthTrackingContractor(dataFormat);
            const { succeeded, message } = res;
            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Edit health tracking failed');
        } finally {
            turnOffLoading();
        }

        clearData();
        setIsReload?.({});
    };

    // Handle submit add and edit health tracking
    const handleSubmit = (data: IHealthTracking) => {
        if (valueEdit) {
            handleEditHealthTracking(data);
        } else {
            handleAddHealthTracking(data);
        }
    };

    // Handle cancel submit health tracking
    const handleCancelSubmit = () => {
        setIsShowModalAddHealthTracking(false);
        setError(false);
        clearData();
    };

    // Handle delete health tracking
    const handleDeleteHealthTracking = async () => {
        setIsShowModalDelete(false);
        if (!valueDelete?.employeeCertificateId) return;

        try {
            turnOnLoading();
            const res = await contractorService.deleteHealthTrackingContractor(valueDelete?.employeeCertificateId);
            const { succeeded, message } = res;
            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Delete health tracking failed');
        } finally {
            turnOffLoading();
        }

        clearData();
        setIsReload?.({});
    };

    // Get data option health tracking
    useEffect(() => {
        const fetchData = async () => {
            try {
                turnOnLoading();
                const resHealthTracking = await contractorService.getHealthTrackingContractor();
                const newHealthTrackingOptions = (resHealthTracking.data || []).map((item: IHealthTracking) => {
                    return { label: item.certificateName, value: item.certificateId };
                });

                setHealthTrackingOptions(newHealthTrackingOptions);
            } catch (error) {
                showNotification(false, 'Get health tracking failed');
            } finally {
                turnOffLoading();
            }
        };

        fetchData();
    }, [turnOnLoading, turnOffLoading, showNotification]);

    return (
        <Spin spinning={isLoading}>
            <TableHaveAdd
                title="Health Tracking"
                dataSource={formatDataTable(healthTrackings)}
                columns={columnsHealthTracking}
                handleAdd={havePermission('Add') ? () => setIsShowModalAddHealthTracking(true) : undefined}
                disabled={dataProps?.isContractorDisabled}
            />
            {/* Add and edit health tracking dialog */}
            <DialogHaveField
                form={form}
                title={titleDialog}
                isShow={isShowModalAddHealthTracking}
                onCancel={() => handleCancelSubmit()}
                data={filedAddNewHealthTracking}
                handleSubmit={data => handleSubmit(data)}
            />
            {/* Dialog save duplicate health tracking */}
            <DialogCommon
                open={isShowModalDuplicate}
                onClose={() => handleCancelModalDuplicate()}
                icon={icons.dialog.warning}
                title="Save Health Tracking"
                content={contentDuplicate}
                buttonType="default-primary"
                buttonLeftClick={() => handleCancelModalDuplicate()}
                buttonRightClick={() => handleSaveDuplicate()}
                buttonRight="Save"
            />
            {/* Dialog delete health tracking */}
            <DialogCommon
                open={isShowModalDelete}
                onClose={() => setIsShowModalDelete(false)}
                icon={icons.dialog.delete}
                title="Delete Healthy Tracking"
                content={contentDelete}
                buttonType="default-danger"
                buttonLeftClick={() => setIsShowModalDelete(false)}
                buttonRightClick={() => handleDeleteHealthTracking()}
            />
        </Spin>
    );
};

export default TableHealthTrackingContractor;
