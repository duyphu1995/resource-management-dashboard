import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import DetailFields from '@/components/common/detail-management/detail-fields';
import DetailHeader from '@/components/common/detail-management/detail-header';
import DetailInfo from '@/components/common/detail-management/detail-info';
import RequiredMark from '@/components/common/form/required-mark';
import { IInfoSection } from '@/types/hr-management/onsite-management';
import { ButtonProps, Form, FormInstance } from 'antd';
import { AnyObject } from 'antd/es/_util/type';
import { ReactNode } from 'react';

export interface IDocumentInfoProps<T> {
    pageTitle: string;
    breadcrumbData?: T[];
    goBack: () => void;
    buttons: ButtonProps[];
    data: IInfoSection[];
    sectionDocument?: ReactNode;
    form?: FormInstance<T>;
    onSubmitForm?: () => void;
}

const DocumentInfo = <T extends AnyObject>(props: IDocumentInfoProps<T>) => {
    const { pageTitle, breadcrumbData, goBack, buttons, data, sectionDocument, form, onSubmitForm } = props;

    const renderBoxFormGroup = (data: IInfoSection[]) => {
        return data.map((item, index) => {
            const { title, columns } = item;

            return (
                <DetailInfo title={title} key={index}>
                    <DetailFields data={columns} />
                </DetailInfo>
            );
        });
    };

    return (
        <Form form={form} name="document_info" layout="vertical" onFinish={onSubmitForm} requiredMark={RequiredMark}>
            <DetailContent rootClassName="layout-document">
                {breadcrumbData && <BaseBreadcrumb dataItem={breadcrumbData} />}
                <DetailHeader pageTitle={pageTitle} buttons={buttons} goBack={goBack} />

                <div className="box-content-container">
                    {renderBoxFormGroup(data)}

                    <DetailInfo title="Document information">{sectionDocument}</DetailInfo>
                </div>
            </DetailContent>
        </Form>
    );
};

export default DocumentInfo;
