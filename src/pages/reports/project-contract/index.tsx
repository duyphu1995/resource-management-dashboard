import { useEffect, useState } from 'react';
import { ButtonProps, DatePicker, Form, FormInstance, Input, InputNumber, Tooltip } from 'antd';
import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import BaseSelect from '@/components/common/form/select';
import ReportFilter from '@/components/common/report-filter';
import SubTab from '@/components/common/tab/sub-tab';
import ContractManagement from '@/components/reports/project-contract/contract-management';
import FPContract from '@/components/reports/project-contract/fp-contract';
import ODCContract from '@/components/reports/project-contract/odc-contract';
import Projects from '@/components/reports/project-contract/projects';
import pathnames from '@/pathnames';
import { IFilterData } from '@/types/filter';
import { QuestionCircleFilled } from '@ant-design/icons';
import { handleClickViewListOfNewWindow, handleRemoveValuesFilterHidden, remapUnits } from '@/utils/common';
import TreeSelect from '@/components/common/form/tree-select';
import { IAddNewProjectContractField, IFilterDataParent, IValuesProjectContract } from '@/types/reports/project-contract';
import reportService from '@/services/reports/report';
import useNotify from '@/utils/hook/useNotify';
import FilterDateRange from '@/components/common/list-management/filter/filter-date-range';
import './index.scss';
import DialogDefault from '@/components/common/dialog/default';
import { IReportIndexes } from '@/types/reports/report';
import { TIME_FORMAT } from '@/utils/constants';
import projectContractReportServices from '@/services/reports/project-contract';
import usePermissions from '@/utils/hook/usePermissions';

const breadcrumb = [{ title: pathnames.reports.main.name }, { title: pathnames.reports.projectContractReport.main.name }];

const initialFilterData = {
    fpContract: { contractStatusIds: ['2'] },
    oDCContract: { contractStatusIds: ['2'] },
    projects: { contractStatusIds: ['1'] },
    contractManagement: { contractStatusIds: ['2'] }
};

