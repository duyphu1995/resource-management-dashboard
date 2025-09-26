import { FlatNode, TreeNode } from '@/types/group-management/group-management';
import { IEmployeeUnit } from '@/types/hr-management/employee-management';

interface StructureNode {
    unitId: number;
    unitName: string;
    parentId: number;
    children?: StructureNode[];
}

export const convertToTreeOrg = (data: any[]): { tree: any[]; errors: string[] } => {
    const map: Record<string, any> = {};
    const errors: string[] = [];
    // Create a mapping of nodes based on their IDs
    data.forEach(node => {
        map[node.ordinalId] = { ...node, children: [] };
    });

    const tree: any = [];

    // Build the tree structure using the mapping
    data.forEach(node => {
        if (node.ordinalParentId === '0') {
            tree.push(map[node.ordinalId]);
        } else {
            const parent = map[node.ordinalParentId];
            if (parent) {
                parent.children.push(map[node.ordinalId]);
            } else {
                console.warn(`[HRM Tool] Parent with ID ${node.ordinalParentId} not found for node ${node.ordinalId}`);
                errors.push(`Parent with ID ${node.ordinalParentId} not found for node ${node.ordinalId}`);
            }
        }
    });

    return { tree, errors };
};

const flattenTree = (node: TreeNode, flatData: FlatNode[]) => {
    const flatNode: FlatNode = {
        organizationChartId: node.organizationChartId,
        unitId: node.unitId,
        employeeId: node.employeeId,
        ordinalParentId: node.ordinalParentId,
        isLeader: node.isLeader,
        notes: node.notes || ''
    };
    flatData.push(flatNode);

    node.children.forEach(child => flattenTree(child, flatData));
};

export const convertToFlatOrg = (treeData: TreeNode): FlatNode[] => {
    const flatData: FlatNode[] = [];
    flattenTree(treeData, flatData);
    return flatData;
};

export const convertToTreeStructure = (data: StructureNode[]) => {
    const map: Record<string, any> = {};

    // Create a mapping of nodes based on their IDs
    data.forEach(node => {
        map[node.unitId] = { ...node, children: [], key: node.unitId, title: node.unitName };
    });

    const tree: any[] = [];

    // Build the tree structure using the mapping
    data.forEach(node => {
        if (node.parentId === 0 || node.parentId === null) {
            tree.push(map[node.unitId]);
        } else {
            // Check if `map[node.parentId]` and `map[node.unitId]` exist before operating
            if (map[node.parentId] && map[node.unitId]) {
                map[node.parentId].children.push(map[node.unitId]);
            }
        }
    });

    return tree;
};

export const findUnitId = (unitId: string, units: IEmployeeUnit[]): IEmployeeUnit | undefined => {
    for (const unit of units) {
        if (unit.unitId.toString() === unitId) {
            return unit;
        } else if (unit.children) {
            const foundUnit = findUnitId(unitId, unit.children);
            if (foundUnit) {
                return foundUnit;
            }
        }
    }
    return undefined;
};
