import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import TableHaveAdd from '@/components/common/table/table-add';
import { ITableHaveActionAddProps } from '@/types/common';
import { IPaForeignLanguage } from '@/types/hr-management/employee-management';
import { formatDataTable } from '@/utils/common';
import { ColumnsType } from 'antd/es/table';

const TablePAForeignLanguage = (props: ITableHaveActionAddProps<IPaForeignLanguage[]>) => {
    const { dataProps } = props;

    //PA Foreign language
    const columnsPAForeignLanguage: ColumnsType<IPaForeignLanguage> = [
        {
            dataIndex: 'year',
            key: 'year',
            title: 'Year',
            width: 50,
            fixed: 'left',
            render: item => renderWithFallback(item)
        },
        {
            title: 'First',
            children: [
                {
                    title: 'Listening',
                    dataIndex: 'listeningScore1',
                    key: 'listeningScore1',
                    width: 50,
                    render: item => renderWithFallback(item)
                },
                {
                    title: 'Reading',
                    dataIndex: 'readingScore1',
                    key: 'readingScore1',
                    width: 50,
                    render: item => renderWithFallback(item)
                }
            ]
        },
        {
            title: 'Second',
            children: [
                {
                    title: 'Listening',
                    dataIndex: 'listeningScore2',
                    key: 'listeningScore2',
                    width: 50,
                    render: item => renderWithFallback(item)
                },
                {
                    title: 'Reading',
                    dataIndex: 'readingScore2',
                    key: 'readingScore2',
                    width: 50,
                    render: item => renderWithFallback(item)
                }
            ]
        },
        {
            title: 'Certificate',
            children: [
                {
                    title: 'Type',
                    dataIndex: 'certificateType',
                    key: 'certificateType',
                    width: 80,
                    render: item => renderWithFallback(item)
                },
                {
                    title: 'Expiration Date',
                    dataIndex: 'certificateExpiredDate',
                    key: 'certificateExpiredDate',
                    width: 80,
                    render: item => renderWithFallback(item)
                }
            ]
        },
        {
            title: 'Language Test',
            dataIndex: 'languageTest',
            key: 'languageTest',
            width: 100,
            render: item => renderWithFallback(item)
        },
        {
            title: 'Score',
            dataIndex: 'score',
            key: 'score',
            width: 50,
            render: item => renderWithFallback(item)
        },
        {
            title: 'PA Mark',
            dataIndex: 'paMark',
            key: 'paMark',
            width: 50,
            fixed: 'right',
            render: item => renderWithFallback(item)
        }
    ];

    return (
        <TableHaveAdd
            title="PA Foreign Language"
            dataSource={formatDataTable(dataProps)}
            columns={columnsPAForeignLanguage}
            bordered
            tableScroll={{ x: 'calc(500px + 50%)', y: 400 }}
        />
    );
};

export default TablePAForeignLanguage;
