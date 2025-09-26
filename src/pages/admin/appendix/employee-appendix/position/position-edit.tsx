import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import DetailFields from '@/components/common/detail-management/detail-fields';
import DetailHeader from '@/components/common/detail-management/detail-header';
import DetailInfo from '@/components/common/detail-management/detail-info';
import DialogCommon from '@/components/common/dialog/dialog-common/dialog-common';
import RequiredMark from '@/components/common/form/required-mark';
import pathnames from '@/pathnames';
import positionService from '@/services/admin/position';
import { IAdminPosition } from '@/types/admin';
import { IField } from '@/types/common';
import { validateEnterValidValue } from '@/utils/common';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import icons from '@/utils/icons';
import { ButtonProps, Flex, Form, Input, InputNumber, Spin } from 'antd';
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
    { title: pathnames.admin.appendix.employeeAppendix.position.edit.name }
];

const PositionEditPage = () => {
    const { positionId = '' } = useParams();
    const [form] = Form.useForm();
    const navigation = useNavigate();
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [warningData, setWarningData] = useState<IAdminPosition | null>(null);
    const [showWarningDialog, setShowWarningDialog] = useState(false);
    const [loadingForm, setLoadingForm] = useState(false);

    const pageTitle = pathnames.admin.appendix.employeeAppendix.position.edit.name;
    const warningDialogTitle = `Can’t Edit`;

    const warningDialogContent = (
        <div style={{ width: 384 }}>
            There is a valid existing position <b>{warningData?.positionName}</b>. Can't edit a duplication position.
        </div>
    );

    // Watch min grade, max grade and validate
    const watchMinGrade = Form.useWatch('minGrade', form);
    const watchMaxGrade = Form.useWatch('maxGrade', form);

    const validateGrade = () => ({
        validator() {
            if (!watchMinGrade || !watchMaxGrade) {
                return Promise.reject('');
            }
            // Always resolve to ensure visual feedback is shown
            if ((watchMinGrade && !watchMaxGrade) || (!watchMinGrade && watchMaxGrade)) {
                return Promise.reject('');
            }
            if (watchMinGrade >= watchMaxGrade) {
                return Promise.reject('');
            }
            return Promise.resolve();
        }
    });

    const validateField = () => ({
        required: true,
        validator() {
            if (!watchMinGrade && !watchMaxGrade) {
                return Promise.reject('Please enter valid value');
            }
            if ((watchMinGrade && !watchMaxGrade) || (!watchMinGrade && watchMaxGrade)) {
                return Promise.reject('Please enter valid value');
            }
            if (watchMinGrade >= watchMaxGrade) {
                return Promise.reject("From value shouldn't be greater than To value");
            }
            return Promise.resolve();
        }
    });

    // Validate minGrade and maxGrade when they have been updated
    const onChangeGrade = () => {
        form.validateFields(['minGrade', 'maxGrade']);
        form.validateFields(['grade']);
    };

    // Handle go back
    const onGoBack = () => navigation(pathnames.admin.appendix.employeeAppendix.position.detail.path + '/' + positionId);

    // Header buttons
    const buttons: ButtonProps[] = [
        { children: 'Cancel', onClick: onGoBack },
        { type: 'primary', htmlType: 'submit', loading: loadingForm, children: 'Save' }
    ];

    // Fields
    const fields: IField[] = [
        {
            label: 'Position',
            name: 'positionName',
            value: <Input placeholder="Enter position" />,
            validation: [validateEnterValidValue]
        },
        {
            label: 'Grade',
            name: 'grade',
            value: (
                <Flex gap={4} align="center">
                    <Form.Item name={'minGrade'} style={{ flex: 1 }} rules={[validateGrade]}>
                        <InputNumber placeholder="From" className="w-100" min={0} step={1} precision={0} onChange={onChangeGrade} />
                    </Form.Item>
                    -
                    <Form.Item name={'maxGrade'} style={{ flex: 1 }} rules={[validateGrade]}>
                        <InputNumber placeholder="To" className="w-100" min={0} step={1} precision={0} onChange={onChangeGrade} />
                    </Form.Item>
                </Flex>
            ),
            validation: [validateField]
        },
        {
            label: 'Position Description',
            name: 'positionDescription',
            value: <Input placeholder="Enter position description" />
        }
    ];

    const onShowWarningDialog = (position: IAdminPosition) => {
        setWarningData(position);
        setShowWarningDialog(true);
    };
    const onCloseWarningDialog = () => {
        setShowWarningDialog(false);
    };

    // Handle save data
    const onFinish = async (value: IAdminPosition) => {
        try {
            setLoadingForm(true);
            const updatedData: IAdminPosition = {
                positionId: parseInt(positionId),
                positionName: value.positionName,
                minGrade: value.minGrade,
                maxGrade: value.maxGrade,
                positionDescription: value.positionDescription
            };

            const res = await positionService.update(updatedData);
            const { succeeded, message, errors } = res;

            if (succeeded) {
                onGoBack();
            } else if (errors && errors.findIndex(error => error.FieldName === 'positionName') >= 0) {
                // If position is exists in DB then show warning dialog
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

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            turnOnLoading();
            try {
                const res = await positionService.getDetail(positionId);
                const { data, succeeded } = res;

                if (succeeded && data) {
                    const newFormData = {
                        positionName: data.positionName,
                        minGrade: data.minGrade,
                        maxGrade: data.maxGrade,
                        positionDescription: data.positionDescription,
                        grade: data.minGrade + '-' + data.maxGrade
                    };

                    form.setFieldsValue(newFormData);
                }
            } catch (error) {
                showNotification(false, 'Error fetching position detail');
            } finally {
                turnOffLoading();
            }
        };

        fetchData();
    }, [positionId, form, turnOnLoading, turnOffLoading, showNotification]);

    return (
        <DetailContent>
            <Spin spinning={isLoading} style={{ height: '100%' }}>
                <Form form={form} name="editPositionForm" requiredMark={RequiredMark} layout="vertical" onFinish={onFinish}>
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

export default PositionEditPage;
