import SubTab from '@/components/common/tab/sub-tab';
import { IMonthlyStatisticCommon } from '@/types/reports/monthly-delivery-statistic-report';
import { dateMappings } from '@/utils/common';
import { useState } from 'react';
import ByDGs from './by-dgs';
import './index.scss';
import SharedServicesUnit from './shared-services-unit';
import { ORG_UNITS } from '@/utils/constants';

const BillableGrowth = (props: IMonthlyStatisticCommon) => {
    const { filterData, reloadData } = props;
    const { month, year } = filterData;

    const [changeTabs, setChangeTabs] = useState<{ key: string }>({ key: 'ByDGs' });

    const keyTabChildren = `${reloadData.key}_${changeTabs.key}`;

    const tabs = [
        {
            key: 'ByDGs',
            label: `By ${ORG_UNITS.DG}s`,
            children: <ByDGs reloadData={{ key: keyTabChildren }} filterValue={filterData?.month} filterData={filterData} />
        },
        {
            key: 'ByServicesUnit',
            label: 'By Shared Services Unit',
            children: <SharedServicesUnit reloadData={{ key: keyTabChildren }} filterData={filterData} />
        }
    ];

    return (
        <div className="billable-growth">
            <h5 className="title">
                Billable Of {dateMappings[parseInt(month, 10)]} {year}
            </h5>
            <SubTab items={tabs} onChangeTabs={key => setChangeTabs({ key })} />
        </div>
    );
};

export default BillableGrowth;
