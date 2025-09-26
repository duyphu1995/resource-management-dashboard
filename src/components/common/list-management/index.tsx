import DialogSummarizeAfterImport, { ISummarize } from '@/components/hr-management/employee-management/dialog/dialog-summarize-after-import';
import { IFilterData, IFilterExportButton, IFilterImportButton } from '@/types/filter';
import { IListManagementProps } from '@/types/list-management';
import { IQuickFilterData, IQuickFilterField } from '@/types/quick-filter';
import { ITableShowedColumn } from '@/types/table';
import { appendFormData, convertToSimpleText, downloadFile } from '@/utils/common';
import useNotify from '@/utils/hook/useNotify';
import icons from '@/utils/icons';
import { Button } from 'antd';
import { AnyObject } from 'antd/es/_util/type';
import { useForm } from 'antd/es/form/Form';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import BaseBreadcrumb from '../breadcrumb';
import DialogCommon from '../dialog/dialog-common/dialog-common';
import BaseTable from '../table/table';
import Collapse from './collapse';
import Filter from './filter';
import { convertFilterValueToString, convertStringToFilterValue, getFilterValue, getShowedColumns } from './filter/use-filter';
import './index.scss';
import QuickFilter from './quick-filter';
import QuickFilterUpdateDialog from './quick-filter/quick-filter-update-dialog';

