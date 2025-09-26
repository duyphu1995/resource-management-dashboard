import { selectAuth } from '@/redux/auth-slice';
import { useAppSelector } from '@/redux/store';
import employeeApi from '@/services/hr-management/employee-management';
import { IResponse } from '@/types/common';
import { ICreateComment, IHrComment } from '@/types/hr-management/employee-management';
import useNotify from '@/utils/hook/useNotify';
import { Button, Dropdown, Form, Input } from 'antd';
import { useForm } from 'antd/es/form/Form';
import React, { useState } from 'react';
import Avatar from '../../avatar';
import DialogDefault from '../default';

interface IHrCommentProps {
    hrComments: any;
    id: string;
    reloadAPIEmployee?: (params: object) => void;
    isShowModalComment: boolean;
    setIsShowModalComment: (params: boolean) => void;
    moduleName?: string;
}

const DialogViewMoreComment = (props: IHrCommentProps) => {
    const { hrComments, reloadAPIEmployee, id, isShowModalComment, setIsShowModalComment, moduleName, ...otherProps } = props;

    const [form] = useForm();
    const { showNotification } = useNotify();
    const currentUser = useAppSelector(selectAuth).currentUser;

    //Comment
    const [payloadComment, setPayloadComment] = useState<ICreateComment>();
    const [isLoadingComment, setIsLoadingComment] = useState(false);

    const handleCancelComment = () => {
        setPayloadComment(undefined);
        setIsShowModalComment(false);
        form.resetFields();
    };

    const renderContent = () => {
        const hrCommentsRevert = [...hrComments].reverse();

        //Comment
        const handleChangeComment = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const {
                target: { value }
            } = e;
            setPayloadComment({
                ...payloadComment,
                contents: value
            });
        };

        const handleShowNotifyAPI = (response: IResponse) => {
            const { succeeded, message } = response;

            if (succeeded) {
                reloadAPIEmployee?.({});
                setPayloadComment(undefined);
                form.setFieldValue('fieldComment', undefined);
            }

            showNotification(succeeded, message);
        };

        const handleEditComment = (item: ICreateComment) => {
            const { contents, commentId } = item || {};
            setPayloadComment({
                commentId,
                contents
            });
            form.setFieldValue('fieldComment', contents);
        };

        const handleDeleteComment = async (id: number) => {
            const response: IResponse = await employeeApi.deleteComment(id, moduleName);
            handleShowNotifyAPI(response);
        };

        const handleSubmitComment = async () => {
            setIsLoadingComment(true);

            let response: IResponse;
            if (payloadComment?.commentId) {
                response = await employeeApi.editComment(payloadComment, moduleName);
            } else {
                response = await employeeApi.createComment({ ...payloadComment, employeeId: parseInt(id), commentTypeId: 1 }, moduleName);
            }

            setIsLoadingComment(false);
            handleShowNotifyAPI(response);
        };

        return (
            <div>
                <div className="comment-body">
                    {hrCommentsRevert.map((item: IHrComment, index: number) => {
                        const { contents, commentId, providerName, time, providerImageUrl } = item || {};
                        return (
                            <div className="comment-item" key={`${commentId}_${index}`}>
                                <div className="header">
                                    <div className="info-user">
                                        <Avatar className="image" src={providerImageUrl} alt="avatar.png" />
                                        <span className="info-user--name">{providerName}</span>
                                        <span className="info-user--time">{time}</span>
                                    </div>
                                    <Dropdown
                                        menu={{
                                            items: [
                                                { key: `Edit_${index}`, label: 'Edit', onClick: () => handleEditComment(item) },
                                                { key: `Delete_${index}`, label: 'Delete', onClick: () => handleDeleteComment(commentId) }
                                            ]
                                        }}
                                        placement="bottomRight"
                                    >
                                        <Button type="text" className="btn-more">
                                            <img src="/media/icons/more-action-gray.svg" alt="more-vertical.svg" />
                                        </Button>
                                    </Dropdown>
                                </div>
                                <div className="content">{contents}</div>
                            </div>
                        );
                    })}
                </div>
                <Form form={form} onFinish={handleSubmitComment} className="new-comment">
                    <div className="new-comment-body">
                        <Avatar className="avatar" src={currentUser?.employeeImageUrl} />
                        <Form.Item
                            name="fieldComment"
                            htmlFor=""
                            className="input"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please enter the valid value'
                                }
                            ]}
                        >
                            <Input placeholder="Enter a comment" onChange={handleChangeComment} width={'100%'} value={payloadComment?.contents} />
                        </Form.Item>
                    </div>
                    <div className="comment-footer">
                        <Button type="default" onClick={handleCancelComment}>
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit" className="btn-submit" loading={isLoadingComment}>
                            Save
                        </Button>
                    </div>
                </Form>
            </div>
        );
    };

    return (
        <DialogDefault
            title="View More Comment"
            isShow={isShowModalComment}
            onCancel={handleCancelComment}
            content={renderContent()}
            className="dialog-comment"
            footer={null}
            {...otherProps}
        />
    );
};

export default DialogViewMoreComment;
