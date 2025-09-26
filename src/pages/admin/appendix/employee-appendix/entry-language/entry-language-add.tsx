import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import DetailFields from '@/components/common/detail-management/detail-fields';
import DetailHeader from '@/components/common/detail-management/detail-header';
import DetailInfo from '@/components/common/detail-management/detail-info';
import DialogCommon from '@/components/common/dialog/dialog-common/dialog-common';
import RequiredMark from '@/components/common/form/required-mark';
import pathnames from '@/pathnames';
import entryLanguageService from '@/services/admin/entry-language';
import { IAdminEntryLanguage } from '@/types/admin';
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
    { title: pathnames.admin.appendix.employeeAppendix.entryLanguage.main.name }
];

const EntryLanguageAddPage = () => {
    const [form] = Form.useForm();
    const navigation = useNavigate();
    const { showNotification } = useNotify();

    const [loadingForm, setLoadingForm] = useState(false);
    const [warningData, setWarningData] = useState<IAdminEntryLanguage | null>(null);
    const [showWarningDialog, setShowWarningDialog] = useState(false);

    const pageTitle = pathnames.admin.appendix.employeeAppendix.entryLanguage.add.name;
    const warningDialogTitle = `Can’t create`;

    const warningDialogContent = (
        <div style={{ width: 384 }}>
            There is a valid existing Entry Language <strong>{warningData?.entryLanguageName}</strong>. Can't create a duplication Entry Language
        </div>
    );

    const onGoBack = () => navigation(pathnames.admin.appendix.employeeAppendix.entryLanguage.main.path);

    const buttons: ButtonProps[] = [
        { children: 'Cancel', onClick: onGoBack },
        { type: 'primary', htmlType: 'submit', loading: loadingForm, children: 'Save' }
    ];

    const fields: IField[] = [
        {
            label: 'Entry Language Name',
            name: 'entryLanguageName',
            value: <Input placeholder="Enter entry language name" />,
            validation: [validateEnterValidValue]
        }
    ];

    const onShowWarningDialog = (item: IAdminEntryLanguage) => {
        setWarningData(item);
        setShowWarningDialog(true);
    };

    const onCloseWarningDialog = () => {
        setShowWarningDialog(false);
    };

    const onFinish = async (value: IAdminEntryLanguage) => {
        try {
            setLoadingForm(true);
            const updatedData: IAdminEntryLanguage = {
                entryLanguageName: value.entryLanguageName
            };

            const res = await entryLanguageService.add(updatedData);
            const { succeeded, message, errors } = res;

            if (succeeded) {
                onGoBack();
            } else if (errors?.some(error => error.FieldName === 'entryLanguageName')) {
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
            <Form form={form} name="addEntryLanguageForm" requiredMark={RequiredMark} layout="vertical" onFinish={onFinish}>
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

export default EntryLanguageAddPage;
