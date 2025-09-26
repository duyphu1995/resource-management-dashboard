import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import resourceExperienceServices from '@/services/reports/resource-experience';
import { ITableExperienceDetail } from '@/types/reports/resource-experience';
import { formatDataTable } from '@/utils/common';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import { TableColumnsType, Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import './index.scss';

const TableExperienceDetail = () => {
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [dataReport, setDataReport] = useState<ITableExperienceDetail[]>([]);

    const columns: TableColumnsType<ITableExperienceDetail> = [
        {
            dataIndex: 'projectName',
            key: 'projectName',
            title: 'Project / Department',
            width: 200,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'dcName',
            key: 'dcName',
            title: 'DC',
            width: 100,
            align: 'center',
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'dgName',
            key: 'dgName',
            title: 'BU',
            width: 100,
            align: 'center',
            render: item => renderWithFallback(item)
        },
        {
            title: 'Years of Experience',
            children: [
                {
                    dataIndex: 'range0',
                    title: <Tooltip title="<12 months">{'<1'}</Tooltip>
                },
                {
                    dataIndex: 'range1',
                    title: <Tooltip title=">=12 months and <24 months">1</Tooltip>
                },
                {
                    dataIndex: 'range2',
                    title: <Tooltip title=">=24 months and <36 months">2</Tooltip>
                },
                {
                    dataIndex: 'range3',
                    title: <Tooltip title=">=36 months and <48 months">3</Tooltip>
                },
                {
                    dataIndex: 'range4',
                    title: <Tooltip title=">=48 months and <60 months">4</Tooltip>
                },
                {
                    dataIndex: 'range5',
                    title: <Tooltip title=">=60 months and <72 months">5</Tooltip>
                },
                {
                    dataIndex: 'range6',
                    title: <Tooltip title=">=72 months and <84 months">6</Tooltip>
                },
                {
                    dataIndex: 'range7',
                    title: <Tooltip title=">=84 months and <96 months">7</Tooltip>
                },
                {
                    dataIndex: 'range8',
                    title: <Tooltip title=">=96 months and <108 months">8</Tooltip>
                },
                {
                    dataIndex: 'range9',
                    title: <Tooltip title=">=108 months and <120 months">9</Tooltip>
                },
                {
                    dataIndex: 'range10',
                    title: <Tooltip title=">=120 months and <132 months">10</Tooltip>
                },
                {
                    dataIndex: 'range11',
                    title: <Tooltip title=">=132 months">{'>10'}</Tooltip>
                },
                {
                    dataIndex: 'totalEmployee',
                    title: 'Total'
                }
            ].map(item => ({
                ...item,
                align: 'center',
                width: 50,
                render: item => renderWithFallback(item),
                onHeaderCell: () => ({ className: 'grade-header' })
            }))
        }
    ];

    useEffect(() => {
        const fetchData = async () => {
            turnOnLoading();
            try {
                const response = await resourceExperienceServices.getYearExperience('1');
                const { succeeded, data } = response;

                if (succeeded) {
                    setDataReport(formatDataTable(data) || []);
                }
            } catch (error) {
                showNotification(false, 'Failed to fetch data');
            } finally {
                turnOffLoading();
            }
        };

        fetchData();
    }, [turnOffLoading, turnOnLoading, showNotification]);

    return (
        <BaseTable
            className="table-experience-detail"
            scroll={{ x: 'max-content', y: 449 }}
            columns={columns}
            dataSource={formatDataTable(dataReport) || []}
            pagination={false}
            loading={isLoading}
            bordered
        />
    );
};

export default TableExperienceDetail;
