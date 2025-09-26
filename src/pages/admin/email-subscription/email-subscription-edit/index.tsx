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
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const EditEmailSubscriptionPage = () => {
    const navigation = useNavigate();
    const { id = '' } = useParams();
    const [form] = Form.useForm();
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [isChecked, setIsChecked] = useState<boolean>();
    const [data, setData] = useState<IAdminEmailSubscription>();

    const pageTitle = 'Edit Email Subscription';

    const breadcrumbList: IDataBreadcrumb[] = [
        { title: pathnames.admin.main.name },
        { title: pathnames.admin.emailSubscription.main.name },
        { title: pathnames.admin.emailSubscription.detail.name }
    ];

    const goBack = () => {
        navigation(pathnames.admin.emailSubscription.detail.path + `/${id}`);
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

    useEffect(() => {
        const fetchData = async () => {
            turnOnLoading();
            try {
                const res = await emailSubscriptionService.getById(Number(id));
                const { data } = res;
                setIsChecked(data?.isActive);
                setData(data);
                form.setFieldsValue({
                    subscriptionName: data?.subscriptionName,
                    subscriptionEmail: data?.subscriptionEmail
                });
            } catch (error) {
                showNotification(false, 'Failed to fetch data');
            } finally {
                turnOffLoading();
            }
        };

        fetchData();
    }, [id, form, turnOnLoading, turnOffLoading, showNotification]);

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
            const dataFormat = filterNullProperties({
                ...values,
                subscriptionName: values.subscriptionName.trim(),
                isActive: isChecked,
                emailSubscriptionId: data?.emailSubscriptionId
            });
            const res = await emailSubscriptionService.updateEmailSubscription(dataFormat);
            const { succeeded, message } = res;

            succeeded && navigation(pathnames.admin.emailSubscription.detail.path + `/${id}`);

            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Update failed');
        } finally {
            turnOffLoading();
        }
    };

    return (
        <DetailContent>
            <Spin spinning={isLoading}>
                <Form form={form} name="edit_email_subscription_form" layout="vertical" requiredMark={RequiredMark} onFinish={handleSubmit}>
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

export default EditEmailSubscriptionPage;
