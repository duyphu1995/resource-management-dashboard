import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import DetailFields from '@/components/common/detail-management/detail-fields';
import DetailHeader from '@/components/common/detail-management/detail-header';
import DetailInfo from '@/components/common/detail-management/detail-info';
import DialogCommon from '@/components/common/dialog/dialog-common/dialog-common';
import EmployeeAutoComplete from '@/components/common/employee-autocomplete';
import RequiredMark from '@/components/common/form/required-mark';
import pathnames from '@/pathnames';
import companyService from '@/services/admin/company';
import contractService from '@/services/hr-management/contract-management';
import { ICompany } from '@/types/admin';
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
    { title: pathnames.admin.appendix.companyAppendix.main.name },
    { path: pathnames.admin.appendix.companyAppendix.company.main.path, title: pathnames.admin.appendix.companyAppendix.company.main.name },
    { title: pathnames.admin.appendix.companyAppendix.company.add.name }
];

const CompanyAddPage = () => {
    const navigation = useNavigate();
    const { havePermission } = usePermissions('AddCompanyAppendix', 'Company');
    const [form] = Form.useForm();
    const { showNotification } = useNotify();

    const [loadingForm, setLoadingForm] = useState(false);
    const [updatedData, setUpdatedData] = useState<ICompany | null>(null);
    const [showWarningDialog, setShowWarningDialog] = useState(false);

    const warningDialogTitle = `Can’t Create`;

    const warningDialogContent = (
        <div style={{ width: 384 }}>
            This Company <strong>{updatedData?.companyName}</strong> with badge ID format <strong>{updatedData?.prefixKeyContract}</strong> is already
            Existing. Can't create this Company Record to be duplicated with above Company Record.
        </div>
    );

    const pageTitle = pathnames.admin.appendix.companyAppendix.company.add.name;

    const onGoBack = () => navigation(pathnames.admin.appendix.companyAppendix.company.main.path);

    // Header buttons
    const buttons: ButtonProps[] = [
        { children: 'Cancel', onClick: onGoBack },
        havePermission('Add') && { type: 'primary', loading: loadingForm, htmlType: 'submit', children: 'Save' }
    ].filter(Boolean);

    const fields: IField[] = [
        {
            label: 'Badge ID Format',
            name: 'prefixKeyContract',
            value: <Input placeholder="Enter badge ID format" />,
            validation: [validateEnterValidValue]
        },
        {
            label: 'Company Name',
            name: 'companyName',
            value: <Input placeholder="Enter company name" />,
            validation: [validateEnterValidValue]
        },
        {
            label: 'English Name',
            name: 'companyNameEN',
            value: <Input placeholder="Enter English name" />,
            validation: [validateEnterValidValue]
        },
        {
            label: 'Short Name',
            name: 'companyAcronym',
            value: <Input placeholder="Enter short name" />,
            validation: [validateEnterValidValue]
        },
        {
            label: 'Address',
            name: 'companyAddress',
            value: <Input placeholder="Enter address" />,
            validation: [validateEnterValidValue]
        },
        {
            label: 'Mr/Ms',
            name: 'companyOwner',
            value: <EmployeeAutoComplete getAPI={contractService.getEmployeeInformation} width={'100%'} />,
            validation: [validateEnterValidValue]
        },
        {
            label: 'Position',
            name: 'ownerPosition',
            value: <Input placeholder="Enter position" />,
            validation: [validateEnterValidValue]
        },
        {
            label: 'Phone',
            name: 'companyPhone',
            value: <Input placeholder="Enter phone" />,
            validation: [validateEnterValidValue]
        },
        {
            label: 'Fax',
            name: 'companyFax',
            value: <Input placeholder="Enter fax" />,
            validation: [validateEnterValidValue]
        },
        {
            label: 'Tax ID',
            name: 'companyTaxId',
            value: <Input placeholder="Enter Tax ID" />,
            validation: [validateEnterValidValue]
        }
    ];

    const onShowWarningDialog = (company: ICompany) => {
        setUpdatedData(company);
        setShowWarningDialog(true);
    };

    const onCloseWarningDialog = () => {
        setUpdatedData(null);
        setShowWarningDialog(false);
    };

    // Handle submit form
    const onSubmit = async (value: any) => {
        try {
            setLoadingForm(true);
            const {
                prefixKeyContract,
                companyName,
                companyNameEN,
                companyAcronym,
                companyAddress,
                ownerPosition,
                companyPhone,
                companyFax,
                companyTaxId,
                companyOwner,
                isActive
            } = value;

            const updatedData = {
                prefixKeyContract,
                companyName,
                companyNameEN,
                companyAcronym,
                companyAddress,
                ownerPosition,
                companyOwner,
                companyPhone,
                companyFax,
                companyTaxId,
                isActive
            } as ICompany;
            const res = await companyService.add(updatedData);
            const { succeeded, message, errors } = res;

            if (succeeded) {
                onGoBack();
            } else if (errors && errors.findIndex(error => error.FieldName === 'companyName' || error.FieldName === 'prefixKeyContract') >= 0) {
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
            <Form form={form} requiredMark={RequiredMark} layout="vertical" onFinish={onSubmit}>
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
        </DetailContent>
    );
};

export default CompanyAddPage;
