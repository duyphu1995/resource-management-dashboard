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
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
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
        title: pathnames.admin.appendix.employeeAppendix.languageCertification.main.name,
        path: pathnames.admin.appendix.employeeAppendix.languageCertification.main.path
    },
    { title: pathnames.admin.appendix.employeeAppendix.languageCertification.editLanguage.name }
];

const LanguageCertificationEditPage = () => {
    const { showNotification } = useNotify();
    const navigation = useNavigate();
    const { id = '' } = useParams();
    const [form] = Form.useForm();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [warningData, setWarningData] = useState<IAdminLanguageCertification | null>(null);
    const [showWarningDialog, setShowWarningDialog] = useState(false);
    const [loadingForm, setLoadingForm] = useState(false);

    const pageTitle = pathnames.admin.appendix.employeeAppendix.languageCertification.editLanguage.name;
    const warningDialogTitle = `Can’t Edit`;
    const warningDialogContent = (
        <div style={{ width: 384 }}>
            There is a valid existing Language <strong>{warningData?.languageName}</strong>. Can't edit a duplication Language.
        </div>
    );

    const onGoBack = () => navigation(pathnames.admin.appendix.employeeAppendix.languageCertification.detailLanguage.path + '/' + id);

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

    const onFinish = async (value: IAdminLanguageCertification) => {
        try {
            setLoadingForm(true);
            const updatedData: IAdminLanguageCertification = {
                languageId: parseInt(id),
                languageName: value.languageName
            };

            const res = await languageCertificationService.updateLanguage(updatedData);
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

    const onShowWarningDialog = (position: IAdminLanguageCertification) => {
        setWarningData(position);
        setShowWarningDialog(true);
    };
    const onCloseWarningDialog = () => {
        setShowWarningDialog(false);
    };

    useEffect(() => {
        const fetchData = async () => {
            turnOnLoading();
            const res = await languageCertificationService.getDetailLanguage(id);
            const { data, succeeded } = res;

            if (succeeded && data) {
                const newFormData = {
                    languageName: data.languageName
                };

                form.setFieldsValue(newFormData);
            }
            turnOffLoading();
        };

        fetchData();
    }, [id, form, navigation, showNotification, turnOnLoading, turnOffLoading]);

    return (
        <DetailContent>
            <Spin spinning={isLoading}>
                <Form
                    form={form}
                    name="editLanguageForm"
                    requiredMark={RequiredMark}
                    layout="vertical"
                    onFinish={onFinish}
                    style={{ height: '100%' }}
                >
                    <BaseBreadcrumb dataItem={breadcrumbItems} />
                    <DetailHeader pageTitle={pageTitle} buttons={buttons} goBack={onGoBack} />

                    {/* DETAIL INFO */}
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
            </Spin>
        </DetailContent>
    );
};

export default LanguageCertificationEditPage;
