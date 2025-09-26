import employeeService from '@/services/hr-management/employee-management';
import { downloadFile, formatSizeUnits } from '@/utils/common';
import { Alert, Button, Flex, Form, Modal, ModalProps, Progress } from 'antd';
import { AnyObject } from 'antd/es/_util/type';
import { UploadChangeParam, UploadFile } from 'antd/es/upload';
import Dragger from 'antd/es/upload/Dragger';
import { useEffect, useState } from 'react';
import BaseDivider from '../../divider';
import './dialog-import.scss';
import useLoading from '@/utils/hook/useLoading';

export interface IDialogImportProps<T> extends ModalProps {
    title: string;
    dataSource?: T[];
    open: boolean;
    onClose: () => void;
    onImport: (values: any) => Promise<void>;
}

const infoIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <g clipPath="url(#clip0_3058_319721)">
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.99967 1.83301C4.59392 1.83301 1.83301 4.59392 1.83301 7.99967C1.83301 11.4054 4.59392 14.1663 7.99967 14.1663C11.4054 14.1663 14.1663 11.4054 14.1663 7.99967C14.1663 4.59392 11.4054 1.83301 7.99967 1.83301ZM0.833008 7.99967C0.833008 4.04163 4.04163 0.833008 7.99967 0.833008C11.9577 0.833008 15.1663 4.04163 15.1663 7.99967C15.1663 11.9577 11.9577 15.1663 7.99967 15.1663C4.04163 15.1663 0.833008 11.9577 0.833008 7.99967ZM7.49967 5.33301C7.49967 5.05687 7.72353 4.83301 7.99967 4.83301H8.00634C8.28248 4.83301 8.50634 5.05687 8.50634 5.33301C8.50634 5.60915 8.28248 5.83301 8.00634 5.83301H7.99967C7.72353 5.83301 7.49967 5.60915 7.49967 5.33301ZM7.99967 7.49967C8.27582 7.49967 8.49967 7.72353 8.49967 7.99967V10.6663C8.49967 10.9425 8.27582 11.1663 7.99967 11.1663C7.72353 11.1663 7.49967 10.9425 7.49967 10.6663V7.99967C7.49967 7.72353 7.72353 7.49967 7.99967 7.49967Z"
                fill="#2A9AD6"
            />
        </g>
        <defs>
            <clipPath id="clip0_3058_319721">
                <rect width="16" height="16" fill="white" />
            </clipPath>
        </defs>
    </svg>
);

const DialogImport = <T extends AnyObject>(props: IDialogImportProps<T>) => {
    const { open, onClose, title, onImport, ...otherProps } = props;
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const handleOk = async (values: any) => {
        form.validateFields();
        turnOnLoading();
        await onImport(values);
        handleCancel();
        turnOffLoading();
    };

    const [form] = Form.useForm();
    const watchFile = Form.useWatch('file', form);

    const onRemoveFile = () => {
        form.setFieldValue('file', undefined);
    };

    const onChangeFile = (value: UploadChangeParam<UploadFile<any>>) => {
        const extension = value && value.file.name.split('.')?.[1];
        if (extension !== 'xlsx' && extension !== 'csv') {
            form.setFieldValue('file', undefined);
            form.submit();
            return;
        }

        form.setFieldValue('file', !value.fileList.length ? undefined : value.file);
        setPercentLoadingFile(0);
        setIsLoadingFile(true);
    };

    // Download template
    const handleDownloadTemplate = async () => {
        const res = await employeeService.downloadSkipperRecord('EmployeeImportTemplate.xlsx');

        downloadFile(res, 'EmployeeImportTemplate.xlsx');
    };

    const [percentLoadingFile, setPercentLoadingFile] = useState(0);
    const [isLoadingFile, setIsLoadingFile] = useState(false);

    useEffect(() => {
        const handleLoading = setTimeout(() => {
            if (open) {
                setPercentLoadingFile(percentLoadingFile + 10);

                if (percentLoadingFile >= 100) {
                    setIsLoadingFile(false);
                }
            }
        }, 100);

        return () => clearTimeout(handleLoading);
    }, [percentLoadingFile, isLoadingFile, open]);

    // Update field
    useEffect(() => {
        if (!open) {
            form.setFieldValue('file', undefined);
            setIsLoadingFile(false);
            setPercentLoadingFile(0);
        }
    }, [open, form]);

    const handleCancel = () => {
        form.resetFields();
        onClose();
    };

    return (
        <Modal
            open={open}
            closable={false}
            onCancel={handleCancel}
            centered
            className="dialog-import"
            title={title || 'Import'}
            footer={null}
            {...otherProps}
        >
            <Form form={form} onFinish={handleOk}>
                <BaseDivider margin="16px 0 16px 0" />
                <div className="alert-container">
                    <Alert
                        message={
                            <div>
                                If you don’t have template, you can download it{' '}
                                <a className="font-weight-600 color-text-primary" onClick={handleDownloadTemplate}>
                                    here
                                </a>
                            </div>
                        }
                        type="info"
                        showIcon
                        icon={infoIcon}
                    />
                </div>
                <div>
                    <Form.Item
                        name="file"
                        htmlFor=""
                        className="ant-form-item-file"
                        valuePropName="file"
                        rules={[{ required: true, message: 'File is invalid' }]}
                        hidden={watchFile}
                    >
                        <Dragger
                            name="file"
                            className="drop-and-drag-container"
                            maxCount={1}
                            showUploadList={false}
                            beforeUpload={() => false}
                            onChange={onChangeFile}
                        >
                            <div className="ant-upload-drag-icon">
                                <img src="/media/icons/upload-gray.svg" alt="upload" />
                            </div>
                            <div className="ant-upload-text">
                                <div>Drag and drop</div>
                                <div>
                                    or <a className="font-weight-600 color-text-primary">choose file</a>
                                </div>
                            </div>
                            <div className="ant-upload-hint">csv or xlsx</div>
                        </Dragger>
                    </Form.Item>

                    {isLoadingFile && (
                        <div className="dialog-import-file-loading-container">
                            <Progress
                                type="circle"
                                percent={percentLoadingFile}
                                strokeWidth={10}
                                size={133.34}
                                format={(percent = 0) => (
                                    <div className="dialog-import-file-loading">
                                        <div className="dialog-import-file-loading-percent">{percent}%</div>
                                        <div className="dialog-import-file-loading-message">{percent < 100 ? 'Loading...' : 'Done'}</div>
                                    </div>
                                )}
                            ></Progress>
                        </div>
                    )}

                    {watchFile && !isLoadingFile && (
                        <Flex gap={16} className="dialog-import-file">
                            <img src="/media/icons/file-gray.svg" className="dialog-import-file-icon" />
                            <div className="dialog-import-file-content">
                                <div className="dialog-import-file-name">{watchFile.name}</div>
                                <div className="dialog-import-file-size">{formatSizeUnits(watchFile.size)}</div>
                                <img src="/media/icons/close-gray.svg" className="dialog-import-file-close" onClick={onRemoveFile} />
                            </div>
                        </Flex>
                    )}
                </div>
                <BaseDivider margin="24px 0 16px 0" />

                {/* Footer */}
                <div key="link" className="dialog-import-footer-container">
                    <Button key="back" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button key="submit" htmlType="submit" type="primary" loading={isLoading} disabled={isLoadingFile}>
                        Import
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default DialogImport;
