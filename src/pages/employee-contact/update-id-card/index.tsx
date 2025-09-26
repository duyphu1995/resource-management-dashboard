import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import DetailHeader from '@/components/common/detail-management/detail-header';
import DialogHaveField from '@/components/common/dialog/dialog-have-field';
import DatePicker from '@/components/common/form/date-picker';
import FileUpload from '@/components/common/form/field-upload';
import InputCommon from '@/components/common/form/input';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import pathnames from '@/pathnames';
import employeeService from '@/services/hr-management/employee-management';
import updateIdCardListService from '@/services/hr-management/update-id-card-list';
import { IUploadFile } from '@/types/common';
import { IUpdateIDCardList } from '@/types/hr-management/update-id-card-list';
import { filterNullProperties, formatDataTable, formatTimeMonthDayYear, generateUniqueId, handleUploadFile } from '@/utils/common';
import { TIME_FORMAT } from '@/utils/constants';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';
import { createSorter } from '@/utils/table';
import { Button, Flex, Form, Input, Spin } from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { ColumnType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const UpdateIdCard = () => {
    const [form] = Form.useForm();
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();
    const { havePermission } = usePermissions('UpdateIDCardList', 'UpdateIDCard');

    const [dataTable, setDataTable] = useState<IUpdateIDCardList[]>([]);
    const [isShowModal, setIsShowModal] = useState<boolean>(false);
    const [changeFileUpload, setChangeFileUpload] = useState<boolean>(false);
    const [fontFileLimit, setFontFileLimit] = useState<boolean>(false);
    const [backFileLimit, setBackFileLimit] = useState<boolean>(false);
    const [fontError, setFontError] = useState<boolean>(false);
    const [backError, setBackError] = useState<boolean>(false);
    const [uploadFontFile, setUploadFontFile] = useState<IUploadFile[]>([]);
    const [uploadBackFile, setUploadBackFile] = useState<IUploadFile[]>([]);

    const propsUploadFont = {
        name: 'fileFont',
        beforeUpload: (file: File) => {
            setUploadFontFile([file]);
            if (file.size > 1024 * 1024 * 4) {
                setFontFileLimit(true);
            } else {
                setFontFileLimit(false);
            }
            return false;
        },
        fileList: uploadFontFile,
        maxCount: 1
    };

    const propsUploadBack = {
        name: 'fileBack',
        beforeUpload: (file: File) => {
            setUploadBackFile([file]);
            if (file.size > 1024 * 1024 * 4) {
                setBackFileLimit(true);
            } else {
                setBackFileLimit(false);
            }
            return false;
        },
        fileList: uploadBackFile,
        maxCount: 1
    };

    const breadcrumbItems: BreadcrumbItemType[] = [
        { title: pathnames.employeeContact.main.name },
        {
            title: pathnames.employeeContact.updateIdCard.main.name
        }
    ];

    const [columns] = useState<ColumnType<IUpdateIDCardList>[]>([
        {
            dataIndex: 'idCardNo',
            title: 'ID Number',
            key: 'idCardNo',
            fixed: 'left',
            width: 150,
            sorter: createSorter('idCardNo', 'number'),
            render: (item: string) => renderWithFallback(item)
        },
        {
            dataIndex: 'idCardIssueDate',
            title: 'Issue Date',
            key: 'idCardIssueDate',
            width: 150,
            sorter: createSorter('idCardIssueDate', 'date'),
            render: (item: string) => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'idCardIssuePlace',
            title: 'Issue Place',
            key: 'idCardIssuePlace',
            width: 150,
            sorter: createSorter('idCardIssuePlace'),
            render: (item: string) => renderWithFallback(item)
        },
        {
            title: 'Font Side Image',
            dataIndex: 'idCardFontImageUrl',
            key: 'idCardFontImageUrl',
            width: 150,
            render: (idCardFontImageUrl: string) => (
                <Link to={idCardFontImageUrl} target="_blank" className="view-attachment underline">
                    View attachment
                </Link>
            )
        },
        {
            title: 'Back Side Image',
            dataIndex: 'idCardBackImageUrl',
            key: 'idCardBackImageUrl',
            width: 150,
            render: (idCardBackImageUrl: string) => (
                <Link to={idCardBackImageUrl} target="_blank" className="view-attachment underline">
                    View attachment
                </Link>
            )
        },
        {
            title: 'Submit On',
            dataIndex: 'submitOn',
            key: 'submitOn',
            width: 130,
            sorter: createSorter('submitOn', 'date'),
            render: (submitOn: string) => renderWithFallback(formatTimeMonthDayYear(submitOn))
        }
    ]);

    // Handle change file upload
    const onChangeFileUpload = (type: string) => {
        setChangeFileUpload(true);
        if (type === 'font') {
            setFontError(false);
            form.validateFields(['fileFont']);
        } else if (type === 'back') {
            setBackError(false);
            form.validateFields(['fileBack']);
        }
    };

    // Xử lý xóa tệp
    const handleClearFile = (type: string) => {
        if (type === 'font') {
            setUploadFontFile([]);
            form.validateFields(['fileFont']);
        } else if (type === 'back') {
            setUploadBackFile([]);
            form.validateFields(['fileBack']);
        }
        setBackFileLimit(false);
        setFontFileLimit(false);
    };

    const validatorFile = (fileLimit: boolean, setError: (error: boolean) => void, uploadFile: IUploadFile[]) => {
        return () => {
            if (fileLimit || uploadFile.length === 0) {
                setError(true);
                if (fileLimit) {
                    return Promise.reject(new Error('File size must be less than 4MB!'));
                } else {
                    return Promise.reject(new Error('Please choose the valid value'));
                }
            } else {
                setError(false);
                return Promise.resolve();
            }
        };
    };

    const fieldDialog = [
        {
            name: 'idCardNo',
            label: 'ID Number',
            value: <InputCommon placeholder="Enter ID number" typeInput="numbers-only" maxLength={20} />,
            validation: [{ required: true, message: 'Please enter valid value' }]
        },
        {
            name: 'idCardIssueDate',
            label: 'Issue Date',
            value: <DatePicker placeholder="Select issue date" />,
            validation: [{ required: true, message: 'Please select valid value' }]
        },
        {
            name: 'idCardIssuePlace',
            label: 'Issue Place',
            value: <Input placeholder="Enter issue place" />,
            validation: [{ required: true, message: 'Please enter valid value' }]
        },
        {
            name: 'fileFont',
            label: 'Font Side Image',
            value: (
                <FileUpload
                    keyId={generateUniqueId()}
                    propsUpload={propsUploadFont}
                    uploadFile={uploadFontFile}
                    fileLimit={fontFileLimit}
                    error={fontError}
                    onChange={() => onChangeFileUpload('font')}
                    handleClearFile={() => handleClearFile('font')}
                />
            ),
            validation: [
                {
                    required: true,
                    validator: validatorFile(fontFileLimit, setFontError, uploadFontFile)
                }
            ]
        },
        {
            name: 'fileBack',
            label: 'Back Side Image',
            value: (
                <FileUpload
                    keyId={generateUniqueId()}
                    propsUpload={propsUploadBack}
                    uploadFile={uploadBackFile}
                    fileLimit={backFileLimit}
                    error={backError}
                    onChange={() => onChangeFileUpload('back')}
                    handleClearFile={() => handleClearFile('back')}
                />
            ),
            validation: [
                {
                    required: true,
                    validator: validatorFile(backFileLimit, setBackError, uploadBackFile)
                }
            ]
        }
    ];
    const clearData = () => {
        form.resetFields();
        setUploadFontFile([]);
        setUploadBackFile([]);
        setFontFileLimit(false);
        setBackFileLimit(false);
        setFontError(false);
        setBackError(false);
    };

    const UploadFile = async (uploadFile: IUploadFile[], dataFormat: IUpdateIDCardList, type: string) => {
        try {
            turnOnLoading();
            const nameUploadFile = await handleUploadFile(uploadFile, changeFileUpload, employeeService.uploadFileEmployee, 'MyProfile');
            type === 'font' && nameUploadFile && (dataFormat.idCardFontImage = nameUploadFile);
            type === 'back' && nameUploadFile && (dataFormat.idCardBackImage = nameUploadFile);
        } catch (error) {
            showNotification(false, 'Upload file failed');
        } finally {
            turnOffLoading();
        }
    };

    const formatData = (data: IUpdateIDCardList) => {
        return {
            ...data,
            idCardIssueDate: dayjs(data.idCardIssueDate).format(TIME_FORMAT.DATE),
            // Remove file upload
            fileFont: undefined,
            fileBack: undefined
        };
    };

    const handleSubmit = async (data: any) => {
        setIsShowModal(false);
        const dataFormat = filterNullProperties(formatData(data));

        await UploadFile(uploadFontFile, dataFormat, 'font');
        await UploadFile(uploadBackFile, dataFormat, 'back');

        try {
            turnOnLoading();
            const response = await updateIdCardListService.createUpdateIdCard(dataFormat);
            const { succeeded, message } = response;

            if (succeeded) {
                setIsShowModal(false);
                fetchDataList();
            }

            showNotification(succeeded, message);
        } catch (error) {
            setIsShowModal(false);
        } finally {
            turnOffLoading();
        }

        clearData();
    };

    const handleCancelSubmit = () => {
        setIsShowModal(false);
        clearData();
    };

    const fetchDataList = async () => {
        try {
            turnOnLoading();
            const res = await updateIdCardListService.getAllListUser();
            const data = res.data || [];

            setDataTable(data);
        } catch (error) {
            setDataTable([]);
        } finally {
            turnOffLoading();
        }
    };

    useEffect(() => {
        fetchDataList();
    }, []);

    return (
        <DetailContent>
            <Spin spinning={isLoading}>
                <BaseBreadcrumb dataItem={breadcrumbItems} />
                <Flex justify="space-between">
                    <DetailHeader pageTitle="Update ID Card" />
                    {havePermission('Update') && (
                        <Button type="primary" onClick={() => setIsShowModal(true)}>
                            Update ID Card
                        </Button>
                    )}
                </Flex>
                <BaseTable columns={columns} dataSource={formatDataTable(dataTable)} loading={isLoading} />
                <DialogHaveField
                    form={form}
                    title="Update ID Card Information"
                    isShow={isShowModal}
                    onCancel={() => handleCancelSubmit()}
                    data={fieldDialog}
                    handleSubmit={data => handleSubmit(data)}
                />
            </Spin>
        </DetailContent>
    );
};

export default UpdateIdCard;
