import { renderBooleanStatus, renderWithFallback } from '@/components/common/table/render-data-table-common';
import { ITableHaveActionAddProps } from '@/types/common';
import { IDocument } from '@/types/hr-management/employee-management';
import { formatDataTable, formatTimeMonthDayYear } from '@/utils/common';
import { ColumnsType } from 'antd/es/table';
import TableHaveAdd from '../../../../../../common/table/table-add';

const TableDocument = (props: ITableHaveActionAddProps<IDocument[]>) => {
    const { dataProps } = props;

    //Table Document
    const columnsDocuments: ColumnsType<IDocument> = [
        {
            dataIndex: 'documentTypeName',
            key: 'documentTypeName',
            title: 'Types',
            fixed: 'left',
            width: 220,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'isCompleted',
            key: 'completed',
            title: 'Completed',
            align: 'center',
            width: 106,
            render: item => renderBooleanStatus(item, 'isCompleted')
        },
        {
            dataIndex: 'requestDate',
            key: 'requestedDate',
            title: 'Requested Date',
            width: 180,
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'receivedDate',
            key: 'receivedDate',
            title: 'Received Date',
            width: 180,
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'notes',
            key: 'note',
            title: 'Note',
            width: 164,
            render: item => renderWithFallback(item, true, 30)
        }
    ];

    return (
        <TableHaveAdd
            title="Document"
            dataSource={formatDataTable(dataProps)}
            columns={columnsDocuments}
            tableScroll={{ x: 'max-content', y: 400 }}
        />
    );
};

export default TableDocument;
