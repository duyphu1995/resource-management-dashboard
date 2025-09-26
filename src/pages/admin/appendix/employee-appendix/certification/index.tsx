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
import certificationService from '@/services/admin/certification';
import { IAdminCertificationName, IAdminCertificationType } from '@/types/admin';
import { findSectionByNameSection, formatDataTable, formatTimeMonthDayYear, getDecryptedItem } from '@/utils/common';
import { useDataTableControls } from '@/utils/hook/useDataTableControls';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';
import icons from '@/utils/icons';
import keyTab from '@/utils/key-tab';
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
    { title: pathnames.admin.appendix.employeeAppendix.certification.main.name }
];

const CertificationPage = () => {
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();
    const dispatch = useAppDispatch();
    const selectSearchParamsRedux = useAppSelector(selectSearchParams);
    // Certification
    const filterParamsFromReduxCertification = selectSearchParamsRedux.adminCertification.filter;
    const searchByKeywordFromReduxCertification = selectSearchParamsRedux.adminCertification.searchByKeyword;
    const paginationTableFromReduxCertification = selectSearchParamsRedux.adminCertification.paginationTable;
    // Certification Name
    const searchByKeywordFromReduxCertificationName = selectSearchParamsRedux.adminCertificationName.searchByKeyword;
    const paginationTableFromReduxCertificationName = selectSearchParamsRedux.adminCertificationName.paginationTable;

    const [isReload, setIsReload] = useState<object>({});
    const [keywordCertification, setKeywordCertification] = useState(searchByKeywordFromReduxCertification || '');
    const [keywordCertificationName, setKeywordCertificationName] = useState(searchByKeywordFromReduxCertificationName || '');
    const [allData, setAllData] = useState<any[]>([]);
    const [data, setData] = useState<any[]>(allData);
    const [changeTabs, setChangeTabs] = useState<string>(filterParamsFromReduxCertification?.tabActive || keyTab.tabCertificationTypeNameAdmin.name);
    const [dialogState, setDialogState] = useState({
        type: '', // 'delete' or 'warning'
        visible: false,
        data: null as IAdminCertificationName | IAdminCertificationType | null
    });

    const { havePermission } = usePermissions(changeTabs, 'Certification');

    const isCertificateTypeName = (data: IAdminCertificationType | IAdminCertificationName): data is IAdminCertificationType => {
        return (data as IAdminCertificationType).certificateTypeName !== undefined;
    };

    const deleteTitleContent = dialogState.data && 'certificateTypeName' in dialogState.data ? 'Delete Certification' : 'Delete Certification Name';

    const deleteDialogContent = (
        <div style={{ width: 384 }}>
            {dialogState.data && isCertificateTypeName(dialogState.data) ? (
                <>
                    The Certification <strong>{dialogState.data.certificateTypeName}</strong> will be deleted. Are you sure you want to delete this
                    Certification?
                </>
            ) : (
                <>
                    The Certification Name <strong>{dialogState.data?.certificateName}</strong> will be deleted. Are you sure you want to delete this
                    Certification Name?
                </>
            )}
        </div>
    );

    const warningDialogContent = (
        <div style={{ width: 384 }}>
            {dialogState.data && isCertificateTypeName(dialogState.data) ? (
                <>
                    Cannot delete Certification Record <strong>{dialogState.data.certificateTypeName}</strong>. Because this Certification has been
                    using.
                </>
            ) : (
                <>
                    Cannot delete Certification Name Record <strong>{dialogState.data?.certificateName}</strong>. Because this Certification Name has
                    been using.
                </>
            )}
        </div>
    );

    const certificationTypeColumn: ColumnType<IAdminCertificationType>[] = [
        {
            key: 'certificateTypeName',
            title: 'Certification',
            width: 277,
            sorter: createSorter('certificateTypeName'),
            render: (record: IAdminCertificationType) => (
                <Link
                    className="underline"
                    style={{ color: '#323232' }}
                    to={`${pathnames.admin.appendix.employeeAppendix.certification.detailCertificationTypeName.path}/${record.certificateTypeId}`}
                >
                    {renderWithFallback(record.certificateTypeName)}
                </Link>
            )
        },
        {
            key: 'certificateDtos',
            title: 'Certification Name',
            width: 277,
            render: (record: IAdminCertificationType) => {
                if (!record.certificateDtos) return;
                const certificateNames = record.certificateDtos.map(item => item.certificateName).join(', ');
                return renderWithFallback(certificateNames, true, 50);
            }
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

    const certificationNameColumn: ColumnType<IAdminCertificationName>[] = [
        {
            key: 'certificateName',
            title: 'Certification',
            width: 277,
            sorter: createSorter('certificateName'),
            render: (record: IAdminCertificationName) => (
                <Link
                    className="underline"
                    style={{ color: '#323232' }}
                    to={`${pathnames.admin.appendix.employeeAppendix.certification.detailCertificationName.path}/${record.certificateId}`}
                >
                    {renderWithFallback(record.certificateName)}
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
        changeTabs === keyTab.tabCertificationTypeNameAdmin.name ? 'adminCertification' : 'adminCertificationName'
    );

    useEffect(() => {
        if (changeTabs === keyTab.tabCertificationTypeNameAdmin.name) {
            setSearchByKeyword(keywordCertification);
        } else {
            setSearchByKeyword(keywordCertificationName);
        }
    }, [changeTabs, keywordCertification, keywordCertificationName, setSearchByKeyword]);

    useEffect(() => {
        const updatedParams = {
            adminCertification: {
                filter: {
                    tabActive: changeTabs
                }
            },
            adminCertificationName: {
                filter: {
                    tabActive: changeTabs
                }
            }
        };

        dispatch(searchParamsActions.setFilterParamsRedux(updatedParams));
    }, [dispatch, changeTabs]);

    const items = [
        {
            key: keyTab.tabCertificationTypeNameAdmin.name,
            label: keyTab.tabCertificationTypeNameAdmin.label,
            children: (
                <BaseTable
                    columns={certificationTypeColumn}
                    dataSource={formatDataTable(data)}
                    scroll={{ x: 'max-content', y: 479 }}
                    loading={isLoading}
                    paginationTable={{
                        currentPage: paginationTableFromReduxCertification?.currentPage || 1,
                        pageSize: paginationTableFromReduxCertification?.pageSize || 10,
                        onChange: handlePageChange
                    }}
                />
            ),
            permission: 'AppendixEmployeeAppendixCertificationList'
        },
        {
            key: keyTab.tabCertificationNameAdmin.name,
            label: keyTab.tabCertificationNameAdmin.label,
            children: (
                <BaseTable
                    columns={certificationNameColumn}
                    dataSource={formatDataTable(data)}
                    scroll={{ x: 'max-content', y: 479 }}
                    loading={isLoading}
                    paginationTable={{
                        currentPage: paginationTableFromReduxCertificationName?.currentPage || 1,
                        pageSize: paginationTableFromReduxCertificationName?.pageSize || 10,
                        onChange: handlePageChange
                    }}
                />
            ),
            permission: 'AppendixEmployeeAppendixCertificationNameList'
        }
    ];

    const { permission = [] } = getDecryptedItem('permission') || {};
    const filteredTabsContent = items.filter(tab => {
        const section = findSectionByNameSection(permission, tab.permission, 'Certification');
        return !!section;
    });

    const onReloadTable = () => setIsReload({});

    const onShowDeleteDialog = (deletedData: IAdminCertificationType | IAdminCertificationName) => {
        setDialogState({
            type: 'delete',
            visible: true,
            data: deletedData
        });
    };

    const onShowWarningDialog = (warningData: IAdminCertificationType | IAdminCertificationName) => {
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

    const deleteCertificateTypeId = async (data: IAdminCertificationType) => {
        try {
            const updatedDataCertificationType: IAdminCertificationType = {
                certificateTypeName: data.certificateTypeName
            };

            const res = await certificationService.deleteICertificateType(data.certificateTypeId);
            const { succeeded, message, errors } = res;

            if (succeeded) {
                onReloadTable();
            } else if (errors?.some(error => error.FieldName === 'certificateTypeId')) {
                onShowWarningDialog(updatedDataCertificationType);
                return;
            }

            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Failed to delete');
        }
    };

    const deleteCertificateId = async (data: IAdminCertificationName) => {
        try {
            const updatedDataLevel: IAdminCertificationName = {
                certificateName: data.certificateName
            };

            const res = await certificationService.deleteCertificateName(data.certificateId);
            const { succeeded, message, errors } = res;

            if (succeeded) {
                onReloadTable();
            } else if (errors?.some(error => error.FieldName === 'certificateId')) {
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
                if ('certificateTypeId' in dialogState.data && dialogState.data.certificateTypeId !== undefined) {
                    await deleteCertificateTypeId(dialogState.data);
                } else if ('certificateId' in dialogState.data && dialogState.data.certificateId !== undefined) {
                    await deleteCertificateId(dialogState.data);
                }
            } catch (error) {
                showNotification(false, 'Failed to delete');
            } finally {
                turnOffLoading();
            }
        }
    };

    // Update data when data or keyword changed
    useEffect(() => {
        const column = changeTabs === keyTab.tabCertificationTypeNameAdmin.name ? certificationTypeColumn : certificationNameColumn;
        const keyword = changeTabs === keyTab.tabCertificationTypeNameAdmin.name ? keywordCertification : keywordCertificationName;
        setData(searchByKeyword(allData, column, keyword, ['certificateDtos', 'createdOn', 'lastModifiedOn']));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [keywordCertification, keywordCertificationName, allData, changeTabs]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                turnOnLoading();
                const res =
                    changeTabs === keyTab.tabCertificationTypeNameAdmin.name
                        ? await certificationService.getListCertificateType()
                        : await certificationService.getListCertificateName();
                const { data, succeeded } = res;

                if (succeeded && data) setAllData(data);
            } catch (error) {
                showNotification(false, 'Failed to fetch data list certificate');
            } finally {
                turnOffLoading();
            }
        };
        fetchData();
    }, [isReload, changeTabs, turnOnLoading, turnOffLoading, showNotification]);

    return (
        <DetailContent>
            <BaseBreadcrumb dataItem={breadcrumbItems} />
            <DetailHeader pageTitle={pathnames.admin.appendix.employeeAppendix.certification.main.name} buttons={[]} />

            {/* Search Input and Button Add new */}
            <Flex justify="space-between">
                {changeTabs === keyTab.tabCertificationTypeNameAdmin.name ? (
                    <>
                        <SearchInput
                            key="certification"
                            style={{ width: 357 }}
                            placeholder="Search by certification"
                            defaultValue={keywordCertification}
                            setKeyword={setKeywordCertification}
                        />
                        {havePermission('Add') && (
                            <Link to={pathnames.admin.appendix.employeeAppendix.certification.addCertificationTypeName.path}>
                                <Button type="primary">Add New Certification</Button>
                            </Link>
                        )}
                    </>
                ) : (
                    <>
                        <SearchInput
                            key="certification-name"
                            style={{ width: 357 }}
                            placeholder="Search by certification name"
                            defaultValue={keywordCertificationName}
                            setKeyword={setKeywordCertificationName}
                        />

                        {havePermission('Add') && (
                            <Link to={pathnames.admin.appendix.employeeAppendix.certification.addCertificationName.path}>
                                <Button type="primary">Add New Certification Name</Button>
                            </Link>
                        )}
                    </>
                )}
            </Flex>

            <SubTab
                items={filteredTabsContent}
                activeKey={changeTabs}
                className="tab-language-certification"
                onChangeTabs={key => setChangeTabs(key)}
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
                buttonLeft={dialogState.type === 'warning' ? 'Close' : ''}
                buttonRight={dialogState.type === 'warning' ? '' : 'Delete'}
            />
        </DetailContent>
    );
};

export default CertificationPage;
