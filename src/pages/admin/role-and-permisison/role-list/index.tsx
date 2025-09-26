import DetailContent from '@/components/common/detail-management/detail-content';
import DetailHeader from '@/components/common/detail-management/detail-header';
import DialogCommon from '@/components/common/dialog/dialog-common/dialog-common';
import SearchInput from '@/components/common/form/input/search-input';
import ButtonsIcon from '@/components/common/table/buttons-icon';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import pathnames from '@/pathnames';
import roleAndPermissionService from '@/services/admin/role-and-permission';
import { IRoleList } from '@/types/admin';
import { formatDataTable, formatTimeMonthDayYear } from '@/utils/common';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import icons from '@/utils/icons';
import { searchByKeyword } from '@/utils/table';
import { Button, Flex } from 'antd';
import { ColumnType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const UserListPage = () => {
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();
    const [allData, setAllData] = useState<IRoleList[]>([]);
    const [data, setData] = useState<IRoleList[]>(allData);
    const [isReload, setIsReload] = useState<object>({});
    const [keyword, setKeyword] = useState('');

    const [columns] = useState<ColumnType<IRoleList>[]>([
        {
            key: 'roleName',
            title: 'Role Name',
            width: 329,
            fixed: 'left',
            render: (record: IRoleList) => (
                <Link
                    className="underline"
                    style={{ color: '#1E6D98' }}
                    to={pathnames.admin.roleAndPermission.detail.path + '/' + record.roleGroupId}
                >
                    {renderWithFallback(record.roleName)}
                </Link>
            )
        },
        {
            key: 'createdOn',
            title: 'Created Date',
            width: 184,
            render: (record: IRoleList) => renderWithFallback(formatTimeMonthDayYear(record.createdOn))
        },
        {
            key: 'lastModifiedOn',
            title: 'Edited Date',
            width: 184,
            render: (record: IRoleList) => renderWithFallback(formatTimeMonthDayYear(record.lastModifiedOn))
        },
        {
            key: 'action',
            title: 'Action',
            width: 76,
            fixed: 'right',
            render: (record: IRoleList) => {
                if (record.roleGroupId !== 10) {
                    return (
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

            }
        }
    ]);

    const deleteDialogTitle = 'Delete Role';
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deletedData, setDeletedData] = useState<IRoleList | null>(null);
    const deleteDialogContent = (
        <div style={{ width: 384 }}>
            The Role <strong>{deletedData?.roleName}</strong> will be deleted. Are you sure you want to delete this Role?
        </div>
    );

    const onShowDeleteDialog = (deletedData: IRoleList) => {
        setDeletedData(deletedData);
        setShowDeleteDialog(true);
    };

    const onCloseDeleteDialog = () => setShowDeleteDialog(false);

    const onDelete = async () => {
        const res = await roleAndPermissionService.delete(deletedData?.roleGroupId || 0);
        const { succeeded, message } = res;
        if (succeeded) {
            onReloadTable();
            showNotification(succeeded, message);
        } else {
            onShowDeleteWarningDialog();
        }
        onCloseDeleteDialog();
    };

    const deleteWarningDialogTitle = 'Can’t Delete';
    const [showDeleteWarningDialog, setShowDeleteWarningDialog] = useState(false);
    const deleteWarningDialogContent = (
        <div style={{ width: 384 }}>
            Cannot delete Role <strong>{deletedData?.roleName}</strong>. Because this Role has been using.
        </div>
    );

    const onShowDeleteWarningDialog = () => setShowDeleteWarningDialog(true);
    const onCloseDeleteWarningDialog = () => setShowDeleteWarningDialog(false);

    const onReloadTable = () => setIsReload({});

    useEffect(() => {
        const fetchData = async () => {
            turnOnLoading();
            const res = await roleAndPermissionService.getAllRoleList();
            const { data = [] } = res;
            setAllData(data || []);
            turnOffLoading();
        };

        fetchData();
    }, [isReload, turnOnLoading, turnOffLoading]);

    useEffect(() => {
        setData(searchByKeyword(allData, columns, keyword, []));
    }, [keyword, allData, columns]);

    return (
        <DetailContent>
            <DetailHeader pageTitle="Role List" buttons={[]} />
            <Flex justify="space-between" gap={'20px 22px'}>
                <SearchInput style={{ width: 357 }} placeholder="Search by Role Name" setKeyword={setKeyword} />
                <Link to={pathnames.admin.roleAndPermission.add.path}>
                    <Button type="primary">Add New Role</Button>
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
            <DialogCommon
                title={deleteWarningDialogTitle}
                icon="/media/icons/dialog/dialog-warning.svg"
                content={deleteWarningDialogContent}
                open={showDeleteWarningDialog}
                onClose={onCloseDeleteWarningDialog}
                buttonType="default-primary"
                hiddenButtonLeft={true}
                buttonRight="Close"
                buttonRightClick={onCloseDeleteWarningDialog}
            />
        </DetailContent>
    );
};

export default UserListPage;
