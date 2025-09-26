import SubTab from '@/components/common/tab/sub-tab';
import { IMonthlyStatisticCommon } from '@/types/reports/monthly-delivery-statistic-report';
import { useState } from 'react';
import AttritionTab from './attrition-tab';
import './index.scss';
import ResignationTab from './resignation-tab';

interface IResignationProps extends IMonthlyStatisticCommon {
    filterValue: string;
}

const Resignation = (props: IResignationProps) => {
    const { filterValue, filterData, reloadData } = props;
    const [changeTabs, setChangeTabs] = useState<{ key: string }>({ key: 'Resignation' });

    const keyTabChildren = `${reloadData.key}_${changeTabs.key}`;

    const tabs = [
        {
            key: 'Resignation',
            label: 'Resignation',
            children: <ResignationTab reloadData={{ key: keyTabChildren }} filterValue={filterValue} filterData={filterData} />
        },
        {
            key: 'Attrition',
            label: 'Attrition',
            children: <AttritionTab reloadData={{ key: keyTabChildren }} filterValue={filterValue} filterData={filterData} />
        }
    ];

    return (
        <div className="resignation">
            <h5 className="title">Resignation Of {filterValue}</h5>
            <SubTab items={tabs} onChangeTabs={key => setChangeTabs({ key })} />
        </div>
    );
};

export default Resignation;
