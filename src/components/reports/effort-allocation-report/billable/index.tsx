import DetailContent from '@/components/common/detail-management/detail-content';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import { IPropsSubTabs, IEffortAllocationTable } from '@/types/reports/effort-allocation';
import { formatDataTable, formatTimeMonthDayYear } from '@/utils/common';
import { Select, TableColumnsType } from 'antd';
import { useEffect, useState } from 'react';
import effortAllocationReportServices from '@/services/reports/effort-allocation-report';
import useNotify from '@/utils/hook/useNotify';

const Billable: React.FC<IPropsSubTabs> = ({ setPayloadExport }) => {
    const { showNotification } = useNotify();

    const [billableList, setBillableList] = useState<IEffortAllocationTable[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const sortByOptions = [
        {
            label: 'Badge ID',
            value: 'badgeId'
        },
        {
            label: 'Full Name',
            value: 'fullName'
        },
        {
            label: 'Position',
            value: 'positionName'
        },
        {
            label: 'Project',
            value: 'project'
        },
        {
            label: 'DC/Group',
            value: 'dc'
        },
        {
            label: 'Total Effort',
            value: 'totalEffort'
        },
        {
            label: 'Contract Effort',
            value: 'contractEffort'
        }
    ];

    const [valueSortBy, setValueSortBy] = useState(sortByOptions[0].value);

    const handleChangeSelect = (value: string) => {
        setValueSortBy(value);
        setPayloadExport(prev => ({ ...prev, sortedBy: value }));
    };

    const columns: TableColumnsType<IEffortAllocationTable> = [
        {
            key: 'key',
            dataIndex: 'key',
            title: 'No.',
            width: 60,
            fixed: 'left',
            align: 'center',
            render: item => item + 1
        },
        {
            key: 'badgeId',
            dataIndex: 'badgeId',
            title: 'Badge ID',
            width: 100,
            fixed: 'left',
            align: 'center',
            render: item => renderWithFallback(item)
        },
        {
            key: 'fullName',
            dataIndex: 'fullName',
            title: 'Full Name',
            width: 200,
            fixed: 'left',
            render: item => renderWithFallback(item)
        },
        {
            key: 'positionName',
            dataIndex: 'positionName',
            title: 'Position',
            width: 180,
            render: item => renderWithFallback(item)
        },
        {
            key: 'project',
            dataIndex: 'project',
            title: 'Project',
            width: 220,
            render: item => renderWithFallback(item)
        },
        {
            key: 'dc',
            dataIndex: 'dc',
            title: 'DC/Group',
            width: 100,
            align: 'center',
            render: item => renderWithFallback(item)
        },
        {
            key: 'grade',
            dataIndex: 'grade',
            title: 'Grade',
            width: 80,
            align: 'center',
            render: item => renderWithFallback(item)
        },
        {
            key: 'statusName',
            dataIndex: 'statusName',
            title: 'Working Status',
            width: 130,
            align: 'center',
            render: item => renderWithFallback(item)
        },
        {
            key: 'resignationStatusName',
            dataIndex: 'resignationStatusName',
            title: 'Resignation Status',
            width: 150,
            align: 'center',
            render: item => renderWithFallback(item)
        },
        {
            key: 'probationStatus',
            dataIndex: 'probationStatus',
            title: 'Probation Status',
            width: 150,
            align: 'center',
            render: item => renderWithFallback(item)
        },
        {
            key: 'endProbationDate',
            dataIndex: 'endProbationDate',
            title: 'End Probation Date',
            width: 160,
            align: 'center',
            render: item => renderWithFallback(item)
        },
        {
            key: 'totalEffort',
            dataIndex: 'totalEffort',
            title: 'Total Effort (%)',
            width: 130,
            align: 'center',
            render: item => renderWithFallback(item)
        },
        {
            key: 'contractEffort',
            dataIndex: 'contractEffort',
            title: 'Contract Effort (%)',
            width: 150,
            align: 'center',
            render: item => renderWithFallback(item)
        },
        {
            key: 'notes',
            dataIndex: 'notes',
            title: 'Remark',
            width: 80,
            align: 'center',
            render: item => renderWithFallback(item)
        },
        {
            key: 'birthday',
            dataIndex: 'birthday',
            title: 'Date of birth',
            width: 130,
            align: 'center',
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            key: 'birthPlace',
            dataIndex: 'birthPlace',
            title: 'Place of birth',
            width: 160,
            align: 'center',
            render: item => renderWithFallback(item)
        },
        {
            key: 'genderName',
            dataIndex: 'genderName',
            title: 'Gender',
            width: 100,
            align: 'center',
            render: item => renderWithFallback(item)
        },
        {
            key: 'joinDate',
            dataIndex: 'joinDate',
            title: 'Joined Date',
            width: 130,
            align: 'center',
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        }
    ];

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const res = await effortAllocationReportServices.getEffortLocation({ filterBy: 'Billable', sortedBy: valueSortBy });
                const { data } = res;
                setBillableList(data || []);
            } catch (error) {
                showNotification(false, 'Failed to fetch data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [valueSortBy, showNotification]);

    const rowClassName = (record: IEffortAllocationTable, index: number) => {
        if (record.statusName === 'Contractor') {
            return 'contractor-row';
        }
        return index % 2 === 0 ? 'table-row-light' : 'table-row-dark';
    };

    return (
        <DetailContent rootClassName="effort-tab">
            <div className="effort-tab__container">
                <div className="filter-table">
                    <h4 className="filter-table__title">Sort By</h4>
                    <Select
                        className="filter-table__select"
                        placeholder="Select unit"
                        options={sortByOptions}
                        value={valueSortBy}
                        onChange={handleChangeSelect}
                    />
                </div>
                <div className="total-contractor">
                    <span className="contractor-color" />
                    <h4>Contractor: {billableList.filter((item: IEffortAllocationTable) => item.statusName === 'Contractor').length}</h4>
                </div>
            </div>
            <BaseTable columns={columns} dataSource={formatDataTable(billableList)} loading={isLoading} rowClassName={rowClassName} bordered />
        </DetailContent>
    );
};

export default Billable;
