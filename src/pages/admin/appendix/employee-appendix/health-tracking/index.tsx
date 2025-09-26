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
import healthTrackingService from '@/services/admin/health-tracking';
import { IAdminHealthTracking } from '@/types/admin';
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
        path: pathnames.admin.appendix.employeeAppendix.healthTracking.main.path,
        title: pathnames.admin.appendix.employeeAppendix.healthTracking.main.name
    }
];

const HealthTrackingPage = () => {
    const { showNotification } = useNotify();
    const { havePermission } = usePermissions('AppendixEmployeeAppendixHealthTrackingList', 'HealthTracking');
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();
    const selectSearchParamsRedux = useAppSelector(selectSearchParams);
    const searchByKeywordFromRedux = selectSearchParamsRedux.adminHealthTracking.searchByKeyword;
    const paginationTableFromRedux = selectSearchParamsRedux.adminHealthTracking.paginationTable;

    const [keyword, setKeyword] = useState(searchByKeywordFromRedux || '');
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deletedData, setDeletedData] = useState<IAdminHealthTracking | null>(null);
    const [allData, setAllData] = useState<IAdminHealthTracking[]>([]);
    const [data, setData] = useState<IAdminHealthTracking[]>(allData);
    const [isReload, setIsReload] = useState<object>({});

    const deleteDialogTitle = 'Delete Nationality';
    const deleteWarningDialogTitle = 'Can’t Delete';

    const [showDeleteWarningDialog, setShowDeleteWarningDialog] = useState(false);
    const deleteWarningDialogContent = (
        <div style={{ width: 384 }}>
            Cannot delete certificate <strong>{deletedData?.certificateName}</strong>. Because this certificate has been using.
        </div>
    );
    const deleteDialogContent = (
        <div style={{ width: 384 }}>
            The certificate <strong>{deletedData?.certificateName}</strong> will be deleted. Are you sure you want to delete this certificate?
        </div>
    );

    const [columns] = useState<ColumnType<IAdminHealthTracking>[]>([
        {
            key: 'certificateName',
            title: 'Certificate Type Name',
            width: 329,
            fixed: 'left',
            sorter: createSorter('certificateName'),
            render: (record: IAdminHealthTracking) => (
                <Link
                    className="underline"
                    style={{ color: '#323232' }}
                    to={pathnames.admin.appendix.employeeAppendix.healthTracking.detail.path + '/' + record.certificateId}
                >
                    {renderWithFallback(record.certificateName)}
                </Link>
            )
        },
        {
            key: 'createdOn',
            title: 'Created Date',
            width: 184,
            sorter: createSorter('createdOn', 'date'),
            render: (record: IAdminHealthTracking) => renderWithFallback(formatTimeMonthDayYear(record.createdOn))
        },
        {
            key: 'lastModifiedOn',
            title: 'Edited Date',
            width: 184,
            sorter: createSorter('lastModifiedOn'),
            render: (record: IAdminHealthTracking) => renderWithFallback(formatTimeMonthDayYear(record.lastModifiedOn))
        },
        {
            key: 'action',
            title: 'Action',
            width: 76,
            fixed: 'right',
            render: (record: IAdminHealthTracking) => (
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

    const onShowDeleteDialog = (deletedData: IAdminHealthTracking) => {
        setDeletedData(deletedData);
        setShowDeleteDialog(true);
    };

    const onDelete = async () => {
        onCloseDeleteDialog();

        try {
            const res = await healthTrackingService.delete(deletedData?.certificateId || 0);
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

    useEffect(() => {
        const fetchData = async () => {
            turnOnLoading();
            const res = await healthTrackingService.getAll();
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

    const { handlePageChange, setSearchByKeyword } = useDataTableControls('adminHealthTracking');

    useEffect(() => {
        setSearchByKeyword(keyword);
    }, [keyword, setSearchByKeyword]);

    return (
        <DetailContent>
            <BaseBreadcrumb dataItem={breadcrumbItems} />
            <DetailHeader pageTitle="Health Tracking" buttons={[]} />

            <Flex justify="space-between" gap={'20px 22px'}>
                <SearchInput style={{ width: 357 }} defaultValue={keyword} placeholder="Search by Heath Tracking" setKeyword={setKeyword} />

                {havePermission('Add') && (
                    <Link to={pathnames.admin.appendix.employeeAppendix.healthTracking.add.path}>
                        <Button type="primary">Add New Health Tracking</Button>
                    </Link>
                )}
            </Flex>

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

export default HealthTrackingPage;
