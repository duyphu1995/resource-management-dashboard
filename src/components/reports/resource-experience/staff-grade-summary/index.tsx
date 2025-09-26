import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { TableColumnsType } from 'antd';
import useNotify from '@/utils/hook/useNotify';
import useLoading from '@/utils/hook/useLoading';
import { formatDataTable } from '@/utils/common';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import resourceExperienceServices from '@/services/reports/resource-experience';
import { IStaffGradeSummaryTable } from '@/types/reports/resource-experience';
import './index.scss';
import { TIME_FORMAT } from '@/utils/constants';

dayjs.extend(isoWeek);
dayjs.extend(customParseFormat);

const StaffGradeSummary = () => {
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [dataReport, setDataReport] = useState<IStaffGradeSummaryTable[]>([]);

    const getCurrentWeekRange = (): string => {
        const startOfWeek = dayjs().startOf('isoWeek').format('MMM D, YYYY');
        const endOfWeek = dayjs().endOf('isoWeek').format('MMM D, YYYY');
        return `(${startOfWeek} to ${endOfWeek})`;
    };

    const columns: TableColumnsType<IStaffGradeSummaryTable> = [
        {
            dataIndex: 'dcName',
            key: 'dcName',
            title: 'DC / Group',
            width: 237,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'staffGradeIndex',
            key: 'staffGradeIndex',
            title: 'Staff Grade Index',
            width: 148,
            align: 'center',
            render: item => renderWithFallback(item)
        },
        {
            title: 'Grade',

            children: [
                'grade1',
                'grade2',
                'grade3',
                'grade4',
                'grade5',
                'grade6',
                'grade7',
                'grade8',
                'grade9',
                'grade10',
                'grade11',
                'grade12',
                'grade13',
                'grade14',
                'grade15',
                'grade16'
            ].map((item: string, index: number) => ({
                dataIndex: item,
                key: item,
                title: index + 1,
                width: 50,
                align: 'center',
                render: item => renderWithFallback(item),
                onHeaderCell: () => ({ className: 'grade-header' })
            }))
        }
    ];

    useEffect(() => {
        const fetchData = async () => {
            turnOnLoading();
            try {
                const response = await resourceExperienceServices.getStaffGradeIndex('3');
                const { succeeded, data } = response;

                if (succeeded) {
                    setDataReport(formatDataTable(data));
                }
            } catch (error) {
                showNotification(false, 'Failed to fetch data');
            } finally {
                turnOffLoading();
            }
        };

        fetchData();
    }, [showNotification, turnOnLoading, turnOffLoading]);

    const rowClassName = (record: IStaffGradeSummaryTable, index: number): string => {
        const isDGClass = record.isDG ? 'table-row-dg' : '';
        const isTotalClass = record.isCountTotal ? 'table-row-total' : '';
        const rowClass = index % 2 === 0 ? 'table-row-light' : 'table-row-dark';

        return `${isDGClass} ${isTotalClass} ${rowClass}`.trim();
    };

    return (
        <div className="staff-grade-summary">
            <div className="staff-grade-summary__info">
                <div className="info__sub-title">Staff Grade Summary {getCurrentWeekRange()}</div>
                <div className="info__generated-date">This report is generated at: {dayjs().format(TIME_FORMAT.GMT)}</div>
            </div>
            <BaseTable
                columns={columns}
                dataSource={dataReport}
                pagination={false}
                className="staff-grade-summary__table"
                bordered
                loading={isLoading}
                rowClassName={rowClassName}
            />
        </div>
    );
};

export default StaffGradeSummary;
