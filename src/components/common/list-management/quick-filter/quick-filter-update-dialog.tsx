import { IQuickFilterData } from '@/types/quick-filter';
import useLoading from '@/utils/hook/useLoading';
import { Button, Form, Input, Modal } from 'antd';
import { useEffect } from 'react';
import FormItem from '../../form/form-item';
import RequiredMark from '../../form/required-mark';
import './quick-filter-update-dialog.scss';

export interface IQuickFilterUpdateDialogProps {
    open: boolean;
    onClose: () => void;
    data: IQuickFilterData | undefined;
    onCancel: () => void;
    onSave: (value: IQuickFilterData) => void;
}

const QuickFilterUpdateDialog = (props: IQuickFilterUpdateDialogProps) => {
    const { open, onClose, data, onCancel, onSave } = props;
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const title = data?.quickFilterId === undefined ? 'Add Quick Filter' : 'Rename quick filter';

    // Form
    const [form] = Form.useForm();

    // Update form data when data changed
    useEffect(() => {
        if (data) {
            form.resetFields();
            form.setFieldsValue(data);
        }
    }, [form, data]);

    // Handle click save
    const onClickSave = async (value: IQuickFilterData) => {
        value = {
            quickFilterId: data?.quickFilterId || undefined,
            quickFilterName: value.quickFilterName,
            quickFilterFields: data?.quickFilterFields || []
        } as IQuickFilterData;

        turnOnLoading();
        await onSave(value);
        turnOffLoading();
    };

    return (
        <Modal open={open} onCancel={onClose} closable={false} centered className="quick-filter-update-dialog" title={title} footer={null}>
            <Form name="quickFilterForm" requiredMark={RequiredMark} layout="vertical" form={form} onFinish={onClickSave}>
                <FormItem
                    label="Name Of Quick Filter"
                    htmlFor=""
                    name="quickFilterName"
                    rules={[{ required: true, message: 'Please enter the valid value' }]}
                >
                    <Input placeholder="Enter name of quick filter" />
                </FormItem>
                <div className="quick-filter-update-dialog-footer">
                    <Button disabled={isLoading} onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button htmlType="submit" loading={isLoading} type="primary">
                        Save
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default QuickFilterUpdateDialog;
