import pathnames from '@/pathnames';
import spanOfControlReport, { ReportType } from '@/services/reports/span-of-control-index-report';
import { ISpanOfControlReport } from '@/types/reports/span-of-control-report';
import useLoading from '@/utils/hook/useLoading';
import { Col, Row, Skeleton, Typography } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PieChartCard from './pie-chart-card';

const TabDepartment = () => {
    const navigation = useNavigate();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [data, setData] = useState<any[]>([]);
    const { Title } = Typography;

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

    const sortReportData = useCallback((data: ISpanOfControlReport[]) => {
        const order = ['Staff', 'SME', 'Management'];
        return data.map(item => ({
            ...item,
            data: item.data.sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type))
        }));
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            turnOnLoading();
            const { data, succeeded } = await spanOfControlReport.getData(ReportType.Department);
            if (succeeded && data) {
                setData(sortReportData(data));
            }
            turnOffLoading();
        };
        fetchData();
    }, [navigation, turnOnLoading, turnOffLoading, sortReportData]);

    return (
        <Skeleton loading={isLoading}>
            <Title level={4}>Department</Title>
            <Row>
                {data.map((item, index) => (
                    <Col key={index} span={index === 0 ? 24 : 12}>
                        <PieChartCard data={item.data} title={item.title} onLegendClick={i => navigateToListPage(item, i)} />
                    </Col>
                ))}
            </Row>
        </Skeleton>
    );
};

export default TabDepartment;
