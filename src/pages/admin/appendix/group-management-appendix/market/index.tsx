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
import marketService from '@/services/admin/market';
import { IAdminMarket } from '@/types/admin';
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
    { title: pathnames.admin.appendix.groupManagementAppendix.main.name },
    {
        path: pathnames.admin.appendix.groupManagementAppendix.market.main.path,
        title: pathnames.admin.appendix.groupManagementAppendix.market.main.name
    }
];

const MarketPage = () => {
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();
    const selectSearchParamsRedux = useAppSelector(selectSearchParams);
    const searchByKeywordFromRedux = selectSearchParamsRedux.adminMarket.searchByKeyword;
    const paginationTableFromRedux = selectSearchParamsRedux.adminMarket.paginationTable;

    const { havePermission } = usePermissions('AppendixGroupManagementMarketList', 'Market');

    const [keyword, setKeyword] = useState(searchByKeywordFromRedux || '');
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deletedData, setDeletedData] = useState<IAdminMarket | null>(null);
    const [showDeleteWarningDialog, setShowDeleteWarningDialog] = useState(false);
    const [allData, setAllData] = useState<IAdminMarket[]>([]);
    const [data, setData] = useState<IAdminMarket[]>(allData);
    const [isReload, setIsReload] = useState<object>({});

    const deleteDialogTitle = 'Delete Market';
    const deleteWarningDialogTitle = 'Can’t Delete';

    const deleteDialogContent = (
        <div style={{ width: 384 }}>
            The market <strong>{deletedData?.marketplaceName}</strong> will be deleted. Are you sure you want to delete this market?
        </div>
    );
    const deleteWarningDialogContent = (
        <div style={{ width: 384 }}>
            Cannot delete market <strong>{deletedData?.marketplaceName}</strong>. Because this market has been using.
        </div>
    );

    const [columns] = useState<ColumnType<IAdminMarket>[]>([
        {
            key: 'marketplaceName',
            title: 'Market Name',
            width: 329,
            fixed: 'left',
            sorter: createSorter('marketplaceName'),
            render: (record: IAdminMarket) => (
                <Link
                    className="underline"
                    style={{ color: '#323232' }}
                    to={pathnames.admin.appendix.groupManagementAppendix.market.detail.path + '/' + record.marketplaceId}
                >
                    {renderWithFallback(record.marketplaceName)}
                </Link>
            )
        },
        {
            key: 'marketplaceDescription',
            title: 'Position Description',
            width: 184,
            fixed: 'left',
            sorter: createSorter('marketplaceDescription'),
            render: (record: IAdminMarket) => renderWithFallback(record.marketplaceDescription)
        },
        {
            key: 'createdOn',
            title: 'Created Date',
            width: 184,
            sorter: createSorter('createdOn', 'date'),
            render: (record: IAdminMarket) => renderWithFallback(formatTimeMonthDayYear(record.createdOn))
        },
        {
            key: 'lastModifiedOn',
            title: 'Edited Date',
            width: 184,
            sorter: createSorter('lastModifiedOn'),
            render: (record: IAdminMarket) => renderWithFallback(formatTimeMonthDayYear(record.lastModifiedOn))
        },
        {
            key: 'action',
            title: 'Action',
            width: 76,
            fixed: 'right',
            render: (record: IAdminMarket) => (
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

    const onShowDeleteDialog = (deletedData: IAdminMarket) => {
        setDeletedData(deletedData);
        setShowDeleteDialog(true);
    };

    const onDelete = async () => {
        onCloseDeleteDialog();

        const res = await marketService.delete(deletedData?.marketplaceId || 0);
        const { succeeded, message } = res;

        if (succeeded) {
            onReloadTable();
        } else {
            onShowDeleteWarningDialog();
            return;
        }
        showNotification(succeeded, message);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                turnOnLoading();
                const res = await marketService.getAll();
                const { data = [] } = res;
                setAllData(data);
            } catch (error) {
                showNotification(false, 'Get data failed');
            } finally {
                turnOffLoading();
            }
        };

        fetchData();
    }, [isReload, turnOnLoading, turnOffLoading, showNotification]);

    // Update data when data or keyword changed
    useEffect(() => {
        setData(searchByKeyword(allData, columns, keyword, ['marketplaceDescription', 'createdOn', 'lastModifiedOn']));
    }, [keyword, allData, columns]);

    const { handlePageChange, setSearchByKeyword } = useDataTableControls('adminMarket');

    useEffect(() => {
        setSearchByKeyword(keyword);
    }, [keyword, setSearchByKeyword]);

    return (
        <DetailContent>
            <BaseBreadcrumb dataItem={breadcrumbItems} />
            <DetailHeader pageTitle="Market" buttons={[]} />

            <Flex justify="space-between" gap={'20px 22px'}>
                <SearchInput style={{ width: 357 }} defaultValue={keyword} placeholder="Search by Market Name" setKeyword={setKeyword} />

                {havePermission('Add') && (
                    <Link to={pathnames.admin.appendix.groupManagementAppendix.market.add.path}>
                        <Button type="primary">Add New Market</Button>
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

export default MarketPage;
