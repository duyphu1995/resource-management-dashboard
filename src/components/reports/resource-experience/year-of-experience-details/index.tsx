import SubTab from '@/components/common/tab/sub-tab';
import dayjs from 'dayjs';
import TableExperienceDetail from './table-experience-detail';
import ChartExperienceDetail from './chart-experience-detail';
import { TIME_FORMAT } from '@/utils/constants';

const YearOfExperienceDetails = () => {
    const tabs = [
        {
            key: 'chartExperienceSummary',
            label: 'Chart Experience Detail',
            children: <ChartExperienceDetail />
        },
        {
            key: 'tableExperienceSummary',
            label: 'Table Experience Detail',
            children: <TableExperienceDetail />
        }
    ];

    return (
        <div className="year-of-experience">
            <p className="year-of-experience__generated-at">This report is generated at: {dayjs().format(TIME_FORMAT.GMT)}</p>
            <SubTab items={tabs} />
        </div>
    );
};

export default YearOfExperienceDetails;
