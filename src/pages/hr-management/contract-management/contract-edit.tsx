import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import DetailFields from '@/components/common/detail-management/detail-fields';
import DetailHeader from '@/components/common/detail-management/detail-header';
import DetailInfo from '@/components/common/detail-management/detail-info';
import DialogCommon from '@/components/common/dialog/dialog-common/dialog-common';
import DatePicker from '@/components/common/form/date-picker';
import RequiredMark from '@/components/common/form/required-mark';
import BaseSelect from '@/components/common/form/select';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import pathnames from '@/pathnames';
import contractService from '@/services/hr-management/contract-management';
import { IField } from '@/types/common';
import {
    IContract,
    IContractAddEditIndexes,
    IContractCompany,
    IContractEdit,
    IContractSalary,
    IContractValidityInfo
} from '@/types/hr-management/contract-management';
import { IEmployee } from '@/types/hr-management/employee-management';
import {
    formatCurrencyVND,
    formatTimeMonthDayYear,
    validate1000Characters,
    validateSelectValidValue,
    validateSelectValidValueMessage
} from '@/utils/common';
import { TIME_FORMAT } from '@/utils/constants';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import icons from '@/utils/icons';
import { ButtonProps, CheckboxOptionType, Flex, Form, Input, Radio, Spin } from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { DefaultOptionType } from 'antd/es/select';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export interface IContractInfoSection {
    title: string;
    columns: IField[];
}

