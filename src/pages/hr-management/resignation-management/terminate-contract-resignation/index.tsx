import PrintEditor from '@/components/common/print-editor';
import TerminateEmploymentContract from '@/components/hr-management/resignation-management/terminate-contract-resignation/terminateEmploymentContract';
import TerminateProbationaryContract from '@/components/hr-management/resignation-management/terminate-contract-resignation/terminateProbationaryContract';
import pathnames from '@/pathnames';
import resignationService from '@/services/hr-management/resignation-management';
import { IResignation } from '@/types/hr-management/resignation-management';
import dayjs from 'dayjs';
import { ReactNode, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './index.scss';

const TerminateContract = () => {
    const { resignationId = '' } = useParams();
    const pathname = useLocation().pathname;
    const navigation = useNavigate();

    const currentDate = dayjs();
    const date = currentDate.format('DD-MM-YYYY');

    const [data, setData] = useState<IResignation | undefined>();

    useEffect(() => {
        const fetchData = async () => {
            const res = await resignationService.getDetail(resignationId);
            const { succeeded, data } = res;

            if (succeeded) setData(data);
            else navigation(pathnames.notFound + '?url=' + pathname);
        };

        fetchData();
    }, [resignationId, navigation, pathname]);

    // Chấm dứt hợp đồng thử việc trước thời hạn theo nguyện vọng
    const terminateProbationaryContractEarlyByChoice = {
        id: '1',
        title: 'Điều 1',
        value: (
            <>
                <PrintEditor text="Chấm dứt trước thời hạn" /> và thanh lý <PrintEditor text="Hợp đồng thử việc" /> số{' '}
                <PrintEditor text={data?.badgeId} />, ký ngày: <PrintEditor text={data?.applyDate} /> giữa Ông/bà{' '}
                <b>
                    <PrintEditor text={data?.fullName} />
                </b>{' '}
                và và Công Ty Giải Pháp Phần Mềm Tường Minh kể từ ngày <PrintEditor text={date} />
            </>
        )
    };

    // Chấm dứt hợp đồng lao động theo nguyện vọng
    const terminateContractByChoice = {
        id: '1',
        title: 'Điều 1',
        value: (
            <>
                <PrintEditor text="Kết thúc" /> và thanh lý <PrintEditor text="Hợp đồng thử việc" /> số <PrintEditor text={data?.badgeId} />, ký ngày:{' '}
                <PrintEditor text={data?.applyDate} /> giữa Ông/bà{' '}
                <b>
                    <PrintEditor text={data?.fullName} />
                </b>{' '}
                và và Công Ty Giải Pháp Phần Mềm Tường Minh kể từ ngày <PrintEditor text={date} />
            </>
        )
    };

    // Chấm dứt hợp đồng thử việc trước thời hạn
    const terminateProbationaryContractEarly = {
        id: '1',
        title: 'Điều 1',
        value: (
            <>
                <PrintEditor text="Chấm dứt trước thời hạn" /> và thanh lý <PrintEditor text="Hợp đồng thử việc" /> số{' '}
                <PrintEditor text={data?.badgeId} />, ký ngày: <PrintEditor text={data?.applyDate} /> giữa Ông/bà{' '}
                <b>
                    <PrintEditor text={data?.fullName} />
                </b>{' '}
                và và Công Ty Giải Pháp Phần Mềm Tường Minh kể từ ngày <PrintEditor text={date} />
            </>
        )
    };

    // Chấm dứt hợp đồng thử việc đúng thời hạn
    const terminateProbationaryContractOnSchedule = {
        id: '1',
        title: 'Điều 1',
        value: (
            <>
                <PrintEditor text="Kết thúc" /> và thanh lý <PrintEditor text="Hợp đồng thử việc" /> số <PrintEditor text={data?.badgeId} />, ký ngày:{' '}
                <PrintEditor text={data?.applyDate} /> giữa Ông/bà{' '}
                <b>
                    <PrintEditor text={data?.fullName} />
                </b>{' '}
                và và Công Ty Giải Pháp Phần Mềm Tường Minh kể từ ngày <PrintEditor text={date} />
            </>
        )
    };

    const componentMap: { [key: string]: ReactNode } = {
        'Kết thúc trước thời hạn theo nguyện vọng': (
            <TerminateProbationaryContract data={data} term={terminateProbationaryContractEarlyByChoice} isExpected />
        ),
        'Kết thúc hợp đồng theo nguyện vọng': <TerminateProbationaryContract data={data} term={terminateContractByChoice} isExpected />,
        'Kết thúc thử việc trước thời hạn': <TerminateProbationaryContract data={data} term={terminateProbationaryContractEarly} />,
        'Kết thúc thử việc đúng thời hạn': <TerminateProbationaryContract data={data} term={terminateProbationaryContractOnSchedule} />,
        'Chấm dứt hợp đồng lao động': <TerminateEmploymentContract data={data} />
    };

    return <>{data?.resignationTypeName ? componentMap[data.resignationTypeName] : navigation('/404?url=' + pathname)}</>;
};

export default TerminateContract;
