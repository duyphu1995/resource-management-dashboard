import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isoWeek from 'dayjs/plugin/isoWeek';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import SubTab from '@/components/common/tab/sub-tab';
import ChartExperienceSummary from './chart-experience-summary';
import TableExperienceSummary from './table-experience-summary';
import './index.scss';
import { useEffect, useState } from 'react';
import resourceExperienceServices from '@/services/reports/resource-experience';
import useNotify from '@/utils/hook/useNotify';
import useLoading from '@/utils/hook/useLoading';
import { IYearOfExperienceSummary } from '@/types/reports/resource-experience';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isoWeek);
dayjs.extend(weekOfYear);
dayjs.extend(localizedFormat);
const YearOfExperienceSummary = () => {
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [dataChart, setDataChart] = useState<IYearOfExperienceSummary[]>();
    const [dataTable, setDataTable] = useState<IYearOfExperienceSummary[]>();

    const getCurrentWeekRange = () => {
        const startOfWeek = dayjs().startOf('isoWeek');
        const endOfWeek = dayjs().endOf('isoWeek');

        const formattedRange = `${startOfWeek.format('MMM DD, YYYY')} to ${endOfWeek.format('MMM DD, YYYY')}`;

        return formattedRange;
    };

    const tabs = [
        {
            key: 'chartExperienceSummary',
            label: 'Chart Experience Summary',
            children: <ChartExperienceSummary isLoading={isLoading} dataChart={dataChart} />
        },
        {
            key: 'tableExperienceSummary',
            label: `Table Experience Summary (${getCurrentWeekRange()})`,
            children: <TableExperienceSummary isLoading={isLoading} dataTable={dataTable} />
        }
    ];

    useEffect(() => {
        const fetchData = async () => {
            turnOnLoading();
            try {
                const response = await resourceExperienceServices.getYearExperience('3');
                const { data, succeeded } = response;
                if (succeeded && data) {
                    const dataChart = data?.filter(
                        item => item.dcName === 'TMA Total' || item.dcName === 'Department Total' || item.dcName === 'DC Total'
                    );

                    setDataChart(dataChart);
                    setDataTable(data);
                }
            } catch (error) {
                showNotification(false, 'Failed to fetch data');
            } finally {
                turnOffLoading();
            }
        };

        fetchData();
    }, [showNotification, turnOffLoading, turnOnLoading]);

    return (
        <div className="year-of-experience">
            <p className="year-of-experience__generated-at">This report is generated at: {dayjs().format('MMM DD, YYYY h:mm:ss A [(GMT] Z[)]')}</p>
            <SubTab items={tabs} />
        </div>
    );
};

export default YearOfExperienceSummary;
