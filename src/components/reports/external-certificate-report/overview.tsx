import { IOverviewItem } from '@/types/reports/monthly-delivery-statistic-report';
import { Col, Row } from 'antd';
import './overview.scss';

export interface IOverviewProps {
    items: IOverviewItem[];
}

const OverviewReport = (props: IOverviewProps) => {
    const { items = [] } = props;

    return (
        <Row gutter={[16, 16]} className="external-certificate-overview">
            {items.map(item => (
                <Col span={6} key={item.label}>
                    <div className="overview-item">
                        <div className="overview-item-value">{item.value}</div>
                        <div className="overview-item-label">{item.label}</div>
                    </div>
                </Col>
            ))}
        </Row>
    );
};

export default OverviewReport;
