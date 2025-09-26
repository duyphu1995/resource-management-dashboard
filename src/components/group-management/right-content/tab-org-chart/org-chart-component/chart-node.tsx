import Avatar from '@/components/common/avatar/index.tsx';
import BaseTag from '@/components/common/tag/index.tsx';
import { IChartNodeProps } from '@/types/group-management/group-management';
import { DeleteOutlined, EditOutlined, PlusSquareOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import './chart-node.scss';
import { dragNodeService, selectNodeService } from './service.ts';

const ChartNode: React.FC<IChartNodeProps> = ({
    dataSource,
    collapsible = true,
    multipleSelect = false,
    changeHierarchy,
    handleGetNode,
    movedNodeChart,
    userPermissions
}) => {
    const node = useRef<HTMLDivElement>(null);
    const [isChildrenCollapsed, setIsChildrenCollapsed] = useState(false);
    const [bottomEdgeExpanded, setBottomEdgeExpanded] = useState<boolean | undefined>();
    const [buttonAction, setButtonAction] = useState<boolean | undefined>();
    const [allowedDrop, setAllowedDrop] = useState(false);
    const [selected, setSelected] = useState(false);

    const nodeClass = ['oc-node', isChildrenCollapsed ? 'isChildrenCollapsed' : '', allowedDrop ? 'allowedDrop' : '', selected ? 'selected' : '']
        .filter(item => item)
        .join(' ');

    useEffect(() => {
        const subs1 = dragNodeService.getDragInfo().subscribe((draggedInfo: any) => {
            if (draggedInfo) {
                setAllowedDrop(
                    !document
                        .querySelector('#' + draggedInfo.draggedNodeId)
                        ?.closest('li')
                        ?.querySelector('#' + node.current?.id)
                        ? true
                        : false
                );
            } else {
                setAllowedDrop(false);
            }
        });

        const subs2 = selectNodeService.getSelectedNodeInfo().subscribe((selectedNodeInfo: any) => {
            if (selectedNodeInfo) {
                if (multipleSelect) {
                    if (selectedNodeInfo.selectedNodeId === dataSource.ordinalId) {
                        setSelected(true);
                    }
                } else {
                    setSelected(selectedNodeInfo.selectedNodeId === dataSource.ordinalId);
                }
            } else {
                setSelected(false);
            }
        });

        return () => {
            subs1.unsubscribe();
            subs2.unsubscribe();
        };
    }, [multipleSelect, dataSource]);

    const addArrows: React.MouseEventHandler<HTMLDivElement> = e => {
        const nodeElement = (e.target as HTMLElement).closest('li');
        const parent = (nodeElement?.parentNode as HTMLElement).closest('li');
        const isAncestorsCollapsed = nodeElement && parent ? parent.classList.contains('hidden') : undefined;
        setButtonAction(!isAncestorsCollapsed);
        setBottomEdgeExpanded(!isChildrenCollapsed);
    };

    const removeArrows = () => {
        setButtonAction(undefined);
        setBottomEdgeExpanded(undefined);
    };

    const bottomEdgeClickHandler: React.MouseEventHandler<HTMLDivElement> = e => {
        e.stopPropagation();
        setIsChildrenCollapsed(!isChildrenCollapsed);
        setBottomEdgeExpanded(!bottomEdgeExpanded);
    };

    const filterAllowedDropNodes = (id: string) => {
        dragNodeService.sendDragInfo(id);
    };

    const dragstartHandler = (e: React.DragEvent<HTMLDivElement>) => {
        const copyDS = { ...dataSource };
        delete copyDS.relationship;
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('text/plain', JSON.stringify(copyDS));

        filterAllowedDropNodes(node.current!.id);
    };

    const dragoverHandler = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const dragendHandler = () => {
        dragNodeService.clearDragInfo();
    };

    const dropHandler = (e: React.DragEvent<HTMLDivElement>) => {
        if (!e.currentTarget.classList.contains('allowedDrop')) {
            return;
        }
        dragNodeService.clearDragInfo();
        const draggableItemData = JSON.parse(e.dataTransfer!.getData('text/plain'));
        changeHierarchy!(draggableItemData, e.currentTarget.id);
    };

    //hide add button if the node is leader and has children
    const hideAddButton = dataSource.relationship && dataSource.relationship !== '1' && dataSource.children.length > 0;

    return (
        <li className="oc-hierarchy">
            <div
                ref={node}
                id={dataSource.ordinalId}
                className={nodeClass}
                draggable={dataSource.isActionDragDrop}
                onDragStart={dragstartHandler}
                onDragOver={dragoverHandler}
                onDragEnd={dragendHandler}
                onDrop={dropHandler}
                onMouseEnter={addArrows}
                onMouseLeave={removeArrows}
                onClick={() => handleGetNode(dataSource, 'info')}
            >
                <div className="button-action-org-chart">
                    {dataSource.unitTypeLevel === 1 && !movedNodeChart && (
                        <>
                            {userPermissions?.includes('Add') && dataSource.isActionAdd && (
                                <Tooltip title="Add">
                                    <Button
                                        type="link"
                                        className={`button-size-org ${buttonAction === undefined ? 'disHidden' : ' button-add'}`}
                                        icon={<PlusSquareOutlined />}
                                        onClick={e => {
                                            e.stopPropagation();
                                            handleGetNode(dataSource, 'add');
                                        }}
                                    />
                                </Tooltip>
                            )}
                            {userPermissions?.includes('Edit') && dataSource.isActionEdit && (
                                <Tooltip title="Edit">
                                    <Button
                                        type="link"
                                        className={`button-size-org ${buttonAction === undefined ? 'disHidden' : ' button-edit'}`}
                                        icon={<EditOutlined />}
                                        onClick={e => {
                                            e.stopPropagation();
                                            handleGetNode(dataSource, 'edit');
                                        }}
                                    />
                                </Tooltip>
                            )}
                            {userPermissions?.includes('Delete') && dataSource.isActionDelete && !hideAddButton && !dataSource.isLeader && (
                                <Tooltip title="Delete">
                                    <Button
                                        type="link"
                                        className={`button-size-org ${buttonAction === undefined ? 'disHidden' : ' button-delete'}`}
                                        danger
                                        icon={<DeleteOutlined style={{ color: '#ea4343' }} />}
                                        onClick={e => {
                                            e.stopPropagation();
                                            handleGetNode(dataSource, 'delete');
                                        }}
                                    />
                                </Tooltip>
                            )}
                        </>
                    )}
                </div>

                <div>
                    <div className="oc-image">
                        <Avatar
                            className="oc-image-node"
                            src={dataSource.employeeImageUrl || '/media/images/user-profile.svg'}
                            size={50}
                            alt={dataSource.fullName}
                            onMouseDown={e => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                        />
                    </div>
                    <div className="oc-card">
                        <div className="oc-heading">{dataSource.fullName}</div>
                        <div className="oc-content">{dataSource.positionName}</div>
                        <div className="oc-tag">
                            {dataSource.unitName &&
                                (dataSource?.unitTypeLevel === 1 ? (
                                    dataSource.groupName ? (
                                        <BaseTag
                                            colorText="#2A9AD6"
                                            colorBr="transparent"
                                            colorBg="#EAF5FB"
                                            statusName={dataSource.groupName}
                                            className="oc-team"
                                        />
                                    ) : null
                                ) : (
                                    <BaseTag
                                        colorText="#2A9AD6"
                                        colorBr="transparent"
                                        colorBg="#EAF5FB"
                                        statusName={dataSource.unitName}
                                        className="oc-team"
                                    />
                                ))}
                        </div>
                    </div>

                    {collapsible && dataSource.relationship && dataSource.relationship.charAt(2) === '1' && dataSource.relationship !== '001' && (
                        <i
                            className={`oc-edge verticalEdge bottomEdge oci ${
                                bottomEdgeExpanded === undefined ? '' : bottomEdgeExpanded ? 'oci-chevron-up' : 'oci-chevron-down'
                            }`}
                            onClick={bottomEdgeClickHandler}
                        />
                    )}
                </div>
            </div>
            {dataSource.children && dataSource.children.length > 0 && (
                <ul className={isChildrenCollapsed ? 'hidden' : ''}>
                    {dataSource.children.map(node => (
                        <ChartNode
                            dataSource={node}
                            key={node.ordinalId}
                            draggable={dataSource.isActionDragDrop}
                            collapsible={collapsible}
                            multipleSelect={multipleSelect}
                            changeHierarchy={changeHierarchy}
                            handleGetNode={handleGetNode}
                            movedNodeChart={movedNodeChart}
                            userPermissions={userPermissions}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
};

export default ChartNode;
