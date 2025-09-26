import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import DetailFields from '@/components/common/detail-management/detail-fields';
import DetailHeader from '@/components/common/detail-management/detail-header';
import DetailInfo from '@/components/common/detail-management/detail-info';
import DialogCommon from '@/components/common/dialog/dialog-common/dialog-common';
import RequiredMark from '@/components/common/form/required-mark';
import pathnames from '@/pathnames';
import certificationService from '@/services/admin/certification';
import { IAdminCertificationName } from '@/types/admin';
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
    { title: pathnames.admin.appendix.employeeAppendix.certification.main.name }
];

const CertificationNameAddPage = () => {
    const [form] = Form.useForm();
    const navigation = useNavigate();
    const { havePermission } = usePermissions('AddCertificationNameAppendix', 'Certification');
    const { showNotification } = useNotify();

    const [loadingForm, setLoadingForm] = useState(false);
    const [warningData, setWarningData] = useState<IAdminCertificationName | null>(null);
    const [showWarningDialog, setShowWarningDialog] = useState(false);

    const warningDialogTitle = `Can’t Create`;
    const warningDialogContent = (
        <div style={{ width: 384 }}>
            There is a valid existing Certification Name <strong>{warningData?.certificateName}</strong>. Can't create a duplication Certification
            Name.
        </div>
    );

    const onGoBack = () => navigation(pathnames.admin.appendix.employeeAppendix.certification.main.path);

    // Header buttons
    const buttons: ButtonProps[] = [
        { children: 'Cancel', onClick: onGoBack },
        havePermission('Add') && { type: 'primary', htmlType: 'submit', loading: loadingForm, children: 'Save' }
    ].filter(Boolean);

    const fields: IField[] = [
        {
            label: 'Certification Name',
            name: 'certificateName',
            value: <Input placeholder="Enter certification name" />,
            validation: [validateEnterValidValue]
        }
    ];

    const onShowWarningDialog = (item: IAdminCertificationName) => {
        setWarningData(item);
        setShowWarningDialog(true);
    };

    const onCloseWarningDialog = () => {
        setShowWarningDialog(false);
    };

    const onFinish = async (value: IAdminCertificationName) => {
        setLoadingForm(true);
        try {
            const updatedData: IAdminCertificationName = {
                certificateName: value.certificateName
            };

            const res = await certificationService.addCertificateName(updatedData);
            const { succeeded, message, errors } = res;

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

    return (
        <DetailContent>
            <Form form={form} name="addCertificationNameForm" requiredMark={RequiredMark} layout="vertical" onFinish={onFinish}>
                <BaseBreadcrumb dataItem={breadcrumbItems} />
                <DetailHeader
                    pageTitle={pathnames.admin.appendix.employeeAppendix.certification.addCertificationName.name}
                    goBack={onGoBack}
                    buttons={buttons}
                />

                <DetailInfo>
                    <DetailFields data={fields} />
                </DetailInfo>

                {/* DIALOG */}
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

export default CertificationNameAddPage;
