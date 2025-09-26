import pathnames from '@/pathnames';
import spanOfControlReport, { ReportType } from '@/services/reports/span-of-control-index-report';
import { ISpanOfControlReport } from '@/types/reports/span-of-control-report';
import useLoading from '@/utils/hook/useLoading';
import { Col, Row, Skeleton, Typography } from 'antd';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PieChartCard from './pie-chart-card';

const TabDelivery = () => {
    const navigation = useNavigate();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();
    const [delivery, setDelivery] = useState<ISpanOfControlReport[]>([]);
    const { Title } = Typography;

    const sortReportData = useCallback((data: ISpanOfControlReport[]) => {
        const order = ['Staff', 'SME', 'Management'];
        return data.map(item => ({
            ...item,
            data: item.data.sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type))
        }));
    }, []);

    const fetchDeliveryData = useCallback(async () => {
        turnOnLoading();
        const { data, succeeded } = await spanOfControlReport.getData(ReportType.Delivery);
        if (succeeded && data) {
            setDelivery(sortReportData(data));
        }
        turnOffLoading();
    }, [sortReportData, turnOnLoading, turnOffLoading]);

    useEffect(() => {
        fetchDeliveryData();
    }, [fetchDeliveryData]);

    const navigateToListPage = useCallback(
        (item: ISpanOfControlReport, index: number) => {
            const targetPath = `${pathnames.reports.spansOfControlReport.spanOfControlList.path}`;
            navigation(targetPath, {
                state: {
                    unitId: item.unitId,
                    name: item.title,
                    typeName: item.data[index].type
                }
            });
        },
        [navigation]
    );

    return (
        <Skeleton loading={isLoading}>
            <Title level={4}>Delivery</Title>
            <Row>
                {delivery.map((item, index) => (
                    <Col key={index} span={index === 0 ? 24 : 12}>
                        <PieChartCard data={item.data} title={item.title} onLegendClick={i => navigateToListPage(item, i)} />
                    </Col>
                ))}
            </Row>
        </Skeleton>
    );
};

export default TabDelivery;
