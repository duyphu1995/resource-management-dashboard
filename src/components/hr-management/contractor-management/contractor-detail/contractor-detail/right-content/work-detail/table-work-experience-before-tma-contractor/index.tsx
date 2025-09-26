import DialogCommon from '@/components/common/dialog/dialog-common/dialog-common';
import DialogHaveField from '@/components/common/dialog/dialog-have-field';
import DatePicker from '@/components/common/form/date-picker';
import FileUpload from '@/components/common/form/field-upload';
import ButtonsIcon from '@/components/common/table/buttons-icon';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import TableHaveAdd from '@/components/common/table/table-add';
import contractorService from '@/services/hr-management/contractor-management';
import { IField, IUploadFile } from '@/types/common';
import { IContractor } from '@/types/hr-management/contractor-management';
import { IWorkingExperienceBeforeTMA } from '@/types/hr-management/employee-management';
import {
    filterNullProperties,
    formatDataTable,
    formatTimeMonthDayYear,
    generateUniqueId,
    handleUploadFile,
    validate1000Characters,
    validate500Characters
} from '@/utils/common';
import { ORG_UNITS, TIME_FORMAT } from '@/utils/constants';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';
import icons from '@/utils/icons';
import { Form, Input, Spin } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useState } from 'react';

export interface IWorkExperienceBeforeTMAProps<T> {
    dataProps?: T;
    isReload?: object;
    setIsReload?: (params: object) => void;
    employments?: any;
}

