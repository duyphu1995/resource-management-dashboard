import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import DetailFields from '@/components/common/detail-management/detail-fields';
import DetailHeader from '@/components/common/detail-management/detail-header';
import DetailInfo from '@/components/common/detail-management/detail-info';
import DialogCommon from '@/components/common/dialog/dialog-common/dialog-common';
import RequiredMark from '@/components/common/form/required-mark';
import pathnames from '@/pathnames';
import nationalityService from '@/services/admin/nationality';
import { IAdminNationality } from '@/types/admin';
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
        path: pathnames.admin.appendix.employeeAppendix.nationality.main.path,
        title: pathnames.admin.appendix.employeeAppendix.nationality.main.name
    },
    { title: pathnames.admin.appendix.employeeAppendix.nationality.add.name }
];

const NationalityAddPage = () => {
    const navigation = useNavigate();
    const [form] = Form.useForm();
    const { havePermission } = usePermissions('AddNationalityAppendix', 'Nationality');
    const { showNotification } = useNotify();

    const [loadingForm, setLoadingForm] = useState(false);
    const [warningData, setWarningData] = useState<IAdminNationality | null>(null);
    const [showWarningDialog, setShowWarningDialog] = useState(false);

    const pageTitle = pathnames.admin.appendix.employeeAppendix.nationality.add.name;
    const warningDialogTitle = `Can’t create`;

    const warningDialogContent = (
        <div style={{ width: 384 }}>
            There is a valid existing Nationality <strong>{warningData?.nationalityName}</strong>. Can't create a duplication Nationality
        </div>
    );

    const onGoBack = () => navigation(pathnames.admin.appendix.employeeAppendix.nationality.main.path);

    const buttons: ButtonProps[] = [
        { children: 'Cancel', onClick: onGoBack },
        havePermission('Add') && { type: 'primary', htmlType: 'submit', loading: loadingForm, children: 'Save' }
    ].filter(Boolean);

    const fields: IField[] = [
        {
            label: 'National Name',
            name: 'nationalityName',
            value: <Input placeholder="Enter national name" />,
            validation: [validateEnterValidValue]
        }
    ];

    const onShowWarningDialog = (position: IAdminNationality) => {
        setWarningData(position);
        setShowWarningDialog(true);
    };
    const onCloseWarningDialog = () => {
        setShowWarningDialog(false);
    };

    const onFinish = async (value: IAdminNationality) => {
        try {
            setLoadingForm(true);
            const updatedData: IAdminNationality = {
                nationalityName: value.nationalityName
            };

            const res = await nationalityService.add(updatedData);
            const { succeeded, message, errors } = res;

            if (succeeded) {
                onGoBack();
            } else if (errors?.some(error => error.FieldName === 'nationalityName')) {
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
            <Form form={form} name="addNationalityForm" requiredMark={RequiredMark} layout="vertical" onFinish={onFinish} style={{ height: '100%' }}>
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

export default NationalityAddPage;
