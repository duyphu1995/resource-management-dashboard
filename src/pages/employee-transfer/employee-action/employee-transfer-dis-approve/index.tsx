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

const EmployeeTransferDisApproval = () => {
    const navigation = useNavigate();
    const { id = '' } = useParams();
    const { showNotification } = useNotify();
    const [form] = Form.useForm();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [dataDetail, setDataDetail] = useState<ITransferEmployee>();

    const breadcrumbList: IDataBreadcrumb[] = [
        { title: pathnames.home.name },
        { title: pathnames.transferEmployee.main.name, path: pathnames.transferEmployee.main.path },
        { title: pathnames.transferEmployee.disApproval.name }
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
            children: 'Disapprove'
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
        <DetailInfo title="Disapproval Note">
            <Col span={12}>
                <Form.Item name="disApproveNotes">
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
            action: 'DisApprove',
            approveNotes: dataDetail?.approveNotes,
            transferNotes: dataDetail?.transferNotes,
            revokeNotes: dataDetail?.revokeNotes,
            cancelNotes: dataDetail?.cancelNotes,
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
            const res = await employeeTransferService.updateTransfer(values, 'DisApprovalTransferDetails');
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
                showNotification(false, 'get employee transfer detail failed');
            }
        };

        getDataEmployeeTransferDetail();
    }, [id, showNotification]);

    return (
        <Spin spinning={isLoading}>
            <TransferEmployeeInfo
                breadcrumb={breadcrumbList}
                pageTitle="Disapprove Transfer"
                detailInfoSection={detailInfoSection}
                approvalSection={approvalSection}
                buttons={buttons}
                name="transfer_form_dis_approval"
                handleSubmit={handleSubmit}
                form={form}
            />
        </Spin>
    );
};

export default EmployeeTransferDisApproval;
