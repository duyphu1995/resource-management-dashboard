import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import DetailFields from '@/components/common/detail-management/detail-fields';
import DetailHeader from '@/components/common/detail-management/detail-header';
import DetailInfo from '@/components/common/detail-management/detail-info';
import DialogCommon from '@/components/common/dialog/dialog-common/dialog-common';
import InputCommon from '@/components/common/form/input';
import RequiredMark from '@/components/common/form/required-mark';
import BaseSelect from '@/components/common/form/select';
import pathnames from '@/pathnames';
import salaryService from '@/services/admin/salary';
import contractService from '@/services/hr-management/contract-management';
import { IAdminSalary } from '@/types/admin';
import { IDataBreadcrumb, IField } from '@/types/common';
import { IContractIndexes } from '@/types/hr-management/contract-management';
import { filterNullProperties } from '@/utils/common';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';
import icons from '@/utils/icons';
import { ButtonProps, Form, Input, Select, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

const breadcrumbList: IDataBreadcrumb[] = [
    { title: pathnames.admin.main.name },
    { title: pathnames.admin.appendix.main.name },
    { title: pathnames.admin.appendix.companyAppendix.main.name },
    { title: pathnames.admin.appendix.companyAppendix.contractSalary.main.name },
    {
        title: pathnames.admin.appendix.companyAppendix.contractSalary.add.name,
        path: pathnames.admin.appendix.companyAppendix.contractSalary.add.path
    }
];

const AddContractSalaryPage = () => {
    const [form] = Form.useForm();
    const navigation = useNavigate();
    const { havePermission } = usePermissions('AddContractSalaryAppendix', 'ContractSalary');
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [loadingForm, setLoadingForm] = useState(false);
    const [showWarningDialog, setShowWarningDialog] = useState(false);
    const [contractIndex, setContractIndex] = useState<IContractIndexes>();

    const pageTitle = 'Add New Contract Salary';
    const warningDialogTitle = 'Can’t Add New';

    const career = contractIndex?.careers.find(item => item.isNonTechnical === form.getFieldValue('isNonTechnical'))?.career;
    const company = contractIndex?.companies.find(item => item.companyId === form.getFieldValue('companyId'))?.companyName;
    const grade = form.getFieldValue('grade');
    const warningDialogContent = (
        <div>
            There is an valid existing Salary Record with Career <strong>{career}</strong>, Grade <strong>{grade}</strong>, Company{' '}
            <strong>{company}</strong>. Can't create a duplication Salary Record to become duplication with above Salary Record.
        </div>
    );

    const onGoBack = () => {
        navigation(pathnames.admin.appendix.companyAppendix.contractSalary.main.path);
    };

    const buttons: ButtonProps[] = [
        { onClick: onGoBack, children: 'Cancel' },
        havePermission('Add') && { htmlType: 'submit', type: 'primary', loading: loadingForm, children: 'Save' }
    ].filter(Boolean);

    const salaryCols: IField[] = [
        {
            name: 'grade',
            label: 'Grade',
            value: <InputCommon placeholder="Enter grade" typeInput="numbers-only" />,
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
            value: <InputCommon placeholder="Enter salary by number" typeInput="numbers-only" />,
            validation: [{ required: true, message: 'Please select valid value' }]
        },
        {
            name: 'salaryInText',
            label: 'Salary By Text',
            value: <Input placeholder="Enter salary by text" />,
            validation: [{ required: true, message: 'Please select valid value' }]
        }
    ];

    const formatData = (values: IAdminSalary) => {
        return {
            ...values,
            grade: parseInt(values.grade),
            salary: parseInt(values.salary)
        };
    };

    const handleSubmit = async (values: IAdminSalary) => {
        setLoadingForm(true);

        try {
            const formattedData = filterNullProperties(formatData(values));
            const response = await salaryService.addSalaryRange(formattedData);
            const { succeeded, message, errors } = response;

            if (succeeded) {
                onGoBack();
            } else if (errors?.some(error => ['grade', 'companyId', 'isNonTechnical'].includes(error.FieldName))) {
                setShowWarningDialog(true);
                return;
            }

            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Failed to add salary');
        } finally {
            setLoadingForm(false);
        }
    };

    const onCloseWarningDialog = () => {
        setShowWarningDialog(false);
    };

    useEffect(() => {
        const fetchData = async () => {
            turnOnLoading();
            const res = await contractService.getAllIndexes();

            setContractIndex(res.data);
            turnOffLoading();
        };

        fetchData();
    }, [turnOnLoading, turnOffLoading]);

    return (
        <DetailContent>
            <Spin spinning={isLoading}>
                <Form form={form} name="add_contract_salary_form" layout="vertical" requiredMark={RequiredMark} onFinish={handleSubmit}>
                    <BaseBreadcrumb dataItem={breadcrumbList} />
                    <DetailHeader pageTitle={pageTitle} buttons={buttons} goBack={onGoBack} />
                    <DetailInfo>
                        <DetailFields data={salaryCols} />
                    </DetailInfo>
                </Form>

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
            </Spin>
        </DetailContent>
    );
};

export default AddContractSalaryPage;