const ContractEditPage = () => {
    const { contractId = '' } = useParams();
    const { showNotification } = useNotify();
    const navigation = useNavigate();
    const [form] = Form.useForm();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    // Data
    const [loadingForm, setLoadingForm] = useState(false);
    const [employeeInfo, setEmployeeInfo] = useState<IEmployee | null>();
    const [contractIndexes, setContractIndexes] = useState<IContractAddEditIndexes>();
    const [contractTypeOptions, setContractTypeOptions] = useState<DefaultOptionType[]>([]);
    const [careerOptions, setCareerOptions] = useState<DefaultOptionType[]>([]);
    const [renewalContractOptions, setRenewalContractOptions] = useState<CheckboxOptionType[]>([]);
    const [companyInfo, setCompanyInfo] = useState<IContractCompany>();
    const [companyOptions, setCompanyOptions] = useState<DefaultOptionType[]>([]);
    const [validityPeriodOptions, setValidityPeriodOptions] = useState<DefaultOptionType[]>([]);
    const [validityInfo, setValidityInfo] = useState<IContractValidityInfo>();
    const [endDate, setEndDate] = useState('');
    const [salaryInfo, setSalaryInfo] = useState<IContractSalary | null>(null);

    const pageTitle = pathnames.hrManagement.contractManagement.edit.name;

    // Watch form data
    const watchCompanyId = Form.useWatch('companyId', form);
    const watchCareer = Form.useWatch('career', form);
    const watchContractType = Form.useWatch('contractType', form);
    const watchContractTypeId = Form.useWatch('contractTypeId', form);
    const watchStartDate = Form.useWatch('startDate', form);

    const breadcrumb: BreadcrumbItemType[] = [
        { title: pathnames.hrManagement.main.name },
        { title: pathnames.hrManagement.contractManagement.main.name, path: pathnames.hrManagement.contractManagement.main.path },
        { title: pageTitle }
    ];

    const employeeCols: IField[] = [
        {
            label: 'Full Name',
            value: renderWithFallback(employeeInfo?.fullName)
        },
        {
            label: 'Badge ID',
            value: renderWithFallback(employeeInfo?.badgeId)
        },
        {
            label: 'DOB',
            value: renderWithFallback(formatTimeMonthDayYear(employeeInfo?.birthday))
        },
        {
            label: 'Place Of Birth',
            value: renderWithFallback(employeeInfo?.birthPlace)
        },
        {
            name: 'career',
            label: 'Career',
            value: <BaseSelect options={careerOptions} allowClear={false} placeholder="Select career" />,
            validation: [validateSelectValidValue]
        },
        {
            label: 'Address',
            value: renderWithFallback(employeeInfo?.contactAddress)
        },
        {
            label: 'ID Card',
            value: renderWithFallback(employeeInfo?.idCardNo)
        },
        {
            label: 'Issued Date',
            value: renderWithFallback(formatTimeMonthDayYear(employeeInfo?.idCardIssueDate))
        },
        {
            label: 'Issued Place',
            value: renderWithFallback(employeeInfo?.idCardIssuePlace)
        }
    ];

    const companyCols: IField[] = [
        {
            name: 'companyId',
            label: 'Company Name',
            value: <BaseSelect options={companyOptions} allowClear={false} placeholder="Select company" />,
            validation: [validateSelectValidValue]
        },
        {
            label: 'Ms/Mr',
            value: renderWithFallback(companyInfo?.companyOwner)
        },
        {
            label: 'Position',
            value: renderWithFallback(companyInfo?.ownerPosition)
        },
        {
            label: 'Represent For',
            value: renderWithFallback(companyInfo?.representFor)
        },
        {
            label: 'Address',
            value: renderWithFallback(companyInfo?.companyAddress)
        },
        {
            label: 'Phone',
            value: renderWithFallback(companyInfo?.companyPhone)
        }
    ];

    const contractCols: IField[] = [
        {
            label: 'Contract Type',
            name: 'contractType',
            initValue: 'Xác định thời hạn',
            value: <BaseSelect options={contractTypeOptions} allowClear={false} placeholder="Select contract type" />,
            validation: [validateSelectValidValue]
        },
        {
            label: 'Validity Period',
            name: 'contractTypeId',
            value: <BaseSelect options={validityPeriodOptions} allowClear={false} placeholder="Select validity period" filterSort={() => 0} />,
            validation: [validateSelectValidValue],
            hidden: watchContractType === 'Không xác định thời hạn'
        },
        {
            label: 'Start Date',
            name: 'startDate',
            initValue: dayjs(),
            value: (
                <DatePicker
                    disabledDate={currentDate => {
                        currentDate = dayjs(currentDate.toISOString(), TIME_FORMAT.DATE);
                        const nowDate = dayjs(dayjs().toISOString(), TIME_FORMAT.DATE);

                        return currentDate < nowDate;
                    }}
                />
            ),
            validation: [validateSelectValidValue]
        },
        {
            label: 'End Date',
            value: renderWithFallback(formatTimeMonthDayYear(endDate)),
            hidden: watchContractType === 'Không xác định thời hạn'
        },
        {
            label: 'Workplace',
            value: renderWithFallback(companyInfo?.companyName)
        },
        {
            label: 'Professional Titles',
            value: renderWithFallback(salaryInfo?.professionalTitles)
        },
        {
            label: 'Position',
            value: renderWithFallback(salaryInfo?.position)
        },
        {
            label: 'Salary Number',
            value: renderWithFallback(formatCurrencyVND(salaryInfo?.salary) ?? 0)
        },
        {
            label: 'Salary Text',
            value: renderWithFallback(salaryInfo?.salaryInText)
        },
        {
            label: 'Renew Approval',
            name: 'isRenewalContract',
            initValue: 0,
            value: <Radio.Group options={renewalContractOptions} />
        },
        {
            label: 'Note',
            name: 'comment',
            value: <Input.TextArea placeholder="Enter note" className="text-area-item" />,
            validation: [validate1000Characters]
        }
    ];

    // Date range warning dialog
    const dateRangeWarningDialogTitle = 'Can’t Edit Contract ';
    const [dateRangeWarningDialog, setDateRangeWarningDialog] = useState<IContract | undefined>();
    const [showDateRangeWarningDialog, setShowDateRangeWarningDialog] = useState(false);
    const dateRangeWarningDialogContent = (
        <div>
            This employee <strong>{dateRangeWarningDialog?.fullName}</strong> already has an existing future contract{' '}
            <strong>{dateRangeWarningDialog?.contractId}</strong> on Start Date <strong>{dateRangeWarningDialog?.startDate}</strong>{' '}
            {dateRangeWarningDialog?.endDate && (
                <>
                    - End Date <strong>{dateRangeWarningDialog?.endDate}</strong>
                </>
            )}
            . User cannot edit contract which conflict to existing future contract. Please help to check again.
        </div>
    );
    const dateRangeWarningDialogButtonTitle = 'Close';

    // Handle open dialog
    const onShowDateRangeWarningDialog = (dialogData: IContract) => {
        setDateRangeWarningDialog(dialogData);
        setShowDateRangeWarningDialog(true);
    };

    // Handle close dialog
    const onCloseDateRangeWarningDialog = () => {
        setShowDateRangeWarningDialog(false);
        setDateRangeWarningDialog(undefined);
    };

    // Check date range valid
    const checkDateRange = async () => {
        const employeeId = employeeInfo?.employeeId;
        const fromDate = form.getFieldValue('startDate').format(TIME_FORMAT.DATE);
        const toDate = endDate ? dayjs(endDate, TIME_FORMAT.VN_DATE).format(TIME_FORMAT.DATE) : '';

        // Call api to get contract by employeeId, fromDate and toDate
        const res = await contractService.getByDateRange(employeeId, fromDate, toDate);
        const { data, succeeded } = res;

        // New data is invalid
        if (succeeded && data) {
            if (contractId !== data.contractId.toString()) {
                onShowDateRangeWarningDialog(data); // Show warning dialog
                return false;
            }
        }
        return true;
    };

    const onFinish = async () => {
        // Re-validate form
        form.validateFields();

        // Check date range
        const dateRangeValid = await checkDateRange();
        if (!dateRangeValid) return;

        // Loading form
        setLoadingForm(true);

        // Handle data and call api to update contract data
        if (employeeInfo && companyInfo && salaryInfo) {
            const formValue = form.getFieldsValue();

            // Get created contract data
            const { companyId, employeeId, contractTypeId, comment, isRenewalContract } = formValue;
            const isNonTechnical = JSON.parse(formValue.career);
            const career = contractIndexes?.careersInfor.find(career => career.isNonTechnical === isNonTechnical)?.career || '';
            const { salary, salaryInText, professionalTitles } = salaryInfo;
            const fromDate = dayjs(formValue.startDate, TIME_FORMAT.VN_DATE).format(TIME_FORMAT.DATE);
            const toDate = endDate ? dayjs(endDate, TIME_FORMAT.VN_DATE).format(TIME_FORMAT.DATE) : undefined;

            const updatedData: IContractEdit = {
                employeeId,
                contractId: parseInt(contractId),
                contractTypeId,
                companyId,
                career,
                professionalTitles,
                fromDate,
                toDate,
                comment,
                attachment: undefined,
                signOrder: undefined,
                salary,
                salaryInText,
                isNonTechnical,
                isRenewalContract: isRenewalContract > 0 ? true : false,
                loggedOnUser: undefined
            };

            // Call api to create contract
            const res = await contractService.updateContract(updatedData);
            const { succeeded = false, message = '' } = res;

            succeeded && navigation(pathnames.hrManagement.contractManagement.detail.path + '/' + contractId);
            showNotification(succeeded, message);
            setLoadingForm(false);
        }
    };

    const goBack = () => navigation(pathnames.hrManagement.contractManagement.detail.path + '/' + contractId);

    const buttons: ButtonProps[] = [
        {
            children: 'Cancel',
            onClick: goBack
        },
        {
            htmlType: 'submit',
            type: 'primary',
            loading: loadingForm,
            children: 'Save'
        }
    ];

    const contractSections: IContractInfoSection[] = [
        { title: 'Employee', columns: employeeCols },
        { title: 'Company', columns: companyCols },
        { title: 'Contract', columns: contractCols }
    ];

    // Fetch data for all options
    useEffect(() => {
        const fetchData = async () => {
            const res = await contractService.getIndexesForAddAndEdit();
            const { succeeded, data } = res;

            if (succeeded && data) {
                setContractIndexes(data);

                // Update new contract type options
                const newContractTypeOptions: DefaultOptionType[] = [];

                data?.validityPeriodsInfor.forEach(item => {
                    if (!newContractTypeOptions.find(option => option.value === item.contractType))
                        newContractTypeOptions.push({
                            label: item.contractType,
                            value: item.contractType
                        });
                });

                setContractTypeOptions(newContractTypeOptions);

                // Update career options
                const newCareerOptions = data?.careersInfor?.map(career => ({ value: career.isNonTechnical.toString(), label: career.career })) || [];
                setCareerOptions(newCareerOptions);

                // Update company options
                const newCompanyOptions = data?.companiesInfor.map(company => ({ value: company.companyId, label: company.companyName }));
                setCompanyOptions(newCompanyOptions);

                // Update renewal contract options
                const newRenewalContractOptions = data?.renewApprovalStatusInfor.map(item => ({
                    value: item.renewApprovalStatusId,
                    label: item.renewApprovalStatusName
                }));
                setRenewalContractOptions(newRenewalContractOptions);
            }
        };

        fetchData();
    }, []);

    // Fetch detail data
    useEffect(() => {
        const fetchData = async () => {
            turnOnLoading();
            try {
                const res = await contractService.getContractDetail(contractId);
                const { succeeded = false, data = null } = res;

                if (succeeded && data) {
                    const {
                        companyId,
                        employeeId,
                        badgeId,
                        fullName,
                        birthday,
                        birthPlace,
                        contactAddress,
                        idCardNo,
                        idCardIssueDate,
                        idCardIssuePlace,
                        career,
                        contractTypeName,
                        validityId,
                        startDate,
                        comment = '',
                        renewApprovalStatusId
                    } = data;

                    const isNonTechnical = contractIndexes?.careersInfor.find(item => item.career === career)?.isNonTechnical || false;
                    const newEmployeeInfo = {
                        employeeId,
                        badgeId,
                        fullName,
                        birthday,
                        birthPlace,
                        isNonTechnical,
                        idCardNo,
                        idCardIssueDate,
                        idCardIssuePlace,
                        companyId,
                        comment,
                        career,
                        contactAddress
                    } as IEmployee;

                    setEmployeeInfo(newEmployeeInfo);
                    form.setFields([
                        { name: 'career', value: isNonTechnical.toString() },
                        { name: 'companyId', value: companyId },
                        { name: 'contractType', value: contractTypeName },
                        { name: 'contractTypeId', value: validityId },
                        { name: 'startDate', value: dayjs(startDate, TIME_FORMAT.VN_DATE) },
                        { name: 'comment', value: comment, errors: [] },
                        { name: 'isRenewalContract', value: renewApprovalStatusId }
                    ]);
                }
            } catch (error) {
                showNotification(false, 'Error fetching contract detail');
            } finally {
                turnOffLoading();
            }
        };

        if (contractIndexes) fetchData();
    }, [contractId, form, contractIndexes, turnOnLoading, turnOffLoading, showNotification]);

    // Update company information when companyId changed
    useEffect(() => {
        const newCompanyInfor = contractIndexes?.companiesInfor.find(company => company.companyId === watchCompanyId);
        setCompanyInfo(newCompanyInfor);
    }, [contractIndexes, watchCompanyId]);

    // Update validity option when contract type changed
    useEffect(() => {
        const newValidityPeriodOptions =
            contractIndexes?.validityPeriodsInfor
                .filter(validityPeriod => validityPeriod.contractType === watchContractType)
                .map(validityPeriod => ({
                    value: validityPeriod.validityId,
                    label: validityPeriod.validityName
                })) || [];

        // Update validity options
        setValidityPeriodOptions(newValidityPeriodOptions);

        // Update contract type id
        const newContractTypeId = newValidityPeriodOptions?.[0]?.value ?? null;
        const newContractTypeIdError = newContractTypeId === null ? [validateSelectValidValueMessage] : [];

        form.setFields([{ name: 'contractTypeId', value: newContractTypeId, errors: newContractTypeIdError }]);
    }, [contractIndexes, watchContractType, form]);

    // Update validity information and end date when validity period changed
    useEffect(() => {
        const newValidityInfor = contractIndexes?.validityPeriodsInfor.find(validity => validity.validityId === watchContractTypeId);
        setValidityInfo(newValidityInfor);
    }, [contractIndexes, watchContractTypeId]);

    // Update end date when start date changed
    useEffect(() => {
        let newEndDate = '';

        if (validityInfo && validityInfo.period > 0 && watchStartDate)
            newEndDate = watchStartDate
                .add(validityInfo?.period ?? 0, 'month')
                .subtract(validityInfo?.period > 1 ? 1 : 0, 'day')
                .format(TIME_FORMAT.VN_DATE);

        setEndDate(newEndDate);
    }, [watchStartDate, validityInfo, form]);

    // Update salary when employee information, company information, career changed
    useEffect(() => {
        const fetchData = async () => {
            // If have employee information and company information then call api to get salary information
            if (employeeInfo && companyInfo) {
                const employeeId = employeeInfo.employeeId;
                const companyId = companyInfo.companyId;
                const isNonTechnicalValue = watchCareer;

                const res = await contractService.getContractSalaryInfor(employeeId, companyId, isNonTechnicalValue);
                const { succeeded, data } = res;

                // Success => Update salary information
                if (succeeded && data) {
                    setSalaryInfo(data);
                } else {
                    setSalaryInfo(null);
                }
            } else {
                setSalaryInfo(null);
            }
        };

        if (employeeInfo && companyInfo && watchCareer) fetchData();
    }, [employeeInfo, companyInfo, watchCareer]);

    return (
        <DetailContent>
            <Spin spinning={isLoading}>
                <Form name="contractForm" form={form} layout="vertical" requiredMark={RequiredMark} onFinish={onFinish}>
                    <BaseBreadcrumb dataItem={breadcrumb} />
                    <DetailHeader pageTitle={pageTitle} buttons={buttons} goBack={goBack} />

                    {/* SECTIONS */}
                    <Flex gap={'24px 24px'} vertical>
                        {contractSections.map((section, index) => (
                            <DetailInfo key={index} title={section.title + ' information'}>
                                <DetailFields data={section.columns} />
                            </DetailInfo>
                        ))}
                    </Flex>
                </Form>
            </Spin>

            {/* DIALOG */}
            <DialogCommon
                open={showDateRangeWarningDialog}
                onClose={onCloseDateRangeWarningDialog}
                icon={icons.dialog.warning}
                title={dateRangeWarningDialogTitle}
                content={dateRangeWarningDialogContent}
                buttonType="default-primary"
                hiddenButtonLeft={true}
                buttonRight={dateRangeWarningDialogButtonTitle}
                buttonRightClick={onCloseDateRangeWarningDialog}
            />
        </DetailContent>
    );
};

export default ContractEditPage;
