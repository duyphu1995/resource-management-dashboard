import ButtonIcon, { IButtonIconProps } from './button-icon';
import './index.scss';

export interface IButtonsIconProps {
    items: (IButtonIconProps | undefined)[];
}

const ButtonsIcon = (props: IButtonsIconProps) => {
    const { items } = props;
    const className = 'buttons-icon';

    return (
        <div className={className}>
            {items.map((item, index) => (item ? <ButtonIcon key={index} {...item} /> : <div className="table-action" key={index}></div>))}
        </div>
    );
};

export default ButtonsIcon;
