import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import DetailFields from '@/components/common/detail-management/detail-fields';
import DetailHeader from '@/components/common/detail-management/detail-header';
import DetailInfo from '@/components/common/detail-management/detail-info';
import DialogCommon from '@/components/common/dialog/dialog-common/dialog-common';
import RequiredMark from '@/components/common/form/required-mark';
import BaseSelect from '@/components/common/form/select';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import pathnames from '@/pathnames';
import salaryService from '@/services/admin/salary';
import contractService from '@/services/hr-management/contract-management';
import { IAdminSalary } from '@/types/admin';
import { IDataBreadcrumb, IField } from '@/types/common';
import { IContractIndexes } from '@/types/hr-management/contract-management';
import { filterNullProperties, formatTimeMonthDayYear } from '@/utils/common';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';
import icons from '@/utils/icons';
import { ButtonProps, Form, Input, InputNumber, Select, Spin, Switch } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const { Option } = Select;

const breadcrumbList: IDataBreadcrumb[] = [
    { title: pathnames.admin.main.name },
    { title: pathnames.admin.appendix.main.name },
    { title: pathnames.admin.appendix.companyAppendix.main.name },
    { title: pathnames.admin.appendix.companyAppendix.contractSalary.main.name },
    {
        title: pathnames.admin.appendix.companyAppendix.contractSalary.detail.name,
        path: pathnames.admin.appendix.companyAppendix.contractSalary.add.path
    }
];

