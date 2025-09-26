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
import { validateEnterValidValue, validateSelectValidValue } from '@/utils/common';
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
        title: pathnames.admin.appendix.employeeAppendix.certification.main.name,
        path: pathnames.admin.appendix.employeeAppendix.certification.main.path
    },
    { title: pathnames.admin.appendix.employeeAppendix.certification.editCertificationTypeName.name }
];

const CertificationTypeEditPage = () => {
    const { showNotification } = useNotify();
    const navigation = useNavigate();
    const { id = '' } = useParams();
    const [form] = Form.useForm();
    const { havePermission } = usePermissions('EditCertificationAppendix', 'Certification');
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [warningData, setWarningData] = useState<IAdminCertificationType | null>(null);
    const [showWarningDialog, setShowWarningDialog] = useState(false);
    const [loadingForm, setLoadingForm] = useState(false);
    const [certificateTypeNameOptions, setCertificateTypeNameOptions] = useState<IFilterOption[]>([]);

    const pageTitle = pathnames.admin.appendix.employeeAppendix.certification.editCertificationTypeName.name;
    const warningDialogTitle = `Can’t Edit`;
    const warningDialogContent = (
        <div style={{ width: 384 }}>
            There is a valid existing Certification Type <strong>{warningData?.certificateTypeName}</strong>. Can't edit a duplication Certification
            Type.
        </div>
    );

    const onGoBack = () => navigation(pathnames.admin.appendix.employeeAppendix.certification.detailCertificationTypeName.path + '/' + id);

    const buttons: ButtonProps[] = [
        { children: 'Cancel', onClick: onGoBack },
        havePermission('Edit') && { type: 'primary', htmlType: 'submit', loading: loadingForm, children: 'Save' }
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
            validation: [validateSelectValidValue]
        }
    ];

    const onFinish = async (value: IAdminCertificationType) => {
        setLoadingForm(true);
        const dataCertificateDtos = form.getFieldValue('certificateDtos');

        try {
            const updatedData: IAdminCertificationType = {
                certificateTypeId: parseInt(id),
                certificateTypeName: value.certificateTypeName,
                certificateDtos: dataCertificateDtos && dataCertificateDtos?.map((item: number) => ({ certificateId: item }))
            };

            const res = await certificationService.updateCertificateType(updatedData);
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

    const onShowWarningDialog = (position: IAdminCertificationType) => {
        setWarningData(position);
        setShowWarningDialog(true);
    };
    const onCloseWarningDialog = () => {
        setShowWarningDialog(false);
    };

    useEffect(() => {
        const fetchData = async () => {
            turnOnLoading();
            const res = await certificationService.getDetailCertificateType(id);
            const { data, succeeded } = res;

            if (succeeded && data?.certificateDtos) {
                const certificateDtos = data.certificateDtos.map(cert => cert.certificateId);

                const newFormData = {
                    certificateTypeName: data.certificateTypeName,
                    certificateDtos
                };

                form.setFieldsValue(newFormData);
            }
            turnOffLoading();
        };

        fetchData();
    }, [id, form, navigation, showNotification, turnOnLoading, turnOffLoading]);

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
    }, [showNotification]);

    return (
        <DetailContent>
            <Spin spinning={isLoading}>
                <Form
                    form={form}
                    name="EditCertificationTypeNameForm"
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

export default CertificationTypeEditPage;
