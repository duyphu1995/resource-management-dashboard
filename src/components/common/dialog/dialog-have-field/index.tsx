import { Button, Form, FormInstance } from 'antd';
import BaseDivider from '../../divider';
import RequiredMark from '../../form/required-mark';
import DialogDefault from '../default';

interface IDialogAddCommonProps<T> {
    form: FormInstance;
    name?: string;
    title: string;
    isShow: boolean;
    onCancel: () => void;
    data: T[];
    handleSubmit: (data: any) => void;
    classRootName?: string;
    formItemClassName?: string;
}

const DialogHaveField = <T extends Record<string, any>>(props: IDialogAddCommonProps<T>) => {
    const { form, name, title, isShow, onCancel, handleSubmit, data, classRootName = 'w-1268', formItemClassName, ...otherProps } = props;

    // Submit form reset field
    const onFinish = (values: any) => {
        handleSubmit(values);
        form.resetFields();
    };

    // Reset form when close dialog
    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    const renderContent = () => (
        <Form form={form} name={name} onFinish={onFinish} requiredMark={RequiredMark}>
            <div className="dialog-information__container">
                {data.map((item: any, index: number) => {
                    const { name, label, value, validation, valuePropName } = item;

                    return (
                        <Form.Item
                            key={index}
                            name={name}
                            label={label}
                            htmlFor=""
                            rules={validation}
                            className={`dialog-information__item ${formItemClassName || ''}`}
                            valuePropName={valuePropName}
                        >
                            {value}
                        </Form.Item>
                    );
                })}
            </div>
            <BaseDivider margin="24px 0 16px 0" />
            <div className="dialog-edit__footer">
                <Button type="default" onClick={handleCancel} className="btn">
                    Cancel
                </Button>
                <Button type="primary" htmlType="submit" className="btn btn--submit">
                    Save
                </Button>
            </div>
        </Form>
    );

    return (
        <DialogDefault
            title={title}
            isShow={isShow}
            onCancel={handleCancel}
            content={renderContent()}
            className={`dialog-information ${classRootName}`}
            footer={null}
            {...otherProps}
        />
    );
};

export default DialogHaveField;
