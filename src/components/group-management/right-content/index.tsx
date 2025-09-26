import DialogDefault from '@/components/common/dialog/default';
import DialogCommon from '@/components/common/dialog/dialog-common/dialog-common';
import DialogShowInfoEmployee from '@/components/common/dialog/dialog-show-info-employee';
import BaseDivider from '@/components/common/divider';
import RequiredMark from '@/components/common/form/required-mark';
import BaseSelect from '@/components/common/form/select';
import SubTab from '@/components/common/tab/sub-tab';
import BaseToolTip from '@/components/common/tooltip';
import pathnames from '@/pathnames';
import { selectGroupManagement } from '@/redux/group-managed-slice';
import { useAppSelector } from '@/redux/store';
import chartService from '@/services/group-management/org-chart';
import UnitService from '@/services/group-management/unit';
import { FlatNode, IEmployeeUnits, IOrgChartProps, IOrgNode, IUnitData, IUnitNode, TreeNode } from '@/types/group-management/group-management';
import { filterNullProperties } from '@/utils/common';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';
import icons from '@/utils/icons';
import { convertToFlatOrg, convertToTreeOrg } from '@/utils/tree-utils';
import { Button, Checkbox, Flex, Form, Input, Row, Select, TabsProps } from 'antd';
import Title from 'antd/es/typography/Title';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './index.scss';
import TabData from './tab-data';
import TabInfo from './tab-info';
import ChartContainer from './tab-org-chart/org-chart-component/chart-container';

const { Option } = Select;

