import BaseDivider from '@/components/common/divider';
import PrintEditor from '@/components/common/print-editor';
import { IResignation } from '@/types/hr-management/resignation-management';
import dayjs from 'dayjs';

interface ITerminateProbationaryContractProps {
    data: IResignation | undefined;
    term: any;
    isExpected?: boolean;
}

const TerminateProbationaryContract = (props: ITerminateProbationaryContractProps) => {
    const { data, term, isExpected } = props;

    const currentDate = dayjs();

    const day = currentDate.date();
    const month = currentDate.format('MM');
    const year = currentDate.year();
    const date = currentDate.format('DD-MM-YYYY');

    const terms = [
        term,
        {
            id: '2',
            title: 'Điều 2',
            value: (
                <>
                    Ông/Bà{' '}
                    <b>
                        <PrintEditor text={data?.fullName} display="inline" />
                    </b>{' '}
                    được{' '}
                    <PrintEditor
                        text="thanh toán lương theo hợp đồng thử việc mà 2 bên đã ký kết và theo pháp luật lao động hiện hành"
                        display="inline"
                    />
                    .
                </>
            )
        },
        {
            id: '3',
            title: 'Điều 3',
            value: (
                <>
                    <span>
                        Các quyền và nghĩa vụ của 02 bên liên quan đến Hợp đồng thử việc số <PrintEditor text={data?.badgeId} /> ký ngày{' '}
                        <PrintEditor text={data?.applyDate} /> chấm dứt kể từ ngày ký biên bản thỏa thuận này.
                    </span>
                    <span style={{ paddingTop: 10, display: 'inline-block' }}>
                        Biên bản được lập thành 02 bản, mỗi bên giữ 01 bản, có giá trị như nhau và có hiệu lực từ ngày <PrintEditor text={date} />.
                    </span>
                </>
            )
        }
    ];

    const renderTerms = (list: any[]) => {
        return list.map((item, index) => {
            const { title, textStyle, value } = item;

            return (
                <div className="resignation-terms-item" key={'item_' + index}>
                    {title && (
                        <div className="resignation-terms-item-header" style={{ display: 'grid', gridTemplateColumns: '1fr 8fr' }}>
                            <span className="resignation-terms-item-title" style={{ fontStyle: textStyle }}>
                                {title}
                            </span>

                            {value && <span className="resignation-terms-item-value">{value}</span>}
                        </div>
                    )}
                </div>
            );
        });
    };

    return (
        <div className="resignation-print page-print">
            <div style={{ display: 'flex', gap: 20, justifyContent: 'space-between' }}>
                <div>
                    <div style={{ fontWeight: 600, fontSize: 11, textTransform: 'uppercase', textAlign: 'center' }}>
                        <img src="/media/images/logo-tma-doc.png" alt="logo" style={{ width: '150px' }} />
                    </div>
                </div>

                <div style={{ textAlign: 'center', minWidth: 240 }}>
                    <div style={{ color: '#0068B0', fontSize: 13 }}>
                        <b style={{ whiteSpace: 'nowrap' }}>TUONG MINH - PROJECT MANAGEMENT &</b>
                        <br />
                        <b>SOFTWARE DEVELOPMENT AGENCY</b>
                        <BaseDivider margin="0 0 5px 0" bgColor="#0068B0" />
                    </div>
                    <div style={{ fontSize: 10 }}>
                        <div>
                            <i>Address</i>: 111 Nguyen Dinh Chinh, Phu Nhuan Dist., HCMC, Vietnam
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <i>Phone</i>: (84-28) 3990-3848
                            </div>
                            <div>
                                <i>Fax</i>: (84-28) 3990-3303
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <i>E-mail</i>: tma@tma.com.vn
                            </div>
                            <div>
                                {/* link */}
                                <u style={{ color: '#0068B0' }}>http:// www.tmasolutions.com</u>
                            </div>
                        </div>
                    </div>
                    <div style={{ paddingTop: 10 }}>
                        TP. Hồ Chí Minh, ngày {day} tháng {month} năm {year}
                    </div>
                </div>
            </div>
            <div style={{ textAlign: 'center' }}>
                <div style={{ marginTop: 10, marginBottom: 5, fontWeight: 'bold', fontSize: 14 }}>BIÊN BẢN THỎA THUẬN</div>
                <div style={{ fontWeight: 'bold', fontSize: 14 }}>CHẤM DỨT HỢP ĐỒNG THỬ VIỆC</div>
                <div style={{ paddingTop: 10, fontSize: 12, marginBottom: 10 }}>
                    <i>
                        Số:
                        <PrintEditor text={data?.badgeId} />/<PrintEditor text={year?.toString()} />/<span style={{ fontWeight: 'bold' }}>TMA</span>
                    </i>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <i>
                    Căn cứ Hợp đồng thử việc số: <PrintEditor text={data?.badgeId.replace(/[a-zA-Z]/g, '')} />. Ký ngày:{' '}
                    <PrintEditor text={data?.applyDate} />
                </i>
                <i>
                    {isExpected
                        ? 'Căn cứ đơn xin nghỉ việc, nguyện vọng của nhân viên.'
                        : 'Căn cứ kết quả đánh giá quá trình thử việc của nhân viên.'}
                </i>
                <i>Theo đề nghị của Trưởng bộ phận/ Quản lý dự án.</i>
                <i>Theo đề nghị của Ông/ Bà phụ trách nhân sự</i>
            </div>

            <div style={{ marginTop: 15, display: 'flex', flexDirection: 'column' }}>
                <b>
                    <i>Chúng tôi, một bên là:</i>
                </b>
                <b> CÔNG TY TNHH GIẢI PHÁP PHẦN MỀM TƯỜNG MINH</b>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 8fr' }}>
                    <div>Địa chỉ</div>
                    <div>: 111 Nguyễn Đình Chính, P. 15, Q. Phú Nhuận, TP. HCM</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 5fr 3fr' }}>
                    <div>Điện thoại</div>
                    <div>: 028-39903848</div>
                    <div>Fax: 028-39903303 </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 5fr 3fr' }}>
                    <div>Đại diện</div>
                    <div>
                        : <b>PHẠM NGỌC NHƯ DƯƠNG</b>
                    </div>
                    <div>Chức vụ: GIÁM ĐỐC</div>
                </div>
                <div>Dưới đây gọi tắt là “Công Ty Giải Pháp Phần Mềm Tường Minh”</div>
                <b style={{ paddingTop: 10 }}>
                    <i>Và một bên là:</i>
                </b>
                <div>
                    Họ và tên:{' '}
                    <b>
                        <PrintEditor text={data?.fullName} />
                    </b>
                    , Mã số NV: <PrintEditor text={data?.badgeId} />, Dự án:
                    <PrintEditor text={data?.projectName} />
                </div>
                <div>
                    Sinh năm: <PrintEditor text={data?.birthday || '.......................'} minWidth={40} />, Tại:{' '}
                    <PrintEditor text={data?.birthPlace || '.......................'} minWidth={40} />, CMND số:{' '}
                    <PrintEditor text={data?.idCardNo || '.......................'} minWidth={40} />, Cấp ngày:{' '}
                    <PrintEditor text={data?.idCardIssueDate || '.......................'} minWidth={40} />, Tại:{' '}
                    <PrintEditor text={data?.idCardIssuePlace || '.......................'} minWidth={40} />
                </div>
                <div>
                    Nơi đăng ký hộ khẩu thường trú: <PrintEditor text={data?.permanentAddress || '.......................'} />{' '}
                </div>
                <div>
                    Được Công Ty Giải Pháp Phần Mềm Tường Minh tuyển dụng theo <PrintEditor text="Hợp đồng thử việc" /> số{' '}
                    <PrintEditor text={data?.badgeId} />, ký ngày: <PrintEditor text={data?.applyDate} />
                </div>

                <div style={{ textAlign: 'center', paddingTop: 5 }}>
                    <b>Nay thỏa thuận thống nhất như sau</b>
                </div>

                <div className="resignation-terms">{renderTerms(terms)}</div>

                <div style={{ display: 'flex', gap: 16, justifyContent: 'space-between' }}>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <div>
                            <b>NGƯỜI LAO ĐỘNG</b>
                        </div>
                        (Ký tên, ghi rõ họ tên)
                    </div>

                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <div>
                            <b>
                                Người sử dụng lao động <br />
                                CÔNG TY TNHH GIẢI PHÁP
                                <br />
                                PHẦN MỀM TƯỜNG MINH
                                <br />
                                Giám đốc
                            </b>
                        </div>
                        <div style={{ marginTop: 60, textTransform: 'uppercase' }}>
                            <b>PHẠM NGỌC NHƯ DƯƠNG</b>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TerminateProbationaryContract;
