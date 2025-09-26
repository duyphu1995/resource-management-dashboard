import { Empty, Spin } from 'antd';

export interface IEmptyBoxProps {
    loading: boolean;
    isInitial?: boolean;
    imageSize?: number;
    minHeight?: number;
}

const EmptyBox = (props: IEmptyBoxProps) => {
    const { loading, isInitial = false, imageSize = 60, minHeight = 160 } = props;

    return (
        <Spin spinning={loading}>
            <Empty
                image="/media/icons/box-empty.svg"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    minHeight: minHeight
                }}
                imageStyle={{ height: imageSize, width: imageSize }}
                description={
                    <span style={{ fontSize: '14px', fontWeight: '500', lineHeight: '120%', color: '#767676' }}>
                        {isInitial ? 'Enter name to search' : 'No results found'}
                    </span>
                }
            />
        </Spin>
    );
};

export default EmptyBox;
