import DialogCommon from '@/components/common/dialog/dialog-common/dialog-common';
import BaseDivider from '@/components/common/divider';
import DatePicker from '@/components/common/form/date-picker';
import RequiredMark from '@/components/common/form/required-mark';
import BaseSelect from '@/components/common/form/select';
import ButtonsIcon from '@/components/common/table/buttons-icon';
import { renderBooleanStatus, renderWithFallback } from '@/components/common/table/render-data-table-common';
import TableHaveAdd from '@/components/common/table/table-add';
import pathnames from '@/pathnames';
import contractorService from '@/services/hr-management/contractor-management';
import { IField, ITableHaveActionAddProps } from '@/types/common';
import { IContractAddEditIndexes, IContractCompany } from '@/types/hr-management/contract-management';
import { IContractor, IContractorContract } from '@/types/hr-management/contractor-management';
import {
    filterNullProperties,
    formatDataTable,
    formatTimeMonthDayYear,
    validate1000Characters,
    validateEnterValidValue,
    validateSelectValidValue
} from '@/utils/common';
import { TIME_FORMAT } from '@/utils/constants';
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';
import icons from '@/utils/icons';
import { Button, Col, Form, FormInstance, Input, Layout, Modal, Radio, Row } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import { ColumnsType } from 'antd/es/table';
import Title from 'antd/es/typography/Title';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './index.scss';

export interface IContractInfoSection {
    title: string;
    columns: IField[];
}

interface IResponse<T> {
    succeeded: boolean;
    data: T | null;
}

