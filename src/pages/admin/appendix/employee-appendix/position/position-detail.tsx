import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import DetailFields from '@/components/common/detail-management/detail-fields';
import DetailHeader from '@/components/common/detail-management/detail-header';
import DetailInfo from '@/components/common/detail-management/detail-info';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import pathnames from '@/pathnames';
import positionService from '@/services/admin/position';
import { IAdminPosition } from '@/types/admin';
import { IField } from '@/types/common';
import useLoading from '@/utils/hook/useLoading';
import { ButtonProps, Spin } from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const breadcrumbItems: BreadcrumbItemType[] = [
    { title: pathnames.admin.main.name },
    { title: pathnames.admin.appendix.main.name },
    { title: pathnames.admin.appendix.employeeAppendix.main.name },
    {
        path: pathnames.admin.appendix.employeeAppendix.position.main.path,
        title: pathnames.admin.appendix.employeeAppendix.position.main.name
    },
    { title: pathnames.admin.appendix.employeeAppendix.position.detail.name }
];

const PositionDetailPage = () => {
    const navigation = useNavigate();
    const { positionId = '' } = useParams();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [data, setData] = useState<IAdminPosition | null>(null);

    const pageTitle = pathnames.admin.appendix.employeeAppendix.position.detail.name;

    // Handle go back
    const onGoBack = () => navigation(pathnames.admin.appendix.employeeAppendix.position.main.path);
    const navigateToEditPage = () => navigation(pathnames.admin.appendix.employeeAppendix.position.edit.path + '/' + positionId);

    // Header buttons
    const buttons: ButtonProps[] = [{ type: 'primary', children: 'Edit', onClick: navigateToEditPage }];

    const fields: IField[] = [
        {
            label: 'Position',
            value: renderWithFallback(data?.positionName)
        },
        {
            label: 'Grade',
            value: 'From ' + data?.minGrade + ' to ' + data?.maxGrade
        },
        {
            label: 'Position Description',
            value: renderWithFallback(data?.positionDescription)
        }
    ];

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            turnOnLoading();
            const res = await positionService.getDetail(positionId);
            const { data, succeeded } = res;

            if (succeeded && data) setData(data);
            turnOffLoading();
        };

        fetchData();
    }, [positionId, navigation, turnOnLoading, turnOffLoading]);

    return (
        <DetailContent>
            <Spin spinning={isLoading} style={{ height: '100%' }}>
                <BaseBreadcrumb dataItem={breadcrumbItems} />
                <DetailHeader pageTitle={pageTitle} buttons={buttons} goBack={onGoBack} />

                {/* DETAIL INFO */}
                <DetailInfo>
                    <DetailFields data={fields} />
                </DetailInfo>
            </Spin>
        </DetailContent>
    );
};

export default PositionDetailPage;
