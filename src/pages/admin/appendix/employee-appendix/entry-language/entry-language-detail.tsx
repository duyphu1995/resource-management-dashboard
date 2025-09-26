import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import DetailFields from '@/components/common/detail-management/detail-fields';
import DetailHeader from '@/components/common/detail-management/detail-header';
import DetailInfo from '@/components/common/detail-management/detail-info';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import pathnames from '@/pathnames';
import entryLanguageService from '@/services/admin/entry-language';
import { IAdminEntryLanguage } from '@/types/admin';
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
        title: pathnames.admin.appendix.employeeAppendix.entryLanguage.main.name,
        path: pathnames.admin.appendix.employeeAppendix.entryLanguage.main.path
    },
    { title: pathnames.admin.appendix.employeeAppendix.entryLanguage.detail.name }
];

const EntryLanguageDetail = () => {
    const { id = '' } = useParams();
    const navigation = useNavigate();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [data, setData] = useState<IAdminEntryLanguage | null>(null);

    const pageTitle = pathnames.admin.appendix.employeeAppendix.entryLanguage.detail.name;

    const onGoBack = () => navigation(pathnames.admin.appendix.employeeAppendix.entryLanguage.main.path);
    const navigateToEditPage = () => navigation(pathnames.admin.appendix.employeeAppendix.entryLanguage.edit.path + '/' + id);

    const buttons: ButtonProps[] = [{ type: 'primary', children: 'Edit', onClick: navigateToEditPage }];

    const fields: IField[] = [
        {
            label: 'Entry Language Name',
            value: renderWithFallback(data?.entryLanguageName)
        }
    ];

    useEffect(() => {
        const fetchData = async () => {
            turnOnLoading();
            const res = await entryLanguageService.getDetail(id);
            const { data, succeeded } = res;

            if (succeeded && data) setData(data);
            turnOffLoading();
        };

        fetchData();
    }, [id, navigation, turnOnLoading, turnOffLoading]);

    return (
        <DetailContent>
            <Spin spinning={isLoading} style={{ height: '100%' }}>
                <BaseBreadcrumb dataItem={breadcrumbItems} />
                <DetailHeader pageTitle={pageTitle} buttons={buttons} goBack={onGoBack} />

                <DetailInfo>
                    <DetailFields data={fields} />
                </DetailInfo>
            </Spin>
        </DetailContent>
    );
};

export default EntryLanguageDetail;
