import { Button, ButtonProps, Dropdown, MenuProps, Tooltip } from 'antd';
import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';

export interface IButtonIconBase extends ButtonProps {
    link?: string;
    target?: React.HTMLAttributeAnchorTarget | undefined;
    icon: string;
    iconAlt?: string;
    iconWidth?: number;
    iconHeight?: number;
    tooltip?: string;
    menu?: MenuProps;
}

export interface IButtonIconTooltip extends IButtonIconBase {
    tooltip?: string;
    placement?: 'top' | 'bottom' | 'left' | 'right';
    menu?: undefined;
}

export interface IButtonIconDropdown extends IButtonIconBase {
    tooltip?: undefined;
    placement?: 'top' | 'bottom' | 'left' | 'right';
    menu: MenuProps;
}

export type IButtonIconProps = IButtonIconTooltip | IButtonIconDropdown;

const ButtonIcon = (props: IButtonIconProps) => {
    const { link, target, menu, tooltip, placement = 'top', icon, iconAlt, iconWidth = 20, iconHeight = 20, ...buttonProps } = props;
    const Container = menu ? Dropdown : Fragment;

    const button = (
        <Button className="button-icon" type="text" style={{ minWidth: iconWidth }} {...buttonProps}>
            <img src={icon} alt={iconAlt} width={iconWidth} height={iconHeight} />
        </Button>
    );

    return (
        <Tooltip title={tooltip} placement={placement}>
            {link ? (
                <Link to={link} target={target}>
                    <Container {...(menu && { menu })}>{button}</Container>
                </Link>
            ) : (
                <Container {...(menu && { menu })}>{button}</Container>
            )}
        </Tooltip>
    );
};

export default ButtonIcon;
