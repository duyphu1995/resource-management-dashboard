import { IDialogCommonProps } from '@/types/common';
import useLoading from '@/utils/hook/useLoading';
import icons from '@/utils/icons';
import { Button, Modal } from 'antd';
import './dialog-common.scss';

const DialogCommon = (props: IDialogCommonProps) => {
    const {
        open,
        onClose,
        title,
        content,
        icon,
        buttonType,
        buttonLeft,
        buttonRight,
        hiddenButtonLeft = false,
        hiddenButtonRight = false,
        buttonLeftClick,
        buttonRightClick,
        ...otherProps
    } = props;
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const handleOk = async () => {
        turnOnLoading();
        if (buttonRightClick) await buttonRightClick();
        turnOffLoading();
    };

    const handleCancel = () => {
        if (buttonLeftClick) buttonLeftClick();
    };

    // Define CSS classes for the left and right buttons based on the buttonType prop
    let classButtonRight: string;

    switch (buttonType) {
        case 'default-primary':
            classButtonRight = 'ant-btn-primary';
            break;
        case 'default-danger':
            classButtonRight = 'ant-btn-dangerous';
            break;
        default:
            classButtonRight = '';
            break;
    }

    return (
        <Modal
            open={open}
            closable={false}
            onCancel={onClose}
            centered
            className="dialog-common"
            footer={[
                <div key="link" className="dialog-common-footer-container">
                    {!hiddenButtonLeft && (
                        <Button key="back" onClick={handleCancel} disabled={isLoading}>
                            {buttonLeft || 'Cancel'}
                        </Button>
                    )}
                    {!hiddenButtonRight && (
                        <Button key="submit" loading={isLoading} onClick={handleOk} className={classButtonRight}>
                            {buttonRight || 'Delete'}
                        </Button>
                    )}
                </div>
            ]}
            {...otherProps}
        >
            <div className="icon-dialog-common">
                <img src={icon || icons.dialog.delete} alt="SVG Icon" />
            </div>
            <div className="content-dialog-common">
                <h1 className="content-dialog-common-title">{title}</h1>
                <div>{content}</div>
            </div>
        </Modal>
    );
};

export default DialogCommon;
