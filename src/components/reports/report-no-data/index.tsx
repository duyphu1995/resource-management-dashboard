import { Empty } from 'antd';

const ReportNoData = () => {
    return (
        <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
                <h1>
                    <div>N/A</div>
                    <div>No Data To Calculate</div>
                </h1>
            }
        />
    );
};

export default ReportNoData;
