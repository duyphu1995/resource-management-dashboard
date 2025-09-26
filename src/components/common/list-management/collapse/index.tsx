import { Button, Tooltip } from 'antd';
import { ReactNode, useState } from 'react';
import './index.scss';
import QuickFilterCollapseIcon from '/media/icons/arrow-right.svg';

interface ICollapseProps {
    expandTooltip?: string;
    collapsedTooltip?: string;
    contentStart: ReactNode;
    contentEnd: ReactNode;
}

const Collapse = (props: ICollapseProps) => {
    const { contentStart, contentEnd, collapsedTooltip = 'Collapse', expandTooltip = 'Expand' } = props;
    const [collapsed, setCollapsed] = useState(false);
    const toggleCollapsed = () => setCollapsed(!collapsed);

    return (
        <div className={'collapse-container' + (collapsed ? ' collapse-start-collapsed' : '')}>
            <div className={'collapse-start-container'}>
                <div className="collapse-start-collapse-button-container">
                    <Tooltip placement="right" title={collapsed ? expandTooltip : collapsedTooltip}>
                        <Button className="collapse-start-collapse-button" icon={<img src={QuickFilterCollapseIcon} />} onClick={toggleCollapsed} />
                    </Tooltip>
                </div>
                <div className="collapse-start-content-container">
                    <div className="collapse-start-content">{contentStart}</div>
                </div>
            </div>
            <div className="collapse-end">{contentEnd}</div>
        </div>
    );
};

export default Collapse;
