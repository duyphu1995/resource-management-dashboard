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
import positionService from '@/services/admin/position';
import { IAdminPosition } from '@/types/admin';
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
    { title: pathnames.admin.appendix.employeeAppendix.position.main.name }
];

const PositionPage = () => {
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();
    const selectSearchParamsRedux = useAppSelector(selectSearchParams);
    const searchByKeywordFromRedux = selectSearchParamsRedux.adminPosition.searchByKeyword;
    const paginationTableFromRedux = selectSearchParamsRedux.adminPosition.paginationTable;

    const [keyword, setKeyword] = useState(searchByKeywordFromRedux || '');
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deletedData, setDeletedData] = useState<IAdminPosition | null>(null);
    const [showDeleteWarningDialog, setShowDeleteWarningDialog] = useState(false);
    const [allData, setAllData] = useState<IAdminPosition[]>([]);
    const [data, setData] = useState<IAdminPosition[]>(allData);
    const [isReload, setIsReload] = useState<object>({});
    const { havePermission } = usePermissions('AppendixEmployeeAppendixPositionList', 'Position');

    const deleteDialogTitle = 'Delete Position';
    const deleteWarningDialogTitle = 'Can’t Delete';

    const deleteDialogContent = (
        <div style={{ width: 384 }}>
            The position <strong>{deletedData?.positionName}</strong> will be deleted. Are you sure you want to delete this position?
        </div>
    );

    const deleteWarningDialogContent = (
        <div style={{ width: 384 }}>
            Cannot delete position <strong>{deletedData?.positionName}</strong>. Because this position has been using.
        </div>
    );

    const [columns] = useState<ColumnType<IAdminPosition>[]>([
        {
            key: 'positionName',
            title: 'Position Name',
            width: 329,
            fixed: 'left',
            sorter: createSorter('positionName'),
            render: (record: IAdminPosition) => (
                <Link
                    className="underline"
                    style={{ color: '#323232' }}
                    to={pathnames.admin.appendix.employeeAppendix.position.detail.path + '/' + record.positionId}
                >
                    {renderWithFallback(record.positionName)}
                </Link>
            )
        },
        {
            key: 'grade',
            title: 'Grade',
            width: 184,
            sorter: createSorter('grade', 'grade'),
            render: (record: IAdminPosition) => renderWithFallback(record.grade)
        },
        {
            key: 'positionDescription',
            title: 'Position Description',
            width: 277,
            sorter: createSorter('positionDescription'),
            render: (record: IAdminPosition) => renderWithFallback(record.positionDescription)
        },
        {
            key: 'createdOn',
            title: 'Created Date',
            width: 184,
            sorter: createSorter('createdOn', 'date'),
            render: (record: IAdminPosition) => renderWithFallback(formatTimeMonthDayYear(record.createdOn))
        },
        {
            key: 'lastModifiedOn',
            title: 'Edited Date',
            width: 184,
            sorter: createSorter('lastModifiedOn'),
            render: (record: IAdminPosition) => renderWithFallback(formatTimeMonthDayYear(record.lastModifiedOn))
        },
        {
            key: 'action',
            title: 'Action',
            width: 76,
            fixed: 'right',
            render: (record: IAdminPosition) => (
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

    const onReloadTable = () => setIsReload({});
    const onShowDeleteWarningDialog = () => setShowDeleteWarningDialog(true);
    const onCloseDeleteWarningDialog = () => setShowDeleteWarningDialog(false);
    const onCloseDeleteDialog = () => setShowDeleteDialog(false);

    const onShowDeleteDialog = (deletedData: IAdminPosition) => {
        setDeletedData(deletedData);
        setShowDeleteDialog(true);
    };

    const onDelete = async () => {
        onCloseDeleteDialog();

        try {
            const res = await positionService.delete(deletedData?.positionId || 0);
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
        }
    };

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            turnOnLoading();
            const res = await positionService.getAll();
            let { data = [] } = res;
            data = data.map(row => ({ ...row, grade: `From ${row.minGrade} to ${row.maxGrade}` }));

            setAllData(data);
            turnOffLoading();
        };

        fetchData();
    }, [isReload, turnOnLoading, turnOffLoading]);

    // Update data when data or keyword changed
    useEffect(() => {
        setData(searchByKeyword(allData, columns, keyword, ['grade', 'positionDescription', 'createdOn', 'lastModifiedOn']));
    }, [keyword, allData, columns]);

    const { handlePageChange, setSearchByKeyword } = useDataTableControls('adminPosition');

    useEffect(() => {
        setSearchByKeyword(keyword);
    }, [keyword, setSearchByKeyword]);

    return (
        <DetailContent>
            <BaseBreadcrumb dataItem={breadcrumbItems} />
            <DetailHeader pageTitle={pathnames.admin.appendix.employeeAppendix.position.main.name} buttons={[]} />

            {/* Search Input and Button Add new */}
            <Flex justify="space-between" gap={'20px 22px'}>
                <SearchInput style={{ width: 357 }} defaultValue={keyword} placeholder="Search by Position Name" setKeyword={setKeyword} />
                {havePermission('Add') &&
                    <Link to={pathnames.admin.appendix.employeeAppendix.position.add.path}>
                        <Button type="primary">Add New Position</Button>
                    </Link>
                }
            </Flex>

            {/* TABLE */}
            <BaseTable
                columns={columns}
                dataSource={formatDataTable(data)}
                style={{ marginTop: 24 }}
                loading={isLoading}
                scroll={{ x: 'max-content', y: 533 }}
                paginationTable={{
                    currentPage: paginationTableFromRedux?.currentPage || 1,
                    pageSize: paginationTableFromRedux?.pageSize || 10,
                    onChange: handlePageChange
                }}
            />

            {/* DIALOG */}
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

export default PositionPage;
