import './resource-projection-item.scss';

export interface IResourceProjectionItemOverview {
    value?: number;
    label?: string;
}

export interface IResourceProjectionItemsProps {
    items: IResourceProjectionItemOverview[];
}

export interface IResourceProjectionChartItems {
    grade: string;
    type: string;
    value: number;
}

const ResourceProjectionItems = ({ items }: IResourceProjectionItemsProps) => {
    return (
        <div className="overview-resource-items">
            {items.map((item, index) => (
                <div key={index} className="item">
                    <div className="item__value">{item.value}</div>
                    <div className="item__label">{item.label}</div>
                </div>
            ))}
        </div>
    );
};

export default ResourceProjectionItems;
