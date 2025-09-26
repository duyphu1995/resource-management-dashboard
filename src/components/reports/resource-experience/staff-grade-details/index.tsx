import SubTab from '@/components/common/tab/sub-tab';
import StaffGradeProgram from './staff-grade-program';
import StaffGradeProject from './staff-grade-project';
import './index.scss';
import { useMemo } from 'react';
import dayjs from 'dayjs';
import { TIME_FORMAT } from '@/utils/constants';

const StaffGradeDetails = () => {
    const tabs = useMemo(
        () => [
            {
                key: 'staffGradeProgram',
                label: 'Staff Grade Program',
                children: <StaffGradeProgram />
            },
            {
                key: 'staffGradeProject',
                label: 'Staff Grade Project',
                children: <StaffGradeProject />
            }
        ],
        []
    );

    return (
        <div className="staff-grade-details">
            <p className="staff-grade-details__generated-at">This report is generated at: {dayjs().format(TIME_FORMAT.GMT)}</p>
            <SubTab items={tabs} />
        </div>
    );
};

export default StaffGradeDetails;
