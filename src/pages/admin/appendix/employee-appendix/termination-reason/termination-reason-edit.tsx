import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import DetailFields from '@/components/common/detail-management/detail-fields';
import DetailHeader from '@/components/common/detail-management/detail-header';
import DetailInfo from '@/components/common/detail-management/detail-info';
import DialogCommon from '@/components/common/dialog/dialog-common/dialog-common';
import RequiredMark from '@/components/common/form/required-mark';
import pathnames from '@/pathnames';
import terminationReasonService from '@/services/admin/termination-reason';
import { IAdminTerminationReason } from '@/types/admin';
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
        href: pathnames.admin.appendix.employeeAppendix.terminationReason.main.path,
        title: pathnames.admin.appendix.employeeAppendix.terminationReason.main.name
    },
    { title: pathnames.admin.appendix.employeeAppendix.terminationReason.edit.name }
];

const TerminationReasonEditPage = () => {
    const { reasonId = '' } = useParams();
    const { havePermission } = usePermissions('EditTerminationReasonAppendix', 'TerminationReason');
    const [form] = Form.useForm();
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [loadingForm, setLoadingForm] = useState(false);
    const [warningData, setWarningData] = useState<IAdminTerminationReason | null>(null);
    const [showWarningDialog, setShowWarningDialog] = useState(false);

    const warningDialogTitle = `Can’t Edit`;

    const warningDialogContent = (
        <div style={{ width: 384 }}>
            There is a valid existing Reason <strong>{warningData?.reasonName}</strong>. Can't edit a duplication Reason.
        </div>
    );

    const pageTitle = pathnames.admin.appendix.employeeAppendix.terminationReason.edit.name;

    const navigation = useNavigate();
    const onGoBack = () => navigation(pathnames.admin.appendix.employeeAppendix.terminationReason.detail.path + '/' + reasonId);

    const buttons: ButtonProps[] = [
        { children: 'Cancel', onClick: onGoBack },
        havePermission('Edit') && { type: 'primary', htmlType: 'submit', loading: loadingForm, children: 'Save' }
    ].filter(Boolean);

    // Fields
    const fields: IField[] = [
        {
            label: 'Reason Name',
            name: 'reasonName',
            value: <Input placeholder="Enter reason name" />,
            validation: [validateEnterValidValue]
        }
    ];

    const onFinish = async (value: IAdminTerminationReason) => {
        try {
            setLoadingForm(true);
            const updatedData: IAdminTerminationReason = {
                reasonId: parseInt(reasonId),
                reasonName: value.reasonName
            };

            const res = await terminationReasonService.update(updatedData);
            const { succeeded = false, message, errors } = res;

            if (succeeded) {
                onGoBack();
            } else if (errors?.some(error => error.FieldName === 'reasonName')) {
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
            try {
                const res = await terminationReasonService.getDetail(reasonId);
                const { data = null, succeeded = false } = res;

                if (succeeded && data) {
                    const newFormData = {
                        reasonName: data.reasonName
                    };

                    form.setFieldsValue(newFormData);
                }
            } catch (error) {
                showNotification(false, 'Error fetching termination reason detail');
            } finally {
                turnOffLoading();
            }
        };

        fetchData();
    }, [reasonId, form, turnOnLoading, turnOffLoading, showNotification]);

    const onShowWarningDialog = (position: IAdminTerminationReason) => {
        setWarningData(position);
        setShowWarningDialog(true);
    };
    const onCloseWarningDialog = () => {
        setShowWarningDialog(false);
    };

    return (
        <DetailContent>
            <Spin spinning={isLoading} style={{ height: '100%' }}>
                <Form form={form} name="positionForm" requiredMark={RequiredMark} layout="vertical" onFinish={onFinish} style={{ height: '100%' }}>
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

export default TerminationReasonEditPage;
