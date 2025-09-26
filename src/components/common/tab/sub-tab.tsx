import { Tabs } from 'antd';
import { ITabProps } from '.';
import './sub-tab.scss';

const SubTab = (props: ITabProps) => {
    const { items, className, activeKey, onChangeTabs, ...otherProps } = props;

    return (
        <Tabs
            defaultActiveKey={activeKey}
            activeKey={activeKey}
            onChange={(key: string) => onChangeTabs && onChangeTabs(key)}
            items={items}
            className={`sub-tab ${className}`}
            animated={true}
            {...otherProps}
        />
    );
};

export default SubTab;
