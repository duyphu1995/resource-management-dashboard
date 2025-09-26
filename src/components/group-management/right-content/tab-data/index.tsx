import DialogCommon from '@/components/common/dialog/dialog-common/dialog-common';
import DialogShowInfoEmployee from '@/components/common/dialog/dialog-show-info-employee';
import BaseDivider from '@/components/common/divider';
import ButtonsIcon from '@/components/common/table/buttons-icon';
import { renderBooleanStatus, renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import TableNote from '@/components/common/table/table-note';
import pathnames from '@/pathnames';
import { selectGroupManagement } from '@/redux/group-managed-slice';
import { useAppSelector } from '@/redux/store';
import chartService from '@/services/group-management/org-chart';
import UnitService from '@/services/group-management/unit';
import { IEmployeeEditEffort, IEmployeeUnits, IOrgNode, ITableChart, ITableChartAction, IUnitData } from '@/types/group-management/group-management';
import { formatDataTable, formatDataTableFromOne, validateRange0To1000 } from '@/utils/common';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import icons from '@/utils/icons';
import { createSorter } from '@/utils/table';
import { Avatar, Button, Checkbox, Flex, Form, Input, InputNumber } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DialogEditEffort from './dialog-edit-effort';
import HeadTabData from './head-tab-data';
import './index.scss';

interface ITabDataProps {
    unitData: IUnitData;
    setIsReload: (params: object) => void;
    activeKeyTab: string;
    unitName: string;
    unitTypeLevel?: number;
}

export interface IFormatTabData {
    isCoreMember: { [key: string]: boolean };
    billable: { [key: string]: string };
    isRedeployable: { [key: string]: boolean };
    groupName: { [key: string]: string };
    notes: { [key: string]: string };
}

export interface IFormatTableDialogEdit {
    effort: { [key: string]: string };
    unitId: { [key: string]: string };
}

const TabData = (props: ITabDataProps) => {
    const { unitData, setIsReload, activeKeyTab, unitName, unitTypeLevel } = props;
    const { employeeUnits } = unitData;

    const [formTable] = Form.useForm();
    const [formDialog] = Form.useForm();
    const { showNotification } = useNotify();
    const { id } = useParams();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();
    const managedAction = useAppSelector(selectGroupManagement).isManaged;

    const [onShowDetailEmployee, setOnShowDetailEmployee] = useState<boolean>(false);
    const [selectedEmployee, setSelectedEmployee] = useState<IOrgNode | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [titleEditList, setTitleEditList] = useState<string>('');
    const [employeeId, setEmployeeId] = useState<number>(0);
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [valueEdit, setValueEdit] = useState<IEmployeeEditEffort[]>([]);
    const [count, setCount] = useState<number>(0);

    const onShowModalDetail = async (item: IOrgNode) => {
        setOnShowDetailEmployee(true);
        try {
            turnOnLoading();
            const res = await UnitService.getInfoDetailUser(item.employeeId);
            const { succeeded, data } = res;

            if (succeeded && data) {
                setSelectedEmployee(data);
            }
        } catch (error) {
            showNotification(false, 'Get data employee detail for table tab data failed');
        }

        turnOffLoading();
    };

    const onCloseModalDetailEmployee = () => {
        setOnShowDetailEmployee(false);
        setSelectedEmployee(null);
    };

    //#region Leave employee
    const [showDialogLeave, setShowDialogLeave] = useState<boolean>(false);
    const [dataLeave, setDataLeave] = useState<ITableChartAction>();

    const handleShowDialogLeaveEmployee = async (removeData: ITableChartAction) => {
        setShowDialogLeave(true);
        setDataLeave(removeData);
    };
    const handleClickLeave = async () => {
        if (!dataLeave) return;

        try {
            const res = await chartService.removeEmployee(dataLeave?.employeeUnitId);
            const { succeeded, message } = res;

            succeeded && setShowDialogLeave(false);

            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Remove employee failed');
        }

        setIsReload({});
    };
    //#endregion

    const handleShowDialogEditEffort = async (editData: ITableChartAction) => {
        const fullName = editData?.fullName;

        setShowEditModal(true);
        fullName && setTitleEditList(fullName);
        setEmployeeId(editData.employeeId);

        const res = await chartService.getListEmployeeUnit(editData.employeeId);
        const { succeeded, data = [] } = res;

        if (succeeded && data) {
            setValueEdit(formatDataTable(data));
            setCount(data.length);

            formDialog.setFieldsValue({
                unitId: data.map(item => item.unitId),
                effort: data.map(item => item.effort)
            });
        }
    };

    const handleFillDataBillable = (data: ITableChartAction) => {
        const billable = formTable.getFieldValue(['billable', `${data.employeeUnitId}`]);

        if (!billable) {
            const newBillable = data.effort / 100;
            formTable.setFieldsValue({
                billable: {
                    [data.employeeUnitId]: newBillable
                }
            });
        }
    };

    // Column table action
    const columnTableTabDataAction: ColumnsType<ITableChartAction> = [
        {
            dataIndex: 'key',
            key: 'key',
            title: 'No.',
            width: 71,
            fixed: 'left',
            sorter: createSorter('key', 'number')
        },
        {
            dataIndex: 'badgeId',
            key: 'badgeId',
            title: 'Badge ID',
            width: 109,
            fixed: 'left',
            sorter: createSorter('badgeId'),
            render: item => renderWithFallback(item)
        },
        {
            title: 'Full Name',
            width: 300,
            fixed: 'left',
            sorter: createSorter('fullName'),
            render: record => (
                <div
                    style={{
                        color: record.statusColor,
                        cursor: 'pointer',
                        fontWeight: 500
                    }}
                    className="underline"
                    onClick={() => onShowModalDetail(record)}
                >
                    {renderWithFallback(record.fullName)}
                </div>
            )
        },
        {
            key: 'employeeImageUrl',
            title: 'Photo',
            width: 72,
            render: record => <Avatar src={record.employeeImageUrl} onClick={() => onShowModalDetail(record)} className="cursor-pointer" />
        },
        {
            dataIndex: 'projectName',
            key: 'projectName',
            title: 'Main Project',
            width: 139,
            sorter: createSorter('projectName'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'dcName',
            key: 'dcName ',
            title: 'DC Of Main Project',
            width: 173,
            sorter: createSorter('dcName'),
            render: item => renderWithFallback(item)
        },
        {
            key: 'isCoreMember',
            title: 'Core Member',
            width: 139,
            align: 'center',
            sorter: createSorter('isCoreMember', 'boolean'),
            render: (record: ITableChartAction) =>
                isEditing ? (
                    <Form.Item
                        name={['isCoreMember', `${record.employeeUnitId}`]}
                        initialValue={record.isCoreMember}
                        valuePropName="checked"
                        className="checkbox--center"
                    >
                        <Checkbox style={{ display: 'flex' }} />
                    </Form.Item>
                ) : (
                    renderBooleanStatus(record.isCoreMember, 'Core Member')
                )
        },
        {
            key: 'billable',
            title: 'Billable',
            width: 150,
            sorter: createSorter('billable', 'number'),
            render: (record: ITableChartAction) => {
                const isDisabled = record.effort === 0;

                return isEditing ? (
                    <Form.Item
                        name={['billable', `${record.employeeUnitId}`]}
                        initialValue={record.billable}
                        rules={[validateRange0To1000('Billable must be between 0 and 1000!')]}
                    >
                        <InputNumber className="w-100" onFocus={() => handleFillDataBillable(record)} disabled={isDisabled} />
                    </Form.Item>
                ) : (
                    renderWithFallback(record.billable)
                );
            }
        },
        {
            dataIndex: 'effort',
            key: 'effort',
            title: 'Allocated Effort',
            width: 153,
            sorter: createSorter('effort', 'number'),
            render: item => renderWithFallback(item + '%')
        },
        {
            key: 'isRedeployable ',
            title: 'Redeployable',
            width: 139,
            align: 'center',
            sorter: createSorter('isRedeployable', 'boolean'),
            render: (record: ITableChartAction) =>
                isEditing ? (
                    <Form.Item
                        name={['isRedeployable', `${record.employeeUnitId}`]}
                        initialValue={record.isRedeployable}
                        valuePropName="checked"
                        className="checkbox--center"
                    >
                        <Checkbox style={{ display: 'flex' }} />
                    </Form.Item>
                ) : (
                    renderBooleanStatus(record.isRedeployable, 'Redeployable')
                )
        },
        {
            key: 'groupName',
            title: 'Group Name',
            width: 153,
            sorter: createSorter('groupName'),
            render: (record: ITableChartAction) =>
                isEditing ? (
                    <Form.Item name={['groupName', `${record.employeeUnitId}`]} initialValue={record.groupName}>
                        <Input />
                    </Form.Item>
                ) : (
                    renderWithFallback(record.groupName)
                )
        },
        {
            key: 'notes',
            title: 'Note',
            width: 183,
            render: (record: ITableChartAction) =>
                isEditing ? (
                    <Form.Item name={['notes', `${record.employeeUnitId}`]} initialValue={record.notes}>
                        <Input />
                    </Form.Item>
                ) : (
                    renderWithFallback(record.notes)
                )
        },
        {
            ...(managedAction && {
                title: 'Action',
                key: 'action',
                fixed: 'right',
                width: 150,
                render: (record: ITableChartAction) => {
                    const { isMainProject, isManager, fullName, badgeId, isTransferring } = record;
                    return (
                        <ButtonsIcon
                            items={[
                                {
                                    icon: icons.tableAction.edit,
                                    onClick: () => handleShowDialogEditEffort(record),
                                    tooltip: 'Edit effort',
                                    disabled: isEditing
                                },
                                isMainProject && !isManager
                                    ? {
                                          icon: icons.tableAction.transfer,
                                          tooltip: 'Transfer',
                                          disabled: isEditing || isTransferring,
                                          link: pathnames.transferEmployee.add.path + `?fullName=${fullName}&badgeId=${badgeId}`
                                      }
                                    : undefined,
                                !isMainProject && !isManager
                                    ? {
                                          icon: icons.tableAction.leave,
                                          onClick: () => handleShowDialogLeaveEmployee(record),
                                          tooltip: 'Leave',
                                          disabled: isEditing
                                      }
                                    : undefined
                            ]}
                        />
                    );
                }
            })
        }
    ];

    // Column table
    const columnTableTabData: ColumnsType<ITableChart> = [
        {
            dataIndex: 'key',
            key: 'key',
            title: 'No.',
            width: 71,
            fixed: 'left',
            sorter: createSorter('key', 'number')
        },
        {
            dataIndex: 'unitName',
            key: 'unitName',
            title: 'Unit Name',
            width: 139,
            fixed: 'left',
            sorter: createSorter('unitName'),
            render: item => renderWithFallback(item)
        },
        {
            key: 'fullName',
            title: 'Full Name',
            width: 300,
            fixed: 'left',
            sorter: createSorter('fullName'),
            render: record => (
                <div
                    style={{
                        color: record.statusColor,
                        cursor: 'pointer',
                        fontWeight: 500
                    }}
                    className="underline"
                    onClick={() => onShowModalDetail(record)}
                >
                    {renderWithFallback(record.fullName)}
                </div>
            )
        },
        {
            key: 'employeeImageUrl',
            title: 'Photo',
            width: 72,
            render: record => <Avatar src={record.employeeImageUrl} onClick={() => onShowModalDetail(record)} className="cursor-pointer" />
        },
        {
            dataIndex: 'totalCoreMemberPercent',
            key: 'totalCoreMemberPercent',
            title: '% Core Member',
            width: 139,
            render: item => renderWithFallback(item ? item + '%' : '')
        },
        {
            dataIndex: 'totalHeadCount',
            key: 'totalHeadCount',
            title: 'Total Headcount',
            width: 157,
            sorter: createSorter('totalHeadCount', 'number'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'totalEffort',
            key: 'totalEffort',
            title: 'Total Effort',
            width: 123,
            sorter: createSorter('totalEffort', 'number'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'totalBillable',
            key: 'totalBillable',
            title: 'Total Billable',
            width: 133,
            sorter: createSorter('totalBillable', 'number'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'totalNonBillable',
            key: 'totalNonBillable',
            title: 'NB',
            width: 130,
            sorter: createSorter('totalNonBillable', 'number'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'totalNonBillableRatio',
            key: 'totalNonBillableRatio',
            title: 'NBR',
            width: 130,
            sorter: createSorter('totalNonBillableRatio', 'number'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'staffGradeIndex',
            key: 'staffGradeIndex',
            title: 'Staff Grade Index',
            width: 166,
            sorter: createSorter('staffGradeIndex', 'number'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'totalRedeploy',
            key: 'totalRedeploy',
            title: 'Total Redeployable',
            width: 150,
            sorter: createSorter('totalRedeploy', 'number'),
            render: item => renderWithFallback(item)
        }
    ];

    // #region handle form save multiple data in table

    const formatData = (values: IFormatTabData): IEmployeeUnits[] => {
        const formattedData: IEmployeeUnits[] = [];

        Object.keys(values.isCoreMember).forEach(employeeUnitId => {
            const formattedEntry: IEmployeeUnits = {
                employeeUnitId: Number(employeeUnitId),
                isCoreMember: values.isCoreMember[employeeUnitId],
                billable: Number(values.billable[employeeUnitId]),
                isRedeployable: values.isRedeployable[employeeUnitId],
                groupName: values.groupName[employeeUnitId],
                notes: values.notes[employeeUnitId]
            };

            formattedData.push(formattedEntry);
        });

        return formattedData;
    };

    const handleSubmitSaveAllTable = async (values: IFormatTabData) => {
        const dataFormat = formatData(values);

        try {
            const res = await chartService.updateEmployeeUnit(dataFormat);
            const { succeeded, message } = res;

            succeeded && setIsEditing(false);
            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Update employee failed');
        }

        formTable.resetFields();
        setIsReload({});
    };

    const handleShowEditTableAll = () => {
        setIsEditing(true);
        formTable.resetFields();
    };

    const handleCancelEditTableAll = () => {
        setIsEditing(false);
        formTable.resetFields();
    };

    useEffect(() => {
        setIsEditing(false);
    }, [id, activeKeyTab]);
    // #endregion

    return (
        <div className="tab-data__container">
            <HeadTabData unitName={unitName} unitData={unitData} />

            <BaseDivider margin="0" />

            <Form form={formTable} name="tab-data-form" onFinish={handleSubmitSaveAllTable}>
                <Flex align="center" justify="space-between">
                    <TableNote />
                    {unitTypeLevel === 1 &&
                        managedAction &&
                        (isEditing ? (
                            <Flex gap={8}>
                                <Button type="default" onClick={handleCancelEditTableAll}>
                                    Cancel
                                </Button>
                                <Button type="primary" htmlType="submit">
                                    Save
                                </Button>
                            </Flex>
                        ) : (
                            <Button type="primary" onClick={handleShowEditTableAll}>
                                Edit
                            </Button>
                        ))}
                </Flex>

                <BaseTable
                    dataSource={formatDataTableFromOne(employeeUnits)}
                    columns={unitTypeLevel === 1 ? columnTableTabDataAction : columnTableTabData}
                    scroll={{ x: 1500, y: 469 }}
                    pagination={false}
                />
            </Form>

            <DialogShowInfoEmployee
                onShowDetailEmployee={onShowDetailEmployee}
                selectedEmployee={selectedEmployee}
                onCloseModal={onCloseModalDetailEmployee}
                loading={isLoading}
            />

            <DialogEditEffort
                formDialog={formDialog}
                setIsReload={setIsReload}
                valueEdit={valueEdit}
                setValueEdit={setValueEdit}
                employeeId={employeeId}
                showEditModal={showEditModal}
                setShowEditModal={setShowEditModal}
                titleEditList={titleEditList}
                count={count}
                setCount={setCount}
            />

            <DialogCommon
                title="Leave Employee"
                content={
                    <>
                        The <strong>{dataLeave?.fullName}</strong> will be leave. Are you sure you want to leave employee?
                    </>
                }
                open={showDialogLeave}
                onClose={() => setShowDialogLeave(false)}
                buttonType="default-danger"
                buttonLeftClick={() => setShowDialogLeave(false)}
                buttonRightClick={handleClickLeave}
                buttonRight="Leave"
            />
        </div>
    );
};

export default TabData;
