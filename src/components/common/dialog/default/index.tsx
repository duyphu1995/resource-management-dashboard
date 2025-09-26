import { Modal, ModalProps } from 'antd';
import { ReactNode } from 'react';
import './index.scss';

interface IDialogDefault extends ModalProps {
    title: string;
    isShow: boolean;
    className?: string;
    content: ReactNode;
    onSubmit?: () => void;
    loading?: boolean;
}

const DialogDefault = (props: IDialogDefault) => {
    const { title, isShow, className: classNameProp, onSubmit, content, centered = true, ...otherProps } = props;
    let className = 'dialog-default';
    if (classNameProp) className += ' ' + classNameProp;

    return (
        <Modal centered={centered} title={title} open={isShow} onOk={onSubmit} className={className} closable={false} {...otherProps}>
            {content}
        </Modal>
    );
};

export default DialogDefault;
