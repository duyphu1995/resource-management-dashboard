import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import DetailFields from '@/components/common/detail-management/detail-fields';
import DetailHeader from '@/components/common/detail-management/detail-header';
import DetailInfo from '@/components/common/detail-management/detail-info';
import DialogCommon from '@/components/common/dialog/dialog-common/dialog-common';
import RequiredMark from '@/components/common/form/required-mark';
import pathnames from '@/pathnames';
import languageCertificationService from '@/services/admin/language-certification';
import { IAdminRanking } from '@/types/admin';
import { IField } from '@/types/common';
import { validateEnterValidValue } from '@/utils/common';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import icons from '@/utils/icons';
import { ButtonProps, Form, Input, Spin } from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const breadcrumbItems: BreadcrumbItemType[] = [
    { title: pathnames.admin.main.name },
    { title: pathnames.admin.appendix.main.name },
    { title: pathnames.admin.appendix.employeeAppendix.main.name },
    { title: pathnames.admin.appendix.employeeAppendix.languageCertification.main.name },
    { title: pathnames.admin.appendix.employeeAppendix.languageCertification.editLevel.name }
];

const LevelEditPage = () => {
    const { showNotification } = useNotify();
    const navigation = useNavigate();
    const { id = '' } = useParams();
    const [form] = Form.useForm();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [warningData, setWarningData] = useState<IAdminRanking | null>(null);
    const [showWarningDialog, setShowWarningDialog] = useState(false);
    const [loadingForm, setLoadingForm] = useState(false);

    const pageTitle = pathnames.admin.appendix.employeeAppendix.languageCertification.editLevel.name;
    const warningDialogTitle = `Can’t Edit`;
    const warningDialogContent = (
        <div style={{ width: 384 }}>
            There is a valid existing Level <strong>{warningData?.rankName}</strong>. Can't edit a duplication Level.
        </div>
    );

    const onGoBack = () => navigation(pathnames.admin.appendix.employeeAppendix.languageCertification.detailLevel.path + '/' + id);

    const buttons: ButtonProps[] = [
        { children: 'Cancel', onClick: onGoBack },
        { type: 'primary', htmlType: 'submit', loading: loadingForm, children: 'Save' }
    ];

    const fields: IField[] = [
        {
            label: 'Level Name',
            name: 'rankName',
            value: <Input placeholder="Enter level name" />,
            validation: [validateEnterValidValue]
        }
    ];

    const onFinish = async (value: IAdminRanking) => {
        try {
            setLoadingForm(true);
            const updatedData: IAdminRanking = {
                rankId: parseInt(id),
                rankName: value.rankName
            };

            const res = await languageCertificationService.updateLevel(updatedData);
            const { succeeded, message, errors } = res;

            if (succeeded) {
                onGoBack();
            } else if (errors?.some(error => error.FieldName === 'rankName')) {
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

    const onShowWarningDialog = (position: IAdminRanking) => {
        setWarningData(position);
        setShowWarningDialog(true);
    };
    const onCloseWarningDialog = () => {
        setShowWarningDialog(false);
    };

    useEffect(() => {
        const fetchData = async () => {
            turnOnLoading();
            const res = await languageCertificationService.getDetailLevel(id);
            const { data, succeeded } = res;

            if (succeeded && data) {
                const newFormData = {
                    rankName: data.rankName
                };

                form.setFieldsValue(newFormData);
            }
            turnOffLoading();
        };

        fetchData();
    }, [id, form, navigation, turnOnLoading, turnOffLoading]);

    return (
        <DetailContent>
            <Spin spinning={isLoading}>
                <Form form={form} name="editLevelForm" requiredMark={RequiredMark} layout="vertical" onFinish={onFinish} style={{ height: '100%' }}>
                    <BaseBreadcrumb dataItem={breadcrumbItems} />
                    <DetailHeader pageTitle={pageTitle} buttons={buttons} goBack={onGoBack} />

                    {/* DETAIL INFO */}
                    <DetailInfo>
                        <DetailFields data={fields} />
                    </DetailInfo>

                    {/* DIALOG */}
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

export default LevelEditPage;
