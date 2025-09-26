import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import DetailHeader from '@/components/common/detail-management/detail-header';
import DialogCommon from '@/components/common/dialog/dialog-common/dialog-common';
import SearchInput from '@/components/common/form/input/search-input';
import ButtonsIcon from '@/components/common/table/buttons-icon';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import pathnames from '@/pathnames';
import { selectSearchParams } from '@/redux/search-params-slice';
import { useAppSelector } from '@/redux/store';
import nationalityService from '@/services/admin/nationality';
import { IAdminNationality } from '@/types/admin';
import { formatDataTable, formatTimeMonthDayYear } from '@/utils/common';
import { useDataTableControls } from '@/utils/hook/useDataTableControls';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';
import icons from '@/utils/icons';
import { createSorter, searchByKeyword } from '@/utils/table';
import { Button, Flex } from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { ColumnType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const breadcrumbItems: BreadcrumbItemType[] = [
    { title: pathnames.admin.main.name },
    { title: pathnames.admin.appendix.main.name },
    { title: pathnames.admin.appendix.employeeAppendix.main.name },
    {
        path: pathnames.admin.appendix.employeeAppendix.nationality.main.path,
        title: pathnames.admin.appendix.employeeAppendix.nationality.main.name
    }
];

const NationalityPage = () => {
    const { showNotification } = useNotify();
    const { havePermission } = usePermissions('AppendixEmployeeAppendixNationalityList', 'Nationality');
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();
    const selectSearchParamsRedux = useAppSelector(selectSearchParams);
    const searchByKeywordFromRedux = selectSearchParamsRedux.adminNationality.searchByKeyword;
    const paginationTableFromRedux = selectSearchParamsRedux.adminNationality.paginationTable;

    const [keyword, setKeyword] = useState(searchByKeywordFromRedux || '');
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deletedData, setDeletedData] = useState<IAdminNationality | null>(null);
    const [showDeleteWarningDialog, setShowDeleteWarningDialog] = useState(false);
    const [allData, setAllData] = useState<IAdminNationality[]>([]);
    const [data, setData] = useState<IAdminNationality[]>(allData);
    const [isReload, setIsReload] = useState<object>({});

    const deleteDialogTitle = 'Delete Nationality';
    const deleteWarningDialogTitle = 'Can’t Delete';

    const deleteDialogContent = (
        <div style={{ width: 384 }}>
            The Nationality <strong>{deletedData?.nationalityName}</strong> will be deleted. Are you sure you want to delete this Nationality?
        </div>
    );
    const deleteWarningDialogContent = (
        <div style={{ width: 384 }}>
            Cannot delete Nationality <strong>{deletedData?.nationalityName}</strong>. Because this Nationality has been using.
        </div>
    );

    const [columns] = useState<ColumnType<IAdminNationality>[]>([
        {
            key: 'nationalityName',
            title: 'National Name',
            width: 329,
            fixed: 'left',
            sorter: createSorter('nationalityName'),
            render: (record: IAdminNationality) => (
                <Link
                    className="underline"
                    style={{ color: '#323232' }}
                    to={pathnames.admin.appendix.employeeAppendix.nationality.detail.path + '/' + record.nationalityId}
                >
                    {renderWithFallback(record.nationalityName)}
                </Link>
            )
        },
        {
            key: 'createdOn',
            title: 'Created Date',
            width: 184,
            sorter: createSorter('createdOn', 'date'),
            render: (record: IAdminNationality) => renderWithFallback(formatTimeMonthDayYear(record.createdOn))
        },
        {
            key: 'lastModifiedOn',
            title: 'Edited Date',
            width: 184,
            sorter: createSorter('lastModifiedOn'),
            render: (record: IAdminNationality) => renderWithFallback(formatTimeMonthDayYear(record.lastModifiedOn))
        },
        {
            key: 'action',
            title: 'Action',
            width: 76,
            fixed: 'right',
            render: (record: IAdminNationality) => (
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

    const onCloseDeleteDialog = () => setShowDeleteDialog(false);
    const onShowDeleteWarningDialog = () => setShowDeleteWarningDialog(true);
    const onCloseDeleteWarningDialog = () => setShowDeleteWarningDialog(false);
    const onReloadTable = () => setIsReload({});

    const onShowDeleteDialog = (deletedData: IAdminNationality) => {
        setDeletedData(deletedData);
        setShowDeleteDialog(true);
    };

    const onDelete = async () => {
        turnOnLoading();
        onCloseDeleteDialog();

        try {
            const res = await nationalityService.delete(deletedData?.nationalityId || 0);
            const { succeeded, message } = res;

            if (succeeded) {
                onReloadTable();
            } else {
                onShowDeleteWarningDialog();
                return;
            }
            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Failed to delete');
        } finally {
            turnOffLoading();
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            turnOnLoading();
            const res = await nationalityService.getAll('Nationality');
            const { data = [] } = res;
            setAllData(data);
            turnOffLoading();
        };

        fetchData();
    }, [isReload, turnOnLoading, turnOffLoading]);

    // Update data when data or keyword changed
    useEffect(() => {
        setData(searchByKeyword(allData, columns, keyword, ['createdOn', 'lastModifiedOn']));
    }, [keyword, allData, columns]);

    const { handlePageChange, setSearchByKeyword } = useDataTableControls('adminNationality');

    useEffect(() => {
        setSearchByKeyword(keyword);
    }, [keyword, setSearchByKeyword]);

    return (
        <DetailContent>
            <BaseBreadcrumb dataItem={breadcrumbItems} />
            <DetailHeader pageTitle="Nationality" buttons={[]} />

            <Flex justify="space-between" gap={'20px 22px'}>
                <SearchInput style={{ width: 357 }} placeholder="Search by nationality name" setKeyword={setKeyword} defaultValue={keyword} />

                {havePermission('Add') && (
                    <Link to={pathnames.admin.appendix.employeeAppendix.nationality.add.path}>
                        <Button type="primary">Add New Nationality</Button>
                    </Link>
                )}
            </Flex>

            <BaseTable
                columns={columns}
                dataSource={formatDataTable(data)}
                style={{ marginTop: 24 }}
                scroll={{ x: 'max-content', y: 533 }}
                loading={isLoading}
                paginationTable={{
                    currentPage: paginationTableFromRedux?.currentPage || 1,
                    pageSize: paginationTableFromRedux?.pageSize || 10,
                    onChange: handlePageChange
                }}
            />
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

export default NationalityPage;
