import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import DetailHeader from '@/components/common/detail-management/detail-header';
import DialogCommon from '@/components/common/dialog/dialog-common/dialog-common';
import SearchInput from '@/components/common/form/input/search-input';
import SubTab from '@/components/common/tab/sub-tab';
import ButtonsIcon from '@/components/common/table/buttons-icon';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import pathnames from '@/pathnames';
import { searchParamsActions, selectSearchParams } from '@/redux/search-params-slice';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import languageCertificationService from '@/services/admin/language-certification';
import { IAdminLanguageCertification, IAdminRanking } from '@/types/admin';
import { findSectionByNameSection, formatDataTable, formatTimeMonthDayYear, getDecryptedItem } from '@/utils/common';
import { useDataTableControls } from '@/utils/hook/useDataTableControls';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import icons from '@/utils/icons';
import keyTab from '@/utils/key-tab';
import { createSorter, searchByKeyword } from '@/utils/table';
import { Button, Flex } from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { ColumnType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './index.scss';
import usePermissions from '@/utils/hook/usePermissions';

const breadcrumbItems: BreadcrumbItemType[] = [
    { title: pathnames.admin.main.name },
    { title: pathnames.admin.appendix.main.name },
    { title: pathnames.admin.appendix.employeeAppendix.main.name },
    { title: pathnames.admin.appendix.employeeAppendix.languageCertification.main.name }
];

const LanguageCertificationPage = () => {
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();
    const dispatch = useAppDispatch();
    const selectSearchParamsRedux = useAppSelector(selectSearchParams);
    // Language Certification
    const filterParamsFromReduxLanguage = selectSearchParamsRedux.adminLanguageCertification.filter;
    const searchByKeywordFromReduxLanguage = selectSearchParamsRedux.adminLanguageCertification.searchByKeyword;
    const paginationTableFromReduxLanguage = selectSearchParamsRedux.adminLanguageCertification.paginationTable;
    // Level Certification
    const searchByKeywordFromReduxLevel = selectSearchParamsRedux.adminLevelCertification.searchByKeyword;
    const paginationTableFromReduxLevel = selectSearchParamsRedux.adminLevelCertification.paginationTable;

    const [changeTabs, setChangeTabs] = useState<string>(filterParamsFromReduxLanguage?.tabActive || keyTab.tabLanguageAdmin.name);
    const [isReload, setIsReload] = useState<object>({});
    const [keywordLanguage, setKeywordLanguage] = useState(searchByKeywordFromReduxLanguage || '');
    const [keywordLevel, setKeywordLevel] = useState(searchByKeywordFromReduxLevel || '');
    const [allData, setAllData] = useState<any[]>([]);
    const [data, setData] = useState<any[]>(allData);
    const [dialogState, setDialogState] = useState({
        type: '', // 'delete' or 'warning'
        visible: false,
        data: null as IAdminLanguageCertification | IAdminRanking | null
    });

    const { havePermission } = usePermissions('AppendixEmployeeAppendixLanguageList', 'LanguageCertification');
    const { havePermission: havePermissionLevel } = usePermissions('AppendixEmployeeAppendixLevelList', 'LanguageCertification');

    const deleteTitleContent = dialogState.data && 'languageId' in dialogState.data ? 'Delete Language Certification' : 'Delete Level';
    const isLanguageCertification = (data: IAdminLanguageCertification | IAdminRanking): data is IAdminLanguageCertification => {
        return (data as IAdminLanguageCertification).languageName !== undefined;
    };
    const deleteDialogContent = (
        <div style={{ width: 384 }}>
            {dialogState.data && isLanguageCertification(dialogState.data) ? (
                <>
                    The Language <strong>{dialogState.data.languageName}</strong> will be deleted. Are you sure you want to delete this Language?
                </>
            ) : (
                <>
                    The Level <strong>{dialogState.data?.rankName}</strong> will be deleted. Are you sure you want to delete this Level?
                </>
            )}
        </div>
    );

    const warningDialogContent = (
        <div style={{ width: 384 }}>
            {dialogState.data && isLanguageCertification(dialogState.data) ? (
                <>
                    Cannot delete Language <strong>{dialogState.data.languageName}</strong>. Because this Language has been using.
                </>
            ) : (
                <>
                    Cannot delete Level <strong>{dialogState.data?.rankName}</strong>. Because this Level has been using.
                </>
            )}
        </div>
    );

    const languageCertificationColumn: ColumnType<IAdminLanguageCertification>[] = [
        {
            key: 'languageName',
            title: 'Language Name',
            width: 277,
            sorter: createSorter('languageName'),
            render: (record: IAdminLanguageCertification) => (
                <Link
                    className="underline"
                    style={{ color: '#323232' }}
                    to={`${pathnames.admin.appendix.employeeAppendix.languageCertification.detailLanguage.path}/${record.languageId}`}
                >
                    {renderWithFallback(record.languageName)}
                </Link>
            )
        },
        {
            dataIndex: 'createdOn',
            key: 'createdOn',
            title: 'Created Date',
            width: 184,
            sorter: createSorter('createdOn', 'date'),
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'lastModifiedOn',
            key: 'lastModifiedOn',
            title: 'Edited Date',
            width: 184,
            sorter: createSorter('lastModifiedOn', 'date'),
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            key: 'action',
            title: 'Action',
            width: 76,
            fixed: 'right',
            render: (record: any) => (
                <ButtonsIcon
                    items={[
                        {
                            icon: icons.tableAction.delete,
                            tooltip: 'Delete',
                            onClick: () => onShowDeleteDialog(record)
                        }
                    ]}
                />
            )
        }
    ];

    const levelColumn: ColumnType<IAdminRanking>[] = [
        {
            key: 'rankName',
            title: 'Level Name',
            width: 277,
            sorter: createSorter('rankName'),
            render: (record: IAdminRanking) => (
                <Link
                    className="underline"
                    style={{ color: '#323232' }}
                    to={`${pathnames.admin.appendix.employeeAppendix.languageCertification.detailLevel.path}/${record.rankId}`}
                >
                    {renderWithFallback(record.rankName)}
                </Link>
            )
        },
        {
            dataIndex: 'createdOn',
            key: 'createdOn',
            title: 'Created Date',
            width: 184,
            sorter: createSorter('createdOn', 'date'),
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'lastModifiedOn',
            key: 'lastModifiedOn',
            title: 'Edited Date',
            width: 184,
            sorter: createSorter('lastModifiedOn', 'date'),
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            key: 'action',
            title: 'Action',
            width: 76,
            fixed: 'right',
            render: (record: any) => (
                <ButtonsIcon
                    items={[
                        {
                            icon: icons.tableAction.delete,
                            tooltip: 'Delete',
                            onClick: () => onShowDeleteDialog(record)
                        }
                    ]}
                />
            )
        }
    ];

    const { handlePageChange, setSearchByKeyword } = useDataTableControls(
        changeTabs === keyTab.tabLanguageAdmin.name ? 'adminLanguageCertification' : 'adminLevelCertification'
    );

    useEffect(() => {
        if (changeTabs === keyTab.tabLanguageAdmin.name) {
            setSearchByKeyword(keywordLanguage);
        } else {
            setSearchByKeyword(keywordLevel);
        }
    }, [changeTabs, keywordLanguage, keywordLevel, setSearchByKeyword]);

    useEffect(() => {
        const updatedParams = {
            adminLanguageCertification: {
                filter: {
                    tabActive: changeTabs
                }
            },
            adminLevelCertification: {
                filter: {
                    tabActive: changeTabs
                }
            }
        };

        dispatch(searchParamsActions.setFilterParamsRedux(updatedParams));
    }, [dispatch, changeTabs]);

    const items = [
        {
            key: keyTab.tabLanguageAdmin.name,
            label: keyTab.tabLanguageAdmin.label,
            children: (
                <BaseTable
                    columns={languageCertificationColumn}
                    dataSource={formatDataTable(data)}
                    loading={isLoading}
                    scroll={{ x: 'max-content', y: 479 }}
                    paginationTable={{
                        currentPage: paginationTableFromReduxLanguage?.currentPage || 1,
                        pageSize: paginationTableFromReduxLanguage?.pageSize || 10,
                        onChange: handlePageChange
                    }}
                />
            ),
            permission: 'AppendixEmployeeAppendixLanguageList'
        },
        {
            key: keyTab.tabLevelAdmin.name,
            label: keyTab.tabLevelAdmin.label,
            children: (
                <BaseTable
                    columns={levelColumn}
                    dataSource={formatDataTable(data)}
                    loading={isLoading}
                    scroll={{ x: 'max-content', y: 479 }}
                    paginationTable={{
                        currentPage: paginationTableFromReduxLevel?.currentPage || 1,
                        pageSize: paginationTableFromReduxLevel?.pageSize || 10,
                        onChange: handlePageChange
                    }}
                />
            ),
            permission: 'AppendixEmployeeAppendixLevelList'
        }
    ];

    const { permission = [] } = getDecryptedItem('permission') || {};
    const filteredTabsContent = items.filter(tab => {
        const section = findSectionByNameSection(permission, tab.permission, 'LanguageCertification');
        return !!section;
    });

    const onReloadTable = () => setIsReload({});

    const onShowDeleteDialog = (deletedData: IAdminLanguageCertification | IAdminRanking) => {
        setDialogState({
            type: 'delete',
            visible: true,
            data: deletedData
        });
    };

    const onShowWarningDialog = (warningData: IAdminLanguageCertification | IAdminRanking) => {
        setDialogState({
            type: 'warning',
            visible: true,
            data: warningData
        });
    };

    const onCloseDialog = () => {
        setDialogState({
            type: '',
            visible: false,
            data: null
        });
    };

    const deleteLanguage = async (data: IAdminLanguageCertification) => {
        try {
            const updatedDataLanguage: IAdminLanguageCertification = {
                languageName: data.languageName
            };

            const res = await languageCertificationService.deleteLanguage(data.languageId);
            const { succeeded, message, errors } = res;

            if (succeeded) {
                onReloadTable();
            } else if (errors?.some(error => error.FieldName === 'languageId')) {
                onShowWarningDialog(updatedDataLanguage);
                return;
            }
            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Failed to delete');
        }
    };

    const deleteLevel = async (data: IAdminRanking) => {
        try {
            const updatedDataLevel: IAdminRanking = {
                rankName: data.rankName
            };

            const res = await languageCertificationService.deleteLevel(data.rankId);
            const { succeeded, message, errors } = res;

            if (succeeded) {
                onReloadTable();
            } else if (errors?.some(error => error.FieldName === 'rankId')) {
                onShowWarningDialog(updatedDataLevel);
                return;
            }
            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Failed to delete');
        }
    };

    const onDelete = async () => {
        if (dialogState.data) {
            onCloseDialog();
            turnOnLoading();
            try {
                if ('languageId' in dialogState.data && dialogState.data.languageId !== undefined) {
                    await deleteLanguage(dialogState.data);
                } else if ('rankId' in dialogState.data && dialogState.data.rankId !== undefined) {
                    await deleteLevel(dialogState.data);
                }
            } catch (error) {
                showNotification(false, 'Failed to delete');
            } finally {
                turnOffLoading();
            }
        }
    };

    useEffect(() => {
        const column = changeTabs === keyTab.tabLanguageAdmin.name ? languageCertificationColumn : levelColumn;
        const keyword = changeTabs === keyTab.tabLanguageAdmin.name ? keywordLanguage : keywordLevel;
        setData(searchByKeyword(allData, column, keyword, ['createdOn', 'lastModifiedOn']));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [keywordLanguage, keywordLevel, allData, changeTabs]);

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            turnOnLoading();

            try {
                const res =
                    changeTabs === keyTab.tabLanguageAdmin.name
                        ? await languageCertificationService.getListLanguage()
                        : await languageCertificationService.getListRanking();
                const { data, succeeded } = res;

                if (succeeded && data) setAllData(data);
            } catch (error) {
                showNotification(false, 'Failed to fetch data list language');
            }
            turnOffLoading();
        };

        fetchData();
    }, [isReload, changeTabs, turnOnLoading, turnOffLoading, showNotification]);

    return (
        <DetailContent>
            <BaseBreadcrumb dataItem={breadcrumbItems} />
            <DetailHeader pageTitle={pathnames.admin.appendix.employeeAppendix.languageCertification.main.name} buttons={[]} />

            {/* Search Input and Button Add new */}
            <Flex justify="space-between">
                {changeTabs === keyTab.tabLanguageAdmin.name ? (
                    <>
                        <SearchInput
                            key="language"
                            style={{ width: 357 }}
                            placeholder="Search by Language"
                            defaultValue={keywordLanguage}
                            setKeyword={setKeywordLanguage}
                        />
                        {havePermission('Add') && (
                            <Link to={pathnames.admin.appendix.employeeAppendix.languageCertification.addLanguage.path}>
                                <Button type="primary">Add New Language Certification</Button>
                            </Link>
                        )}
                    </>
                ) : (
                    <>
                        <SearchInput
                            key="level"
                            style={{ width: 357 }}
                            placeholder="Search by level"
                            defaultValue={keywordLevel}
                            setKeyword={setKeywordLevel}
                        />
                        {havePermissionLevel('Add') && (
                            <Link to={pathnames.admin.appendix.employeeAppendix.languageCertification.addLevel.path}>
                                <Button type="primary">Add New Level</Button>
                            </Link>
                        )}
                    </>
                )}
            </Flex>

            <SubTab
                items={filteredTabsContent}
                className="tab-language-certification"
                activeKey={changeTabs}
                onChangeTabs={key => {
                    setChangeTabs(key);
                }}
            />

            <DialogCommon
                title={dialogState.type === 'delete' ? deleteTitleContent : 'Can’t Delete'}
                content={dialogState.type === 'delete' ? deleteDialogContent : warningDialogContent}
                open={dialogState.visible}
                onClose={onCloseDialog}
                buttonType={'default-danger'}
                buttonLeftClick={onCloseDialog}
                buttonRightClick={dialogState.type === 'delete' ? onDelete : onCloseDialog}
                hiddenButtonRight={dialogState.type === 'warning'}
                buttonRight={dialogState.type === 'warning' ? ' ' : 'Delete'}
                buttonLeft={dialogState.type === 'warning' ? 'Close' : ''}
            />
        </DetailContent>
    );
};

export default LanguageCertificationPage;
