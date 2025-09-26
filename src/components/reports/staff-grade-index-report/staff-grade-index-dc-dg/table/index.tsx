import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import { IStaffGradeIndexReport } from '@/types/reports/staff-grade-index-report';
import { formatDataTable, getMaxGradeIndex } from '@/utils/common';
import { TableColumnsType } from 'antd';
import './index.scss';

interface Props {
    data: IStaffGradeIndexReport[];
    loading: boolean;
}

const StaffGradeIndexReportDcDGTable = ({ data, loading }: Props) => {
    const maxGradeIndex = getMaxGradeIndex(data, 'effortGrade');

    const generateColumns = (type: 'effortGrade' | 'grade', count: number) => {
        return Array.from({ length: count }, (_, index) => ({
            key: `${type}${index + 1}`,
            title: index + 1,
            width: 52,
            align: 'center' as any,
            className: 'table-header-border',
            render: (record: IStaffGradeIndexReport) => renderWithFallback(record?.[`${type}${index + 1}` as keyof IStaffGradeIndexReport])
        }));
    };

    const columns: TableColumnsType<IStaffGradeIndexReport> = [
        {
            key: 'dcName',
            title: 'DC/Group',
            width: 237,
            fixed: 'left',
            render: (record: IStaffGradeIndexReport) => renderWithFallback(record?.dcName),
            onHeaderCell: () => ({ className: 'table-header-border text-align-center' })
        },
        {
            key: 'staffGradeIndex',
            title: 'Staff Grade Index',
            width: 148,
            fixed: 'left',
            render: (record: IStaffGradeIndexReport) => renderWithFallback(record?.staffGradeIndex),
            onHeaderCell: () => ({ className: 'table-header-border' })
        },
        {
            title: 'Effort Grade',
            children: generateColumns('effortGrade', maxGradeIndex || 16),
            className: 'table-header-border'
        },
        {
            title: 'Grade',
            children: generateColumns('grade', 16),
            className: 'table-header-border'
        }
    ];

    const rowClassName = (record: IStaffGradeIndexReport) => {
        return [record.isDG && 'table-row-BU', ['DC Total', 'Department Total', 'TMA Total'].includes(record.dcName) && 'table-row-total']
            .filter(Boolean)
            .join(' ');
    };

    return (
        <div className="staff-grade-index-report-dc-dg-table">
            <BaseTable
                dataSource={formatDataTable(data)}
                style={{ marginTop: 24 }}
                columns={columns}
                loading={loading}
                scroll={{ x: 'max-content', y: 649 }}
                className="table-header-bordered"
                bordered
                pagination={false}
                rowClassName={rowClassName}
            />
        </div>
    );
};

export default StaffGradeIndexReportDcDGTable;
