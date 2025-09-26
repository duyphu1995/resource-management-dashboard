import { Flex } from 'antd';

export interface ITableNoteData {
    color: string;
    title: string;
}

export interface ITableNoteProps {
    data?: ITableNoteData[];
}

const TableNote = (props: ITableNoteProps) => {
    const defaultData: ITableNoteData[] = [
        {
            color: '#1E6D98',
            title: 'Full Time'
        },
        {
            color: '#01BAD3',
            title: 'Part Time'
        },
        {
            color: '#E66F00',
            title: 'Onsite'
        },
        {
            color: '#54C5B5',
            title: 'Leave Without Pay'
        },
        {
            color: '#00A811',
            title: 'Maternity Leave'
        },
        {
            color: '#88592B',
            title: 'Pending Resignation'
        },
        {
            color: '#323232',
            title: 'Resigned'
        }
    ];
    const data = props.data || defaultData || [];

    return (
        <Flex gap={16} style={{ margin: '24px 0 16px 0' }}>
            {data.map((item, index) => (
                <Flex gap={8} align="center" key={index}>
                    <div style={{ background: item.color, width: 16, height: 16, borderRadius: 4 }}></div>
                    <div>{item.title}</div>
                </Flex>
            ))}
        </Flex>
    );
};

export default TableNote;
