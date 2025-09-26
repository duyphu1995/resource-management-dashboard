import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import DetailFields from '@/components/common/detail-management/detail-fields';
import DetailHeader from '@/components/common/detail-management/detail-header';
import DetailInfo from '@/components/common/detail-management/detail-info';
import DialogCommon from '@/components/common/dialog/dialog-common/dialog-common';
import RequiredMark from '@/components/common/form/required-mark';
import BaseSelect from '@/components/common/form/select';
import pathnames from '@/pathnames';
import certificationService from '@/services/admin/certification';
import { IAdminCertificationType } from '@/types/admin';
import { IField } from '@/types/common';
import { IFilterOption } from '@/types/filter';
import { validateEnterValidValue } from '@/utils/common';
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';
import icons from '@/utils/icons';
import { ButtonProps, Form, Input } from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const breadcrumbItems: BreadcrumbItemType[] = [
    { title: pathnames.admin.main.name },
    { title: pathnames.admin.appendix.main.name },
    { title: pathnames.admin.appendix.employeeAppendix.main.name },
    { title: pathnames.admin.appendix.employeeAppendix.certification.main.name }
];

const CertificationTypeAddPage = () => {
    const [form] = Form.useForm();
    const navigation = useNavigate();
    const { showNotification } = useNotify();
    const { havePermission } = usePermissions('AddCertificationAppendix', 'Certification');

    const [loadingForm, setLoadingForm] = useState(false);
    const [warningData, setWarningData] = useState<IAdminCertificationType | null>(null);
    const [showWarningDialog, setShowWarningDialog] = useState(false);
    const [certificateTypeNameOptions, setCertificateTypeNameOptions] = useState<IFilterOption[]>([]);

    const pageTitle = pathnames.admin.appendix.employeeAppendix.certification.addCertificationTypeName.name;
    const warningDialogTitle = `Can’t Create`;
    const warningDialogContent = (
        <div style={{ width: 384 }}>
            There is a valid existing Certification <strong>{warningData?.certificateTypeName}</strong>. Can't create a duplication Certification.
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
            label: 'Certification',
            name: 'certificateTypeName',
            value: <Input placeholder="Enter certification" />,
            validation: [validateEnterValidValue]
        },
        {
            label: 'Certification Name',
            name: 'certificateDtos',
            value: <BaseSelect mode="multiple" options={certificateTypeNameOptions} placeholder="Select certification name" />,
            validation: [validateEnterValidValue]
        }
    ];

    const onShowWarningDialog = (item: IAdminCertificationType) => {
        setWarningData(item);
        setShowWarningDialog(true);
    };

    const onCloseWarningDialog = () => {
        setShowWarningDialog(false);
    };

    const onFinish = async (value: IAdminCertificationType) => {
        setLoadingForm(true);
        const dataCertificateDtos = form.getFieldValue('certificateDtos');

        try {
            const updatedData: IAdminCertificationType = {
                certificateTypeName: value.certificateTypeName,
                certificateDtos: dataCertificateDtos && dataCertificateDtos?.map((item: number) => ({ certificateId: item }))
            };

            const res = await certificationService.addCertificateType(updatedData);
            const { succeeded, message, errors } = res;

            if (succeeded) {
                onGoBack();
            } else if (errors?.some(error => error.FieldName === 'certificateTypeName')) {
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
            try {
                const res = await certificationService.getListCertificateName();
                const { data, succeeded } = res;

                if (succeeded && data) {
                    const dataOptions = data.map(item => ({ value: Number(item.certificateId), label: item.certificateName || '-' }));

                    setCertificateTypeNameOptions(dataOptions);
                }
            } catch (error) {
                showNotification(false, 'Failed to fetch data list certificate');
            }
        };

        fetchData();
    }, []);

    return (
        <DetailContent>
            <Form form={form} name="addCertificationTypeForm" requiredMark={RequiredMark} layout="vertical" onFinish={onFinish}>
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

export default CertificationTypeAddPage;