const ListManagement = <T extends AnyObject>(props: IListManagementProps<T>) => {
    const { pageTitle, breadcrumb, buttons, quickFilter, filter, table } = props;

    const location = useLocation();
    const { showNotification } = useNotify();

    // Quick filter data
    const [quickFilterData, setQuickFilterData] = useState<IQuickFilterData[]>([]);
    const [loadingQuickFilter, setLoadingQuickFilter] = useState(false);
    const [activeQuickFilter, setActiveQuickFilter] = useState<IQuickFilterData | undefined>();
    const [reloadQuickFilter, handleReloadQuickFilter] = useState({});

    // Created/updated quick filter
    const [updatedQuickFilter, setUpdatedQuickFilter] = useState<IQuickFilterData>();
    const [showQuickFilterUpdateModal, setShowQuickFilterUpdateModal] = useState(false);

    // Delete quick filter
    const [deletedQuickFilter, setDeletedQuickFilter] = useState<IQuickFilterData>();
    const [showQuickFilterDeleteModal, setShowQuickFilterDeleteModal] = useState(false);

    const getAllQuickFilterService = quickFilter.service.getAll;

    // Fetch quick filter data
    const fetchQuickFilterData = async (getAllQuickFilterService: any) => {
        try {
            // Show loading effect
            setLoadingQuickFilter(true);

            // Call api get quick filter data
            const res = await getAllQuickFilterService();
            const newData = res.data;

            // Return new quick filter data
            return newData || [];
        } catch (error) {
            // Failed => return empty array
            return [];
        } finally {
            // Hide loading effect
            setLoadingQuickFilter(false);
        }
    };

    // When reloadQuickFilter changed,
    // call function to get quick filter data
    useEffect(() => {
        const fetchData = async () => {
            const newData = await fetchQuickFilterData(getAllQuickFilterService);
            setQuickFilterData(newData);
        };

        fetchData();
    }, [reloadQuickFilter, getAllQuickFilterService]);

    // Handle update active item for quick filter
    const handleChangeActiveQuickFilter = async (quickFilterItem: IQuickFilterData) => {
        // Don't change active item when table is loading
        if (table.loading) return;

        // Update active item
        setActiveQuickFilter(quickFilterItem);

        // Update filter value
        let newFilterSegmentedValue: any;
        const newFilterData: IFilterData[] = [];

        if (filter.segmented) {
            // Get segmented value from new active quick filter item
            const quickFilterSegmentedField = quickFilterItem.quickFilterFields.find(field => field.quickFilterFieldName === filter.segmented?.name);

            // If has segmented key in new active quick filter item
            // then update data for segmented
            if (quickFilterSegmentedField) {
                newFilterSegmentedValue = JSON.parse(quickFilterSegmentedField.quickFilterFieldValue);
                filter.segmented.onChange(newFilterSegmentedValue);
            }
        }

        // Update new filter data and new table showed columns
        const filterData = quickFilter.onChange?.(quickFilterItem, newFilterSegmentedValue) || filter.data;
        const newTableShowedColumns = [...table.showedColumns.data];

        filterForm.resetFields();
        filterData.forEach(item => {
            // If filter item has in active quick filter data then it is updated item
            const updatedItem = quickFilterItem.quickFilterFields.find(field => field.quickFilterFieldName === item.key);

            if (updatedItem) {
                const itemValue = convertStringToFilterValue(updatedItem.quickFilterFieldValue, item);

                newFilterData.push({ ...item, show: true });

                // If value isn't null then update new value
                // else reset field value
                if (itemValue != null) filterForm.setFieldValue(item.key, itemValue);
                else filterForm.resetFields([item.key]);

                //  Show columns linked with showed filter item
                const updatedColumnIndex = table.showedColumns.data.findIndex(showedCol => item.forColumns?.find(col => col === showedCol.key));

                if (updatedColumnIndex >= 0) newTableShowedColumns[updatedColumnIndex] = { ...newTableShowedColumns[updatedColumnIndex], show: true };
            } else {
                newFilterData.push({ ...item, show: item.alwaysShow });
                filterForm.setFieldValue(item.key, undefined);
            }
        });

        // Update new filter data
        filter.onChangeData(newFilterData);
        setShowFilterContent(true); // Show filter content

        // Update showed columns
        table.showedColumns.onChange(newTableShowedColumns);

        // Filter and update filter count
        const newFilterValue = getFilterValue(filterForm, newFilterData); // Get valid filter value
        filter.onFilter(newFilterValue);
        updateFilterCount(newFilterData);
    };

    // Handle create/update quick filter
    const handleUpdateQuickFilter = async (value: IQuickFilterData) => {
        // If value has quick filter id then type is updated
        // else then type is created
        const isCreate = value.quickFilterId === undefined;

        // Check and implement segmented value
        if (isCreate && filter.segmented) {
            value = {
                ...value,
                quickFilterFields: [
                    ...value.quickFilterFields,
                    {
                        quickFilterFieldName: filter.segmented.name,
                        quickFilterFieldValue: JSON.stringify(filter.segmented.value)
                    } as IQuickFilterField
                ]
            } as IQuickFilterData;
        }

        // Call api
        const res: any = isCreate ? await quickFilter.service.create(value) : await quickFilter.service.update(value);
        const { succeeded, message } = res;
        const newQuickFilterData = await fetchQuickFilterData(getAllQuickFilterService);

        // Show toast
        showNotification(succeeded, message);

        // Update disable status for buttons
        if (succeeded) {
            if (isCreate) {
                setDisableQuickFilterButton(true);
                setActiveQuickFilter(newQuickFilterData[newQuickFilterData.length - 1]);
            }
        }

        setQuickFilterData(newQuickFilterData);
        setShowQuickFilterUpdateModal(false);
    };

    // Handle delete quick filter item
    const handleDeleteQuickFilter = async () => {
        if (deletedQuickFilter) {
            // Call api to delete quick filter item
            const res: any = await quickFilter.service.delete(deletedQuickFilter?.quickFilterId);
            const { succeeded, message } = res;

            showNotification(succeeded, message);
            setShowQuickFilterDeleteModal(false); // Hide the quick filter delete modal
            if (res?.succeeded) handleReloadQuickFilter({}); // Reload quick filter if successful
        }
    };

    // Filter data
    const [defaultFilterForm] = useForm();
    const filterForm = filter.form || defaultFilterForm;
    const [showFilterContent, setShowFilterContent] = useState(false);
    const [filterCountState, setFilterCountState] = useState(0);
    const filterCount = filter.count?.value ?? filterCountState;
    const setFilterCount = filter.count?.setValue ?? setFilterCountState;
    const [disableFilterApplyButton, setDisableFilterApplyButton] = useState(true);

    useEffect(() => {
        if (Object.values(location.state?.dataFilter || {}).length) {
            const count = Object.values(location.state.dataFilter).filter(value => value).length;
            setFilterCountState(count);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (filterCount <= 0 && filter.data.length) {
            onFilter();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterCount]);

    // Handle update value for filter item
    const onChangeFilterValue = () => {
        filterForm.validateFields();

        // Enable and disable buttons
        setDisableFilterApplyButton(false);
        setDisableQuickFilterButton(true);
        setActiveQuickFilter(undefined);
        updateFilterCount(filter.data);
    };

    const updateFilterCount = (filterData: IFilterData[]) => {
        let newFilterCount = 0;

        filterData.forEach(item => {
            const show = item.alwaysShow || item.show;
            const itemValue = filterForm.getFieldValue(item.key)?.toString();
            if (show && itemValue) newFilterCount++;
            if (!show) {
                filterForm.setFieldValue(item.key, null);
            }
        });

        setFilterCount(newFilterCount);
    };

    // Handle filter data
    const onFilter = () => {
        // Update filter value
        const newFilterValue = getFilterValue(filterForm, filter.data);

        updateFilterCount(filter.data);
        filter.onFilter(newFilterValue);

        // Update showed columns
        const getShowedFilterName = () => {
            const showedFilterNames: string[] = [];

            filter.data.forEach(item => {
                if (item.show) {
                    item.forColumns.forEach(col => {
                        if (!showedFilterNames.find(name => name === col)) showedFilterNames.push(col);
                    });
                }
            });

            return showedFilterNames;
        };

        const showedFilterNames = getShowedFilterName();
        const newShowedCols = [...table.showedColumns.data];

        newShowedCols.forEach((showedCol, index) => {
            // Get filter item linked with this column and show it
            const linkedFilter = showedFilterNames.find(name => name === showedCol.key);
            if (linkedFilter) newShowedCols[index].show = true;
        });
        table.showedColumns.onChange(newShowedCols);

        // Update disable status of buttons
        setDisableFilterApplyButton(true);
        setDisableQuickFilterButton(false);
    };

    // Apply filter button
    const filterApplyButton = {
        hidden: disableFilterApplyButton || filterCount <= 0,
        onClick: onFilter
    };

    // Handle reset filter data
    const onResetFilter = () => {
        const resetFilterData = (list: IFilterData[]) => {
            const newFilterData: IFilterData[] = [];
            list.forEach(item => newFilterData.push({ ...item, show: item.alwaysShow }));
            return newFilterData;
        };

        const newFilterData = resetFilterData(filter.data);

        // Reset filter value
        filterForm.resetFields();
        const newFilterValue = getFilterValue(filterForm, newFilterData);

        filter.onFilter(newFilterValue);
        updateFilterCount(newFilterData);
        filter.onChangeData(newFilterData);

        // Update disable status for buttons
        setDisableFilterApplyButton(true);
        setDisableQuickFilterButton(true);
        setActiveQuickFilter(undefined);
    };

    // Reset filter button
    const filterResetButton = {
        hidden: filterCount <= 0,
        onClick: onResetFilter
    };

    const onShowQuickFilterAddModal = () => {
        const getNewQuickFilterData = () => {
            const newQuickFilterData: IQuickFilterField[] = [];

            filter.data.forEach(item => {
                const itemKey = item.key;
                const itemValue = convertFilterValueToString(filterForm, item);

                // Check if itemValue is not null or empty before adding
                if (itemValue !== 'null' && (item.alwaysShow || item.show)) {
                    newQuickFilterData.push({
                        quickFilterFieldName: itemKey,
                        quickFilterFieldValue: itemValue
                    } as IQuickFilterField);
                }
            });

            return newQuickFilterData;
        };

        const createdQuickFilterFields = getNewQuickFilterData();
        const createdQuickFilterData = {
            quickFilterName: '',
            quickFilterFields: createdQuickFilterFields
        } as IQuickFilterData;

        setUpdatedQuickFilter(createdQuickFilterData);
        setShowQuickFilterUpdateModal(true);
    };

    // Handle change segmented value
    const onChangeSegmentedValue = (value: any) => {
        value = filter.segmented?.options?.find(option => option.value == JSON.parse(value))?.value;

        filter.segmented?.onChange?.(value);
        setActiveQuickFilter(undefined);
    };

    const segmented = filter.segmented && {
        ...filter.segmented,
        onChange: onChangeSegmentedValue
    };

    const [disableQuickFilterAddButton, setDisableQuickFilterButton] = useState(true);
    const quickFilterAddButton = {
        disabled: disableQuickFilterAddButton || filterCount <= 0,
        onClick: onShowQuickFilterAddModal
    };

    // Export
    const exportFile = filter.moreButtons?.find(button => button.name === 'exportFile') as IFilterExportButton<T>;
    const [exportLoading, setExportLoading] = useState(false);

    const onExport = async () => {
        try {
            if (exportFile) {
                setExportLoading(true);
                const exportData = exportFile.onExport(getDataByKeyword());
                const res = await exportFile?.service(exportData);

                downloadFile(res, exportFile.fileName);
                showNotification(true, 'Export file successfully');
            }
        } catch (error) {
            showNotification(false, 'Export file failed');
        } finally {
            setExportLoading(false);
        }
    };

    // Import
    const importFile = filter.moreButtons?.find(button => button.name === 'importFile') as IFilterImportButton;
    const showImportButton = importFile ? true : false;
    const [showImportModal, setShowImportModal] = useState(false);
    const onShowImportModal = () => setShowImportModal(true);
    const onCloseImportModal = () => setShowImportModal(false);
    const [showSummarizeModal, setShowSummarizeModal] = useState(false);
    const [dataSummarize, setDataSummarize] = useState<ISummarize>();

    const onImport = async (values: any) => {
        const formData = appendFormData(values);
        const res = await importFile?.service(formData);
        const { succeeded } = res;

        if (succeeded) {
            setShowSummarizeModal(true);
            setDataSummarize(res.data);
            onResetFilter();
        }
    };

    const importModal = showImportButton && {
        title: 'Import',
        open: showImportModal,
        onClose: onCloseImportModal,
        onImport: onImport
    };

    // Show/hide column
    const [showTableMoreColumnModal, setShowTableMoreColumnModal] = useState(false);

    const onShowTableMoreColumnModal = () => setShowTableMoreColumnModal(true);
    const onResetTableMoreColumns = async () => {
        let newShowedCols = [...table.showedColumns.data];
        newShowedCols = newShowedCols.map(col => ({ ...col, show: false }));

        onSaveTableMoreColumns(newShowedCols);
    };

    const onSaveTableMoreColumns = (newShowedCols: ITableShowedColumn[]) => {
        // Update showed columns
        table.showedColumns.onChange(newShowedCols);
        setShowTableMoreColumnModal(false);
        // Enable buttons
        setDisableFilterApplyButton(false);
    };

    const showTableShowedColumnsButton =
        !filter.isHideShowHideColumnsBtn && table.showedColumns.data.filter(col => !col.alwaysShow && col.label).length > 0;
    const tableShowedColumnsButton = showTableShowedColumnsButton && { onClick: onShowTableMoreColumnModal };
    const tableShowedColumnsModal = showTableShowedColumnsButton && {
        data: table.showedColumns.data,
        open: showTableMoreColumnModal,
        onClose: () => setShowTableMoreColumnModal(false),
        onReset: onResetTableMoreColumns,
        onSave: onSaveTableMoreColumns
    };

    // Show more filter
    const [showMoreFilterModal, setShowMoreFilterModal] = useState(false);

    const onShowMoreFilterModal = () => setShowMoreFilterModal(true);
    const onResetShowMoreFilter = () => {
        let newFilterData = filter.data;
        newFilterData = newFilterData.map(filter => {
            const key = filter.key;
            const show = filter.alwaysShow;

            if (!show) filterForm.setFieldValue(key, undefined);
            return { ...filter, show } as IFilterData;
        });

        onSaveShowMoreFilter(newFilterData);
    };

    const onSaveShowMoreFilter = (newFilterData: IFilterData[]) => {
        // Update showed filter
        filter.onChangeData(newFilterData);
        setShowMoreFilterModal(false);

        setDisableFilterApplyButton(false);
        updateFilterCount(newFilterData);
    };

    const showMoreFilterButton = filter.data.filter(filter => !filter.alwaysShow).length > 0;
    const moreFilterButton = showMoreFilterButton && { onClick: onShowMoreFilterModal };
    const moreFilterModal = showMoreFilterButton && {
        open: showMoreFilterModal,
        data: filter.data,
        onClose: () => setShowMoreFilterModal(false),
        onReset: onResetShowMoreFilter,
        onSave: onSaveShowMoreFilter
    };

    // Function to filter data based on a keyword input
    const getDataByKeyword = () => {
        let newDataTable: T[] = [];
        const searchableColumns = table.showedColumns.data.filter(col => col.enabledSearch);

        if (filter.searchInput.value) {
            const encodeKeyword = convertToSimpleText(filter.searchInput.value.toLowerCase().trim());

            // Escape special characters in the encodeKeyword
            const escapeRegExp = (str: string) => {
                return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\./g, '.');
            };

            const escapedKeyword = escapeRegExp(encodeKeyword);

            table.data.forEach(row => {
                let flag = false;

                searchableColumns.forEach(column => {
                    const colName = column.key || '';
                    const fieldValue = convertToSimpleText(row?.[colName] ?? '').toLowerCase();

                    // Special handling for fullName column
                    if (colName === 'fullName') {
                        const fullName = fieldValue;
                        const nameIndex = fullName.lastIndexOf(' ');
                        const firstName = fullName.substring(nameIndex).trim();
                        const lastName = fullName.substring(0, nameIndex).trim();
                        const fullNameEN = firstName + ' ' + lastName;

                        const keywords = escapedKeyword.split(' ');

                        // Check if search keyword length is greater than 1 for fullName
                        if (escapedKeyword && keywords.length === 1) {
                            if (escapedKeyword === firstName) {
                                flag = true;
                                return;
                            }
                        } else {
                            // Check if fullNameEN or fullName includes the search keyword
                            if (fullNameEN.includes(escapedKeyword) || fullName.includes(escapedKeyword)) {
                                flag = true;
                                return;
                            }
                        }
                    } else {
                        // Check if fieldValue includes encodeKeyword
                        if (fieldValue.includes(escapedKeyword)) {
                            flag = true;
                            return;
                        }
                    }
                });

                if (flag) newDataTable.push(row);
            });
        } else {
            newDataTable = table.data;
        }

        return newDataTable.map((row, index) => ({ ...row, key: index.toString() }));
    };

    const rootClassName = table.className;
    const filterMoreButtons = filter.moreButtons?.map((button: any) => {
        if (button.name === 'exportFile') {
            const exportButton = { ...button };
            delete exportButton.fileName;
            delete exportButton.onExport;
            delete exportButton.service;

            return {
                ...exportButton,
                loading: exportLoading,
                onClick: onExport
            };
        } else if (button.name === 'importFile') {
            const importButton = { ...button };
            delete importButton.service;

            return {
                ...importButton,
                onClick: onShowImportModal
            };
        } else return button;
    });

    const isShowFilter = filter.isShowFilter;
    const valueFilter = filter.value;

    useEffect(() => {
        if (isShowFilter) {
            setShowFilterContent(true);
            Object.keys(valueFilter).forEach(key => {
                filterForm.setFieldValue(key, valueFilter[key]);
            });
            updateFilterCount(filter.data);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isShowFilter, valueFilter, filterForm, filter.data]);

    useEffect(() => {
        setShowFilterContent(isShowFilter || false);
        updateFilterCount(filter.data);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter.segmented?.value]);

    return (
        <>
            <Collapse
                expandTooltip="Expand"
                contentStart={
                    <QuickFilter
                        loading={loadingQuickFilter}
                        activeData={activeQuickFilter}
                        onChangeActiveData={handleChangeActiveQuickFilter}
                        data={quickFilterData}
                        // Create/Update modal
                        setShowUpdateModal={setShowQuickFilterUpdateModal}
                        setUpdatedData={setUpdatedQuickFilter}
                        // Delete modal
                        setDeletedData={setDeletedQuickFilter}
                        setShowDeleteModal={setShowQuickFilterDeleteModal}
                    />
                }
                contentEnd={
                    <>
                        <BaseBreadcrumb dataItem={breadcrumb} />

                        <div className="list-management-top">
                            <div className="list-management-title">{pageTitle}</div>
                            {buttons && (
                                <div className="list-management-buttons">
                                    {buttons.map((button, index) => (
                                        <Button {...button} key={index} />
                                    ))}
                                </div>
                            )}
                        </div>

                        <Filter
                            form={filterForm}
                            data={filter.data}
                            loading={filter.loading}
                            count={filterCount}
                            moreButtons={filterMoreButtons}
                            showContent={showFilterContent}
                            setShowContent={setShowFilterContent}
                            onChangeValue={onChangeFilterValue}
                            hiddenFilter={filter.hiddenFilter}
                            // Search input
                            hiddenSearchInput={filter.hiddenSearchInput}
                            searchInput={filter.searchInput}
                            // More filter
                            moreFilterButton={moreFilterButton}
                            moreFilterModal={moreFilterModal}
                            // Import, export
                            onShowImportModal={onShowImportModal}
                            importModal={importModal}
                            exportLoading={exportLoading}
                            onExport={onExport}
                            // Bottom buttons
                            applyButton={filterApplyButton}
                            resetButton={filterResetButton}
                            quickFilterAddButton={quickFilterAddButton}
                            // Segmented and more buttons
                            segmented={segmented}
                            // Table showed columns
                            tableShowedColumnsButton={tableShowedColumnsButton}
                            tableShowedColumnsModal={tableShowedColumnsModal}
                        />

                        {/* Start Table */}
                        {table.tableHeader}
                        <BaseTable
                            loading={table.loading}
                            rootClassName={rootClassName}
                            dataSource={getDataByKeyword()}
                            columns={getShowedColumns(table.columns, table.showedColumns.data)}
                            bordered={table.bordered}
                            rowClassName={table.rowClassName}
                            rowSelection={table.rowSelection}
                            scroll={table.scroll}
                            paginationTable={table.paginationTable}
                        />
                        {/* End Table */}

                        {/* Modal Summarize */}
                        {dataSummarize && (
                            <DialogSummarizeAfterImport
                                dataSummarize={dataSummarize}
                                open={showSummarizeModal}
                                onClose={() => setShowSummarizeModal(false)}
                            />
                        )}
                    </>
                }
            />

            {/* DIALOG */}
            <DialogCommon
                open={showQuickFilterDeleteModal}
                onClose={() => setShowQuickFilterDeleteModal(false)}
                title="Delete Quick Filter"
                content="This quick filter will be deleted. You can't undo this action. Are you sure you want to delete this quick filer?"
                icon={icons.dialog.delete}
                buttonType="default-danger"
                buttonLeftClick={() => setShowQuickFilterDeleteModal(false)}
                buttonRightClick={handleDeleteQuickFilter}
            />
            <QuickFilterUpdateDialog
                open={showQuickFilterUpdateModal}
                onClose={() => setShowQuickFilterUpdateModal(false)}
                data={updatedQuickFilter}
                onCancel={() => setShowQuickFilterUpdateModal(false)}
                onSave={handleUpdateQuickFilter}
            />
        </>
    );
};

export default ListManagement;
