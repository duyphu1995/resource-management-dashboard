import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import DetailFields from '@/components/common/detail-management/detail-fields';
import DetailHeader from '@/components/common/detail-management/detail-header';
import DetailInfo from '@/components/common/detail-management/detail-info';
import DialogCommon from '@/components/common/dialog/dialog-common/dialog-common';
import RequiredMark from '@/components/common/form/required-mark';
import pathnames from '@/pathnames';
import healthTrackingService from '@/services/admin/health-tracking';
import { IAdminHealthTracking } from '@/types/admin';
import { IField } from '@/types/common';
import { validateEnterValidValue } from '@/utils/common';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';
import icons from '@/utils/icons';
import { ButtonProps, Form, Input, Spin } from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const breadcrumbItems: BreadcrumbItemType[] = [
    { title: pathnames.admin.main.name },
    { title: pathnames.admin.appendix.main.name },
    { title: pathnames.admin.appendix.employeeAppendix.main.name },
    {
        path: pathnames.admin.appendix.employeeAppendix.healthTracking.main.path,
        title: pathnames.admin.appendix.employeeAppendix.healthTracking.main.name
    },
    { title: pathnames.admin.appendix.employeeAppendix.healthTracking.edit.name }
];

const HealthTrackingEditPage = () => {
    const navigation = useNavigate();
    const { certificateId = '' } = useParams();
    const { havePermission } = usePermissions('EditHealthTrackingAppendix', 'HealthTracking');
    const [form] = Form.useForm();
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [loadingForm, setLoadingForm] = useState(false);
    const [warningData, setWarningData] = useState<IAdminHealthTracking | null>(null);
    const [showWarningDialog, setShowWarningDialog] = useState(false);

    const pageTitle = pathnames.admin.appendix.employeeAppendix.healthTracking.edit.name;
    const warningDialogTitle = `Can’t Edit`;

    const warningDialogContent = (
        <div style={{ width: 384 }}>
            There is a valid existing Certificate Type <strong>{warningData?.certificateName}</strong>. Can't edit a duplication Certificate Type.
        </div>
    );

    const onGoBack = () => navigation(pathnames.admin.appendix.employeeAppendix.healthTracking.detail.path + '/' + certificateId);

    const buttons: ButtonProps[] = [
        { children: 'Cancel', onClick: onGoBack },
        havePermission('Edit') && { type: 'primary', htmlType: 'submit', loading: loadingForm, children: 'Save' }
    ].filter(Boolean);

    // Fields
    const fields: IField[] = [
        {
            label: 'Certificate Type Name',
            name: 'certificateName',
            value: <Input placeholder="Enter certificate type name" />,
            validation: [validateEnterValidValue]
        }
    ];

    const onShowWarningDialog = (position: IAdminHealthTracking) => {
        setWarningData(position);
        setShowWarningDialog(true);
    };
    const onCloseWarningDialog = () => {
        setShowWarningDialog(false);
    };

    const onFinish = async (value: IAdminHealthTracking) => {
        try {
            setLoadingForm(true);
            const updatedData: IAdminHealthTracking = {
                certificateId: parseInt(certificateId),
                certificateName: value.certificateName?.trim()
            };

            const res = await healthTrackingService.update(updatedData);
            const { succeeded = false, message, errors } = res;

            if (succeeded) {
                onGoBack();
            } else if (errors?.some(error => error.FieldName === 'certificateName')) {
                onShowWarningDialog(updatedData);
                return;
            }
            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'An unexpected error occurred');
        } finally {
            setLoadingForm(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            turnOnLoading();
            const res = await healthTrackingService.getDetail(certificateId);
            const { data = null, succeeded = false } = res;

            if (succeeded && data) {
                const newFormData = {
                    certificateName: data.certificateName
                };

                form.setFieldsValue(newFormData);
            }
            turnOffLoading();
        };

        fetchData();
    }, [certificateId, form, navigation, turnOnLoading, turnOffLoading]);

    return (
        <DetailContent>
            <Spin spinning={isLoading} style={{ height: '100%' }}>
                <Form
                    form={form}
                    name="editNationalityForm"
                    requiredMark={RequiredMark}
                    layout="vertical"
                    onFinish={onFinish}
                    style={{ height: '100%' }}
                >
                    <BaseBreadcrumb dataItem={breadcrumbItems} />
                    <DetailHeader pageTitle={pageTitle} buttons={buttons} goBack={onGoBack} />

                    <DetailInfo>
                        <DetailFields data={fields} />
                    </DetailInfo>

                    <DialogCommon
                        title={warningDialogTitle}
                        icon={icons.dialog.warning}
                        content={warningDialogContent}
                        open={showWarningDialog}
                        onClose={onCloseWarningDialog}
                        buttonType="default-primary"
                        hiddenButtonLeft={true}
                        buttonRight="Close"
                        buttonRightClick={onCloseWarningDialog}
                    />
                </Form>
            </Spin>
        </DetailContent>
    );
};

export default HealthTrackingEditPage;