const ProjectContractReportPage = () => {
    const [filterForm] = Form.useForm();
    const [formModal] = Form.useForm();
    const { havePermission } = usePermissions('ProjectContractList', 'ProjectContract');

    const [loadingFilter, setLoadingFilter] = useState(false);
    const { showNotification } = useNotify();

    const [filterData, setFilterData] = useState<IFilterDataParent>(initialFilterData);
    const [defaultControls, setDefaultControls] = useState<{ [key: string]: IFilterData[] }>({});
    const [activeTab, setActiveTab] = useState<'fpContract' | 'oDCContract' | 'projects' | 'contractManagement'>('fpContract');
    const [controls, setControls] = useState<{ [key: string]: IFilterData[] }>({});
    const [showMoreFilterModal, setShowMoreFilterModal] = useState<boolean>(false);
    const [allIndexes, setAllIndexes] = useState<IReportIndexes>();

    const showMoreFilterButton = controls[activeTab]?.some(filter => !filter.alwaysShow);
    const moreFilterButton = showMoreFilterButton ? { onClick: () => setShowMoreFilterModal(true) } : undefined;

    const moreFilterModal = showMoreFilterButton
        ? {
              open: showMoreFilterModal,
              data: controls[activeTab],
              onClose: () => setShowMoreFilterModal(false),
              onReset: () => handleResetShowMoreFilter(),
              onSave: (newControls: IFilterData[]) => {
                  setControls(prev => ({ ...prev, [activeTab]: newControls }));
                  setShowMoreFilterModal(false);
              }
          }
        : undefined;

    const formatFilterValues = (values: IFilterData, activeTab: string, controls: { [key: string]: IFilterData[] }, filterForm: FormInstance) => {
        const keysToFormat = [
            'dcIds',
            'dcManagerIds',
            'countryIds',
            'accountManagerIds',
            'contractStatusIds',
            'projectTypeIds',
            'marketGroupIds',
            'needActions',
            'unitIds'
        ];

        const formatValue = (value: any) => {
            if (!value) return undefined;
            return Array.isArray(value) ? value.map(String) : [String(value)];
        };

        const filteredValues = handleRemoveValuesFilterHidden(values, filterForm, controls[activeTab]);

        return Object.entries(filteredValues).reduce(
            (acc, [key, value]) => {
                const formattedKey = key.split('_')[0];
                acc[formattedKey] = keysToFormat.includes(formattedKey) ? formatValue(value) : value;
                return acc;
            },
            {} as Record<string, any>
        );
    };

    const handleSubmitFilter = (values: IFilterData) => {
        const formattedValues = formatFilterValues(values, activeTab, controls, filterForm);
        setFilterData(prev => ({ ...prev, [activeTab]: formattedValues }));
    };

    const handleResetShowMoreFilter = () => {
        setFilterData(prev => ({ ...prev, [activeTab]: {} }));
        setControls(prev => ({ ...prev, [activeTab]: defaultControls[activeTab] }));
        setShowMoreFilterModal(false);
    };

    const handleResetFilter = () => {
        const defaultStatusId = activeTab === 'projects' ? '1' : '2';
        setFilterData(prev => ({
            ...prev,
            [activeTab]: { contractStatusIds: [defaultStatusId] }
        }));
    };

    const tabs = [
        {
            key: 'fpContract',
            label: 'FP Contract',
            children: <FPContract filterData={filterData['fpContract']} />
        },
        {
            key: 'oDCContract',
            label: 'ODC Contract',
            children: <ODCContract filterData={filterData['oDCContract']} />
        },
        {
            key: 'projects',
            label: 'Projects',
            children: <Projects filterData={filterData['projects']} />
        },
        {
            key: 'contractManagement',
            label: 'Contract Management',
            children: <ContractManagement filterData={filterData['contractManagement']} allIndexes={allIndexes} />
        }
    ];

    useEffect(() => {
        const fetchData = async () => {
            setLoadingFilter(true);
            try {
                const response = await reportService.getAllIndexes();
                const {
                    succeeded,
                    data = {
                        dcs: [],
                        managers: [],
                        projectCountryBasicDtos: [],
                        marketGroupBasicDtos: [],
                        projectContractStatuses: [],
                        projectStatuses: [],
                        projectTypes: [],
                        units: [],
                        certificates: [],
                        companies: [],
                        departmentUnits: [],
                        projects: [],
                        resourceUnits: [],
                        spanControlTypes: []
                    }
                } = response;

                if (succeeded) {
                    const initControls: { [key: string]: IFilterData[] } = {
                        fpContract: [
                            {
                                key: 'contractId_fpContract',
                                forColumns: [],
                                label: 'Contract ID',
                                control: <Input placeholder="Enter Contract ID" />,
                                alwaysShow: true
                            },
                            {
                                key: 'contractStatusIds_fpContract',
                                forColumns: [],
                                label: 'Status',
                                initialValue: 2,
                                alwaysShow: true,
                                control: (
                                    <BaseSelect
                                        options={data.projectContractStatuses.map(item => ({ label: item.statusName, value: item.statusId }))}
                                        placeholder="Select Status"
                                        allowClear={false}
                                    />
                                )
                            },
                            {
                                key: 'dcIds_fpContract',
                                forColumns: [],
                                label: 'DC Name',
                                control: (
                                    <BaseSelect
                                        options={data.dcs.map(item => ({ label: item.unitName, value: item.unitId }))}
                                        placeholder="Select DC Name"
                                    />
                                )
                            },
                            {
                                key: 'dcManagerIds_fpContract',
                                forColumns: [],
                                label: 'DC Director',
                                control: (
                                    <BaseSelect
                                        options={data.managers.map(item => ({ label: item.fullName, value: item.employeeId }))}
                                        placeholder="Select DC Director"
                                    />
                                )
                            },
                            {
                                key: 'accountManagerIds_fpContract',
                                forColumns: [],
                                label: 'Account Manager',
                                control: (
                                    <BaseSelect
                                        options={data.managers.map(item => ({ label: item.fullName, value: item.employeeId }))}
                                        placeholder="Select Account Manager"
                                    />
                                )
                            },
                            {
                                key: 'countryIds_fpContract',
                                forColumns: [],
                                label: 'Country (Headquater)',
                                control: (
                                    <BaseSelect
                                        options={data.projectCountryBasicDtos.map(item => ({ label: item.countryName, value: item.countryId }))}
                                        placeholder="Select Country (Headquater)"
                                    />
                                )
                            },
                            {
                                key: 'marketGroupIds_fpContract',
                                forColumns: [],
                                label: 'Market',
                                control: (
                                    <BaseSelect
                                        options={data.marketGroupBasicDtos.map(item => ({ label: item.marketplaceName, value: item.marketplaceId }))}
                                        placeholder="Select Market"
                                    />
                                )
                            },
                            {
                                key: 'contractStartDate_fpContract',
                                forColumns: [],
                                label: 'Contract Start Date',
                                childrenKey: ['fromStartDate_fpContract', 'toStartDate_fpContract'],
                                control: <FilterDateRange fromName="fromStartDate_fpContract" toName="toStartDate_fpContract" />
                            },
                            {
                                key: 'contractEndDate_fpContract',
                                forColumns: [],
                                label: 'Contract End Date',
                                childrenKey: ['fromEndDate_fpContract', 'toEndDate_fpContract'],
                                control: <FilterDateRange fromName="fromEndDate_fpContract" toName="toEndDate_fpContract" />
                            }
                        ],
                        oDCContract: [
                            {
                                key: 'contractId_oDCContract',
                                forColumns: [],
                                label: 'Contract ID',
                                control: <Input placeholder="Enter Contract ID" />,
                                alwaysShow: true
                            },
                            {
                                key: 'contractStatusIds_oDCContract',
                                forColumns: [],
                                label: 'Status',
                                initialValue: 2,
                                alwaysShow: true,
                                control: (
                                    <BaseSelect
                                        options={data.projectContractStatuses.map(item => ({ label: item.statusName, value: item.statusId }))}
                                        placeholder="Select Status"
                                        allowClear={false}
                                    />
                                )
                            },
                            {
                                key: 'dcIds_oDCContract',
                                forColumns: [],
                                label: 'DC Name',
                                control: (
                                    <BaseSelect
                                        options={data.dcs.map(item => ({ label: item.unitName, value: item.unitId }))}
                                        placeholder="Select DC Name"
                                    />
                                )
                            },
                            {
                                key: 'dcManagerIds_oDCContract',
                                forColumns: [],
                                label: 'DC Director',
                                control: (
                                    <BaseSelect
                                        options={data.managers.map(item => ({ label: item.fullName, value: item.employeeId }))}
                                        placeholder="Select DC Director"
                                    />
                                )
                            },
                            {
                                key: 'accountManagerIds_oDCContract',
                                forColumns: [],
                                label: 'Account Manager',
                                control: (
                                    <BaseSelect
                                        options={data.managers.map(item => ({ label: item.fullName, value: item.employeeId }))}
                                        placeholder="Select Account Manager"
                                    />
                                )
                            },
                            {
                                key: 'countryIds_oDCContract',
                                forColumns: [],
                                label: 'Country (Headquater)',
                                control: (
                                    <BaseSelect
                                        options={data.projectCountryBasicDtos.map(item => ({ label: item.countryName, value: item.countryId }))}
                                        placeholder="Select Country (Headquater)"
                                    />
                                )
                            },
                            {
                                key: 'marketGroupIds_oDCContract',
                                forColumns: [],
                                label: 'Market',
                                control: (
                                    <BaseSelect
                                        options={data.marketGroupBasicDtos.map(item => ({ label: item.marketplaceName, value: item.marketplaceId }))}
                                        placeholder="Select Market"
                                    />
                                )
                            },
                            {
                                key: 'contractStartDate_oDCContract',
                                forColumns: [],
                                label: 'Contract Start Date',
                                childrenKey: ['fromStartDate_oDCContract', 'toStartDate_oDCContract'],
                                control: <FilterDateRange fromName="fromStartDate_oDCContract" toName="toStartDate_oDCContract" />
                            },
                            {
                                key: 'needActions_oDCContract',
                                forColumns: [],
                                label: 'Need Action',
                                control: (
                                    <BaseSelect
                                        options={[
                                            { label: 'Renewal Contract', value: 'renewal' },
                                            { label: 'Overdued Contract', value: 'overdued' }
                                        ]}
                                        placeholder="Select Need Action"
                                    />
                                )
                            }
                        ],
                        projects: [
                            {
                                key: 'contractStatusIds_projects',
                                forColumns: [],
                                label: 'Status',
                                initialValue: 1,
                                alwaysShow: true,
                                control: (
                                    <BaseSelect
                                        options={data.projectStatuses.map(item => ({ label: item.statusName, value: item.statusId }))}
                                        placeholder="Select Status"
                                        allowClear={false}
                                    />
                                )
                            },
                            {
                                key: 'unitIds_projects',
                                forColumns: [],
                                label: 'Project',
                                control: <TreeSelect treeData={remapUnits(data.units)} placeholder="Select Project" />
                            },
                            {
                                key: 'countryIds_projects',
                                forColumns: [],
                                label: 'Country',
                                control: (
                                    <BaseSelect
                                        options={data.projectCountryBasicDtos.map(item => ({ label: item.countryName, value: item.countryId }))}
                                        placeholder="Select Country"
                                    />
                                )
                            },
                            {
                                key: 'marketGroupIds_projects',
                                forColumns: [],
                                label: 'Market Group',
                                control: (
                                    <BaseSelect
                                        options={data.marketGroupBasicDtos.map(item => ({ label: item.marketplaceName, value: item.marketplaceId }))}
                                        placeholder="Select Market"
                                    />
                                )
                            },
                            {
                                key: 'projectTypeIds_projects',
                                forColumns: [],
                                label: 'Project Type',
                                control: (
                                    <BaseSelect
                                        options={data.projectTypes.map(item => ({ label: item.projectTypeName, value: item.projectTypeId }))}
                                        placeholder="Select Project Type"
                                    />
                                )
                            },
                            {
                                key: 'customerName_projects',
                                forColumns: [],
                                label: 'Customer Name',
                                control: <Input placeholder="Enter Customer Name" />
                            },
                            {
                                key: 'technology_projects',
                                forColumns: [],
                                label: 'Technology',
                                control: <Input placeholder="Enter Technology" />
                            },
                            {
                                key: 'startDate_projects',
                                forColumns: [],
                                label: 'Start Date',
                                childrenKey: ['fromStartDate_projects', 'toStartDate_projects'],
                                control: <FilterDateRange fromName="fromStartDate_projects" toName="toStartDate_projects" />
                            },
                            {
                                key: 'endDate_projects',
                                forColumns: [],
                                label: 'End Date',
                                childrenKey: ['fromEndDate_projects', 'toEndDate_projects'],
                                control: <FilterDateRange fromName="fromEndDate_projects" toName="toEndDate_projects" />
                            }
                        ],
                        contractManagement: [
                            {
                                key: 'contractId_contractManagement',
                                forColumns: [],
                                label: 'Contract ID',
                                control: <Input placeholder="Enter Contract ID" />,
                                alwaysShow: true
                            },
                            {
                                key: 'contractStatusIds_contractManagement',
                                forColumns: [],
                                label: 'Status',
                                initialValue: 2,
                                control: (
                                    <BaseSelect
                                        options={data.projectContractStatuses.map(item => ({ label: item.statusName, value: item.statusId }))}
                                        placeholder="Select Status"
                                        allowClear={false}
                                    />
                                ),
                                alwaysShow: true
                            },
                            {
                                key: 'projectTypeIds_contractManagement',
                                forColumns: [],
                                label: 'Contract Type',
                                control: (
                                    <BaseSelect
                                        options={data.projectTypes.map(item => ({ label: item.projectTypeName, value: item.projectTypeId }))}
                                        placeholder="Select Contract Type"
                                    />
                                )
                            },
                            {
                                key: 'dcIds_contractManagement',
                                forColumns: [],
                                label: 'DC Name',
                                control: (
                                    <BaseSelect
                                        options={data.dcs.map(item => ({ label: item.unitName, value: item.unitId }))}
                                        placeholder="Select DC Name"
                                    />
                                )
                            },
                            {
                                key: 'dcManagerIds_contractManagement',
                                forColumns: [],
                                label: 'DC Director',
                                control: (
                                    <BaseSelect
                                        options={data.managers.map(item => ({ label: item.fullName, value: item.employeeId }))}
                                        placeholder="Select DC Director"
                                    />
                                )
                            },
                            {
                                key: 'accountManagerIds_contractManagement',
                                forColumns: [],
                                label: 'Account Manager',
                                control: (
                                    <BaseSelect
                                        options={data.managers.map(item => ({ label: item.fullName, value: item.employeeId }))}
                                        placeholder="Select Account Manager"
                                    />
                                )
                            },
                            {
                                key: 'countryIds_contractManagement',
                                forColumns: [],
                                label: 'Country (Headquater)',
                                control: (
                                    <BaseSelect
                                        options={data.projectCountryBasicDtos.map(item => ({ label: item.countryName, value: item.countryId }))}
                                        placeholder="Select Country (Headquater)"
                                    />
                                )
                            },
                            {
                                key: 'marketGroupIds_contractManagement',
                                forColumns: [],
                                label: 'Market',
                                control: (
                                    <BaseSelect
                                        options={data.marketGroupBasicDtos.map(item => ({ label: item.marketplaceName, value: item.marketplaceId }))}
                                        placeholder="Select Market"
                                    />
                                )
                            },
                            {
                                key: 'contractStartDate_contractManagement',
                                forColumns: [],
                                label: 'Contract Start Date',
                                childrenKey: ['fromStartDate_contractManagement', 'toStartDate_contractManagement'],
                                control: <FilterDateRange fromName="fromStartDate_contractManagement" toName="toStartDate_contractManagement" />
                            }
                        ]
                    };

                    const initProjectContractFields: IAddNewProjectContractField[] = [
                        {
                            label: 'Contract ID',
                            name: 'projectContractName',
                            rules: [
                                {
                                    required: true,
                                    message: 'Please enter the valid value'
                                }
                            ],
                            component: <Input placeholder="Enter Contract ID" />
                        },
                        {
                            label: 'DC',
                            name: 'dcId',
                            rules: [
                                {
                                    required: true,
                                    message: 'Please select the valid value'
                                }
                            ],
                            component: (
                                <BaseSelect
                                    options={data?.dcs.map(item => ({ label: item.unitName, value: item.unitId }))}
                                    placeholder="Select DC"
                                    onChange={value => formModal.setFieldValue('dcManagerId', data?.dcs.find(dc => dc.unitId === value)?.managedBy)}
                                />
                            )
                        },
                        {
                            label: 'DC Director',
                            name: 'dcManagerId',
                            rules: [
                                {
                                    required: true,
                                    message: 'Please select the valid value'
                                }
                            ],
                            component: (
                                <BaseSelect
                                    options={data?.managers.map(item => ({ label: item.fullName, value: item.employeeId }))}
                                    placeholder="Select DC Director"
                                />
                            )
                        },
                        {
                            label: 'Account Manager',
                            name: 'accountManagerId',
                            rules: [
                                {
                                    required: true,
                                    message: 'Please select the valid value'
                                }
                            ],
                            component: (
                                <BaseSelect
                                    options={data?.managers.map(item => ({ label: item.fullName, value: item.employeeId }))}
                                    placeholder="Select User"
                                />
                            )
                        },
                        {
                            label: 'Contract Type',
                            name: 'projectTypeId',
                            rules: [
                                {
                                    required: true,
                                    message: 'Please select the valid value'
                                }
                            ],
                            component: (
                                <BaseSelect
                                    options={data?.projectTypes.map(item => ({ label: item.projectTypeName, value: item.projectTypeId }))}
                                    placeholder="Select Type"
                                    onChange={handleChangeProjectType}
                                />
                            )
                        },
                        {
                            label: 'Status',
                            name: 'contractStatusId',
                            initialValue: 1,
                            component: (
                                <BaseSelect
                                    options={data?.projectContractStatuses.map(item => ({ label: item.statusName, value: item.statusId }))}
                                    allowClear={false}
                                />
                            )
                        },
                        {
                            label: 'Customer Name',
                            name: 'customerName',
                            rules: [
                                {
                                    required: true,
                                    message: 'Please enter the valid value'
                                }
                            ],
                            component: <Input placeholder="Enter Customer Name" />
                        },
                        {
                            label: 'Country',
                            name: 'countryId',
                            rules: [
                                {
                                    required: true,
                                    message: 'Please select the valid value'
                                }
                            ],
                            component: (
                                <BaseSelect
                                    options={data?.projectCountryBasicDtos.map(item => ({ label: item.countryName, value: item.countryId }))}
                                    placeholder="Select Country"
                                    onChange={value =>
                                        formModal.setFieldValue(
                                            'marketGroupId',
                                            data?.projectCountryBasicDtos.find(item => item.countryId === value)?.marketGroupId
                                        )
                                    }
                                />
                            )
                        },
                        {
                            label: 'Market',
                            name: 'marketGroupId',
                            rules: [
                                {
                                    required: true,
                                    message: 'Please select the valid value'
                                }
                            ],
                            component: (
                                <BaseSelect
                                    options={data?.marketGroupBasicDtos.map(item => ({
                                        label: item.marketplaceName,
                                        value: item.marketplaceId
                                    }))}
                                    placeholder="Select Market Group"
                                />
                            )
                        },
                        {
                            label: 'Start Date',
                            name: 'startDate',
                            component: <DatePicker placeholder="Choose date" format={value => value.format(TIME_FORMAT.US_DATE)} />
                        },
                        {
                            label: 'End Date',
                            name: 'endDate',
                            component: <DatePicker placeholder="Choose date" format={value => value.format(TIME_FORMAT.US_DATE)} />
                        },
                        {
                            label: 'Effective Date',
                            name: 'effectiveDate',
                            component: <DatePicker placeholder="Choose date" format={value => value.format(TIME_FORMAT.US_DATE)} />
                        },
                        {
                            label: 'Renewal Date',
                            name: 'renewalDate',
                            component: <DatePicker placeholder="Choose date" format={value => value.format(TIME_FORMAT.US_DATE)} />
                        },
                        {
                            label: 'Contract Billable (MMs)',
                            name: 'contractBillable',
                            isShow: false,
                            component: <InputNumber placeholder="Must be greater than 0" min={0} />
                        },
                        {
                            label: 'Approved Effort (MMs)',
                            name: 'approvedEffort',
                            isShow: false,
                            component: <InputNumber placeholder="Must be greater than 0" min={0} />
                        }
                    ];

                    setDefaultControls(initControls);
                    setControls(initControls);
                    setAllIndexes(data);
                    setAddNewProjectContractFields(initProjectContractFields);
                }
            } catch (error) {
                showNotification(false, 'Failed to load data');
            } finally {
                setLoadingFilter(false);
            }
        };

        fetchData();
    }, [showNotification, formModal]);

    const [isModalVisible, setModalVisible] = useState(false);

    const handleSubmitAddNewContract = async (values: IValuesProjectContract) => {
        try {
            const response = await projectContractReportServices.addProjectContract(values);
            const { succeeded, message } = response;
            if (succeeded) {
                setModalVisible(false);
                formModal.resetFields();
                setFilterData(prev => ({ ...prev, [activeTab]: { ...prev[activeTab] } }));
            }

            showNotification(true, message);
        } catch (error) {
            showNotification(false, 'Failed to add new contract');
        }
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        formModal.resetFields();
        setAddNewProjectContractFields(prev =>
            prev.map(item => {
                if (item.name === 'contractBillable' || item.name === 'approvedEffort') {
                    return {
                        ...item,
                        isShow: false
                    };
                }
                return item;
            })
        );
    };

    const moreButtons: ButtonProps[] =
        activeTab === 'contractManagement' && havePermission('Add') ? [{ children: 'Add New Contract', onClick: () => setModalVisible(true) }] : [];

    const handleChangeProjectType = (value: number) => {
        setAddNewProjectContractFields(prev =>
            prev.map(item => {
                if (item.name === 'contractBillable' || item.name === 'approvedEffort') {
                    return {
                        ...item,
                        isShow: (item.name === 'contractBillable' && value === 1) || (item.name === 'approvedEffort' && value === 2)
                    };
                }

                return item;
            })
        );
    };

    const [addNewProjectContractFields, setAddNewProjectContractFields] = useState<IAddNewProjectContractField[]>([]);

    const renderContentModal = (
        <Form form={formModal} onFinish={handleSubmitAddNewContract} className="form-modal">
            {addNewProjectContractFields
                .filter(({ isShow = true }) => isShow)
                .map((field, index) => (
                    <Form.Item key={index} label={field.label} name={field.name} rules={field.rules} initialValue={field.initialValue}>
                        {field.component}
                    </Form.Item>
                ))}
        </Form>
    );

    return (
        <DetailContent rootClassName="project-contract">
            <BaseBreadcrumb dataItem={breadcrumb} />
            <ReportFilter
                pageTitle={pathnames.reports.projectContractReport.main.name}
                loading={loadingFilter}
                data={controls[activeTab]}
                filterForm={filterForm}
                onResetFilter={handleResetFilter}
                onFilter={handleSubmitFilter}
                moreFilterButton={moreFilterButton}
                moreFilterModal={moreFilterModal}
                resetFields={defaultControls[activeTab]?.map(filter => filter.key)}
                moreButtons={moreButtons}
            />
            <SubTab
                items={tabs}
                onChange={(key: string) => setActiveTab(key as 'fpContract' | 'oDCContract' | 'projects' | 'contractManagement')}
                centered
                tabBarExtraContent={
                    <Tooltip title="Project Contract Information">
                        <QuestionCircleFilled
                            className="sub-tab-extra"
                            onClick={() => handleClickViewListOfNewWindow(pathnames.reports.projectContractReport.quickStartGuide.path)}
                        />
                    </Tooltip>
                }
            />

            <DialogDefault
                isShow={isModalVisible}
                content={renderContentModal}
                title="Add New Project Contract"
                onCancel={handleCloseModal}
                width={1200}
                onOk={() => formModal.submit()}
                loading={loadingFilter}
            />
        </DetailContent>
    );
};

export default ProjectContractReportPage;
