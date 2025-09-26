import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import DetailFields from '@/components/common/detail-management/detail-fields';
import DetailHeader from '@/components/common/detail-management/detail-header';
import DetailInfo from '@/components/common/detail-management/detail-info';
import DialogCommon from '@/components/common/dialog/dialog-common/dialog-common';
import EmployeeAutoComplete from '@/components/common/employee-autocomplete';
import RequiredMark from '@/components/common/form/required-mark';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import pathnames from '@/pathnames';
import companyService from '@/services/admin/company';
import contractService from '@/services/hr-management/contract-management';
import { ICompany } from '@/types/admin';
import { IField } from '@/types/common';
import { validateEnterValidValue } from '@/utils/common';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';
import icons from '@/utils/icons';
import { ButtonProps, Flex, Form, Input, Spin, Switch } from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const breadcrumbItems: BreadcrumbItemType[] = [
    { title: pathnames.admin.main.name },
    { title: pathnames.admin.appendix.main.name },
    { title: pathnames.admin.appendix.employeeAppendix.main.name },
    { title: pathnames.admin.appendix.companyAppendix.company.main.name, path: pathnames.admin.appendix.companyAppendix.company.main.path },
    { title: pathnames.admin.appendix.companyAppendix.company.edit.name }
];

const CompanyEditPage = () => {
    const { companyId = '' } = useParams();
    const { havePermission } = usePermissions('EditCompanyAppendix', 'Company');
    const [form] = Form.useForm();
    const navigation = useNavigate();
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [data, setData] = useState<ICompany | null>(null);
    const [loadingForm, setLoadingForm] = useState(false);
    const [updatedData, setUpdatedData] = useState<ICompany | null>(null);
    const [showWarningDialog, setShowWarningDialog] = useState(false);
    const [showStatusUpdateConfirmationDialog, setShowStatusUpdateConfirmationDialog] = useState<boolean>(false);
    const [showStatusWarningDialog, setShowStatusWarningDialog] = useState(false);

    const warningDialogTitle = `Can’t Edit`;
    const statusUpdateConfirmationDialogTitle = 'Confirm Inactive';
    const statusWarningDialogTitle = `Can’t Edit`;

    const warningDialogContent = (
        <div style={{ width: 384 }}>
            This company <strong>{updatedData?.companyName}</strong> with badge ID format <strong>{data?.prefixKeyContract}</strong> is already
            Existing. Can't edit this company record to be duplicated with another existing record.
        </div>
    );
    const statusUpdateConfirmationDialogContent = (
        <div style={{ width: 384 }}>
            The company record - created on <strong>{data?.createdOn}</strong> will be inactivated. Are you sure you want to inactivate it?
        </div>
    );
    const statusWarningDialogContent = (
        <div style={{ width: 384 }}>
            Cannot inactivate the company <strong>{updatedData?.companyName}</strong> with Badge ID Format <strong>{data?.prefixKeyContract}</strong>.
            Because this company has been using.
        </div>
    );

    const pageTitle = pathnames.admin.appendix.companyAppendix.company.edit.name;

    // Handle go back
    const onGoBack = () => navigation(pathnames.admin.appendix.companyAppendix.company.detail.path + '/' + companyId);

    // Header buttons
    const buttons: ButtonProps[] = [
        { children: 'Cancel', onClick: onGoBack },
        havePermission('Edit') && { type: 'primary', loading: loadingForm, htmlType: 'submit', children: 'Save' }
    ].filter(Boolean);

    const switchStatus = Form.useWatch('isActive', form);

    const fields: IField[] = [
        {
            label: 'Badge ID Format',
            value: renderWithFallback(data?.prefixKeyContract)
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
        },
        {
            label: 'Active Company Appendix',
            value: (
                <Flex gap={12} style={{ marginTop: 8 }}>
                    <Form.Item name="isActive" valuePropName="checked">
                        <Switch></Switch>
                    </Form.Item>
                    <div>{switchStatus ? 'On' : 'Off'}</div>
                </Flex>
            )
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

    const onShowStatusWarningDialog = (company: ICompany) => {
        setUpdatedData(company);
        setShowStatusWarningDialog(true);
    };

    const onCloseStatusWarningDialog = () => {
        setUpdatedData(null);
        setShowStatusWarningDialog(false);
    };

    const onShowStatusUpdateConfirmationDialog = (updatedData: ICompany) => {
        setUpdatedData(updatedData);
        setShowStatusUpdateConfirmationDialog(true);
    };

    const onCloseStatusUpdateConfirmationDialog = () => {
        setUpdatedData(null);
        setShowStatusUpdateConfirmationDialog(false);
    };

    // Handle submit form
    const handleUpdateDetail = async (updatedData: ICompany | null) => {
        if (!updatedData) return;

        try {
            const res = await companyService.update(updatedData);
            const { succeeded, message, errors } = res;

            if (succeeded) {
                onGoBack();
            } else if (errors) {
                // If company name is exists in DB then show warning dialog
                if (errors.findIndex(error => error.FieldName === 'companyName') >= 0) {
                    onShowWarningDialog(updatedData);
                    return;
                }
                // Can't edit if company has been using
                else if (errors.findIndex(error => error.FieldName === 'isActive') >= 0) {
                    onCloseStatusUpdateConfirmationDialog();
                    onShowStatusWarningDialog(updatedData);
                    return;
                }
            }
            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'An unexpected error occurred');
        } finally {
            setLoadingForm(false);
        }
    };

    const onSubmit = async (value: any) => {
        setLoadingForm(true);
        const {
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
            companyId: parseInt(companyId),
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
        setUpdatedData(updatedData);

        // Check status is updated
        if (isActive !== data?.isActive && !isActive) {
            onShowStatusUpdateConfirmationDialog(updatedData);
            setLoadingForm(false);
        } else {
            handleUpdateDetail(updatedData);
        }
    };

    // Update form when data updated
    useEffect(() => {
        const updateFormData = () => {
            if (data) {
                const {
                    prefixKeyContract,
                    companyName,
                    companyNameEN,
                    companyAcronym,
                    companyAddress,
                    companyOwner,
                    ownerPosition,
                    companyPhone,
                    companyFax,
                    companyTaxId,
                    isActive
                } = data;

                const newFormData = {
                    prefixKeyContract,
                    companyName,
                    companyNameEN,
                    companyAcronym,
                    companyAddress,
                    companyOwner,
                    ownerPosition,
                    companyPhone,
                    companyFax,
                    companyTaxId,
                    isActive
                };

                form.setFieldsValue(newFormData);
            }
        };

        updateFormData();
    }, [data, form]);

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            turnOnLoading();
            const res = await companyService.getDetail(companyId);
            const { succeeded, data } = res;

            if (succeeded && data) setData(data);
            turnOffLoading();
        };

        fetchData();
    }, [companyId, navigation, turnOnLoading, turnOffLoading]);

    return (
        <DetailContent>
            <Spin spinning={isLoading}>
                <Form form={form} name="editCompanyForm" requiredMark={RequiredMark} layout="vertical" onFinish={onSubmit}>
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
                    <DialogCommon
                        title={statusWarningDialogTitle}
                        icon={icons.dialog.warning}
                        content={statusWarningDialogContent}
                        open={showStatusWarningDialog}
                        onClose={onCloseStatusWarningDialog}
                        buttonType="default-primary"
                        hiddenButtonLeft={true}
                        buttonRight="Close"
                        buttonRightClick={onCloseStatusWarningDialog}
                    />
                    <DialogCommon
                        title={statusUpdateConfirmationDialogTitle}
                        icon={icons.dialog.info}
                        content={statusUpdateConfirmationDialogContent}
                        open={showStatusUpdateConfirmationDialog}
                        onClose={onCloseStatusUpdateConfirmationDialog}
                        buttonType="default-primary"
                        buttonLeftClick={onCloseStatusUpdateConfirmationDialog}
                        buttonRight="Inactivate"
                        buttonRightClick={() => handleUpdateDetail(updatedData)}
                    />
                </Form>
            </Spin>
        </DetailContent>
    );
};

export default CompanyEditPage;
