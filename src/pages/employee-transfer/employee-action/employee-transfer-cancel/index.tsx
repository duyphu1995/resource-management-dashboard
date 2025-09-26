import DetailFields from '@/components/common/detail-management/detail-fields';
import DetailInfo from '@/components/common/detail-management/detail-info';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import pathnames from '@/pathnames';
import employeeTransferService from '@/services/transfer-employee';
import { IDataBreadcrumb, IField } from '@/types/common';
import { ITransferEmployee } from '@/types/transfer-employee';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import { ButtonProps, Col, Form, Input, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TransferEmployeeInfo from '../employee-transfer-info';

const EmployeeTransferCancel = () => {
    const navigation = useNavigate();
    const { id = '' } = useParams();
    const { showNotification } = useNotify();
    const [form] = Form.useForm();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [dataDetail, setDataDetail] = useState<ITransferEmployee>();

    const breadcrumbList: IDataBreadcrumb[] = [
        { title: pathnames.home.name },
        { title: pathnames.transferEmployee.main.name, path: pathnames.transferEmployee.main.path },
        { title: pathnames.transferEmployee.cancel.name }
    ];

    const goBack = () => {
        navigation(pathnames.transferEmployee.main.path);
    };

    const buttons: ButtonProps[] = [
        {
            onClick: goBack,
            children: 'Cancel'
        },
        {
            htmlType: 'submit',
            type: 'primary',
            children: 'Cancel Transfer'
        }
    ];

    const newTransferCols: IField[] = [
        {
            label: 'Full Name',
            value: renderWithFallback(dataDetail?.fullName)
        },
        {
            label: 'Email',
            value: renderWithFallback(dataDetail?.workEmail)
        },
        {
            label: 'Current Project',
            value: renderWithFallback(dataDetail?.fromProjectName)
        },
        {
            label: 'Target Project',
            value: renderWithFallback(dataDetail?.toProjectName)
        },
        {
            label: 'Transfer Note',
            value: renderWithFallback(dataDetail?.transferNotes),
            colSpan: 12
        }
    ];

    const detailInfoSection = (
        <DetailInfo title="Transfer Information">
            <DetailFields data={newTransferCols} />
        </DetailInfo>
    );

    const approvalSection = (
        <DetailInfo title="Cancel Note">
            <Col span={12}>
                <Form.Item name="cancelNotes">
                    <Input.TextArea placeholder="Enter note" className="text-area-item" />
                </Form.Item>
            </Col>
        </DetailInfo>
    );

    const handleSubmit = async (values: any) => {
        turnOnLoading();

        values = {
            ...values,
            employeeTransferId: Number(id),
            managerId: 0,
            action: 'Cancel',
            transferNotes: dataDetail?.transferNotes,
            revokeNotes: dataDetail?.revokeNotes,
            approveNotes: dataDetail?.approveNotes,
            disApproveNotes: dataDetail?.disApproveNotes,
            employeeMaillingList: dataDetail?.employeeMaillingList,
            removeMaillingList: dataDetail?.removeMaillingList,
            revokeLabName: dataDetail?.revokeLabName,
            revokeWorkingRoomName: dataDetail?.revokeWorkingRoomName,
            revokeRestrictRoomName: dataDetail?.revokeRestrictRoomName,
            revokeConfidentialCabinetName: dataDetail?.revokeConfidentialCabinetName,
            revokeOther: dataDetail?.revokeOther,
            grantLabName: dataDetail?.grantLabName,
            grantWorkingRoomName: dataDetail?.grantWorkingRoomName,
            grantRestrictRoomName: dataDetail?.grantRestrictRoomName,
            grantConfidentialCabinetName: dataDetail?.grantConfidentialCabinetName,
            grantOther: dataDetail?.grantOther
        };

        if (values) {
            const res = await employeeTransferService.updateTransfer(values, 'CancelTransferDetails');
            const { succeeded, message = '' } = res;

            if (succeeded) navigation(pathnames.transferEmployee.main.path);
            showNotification(succeeded, message);
        }

        turnOffLoading();
    };

    useEffect(() => {
        const getDataEmployeeTransferDetail = async () => {
            try {
                const res = await employeeTransferService.getEmployeeTransferDetail(id);
                const { data, succeeded } = res;

                if (succeeded && data) {
                    setDataDetail(data);
                }
            } catch (error) {
                showNotification(false, 'get transfer detail failed');
            }
        };

        getDataEmployeeTransferDetail();
    }, [id, showNotification]);

    return (
        <Spin spinning={isLoading}>
            <TransferEmployeeInfo
                breadcrumb={breadcrumbList}
                pageTitle="Cancel Transfer"
                detailInfoSection={detailInfoSection}
                approvalSection={approvalSection}
                buttons={buttons}
                name="cancel_transfer_form"
                handleSubmit={handleSubmit}
                form={form}
            />
        </Spin>
    );
};

export default EmployeeTransferCancel;
