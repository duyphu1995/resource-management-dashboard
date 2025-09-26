import Avatar from '@/components/common/avatar';
import { selectAuth } from '@/redux/auth-slice';
import { useAppSelector } from '@/redux/store';
import employeeApi from '@/services/hr-management/employee-management';
import { IResponse } from '@/types/common';
import { ICreateComment, INormalUserComment } from '@/types/hr-management/employee-management';
import { validate1000Characters } from '@/utils/common';
import useGetNameFromUrl from '@/utils/hook/useGetNameFromUrl';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';
import { Button, Dropdown, Form, Input } from 'antd';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './index.scss';

const Comment = ({ moduleName }: { moduleName?: string }) => {
    const [form] = Form.useForm();
    const { id = '' } = useParams();
    const currentUser = useAppSelector(selectAuth).currentUser;
    const { showNotification } = useNotify();
    const { turnOnLoading, turnOffLoading } = useLoading();
    const nameFromUrl = useGetNameFromUrl();

    const [isReload, setIsReload] = useState<object>();

    // Permission
    const { havePermission } = usePermissions('Comment', nameFromUrl);

    const [normalUserComments, setNormalUserComments] = useState<INormalUserComment[]>([]);
    const [payloadComment, setPayloadComment] = useState<ICreateComment>();

    useEffect(() => {
        turnOnLoading();
        const getComments = async () => {
            try {
                const response = await employeeApi.getComments(id, 2, moduleName);
                const { succeeded, data, message } = response;
                if (succeeded && data) {
                    setNormalUserComments(data);
                }

                if (!succeeded) {
                    showNotification(false, message);
                }
            } catch (error) {
                showNotification(false, 'Get data failed');
            } finally {
                turnOffLoading();
            }
        };

        getComments();
    }, [id, showNotification, turnOnLoading, turnOffLoading, isReload, moduleName]);

    const handleEditComment = (item: INormalUserComment) => {
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
        let response: IResponse;
        if (payloadComment?.commentId) {
            response = await employeeApi.editComment(payloadComment, moduleName);
        } else {
            response = await employeeApi.createComment({ ...payloadComment, employeeId: parseInt(id || ''), commentTypeId: 2 }, moduleName);
        }

        handleShowNotifyAPI(response);
    };

    const handleShowNotifyAPI = (response: IResponse) => {
        const { succeeded, message = '' } = response;

        if (succeeded) {
            setPayloadComment(undefined);
            form.setFieldValue('fieldComment', undefined);
            setIsReload?.({});
        }
        showNotification(succeeded, message);
    };

    const handleChangeComment = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {
            target: { value }
        } = e;
        setPayloadComment({
            ...payloadComment,
            contents: value
        });
    };

    return (
        <div className="comments">
            {normalUserComments?.map((item: INormalUserComment, index: number) => {
                const { contents, commentId, providerName, providerId, time, providerImageUrl } = item || {};

                return (
                    <div className="comments__item" key={`${commentId}_${index}`}>
                        <div className="comments__item-header">
                            <div className="comments__info-user">
                                <Avatar className="image" src={providerImageUrl} alt="avatar.png" />
                                <span className="comments__info-user--name">{providerName}</span>
                                <span className="comments__info-user--time">{time}</span>
                            </div>
                            {providerId === currentUser?.employeeId && (
                                <Dropdown
                                    menu={{
                                        items: [
                                            ...(havePermission('Edit')
                                                ? [{ key: `Edit_${index}`, label: 'Edit', onClick: () => handleEditComment(item) }]
                                                : []),
                                            ...(havePermission('Delete')
                                                ? [{ key: `Delete_${index}`, label: 'Delete', onClick: () => handleDeleteComment(commentId) }]
                                                : [])
                                        ]
                                    }}
                                    placement="bottomRight"
                                >
                                    <Button type="text" className="btn-more">
                                        <img src="/media/icons/more-action-gray.svg" alt="more-vertical.svg" />
                                    </Button>
                                </Dropdown>
                            )}
                        </div>
                        <div className="comments__content">{contents}</div>
                    </div>
                );
            })}
            <Form form={form} onFinish={handleSubmitComment} className="form-add">
                <div className="form-add__body">
                    <Avatar className="image image--add" src={currentUser?.employeeImageUrl} alt="avatar.png" />
                    <Form.Item name="fieldComment" className="form-add__input" rules={[validate1000Characters]}>
                        <Input placeholder="Enter a comment" onChange={handleChangeComment} value={payloadComment?.contents} />
                    </Form.Item>
                </div>
                {havePermission('Add') && (
                    <Button type="primary" htmlType="submit" className="btn-submit" disabled={!payloadComment?.contents?.length}>
                        Save
                    </Button>
                )}
            </Form>
        </div>
    );
};

export default Comment;
