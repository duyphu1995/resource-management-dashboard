import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import resourceExperienceServices from '@/services/reports/resource-experience';
import { IStaffGradeProgramTable } from '@/types/reports/resource-experience';
import { formatDataTable, formatNumberWithDecimalPlaces } from '@/utils/common';
import useNotify from '@/utils/hook/useNotify';
import { TableColumnsType } from 'antd';
import { useEffect, useState } from 'react';

const StaffGradeProgram = () => {
    const { showNotification } = useNotify();

    const [dataReport, setDataReport] = useState<IStaffGradeProgramTable[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const columns: TableColumnsType<IStaffGradeProgramTable> = [
        {
            dataIndex: 'programName',
            key: 'programName',
            title: 'Program',
            width: 237,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'dcName',
            key: 'dcName',
            title: 'DC',
            width: 200,
            align: 'center',
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'dgName',
            key: 'dgName',
            title: 'BU',
            width: 200,
            align: 'center',
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'staffGradeIndex',
            key: 'staffGradeIndex',
            title: 'Staff Grade Index',
            width: 185,
            align: 'center',
            render: item => renderWithFallback(formatNumberWithDecimalPlaces(item))
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
                render: item => renderWithFallback(formatNumberWithDecimalPlaces(item)),
                onHeaderCell: () => ({ className: 'grade-header' })
            }))
        }
    ];

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await resourceExperienceServices.getStaffGradeIndex('2');
                const { succeeded, data } = response;

                if (succeeded) {
                    setDataReport(formatDataTable(data) || []);
                }
            } catch (error) {
                showNotification(false, 'Failed to fetch data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [showNotification]);

    return <BaseTable columns={columns} dataSource={dataReport} pagination={false} loading={isLoading} bordered />;
};

export default StaffGradeProgram;
