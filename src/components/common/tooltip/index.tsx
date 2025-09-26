import icons from '@/utils/icons';
import { Tooltip } from 'antd';
import { AbstractTooltipProps } from 'antd/es/tooltip';
import { ReactNode } from 'react';

interface IToolTipProps extends AbstractTooltipProps {
    title?: string | ReactNode;
    icon?: string;
    onClick?: (value: any) => void;
}

const BaseToolTip = (props: IToolTipProps) => {
    const { title, icon = icons.infoTooltip.info_gray, onClick, ...otherProps } = props;

    return (
        <Tooltip title={title} {...otherProps}>
            <img onClick={onClick} src={icon} alt="info" style={{ width: 16, height: 16 }} />
        </Tooltip>
    );
};

export default BaseToolTip;
