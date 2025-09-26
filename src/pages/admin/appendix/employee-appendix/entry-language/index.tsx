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
import entryLanguageService from '@/services/admin/entry-language';
import { IAdminEntryLanguage } from '@/types/admin';
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

const EntryLanguagePage = () => {
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();
    const selectSearchParamsRedux = useAppSelector(selectSearchParams);
    const searchByKeywordFromRedux = selectSearchParamsRedux.adminEntryLanguage.searchByKeyword;
    const paginationTableFromRedux = selectSearchParamsRedux.adminEntryLanguage.paginationTable;

    const [keyword, setKeyword] = useState(searchByKeywordFromRedux || '');
    const [allData, setAllData] = useState<IAdminEntryLanguage[]>([]);
    const [data, setData] = useState<IAdminEntryLanguage[]>(allData);
    const [isReload, setIsReload] = useState<object>({});
    const [showDeleteWarningDialog, setShowDeleteWarningDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deletedData, setDeletedData] = useState<IAdminEntryLanguage | null>(null);
    const { havePermission } = usePermissions('AppendixEmployeeAppendixEntryLanguageList', 'EntryLanguage');

    const deleteDialogTitle = 'Delete Entry Language';
    const deleteWarningDialogTitle = 'Can’t Delete';

    const deleteDialogContent = (
        <div style={{ width: 384 }}>
            The Entry Language <strong>{deletedData?.entryLanguageName}</strong> will be deleted. Are you sure you want to delete this Entry Language?
        </div>
    );
    const deleteWarningDialogContent = (
        <div style={{ width: 384 }}>
            Cannot delete Entry Language <strong>{deletedData?.entryLanguageName}</strong>. Because this Entry Language has been using.
        </div>
    );

    const breadcrumbItems: BreadcrumbItemType[] = [
        { title: pathnames.admin.main.name },
        { title: pathnames.admin.appendix.main.name },
        { title: pathnames.admin.appendix.employeeAppendix.main.name },
        { title: pathnames.admin.appendix.employeeAppendix.entryLanguage.main.name }
    ];

    const [columns] = useState<ColumnType<IAdminEntryLanguage>[]>([
        {
            key: 'entryLanguageName',
            title: 'Entry Language Name',
            width: 329,
            fixed: 'left',
            sorter: createSorter('entryLanguageName'),
            render: (record: IAdminEntryLanguage) => (
                <Link
                    className="underline"
                    style={{ color: '#323232' }}
                    to={pathnames.admin.appendix.employeeAppendix.entryLanguage.detail.path + '/' + record.entryLanguageId}
                >
                    {renderWithFallback(record.entryLanguageName)}
                </Link>
            )
        },
        {
            key: 'createdOn',
            title: 'Created Date',
            width: 184,
            sorter: createSorter('createdOn', 'date'),
            render: (record: IAdminEntryLanguage) => renderWithFallback(formatTimeMonthDayYear(record.createdOn))
        },
        {
            key: 'lastModifiedOn',
            title: 'Edited Date',
            width: 184,
            sorter: createSorter('lastModifiedOn'),
            render: (record: IAdminEntryLanguage) => renderWithFallback(formatTimeMonthDayYear(record.lastModifiedOn))
        },
        {
            key: 'action',
            title: 'Action',
            width: 76,
            fixed: 'right',
            render: (record: IAdminEntryLanguage) => (
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

    const { handlePageChange, setSearchByKeyword } = useDataTableControls('adminEntryLanguage');

    useEffect(() => {
        setSearchByKeyword(keyword);
    }, [keyword, setSearchByKeyword]);

    const onCloseDeleteDialog = () => setShowDeleteDialog(false);
    const onReloadTable = () => setIsReload({});
    const onShowDeleteWarningDialog = () => setShowDeleteWarningDialog(true);
    const onCloseDeleteWarningDialog = () => setShowDeleteWarningDialog(false);

    const onShowDeleteDialog = (deletedData: IAdminEntryLanguage) => {
        setDeletedData(deletedData);
        setShowDeleteDialog(true);
    };

    const onDelete = async () => {
        onCloseDeleteDialog();

        try {
            const res = await entryLanguageService.delete(deletedData?.entryLanguageId || 0);
            const { succeeded, message, errors } = res;

            if (succeeded) {
                onReloadTable();
            } else if (errors?.some(error => error.FieldName === 'entryLanguageId')) {
                onShowDeleteWarningDialog();
                return;
            }
            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Failed to delete');
        }
    };

    useEffect(() => {
        setData(searchByKeyword(allData, columns, keyword, ['createdOn', 'lastModifiedOn']));
    }, [keyword, allData, columns]);

    useEffect(() => {
        const fetchData = async () => {
            turnOnLoading();
            const res = await entryLanguageService.getAll('EntryLanguage');
            const { data, succeeded } = res;

            if (succeeded && data) setAllData(data);
            turnOffLoading();
        };

        fetchData();
    }, [isReload, turnOnLoading, turnOffLoading, showNotification]);

    return (
        <DetailContent>
            <BaseBreadcrumb dataItem={breadcrumbItems} />
            <DetailHeader pageTitle={pathnames.admin.appendix.employeeAppendix.entryLanguage.main.name} buttons={[]} />

            {/* Search Input and Button Add new */}
            <Flex justify="space-between">
                <SearchInput style={{ width: 357 }} placeholder="Search by entry language" setKeyword={setKeyword} defaultValue={keyword} />
                {havePermission('Add') && (
                    <Link to={pathnames.admin.appendix.employeeAppendix.entryLanguage.add.path}>
                        <Button type="primary">Add New Entry Language</Button>
                    </Link>
                )}
            </Flex>

            {/* TABLE */}
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

export default EntryLanguagePage;
