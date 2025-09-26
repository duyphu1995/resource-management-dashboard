import { IOverviewItem } from '@/types/reports/monthly-delivery-statistic-report';
import './index.scss';

export interface IOverviewReportProps {
    items: IOverviewItem[];
}

const OverviewReport = ({ items }: IOverviewReportProps) => {
    return (
        <div className="overview-report">
            {items.map((item, index) => (
                <div key={index} className="item-report">
                    <p className={`item-report__value ${typeof item.value === 'number' && item.value <= 0 ? 'danger' : ''}`}>{item.value}</p>
                    <p className="item-report__label">{item.label}</p>
                </div>
            ))}
        </div>
    );
};

export default OverviewReport;
