import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import DetailHeader from '@/components/common/detail-management/detail-header';
import RequiredMark from '@/components/common/form/required-mark';
import pathnames from '@/pathnames';
import { ButtonProps, Form, FormInstance, FormProps } from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface IEmployeeTransferInfoProps extends FormProps {
    breadcrumb: BreadcrumbItemType[];
    pageTitle: string;
    detailInfoSection: ReactNode;
    adminInfoSection?: ReactNode;
    approvalSection: ReactNode;
    buttons?: ButtonProps[];
    handleSubmit?: (params: any) => void;
    form?: FormInstance;
}

const TransferEmployeeInfo = (props: IEmployeeTransferInfoProps) => {
    const { breadcrumb, pageTitle, buttons, detailInfoSection, adminInfoSection, approvalSection, handleSubmit, name, form, className } = props;
    const navigation = useNavigate();

    const goBack = () => {
        navigation(pathnames.transferEmployee.main.path);
    };

    const onFinish = (values: any) => {
        handleSubmit?.(values);
        form?.resetFields();
    };

    return (
        <DetailContent rootClassName={`employee-transfer-add ${className || ''}`}>
            <Form form={form} name={name} layout="vertical" requiredMark={RequiredMark} onFinish={onFinish}>
                <BaseBreadcrumb dataItem={breadcrumb} />
                <DetailHeader pageTitle={pageTitle} buttons={buttons} goBack={goBack} />
                <div className="box-content-container">
                    {detailInfoSection}
                    {adminInfoSection}
                    {approvalSection}
                </div>
            </Form>
        </DetailContent>
    );
};

export default TransferEmployeeInfo;
