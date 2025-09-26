import { useCallback, useEffect, useState } from 'react';
import { Button, DatePicker, Form, Input, InputNumber, Modal, Popconfirm, TableColumnsType } from 'antd';
import useNotify from '@/utils/hook/useNotify';
import { formatDataTable, formatNumberWithDecimalPlaces, formatTimeMonthDayYear } from '@/utils/common';
import BaseTable from '@/components/common/table/table';
import projectContractReportServices from '@/services/reports/project-contract';
import {
    IContractManagement,
    IContractModalTable,
    IFilterDataChildren,
    IValuesProjectContract,
    IValuesProjectContractModal
} from '@/types/reports/project-contract';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import icons from '@/utils/icons';
import './index.scss';
import BaseSelect from '@/components/common/form/select';
import { IReportIndexes } from '@/types/reports/report';
import useLoading from '@/utils/hook/useLoading';
import ButtonIcon from '@/components/common/table/buttons-icon/button-icon';
import ButtonsIcon from '@/components/common/table/buttons-icon';
import dayjs, { Dayjs } from 'dayjs';
import { TIME_FORMAT } from '@/utils/constants';
import usePermissions from '@/utils/hook/usePermissions';

const ContractManagement = ({ filterData, allIndexes }: { filterData?: IFilterDataChildren; allIndexes?: IReportIndexes }) => {
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();
    const { havePermission } = usePermissions('ProjectContractList', 'ProjectContract');

    const [formContractManagement] = Form.useForm();

    const [dataReport, setDataReport] = useState<IContractManagement[]>([]);
    const [projectContractId, setProjectContractId] = useState<number>();
    const [contractIdSelected, setContractIdSelected] = useState<string>('');
    const [contractModalData, setContractModalData] = useState<IContractModalTable[]>([]);
    const [isAddingContractModal, setIsAddingContractModal] = useState(false);
    const [loadingModal, setLoadingModal] = useState(false);

    const [editContractManagementId, setEditContractManagementId] = useState<number>();
    const [projectTypeIdSelected, setProjectTypeIdSelected] = useState<number>();
    const [countNumberNameForm, setCountNumberNameForm] = useState<number>(0);

    const fetchDataProjectByContract = async (projectContractId?: number) => {
        setLoadingModal(true);
        try {
            const response = await projectContractReportServices.getProjectByContractModal(projectContractId);
            const { succeeded, data } = response;
            if (succeeded) {
                setContractModalData(formatDataTable(data || []));
            }
        } catch (error) {
            showNotification(false, 'Failed to load data modal');
        } finally {
            setLoadingModal(false);
        }
    };

    const handleOpenModal = (record: { projectContractId: number; contractId: string }) => {
        const { projectContractId, contractId } = record || {};

        setLoadingModal(true);
        fetchDataProjectByContract(projectContractId);
        setProjectContractId(projectContractId);
        setContractIdSelected(contractId);
    };

    const handleDeleteProjectContract = async (projectContractInfoId: number) => {
        turnOnLoading();
        try {
            const response = await projectContractReportServices.deleteProjectContract(projectContractInfoId);
            const { succeeded, message } = response;
            if (succeeded) {
                fetchData();
            }
            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Failed to delete data');
        } finally {
            turnOffLoading();
        }
    };

    const handleGetOptions = (name: string) => {
        switch (name) {
            case 'dcName':
                return allIndexes?.dcs.map(item => ({ label: item.unitName, value: item.unitId })) || [];
            case 'dcManager':
                return allIndexes?.managers.map(item => ({ label: item.fullName, value: item.employeeId })) || [];
            case 'accountManager':
                return allIndexes?.managers.map(item => ({ label: item.fullName, value: item.employeeId })) || [];
            case 'projectTypeName':
                return allIndexes?.projectTypes.map(item => ({ label: item.projectTypeName, value: item.projectTypeId })) || [];
            case 'contractStatusName':
                return allIndexes?.projectContractStatuses.map(item => ({ label: item.statusName, value: item.statusId })) || [];
            case 'countryName':
                return allIndexes?.projectCountryBasicDtos.map(item => ({ label: item.countryName, value: item.countryId }));
            case 'marketplaceGroupName':
                return allIndexes?.marketGroupBasicDtos.map(item => ({ label: item.marketplaceName, value: item.marketplaceId })) || [];

            default:
                return [];
        }
    };

    const handleGetNameFormItem = (name: keyof IContractManagement) => {
        switch (name) {
            case 'contractId':
                return 'projectContractName';
            case 'dcName':
                return 'dcId';
            case 'dcManager':
                return 'dcManagerId';
            case 'accountManager':
                return 'accountManagerId';
            case 'projectTypeName':
                return 'projectTypeId';
            case 'contractStatusName':
                return 'contractStatusId';
            case 'customerName':
                return 'customerName';
            case 'countryName':
                return 'countryId';
            case 'marketplaceGroupName':
                return 'marketGroupId';
            case 'effectiveDate':
                return 'effectiveDate';
            case 'renewalDate':
                return 'renewalDate';
            case 'startDate':
                return 'startDate';
            case 'endDate':
                return 'endDate';

            default:
                return name;
        }
    };

    const getInitValueFormItem = (name: keyof IContractManagement, record: IContractManagement) => {
        let initialValue: string | number | Dayjs | undefined = '';
        const {
            contractId,
            dcId,
            dcManagerId,
            accountManagerId,
            projectTypeId,
            contractStatusId,
            customerName,
            countryId,
            marketplaceGroupId,
            effectiveDate,
            renewalDate,
            startDate,
            endDate,
            contractBillable,
            approvedEffort
        } = record || {};

        switch (name) {
            case 'contractId':
                initialValue = contractId;
                break;
            case 'dcName':
                initialValue = handleGetOptions(name)?.find(item => item.value === dcId)?.value;
                break;
            case 'dcManager':
                initialValue = handleGetOptions(name)?.find(item => item.value === dcManagerId)?.value;
                break;
            case 'accountManager':
                initialValue = handleGetOptions(name)?.find(item => item.value === accountManagerId)?.value;
                break;
            case 'projectTypeName':
                initialValue = handleGetOptions(name)?.find(item => item.value === projectTypeId)?.value;
                break;
            case 'contractStatusName':
                initialValue = handleGetOptions(name)?.find(item => item.value === contractStatusId)?.value;
                break;
            case 'customerName':
                initialValue = customerName;
                break;
            case 'countryName':
                initialValue = handleGetOptions(name)?.find(item => item.value === countryId)?.value;
                break;
            case 'marketplaceGroupName':
                initialValue = handleGetOptions(name)?.find(item => item.value === marketplaceGroupId)?.value;
                break;
            case 'effectiveDate':
                initialValue = effectiveDate ? dayjs(effectiveDate, TIME_FORMAT.VN_DATE) : '';
                break;
            case 'renewalDate':
                initialValue = renewalDate ? dayjs(renewalDate, TIME_FORMAT.VN_DATE) : '';
                break;
            case 'startDate':
                initialValue = startDate ? dayjs(startDate, TIME_FORMAT.VN_DATE) : '';
                break;
            case 'endDate':
                initialValue = endDate ? dayjs(endDate, TIME_FORMAT.VN_DATE) : '';
                break;
            case 'approvedEffort':
                initialValue = approvedEffort;
                break;
            case 'contractBillable':
                initialValue = contractBillable;
                break;

            default:
                return '';
        }

        return initialValue;
    };

    const handleChangeSelect = (value: number, name: string) => {
        if (name === 'projectTypeName' && editContractManagementId) {
            setProjectTypeIdSelected(value);
        }
    };

    const renderColumn = (
        item: string | null,
        record: IContractManagement,
        name: keyof IContractManagement,
        type: 'input' | 'select' | 'date' | 'inputNumber' = 'input'
    ) => {
        if (editContractManagementId && record.projectContractInfoId === editContractManagementId) {
            switch (type) {
                case 'input':
                    return (
                        <Form.Item
                            name={`${handleGetNameFormItem(name)}_${editContractManagementId + countNumberNameForm}`}
                            initialValue={getInitValueFormItem(name, record)}
                            rules={[{ required: true, message: 'Please enter the valid value' }]}
                        >
                            <Input placeholder="Enter value" />
                        </Form.Item>
                    );

                case 'inputNumber':
                    return (
                        <Form.Item
                            name={`${handleGetNameFormItem(name)}_${editContractManagementId + countNumberNameForm}`}
                            initialValue={getInitValueFormItem(name, record)}
                        >
                            <InputNumber placeholder="Enter value" />
                        </Form.Item>
                    );

                case 'select':
                    return (
                        <Form.Item
                            name={`${handleGetNameFormItem(name)}_${editContractManagementId + countNumberNameForm}`}
                            initialValue={getInitValueFormItem(name, record)}
                        >
                            <BaseSelect
                                options={handleGetOptions(name)}
                                placeholder="Select value"
                                dropdownStyle={{ maxHeight: 220 }}
                                onChange={value => handleChangeSelect(value, name)}
                            />
                        </Form.Item>
                    );

                case 'date':
                    return (
                        <Form.Item
                            name={`${handleGetNameFormItem(name)}_${editContractManagementId + countNumberNameForm}`}
                            initialValue={getInitValueFormItem(name, record)}
                        >
                            <DatePicker format={TIME_FORMAT.US_DATE} />
                        </Form.Item>
                    );

                default:
                    return renderWithFallback(item);
            }
        }

        return renderWithFallback(item);
    };

    const renderValueColumn = (value: number | string) =>
        typeof value === 'number' ? formatNumberWithDecimalPlaces(value) : renderWithFallback(value);

    const handleChangeFormSelected = (editContractManagementId?: number, projectTypeNameSelected?: number) => {
        setEditContractManagementId(editContractManagementId);
        setProjectTypeIdSelected(projectTypeNameSelected);
    };

    const columns: TableColumnsType<IContractManagement> = [
        {
            dataIndex: 'contractId',
            key: 'contractId',
            title: 'Contract ID',
            width: 200,
            fixed: 'left',
            render: (item, record) => renderColumn(item, record, 'contractId')
        },
        {
            dataIndex: 'totalProjectInContract',
            key: 'totalProjects',
            title: '#Total Projects',
            width: 150,
            render: (item, record) =>
                havePermission('ViewDetails') ? (
                    <p className="total-projects" onClick={() => handleOpenModal(record)}>
                        {renderWithFallback(item)} {item > 1 ? 'projects' : 'project'}
                    </p>
                ) : (
                    `${renderWithFallback(item)} ${item > 1 ? 'projects' : 'project'}`
                )
        },
        {
            dataIndex: 'dgName',
            key: 'dgName',
            title: 'BU',
            width: 150,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'dgManager',
            key: 'bUHead',
            title: 'BU Head',
            width: 200,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'dcName',
            key: 'dcName',
            title: 'DC',
            width: 150,
            render: (item, record) => renderColumn(item, record, 'dcName', 'select')
        },
        {
            dataIndex: 'dcManager',
            key: 'dcManager',
            title: 'DC Director',
            width: 200,
            render: (item, record) => renderColumn(item, record, 'dcManager', 'select')
        },
        {
            dataIndex: 'accountManager',
            key: 'accountManager',
            title: 'Account Manager',
            width: 200,
            render: (item, record) => renderColumn(item, record, 'accountManager', 'select')
        },
        {
            dataIndex: 'projectTypeName',
            key: 'projectTypeName',
            title: 'Contract Type',
            align: 'center',
            width: 200,
            render: (item, record) => renderColumn(item, record, 'projectTypeName', 'select')
        },
        {
            dataIndex: 'contractStatusName',
            key: 'contractStatusName',
            title: 'Status',
            align: 'center',
            width: 200,
            render: (item, record) => renderColumn(item, record, 'contractStatusName', 'select')
        },
        {
            dataIndex: 'customerName',
            key: 'customerName',
            title: 'Customer Name',
            width: 200,
            render: (item, record) => renderColumn(item, record, 'customerName')
        },
        {
            dataIndex: 'countryName',
            key: 'countryName',
            title: 'Country (Headquater)',
            width: 200,
            render: (item, record) => renderColumn(item, record, 'countryName', 'select')
        },
        {
            dataIndex: 'marketplaceGroupName',
            key: 'marketplaceGroupName',
            title: 'Market',
            width: 200,
            render: (item, record) => renderColumn(item, record, 'marketplaceGroupName', 'select')
        },
        {
            dataIndex: 'effectiveDate',
            key: 'effectiveDate',
            title: 'Effective Date',
            align: 'center',
            width: 180,
            render: (item, record) => renderColumn(formatTimeMonthDayYear(item), record, 'effectiveDate', 'date')
        },
        {
            dataIndex: 'renewalDate',
            key: 'renewalDate',
            title: 'Renewal Date',
            align: 'center',
            width: 180,
            render: (item, record) => renderColumn(formatTimeMonthDayYear(item), record, 'renewalDate', 'date')
        },
        {
            dataIndex: 'startDate',
            key: 'startDate',
            title: 'Start Date',
            align: 'center',
            width: 180,
            render: (item, record) => renderColumn(formatTimeMonthDayYear(item), record, 'startDate', 'date')
        },
        {
            dataIndex: 'endDate',
            key: 'endDate',
            title: 'End Date',
            align: 'center',
            width: 180,
            render: (item, record) => renderColumn(formatTimeMonthDayYear(item), record, 'endDate', 'date')
        },
        {
            dataIndex: 'contractBillable',
            key: 'contractBillable',
            title: 'Contracted Billable (ODC - MM)',
            align: 'center',
            width: 250,
            render: (item, record) =>
                projectTypeIdSelected === 1 ? renderColumn(item, record, 'contractBillable', 'inputNumber') : renderValueColumn(item)
        },
        {
            dataIndex: 'approvedEffort',
            key: 'approvedEffort',
            title: 'Approved Effort (FP - MM)',
            align: 'center',
            width: 220,
            render: (item, record) =>
                projectTypeIdSelected === 2 ? renderColumn(item, record, 'approvedEffort', 'inputNumber') : renderValueColumn(item)
        },
        ...(havePermission('Edit') || havePermission('Delete')
            ? [
                  {
                      title: 'Action',
                      key: 'action',
                      fixed: 'right' as const,
                      width: 100,
                      render: (record: IContractManagement) => {
                          if (editContractManagementId) {
                              if (record.projectContractInfoId === editContractManagementId) {
                                  return (
                                      <ButtonsIcon
                                          items={[
                                              {
                                                  icon: icons.tableAction.approval,
                                                  tooltip: 'Save',
                                                  htmlType: 'submit'
                                              },
                                              {
                                                  icon: icons.tableAction.disApprove,
                                                  tooltip: 'Clear',
                                                  onClick: () => {
                                                      handleChangeFormSelected(undefined, undefined);
                                                      formContractManagement.resetFields();
                                                  }
                                              }
                                          ]}
                                      />
                                  );
                              } else return null;
                          }

                          return (
                              <div className="actions-group">
                                  {havePermission('Edit') && (
                                      <ButtonIcon
                                          icon={icons.tableAction.edit}
                                          tooltip="Edit"
                                          onClick={() => handleChangeFormSelected(record.projectContractInfoId, record.projectTypeId)}
                                      />
                                  )}
                                  {havePermission('Delete') && (
                                      <Popconfirm
                                          title="Are you sure to delete this item?"
                                          onConfirm={() => handleDeleteProjectContract(record.projectContractInfoId)}
                                          okText="Yes"
                                          cancelText="No"
                                      >
                                          <img src={icons.tableAction.delete} alt="delete" className="delete-icon" />
                                      </Popconfirm>
                                  )}
                              </div>
                          );
                      }
                  }
              ]
            : [])
    ];

    const fetchData = useCallback(async () => {
        turnOnLoading();
        handleChangeFormSelected(undefined, undefined);
        try {
            const response = await projectContractReportServices.getProjectContract(filterData);
            const { succeeded, data } = response;

            if (succeeded) {
                setDataReport(formatDataTable(data || []));
            }
        } catch (error) {
            showNotification(false, 'Failed to load data');
        } finally {
            turnOffLoading();
        }
    }, [filterData, showNotification, turnOnLoading, turnOffLoading]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const contractModalColumns: TableColumnsType<IContractModalTable> = [
        {
            dataIndex: 'projectName',
            key: 'projectName',
            title: 'Project Name',
            width: 120,
            align: 'center',
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'projectManager',
            key: 'projectManager',
            title: 'Manager',
            width: 120,
            align: 'center',
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'projectPrime',
            key: 'projectPrime',
            title: 'Project Prime',
            width: 120,
            align: 'center',
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'status',
            key: 'status',
            title: 'Status',
            width: 100,
            align: 'center',
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'startDate',
            key: 'startDate',
            title: 'Start Date',
            width: 120,
            align: 'center',
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'endDate',
            key: 'endDate',
            title: 'End Date',
            width: 120,
            align: 'center',
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            key: 'action',
            title: '',
            width: 20,
            align: 'center',
            render: record => (
                <Popconfirm
                    title={`Delete ${contractIdSelected}`}
                    description="Are you sure to delete this item?"
                    okText="Yes"
                    cancelText="No"
                    onConfirm={() => handleDeleteProjectByContract(record.projectId)}
                >
                    <img src={icons.tableAction.delete} alt="delete" className="delete-icon" />
                </Popconfirm>
            )
        }
    ];

    const [formModal] = Form.useForm();

    const handleDeleteProjectByContract = async (projectId: number) => {
        try {
            const response = await projectContractReportServices.deleteProjectByContractModal({ projectId, projectContractId });
            const { succeeded, message } = response;
            if (succeeded) {
                fetchDataProjectByContract(projectContractId);
                fetchData();
            }

            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Failed to delete project');
        }
    };

    const handleAddProjectByContract = async (values: { projectId: number }) => {
        try {
            const params: IValuesProjectContractModal = {
                ...values,
                projectContractId
            };

            const response = await projectContractReportServices.addProjectByContractModal(params);
            const { succeeded, message } = response;
            if (succeeded) {
                fetchDataProjectByContract(projectContractId);
                onCancelAddProjectByContract();
                fetchData();
            }

            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Failed to add project');
        }
    };

    const onCancelAddProjectByContract = () => {
        formModal.resetFields();
        setIsAddingContractModal(false);
    };

    const renderTitleContractModal = (
        <div className="contract-modal__title">
            <div className="contract-modal__title__header">
                <h3>Contract ID: {contractIdSelected}</h3>
                {!isAddingContractModal && <Button onClick={() => setIsAddingContractModal(true)}>Add</Button>}
            </div>
            {isAddingContractModal && (
                <Form form={formModal} className="contract-modal__form" onFinish={handleAddProjectByContract}>
                    <Form.Item label="Select Project" name="projectId" rules={[{ required: true, message: 'Please select a project' }]}>
                        <BaseSelect
                            options={allIndexes?.projects.map(project => ({ label: project.unitName, value: project.unitId }))}
                            placeholder="Select Project"
                        />
                    </Form.Item>
                    <div className="buttons-group">
                        <Button htmlType="submit">Save</Button>
                        <Button type="text" onClick={onCancelAddProjectByContract}>
                            Cancel
                        </Button>
                    </div>
                </Form>
            )}
        </div>
    );

    const removeAfterUnderscore = (values: { [key: string]: any }): IValuesProjectContract => {
        return Object.fromEntries(Object.entries(values).map(([key, value]) => [key.split('_')[0], value || null])) as IValuesProjectContract;
    };

    const handleEditContractManagement = async (values: { [key: string]: any }) => {
        turnOnLoading();
        try {
            const response = await projectContractReportServices.editProjectByContract(editContractManagementId, {
                ...removeAfterUnderscore(values),
                projectContractInfoId: editContractManagementId as number
            });
            const { succeeded, message } = response;
            if (succeeded) {
                formContractManagement.resetFields();
                fetchData();
                setCountNumberNameForm(countNumberNameForm + 1);
            }

            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Failed to edit contract management');
        } finally {
            turnOffLoading();
        }
    };

    return (
        <div className="contract-management">
            <Form form={formContractManagement} onFinish={handleEditContractManagement}>
                <BaseTable columns={columns} dataSource={dataReport} loading={isLoading} bordered />
            </Form>
            <Modal
                className="contract-modal"
                width={800}
                title={renderTitleContractModal}
                open={Boolean(projectContractId)}
                onCancel={() => setProjectContractId(undefined)}
                closeIcon={false}
                footer={false}
                centered
            >
                {contractModalData.length ? (
                    <BaseTable
                        columns={contractModalColumns}
                        dataSource={contractModalData}
                        pagination={false}
                        loading={loadingModal}
                        bordered
                        scroll={{}}
                    />
                ) : (
                    <p className="no-record">No Record</p>
                )}
            </Modal>
        </div>
    );
};

export default ContractManagement;
