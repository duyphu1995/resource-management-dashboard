import { UserOutlined } from '@ant-design/icons';
import { Avatar as AntdAvatar, AvatarProps } from 'antd';

export interface IAvatarProps extends AvatarProps {
    size?: number;
    onMouseDown?: (event: MouseEvent) => void;
}

const Avatar = (props: IAvatarProps) => {
    const size = props.size || 32;

    return <AntdAvatar {...props} size={size} style={{ minWidth: size }} icon={<UserOutlined />} />;
};

export default Avatar;
