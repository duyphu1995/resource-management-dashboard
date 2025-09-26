import DialogCommon from '@/components/common/dialog/dialog-common/dialog-common';
import DialogHaveField from '@/components/common/dialog/dialog-have-field';
import DatePicker from '@/components/common/form/date-picker';
import FileUpload from '@/components/common/form/field-upload';
import BaseSelect from '@/components/common/form/select';
import ButtonsIcon from '@/components/common/table/buttons-icon';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import TableHaveAdd from '@/components/common/table/table-add';
import employeeService from '@/services/hr-management/employee-management';
import { IField, ITableHaveActionAddProps, IUploadFile } from '@/types/common';
import { IFilterOption } from '@/types/filter';
import { ICertificates } from '@/types/hr-management/employee-management';
import { filterNullProperties, formatDataTable, formatTimeMonthDayYear, generateUniqueId, handleUploadFile } from '@/utils/common';
import { TIME_FORMAT } from '@/utils/constants';
import useGetNameFromUrl from '@/utils/hook/useGetNameFromUrl';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';
import icons from '@/utils/icons';
import { Form } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const TableCertificate = (props: ITableHaveActionAddProps<ICertificates[]>) => {
    const { dataProps, setIsReload, moduleName } = props;

    const { id } = useParams();
    const [form] = Form.useForm();
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();
    const nameFromUrl = useGetNameFromUrl();

    // Permission
    const { havePermission } = usePermissions('Certificate', nameFromUrl);

    const [isShowModalAddCertificate, setIsShowModalAddCertificate] = useState<boolean>(false);
    const [valueDelete, setValueDelete] = useState<ICertificates>();
    const [valueEdit, setValueEdit] = useState<ICertificates>();
    const [uploadFile, setUploadFile] = useState<IUploadFile[]>([]);
    const [changeFileUpload, setChangeFileUpload] = useState<boolean>(false);
    const [fileLimit, setFileLimit] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);
    const [certificateTypeOptions, setCertificateTypeOptions] = useState<IFilterOption[]>([]);
    const [certificateNameOptions, setCertificateNameOptions] = useState<IFilterOption[]>([]);
    const [pendingCertificate, setPendingCertificate] = useState<ICertificates>();
    const [isShowModalDuplicate, setIsShowModalDuplicate] = useState<boolean>(false);
    const [isShowModalDelete, setIsShowModalDelete] = useState<boolean>(false);
    const [selectCertificateName, setSelectCertificateName] = useState<string>();
    const [selectCertificateTypeName, setSelectCertificateTypeName] = useState<string>();

    const titleDialog = valueEdit ? 'Edit Certification' : 'Add New Certificate';
    const contentDuplicate = (
        <>
            The Certification type <strong>{selectCertificateTypeName}</strong> has named <strong>{selectCertificateName}</strong> will be overridden.
            Are you sure you want to save?
        </>
    );
    const contentDelete = (
        <>
            The Certification type <strong>{valueDelete?.certificateTypeName}</strong> has named <strong>{valueDelete?.certificateName}</strong> will
            be deleted. Are you sure you want to delete ?
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

    //Certificate
    const columnsCertificate: ColumnsType<ICertificates> = [
        {
            dataIndex: 'certificateTypeName',
            key: 'certificateTypeName',
            title: 'Certificate Type',
            width: '25%',
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'certificateName',
            key: 'certificateName',
            title: 'Certificate Name',
            width: 'calc(35% - 88px)',
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'issueDate',
            key: 'issueDate',
            title: 'Issued Date',
            width: '20%',
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'expiryDate',
            key: 'expiryDate',
            title: 'Expiry Date',
            width: '20%',
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            key: 'action',
            title: 'Action',
            align: 'center',
            width: 88,
            render: (item: ICertificates) => {
                // Delete health tracking
                const handleDelete = (item: ICertificates) => {
                    setIsShowModalDelete(true);
                    setValueDelete(item);
                };
                // Edit health tracking
                const handleEdit = async (item: ICertificates) => {
                    form.setFieldsValue({
                        certificateTypeId: item.certificateTypeId,
                        certificateId: item.certificateId,
                        issueDate: item.issueDate ? dayjs(item.issueDate.toString(), TIME_FORMAT.VN_DATE) : undefined,
                        expiryDate: item.expiryDate ? dayjs(item.expiryDate.toString(), TIME_FORMAT.VN_DATE) : undefined
                    });

                    setSelectCertificateTypeName(item.certificateTypeName);
                    setUploadFile(item.attachmentName ? [{ name: item.attachmentName, attachment: item.attachment }] : []);
                    setValueEdit(item);
                    setIsShowModalAddCertificate(true);

                    const resCertificateName = await employeeService.getCertificateById(item.certificateTypeId, moduleName);
                    const newCertificateNameOptions = (resCertificateName.data || []).map((item: ICertificates) => ({
                        label: item.certificateName,
                        value: item.certificateId
                    }));
                    setCertificateNameOptions(newCertificateNameOptions);
                };

                return (
                    <ButtonsIcon
                        items={[
                            ...(havePermission('Edit')
                                ? [
                                      {
                                          icon: icons.tableAction.edit,
                                          onClick: () => handleEdit(item),
                                          tooltip: 'Edit'
                                      }
                                  ]
                                : []),
                            ...(havePermission('Delete')
                                ? [
                                      {
                                          icon: icons.tableAction.delete,
                                          onClick: () => handleDelete(item),
                                          tooltip: 'Delete'
                                      }
                                  ]
                                : [])
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
        form.validateFields(['file']);
    };

    // Handle change certificate type
    const handleChangeCertificateType = async (value: number, option: DefaultOptionType | DefaultOptionType[]) => {
        const resCertificateName = await employeeService.getCertificateById(value, moduleName);
        const newCertificateNameOptions = (resCertificateName.data || []).map((item: ICertificates) => ({
            label: item.certificateName,
            value: item.certificateId
        }));

        setCertificateNameOptions(newCertificateNameOptions);
        setSelectCertificateTypeName(String((option as DefaultOptionType)?.label));
        form.setFieldsValue({
            certificateId: null
        });
    };

    const disabledIssueDate = (current: Dayjs) => {
        const expiryDate = form.getFieldValue('expiryDate');
        return expiryDate && current >= expiryDate;
    };

    const disabledExpiryDate = (current: Dayjs) => {
        const issueDate = form.getFieldValue('issueDate');
        return issueDate && current <= issueDate;
    };

    // Field add and edit certificate
    const fieldAddNewCertificate: IField[] = [
        {
            name: 'certificateTypeId',
            label: 'Certificate Type',
            value: (
                <BaseSelect
                    options={certificateTypeOptions}
                    placeholder="Select certificate type"
                    onChange={(value, option) => handleChangeCertificateType(value, option)}
                />
            ),
            validation: [{ required: true, message: 'Please enter the valid value' }]
        },
        {
            name: 'certificateId',
            label: 'Certificate Name',
            value: (
                <BaseSelect
                    options={certificateNameOptions}
                    placeholder="Select certificate name"
                    onChange={(_, option) => {
                        setSelectCertificateName(String((option as DefaultOptionType).label));
                    }}
                />
            ),
            validation: [{ required: true, message: 'Please enter the valid value' }]
        },
        {
            name: 'issueDate',
            label: 'Issued Date',
            value: <DatePicker disabledDate={disabledIssueDate} />
        },
        {
            name: 'expiryDate',
            label: 'Expiry Date',
            value: <DatePicker disabledDate={disabledExpiryDate} />
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
                    validator: () => {
                        if (fileLimit) {
                            setError(true);
                            return Promise.reject(new Error('File size must be less than 4MB!'));
                        }
                        setError(false);
                        return Promise.resolve();
                    }
                }
            ]
        }
    ];

    const clearData = () => {
        form.resetFields();
        setValueEdit(undefined);
        setUploadFile([]);
        setCertificateNameOptions([]);
        setChangeFileUpload(false);
        setValueDelete(undefined);
        setPendingCertificate(undefined);
    };

    // Function format data Certificate
    const formatDataCertificate = (data: ICertificates) => {
        return {
            ...data,
            employeeCertificateId: valueEdit?.employeeCertificateId,
            employeeId: Number(id),
            issueDate: data.issueDate ? dayjs(data.issueDate).format(TIME_FORMAT.DATE) : '',
            expiryDate: data.expiryDate ? dayjs(data.expiryDate).format(TIME_FORMAT.DATE) : '',
            certificateId: Number(data.certificateId),
            file: undefined // remove file
        };
    };

    const UploadFile = async (dataFormat: ICertificates) => {
        try {
            turnOnLoading();
            const nameUploadFile = await handleUploadFile(uploadFile, changeFileUpload, employeeService.uploadFileEmployee, moduleName);
            nameUploadFile && (dataFormat.attachment = nameUploadFile);
        } catch (error) {
            showNotification(false, 'Upload file failed');
        } finally {
            turnOffLoading();
        }
    };

    // Handle add certificate
    const handleAddCertificate = async (data: ICertificates) => {
        setIsShowModalAddCertificate(false);
        const dataFormat = filterNullProperties(formatDataCertificate(data));

        // Check duplicate certificate
        const isDuplicate = dataProps?.some((item: ICertificates) => item.certificateId === dataFormat.certificateId);

        if (isDuplicate) {
            setPendingCertificate(dataFormat);
            setIsShowModalDuplicate(true);
            return;
        }

        await UploadFile(dataFormat);

        try {
            turnOnLoading();
            const res = await employeeService.addCertificateEmployee(dataFormat, moduleName);
            const { succeeded, message } = res;
            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Add certificate failed');
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
            if (pendingCertificate) {
                turnOnLoading();
                await UploadFile(pendingCertificate);
                if (valueEdit) {
                    const res = await employeeService.updateCertificateEmployee(pendingCertificate, moduleName);
                    const { succeeded, message } = res;
                    showNotification(succeeded, message);
                } else {
                    const res = await employeeService.addCertificateEmployee(pendingCertificate, moduleName);
                    const { succeeded, message } = res;
                    showNotification(succeeded, message);
                }
            }
        } catch (error) {
            showNotification(false, valueEdit ? 'Edit certificate failed' : 'Add certificate failed');
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

    // Handle edit certificate
    const handleEditCertificate = async (data: ICertificates) => {
        setIsShowModalAddCertificate(false);
        const dataFormat = filterNullProperties(formatDataCertificate(data));

        const isDuplicate = dataProps?.some(
            (item: ICertificates) => item.certificateId === dataFormat.certificateId && item.certificateId !== valueEdit?.certificateId
        );

        if (isDuplicate) {
            setPendingCertificate(dataFormat);
            setIsShowModalDuplicate(true);
            return;
        }

        await UploadFile(dataFormat);

        try {
            turnOnLoading();
            const res = await employeeService.updateCertificateEmployee(dataFormat, moduleName);
            const { succeeded, message } = res;
            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Edit certificate failed');
        } finally {
            turnOffLoading();
        }

        clearData();
        setIsReload?.({});
    };

    // Handle delete certificate
    const handleDeleteCertificate = async () => {
        setIsShowModalDelete(false);
        if (!valueDelete?.employeeCertificateId) return;

        try {
            turnOnLoading();
            const res = await employeeService.deleteCertificateEmployee(valueDelete?.employeeCertificateId, moduleName);
            const { succeeded, message } = res;
            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Delete certificate failed');
        } finally {
            turnOffLoading();
        }

        clearData();
        setIsReload?.({});
    };

    // Handle submit
    const handleSubmit = (data: ICertificates) => {
        if (valueEdit) {
            handleEditCertificate(data);
        } else {
            handleAddCertificate(data);
        }
    };

    // Handle cancel submit
    const handleCancelSubmit = () => {
        setIsShowModalAddCertificate(false);
        clearData();
    };

    // Get data option certificate type
    useEffect(() => {
        const fetchData = async () => {
            const resCertificateType = await employeeService.getCertificateTypeEmployee(moduleName);
            const newCertificateTypeOptions = (resCertificateType.data || []).map((item: ICertificates) => ({
                label: item.certificateTypeName,
                value: item.certificateTypeId
            }));

            setCertificateTypeOptions(newCertificateTypeOptions);
        };

        havePermission('Add') && fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <TableHaveAdd
                title="Certificate"
                dataSource={formatDataTable(dataProps)}
                columns={columnsCertificate}
                handleAdd={havePermission('Add') ? () => setIsShowModalAddCertificate(true) : undefined}
                loading={isLoading}
            />
            {/* Add and edit project dialog */}
            <DialogHaveField
                form={form}
                title={titleDialog}
                isShow={isShowModalAddCertificate}
                onCancel={() => handleCancelSubmit()}
                data={fieldAddNewCertificate}
                handleSubmit={data => handleSubmit(data)}
            />
            {/* Dialog save duplicate */}
            <DialogCommon
                open={isShowModalDuplicate}
                onClose={() => handleCancelModalDuplicate()}
                icon={icons.dialog.warning}
                title="Save Certificate"
                content={contentDuplicate}
                buttonType="default-primary"
                buttonLeftClick={() => handleCancelModalDuplicate()}
                buttonRightClick={() => handleSaveDuplicate()}
                buttonRight="Save"
            />
            {/* Dialog delete certificate */}
            <DialogCommon
                open={isShowModalDelete}
                onClose={() => setIsShowModalDelete(false)}
                icon={icons.dialog.delete}
                title="Delete Certificate"
                content={contentDelete}
                buttonType="default-danger"
                buttonLeftClick={() => setIsShowModalDelete(false)}
                buttonRightClick={() => handleDeleteCertificate()}
            />
        </>
    );
};

export default TableCertificate;