const EditContractSalary = () => {
    const navigation = useNavigate();
    const { havePermission } = usePermissions('EditContractSalaryAppendix', 'ContractSalary');
    const [form] = Form.useForm();
    const { id = '' } = useParams();
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [showModal, setShowModal] = useState(false);
    const [contractIndex, setContractIndex] = useState<IContractIndexes>();
    const [data, setData] = useState<IAdminSalary>();
    const [showWarningDialog, setShowWarningDialog] = useState(false);
    const [showWarningInactiveDialog, setShowWarningInactiveDialog] = useState(false);
    const [loadingForm, setLoadingForm] = useState(false);

    const pageTitle = 'Edit Contract Salary';
    const warningDialogTitle = 'Can’t Edit Record';

    const career = contractIndex?.careers.find(item => item.isNonTechnical === form.getFieldValue('isNonTechnical'))?.career;
    const company = contractIndex?.companies.find(item => item.companyId === form.getFieldValue('companyId'))?.companyName;
    const grade = form.getFieldValue('grade');

    const warningDialogContent = (
        <div style={{ width: 384 }}>
            There is an valid existing Salary Record with Career <strong>{career}</strong>, Grade <strong>{grade}</strong>, Company{' '}
            <strong>{company}</strong>. Can't edit a duplication Salary Record to become duplication with above Salary Record.
        </div>
    );

    const warningInactiveDialogContent = (
        <div style={{ width: 384 }}>
            Cannot inactivate the salary <strong>{form.getFieldValue('salaryInText')}</strong> with Career <strong>{career}</strong>, Grade{' '}
            <strong>{grade}</strong>, Company <strong>{company}</strong>. Because this salary has been using.
        </div>
    );

    const onGoBack = () => {
        navigation(pathnames.admin.appendix.companyAppendix.contractSalary.detail.path + `/${id}`);
    };

    const buttons: ButtonProps[] = [
        { onClick: onGoBack, children: 'Cancel' },
        havePermission('Edit') && { htmlType: 'submit', type: 'primary', loading: loadingForm, children: 'Save' }
    ].filter(Boolean);

    const handleSwitchChange = (value: boolean) => {
        if (!value) {
            if (data?.isUsed) {
                setShowWarningInactiveDialog(true);
            } else {
                setShowModal(true);
            }
        }
    };

    const salaryCols: IField[] = [
        {
            name: 'grade',
            label: 'Grade',
            value: <Input placeholder="Enter grade" />,
            validation: [{ required: true, message: 'Please enter valid value' }]
        },
        {
            name: 'positionName',
            label: 'Position',
            value: <Input placeholder="Enter position" />,
            validation: [{ required: true, message: 'Please select valid value' }]
        },
        {
            name: 'isNonTechnical',
            label: 'Career',
            value: (
                <BaseSelect placeholder="Select career">
                    {contractIndex?.careers.map((item, index) => (
                        <Option key={index} value={item.isNonTechnical} label={item.career}>
                            {item.career}
                        </Option>
                    ))}
                </BaseSelect>
            ),
            validation: [{ required: true, message: 'Please select valid value' }]
        },
        {
            name: 'companyId',
            label: 'Company',
            value: (
                <BaseSelect
                    options={
                        contractIndex?.companies.map(item => ({
                            label: item.companyName,
                            value: item.companyId
                        })) || []
                    }
                    placeholder="Select company"
                />
            ),
            validation: [{ required: true, message: 'Please select valid value' }]
        },
        {
            name: 'salary',
            label: 'Salary By Number',
            value: <InputNumber placeholder="Enter salary by number" className="w-100" min={0} max={2147483647} />,
            validation: [{ required: true, message: 'Please select valid value' }]
        },
        {
            name: 'salaryInText',
            label: 'Salary By Text',
            value: <Input placeholder="Enter salary by text" />,
            validation: [{ required: true, message: 'Please select valid value' }]
        },
        {
            label: 'Created Date',
            value: renderWithFallback(formatTimeMonthDayYear(data?.createdOn))
        },
        {
            label: 'Edited Date',
            value: renderWithFallback(formatTimeMonthDayYear(data?.lastModifiedOn))
        },
        {
            name: 'isActive',
            label: 'Active Contract Salary',
            value: data && <Switch defaultChecked={data?.isActive} onClick={value => handleSwitchChange(value)} />
        }
    ];

    const handleConfirmationModalCancel = () => {
        setShowModal(false);
    };

    const handleConfirmationModalInactivate = () => {
        setShowModal(false);
    };

    const formatData = (values: IAdminSalary) => {
        return {
            ...values,
            salaryRangeId: data?.salaryRangeId,
            grade: Number(values.grade),
            salary: Number(values.salary)
        };
    };

    const handleSubmit = async (values: IAdminSalary) => {
        setLoadingForm(true);

        try {
            const dataFormat = filterNullProperties(formatData(values));
            const res = await salaryService.updateSalaryRange(dataFormat);
            const { succeeded, message, errors } = res;

            if (succeeded) {
                onGoBack();
            } else if (errors?.some(error => ['grade', 'companyId', 'isNonTechnical'].includes(error.FieldName))) {
                setShowWarningDialog(true);
                return;
            }

            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Failed to update salary');
        } finally {
            setLoadingForm(false);
        }
    };

    const onCloseWarningDialog = () => {
        setShowWarningDialog(false);
    };

    useEffect(() => {
        const fetchData = async () => {
            const res = await salaryService.getById(Number(id));
            form.setFieldsValue(res.data);
            setData(res.data);
        };

        const getContractAllIndex = async () => {
            const res = await contractService.getAllIndexes();
            setContractIndex(res.data);
        };

        const fetchDataAndContractIndex = async () => {
            turnOnLoading();
            await Promise.all([getContractAllIndex(), fetchData()]);
            turnOffLoading();
        };

        fetchDataAndContractIndex();
    }, [id, form, turnOnLoading, turnOffLoading]);

    return (
        <DetailContent>
            <Spin spinning={isLoading}>
                <Form form={form} name="edit_contract_salary_form" layout="vertical" requiredMark={RequiredMark} onFinish={handleSubmit}>
                    <BaseBreadcrumb dataItem={breadcrumbList} />
                    <DetailHeader pageTitle={pageTitle} buttons={buttons} goBack={onGoBack} />
                    <DetailInfo>
                        <DetailFields data={salaryCols} />
                    </DetailInfo>
                </Form>
                <DialogCommon
                    open={showModal}
                    onClose={() => setShowModal(false)}
                    title="Confirm Inactive"
                    content={
                        <>
                            The salary record - created on <strong>{data?.createdOn}</strong> will be inactivated. Are you sure you want to inactivate
                            it?
                        </>
                    }
                    icon={icons.dialog.info}
                    buttonType="default-primary"
                    buttonLeftClick={handleConfirmationModalCancel}
                    buttonRightClick={handleConfirmationModalInactivate}
                    buttonRight="Inactive"
                />
                <DialogCommon
                    open={showWarningDialog}
                    onClose={onCloseWarningDialog}
                    icon={icons.dialog.warning}
                    title={warningDialogTitle}
                    content={warningDialogContent}
                    buttonType="default-primary"
                    hiddenButtonLeft={true}
                    buttonRight="Close"
                    buttonRightClick={onCloseWarningDialog}
                />
                <DialogCommon
                    open={showWarningInactiveDialog}
                    onClose={() => setShowWarningInactiveDialog(false)}
                    icon={icons.dialog.warning}
                    title={warningDialogTitle}
                    content={warningInactiveDialogContent}
                    buttonType="default-primary"
                    hiddenButtonLeft={true}
                    buttonRight="Close"
                    buttonRightClick={() => setShowWarningInactiveDialog(false)}
                />
            </Spin>
        </DetailContent>
    );
};

export default EditContractSalary;
