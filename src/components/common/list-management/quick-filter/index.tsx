import { IQuickFilterData } from '@/types/quick-filter';
import { Dropdown } from 'antd';
import { useState } from 'react';
import Loading from '../../loading';
import './index.scss';

interface IQuickFilterProps {
    data: IQuickFilterData[];
    loading: boolean;
    activeData: IQuickFilterData | undefined;
    onChangeActiveData: (value: IQuickFilterData) => void;

    setUpdatedData: (value: IQuickFilterData | undefined) => void;
    setShowUpdateModal: (value: boolean) => void;

    setDeletedData: (value: IQuickFilterData | undefined) => void;
    setShowDeleteModal: (value: boolean) => void;
}

const MoreActionIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.5 11.5C10.5 10.6716 11.1716 10 12 10C12.8284 10 13.5 10.6716 13.5 11.5C13.5 12.3284 12.8284 13 12 13C11.1716 13 10.5 12.3284 10.5 11.5Z"
            fill="#848484"
        />
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.5 5C10.5 4.17157 11.1716 3.5 12 3.5C12.8284 3.5 13.5 4.17157 13.5 5C13.5 5.82843 12.8284 6.5 12 6.5C11.1716 6.5 10.5 5.82843 10.5 5Z"
            fill="#848484"
        />
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.5 18.5C10.5 17.6716 11.1716 17 12 17C12.8284 17 13.5 17.6716 13.5 18.5C13.5 19.3284 12.8284 20 12 20C11.1716 20 10.5 19.3284 10.5 18.5Z"
            fill="#848484"
        />
    </svg>
);

const QuickFilter = (props: IQuickFilterProps) => {
    const {
        data,
        loading,
        activeData,
        onChangeActiveData,

        setUpdatedData,
        setShowUpdateModal,

        // Delete
        setDeletedData,
        setShowDeleteModal
    } = props;

    const onShowUpdateModal = (value: IQuickFilterData) => {
        setUpdatedData({ ...value });
        setShowUpdateModal(true);
    };

    const onShowDeleteModal = (value: IQuickFilterData) => {
        setShowDeleteModal(true);
        setDeletedData(value);
    };

    const [openQuickFilterAction, setOpenQuickFilterAction] = useState<number | null>();

    return (
        <div className="quick-filter">
            <div className="quick-filter-header">
                <div className="quick-filter-header-title">Quick Filter</div>
            </div>

            <div className="quick-filter-body">
                {loading ? (
                    <Loading type="component" />
                ) : (
                    data.map(item => (
                        <div
                            key={item.quickFilterId}
                            className={'quick-filter-item' + (activeData?.quickFilterId === item.quickFilterId ? ' is-active' : '')}
                        >
                            <div className="quick-filter-item-content" onClick={() => onChangeActiveData(item)}>
                                {item.quickFilterName}
                            </div>
                            <div className="quick-filter-item-button">
                                <Dropdown
                                    menu={{
                                        items: [
                                            {
                                                label: 'Rename',
                                                key: 'rename',
                                                onClick: () => {
                                                    setOpenQuickFilterAction(null);
                                                    onShowUpdateModal(item);
                                                }
                                            },
                                            {
                                                label: 'Delete',
                                                key: 'delete',
                                                onClick: () => {
                                                    setOpenQuickFilterAction(null);
                                                    onShowDeleteModal(item);
                                                }
                                            }
                                        ]
                                    }}
                                    trigger={['click']}
                                    placement="bottomRight"
                                    open={openQuickFilterAction === item.quickFilterId}
                                    onOpenChange={open => setOpenQuickFilterAction(open ? item.quickFilterId : null)}
                                    getPopupContainer={node => node.parentNode as HTMLElement}
                                >
                                    <div>{MoreActionIcon}</div>
                                </Dropdown>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default QuickFilter;
