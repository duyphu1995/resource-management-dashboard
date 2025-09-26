import SubTab from '@/components/common/tab/sub-tab';
import employeeSummaryService from '@/services/reports/employee-summary';
import { IGraduatedSummary, IParamsList } from '@/types/reports/employee-summary';
import { ORG_UNITS } from '@/utils/constants';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import ChartGraduatedSummaryByDG from '../tab-chart-graduated-summary-by-dg';
import GraduatedSummaryList from '../tab-graduated-list';

const GraduatedSummaryDetail = () => {
    const { id } = useParams();
    const location = useLocation();
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();
    const queryParams = new URLSearchParams(location.search);
    const unitName = queryParams.get('unitName');
    const tab = queryParams.get('tab');
    const moduleName = queryParams.get('moduleName') || '';

    const [dataList, setDataList] = useState<IGraduatedSummary[]>([]);

    const totalGraduatedNumber = dataList.map(item => {
        const graduatedItem = item.graduatedByDGDtos.find(subItem => subItem.unitId === 999999);
        return graduatedItem ? graduatedItem.number : 0;
    });

    const tabsGraduated = [
        {
            key: 'GraduatedSummary',
            label: `Graduated Summary of ${unitName} (Total Employee: ${totalGraduatedNumber?.pop() || 0})`,
            children: (
                <GraduatedSummaryList
                    dataProps={dataList}
                    isLoading={isLoading}
                    disabled
                    bordered
                    pagination={false}
                    scroll={{ x: 'max-content' }}
                    rootClassName="table-report-window-open"
                />
            )
        },
        {
            key: 'ChartGraduatedSummaryByDG',
            label: `Chart Graduated Summary By ${ORG_UNITS.DG}`,
            children: <ChartGraduatedSummaryByDG dataProps={dataList} isLoading={isLoading} />
        }
    ];

    useEffect(() => {
        const fetchDataList = async (params: IParamsList) => {
            turnOnLoading();
            try {
                const res = await employeeSummaryService.getGraduatedListByDC(params, moduleName);

                const { succeeded, data } = res;

                if (succeeded && data) {
                    setDataList(data);
                }
            } catch (error) {
                showNotification(false, 'Error fetching get graduated list');
            } finally {
                turnOffLoading();
            }
        };

        if (tab?.startsWith('CompanySummary')) {
            const companyId = tab?.split('-')[1];

            fetchDataList({ companyId: parseInt(companyId), unitId: Number(id) });
            return;
        }
        tab && fetchDataList({ tabType: tab, unitId: Number(id) });
    }, [tab, id, turnOnLoading, turnOffLoading, showNotification]);

    return (
        <div className="title-header-table">
            <SubTab items={tabsGraduated} />
        </div>
    );
};

export default GraduatedSummaryDetail;
