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
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';
import icons from '@/utils/icons';
import { ButtonProps, Form, Input } from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const breadcrumbItems: BreadcrumbItemType[] = [
    { title: pathnames.admin.main.name },
    { title: pathnames.admin.appendix.main.name },
    { title: pathnames.admin.appendix.employeeAppendix.main.name },
    {
        href: pathnames.admin.appendix.employeeAppendix.terminationReason.main.path,
        title: pathnames.admin.appendix.employeeAppendix.terminationReason.main.name
    },
    { title: pathnames.admin.appendix.employeeAppendix.terminationReason.add.name }
];

const TerminationReasonAddPage = () => {
    const navigation = useNavigate();
    const { havePermission } = usePermissions('AddTerminationReasonAppendix', 'TerminationReason');
    const [form] = Form.useForm();
    const { showNotification } = useNotify();

    const [loadingForm, setLoadingForm] = useState(false);
    const [warningData, setWarningData] = useState<IAdminTerminationReason | null>(null);
    const [showWarningDialog, setShowWarningDialog] = useState(false);

    const warningDialogTitle = `Can’t create`;

    const warningDialogContent = (
        <div style={{ width: 384 }}>
            There is a valid existing Reason <strong>{warningData?.reasonName}</strong>. Can't create a duplication Reason
        </div>
    );

    const pageTitle = pathnames.admin.appendix.employeeAppendix.terminationReason.add.name;

    const onGoBack = () => navigation(pathnames.admin.appendix.employeeAppendix.terminationReason.main.path);

    const buttons: ButtonProps[] = [
        { children: 'Cancel', onClick: onGoBack },
        havePermission('Add') && { type: 'primary', htmlType: 'submit', loading: loadingForm, children: 'Save' }
    ].filter(Boolean);

    const onFinish = async (value: IAdminTerminationReason) => {
        try {
            setLoadingForm(true);
            const updatedData: IAdminTerminationReason = {
                reasonName: value.reasonName
            };

            const res = await terminationReasonService.add(updatedData);
            const { succeeded = false, message = '', errors } = res;

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

    const onShowWarningDialog = (position: IAdminTerminationReason) => {
        setWarningData(position);
        setShowWarningDialog(true);
    };
    const onCloseWarningDialog = () => {
        setShowWarningDialog(false);
    };

    const fields: IField[] = [
        {
            label: 'Reason Name',
            name: 'reasonName',
            value: <Input placeholder="Enter reason name" />,
            validation: [validateEnterValidValue]
        }
    ];

    return (
        <DetailContent>
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
        </DetailContent>
    );
};

export default TerminationReasonAddPage;
