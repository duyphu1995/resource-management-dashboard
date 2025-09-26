import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import DetailFields from '@/components/common/detail-management/detail-fields';
import DetailHeader from '@/components/common/detail-management/detail-header';
import DetailInfo from '@/components/common/detail-management/detail-info';
import DialogCommon from '@/components/common/dialog/dialog-common/dialog-common';
import RequiredMark from '@/components/common/form/required-mark';
import pathnames from '@/pathnames';
import marketService from '@/services/admin/market';
import { IAdminMarket } from '@/types/admin';
import { IField } from '@/types/common';
import { validate500Characters, validateEnterValidValue } from '@/utils/common';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';
import icons from '@/utils/icons';
import { ButtonProps, Form, Input, Spin } from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const breadcrumbItems: BreadcrumbItemType[] = [
    { title: pathnames.admin.main.name },
    { title: pathnames.admin.appendix.main.name },
    { title: pathnames.admin.appendix.groupManagementAppendix.main.name },
    {
        path: pathnames.admin.appendix.groupManagementAppendix.market.main.path,
        title: pathnames.admin.appendix.groupManagementAppendix.market.main.name
    },
    { title: pathnames.admin.appendix.groupManagementAppendix.market.edit.name }
];

const NationalityEditPage = () => {
    const { marketplaceId = '' } = useParams();
    const { havePermission } = usePermissions('EditMarketAppendix', 'Market');
    const [form] = Form.useForm();
    const navigation = useNavigate();
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [loadingForm, setLoadingForm] = useState(false);
    const [warningData, setWarningData] = useState<IAdminMarket | null>(null);
    const [showWarningDialog, setShowWarningDialog] = useState(false);

    const pageTitle = pathnames.admin.appendix.groupManagementAppendix.market.edit.name;
    const warningDialogTitle = `Can’t Edit`;

    const warningDialogContent = (
        <div style={{ width: 384 }}>
            There is a valid existing Market <strong>{warningData?.marketplaceName}</strong>. Can't edit a duplication Market.
        </div>
    );

    const onGoBack = () => navigation(pathnames.admin.appendix.groupManagementAppendix.market.detail.path + '/' + marketplaceId);

    const buttons: ButtonProps[] = [
        { children: 'Cancel', onClick: onGoBack },
        havePermission('Edit') && { type: 'primary', htmlType: 'submit', loading: loadingForm, children: 'Save' }
    ].filter(Boolean);

    // Fields
    const fields: IField[] = [
        {
            label: 'Market Name',
            name: 'marketplaceName',
            value: <Input placeholder="Enter market name" />,
            validation: [validateEnterValidValue]
        },
        {
            label: 'Market Description',
            name: 'marketplaceDescription',
            value: <Input placeholder="Enter market description" />,
            validation: [validate500Characters]
        }
    ];

    const onFinish = async (value: IAdminMarket) => {
        try {
            setLoadingForm(true);
            const updatedData: IAdminMarket = {
                marketplaceId: parseInt(marketplaceId),
                marketplaceName: value.marketplaceName,
                marketplaceDescription: value.marketplaceDescription
            };

            const res = await marketService.update(updatedData);
            const { succeeded, message, errors } = res;

            if (succeeded) {
                onGoBack();
            } else if (errors?.some(error => error.FieldName === 'marketplaceName')) {
                onShowWarningDialog(updatedData);
                return;
            }
            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'An unexpected error occurred');
        } finally {
            setLoadingForm(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            turnOnLoading();
            try {
                const res = await marketService.getDetail(marketplaceId);
                const { data = null, succeeded = false } = res;

                if (succeeded && data) {
                    const newFormData = {
                        marketplaceName: data.marketplaceName,
                        marketplaceDescription: data.marketplaceDescription
                    };

                    form.setFieldsValue(newFormData);
                }
            } catch (error) {
                showNotification(false, 'Error fetching market detail');
            } finally {
                turnOffLoading();
            }
        };

        fetchData();
    }, [marketplaceId, form, turnOnLoading, turnOffLoading, showNotification]);

    const onShowWarningDialog = (position: IAdminMarket) => {
        setWarningData(position);
        setShowWarningDialog(true);
    };
    const onCloseWarningDialog = () => {
        setShowWarningDialog(false);
    };

    return (
        <DetailContent>
            <Spin spinning={isLoading} style={{ height: '100%' }}>
                <Form
                    form={form}
                    name="editNationalityForm"
                    requiredMark={RequiredMark}
                    layout="vertical"
                    onFinish={onFinish}
                    style={{ height: '100%' }}
                >
                    <BaseBreadcrumb dataItem={breadcrumbItems} />
                    <DetailHeader pageTitle={pageTitle} buttons={buttons} goBack={onGoBack} />

                    <DetailInfo>
                        <DetailFields data={fields} />
                    </DetailInfo>

                    <DialogCommon
                        title={warningDialogTitle}
                        icon={icons.dialog.warning}
                        content={warningDialogContent}
                        open={showWarningDialog}
                        onClose={onCloseWarningDialog}
                        buttonType="default-primary"
                        hiddenButtonLeft={true}
                        buttonRight="Close"
                        buttonRightClick={onCloseWarningDialog}
                    />
                </Form>
            </Spin>
        </DetailContent>
    );
};

export default NationalityEditPage;
