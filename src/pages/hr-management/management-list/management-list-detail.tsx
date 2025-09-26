import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import DetailFields from '@/components/common/detail-management/detail-fields';
import DetailHeader from '@/components/common/detail-management/detail-header';
import DetailInfo from '@/components/common/detail-management/detail-info';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import pathnames from '@/pathnames';
import managementListService from '@/services/hr-management/management-list';
import { IField } from '@/types/common';
import { IEmployee } from '@/types/hr-management/employee-management';
import { ORG_UNITS } from '@/utils/constants';
import useNotify from '@/utils/hook/useNotify';
import { ButtonProps, Switch } from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const ManagementListDetailPage = () => {
    const { employeeId = '0' } = useParams();
    const navigation = useNavigate();
    const { showNotification } = useNotify();

    const [data, setData] = useState<IEmployee | null>(null);
    const [isShow, setIsShow] = useState<boolean>(false);

    const pageTitle = 'Management Details';

    const buttons: ButtonProps[] = [
        {
            type: 'primary',
            children: 'View Employee Details',
            onClick: () => navigation(pathnames.hrManagement.employeeManagement.detail.path + '/' + employeeId)
        }
    ];

    const breadcrumb: BreadcrumbItemType[] = [
        { title: pathnames.hrManagement.main.name },
        { path: pathnames.hrManagement.managementList.main.path, title: pathnames.hrManagement.managementList.main.name },
        { title: pathnames.hrManagement.managementList.detail.name }
    ];

    const handleBack = () => navigation(pathnames.hrManagement.managementList.main.path);

    const onChangeSwitch = async (value: boolean) => {
        setIsShow(value);

        const res = await managementListService.updateStatus(parseInt(employeeId), value);
        const { succeeded, message } = res;

        !succeeded && setIsShow(!value); // Failed => Status not updated

        showNotification(succeeded, message);
    };

    const fields: IField[] = [
        {
            label: 'Full Name',
            value: renderWithFallback(data?.fullName)
        },
        {
            label: 'Badge ID',
            value: renderWithFallback(data?.badgeId)
        },
        {
            label: ORG_UNITS.Project,
            value: renderWithFallback(data?.projectName)
        },
        {
            label: 'Working Status',
            value: renderWithFallback(data?.statusName)
        },
        {
            label: 'Company',
            value: renderWithFallback(data?.companyName)
        },
        {
            label: 'Position',
            value: renderWithFallback(data?.positionName)
        },
        {
            label: 'Show On Employee List',
            value: <Switch checked={isShow} onChange={onChangeSwitch} />
        }
    ];

    // Fetch detail
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res: any = await managementListService.getDetail(parseInt(employeeId));
                const { succeeded = false, data = null } = res;

                if (succeeded && data) {
                    setData(data);
                    setIsShow(data.isShow ?? false);
                }
            } catch (error) {
                showNotification(false, 'Error fetching management list detail');
            }
        };

        fetchData();
    }, [employeeId, showNotification]);

    return (
        <DetailContent>
            <BaseBreadcrumb dataItem={breadcrumb} />
            <DetailHeader pageTitle={pageTitle} buttons={buttons} goBack={handleBack} />
            <DetailInfo title="Personal Details">
                <DetailFields data={fields} />
            </DetailInfo>
        </DetailContent>
    );
};

export default ManagementListDetailPage;
