import { IInfoAttachment } from '@/types/common';
import { handleDownloadFileFromUrl } from '@/utils/common';
import icons from '@/utils/icons';
import { Button, Tooltip, Upload } from 'antd';
import { useEffect, useState } from 'react';
import ButtonsIcon from '../../table/buttons-icon';
import './index.scss';
import ClearIcon from '/media/icons/close-gray.svg';

interface IFileUploadProps {
    uploadFile: any[];
    fileLimit: boolean;
    error: boolean;
    propsUpload: any;
    handleClearFile: any;
    onChange?: any;
    keyId: number;
    infoAttachment?: IInfoAttachment;
}

const FileUpload = (props: IFileUploadProps) => {
    const { uploadFile, fileLimit, error, propsUpload, onChange, handleClearFile, keyId, infoAttachment } = props;
    const { attachmentName, attachmentUrl } = infoAttachment || {};

    const [tooltip, setTooltip] = useState<boolean>(false);

    // Set width for file name
    useEffect(() => {
        setTimeout(() => {
            const getFileNameElement = document.getElementById(`id-file-name-upload-${keyId}`);
            const getFleContainer = document.getElementById(`id-file-container-${keyId}`);
            const fileContainerWidth = getFleContainer?.offsetWidth;
            const fileNameElementWidth = getFileNameElement?.scrollWidth;

            if (fileContainerWidth && fileNameElementWidth) {
                setTooltip(fileNameElementWidth > fileContainerWidth);
            }
        }, 700);
    }, [uploadFile, keyId]);
    return (
        <div id={`id-upload-file-${keyId}`} className="upload-file-content">
            <Upload
                className="upload-file"
                key={keyId}
                itemRender={() => {
                    return (
                        <div id={`id-file-container-${keyId}`} className="upload-file__container">
                            {tooltip ? (
                                <Tooltip title={uploadFile[0]?.name}>
                                    <div id={`id-file-name-upload-${keyId}`} className="upload-file__name">
                                        {uploadFile[0]?.name}
                                    </div>
                                </Tooltip>
                            ) : (
                                <div id={`id-file-name-upload-${keyId}`} className="upload-file__name">
                                    {uploadFile[0]?.name}
                                </div>
                            )}

                            {uploadFile[0]?.name && (
                                <div className="upload-file__action">
                                    <img src={ClearIcon} alt="clear-file" className="clear-file-icon" onClick={handleClearFile} />
                                </div>
                            )}
                        </div>
                    );
                }}
                onChange={onChange}
                {...propsUpload}
            >
                <Button id={`id-button-choose-file-${keyId}`} className="btn--upload">
                    Choose file
                </Button>
            </Upload>
            {uploadFile.length === 0 && <span className="placeholder-upload-file">No file chosen</span>}
            {!fileLimit && !error && (
                <span className="upload-file__limit">
                    <p className="upload-file__limit-text">File size limit: 4MB</p>
                    {attachmentUrl && (
                        <ButtonsIcon
                            items={[
                                { icon: icons.tableAction.viewInternalLink, tooltip: 'View', link: attachmentUrl, target: '_blank' },
                                {
                                    icon: icons.tableAction.download,
                                    tooltip: 'Download',
                                    onClick: () => handleDownloadFileFromUrl(attachmentUrl, attachmentName)
                                }
                            ]}
                        />
                    )}
                </span>
            )}
        </div>
    );
};

export default FileUpload;
