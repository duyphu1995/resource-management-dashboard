import DetailContent from '@/components/common/detail-management/detail-content';
import DetailHeader from '@/components/common/detail-management/detail-header';
import SearchInput from '@/components/common/form/input/search-input';
import ReportFilter from '@/components/common/report-filter';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import pathnames from '@/pathnames';
import roleAndPermissionService from '@/services/admin/role-and-permission';
import { IUserPermission } from '@/types/admin';
import { formatDataTable, remapUnits } from '@/utils/common';
import useLoading from '@/utils/hook/useLoading';
import { searchByKeyword } from '@/utils/table';
import { Button, Flex, Form } from 'antd';
import { ColumnType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TreeSelect from '@/components/common/form/tree-select';
import { IFilterData } from '@/types/filter';
import { ORG_UNITS } from '@/utils/constants';
import BaseSelect from '@/components/common/form/select';
import employeeService from '@/services/hr-management/employee-management';
import { IEmployeeUnit } from '@/types/hr-management/employee-management';
import ButtonsIcon from '@/components/common/table/buttons-icon';
import icons from '@/utils/icons';
import DialogCommon from '@/components/common/dialog/dialog-common/dialog-common';
import useNotify from '@/utils/hook/useNotify';
interface FilterOptions {
    label: string;
    value: string;
}

interface IFilter {
    unitIds: string[];
    positionIds: string[];
    companyIds: string[];
}

const UerPermissionPage = () => {
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();
    const [loadingFilter, setLoadingFilter] = useState<boolean>(false);
    const [filterData, setFilterData] = useState<IFilter | object>({});
    const [filterForm] = Form.useForm();
    const [companyOptions, setCompanyOptions] = useState<FilterOptions[]>([]);
    const [units, setUnits] = useState<IEmployeeUnit[]>([]);
    const [positionOptions, setPositionOptions] = useState<FilterOptions[]>([]);

    const [allData, setAllData] = useState<any>([]);
    const [data, setData] = useState<any>(allData);
    const [isReload, setIsReload] = useState<object>({});
    const [keyword, setKeyword] = useState('');

    const filterDataColumn: IFilterData[] = [
        {
            key: 'companyIds',
            label: 'Company',
            forColumns: ['companyName'],
            alwaysShow: true,
            control: (
                <BaseSelect
                    mode="multiple"
                    size="small"
                    options={companyOptions || []}
                    placeholder="Select company"
                    searchPlaceholder="Search company"
                />
            )
        },
        {
            key: 'unitIds',
            label: ORG_UNITS.Project,
            forColumns: ['dgName', 'dcName', 'projectName'],
            alwaysShow: true,
            control: <TreeSelect multiple size="small" treeData={units || []} placeholder="Select project" searchPlaceholder="Search project" />
        },
        {
            key: 'positionIds',
            label: 'Position',
            forColumns: ['positionName'],
            alwaysShow: true,
            control: (
                <BaseSelect
                    mode="multiple"
                    size="small"
                    options={positionOptions || []}
                    placeholder="Select position"
                    searchPlaceholder="Search position"
                />
            )
        }
    ];

    const [columns] = useState<ColumnType<IUserPermission>[]>([
        {
            title: 'Badge ID',
            dataIndex: 'badgeId',
            key: 'badgeId',
            fixed: 'left',
            width: 109,
            render: (item: string) => renderWithFallback(item, true, 7)
        },
        {
            title: 'Full Name',
            dataIndex: 'fullName',
            key: 'fullName',
            fixed: 'left',
            width: 184,
            render: (_: string, record: any) => (
                <Link
                    className="underline"
                    style={{ color: '#1E6D98' }}
                    to={pathnames.admin.roleAndPermission.detailUserPermission.path + '/' + record.employeeId}
                >
                    {renderWithFallback(record.fullName)}
                </Link>
            )
        },
        {
            title: 'Work Email',
            dataIndex: 'workEmail',
            key: 'workEmail',
            width: 184,
            render: (item: string) => renderWithFallback(item, true, 30)
        },
        {
            title: ORG_UNITS.Project,
            dataIndex: 'project',
            key: 'project',
            width: 184,
            render: (item: string) => renderWithFallback(item)
        },
        {
            title: 'Position',
            dataIndex: 'positionName',
            key: 'positionName',
            width: 184,
            render: (item: string) => renderWithFallback(item)
        },
        {
            title: 'Role',
            dataIndex: 'roleName',
            key: 'roleName',
            width: 184,
            render: (item: string) => renderWithFallback(item)
        },
        {
            key: 'lastModifiedOn',
            title: 'Edited Date',
            width: 109,
            render: (record: IUserPermission) => renderWithFallback(record.lastModifiedOn)
        },
        {
            title: 'Company',
            dataIndex: 'companyName',
            key: 'companyName',
            width: 184,
            render: (item: string) => renderWithFallback(item, true, 25)
        },
        {
            key: 'action',
            title: 'Action',
            width: 76,
            fixed: 'right',
            render: (record: IUserPermission) => (
                <ButtonsIcon
                    items={[
                        {
                            icon: icons.tableAction.delete,
                            tooltip: 'Delete',
                            onClick: () => onShowDeleteDialog(record)
                        }
                    ]}
                ></ButtonsIcon>
            )
        }
    ]);

    const onFilter = async (value: IFilter) => {
        setFilterData(value);
    };

    useEffect(() => {
        const fetchFilterData = async () => {
            setLoadingFilter(true);
            const res = await employeeService.getAllIndexes('RoleAndPermission');
            const { data } = res;
            const companyOptions = data?.companies?.map(item => ({
                label: item.companyName,
                value: item.companyId.toString()
            }));
            const unitData = remapUnits(data?.units || []);
            const positionOptions = data?.positions?.map(item => ({
                label: item.positionName,
                value: item.positionId.toString()
            }));
            setUnits(unitData);
            setCompanyOptions(companyOptions || []);
            setPositionOptions(positionOptions || []);

            setLoadingFilter(false);
        };
        fetchFilterData();
    }, [filterForm]);

    const onResetFilter = () => {
        setLoadingFilter(true);
        setFilterData({});
        filterForm.resetFields();
        setLoadingFilter(false);
    };

    useEffect(() => {
        const fetchData = async () => {
            turnOnLoading();
            const res = await roleAndPermissionService.getUserPermission(filterData);
            const { data = [] } = res;
            setAllData(data || []);
            turnOffLoading();
        };

        fetchData();
    }, [isReload, filterData, turnOnLoading, turnOffLoading]);

    useEffect(() => {
        setData(searchByKeyword(allData, columns, keyword, []));
    }, [keyword, allData, columns]);

    const deleteDialogTitle = 'Delete User Permission';
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deletedData, setDeletedData] = useState<IUserPermission | null>(null);
    const deleteDialogContent = (
        <div style={{ width: 384 }}>
            The user <strong>{deletedData?.fullName}</strong> will be deleted. Are you sure you want to delete this user?
        </div>
    );

    const onShowDeleteDialog = (deletedData: IUserPermission) => {
        setDeletedData(deletedData);
        setShowDeleteDialog(true);
    };

    const onCloseDeleteDialog = () => setShowDeleteDialog(false);

    const onReloadTable = () => setIsReload({});

    const onDelete = async () => {
        const res = await roleAndPermissionService.deleteUserPermission(deletedData?.employeeId || 0);
        const { succeeded, message } = res;
        if (succeeded) {
            onReloadTable();
        }
        showNotification(succeeded, message);
        onCloseDeleteDialog();
    };

    return (
        <DetailContent>
            <DetailHeader pageTitle="User Permission" buttons={[]} />

            <Flex justify="space-between" gap={'20px 22px'}>
                <div>
                    <SearchInput style={{ width: 357 }} placeholder="Search by BagdeID, FullName, Work Email" setKeyword={setKeyword} />
                </div>
            </Flex>
            <ReportFilter
                loading={loadingFilter}
                data={filterDataColumn}
                filterForm={filterForm}
                onFilter={onFilter}
                onResetFilter={onResetFilter}
                hiddenButtonFilter
                showFilter
            />
            <Flex justify="flex-end" gap={'20px 22px'}>
                <Link to={pathnames.admin.roleAndPermission.addUserPermission.path}>
                    <Button type="primary">Add User Permission</Button>
                </Link>
                <Link to={pathnames.admin.roleAndPermission.addUserPermissionByUnit.path}>
                    <Button type="primary">Add User Permission By Unit</Button>
                </Link>
            </Flex>

            <BaseTable columns={columns} dataSource={formatDataTable(data)} style={{ marginTop: 24 }} loading={isLoading} />
            <DialogCommon
                title={deleteDialogTitle}
                content={deleteDialogContent}
                open={showDeleteDialog}
                onClose={onCloseDeleteDialog}
                buttonType="default-danger"
                buttonLeftClick={onCloseDeleteDialog}
                buttonRightClick={onDelete}
            />
        </DetailContent>
    );
};

export default UerPermissionPage;
