import { IChartContainerProps, IOrgNode } from '@/types/group-management/group-management.js';
import usePermissions from '@/utils/hook/usePermissions.ts';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import './chart-container.scss';
import ChartNode from './chart-node.tsx';
import JSONDigger from './json-digger.ts';

const ChartContainer = forwardRef<any, IChartContainerProps>((props, ref) => {
    const {
        dataSource,
        pan = false,
        zoom = false,
        zoomOutLimit = 0.5,
        zoomInLimit = 7,
        containerClass = '',
        chartClass = '',
        collapsible = true,
        multipleSelect = false,
        handleGetNode,
        setMovedNodeChart,
        movedNodeChart,
        setDataChartAfterChange
    } = props;

    const container = useRef<HTMLDivElement>(null);
    const chart = useRef<HTMLDivElement>(null);
    const { id } = useParams();
    const { havePermission } = usePermissions('OrganizationChart', 'GroupManagement');

    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const [transform, setTransform] = useState('');
    const [panning, setPanning] = useState(false);
    const [cursor, setCursor] = useState('default');
    const [ds, setDS] = useState(dataSource);

    const attachRel = (data: IOrgNode, flags: string): any => {
        data.relationship = flags + (data.children && data.children.length > 0 ? '1' : '0');

        if (data.children) {
            data.children.forEach(item => {
                attachRel(item, '1' + (data.children && data.children.length > 1 ? '1' : '0'));
            });
        }
        return data;
    };

    useEffect(() => {
        setDS(dataSource);
    }, [dataSource]);

    useEffect(() => {
        setTransform('');
    }, [id]);

    const dsDigger = new JSONDigger(dataSource, 'ordinalId', 'children');

    const panEndHandler = (): void => {
        setPanning(false);
        setCursor('default');
    };

    const panHandler = (e: React.MouseEvent<HTMLDivElement, MouseEvent> | React.TouchEvent<HTMLDivElement>): void => {
        let newX = 0;
        let newY = 0;
        if (!('targetTouches' in e)) {
            newX = e.pageX - startX;
            newY = e.pageY - startY;
        } else if (e.targetTouches.length === 1) {
            newX = e.targetTouches[0].pageX - startX;
            newY = e.targetTouches[0].pageY - startY;
        } else if (e.targetTouches.length > 1) {
            return;
        }

        if (transform === '') {
            if (transform.indexOf('3d') === -1) {
                setTransform('matrix(1, 0, 0, 1, ' + newX + ', ' + newY + ')');
            } else {
                setTransform('matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,' + newX + ', ' + newY + ',0,1)');
            }
        } else {
            const matrix: string[] = transform.split(',');
            if (transform.indexOf('3d') === -1) {
                matrix[4] = String(newX);
                matrix[5] = String(newY) + ')';
            } else {
                matrix[12] = String(newX);
                matrix[13] = String(newY);
            }
            setTransform(matrix.join(','));
        }
    };

    const panStartHandler = (e: React.MouseEvent<HTMLDivElement, MouseEvent> | React.TouchEvent<HTMLDivElement>): void => {
        if (e.target instanceof HTMLElement) {
            if (e.target.closest('.oc-node')) {
                setPanning(false);
                return;
            } else {
                setPanning(true);
                setCursor('move');
            }
            let lastX = 0;
            let lastY = 0;
            if (transform !== '') {
                const matrix = transform.split(',');

                if (transform.indexOf('3d') === -1) {
                    lastX = parseInt(matrix[4]);
                    lastY = parseInt(matrix[5]);
                } else {
                    lastX = parseInt(matrix[12]);
                    lastY = parseInt(matrix[13]);
                }
            }
            if (!('targetTouches' in e)) {
                setStartX(e.pageX - lastX);
                setStartY(e.pageY - lastY);
            } else if (e.targetTouches.length === 1) {
                setStartX(e.targetTouches[0].pageX - lastX);
                setStartY(e.targetTouches[0].pageY - lastY);
            } else if (e.targetTouches.length > 1) {
                return;
            }
        }
    };

    const updateChartScale = (newScale: number): void => {
        let matrix: string[] = [];
        let targetScale = 1;

        if (transform === '') {
            setTransform('matrix(' + newScale + ', 0, 0, ' + newScale + ', 0, 0)');
        } else {
            matrix = transform.split(',');
            if (transform.indexOf('3d') === -1) {
                targetScale = Math.abs(window.parseFloat(matrix[3]) * newScale);
                if (targetScale >= zoomOutLimit && targetScale <= zoomInLimit) {
                    matrix[0] = 'matrix(' + targetScale;
                    matrix[3] = String(targetScale);
                    setTransform(matrix.join(','));
                }
            } else {
                targetScale = Math.abs(window.parseFloat(matrix[5]) * newScale);
                if (targetScale >= zoomOutLimit && targetScale <= zoomInLimit) {
                    matrix[0] = 'matrix3d(' + targetScale;
                    matrix[5] = String(targetScale);
                    setTransform(matrix.join(','));
                }
            }
        }
    };

    const zoomHandler = (e: React.WheelEvent<HTMLDivElement>): void => {
        const newScale = 1 + (e.deltaY > 0 ? -0.2 : 0.2);
        updateChartScale(newScale);
    };

    const changeHierarchy = async (draggableItemData: any, dropTargetId: string): Promise<void> => {
        setMovedNodeChart?.(true);
        await dsDigger.removeNode(draggableItemData.ordinalId);

        await dsDigger.addChildren(dropTargetId, draggableItemData);
        setDS({ ...dsDigger.ds });
    };

    useImperativeHandle(ref, () => ({
        expandAllNodes: () => {
            chart.current?.querySelectorAll('.oc-node.hidden, .oc-hierarchy.hidden, .isSiblingsCollapsed, .isAncestorsCollapsed').forEach(el => {
                el.classList.remove('hidden', 'isSiblingsCollapsed', 'isAncestorsCollapsed');
            });
        }
    }));

    const getChartUserPermission = () => {
        return [havePermission('Add'), havePermission('Edit'), havePermission('Delete')];
    };

    useEffect(() => {
        setDataChartAfterChange(ds);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ds]);

    return (
        <div
            ref={container}
            className={'org-chart-container ' + containerClass}
            onWheel={zoom ? zoomHandler : undefined}
            onMouseUp={pan && panning ? panEndHandler : undefined}
            onMouseDown={pan ? panStartHandler : undefined}
            onMouseMove={pan && panning ? panHandler : undefined}
            style={{ cursor: cursor }}
        >
            <div ref={chart} className={'org-chart ' + chartClass} style={{ transform: transform }}>
                <ul>
                    <ChartNode
                        dataSource={attachRel(ds, '00')}
                        draggable={dataSource.isActionDragDrop}
                        collapsible={collapsible}
                        multipleSelect={multipleSelect}
                        changeHierarchy={changeHierarchy}
                        handleGetNode={handleGetNode}
                        movedNodeChart={movedNodeChart}
                        userPermissions={getChartUserPermission()}
                    />
                </ul>
            </div>
        </div>
    );
});

export default ChartContainer;
