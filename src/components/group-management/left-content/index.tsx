import DialogDefault from '@/components/common/dialog/default';
import DialogCommon from '@/components/common/dialog/dialog-common/dialog-common';
import BaseDivider from '@/components/common/divider';
import DatePicker from '@/components/common/form/date-picker';
import RequiredMark from '@/components/common/form/required-mark';
import BaseSelect from '@/components/common/form/select';
import TreeSelect from '@/components/common/form/tree-select';
import BaseToolTip from '@/components/common/tooltip';
import { IStructureTreeOptions } from '@/pages/group-management';
import pathnames from '@/pathnames';
import { groupManagedSliceActions } from '@/redux/group-managed-slice';
import { useAppDispatch } from '@/redux/store';
import UnitService from '@/services/group-management/unit';
import { IField } from '@/types/common';
import { IStructureNode, IUnit } from '@/types/group-management/group-management';
import { filterNullProperties, formatTime } from '@/utils/common';
import useNotify from '@/utils/hook/useNotify';
import icons from '@/utils/icons';
import { DownOutlined } from '@ant-design/icons';
import { Button, Checkbox, Flex, Form, Input, InputNumber, Skeleton, Space, Tooltip, Tree, TreeProps } from 'antd';
import { Dayjs } from 'dayjs';
import { Key, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.scss';

interface IStructureTree extends TreeProps {
    treeData: IStructureNode[];
    setSelectedUnitId: (id: string) => void;
    height?: number;
    allOptions?: any;
    setIsReload: (params: boolean) => void;
    userPermissions: string[];
}

const LeftContent = (props: IStructureTree) => {
    const { treeData, selectedKeys, setSelectedUnitId, setIsReload, allOptions, height, userPermissions, ...otherProps } = props;

    const navigation = useNavigate();
    const [form] = Form.useForm();
    const { showNotification } = useNotify();
    const dispatch = useAppDispatch();

    const [expandedKeys, setExpandedKeys] = useState(selectedKeys);
    const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);
    const [hoveredNodeKey, setHoveredNodeKey] = useState<string | null>(null);
    const [isShowModalAdd, setIsShowModalAdd] = useState<boolean>(false);
    const [showFieldProject, setShowFieldProject] = useState(false);
    const [showFieldProjectType, setShowFieldProjectType] = useState(false);
    const [nodeDelete, setNodeDelete] = useState<IStructureNode>();
    const [showDeleteNodeTree, setShowDeleteNodeTree] = useState(false);
    const [isShowModalWarning, setIsShowModalWarning] = useState(false);

    const initialValues = {
        approveEffort: 0
    };

    const onSelect = (selectedKeys: string[]) => {
        if (selectedKeys.length > 0) {
            setSelectedUnitId(selectedKeys[0]);
            navigation(pathnames.groupManagement.main.path + '/' + selectedKeys[0]);
        }
    };

    //render tree title when hover node show button add and delete if don't hover hide button
    const renderTreeTitle = (nodeData: IStructureNode) => {
        const { unitName, key, children, isSmallest, isManaged } = nodeData;

        const isHovered = hoveredNodeKey === key;
        const isSelected = selectedKeys?.includes(key);

        const handleAddNodeTree = (node: IStructureNode) => {
            setIsShowModalAdd(true);
            form.setFieldsValue({ parentId: node.unitId.toString(), approveEffort: 0 });
        };

        const handleDeleteNodeTree = (node: IStructureNode) => {
            setShowDeleteNodeTree(true);
            setNodeDelete(node);
        };

        const handleNodeMouseEnter = () => {
            setHoveredNodeKey(nodeData.key);
        };

        const handleNodeMouseLeave = () => {
            setHoveredNodeKey(null);
        };

        const handleTitleClick = () => {
            if (!isSelected) {
                onSelect([key]);

                // Add a permission key based on "managed
                dispatch(
                    groupManagedSliceActions.setGroupManaged({
                        isManaged
                    })
                );
            }
        };

        return (
            <div className="tree-title-container" onClick={handleTitleClick} onMouseEnter={handleNodeMouseEnter} onMouseLeave={handleNodeMouseLeave}>
                <div className="tree-title">{unitName}</div>
                <div className={`tree-title-button ${isHovered ? 'tree-title-button__hover' : ''}`}>
                    {!isSmallest && userPermissions.includes('Add') && isManaged && (
                        <Tooltip title="Add">
                            <Button
                                type="text"
                                icon={<img style={{ width: 20 }} src={icons.tableAction.squarePlus} />}
                                onClick={event => {
                                    event.stopPropagation();
                                    handleAddNodeTree(nodeData);
                                }}
                                style={{ height: 32, width: 32 }}
                            />
                        </Tooltip>
                    )}
                    {!children?.length && userPermissions.includes('Delete') && isManaged && (
                        <Tooltip title="Delete">
                            <Button
                                type="text"
                                icon={<img style={{ width: 20 }} src={icons.tableAction.delete} />}
                                onClick={event => {
                                    event.stopPropagation();
                                    handleDeleteNodeTree(nodeData);
                                }}
                                style={{ height: 32, width: 32 }}
                            />
                        </Tooltip>
                    )}
                </div>
            </div>
        );
    };

    const onExpand = (keys: Key[]) => {
        setExpandedKeys(keys);
        setAutoExpandParent(false);
    };

    const handleDisableStartDate = (currentDate: Dayjs | null) => {
        const { endDate } = form.getFieldsValue();
        return endDate && currentDate && currentDate > endDate;
    };

    const handleDisableEndDate = (currentDate: Dayjs | null) => {
        const { startDate } = form.getFieldsValue();
        return startDate && currentDate && currentDate < startDate;
    };

    const watchParentID = Form.useWatch('parentId', form);
    const watchUnitTypeID = Form.useWatch('unitTypeId', form);

    const findItemByValue = (data: IStructureTreeOptions[], value: string): IStructureTreeOptions | null => {
        for (const item of data) {
            if (item.value === value) {
                return item;
            }
            if (item.children && item.children.length > 0) {
                const found = findItemByValue(item.children, value);
                if (found) {
                    return found;
                }
            }
        }
        return null;
    };

    const validateParentID = () => ({
        required: true,
        validator(_: any, value: any) {
            const levelParentID = findItemByValue(allOptions?.unitBasicDtos, watchParentID)?.level;
            const levelUnitTypeID = allOptions?.unitTypeBasicDtos?.find((item: any) => item.value === watchUnitTypeID)?.level;

            if (!value) {
                return Promise.reject(new Error('Please select valid value'));
            }

            if (levelParentID && levelUnitTypeID && levelParentID <= levelUnitTypeID) {
                return Promise.reject(new Error('The parent unit can not be moved on this unit type'));
            }

            return Promise.resolve();
        }
    });

    const validateUnitTypeID = () => ({
        required: true,
        validator(_: any, value: any) {
            const levelParentID = findItemByValue(allOptions?.unitBasicDtos, watchParentID)?.level;
            const levelUnitTypeID = allOptions?.unitTypeBasicDtos?.find((item: any) => item.value === watchUnitTypeID)?.level;

            if (!value) {
                return Promise.reject(new Error('Please select valid value'));
            }

            if (levelUnitTypeID && levelParentID && levelUnitTypeID >= levelParentID) {
                return Promise.reject(new Error('The unit type cannot be moved under this parent'));
            }
            return Promise.resolve();
        }
    });

    const arrFields: IField[] = [
        {
            name: 'unitName',
            label: 'Unit Name',
            value: <Input placeholder="Enter unit name" />,
            validation: [{ required: true, message: 'Please enter the valid value' }]
        },
        {
            name: 'parentId',
            label: 'Parent Unit',
            value: (
                <TreeSelect
                    size="middle"
                    multiple={false}
                    placeholder="Select parent unit"
                    treeData={allOptions?.unitBasicDtos}
                    searchPlaceholder="Search parent unit"
                    treeDefaultExpandAll
                    rootClassName="tree-select-parent-unit"
                    onChange={() => {
                        if (watchUnitTypeID) form.validateFields(['unitTypeId']);
                    }}
                    allowClear={false}
                />
            ),
            validation: [validateParentID]
        },

        {
            name: 'unitTypeId',
            label: 'Unit Type',
            value: (
                <BaseSelect
                    options={allOptions?.unitTypeBasicDtos}
                    placeholder="Select unit type"
                    onChange={item => {
                        if (watchParentID) form.validateFields(['parentId']);

                        // 1="Business Unit", 2="DC", 3="Program", 4="Project", 5="Department Group", 6= Department", 7="Operation", 8="Business Group"
                        setShowFieldProject(item === 4);
                        if (item !== 4) {
                            form.setFieldValue('projectTypeId', null);
                            setShowFieldProjectType(false);
                        }
                    }}
                />
            ),
            validation: [validateUnitTypeID]
        },
        {
            label: ' ',
            value: (
                <Form.Item name="isBirthdayGreeting" valuePropName="checked">
                    <Checkbox>Birthday Greeting</Checkbox>
                </Form.Item>
            ),
            hidden: showFieldProject
        },
        {
            name: 'projectTypeId',
            label: 'Project Type',
            value: (
                <BaseSelect
                    options={allOptions?.projectTypeBasicDtos}
                    onChange={item => {
                        // 1 = "ODC", 2 = "Fixed Price"
                        setShowFieldProjectType(item === 2);
                    }}
                    placeholder="Select contract ID"
                />
            ),
            hidden: !showFieldProject
        },
        {
            name: 'projectContractId',
            label: 'Contract ID',
            value: <BaseSelect options={allOptions?.projectContractBasicDtos} placeholder="Select contract ID" />,
            hidden: !showFieldProject
        },
        {
            name: 'managedBy',
            label: 'Managed By',
            value: <BaseSelect options={allOptions?.managers} placeholder="Select managed by" />
        },
        {
            name: 'startDate',
            label: 'Start Date',
            value: <DatePicker allowClear disabledDate={handleDisableStartDate} />,
            validation: [{ required: showFieldProjectType, message: 'Please enter the valid value' }]
        },
        {
            name: 'endDate',
            label: 'End Date',
            value: <DatePicker allowClear disabledDate={handleDisableEndDate} />,
            validation: [{ required: showFieldProjectType, message: 'Please enter the valid value' }]
        },
        {
            name: 'marketplaceId',
            label: 'Market',
            value: <BaseSelect options={allOptions?.marketplaceBasicDtos} placeholder="Select market" />,
            hidden: !showFieldProject,
            validation: [{ required: true, message: 'Please select the valid value' }]
        },
        {
            name: 'projectPrime',
            label: 'Project Prime',
            value: <BaseSelect options={allOptions?.managers} placeholder="Select project prime" />,
            hidden: !showFieldProject
        },
        {
            label: ' ',
            value: (
                <Form.Item name="isSharedService" valuePropName="checked">
                    <Checkbox>Shared Service Unit</Checkbox>
                </Form.Item>
            ),
            hidden: !showFieldProject
        },
        {
            label: ' ',
            value: (
                <div className="pa-tool-container">
                    <Form.Item name="isGroupByPATool" valuePropName="checked">
                        <Checkbox>Dept/TIP/JP project</Checkbox>
                    </Form.Item>
                    <BaseToolTip title="This checkbox will change the scoring rules of the PA tool" />
                </div>
            ),
            hidden: form.getFieldValue('unitTypeId') !== 4 && form.getFieldValue('unitTypeId') !== 6
        },
        {
            name: 'approveEffort',
            label: 'Approved Effort (Man-Hours)',
            value: <InputNumber placeholder="Enter approved effort" className="w-100" min={0} step={1} precision={0} disabled />,
            validation: [{ required: true, message: 'Please enter the valid value' }],
            hidden: !showFieldProjectType
        },
        {
            name: 'projectScope',
            label: 'Project Scope',
            value: <Input placeholder="Enter project scope" />,
            hidden: !showFieldProjectType
        },
        {
            name: 'technologies',
            label: 'Technologies',
            value: <Input.TextArea placeholder="Enter technologies" className="text-area-item" />,
            colSpan: 24,
            hidden: !showFieldProject,
            className: 'dialog-information__item-description',
            validation: [{ required: true, message: 'Please enter the valid value' }]
        },
        {
            name: 'description',
            label: 'Description',
            value: <Input.TextArea placeholder="Enter description" className="text-area-item" />,
            colSpan: 24,
            className: 'dialog-information__item-description'
        }
    ];

    const clearData = () => {
        form.resetFields();
        setShowFieldProject(false);
        setShowFieldProjectType(false);
    };

    const formatData = (values: IUnit) => {
        const { startDate, endDate } = values;
        return {
            ...values,
            startDate: startDate ? formatTime(startDate) : undefined,
            endDate: endDate ? formatTime(endDate) : undefined
        };
    };

    const handleSubmit = async (values: IUnit) => {
        const dataFormat = filterNullProperties(formatData(values));

        try {
            const res = await UnitService.createUnit(dataFormat);
            const { succeeded, message } = res;

            if (succeeded) {
                setIsShowModalAdd(false);
                clearData();
                setIsReload(true);
            }

            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Create unit failed');
        }
    };

    const renderContent = () => {
        return (
            <Form form={form} onFinish={handleSubmit} requiredMark={RequiredMark} initialValues={initialValues}>
                <div className="dialog-information__container">
                    {arrFields
                        .filter(item => !item.hidden)
                        .map((item: any, index: number) => {
                            const { name, label, value, validation, className } = item;

                            return (
                                <Form.Item
                                    key={index}
                                    name={name}
                                    label={label}
                                    htmlFor=""
                                    rules={validation}
                                    className={`dialog-information__item ${className}`}
                                >
                                    {value}
                                </Form.Item>
                            );
                        })}
                </div>
                <BaseDivider margin="24px 0 16px 0" />
                <div className="dialog-edit__footer">
                    <Button type="default" onClick={handleCancelAdd} className="btn">
                        Cancel
                    </Button>
                    <Button type="primary" htmlType="submit" className="btn btn--submit">
                        Save
                    </Button>
                </div>
            </Form>
        );
    };

    const handleCancelAdd = () => {
        setIsShowModalAdd(false);
        clearData();
    };

    useEffect(() => {
        setExpandedKeys(selectedKeys);
        setAutoExpandParent(true);
    }, [selectedKeys]);

    const handleClickCancelDelete = () => {
        setShowDeleteNodeTree(false);
    };

    const handleClickDelete = async () => {
        if (!nodeDelete) return;

        try {
            setShowDeleteNodeTree(false);

            const res = await UnitService.deleteUnit(nodeDelete?.unitId);
            const { succeeded, message } = res;

            if (succeeded) {
                if (selectedKeys && selectedKeys[0] === nodeDelete.unitId) {
                    navigation(pathnames.groupManagement.main.path + '/1');
                }
                setIsReload(true);
                showNotification(succeeded, message);
            } else {
                setShowDeleteNodeTree(false);
                setIsShowModalWarning(true);
            }
        } catch (error) {
            showNotification(false, 'Delete unit failed');
        }
    };

    return (
        <>
            {treeData.length > 0 && (
                <Tree
                    className="structure-tree"
                    style={{ height: `${height}px` }}
                    showLine={true}
                    switcherIcon={<DownOutlined />}
                    showIcon
                    treeData={treeData}
                    selectedKeys={selectedKeys}
                    expandedKeys={expandedKeys}
                    autoExpandParent={autoExpandParent}
                    onExpand={onExpand}
                    {...otherProps}
                    titleRender={renderTreeTitle}
                />
            )}

            {/* Dialog add */}
            <DialogDefault
                title="Add New Unit"
                isShow={isShowModalAdd}
                onCancel={handleCancelAdd}
                content={renderContent()}
                className="dialog-information"
                footer={null}
            />

            {/* Dialog delete */}
            <DialogCommon
                title="Delete Unit Type"
                content={
                    <>
                        The <strong>{nodeDelete?.unitName}</strong> will be deleted. Are you sure you want to delete?
                    </>
                }
                open={showDeleteNodeTree}
                onClose={handleClickCancelDelete}
                buttonType="default-danger"
                buttonLeftClick={handleClickCancelDelete}
                buttonRightClick={handleClickDelete}
            />

            {/* Dialog warning */}
            <DialogCommon
                open={isShowModalWarning}
                onClose={() => setIsShowModalWarning(false)}
                icon={icons.dialog.warning}
                title={'Warning Delete'}
                content={
                    <>
                        <strong>{nodeDelete?.unitName}</strong> was deleted unsuccessfully because this unit still has children or there are employee
                        still working in this unit.
                    </>
                }
                buttonType="default-primary"
                hiddenButtonLeft={true}
                buttonRightClick={() => {
                    setIsShowModalWarning(false);
                    clearData();
                }}
                buttonRight="Close"
            />
        </>
    );
};

LeftContent.Skeleton = function () {
    return (
        <Flex className="left-content-skeleton" gap="middle" vertical>
            {[...Array(12).keys()].map((index: number) => (
                <Space key={index}>
                    <Skeleton.Button size="small" active />
                    <Skeleton.Input size="small" active block />
                </Space>
            ))}
        </Flex>
    );
};

export default LeftContent;