const TableWorkExperienceBeforeTMAContractor = (props: IWorkExperienceBeforeTMAProps<IContractor>) => {
    const { dataProps, setIsReload, employments } = props;
    const { joinDate } = dataProps || {};

    const [form] = Form.useForm();
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();
    const { havePermission } = usePermissions('WorkExperienceBeforeTMA', 'ContractorManagement');

    const [isShowModalAddWorkExperience, setIsShowModalAddWorkExperience] = useState<boolean>(false);
    const [changeFileUpload, setChangeFileUpload] = useState<boolean>(false);
    const [uploadFile, setUploadFile] = useState<IUploadFile[]>([]);
    const [fileLimit, setFileLimit] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);
    const [isShowModalDelete, setIsShowModalDelete] = useState<boolean>(false);
    const [valueDelete, setValueDelete] = useState<IWorkingExperienceBeforeTMA>();
    const [valueEdit, setValueEdit] = useState<IWorkingExperienceBeforeTMA>();
    const joinDateDayjs = dayjs(joinDate, TIME_FORMAT.VN_DATE);

    // Title of dialog add and edit
    const titleDialog = 'Add New Work Experience Before TMA';
    const contentDelete = (
        <>
            The work experience before TMA of {dataProps?.fullName} at Company&nbsp;
            <strong>{valueDelete?.company}</strong>&nbsp; from <strong>{valueDelete?.fromDate}</strong> to <strong>{valueDelete?.toDate}</strong> will
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

    const columnsExperience: ColumnsType<IWorkingExperienceBeforeTMA> = [
        {
            dataIndex: 'company',
            key: 'company',
            title: 'Company',
            width: 200,
            render: (item: string) => renderWithFallback(item, true)
        },
        {
            dataIndex: 'fromDate',
            key: 'fromDate',
            title: 'From',
            width: 92,
            render: (item: string) => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'toDate',
            key: 'toDate',
            title: 'To',
            width: 92,
            render: (item: string) => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'project',
            key: 'project',
            title: ORG_UNITS.Project,
            width: 110,
            render: (item: string) => renderWithFallback(item)
        },
        {
            dataIndex: 'duties',
            key: 'duties',
            title: 'Duties',
            width: 98,
            render: (item: string) => renderWithFallback(item)
        },
        {
            dataIndex: 'position',
            key: 'position',
            title: 'Position',
            width: 98,
            render: (item: string) => renderWithFallback(item)
        },
        {
            title: 'Action',
            width: 44,
            align: 'center',
            render: (item: IWorkingExperienceBeforeTMA) => {
                // Delete health tracking
                const handleDelete = (item: IWorkingExperienceBeforeTMA) => {
                    setIsShowModalDelete(true);
                    setValueDelete(item);
                };
                // Edit health tracking
                const handleEdit = (item: IWorkingExperienceBeforeTMA) => {
                    // Set value for form
                    form.setFieldsValue({
                        company: item.company,
                        fromDate: item.fromDate ? dayjs(item.fromDate, TIME_FORMAT.VN_DATE) : undefined,
                        toDate: item.toDate ? dayjs(item.toDate, TIME_FORMAT.VN_DATE) : undefined,
                        project: item.project,
                        position: item.position,
                        statusId: item.statusId,
                        duties: item.duties,
                        projectDescription: item.projectDescription,
                        isContractor: item.isContractor
                    });

                    setValueEdit(item);
                    setUploadFile(item.attachmentName ? [{ name: item.attachmentName, attachment: item.attachment }] : []);
                    setIsShowModalAddWorkExperience(true);
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

    const handleFromDateChange = (date: dayjs.Dayjs) => {
        const toDateValue = form.getFieldValue('toDate');
        const errors = [];

        if (toDateValue && date) {
            if (date.isAfter(toDateValue)) {
                errors.push('To date cannot be earlier than From date');
            }
        }

        form.setFields([
            {
                name: 'toDate',
                errors
            }
        ]);
    };

    const handleValidateDate = (_: any, value: string) => {
        const fromDate = form.getFieldValue('fromDate');
        if (fromDate && value && dayjs(value).isBefore(dayjs(fromDate))) {
            return Promise.reject(new Error('To date cannot be earlier than From date'));
        }
        return Promise.resolve();
    };

    // Field add and edit work experience before TMA
    const fieldAddNewWorkExperience: IField[] = [
        {
            name: 'company',
            label: 'Company',
            value: <Input placeholder="Enter company" />,
            validation: [{ required: true, message: 'Please enter the valid value' }, validate500Characters]
        },
        {
            name: 'fromDate',
            label: 'From',
            value: <DatePicker onChange={handleFromDateChange} disabledDate={current => current.isAfter(joinDateDayjs.subtract(1, 'day'))} />,
            validation: [{ required: true, message: 'Please enter the valid value' }]
        },
        {
            name: 'toDate',
            label: 'To',
            value: <DatePicker disabledDate={current => current && current.isAfter(joinDateDayjs.subtract(1, 'day'))} />,
            validation: [{ required: true, message: 'Please enter the valid value' }, { validator: handleValidateDate }]
        },
        {
            name: 'project',
            label: ORG_UNITS.Project,
            value: <Input placeholder="Enter project" />,
            validation: [validate500Characters]
        },
        {
            name: 'position',
            label: 'Position',
            value: <Input placeholder="Enter position" />,
            validation: [validate500Characters]
        },
        {
            name: 'duties',
            label: 'Duties',
            value: <Input.TextArea placeholder="Enter duties" className="text-area-item" />,
            validation: [validate500Characters]
        },
        {
            name: 'projectDescription',
            label: 'Project Description',
            value: <Input.TextArea placeholder="Enter project description" className="text-area-item" />,
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
        setUploadFile([]);
        setValueEdit(undefined);
        setValueDelete(undefined);
        setChangeFileUpload(false);
    };

    const formatWorkExperienceBeforeTMA = (data: IWorkingExperienceBeforeTMA) => {
        return {
            ...data,
            employeeId: Number(dataProps?.employeeId),
            file: undefined,
            fromDate: dayjs(data.fromDate).format(TIME_FORMAT.DATE),
            toDate: dayjs(data.toDate).format(TIME_FORMAT.DATE)
        };
    };

    const UploadFile = async (dataFormat: IWorkingExperienceBeforeTMA) => {
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

    // Handle add work experience before TMA
    const handleAddWorkExperience = async (data: IWorkingExperienceBeforeTMA) => {
        setIsShowModalAddWorkExperience(false);
        const dataFormat = filterNullProperties(formatWorkExperienceBeforeTMA(data));

        await UploadFile(dataFormat);

        try {
            turnOnLoading();
            const res = await contractorService.addWorkingExperienceBeforeTMA(dataFormat);
            const { succeeded, message } = res;
            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Add work experience failed');
        } finally {
            turnOffLoading();
        }

        clearData();
        setIsReload?.({});
    };

    // Handle edit work experience before TMA
    const handleEditWorkExperience = async (data: IWorkingExperienceBeforeTMA) => {
        if (!valueEdit?.employmentId) return;

        setIsShowModalAddWorkExperience(false);
        const dataFormat = filterNullProperties(formatWorkExperienceBeforeTMA(data));

        await UploadFile(dataFormat);

        try {
            turnOnLoading();
            const res = await contractorService.updateWorkingExperienceBeforeTMA(valueEdit?.employmentId, dataFormat);
            const { succeeded, message } = res;
            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Edit work experience failed');
        } finally {
            turnOffLoading();
        }

        clearData();
        setIsReload?.({});
    };

    // Handle submit
    const handleSubmit = (data: IWorkingExperienceBeforeTMA) => {
        if (valueEdit) {
            handleEditWorkExperience(data);
        } else {
            handleAddWorkExperience(data);
        }
    };

    // Handle delete work experience before TMA
    const handleDeleteWorkExperience = async () => {
        if (!valueDelete?.employmentId) return;
        setIsShowModalDelete(false);

        try {
            turnOnLoading();
            const res = await contractorService.deleteWorkingExperienceBeforeTMA(valueDelete?.employmentId);
            const { succeeded, message } = res;
            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Delete work experience failed');
        } finally {
            turnOffLoading();
        }

        clearData();
        setIsReload?.({});
    };

    // Handle cancel submit
    const handleCancelSubmit = () => {
        setIsShowModalAddWorkExperience(false);
        clearData();
    };

    return (
        <Spin spinning={isLoading}>
            <TableHaveAdd
                title="Work Experience Before TMA"
                dataSource={formatDataTable(employments)}
                columns={columnsExperience}
                handleAdd={havePermission('Add') ? () => setIsShowModalAddWorkExperience(true) : undefined}
                disabled={dataProps?.isContractorDisabled}
            />
            {/* add and edit work experience before TMA */}
            <DialogHaveField
                form={form}
                title={titleDialog}
                isShow={isShowModalAddWorkExperience}
                onCancel={() => handleCancelSubmit()}
                data={fieldAddNewWorkExperience}
                handleSubmit={data => handleSubmit(data)}
            />
            {/* Dialog delete */}
            <DialogCommon
                open={isShowModalDelete}
                onClose={() => setIsShowModalDelete(false)}
                icon={icons.dialog.delete}
                title="Delete Work Experience Before TMA"
                content={contentDelete}
                buttonType="default-danger"
                buttonLeftClick={() => setIsShowModalDelete(false)}
                buttonRightClick={() => handleDeleteWorkExperience()}
            />
        </Spin>
    );
};

export default TableWorkExperienceBeforeTMAContractor;
