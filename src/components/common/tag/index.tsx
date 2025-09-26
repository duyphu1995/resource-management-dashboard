import { Tag, TagProps } from 'antd';

interface BaseTagProps extends TagProps {
    statusName: string;
    colorBg: string;
    colorText: string;
    colorBr: string;
}

const BaseTag = (props: BaseTagProps) => {
    const { statusName, colorBg, colorText, colorBr, ...otherProps } = props;

    return (
        <Tag
            style={{ color: colorText, border: `1px solid ${colorBr}`, borderRadius: '16px', backgroundColor: colorBg, fontWeight: 500 }}
            {...otherProps}
        >
            {statusName}
        </Tag>
    );
};

export default BaseTag;
