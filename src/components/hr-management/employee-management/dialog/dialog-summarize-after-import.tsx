import DialogDefault from '@/components/common/dialog/default';
import BaseDivider from '@/components/common/divider';
import employeeService from '@/services/hr-management/employee-management';
import { downloadFile } from '@/utils/common';
import { Button } from 'antd';
import './dialog-summarize.scss';

interface DialogSummarizeAfterImportProps {
    open: boolean;
    onClose: () => void;
    dataSummarize: ISummarize;
}

export interface ISummarize {
    failedRecord: number;
    successRecord: number;
    failedRecordFileName: string;
}

const DialogSummarizeAfterImport = (props: DialogSummarizeAfterImportProps) => {
    const { open, onClose, dataSummarize, ...otherProps } = props;
    const totalSummarize = dataSummarize?.failedRecord + dataSummarize?.successRecord;

    const handleClickDownloadFile = async () => {
        const { failedRecordFileName } = dataSummarize;

        const res = await employeeService.downloadSkipperRecord(encodeURIComponent(failedRecordFileName));
        downloadFile(res, failedRecordFileName);
    };

    const renderContent = () => {
        return (
            <div>
                <div className="dialog-summarize-after-import">
                    <div className="dialog-summarize-after-import__content">
                        <div className="dialog-summarize-after-import__content__item">
                            <span>You’ve just imported employees with detail</span>
                        </div>
                        <div className="dialog-summarize-after-import__content__item ">
                            <span className="dot dot-green">Added: {dataSummarize?.successRecord + '/' + totalSummarize}</span>
                            <span className="dot dot-red">
                                Skipped:
                                {dataSummarize?.failedRecord + '/' + totalSummarize}
                            </span>
                        </div>

                        <div className="dialog-summarize-after-import__content__item">
                            <span>
                                Those skipped records may due to missing required field or incorrect format or duplicated with the existing employee’s
                                information. Please correct them and import again.
                            </span>
                        </div>
                        <div className="dialog-summarize-after-import__content__item">
                            <div className="dialog-summarize-after-import__content__item__download" onClick={handleClickDownloadFile}>
                                <img src="/media/icons/download.svg" alt="arrow-right.svg" />
                                <span>Download skipped records</span>
                            </div>
                        </div>
                        <BaseDivider margin="14px 0 0 0" />
                        <div className="dialog-summarize-after-import__content__item">
                            <Button type="primary" onClick={onClose}>
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <DialogDefault
            title="Summarize"
            isShow={open}
            onCancel={onClose}
            content={renderContent()}
            className="dialog-comment dialog-summarize-after-import"
            footer={null}
            {...otherProps}
        />
    );
};

export default DialogSummarizeAfterImport;
