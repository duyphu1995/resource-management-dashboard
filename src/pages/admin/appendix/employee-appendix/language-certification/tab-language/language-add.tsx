import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import DetailFields from '@/components/common/detail-management/detail-fields';
import DetailHeader from '@/components/common/detail-management/detail-header';
import DetailInfo from '@/components/common/detail-management/detail-info';
import DialogCommon from '@/components/common/dialog/dialog-common/dialog-common';
import RequiredMark from '@/components/common/form/required-mark';
import pathnames from '@/pathnames';
import languageCertificationService from '@/services/admin/language-certification';
import { IAdminLanguageCertification } from '@/types/admin';
import { IField } from '@/types/common';
import { validateEnterValidValue } from '@/utils/common';
import useNotify from '@/utils/hook/useNotify';
import icons from '@/utils/icons';
import { ButtonProps, Form, Input } from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const breadcrumbItems: BreadcrumbItemType[] = [
    { title: pathnames.admin.main.name },
    { title: pathnames.admin.appendix.main.name },
    { title: pathnames.admin.appendix.employeeAppendix.main.name },
    { title: pathnames.admin.appendix.employeeAppendix.languageCertification.main.name }
];

const AddLanguageCertificationPage = () => {
    const [form] = Form.useForm();
    const navigation = useNavigate();
    const { showNotification } = useNotify();

    const [loadingForm, setLoadingForm] = useState(false);
    const [warningData, setWarningData] = useState<IAdminLanguageCertification | null>(null);
    const [showWarningDialog, setShowWarningDialog] = useState(false);

    const pageTitle = pathnames.admin.appendix.employeeAppendix.languageCertification.addLanguage.name;
    const warningDialogTitle = `Can’t Create`;
    const warningDialogContent = (
        <div style={{ width: 384 }}>
            There is a valid existing Language <strong>{warningData?.languageName}</strong>. Can't create a duplication Language.
        </div>
    );

    const onGoBack = () => navigation(pathnames.admin.appendix.employeeAppendix.languageCertification.main.path);

    // Header buttons
    const buttons: ButtonProps[] = [
        { children: 'Cancel', onClick: onGoBack },
        { type: 'primary', htmlType: 'submit', loading: loadingForm, children: 'Save' }
    ];

    const fields: IField[] = [
        {
            label: 'Language Name',
            name: 'languageName',
            value: <Input placeholder="Enter language name" />,
            validation: [validateEnterValidValue]
        }
    ];

    const onShowWarningDialog = (item: IAdminLanguageCertification) => {
        setWarningData(item);
        setShowWarningDialog(true);
    };

    const onCloseWarningDialog = () => {
        setShowWarningDialog(false);
    };

    const onFinish = async (value: IAdminLanguageCertification) => {
        try {
            setLoadingForm(true);
            const updatedData: IAdminLanguageCertification = {
                languageName: value.languageName
            };

            const res = await languageCertificationService.addLanguage(updatedData);
            const { succeeded, message, errors } = res;

            if (succeeded) {
                onGoBack();
            } else if (errors?.some(error => error.FieldName === 'languageName')) {
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
            <Form form={form} name="addLanguageForm" requiredMark={RequiredMark} layout="vertical" onFinish={onFinish}>
                <BaseBreadcrumb dataItem={breadcrumbItems} />
                <DetailHeader pageTitle={pageTitle} goBack={onGoBack} buttons={buttons} />

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

export default AddLanguageCertificationPage;