const RightContent = (props: IOrgChartProps) => {
    const { onChangeTab, allOptions, setIsReload: setIsReloadTreeStructure } = props;

    const { showNotification } = useNotify();
    const navigation = useNavigate();
    const [formEmployee] = Form.useForm();
    const [formRequestToDelete] = Form.useForm();
    const { id } = useParams();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();
    const managedAction = useAppSelector(selectGroupManagement).isManaged;
    const { havePermission: haveUnitInfoPermission } = usePermissions('UnitInformation', 'GroupManagement');
    const { havePermission: haveOrgChartPermission } = usePermissions('OrganizationChart', 'GroupManagement');
    const { havePermission: haveUnitDataPermission } = usePermissions('UnitInformationData', 'GroupManagement');

    const [isLoadingButtonBaseline, setIsLoadingButtonBaseline] = useState(false);
    const [movedNodeChart, setMovedNodeChart] = useState(false);
    const [dataChartAfterChange, setDataChartAfterChange] = useState<TreeNode>();
    const [activeKeyTab, setActiveKeyTab] = useState('2');
    const [unitData, setUnitData] = useState<IUnitData>();
    const [optionEmployee, setOptionEmployee] = useState<IEmployeeUnits[]>([]);
    const [orgData, setOrgData] = useState<IOrgNode>();
    const [dataUnit, setDataUnit] = useState<IUnitNode>();
    const [isReload, setIsReload] = useState({});
    const { unitTypeLevel, unitId, unitName } = dataUnit || {};

    const titleTooltip = `Request to delete button is only enable when no member working as main project under this unit.`;

    const clearData = () => {
        formRequestToDelete.resetFields();
        formEmployee.resetFields();
        setInfoAdd(undefined);
        setInfoEdit(undefined);
        setValueDeleteNode(undefined);
    };

    //#region Tab info
    const [showRequestToDelete, setShowRequestToDelete] = useState<boolean>(false);
    const [allCriteriaChecked, setAllCriteriaChecked] = useState(false);

    const handleShowRequestToDelete = () => {
        setShowRequestToDelete(true);
    };

    const handleConfirmRequestToDelete = async () => {
        const criteriaValues = formRequestToDelete.getFieldsValue(['criteria1', 'criteria2', 'criteria3']);
        const areAllChecked = Object.values(criteriaValues).every(value => value);
        setAllCriteriaChecked(!areAllChecked);

        if (!unitId || !areAllChecked) return;

        try {
            const res = await UnitService.requestToDelete(unitId, criteriaValues);
            const { succeeded, message } = res;

            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Request to delete failed');
        }

        setShowRequestToDelete(false);
        clearData();
    };

    const handleCancelRequestToDelete = () => {
        setShowRequestToDelete(false);
        setAllCriteriaChecked(false);
        clearData();
    };

    const renderContentRequestToDelete = () => {
        return (
            <Form onFinish={handleConfirmRequestToDelete} requiredMark={RequiredMark} form={formRequestToDelete} className="form-request-to-delete">
                <Form.Item name="criteria1" valuePropName="checked">
                    <Checkbox>
                        Project manager have done a search on github, bitbucket to ensure no project related materials posted without permission
                    </Checkbox>
                </Form.Item>
                <Form.Item name="criteria2" valuePropName="checked">
                    <Checkbox>
                        Project manager have handed over cloud accounts if any back to customers and requested customers to change password
                    </Checkbox>
                </Form.Item>
                <Form.Item name="criteria3" valuePropName="checked">
                    <Checkbox>Project manager have revoked cloud access permission to staff who no longer needs that</Checkbox>
                </Form.Item>

                {allCriteriaChecked && (
                    <div style={{ marginBottom: 16, color: 'red' }}>Please confirm that you have completed actions properly for closing project</div>
                )}

                <BaseDivider margin="0 0 16px 0" />

                <Row gutter={[24, 24]} className="form-action-node-org">
                    <Button type="default" onClick={handleCancelRequestToDelete}>
                        Cancel
                    </Button>
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Row>
            </Form>
        );
    };
    //#endregion

    //#region Tab Chart
    const [ShowAddNodeOrg, setShowAddNodeOrg] = useState(false);
    const [InfoAdd, setInfoAdd] = useState<IOrgNode>();
    const [InfoEdit, setInfoEdit] = useState<IOrgNode>();
    const [ShowEditNodeOrg, setShowEditNodeOrg] = useState(false);
    const [valueDeleteNode, setValueDeleteNode] = useState<IOrgNode>();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [onShowDetailEmployee, setOnShowDetailEmployee] = useState<boolean>(false);
    const [selectedEmployee, setSelectedEmployee] = useState<IOrgNode | null>(null);

    const handleGetInfoNode = async (info: IOrgNode, type: string) => {
        switch (type) {
            case 'add':
                setShowAddNodeOrg(true);
                setInfoAdd(info);
                break;
            case 'edit':
                setInfoEdit(info);
                setShowEditNodeOrg(true);
                formEmployee.setFieldsValue({
                    employeeId: info.employeeId,
                    isLeader: info.isLeader,
                    notes: info.notes
                });
                break;
            case 'delete':
                setValueDeleteNode(info);
                setShowDeleteModal(true);
                break;
            case 'info':
                if (!info.employeeId) return;

                setOnShowDetailEmployee(true);
                try {
                    turnOnLoading();
                    const res = await UnitService.getInfoDetailUser(info.employeeId);
                    const { succeeded, data } = res;

                    if (succeeded && data) {
                        setSelectedEmployee(data);
                    }
                } catch (error) {
                    showNotification(false, 'Get data employee detail for org chart failed');
                }

                turnOffLoading();
                break;
            default:
                break;
        }
    };

    // The handler function saves when the user drags and drops the positions of nodes inside the chart
    const handleSaveDragAndDropChart = async () => {
        if (!dataChartAfterChange) return;

        try {
            const res = await chartService.dragAndDropChart(convertToFlatOrg(dataChartAfterChange));
            const { succeeded, message } = res;

            succeeded && setMovedNodeChart(false);

            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Save failed');
        }

        setIsReload({});
    };

    const onCloseModalDetailEmployee = () => {
        setOnShowDetailEmployee(false);
        setSelectedEmployee(null);
    };

    const handleCancelShowNode = () => {
        clearData();
        setShowEditNodeOrg(false);
        setShowAddNodeOrg(false);
    };

    const formatData = (data: FlatNode) => {
        return {
            ...data,
            unitId: InfoAdd ? InfoAdd.unitId : InfoEdit?.unitId,
            ordinalParentId: InfoAdd ? InfoAdd?.ordinalId : InfoEdit?.ordinalParentId,
            organizationChartId: InfoEdit?.organizationChartId
        };
    };

    const handleAddNode = async (values: FlatNode) => {
        if (!InfoAdd) return;

        const dataFormat = filterNullProperties(formatData(values));
        try {
            setShowAddNodeOrg(false);
            const res = await chartService.addOrgChart(dataFormat);
            const { succeeded, message } = res;

            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Add node chart failed');
        }

        clearData();
        setIsReload({});
    };

    const handleEditNode = async (values: FlatNode) => {
        if (!InfoEdit) return;

        const dataFormat = filterNullProperties(formatData(values));
        try {
            setShowEditNodeOrg(false);
            const res = await chartService.updateOrgChart(dataFormat);
            const { succeeded, message } = res;

            succeeded && formEmployee.resetFields();

            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Edit node failed');
        }

        setIsReload({});
    };

    const onSubmit = async (props: FlatNode) => {
        if (ShowAddNodeOrg) {
            handleAddNode(props);
        } else {
            handleEditNode(props);
        }
    };

    const handleConfirmDeleteNode = async () => {
        if (!valueDeleteNode) return;

        try {
            const res = await chartService.deleteOrgChart(valueDeleteNode.organizationChartId);
            const { succeeded, message } = res;

            succeeded && setShowDeleteModal(false);

            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Delete node failed');
        }

        setIsReload({});
    };

    // Render content for the Add/Edit dialogs
    const renderContent = () => {
        return (
            <Form onFinish={onSubmit} requiredMark={RequiredMark} form={formEmployee} className="form-add-node-org">
                <Form.Item
                    label="Employee"
                    htmlFor=""
                    name="employeeId"
                    className="form-item-node-org"
                    rules={[{ required: true, message: 'Please select employee!' }]}
                >
                    <BaseSelect placeholder="Choose employee">
                        {optionEmployee?.map((employee: any, index) => (
                            <Option key={index} value={employee.employeeId} label={employee.fullName}>
                                {employee.fullName}
                            </Option>
                        ))}
                    </BaseSelect>
                </Form.Item>
                <Form.Item label="Note" htmlFor="" name="notes" className="form-item-node-org">
                    <Input.TextArea placeholder="Enter comment" className="text-area-item" />
                </Form.Item>
                <Form.Item label="Leader" htmlFor="" name="isLeader" className="form-item-node-org" valuePropName="checked" initialValue={false}>
                    <Checkbox />
                </Form.Item>

                <BaseDivider margin="0 0 16px 0" />

                <Row gutter={[24, 24]} className="form-action-node-org">
                    <Button type="default" onClick={handleCancelShowNode}>
                        Cancel
                    </Button>
                    <Button type="primary" htmlType="submit">
                        Save
                    </Button>
                </Row>
            </Form>
        );
    };
    //#endregion

    //#region Tab data
    const handleUpdateBaseLine = async () => {
        setMovedNodeChart(false);
        setIsLoadingButtonBaseline(true);

        try {
            const res = await UnitService.updateBaselineReport();
            const { succeeded, message } = res;

            succeeded && setIsReload({});

            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Update baseline data failed');
        } finally {
            setIsLoadingButtonBaseline(false);
        }
    };
    //#endregion

    const fetchOrgChart = async (unitId: number) => {
        const response = await chartService.getOrgChart(unitId);
        return response.data;
    };

    const fetchUnitById = async (unitId: number) => {
        const response = await UnitService.getUnitInformation(unitId);
        return response;
    };

    const fetchUnitData = async (unitId: number) => {
        const response = await UnitService.getUnitData(unitId);
        return response;
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            turnOnLoading();
            const unitId = Number(id);

            if (haveUnitInfoPermission('View')) {
                try {
                    const unitData = await fetchUnitById(unitId);
                    unitData.data && setDataUnit(unitData.data);
                } catch (error) {
                    showNotification(false, 'Fetching unit data failed');
                }
            }

            if (haveOrgChartPermission('View')) {
                try {
                    const orgData = await fetchOrgChart(unitId);
                    const { tree, errors } = convertToTreeOrg(orgData);

                    setOrgData(tree[0] || undefined);
                    if (errors.length > 0) {
                        showNotification(false, errors[0]);
                    }
                } catch (error) {
                    setOrgData(undefined);
                    showNotification(false, 'Fetching organization chart failed');
                }
            }

            if (haveUnitDataPermission('View')) {
                try {
                    const res = await fetchUnitData(unitId);
                    const { succeeded, data } = res;

                    const dataEmployeeUnits = [
                        ...data.employeeUnits,
                        {
                            employeeId: 0,
                            fullName: 'Vacancy'
                        }
                    ];

                    if (succeeded) {
                        setUnitData(data);
                        setOptionEmployee(dataEmployeeUnits);
                    }
                } catch (error) {
                    showNotification(false, 'Fetching report by last week failed');
                }
            }

            turnOffLoading();
        };
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, showNotification, isReload, turnOffLoading, turnOnLoading]);

    const tabsContentRight = [
        unitTypeLevel !== 250 && dataUnit && haveUnitInfoPermission('View')
            ? {
                  key: '1',
                  label: `${unitName || ''} Info`,
                  children: (
                      <TabInfo
                          dataUnit={dataUnit}
                          allOptions={allOptions}
                          setIsReload={() => {
                              setIsReload?.({});
                              setIsReloadTreeStructure(true);
                          }}
                          activeKeyTab={activeKeyTab}
                      />
                  )
              }
            : undefined,
        {
            key: '2',
            label: 'Organization Chart',
            children: orgData && haveOrgChartPermission('View') && (
                <ChartContainer
                    dataSource={orgData}
                    pan={true}
                    handleGetNode={handleGetInfoNode}
                    setMovedNodeChart={setMovedNodeChart}
                    movedNodeChart={movedNodeChart}
                    setDataChartAfterChange={setDataChartAfterChange}
                    chartClass="no-select"
                />
            )
        },
        unitTypeLevel !== 250 && unitData && haveUnitDataPermission('View')
            ? {
                  key: '3',
                  label: `${unitName || ''} Data`,
                  children: (
                      <TabData
                          unitName={unitName || '-'}
                          unitTypeLevel={unitTypeLevel}
                          unitData={unitData}
                          setIsReload={setIsReload}
                          activeKeyTab={activeKeyTab}
                      />
                  )
              }
            : undefined
    ].filter(Boolean) as TabsProps['items'];

    useEffect(() => {
        setMovedNodeChart(false);
    }, [id]);

    // Change the active tab based on the unit type level and unit ID
    // Because unit type level can be the same, but unit ID can be different
    useEffect(() => {
        setActiveKeyTab(unitTypeLevel === 250 || !haveUnitInfoPermission('View') ? '2' : '1');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [unitTypeLevel, unitId]);

    const onChange = (key: string) => {
        setActiveKeyTab(key);
        onChangeTab && onChangeTab(key);
    };

    return (
        <>
            <Flex justify="space-between">
                <Flex align="center" gap={8}>
                    <Title level={4} style={{ margin: 0, lineHeight: '40px' }}>
                        {unitName || orgData?.unitName}
                    </Title>
                    {unitTypeLevel !== 250 && haveUnitInfoPermission('Delete') && <BaseToolTip title={titleTooltip} />}
                </Flex>
                {unitTypeLevel !== 250 &&
                    activeKeyTab === '1' &&
                    !dataUnit?.totalMainWorkingMember &&
                    haveUnitDataPermission('Delete') &&
                    managedAction && (
                        <Button danger onClick={handleShowRequestToDelete}>
                            Request To Delete
                        </Button>
                    )}
                {activeKeyTab === '2' && dataUnit?.unitTypeLevel === 1 && movedNodeChart && (
                    <Button type="primary" onClick={handleSaveDragAndDropChart}>
                        Save
                    </Button>
                )}
                {activeKeyTab === '3' && (
                    <Flex gap={16}>
                        {haveUnitDataPermission('UpdateBaselineData') && managedAction && (
                            <Button loading={isLoadingButtonBaseline} onClick={handleUpdateBaseLine}>
                                Update Baseline Data
                            </Button>
                        )}
                        {haveUnitDataPermission('ViewHistorical') && managedAction && (
                            <Button
                                type="primary"
                                onClick={() => navigation(pathnames.groupManagement.unitHistoryInfo.main.path + '/' + dataUnit?.unitId)}
                            >
                                View History
                            </Button>
                        )}
                    </Flex>
                )}
            </Flex>

            <SubTab items={tabsContentRight} activeKey={activeKeyTab} className="sub-tab-org-chart" onChangeTabs={onChange} />

            {/* Dialog request to delete in tab info */}
            <DialogDefault
                title="Confirm For Requesting Delete This Unit"
                isShow={showRequestToDelete}
                content={renderContentRequestToDelete()}
                onCancel={handleCancelRequestToDelete}
                className="dialog-comment w-auto"
                footer={null}
            />

            {/* Dialog add and edit node in tab chart */}
            <DialogDefault
                title={ShowAddNodeOrg ? 'Add New Node' : 'Edit Node'}
                isShow={ShowAddNodeOrg || ShowEditNodeOrg}
                content={renderContent()}
                onCancel={handleCancelShowNode}
                className="dialog-comment"
                footer={null}
            />

            {/* Dialog delete node in tab chart */}
            <DialogCommon
                open={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Delete Node"
                content={
                    <>
                        Are you sure you want to delete node <strong>{valueDeleteNode?.fullName}</strong>?
                    </>
                }
                icon={icons.dialog.delete}
                buttonType="default-danger"
                buttonLeftClick={() => setShowDeleteModal(false)}
                buttonRightClick={handleConfirmDeleteNode}
            />

            <DialogShowInfoEmployee
                onShowDetailEmployee={onShowDetailEmployee}
                selectedEmployee={selectedEmployee}
                onCloseModal={onCloseModalDetailEmployee}
                loading={isLoading}
            />
        </>
    );
};

export default RightContent;
