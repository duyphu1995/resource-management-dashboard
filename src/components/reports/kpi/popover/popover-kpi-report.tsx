import { Popover } from 'antd';
import { memo } from 'react';
import { IPopoverKpiReportProps } from '@/types/reports/kpi';
import './popover-kpi-report.scss';

const PopoverKpiReport = memo(({ header, detail, value }: IPopoverKpiReportProps) => {
    const { year, week, name } = header;

    const content = detail.map(({ unitId, unitName, totalAttrition }) => (
        <div key={unitId} className="info-report">
            <div>{unitName}</div>
            <div>{totalAttrition}</div>
        </div>
    ));

    return (
        <Popover
            placement="bottomLeft"
            title={`Week ${week < 10 ? `0${week}` : week} in ${year} - ${name}`}
            content={content}
            arrow={false}
            className="popover"
            getPopupContainer={triggerNode => (triggerNode.parentNode as HTMLElement) || triggerNode}
        >
            {value}
        </Popover>
    );
});

export default PopoverKpiReport;
