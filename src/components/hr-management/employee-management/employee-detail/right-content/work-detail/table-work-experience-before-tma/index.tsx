import DialogCommon from '@/components/common/dialog/dialog-common/dialog-common';
import DialogHaveField from '@/components/common/dialog/dialog-have-field';
import DatePicker from '@/components/common/form/date-picker';
import FileUpload from '@/components/common/form/field-upload';
import BaseSelect from '@/components/common/form/select';
import ButtonsIcon from '@/components/common/table/buttons-icon';
import { renderBooleanStatus, renderWithFallback } from '@/components/common/table/render-data-table-common';
import TableHaveAdd from '@/components/common/table/table-add';
import BaseTag from '@/components/common/tag';
import employeeService from '@/services/hr-management/employee-management';
import { IField, IUploadFile } from '@/types/common';
import { IWorkingExperienceBeforeTMA } from '@/types/hr-management/employee-management';
import {
    filterNullProperties,
    formatDataTable,
    formatMappingKey,
    formatTimeMonthDayYear,
    generateUniqueId,
    handleUploadFile,
    statusMapping,
    validate1000Characters,
    validate500Characters
} from '@/utils/common';
import { ORG_UNITS, TIME_FORMAT } from '@/utils/constants';
import useGetNameFromUrl from '@/utils/hook/useGetNameFromUrl';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';
import icons from '@/utils/icons';
import { Checkbox, Form, Input } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export interface IWorkExperienceBeforeTMAProps<T> {
    dataProps?: T;
    joinDate: string;
    isReload?: object;
    setIsReload?: (params: object) => void;
    fullName?: string;
    moduleName?: string;
}

const TableWorkExperienceBeforeTMA = (props: IWorkExperienceBeforeTMAProps<IWorkingExperienceBeforeTMA[]>) => {
    const { dataProps, setIsReload, fullName, joinDate, moduleName } = props;
    const [form] = Form.useForm();
    const { id } = useParams();
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();
    const nameFromUrl = useGetNameFromUrl();

    // Permission
    const { havePermission } = usePermissions('WorkExperienceBeforeTMA', nameFromUrl);

    const [isShowModalAddWorkExperience, setIsShowModalAddWorkExperience] = useState<boolean>(false);
    const [changeFileUpload, setChangeFileUpload] = useState<boolean>(false);
    const [uploadFile, setUploadFile] = useState<IUploadFile[]>([]);
    const [fileLimit, setFileLimit] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);
    const [workingStatus, setWorkingStatus] = useState<DefaultOptionType[]>([]);
    const [isShowModalDelete, setIsShowModalDelete] = useState<boolean>(false);
    const [valueDelete, setValueDelete] = useState<IWorkingExperienceBeforeTMA>();
    const [valueEdit, setValueEdit] = useState<IWorkingExperienceBeforeTMA>();
    const joinDateDayjs = dayjs(joinDate, TIME_FORMAT.VN_DATE);

    // Title of dialog add and edit
    const titleDialog = valueEdit ? 'Edit New Work Experience Before TMA' : 'Add New Work Experience Before TMA';
    const contentDelete = (
        <>
            The work experience before TMA of <strong>{fullName}</strong> at Company <strong>{valueDelete?.company}</strong> from{' '}
            <strong>{valueDelete?.fromDate}</strong> to <strong>{valueDelete?.toDate}</strong> will be deleted. Are you sure you want to delete?
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
            fixed: 'left',
            width: 300,
            render: item => renderWithFallback(item, true)
        },
        {
            dataIndex: 'fromDate',
            key: 'fromDate',
            title: 'From',
            width: 150,
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'toDate',
            key: 'toDate',
            title: 'To',
            width: 150,
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'project',
            key: 'project',
            title: ORG_UNITS.Project,
            width: 200,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'position',
            key: 'position',
            title: 'Position',
            width: 200,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'statusName',
            key: 'statusName',
            title: 'Working Type',
            width: 200,
            render: item => {
                const statusConfig = statusMapping[formatMappingKey(item)];
                return <BaseTag {...statusConfig} statusName={item} />;
            }
        },
        {
            dataIndex: 'isContractor',
            key: 'isContractor',
            title: 'Contractor',
            align: 'center',
            width: 200,
            render: (item: boolean) => renderBooleanStatus(item, 'is-contractor')
        },
        {
            title: 'Action',
            width: 88,
            align: 'center',
            fixed: 'right',
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
            value: <Input placeholder="Enter project name" />,
            validation: [validate500Characters]
        },
        {
            name: 'position',
            label: 'Position',
            value: <Input placeholder="Enter position" />,
            validation: [validate500Characters]
        },
        {
            name: 'statusId',
            label: 'Working status',
            value: <BaseSelect options={workingStatus} placeholder="Select working status" />,
            validation: [{ required: true, message: 'Please enter the valid value' }]
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
        },
        {
            label: ' ',
            value: (
                <Form.Item name="isContractor" valuePropName="checked">
                    <Checkbox>Contractor</Checkbox>
                </Form.Item>
            )
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
            employmentId: valueEdit?.employmentId,
            employeeId: Number(id),
            file: undefined,
            fromDate: dayjs(data.fromDate).format(TIME_FORMAT.DATE),
            toDate: dayjs(data.toDate).format(TIME_FORMAT.DATE)
        };
    };

    const UploadFile = async (dataFormat: IWorkingExperienceBeforeTMA) => {
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

    // Handle add work experience before TMA
    const handleAddWorkExperience = async (data: IWorkingExperienceBeforeTMA) => {
        setIsShowModalAddWorkExperience(false);
        const dataFormat = filterNullProperties(formatWorkExperienceBeforeTMA(data));

        await UploadFile(dataFormat);

        try {
            turnOnLoading();
            const res = await employeeService.addWorkExperienceBeforeTmaEmployee(dataFormat, moduleName);
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
        setIsShowModalAddWorkExperience(false);
        const dataFormat = filterNullProperties(formatWorkExperienceBeforeTMA(data));

        await UploadFile(dataFormat);

        try {
            turnOnLoading();
            const res = await employeeService.updateWorkExperienceBeforeTmaEmployee(dataFormat, moduleName);
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
        setIsShowModalDelete(false);
        if (!valueDelete?.employmentId) return;

        try {
            turnOnLoading();
            const res = await employeeService.deleteWorkExperienceBeforeTmaEmployee(valueDelete?.employmentId, moduleName);
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

    useEffect(() => {
        const fetchData = async () => {
            const resWorkingStatus = await employeeService.getWorkingStatusEmployee(moduleName);
            const newWorkingStatusOptions = (resWorkingStatus?.data || [])?.map((item: IWorkingExperienceBeforeTMA) => {
                return {
                    label: item?.statusName,
                    value: item?.statusId
                };
            });
            setWorkingStatus(newWorkingStatusOptions);
        };

        havePermission('Add') && fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <TableHaveAdd
                title="Work Experience Before TMA"
                dataSource={formatDataTable(dataProps)}
                columns={columnsExperience}
                handleAdd={havePermission('Add') ? () => setIsShowModalAddWorkExperience(true) : undefined}
                tableScroll={{ x: 'max-content', y: 400 }}
                loading={isLoading}
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
        </>
    );
};

export default TableWorkExperienceBeforeTMA;
