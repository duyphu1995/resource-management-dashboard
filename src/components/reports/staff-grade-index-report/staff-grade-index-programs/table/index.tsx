import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import { IStaffGradeIndexReport } from '@/types/reports/staff-grade-index-report';
import { ORG_UNITS } from '@/utils/constants';
import { TableColumnsType } from 'antd';
import { ColumnType } from 'antd/es/table';
import './index.scss';

interface Props {
    data: IStaffGradeIndexReport[];
    loading: boolean;
}

const StaffGradeIndexReportProgramTable = ({ data, loading }: Props) => {
    const generateGradeColumns = (prefix: string, count: number) => {
        return Array.from({ length: count }, (_, index) => ({
            key: `${prefix}${index + 1}`,
            title: index + 1,
            width: 52,
            align: 'center' as any,
            render: (record: IStaffGradeIndexReport) => renderWithFallback(record?.[`${prefix}${index + 1}` as keyof IStaffGradeIndexReport])
        }));
    };

    const columns: TableColumnsType<IStaffGradeIndexReport> = [
        {
            key: 'programName',
            title: ORG_UNITS.Program,
            width: 237,
            fixed: 'left',
            render: (record: IStaffGradeIndexReport) => renderWithFallback(record?.programName),
            onHeaderCell: () => ({ className: 'table-header-column text-align-center' })
        },
        {
            key: 'dcName',
            title: ORG_UNITS.DC,
            width: 140,
            fixed: 'left',
            render: (record: IStaffGradeIndexReport) => renderWithFallback(record?.dcName),
            onHeaderCell: () => ({ className: 'table-header-column text-align-center' })
        },
        {
            key: 'dgName',
            title: ORG_UNITS.DG,
            width: 140,
            fixed: 'left',
            render: (record: IStaffGradeIndexReport) => renderWithFallback(record?.dgName),
            onHeaderCell: () => ({ className: 'table-header-column text-align-center' })
        },
        {
            key: 'staffGradeIndex',
            title: 'Staff Grade Index',
            width: 148,
            fixed: 'left',
            render: (record: IStaffGradeIndexReport) => renderWithFallback(record?.staffGradeIndex.toFixed(2)),
            onHeaderCell: () => ({ className: 'table-header-column' })
        },
        {
            title: 'Effort Grade',
            children: generateGradeColumns('effortGrade', 16),
            className: 'effort-grade-column'
        },
        {
            title: 'Grade',
            children: generateGradeColumns('grade', 16),
            className: 'grade-column'
        }
    ];

    const modifiedHeaderRow = (
        _data: readonly ColumnType<IStaffGradeIndexReport>[],
        index: number | undefined
    ): React.HTMLAttributes<HTMLElement> | any => {
        if (index === 0) {
            return { className: 'table-header-row' };
        }
        if (index === 1) return { className: 'grade-row-index' };
    };

    const rowClassNameHighlight = (_record: IStaffGradeIndexReport, index: number) => {
        if (index % 2 === 0) return 'table-row-dark';
        return 'table-row-light';
    };

    return (
        <div className="staff-grade-index-report-programs-table">
            <BaseTable
                dataSource={data}
                style={{ marginTop: 12 }}
                columns={columns}
                loading={loading}
                rowClassName={rowClassNameHighlight}
                onHeaderRow={modifiedHeaderRow}
                scroll={{ x: 'max-content', y: 'calc(100vh - 320px)' }}
                className="table-header-bordered"
                bordered
            />
        </div>
    );
};

export default StaffGradeIndexReportProgramTable;
