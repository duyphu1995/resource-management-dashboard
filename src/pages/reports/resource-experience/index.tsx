import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import SubTab from '@/components/common/tab/sub-tab';
import StaffGradeDetails from '@/components/reports/resource-experience/staff-grade-details';
import StaffGradeSummary from '@/components/reports/resource-experience/staff-grade-summary';
import YearOfExperienceDetails from '@/components/reports/resource-experience/year-of-experience-details';
import YearOfExperienceSummary from '@/components/reports/resource-experience/year-of-experience-summary';
import pathnames from '@/pathnames';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';

const breadcrumbItems: BreadcrumbItemType[] = [
    { title: pathnames.reports.main.name },
    { title: pathnames.reports.resourceExperienceReport.main.name }
];

const tabItems = [
    {
        key: 'staffGradeSummary',
        label: 'Staff Grade Summary',
        children: <StaffGradeSummary />
    },
    {
        key: 'staffGradeDetails',
        label: 'Staff Grade Details',
        children: <StaffGradeDetails />
    },
    {
        key: 'yearOfExperienceSummary',
        label: 'Year of Experience Summary',
        children: <YearOfExperienceSummary />
    },
    {
        key: 'yearOfExperienceDetails',
        label: 'Year of Experience Details',
        children: <YearOfExperienceDetails />
    }
];

const ResourceExperiencePage = () => {
    return (
        <DetailContent>
            <BaseBreadcrumb dataItem={breadcrumbItems} />
            <SubTab items={tabItems} />
        </DetailContent>
    );
};

export default ResourceExperiencePage;