const TableContractorContract = (props: ITableHaveActionAddProps<IContractor>) => {
    const { dataProps, setIsReload, contracts } = props;

    const [form] = Form.useForm();
    const { contractorId = '' } = useParams();
    const { showNotification } = useNotify();
    const { havePermission } = usePermissions('ContractorContract', 'ContractorManagement');

    const [isShowModalAdd, setIsShowModalAdd] = useState<boolean>(false);
    const [employeeInfo, setEmployeeInfo] = useState<IContractorContract | null>();
    const [careerOptions, setCareerOptions] = useState<DefaultOptionType[]>([]);
    const [companyInfo, setCompanyInfo] = useState<IContractCompany | null>();
    const [companyOptions, setCompanyOptions] = useState<DefaultOptionType[]>([]);
    const [contractId, setContractId] = useState<number | undefined>();
    const [contractIndexes, setContractIndexes] = useState<IContractAddEditIndexes>();
    const [professionalTitles, setProfessionalTitles] = useState<string>('');
    const [isShowModalDelete, setIsShowModalDelete] = useState<boolean>(false);
    const [isShowModalWarning, setIsShowModalWarning] = useState<boolean>(false);
    const [dataDelete, setDataDelete] = useState<IContractorContract>();
    const [dataWarning, setDataWarning] = useState<IContractorContract>();
    const [mode, setMode] = useState<'ADD' | 'EDIT'>('ADD');

    const watchCompanyId = Form.useWatch('companyId', form);
    const contentDelete = (
        <>
            The contractor contract of <b>{dataProps?.fullName}</b> - <b>{dataDelete?.contractId}</b> has start date&nbsp;
            <b>{dataDelete?.startDate}</b> and end date <b>{dataDelete?.endDate}</b> will be deleted. Are you sure you want to delete ?
        </>
    );
    const contentWarning = (
        <>
            This contractor <b>{dataWarning?.fullName}</b> already has an existing future contract <b>{dataWarning?.contractId}</b> on Start Date{' '}
            <b>{dataWarning?.startDate}</b> - End Date <b>{dataWarning?.endDate}</b>. User cannot create a new contract which conflict to existing
            future contract. Please help to check again.
        </>
    );
    const columnsContractorContract: ColumnsType<IContractorContract> = [
        {
            dataIndex: 'contractId',
            key: 'contractId',
            title: 'ID',
            fixed: 'left',
            width: 50,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'contractTypeName',
            key: 'contractTypeName',
            title: 'Contract Type',
            width: 150,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'isNonTechnical',
            key: 'isNonTechnical',
            align: 'center',
            title: 'Non Technical',
            width: 92,
            render: item => renderBooleanStatus(item, 'isNonTechnical')
        },
        {
            dataIndex: 'startDate',
            key: 'startDate',
            title: 'Start Date',
            width: 110,
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'endDate',
            key: 'endDate',
            title: 'End Date',
            width: 98,
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'signOrder',
            key: 'signOrder',
            title: 'Sign Order',
            width: 98,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'workingWeek',
            key: 'workingWeek',
            title: 'Actual Working Days Per Week',
            width: 180,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'isRenewalContract',
            key: 'isRenewalContract',
            title: 'Renew Approval',
            width: 100,
            render: item => {
                if (item) {
                    return 'Approved';
                } else {
                    return 'Pending';
                }
            }
        },
        {
            dataIndex: 'contractStatus',
            key: 'contractStatus',
            title: 'Status',
            width: 100,
            render: item => renderWithFallback(item)
        },
        {
            title: 'Action',
            width: 100,
            fixed: 'right',
            align: 'center',
            render: (item: IContractorContract) => {
                const { contractStatus } = item;
                const handleClickEdit = (item: IContractorContract) => {
                    const { contractId } = item || {};
                    setMode('EDIT');
                    setContractId(contractId);
                    setIsShowModalAdd(true);
                };

                const handleClickDelete = (item: IContractorContract) => {
                    setIsShowModalDelete(true);
                    setDataDelete(item);
                };

                return (
                    <ButtonsIcon
                        items={[
                            contractStatus === 'Active' || contractStatus === 'Inactive'
                                ? {
                                      icon: icons.tableAction.edit,
                                      iconAlt: 'Edit contractor contract',
                                      onClick: () => handleClickEdit(item),
                                      disabled: dataProps?.isContractorDisabled,
                                      tooltip: 'Edit'
                                  }
                                : undefined,
                            {
                                icon: icons.tableAction.print,
                                iconAlt: 'print contractor contract',
                                tooltip: 'Print',
                                onClick: () => window.open(pathnames.hrManagement.contractorManagement.print.path + '/' + item.contractId),
                                disabled: dataProps?.isContractorDisabled
                            },
                            contractStatus === 'Inactive'
                                ? {
                                      icon: icons.tableAction.delete,
                                      iconAlt: 'Edit contractor contract',
                                      onClick: () => handleClickDelete(item),
                                      disabled: dataProps?.isContractorDisabled,
                                      tooltip: 'Delete'
                                  }
                                : undefined
                        ]}
                    />
                );
            }
        }
    ];

    const renderNull = (value: string | number | null | undefined) => {
        return <div className="center-item">{value || '-'}</div>;
    };

    const employeeCols: IField[] = [
        {
            label: 'Full Name',
            value: renderNull(employeeInfo?.fullName)
        },
        {
            label: 'Contractor ID',
            value: renderNull(employeeInfo?.contractorBadgeId)
        },
        {
            label: 'DOB',
            value: renderNull(employeeInfo?.birthday)
        },
        {
            label: 'Place Of Birth',
            value: renderNull(employeeInfo?.birthPlace)
        },

        {
            name: 'isNonTechnical',
            label: 'Career',
            value: (
                <BaseSelect
                    options={careerOptions}
                    allowClear={false}
                    placeholder="Select career"
                    onChange={value => {
                        const isNonTechnical = value === 'true';
                        const newProfessionalTitles = contractIndexes?.careersInfor.find(item => item.isNonTechnical === isNonTechnical);

                        setProfessionalTitles(newProfessionalTitles?.career || '');
                    }}
                />
            ),
            validation: [validateSelectValidValue]
        },
        {
            label: 'Address',
            value: renderNull(employeeInfo?.contactAddress)
        },
        {
            label: 'ID Card',
            value: renderNull(employeeInfo?.idCardNo)
        },
        {
            label: 'Issued Date',
            value: renderNull(formatTimeMonthDayYear(employeeInfo?.idCardIssueDate))
        },
        {
            label: 'Issued Place',
            value: renderNull(employeeInfo?.idCardIssuePlace)
        }
    ];

    const companyCols: IField[] = [
        {
            name: 'companyId',
            label: 'Company Name',
            value: <BaseSelect options={companyOptions} placeholder="Select company" />,
            validation: [validateEnterValidValue]
        },
        {
            label: 'Ms/Mr',
            value: renderNull(companyInfo?.companyOwner)
        },
        {
            label: 'Position',
            value: renderNull(companyInfo?.ownerPosition)
        },
        {
            label: 'Represent For',
            value: renderNull(companyInfo?.representFor)
        },
        {
            label: 'Address',
            value: renderNull(companyInfo?.companyAddress)
        },
        {
            label: 'Phone',
            value: renderNull(companyInfo?.companyPhone)
        }
    ];

    const renderApproval = () => {
        const isRenewalContract = form.getFieldValue('isRenewalContract');

        return (
            <div className="container">
                {typeof isRenewalContract === 'boolean' && (
                    <Radio.Group defaultValue={isRenewalContract}>
                        <Radio value={false}>Pending</Radio>
                        <Radio value={true}>Approved</Radio>
                    </Radio.Group>
                )}
            </div>
        );
    };

    const handleDisableDateStartDate = (currentDate: Dayjs) => {
        const endDate = form.getFieldValue('endDate');
        if (mode === 'EDIT') {
            return currentDate.isBefore(dayjs().subtract(1, 'day')) || currentDate.isAfter(endDate);
        }
        return endDate && currentDate.isAfter(endDate);
    };

    const handleDisableDateEndDate = (currentDate: Dayjs) => {
        const startDate = form.getFieldValue('startDate');
        return startDate && currentDate.isBefore(startDate);
    };

    const isStartDateBeforeTomorrow = (form: FormInstance): boolean | undefined => {
        const startDate = form.getFieldValue('startDate');
        if (mode === 'EDIT' && startDate) {
            return startDate.isBefore(dayjs().subtract(1, 'day'));
        }
        return false;
    };

    const contractCols: IField[] = [
        {
            label: 'Contract Type',
            value: renderNull(employeeInfo?.contractTypeName)
        },
        {
            label: 'Start Date',
            name: 'startDate',
            value: <DatePicker disabledDate={handleDisableDateStartDate} disabled={isStartDateBeforeTomorrow(form)} />,
            validation: [{ required: true, message: 'Please select start date' }]
        },
        {
            label: 'End Date',
            name: 'endDate',
            value: <DatePicker disabledDate={handleDisableDateEndDate} />,
            validation: [{ required: true, message: 'Please select start date' }]
        },
        {
            label: 'Workplace',
            value: renderNull(companyInfo?.companyName)
        },
        {
            label: 'Professional Titles',
            value: renderNull(professionalTitles)
        },
        {
            label: 'Position',
            value: renderNull(employeeInfo?.position)
        },
        {
            label: 'Renew Approval',
            name: 'isRenewalContract',
            value: renderApproval()
        },
        {
            label: 'Actual Working Days Per Week',
            name: 'workingWeek',
            value: <Input placeholder="Enter actual working days per week" />
        },
        {
            label: 'Note',
            name: 'notes',
            value: <Input.TextArea placeholder="Enter note" className="text-area-item" />,
            validation: [validate1000Characters]
        }
    ];

    const contractSections: IContractInfoSection[] = [
        { title: 'Employee', columns: employeeCols },
        { title: 'Company', columns: companyCols },
        { title: 'Contract', columns: contractCols }
    ];

    useEffect(() => {
        const fetchData = async () => {
            if (typeof contractId === 'number') {
                const res = await contractorService.getContractorContractDetail(contractId);
                const { succeeded, data } = res;

                if (succeeded && data) {
                    const isNonTechnical = contractIndexes?.careersInfor.find(item => item.isNonTechnical === data?.isNonTechnical);

                    setProfessionalTitles(isNonTechnical?.career || '');
                    setEmployeeInfo(data);

                    const { companyId, startDate, endDate, isRenewalContract, workingWeek } = data || {};
                    form.setFieldsValue({
                        isNonTechnical: data.isNonTechnical.toString(),
                        companyId,
                        startDate: dayjs(startDate, TIME_FORMAT.VN_DATE),
                        endDate: dayjs(endDate, TIME_FORMAT.VN_DATE),
                        isRenewalContract,
                        workingWeek,
                        comment: data?.comment
                    });
                }
            }
        };

        if (mode !== 'ADD' && contractId && isShowModalAdd) fetchData();
    }, [contractId, contractIndexes, mode, form, isShowModalAdd]);

    const formatDateString = (dateString: string) => {
        return dayjs(dateString)?.format(TIME_FORMAT.DATE);
    };

    const formatContractorContract = (data: IContractorContract) => {
        const { startDate, endDate, isNonTechnical, isRenewalContract } = data || {};

        return {
            ...data,
            contractId: mode === 'ADD' ? null : contractId,
            contractorId: parseInt(contractorId),
            startDate: formatDateString(startDate),
            endDate: formatDateString(endDate),
            isNonTechnical: JSON.parse(isNonTechnical.toString()),
            isRenewalContract: isRenewalContract && JSON.parse(isRenewalContract.toString())
        };
    };

    // Handle submit
    const handleSubmit = async (item: IContractorContract) => {
        const { startDate, endDate } = item || {};

        // Check date range conflict
        const res = (await contractorService.getByDateRange(
            parseInt(contractorId),
            formatDateString(startDate),
            formatDateString(endDate)
        )) as IResponse<IContractorContract>;

        const { succeeded, data } = res;
        if (succeeded && data) {
            if (mode === 'ADD' || (mode === 'EDIT' && data?.contractId !== contractId)) {
                setIsShowModalWarning(true);
                setDataWarning(data);
                setIsShowModalAdd(false);
                return;
            }
        }

        const dataFormat = filterNullProperties(formatContractorContract(item));

        if (mode === 'ADD') {
            const resAdd = await contractorService.addContractorContract(dataFormat);
            const { succeeded, message } = resAdd;
            showNotification(succeeded, message);
        } else {
            if (contractId) await contractorService.updateContractorContract(contractId, dataFormat);
        }
        setIsShowModalAdd(false);
        form.validateFields();
        form.resetFields();
        setIsReload?.({});
    };

    // Handle cancel submit
    const handleCancelSubmit = () => {
        setIsShowModalAdd(false);
        form.resetFields();
    };

    const renderSections = (sections: IContractInfoSection[]) => {
        return <div className="box-content-container">{sections.map(section => renderSection(section))}</div>;
    };

    const renderSection = ({ title = '', columns }: IContractInfoSection) => {
        return (
            <div className="box-form-group form-employee-info" key={title}>
                <Title level={4} className="box-form-title">
                    {title} Information
                </Title>
                {renderSectionContent(columns)}
            </div>
        );
    };

    const renderSectionContent = (data: IField[]) => {
        return (
            <div className="box-row-group">
                <Row gutter={[24, 24]}>
                    {data.map((item, index) => {
                        const { name, label, validation, value, initValue, hidden } = item;

                        return (
                            <Col span={6} key={`${name}_${index}`} hidden={hidden}>
                                <Form.Item name={name} label={label} htmlFor="" rules={validation} initialValue={initValue} className="box-col-group">
                                    {value}
                                </Form.Item>
                            </Col>
                        );
                    })}
                </Row>
            </div>
        );
    };

    const renderContent = () => {
        return (
            <Form name="contractorContractForm" form={form} onFinish={handleSubmit} layout="vertical" requiredMark={RequiredMark}>
                <BaseDivider margin="16px 0 24px 0" />
                <Layout className="layout-detail">{renderSections(contractSections)}</Layout>
                <BaseDivider margin="24px 0 16px 0" />
                <div className="footer-contractor-contract">
                    <Button onClick={handleCancelSubmit}>Cancel</Button>
                    <Button type="primary" htmlType="submit">
                        Save
                    </Button>
                </div>
            </Form>
        );
    };

    useEffect(() => {
        const newCompanyInfo = contractIndexes?.companiesInfor.find(company => company.companyId === watchCompanyId);

        setCompanyInfo(newCompanyInfo);
    }, [watchCompanyId, form, contractIndexes]);

    useEffect(() => {
        const getIndexForAddNew = async () => {
            const res = await contractorService.getContractorContractIndexForAddNew();
            const { succeeded, data } = res;

            if (succeeded && data) {
                setContractIndexes(data);

                // Set options career
                const newCareerOptions = data?.careersInfor?.map(career => ({ value: career.isNonTechnical.toString(), label: career.career })) || [];
                setCareerOptions(newCareerOptions);

                // Set options company
                const newCompanyOptions = data?.companiesInfor?.map(company => ({ value: company.companyId, label: company.companyName })) || [];
                setCompanyOptions(newCompanyOptions);
            }
        };

        getIndexForAddNew();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            const res = await contractorService.getForAddNewByContractorId(contractorId);
            const { succeeded, data } = res;

            if (succeeded && data) {
                const professionalTitles = contractIndexes?.careersInfor.find(item => item.isNonTechnical === data.isNonTechnical);

                setEmployeeInfo(data);
                setProfessionalTitles(professionalTitles?.career || '');

                form.setFields([
                    { name: 'isNonTechnical', value: data.isNonTechnical.toString() },
                    { name: 'companyId', value: data.companyId, errors: [] },
                    { name: 'isRenewalContract', value: false }
                ]);
            }
        };

        if (mode === 'ADD' && contractIndexes && isShowModalAdd) fetchData();
    }, [contractorId, form, contractIndexes, mode, isShowModalAdd]);

    const handleClickAdd = () => {
        setMode('ADD');
        setIsShowModalAdd(true);
    };

    const handleDelete = async () => {
        if (dataDelete?.contractId) {
            await contractorService.deleteContractorContract(dataDelete?.contractId);
            setIsShowModalDelete(false);
            setIsReload?.({});
        }
    };

    const handleCloseWarning = () => {
        setIsShowModalWarning(false);
        form.resetFields();
        setIsReload?.({});
    };

    return (
        <>
            <TableHaveAdd
                title="Contractor Contract"
                dataSource={formatDataTable(contracts)}
                columns={columnsContractorContract}
                handleAdd={havePermission('Add') ? handleClickAdd : undefined}
                disabled={dataProps?.isContractorDisabled}
                tableScroll={{ x: 1500, y: 516 }}
            />
            {/* add and edit */}
            <Modal
                title={mode === 'ADD' ? 'Add New Contractor Contract' : 'Edit Contractor Contract'}
                open={isShowModalAdd}
                onCancel={handleCancelSubmit}
                className="dialog-contractor-contract"
                width={1272}
                footer={null}
            >
                {renderContent()}
            </Modal>
            {/* delete */}
            <DialogCommon
                open={isShowModalDelete}
                onClose={() => setIsShowModalDelete(false)}
                icon={icons.dialog.delete}
                title="Delete Contractor Contract"
                content={contentDelete}
                buttonType="default-danger"
                buttonLeftClick={() => setIsShowModalDelete(false)}
                buttonRightClick={() => handleDelete()}
            />
            {/* can't create new contract */}
            <DialogCommon
                open={isShowModalWarning}
                onClose={() => setIsShowModalWarning(false)}
                icon={icons.dialog.warning}
                title={mode === 'ADD' ? 'Can’t Create New Contract' : 'Can’t Edit Contract'}
                content={contentWarning}
                buttonType="default-primary"
                hiddenButtonLeft={true}
                buttonRightClick={() => handleCloseWarning()}
                buttonRight="Close"
            />
        </>
    );
};

export default TableContractorContract;
