import DialogCommon from '@/components/common/dialog/dialog-common/dialog-common';
import ButtonsIcon from '@/components/common/table/buttons-icon';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import { IFilterValues } from '@/pages/resource-plan/shared-service-billable-plan';
import pathnames from '@/pathnames';
import sharedServiceBillablePlanServices from '@/services/resource-plan/shared-service-billable-plan';
import { ISharedServiceBillablePlan } from '@/types/resource-plan/shared-service-billable-plan/shared-service-billable-plan';
import { formatDataTableFromOne, formatNumberWithDecimalPlaces } from '@/utils/common';
import { ORG_UNITS } from '@/utils/constants';
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';
import icons from '@/utils/icons';
import { Button, ButtonProps, TableColumnType } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './index.scss';

interface ISharedServiceBillablePlanProps {
    filterValues?: IFilterValues;
    buttons: ButtonProps[];
    loadingFilter: boolean;
}

const SharedServiceBillablePlanTable = ({ filterValues, buttons, loadingFilter }: ISharedServiceBillablePlanProps) => {
    const { showNotification } = useNotify();

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isShowDeleteModal, setIsShowDeleteModal] = useState(false);
    const [deletedData, setDeletedData] = useState<ISharedServiceBillablePlan>();
    const [data, setData] = useState<ISharedServiceBillablePlan[]>([]);
    const [isReloadAPI, setIsReloadAPI] = useState({});

    const { havePermission } = usePermissions('SharedServiceBillablePlanList', 'SharedServiceBillablePlan');

    const totalReportId: number = 0;

    const currentWeek = dayjs().week();

    const filterUnitWorking = (value: number | string) => {
        const { unitWorkingId = 1 } = filterValues || {};
        return formatNumberWithDecimalPlaces(Number(value) / Number(unitWorkingId), 2);
    };

    const renderWeekColumns = (currentWeek: number) => {
        const weeks: any[] = [];
        for (let i = 1; i <= 52; i++) {
            weeks.push({
                key: `week${i}`,
                title: `Week ${i.toString().padStart(2, '0')}`,
                width: 90,
                className: i === currentWeek ? 'active-col-week' : '',
                render: (record: any) => renderWithFallback(filterUnitWorking(record?.[`week${i}`]) || null, true, 6)
            });
        }
        return weeks;
    };

    useEffect(() => {
        const fetchTableData = async () => {
            setIsLoading(true);
            try {
                const { sharedServiceId } = filterValues || {};
                if (sharedServiceId) {
                    const { data, succeeded } = await sharedServiceBillablePlanServices.getTableData(sharedServiceId!);

                    if (succeeded && data) {
                        setData(data);
                    } else {
                        setData([]);
                    }
                } else {
                    setData([]);
                }
            } catch (error) {
                showNotification(false, 'get data table share service billable failed');
            } finally {
                setIsLoading(false);
            }
        };

        fetchTableData();
    }, [isReloadAPI, filterValues, showNotification]);

    const deleteModalContent = (
        <>
            Are you sure you want to delete this project <strong>{renderWithFallback(deletedData?.projectName)}</strong> on{' '}
            <strong>{renderWithFallback(deletedData?.dcName)}</strong>
        </>
    );

    const onShowDeleteModal = (deletedData: ISharedServiceBillablePlan) => {
        setIsShowDeleteModal(true);
        setDeletedData(deletedData);
    };
    const onCloseDeleteModal = () => setIsShowDeleteModal(false);

    const onDeleteProject = async () => {
        if (deletedData?.reportId) {
            const res = await sharedServiceBillablePlanServices.deleteProject(deletedData?.reportId);
            const { succeeded, message } = res;
            showNotification(succeeded, message);
            setIsShowDeleteModal(false);
            setIsReloadAPI({});
        }
    };

    const columns: TableColumnType<any>[] = [
        {
            key: 'key',
            title: '#',
            width: 30,
            fixed: 'left',
            render: (record: any) => (record.reportId !== totalReportId ? record.key : null)
        },
        {
            key: 'dcName',
            title: ORG_UNITS.DC,
            width: 140,
            fixed: 'left',
            render: (record: any) => renderWithFallback(record.dcName)
        },
        {
            key: 'projectName',
            title: ORG_UNITS.Project,
            fixed: 'left',
            width: 180,
            render: (record: any) =>
                record.reportId !== totalReportId ? (
                    <Link
                        to={pathnames.resourcePlan.sharedServiceBillablePlan.detail.path + '/' + record.reportId}
                        style={{ color: '#2A9AD6' }}
                        className="project-link"
                        state={record}
                    >
                        <span className="project-name">{renderWithFallback(record.projectName, true, 16)}</span>
                    </Link>
                ) : null
        },
        {
            key: 'customer',
            title: 'Customer',
            width: 130,
            render: (record: any) => (record.reportId !== totalReportId ? renderWithFallback(record.customer, true, 10) : null)
        },
        {
            key: 'contractType',
            title: 'Contract Type',
            width: 130,
            render: (record: any) => (record.reportId !== totalReportId ? renderWithFallback(record.contractType) : null)
        },
        {
            key: 'contractedBillable',
            title: 'Contracted Billable',
            width: 150,
            render: (record: any) => renderWithFallback(filterUnitWorking(record.contractedBillable) || null, true, 6)
        },
        {
            key: 'plannedBillable',
            title: 'Planned Billable',
            width: 130,
            render: ({ planedBillable, contractedBillable }: any) => (
                <span className={planedBillable > contractedBillable ? 'planned-billable-highlight' : ''}>
                    {renderWithFallback(filterUnitWorking(planedBillable) || null, true, 6)}
                </span>
            )
        },
        ...renderWeekColumns(currentWeek),
        {
            title: 'Action',
            key: 'action',
            fixed: 'right',
            width: 70,
            render: (record: any) => {
                const items = [
                    havePermission('Delete') && {
                        icon: icons.tableAction.delete,
                        onClick: () => onShowDeleteModal(record),
                        tooltip: 'Delete'
                    }
                ].filter(Boolean);
                if (record.reportId !== totalReportId) return <ButtonsIcon items={items} />;
            }
        }
    ];

    const rowClassNameCustom = (record: any) => {
        if (record.reportId === totalReportId) return 'row-total';
        return '';
    };

    return (
        <div>
            <div className="shared-service-container">
                {buttons && (
                    <div className="add-shared-service-buttons">
                        {buttons.map((button, index) => (
                            <Button {...button} key={index} />
                        ))}
                    </div>
                )}
                <BaseTable
                    loading={isLoading || loadingFilter}
                    dataSource={formatDataTableFromOne(data)}
                    columns={columns}
                    className="shared-service-table"
                    style={{ marginTop: 10 }}
                    rowClassName={rowClassNameCustom}
                    rowKey="reportId"
                    totalItemsProp={data.length - 1}
                />
            </div>
            <DialogCommon
                open={isShowDeleteModal}
                onClose={onCloseDeleteModal}
                icon={icons.dialog.delete}
                title="Delete Shared Service Billable"
                content={deleteModalContent}
                buttonType="default-danger"
                buttonLeftClick={onCloseDeleteModal}
                buttonRightClick={onDeleteProject}
            />
        </div>
    );
};

export default SharedServiceBillablePlanTable;
