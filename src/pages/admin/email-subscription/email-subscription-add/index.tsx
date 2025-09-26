import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import DetailFields from '@/components/common/detail-management/detail-fields';
import DetailHeader from '@/components/common/detail-management/detail-header';
import DetailInfo from '@/components/common/detail-management/detail-info';
import RequiredMark from '@/components/common/form/required-mark';
import pathnames from '@/pathnames';
import emailSubscriptionService from '@/services/admin/email-subscription';
import { IAdminEmailSubscription } from '@/types/admin';
import { IDataBreadcrumb, IField } from '@/types/common';
import { filterNullProperties, validateWorkEmail } from '@/utils/common';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import { ButtonProps, Form, Input, Spin, Switch } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AddEmailSubscriptionPage = () => {
    const navigation = useNavigate();
    const [form] = Form.useForm();
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const pageTitle = 'Add New Email Subscription';
    const [isChecked, setIsChecked] = useState<boolean>(true);

    const breadcrumbList: IDataBreadcrumb[] = [
        { title: pathnames.admin.main.name },
        { title: pathnames.admin.emailSubscription.main.name },
        { title: pathnames.admin.emailSubscription.add.name }
    ];

    const goBack = () => {
        navigation(pathnames.admin.emailSubscription.main.path);
    };

    const buttons: ButtonProps[] = [
        {
            onClick: goBack,
            children: 'Cancel'
        },
        {
            htmlType: 'submit',
            type: 'primary',
            children: 'Save'
        }
    ];

    const handleSwitchClick = (value: boolean) => {
        setIsChecked(value);
    };

    const emailSubscriptionCols: IField[] = [
        {
            name: 'subscriptionName',
            label: 'Name',
            value: <Input placeholder="Enter name" />,
            validation: [{ required: true, whitespace: true, message: 'Please enter Name' }]
        },
        {
            name: 'subscriptionEmail',
            label: 'Email',
            value: <Input placeholder="Enter email" />,
            validation: [{ required: true, validator: (_: any, value: string) => validateWorkEmail(value) }]
        },
        {
            label: 'Status',
            value: (
                <div className="container">
                    <Switch checked={isChecked} onClick={value => handleSwitchClick(value)} />
                </div>
            )
        }
    ];

    const handleSubmit = async (values: IAdminEmailSubscription) => {
        try {
            turnOnLoading();

            const dataFormat = filterNullProperties({ ...values, subscriptionName: values.subscriptionName.trim(), isActive: isChecked });
            const res = await emailSubscriptionService.addEmailSubscription(dataFormat);
            const { succeeded, errors, message } = res;

            succeeded && navigation(pathnames.admin.emailSubscription.main.path);
            errors && showNotification(false, errors[0].Message);
            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Add failed');
        } finally {
            turnOffLoading();
        }
    };

    return (
        <DetailContent>
            <Spin spinning={isLoading}>
                <Form form={form} name="add_email_subscription_form" layout="vertical" requiredMark={RequiredMark} onFinish={handleSubmit}>
                    <BaseBreadcrumb dataItem={breadcrumbList} />
                    <DetailHeader pageTitle={pageTitle} buttons={buttons} goBack={goBack} />
                    <DetailInfo>
                        <DetailFields data={emailSubscriptionCols} />
                    </DetailInfo>
                </Form>
            </Spin>
        </DetailContent>
    );
};

export default AddEmailSubscriptionPage;
