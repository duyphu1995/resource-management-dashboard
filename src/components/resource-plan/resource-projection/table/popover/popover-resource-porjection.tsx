import { ConfigProvider, Popover } from 'antd';
import './popover-resource-projection.scss';

const PopoverResourceProjection = (props: any) => {
    const { header, detail, value } = props;

    const title = (
        <>
            Resource Projection Note in {header} of {detail[0].dcName}
        </>
    );

    const content = (
        <>
            {detail?.map((item: any) => {
                return (
                    <div key={item.month} className="infor-report">
                        <div>{item.noteBillable}</div>
                        <div>{item.noteResignation}</div>
                        <div>{item.noteResourceRotation}</div>
                        <div>{item.noteJobOffered}</div>
                    </div>
                );
            })}
        </>
    );

    return (
        <ConfigProvider>
            <Popover placement="bottomLeft" title={title} content={content} arrow={false} className="popover">
                {value}
            </Popover>
        </ConfigProvider>
    );
};

export default PopoverResourceProjection;
