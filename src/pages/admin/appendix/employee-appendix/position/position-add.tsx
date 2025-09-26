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
import useNotify from '@/utils/hook/useNotify';
import icons from '@/utils/icons';
import { ButtonProps, Flex, Form, Input, InputNumber } from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const breadcrumbItems: BreadcrumbItemType[] = [
    { title: pathnames.admin.main.name },
    { title: pathnames.admin.appendix.main.name },
    { title: pathnames.admin.appendix.employeeAppendix.main.name },
    {
        title: pathnames.admin.appendix.employeeAppendix.position.main.name,
        path: pathnames.admin.appendix.employeeAppendix.position.main.path
    },
    { title: pathnames.admin.appendix.employeeAppendix.position.add.name }
];

const PositionAddPage = () => {
    const [form] = Form.useForm();
    const navigation = useNavigate();
    const { showNotification } = useNotify();

    const [loadingForm, setLoadingForm] = useState(false);
    const [warningData, setWarningData] = useState<IAdminPosition | null>(null);
    const [showWarningDialog, setShowWarningDialog] = useState(false);

    const pageTitle = pathnames.admin.appendix.employeeAppendix.position.add.name;
    const warningDialogTitle = `Can’t Create`;
    const warningDialogContent = (
        <div style={{ width: 384 }}>
            There is a valid existing position <strong>{warningData?.positionName}</strong>. Can't create a duplication position.
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
                return Promise.reject("From value shouldn't be greater than To");
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
    const onGoBack = () => navigation(pathnames.admin.appendix.employeeAppendix.position.main.path);

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

    // Handle save data
    const onFinish = async (value: IAdminPosition) => {
        try {
            setLoadingForm(true);
            const updatedData: IAdminPosition = {
                positionName: value.positionName,
                minGrade: value.minGrade,
                maxGrade: value.maxGrade,
                positionDescription: value.positionDescription
            };

            const res = await positionService.add(updatedData);
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

    const onShowWarningDialog = (position: IAdminPosition) => {
        setWarningData(position);
        setShowWarningDialog(true);
    };

    const onCloseWarningDialog = () => {
        setShowWarningDialog(false);
    };

    return (
        <DetailContent>
            <Form form={form} name="addPositionForm" requiredMark={RequiredMark} layout="vertical" onFinish={onFinish} style={{ height: '100%' }}>
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
        </DetailContent>
    );
};

export default PositionAddPage;
