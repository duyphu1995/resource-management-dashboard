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
        title: pathnames.admin.appendix.employeeAppendix.entryLanguage.main.name,
        path: pathnames.admin.appendix.employeeAppendix.entryLanguage.main.path
    },
    { title: pathnames.admin.appendix.employeeAppendix.entryLanguage.edit.name }
];

const EntryLanguageEdit = () => {
    const { id = '' } = useParams();
    const [form] = Form.useForm();
    const { showNotification } = useNotify();
    const navigation = useNavigate();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [loadingForm, setLoadingForm] = useState(false);
    const [warningData, setWarningData] = useState<IAdminEntryLanguage | null>(null);
    const [showWarningDialog, setShowWarningDialog] = useState(false);

    const pageTitle = pathnames.admin.appendix.employeeAppendix.entryLanguage.edit.name;
    const warningDialogTitle = `Can’t Edit`;

    const warningDialogContent = (
        <div style={{ width: 384 }}>
            There is a valid existing Entry Language <strong>{warningData?.entryLanguageName}</strong>. Can't edit a duplication Entry Language.
        </div>
    );

    const onGoBack = () => navigation(pathnames.admin.appendix.employeeAppendix.entryLanguage.detail.path + '/' + id);

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

    const onFinish = async (value: IAdminEntryLanguage) => {
        try {
            setLoadingForm(true);
            const updatedData: IAdminEntryLanguage = {
                entryLanguageId: parseInt(id),
                entryLanguageName: value.entryLanguageName
            };

            const res = await entryLanguageService.update(updatedData);
            const { succeeded, message, errors } = res;

            if (succeeded) {
                onGoBack();
            } else if (errors?.some(error => error.FieldName === 'EntryLanguageTypeName')) {
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

    const onShowWarningDialog = (position: IAdminEntryLanguage) => {
        setWarningData(position);
        setShowWarningDialog(true);
    };
    const onCloseWarningDialog = () => {
        setShowWarningDialog(false);
    };

    useEffect(() => {
        const fetchData = async () => {
            turnOnLoading();
            const res = await entryLanguageService.getDetail(id);
            const { data, succeeded } = res;

            if (succeeded && data) {
                const newFormData = {
                    entryLanguageName: data.entryLanguageName
                };

                form.setFieldsValue(newFormData);
            }
            turnOffLoading();
        };

        fetchData();
    }, [id, form, navigation, turnOnLoading, turnOffLoading]);

    return (
        <DetailContent>
            <Spin spinning={isLoading} style={{ height: '100%' }}>
                <Form form={form} name="editEntryLanguageForm" requiredMark={RequiredMark} layout="vertical" onFinish={onFinish}>
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

export default EntryLanguageEdit;
