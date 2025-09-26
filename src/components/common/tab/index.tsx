import { Tabs, TabsProps } from 'antd';

export interface ITabProps extends TabsProps {
    className?: string;
    items: TabsProps['items'];
    onChangeTabs?: (key: string) => void;
    activeKey?: string;
}

const Tab = (props: ITabProps) => {
    const { items, onChangeTabs, className = '', ...otherProps } = props;

    return <Tabs type="card" className={`tabs-detail ${className}`} items={items} onChange={onChangeTabs} {...otherProps} />;
};

export default Tab;
