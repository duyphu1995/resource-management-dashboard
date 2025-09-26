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

export interface IOnsiteInfoProps<T> {
    pageTitle: string;
    breadcrumbData?: T[];
    goBack: () => void;
    buttons: ButtonProps[];
    data: IInfoSection[];
    sectionExpense?: ReactNode;
    form?: FormInstance<T>;
    onSubmitForm?: () => void;
}

const OnsiteInfo = <T extends AnyObject>(props: IOnsiteInfoProps<T>) => {
    const { pageTitle, breadcrumbData, goBack, buttons, data, sectionExpense, form, onSubmitForm } = props;

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
        <Form form={form} name="edit_onsite_info" layout="vertical" onFinish={onSubmitForm} requiredMark={RequiredMark}>
            <DetailContent rootClassName="layout-onsite">
                {breadcrumbData && <BaseBreadcrumb dataItem={breadcrumbData} />}
                <DetailHeader pageTitle={pageTitle} buttons={buttons} goBack={goBack} />

                <div className="box-content-container">
                    {renderBoxFormGroup(data)}
                    {sectionExpense}
                </div>
            </DetailContent>
        </Form>
    );
};

export default OnsiteInfo;
