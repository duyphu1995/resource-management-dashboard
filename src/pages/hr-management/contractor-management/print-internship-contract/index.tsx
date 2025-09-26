import PrintEditor from '@/components/common/print-editor';
import contractorService from '@/services/hr-management/contractor-management';
import { IContractorContract } from '@/types/hr-management/contractor-management';
import { calculateDaysBetween, formatGender } from '@/utils/common';
import { TIME_FORMAT } from '@/utils/constants';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './index.scss';

const InternshipContractPrintPage = () => {
    const { contractId = '' } = useParams();

    const [data, setData] = useState<IContractorContract>();

    const currentDate = dayjs();
    const date = currentDate.format(TIME_FORMAT.VN_DATE);

    const totalDays = data && data.startDate && data.endDate ? calculateDaysBetween(data.startDate, data.endDate) : 0;

    const terms = [
        {
            id: '1',
            title: 'Điều 1. Thời hạn, địa điểm và công việc hợp đồng',
            margin: 20,
            children: [
                {
                    id: '1.1',
                    title: '1.1.',
                    grid: true,
                    value: (
                        <>
                            Thời gian tập nghề:
                            <i>
                                <b>
                                    <PrintEditor
                                        text={`${totalDays} ngày, bắt đầu từ ngày ${data?.startDate} đến ngày ${data?.endDate}`}
                                        display="inline"
                                    />
                                </b>
                            </i>
                        </>
                    )
                },
                {
                    id: '1.2',
                    title: '1.2.',
                    grid: true,
                    value: (
                        <>
                            Công việc tập nghề:
                            <i>
                                <b>
                                    <PrintEditor text={data?.career || '.....................'} display="inline" />
                                </b>
                            </i>
                        </>
                    )
                },
                {
                    id: '1.3',
                    title: '1.3.',
                    grid: true,
                    value: 'Địa điểm làm việc: Tại trụ sở chính của Công ty và các địa điểm chi nhánh khác của Công ty theo yêu cầu công việc.'
                }
            ]
        },
        {
            id: '2',
            title: 'Điều 2. Tiền lương trong thời gian tập nghề',
            margin: 40,
            children: [
                {
                    id: '2.1',
                    title: '2.1.',
                    grid: true,
                    value: (
                        <>
                            <span>Tiền lương trong thời gian tập nghề:</span>
                            <br />
                            <span>
                                Mức lương dựa trên khung lương quy định của Công ty theo công việc hoặc chức danh trong thời gian tập nghề:{' '}
                                <i>
                                    <b>
                                        <PrintEditor text="6,000,000 đồng/tháng. (Bằng chữ : sáu triệu đồng/tháng)" display="inline" />
                                    </b>
                                </i>
                            </span>
                        </>
                    )
                },
                {
                    id: '2.2',
                    title: '2.2. ',
                    grid: true,
                    value: 'Hình thức trả lương: Lương được trả bằng tiền mặt'
                },
                {
                    id: '2.3',
                    title: '2.3. ',
                    grid: true,
                    value: 'Kỳ hạn trả lương: Được trả lương tháng 1 lần vào ngày 5 hàng tháng. Nếu thời điểm trả lương trùng với ngày nghỉ lễ, tết, ngày nghỉ hàng tuần thì Công ty sẽ chi trả lương cho người tập nghề vào ngày kế tiếp ngày nghỉ.'
                }
            ]
        },
        {
            id: '3',
            title: 'Điều 3. Quyền lợi và nghĩa vụ các bên',
            margin: 20,
            children: [
                {
                    id: '3.1',
                    title: <b>3.1. Quyền và nghĩa vụ của người tập nghề</b>
                },
                {
                    id: '3.2',
                    title: 'a.',
                    grid: true,
                    value: 'Được hưởng tiền lương theo quy định tại Điều 3 Hợp đồng này.'
                },
                {
                    id: '3.3',
                    title: 'b.',
                    grid: true,
                    value: 'Thời giờ tập nghề, thời giờ nghỉ ngơi: Theo quy định tại Nội quy lao động và các văn bản nội bộ khác có liên quan của Công ty.'
                },
                {
                    id: '3.4',
                    title: 'c.',
                    grid: true,
                    value: (
                        <>
                            Thời gian tập nghề:{' '}
                            <b>
                                <PrintEditor text={data?.workingWeek || '.....................'} display="inline" />
                            </b>{' '}
                            ngày/ tuần.
                        </>
                    )
                },
                {
                    id: '3.5',
                    title: 'd.',
                    grid: true,
                    value: 'Phương tiện đi lại làm việc: Người tập nghề tự túc.'
                },
                {
                    id: '3.6',
                    title: 'e.',
                    grid: true,
                    value: 'Công cụ, dụng cụ lao động: Được trang bị đầy đủ những thiết bị văn phòng phù hợp dùng trong công việc.'
                },
                {
                    id: '3.7',
                    title: 'f.',
                    grid: true,
                    value: 'Hoàn thành công việc/nhiệm vụ được giao với khối lượng, chất lượng và tiến độ công việc theo yêu cầu của Công ty trong thời gian tập nghề.'
                },
                {
                    id: '3.8',
                    title: 'g.',
                    grid: true,
                    value: 'Tuân thủ sự điều hành và quản lý của cấp trên trực tiếp hoặc người giám sát quản lý trong thời gian tập nghề.'
                },
                {
                    id: '3.9',
                    title: 'h.',
                    grid: true,
                    value: 'Người tập nghề cũng đồng ý rằng việc đi công tác tại từng thời điểm là yêu cầu bắt buộc trong công việc và có thể phải làm việc ở nhiều địa điểm khác nhau theo yêu cầu công việc.'
                },
                {
                    id: '3.10',
                    title: 'i.',
                    grid: true,
                    value: 'Chấp hành kỷ luật lao động, Nội quy lao động và các quy định nội bộ có liên quan của Công ty.'
                },
                {
                    id: '3.11',
                    title: 'j.',
                    grid: true,
                    value: 'Giữ gìn đoàn kết trong nội bộ Công ty, không lôi kéo, dụ dỗ người lao động, người tập nghề trong Công ty nghỉ việc.'
                },
                {
                    id: '3.12',
                    title: 'k.',
                    grid: true,
                    value: 'Tuân thủ Quy tắc đạo đức nghề nghiệp của Công ty, chấp hành mọi quy định của pháp luật Việt Nam hiện hành.'
                },
                {
                    id: '3.13',
                    title: 'l.',
                    grid: true,
                    value: 'Cam kết bảo mật thông tin; không được sao chép, trích lục, tiết lộ toàn bộ hay một phần các tài liệu của Công ty (như các sản phẩm thuộc quyền sở hữu trí tuệ của Công ty, các thông tin của khách hàng, đối tác,...) trong thời hạn thực hiện Hợp đồng này và sau khi kết thúc Hợp đồng này.'
                },
                {
                    id: '3.14',
                    title: 'm.',
                    grid: true,
                    value: 'Có trách nhiệm bảo vệ tài sản của Công ty theo quy định tại Nội quy lao động và các văn bản nội bộ có liên quan của Công ty.'
                },
                {
                    id: '3.15',
                    title: 'n.',
                    grid: true,
                    value: 'Không liên hệ chính thức hoặc không chính thức (như bằng văn bản, bằng miệng,...) với bất kỳ đối tác hiện nay, trước đây hoặc sau này của Công ty, nhà cung cấp, nhà thầu với bất kỳ mục đích nào ngoài những lợi ích hợp pháp của Công ty.'
                },
                {
                    id: '3.16',
                    title: 'o.',
                    grid: true,
                    value: 'Không được phép tiếp xúc, liên lạc với báo chí truyền thông với tư cách thay mặt cho Công ty trừ trường hợp đó là nhiệm vụ người tập nghề phải thực hiện và/hoặc đã có sự đồng ý trước của Ban lãnh đạo Công ty. Không được phép phát hành thư, bài báo hoặc những tài liệu khác với tư cách của Công ty trừ trường hợp có sự đồng ý trước của Ban lãnh đạo Công ty.'
                },
                {
                    id: '3.17',
                    title: 'p.',
                    grid: true,
                    value: 'Khi chấm dứt hợp đồng tập nghề, người tập nghề có trách nhiệm thanh quyết toán tất cả các khoản nợ còn tồn đọng và các khoản tài chính khác có liên quan trong quá trình tập nghề tại Công ty; có trách nhiệm hoàn trả và bàn giao lại cho người tiếp nhận (do Công ty chỉ định) toàn bộ sổ sách, tài liệu, các thông tin bảo mật, các công việc đang thực hiện cũng như các đồ dùng, trang thiết bị làm việc Công ty đã cấp phát.'
                },
                {
                    id: '3.18',
                    title: 'q.',
                    grid: true,
                    value: 'Các quyền và nghĩa vụ khác theo quy định nội bộ của Công ty và quy định pháp luật.'
                },
                {
                    id: '3.19',
                    marginTitle: 40,
                    title: <b>3.2. Quyền và nghĩa vụ của người tập nghề</b>
                },
                {
                    id: '3.20',
                    title: 'a.',
                    grid: true,
                    value: 'Thanh toán đầy đủ, đúng thời hạn các chế độ và quyền lợi cho người tập nghề theo hợp đồng này và quy định nội bộ Công ty.'
                },
                {
                    id: '3.21',
                    title: 'b.',
                    grid: true,
                    value: 'Điều hành người tập nghề hoàn thành các công việc theo Hợp đồng này.'
                },
                {
                    id: '3.21',
                    title: 'c.',
                    grid: true,
                    value: 'Xử lý kỷ luật lao động đối với trường hợp người tập nghề vi phạm các quy định tại Nội quy lao động và các văn bản nội bộ của Công ty trong thời gian tập nghề.'
                },
                {
                    id: '3.22',
                    title: 'd.',
                    grid: true,
                    value: 'Trong thời hạn tập nghề, mỗi bên có quyền đơn phương hủy bỏ hợp đồng tập nghề mà không cần báo trước cho bên kia.'
                },
                {
                    id: '3.23',
                    title: 'e.',
                    grid: true,
                    value: 'Có quyền yêu cầu người tập nghề bồi thường thiệt hại nếu người tập nghề gây thiệt hại cho Công ty, đối tác của Công ty hoặc bất kỳ bên thứ 3 nào trong thời hạn hợp đồng này.'
                },
                {
                    id: '3.24',
                    title: 'f.',
                    grid: true,
                    value: 'Sau khi Hợp đồng tập nghề này kết thúc, 2 bên có thể ký tiếp HĐ đào tạo nghề mới. Nếu kết quả tập nghề đạt yêu cầu, 2 bên sẽ thỏa thuận ký HĐLĐ. Nếu kết quả tập nghề chưa đạt, hợp đồng tập nghề sẽ chấm dứt vào ngày hết hiệu lực của hợp đồng.'
                }
            ]
        },
        {
            id: '4',
            title: 'Điều 4. Hiệu lực Hợp đồng và cam kết chung của hai bên',

            children: [
                {
                    id: '4.1',
                    title: <b>4.1. Hiệu lực hợp đồng</b>
                },
                {
                    id: '4.2',
                    title: 'a. ',
                    grid: true,
                    value: (
                        <>
                            Hợp đồng tập nghề này có hiệu lực thi hành kể từ ngày{' '}
                            <b>
                                <PrintEditor text={data?.startDate} display="inline" />
                            </b>{' '}
                            và thay thế cho các hợp đồng tập nghề trước đó (nếu có) giữa người tập nghề và Công ty kể từ ngày Hợp đồng tập nghề này có
                            hiệu lực.
                        </>
                    )
                },
                {
                    id: '4.3',
                    title: 'b. ',
                    grid: true,
                    value: 'Mọi thỏa thuận trước đây giữa Công ty và người tập nghề (nếu có) trái với Hợp đồng này đều đương nhiên hết hiệu lực.'
                },
                {
                    id: '4.4',
                    title: 'c. ',
                    grid: true,
                    value: 'Hợp đồng tập nghề này được thành lập thành hai (02) bản có giá trị pháp lý như nhau, người tập nghề giữ một (01) bản, Công ty giữ một (01) bản.'
                },
                {
                    id: '4.5',
                    title: <b>4.2. Cam kết chung của hai bên</b>
                },
                {
                    id: '4.6',
                    title: 'a. ',
                    grid: true,
                    value: 'Hai bên cam kết thực hiện đúng và đầy đủ các thỏa thuận tại Hợp đồng này. Những nội dung khác liên quan đến quyền và nghĩa vụ của hai bên chưa được quy định tại Hợp đồng này thì được thực hiện theo quy định của Công ty tại từng thời điểm.'
                },
                {
                    id: '4.7',
                    title: 'b. ',
                    grid: true,
                    value: 'Hợp đồng tập nghề này được các bên giao kết trên nguyên tắc tự nguyện, bình đẳng, thiện chí, hợp tác và trung thực, trong tình trạng tinh thần tỉnh táo, không bị ép buộc.'
                }
            ]
        }
    ];

    const renderTerms = (list: any[]) => {
        return list.map((item, index) => {
            const { title, textStyle, valueType = 'body', value, children, margin, grid, marginTitle } = item;

            return (
                <div className="contractor-terms-item" style={grid && { display: 'grid', gridTemplateColumns: '1fr 22fr' }} key={'item_' + index}>
                    {title && (
                        <div className="contractor-terms-item-header" style={{ marginTop: marginTitle }}>
                            <span style={{ fontStyle: textStyle }}>{title}</span>

                            {valueType === 'inline' && value && <span className="contractor-terms-item-value">{value}</span>}
                        </div>
                    )}

                    {/* Value body */}
                    {valueType === 'body' && value && <div className="contractor-terms-item-body">{value}</div>}

                    {/* Children */}
                    {children && <div style={{ marginBottom: margin }}>{renderTerms(children)}</div>}
                </div>
            );
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            const res = await contractorService.getContractorContractDetail(parseInt(contractId));

            const { succeeded, data } = res;

            if (succeeded && data) {
                setData(data);
            }
        };

        fetchData();
    }, [contractId]);

    return (
        <div className="page-print contract-contractor-print">
            <div
                style={{
                    display: 'flex',
                    gap: 20,
                    justifyContent: 'space-between'
                }}
            >
                <div>
                    <div style={{ fontWeight: 600, fontSize: 11, textTransform: 'uppercase', textAlign: 'center' }}>{data?.companyName}</div>
                </div>

                <div style={{ textAlign: 'center', width: 250, minWidth: 250, fontWeight: 'bold' }}>
                    CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM
                    <br />
                    Độc Lập - Tự Do - Hạnh Phúc
                    <br />
                    <span>----------</span>
                    <br />
                </div>
            </div>

            <div style={{ marginTop: 20, marginBottom: 10, fontWeight: 'bold', textAlign: 'center', fontSize: 16 }}>HỢP ĐỒNG TẬP NGHỀ</div>

            <div style={{ textAlign: 'center', marginBottom: 20 }}>
                (Số: <b>{data?.contractorBadgeId}</b>)
            </div>

            <div>
                <div>Căn cứ Bộ luật Lao động 2019;</div>
                <div>Căn cứ Luật giáo dục nghề nghiệp 2014;</div>
                <div>Căn cứ các văn bản nội bộ của Công ty;</div>
                <div>Căn cứ sự thỏa thuận tự nguyện của 2 bên;</div>
                <div>
                    Hôm nay, ngày{' '}
                    <b>
                        <PrintEditor text={date} display="inline" />
                    </b>
                    , tại{' '}
                    <b>
                        <PrintEditor text={data?.companyAddress || '.....................'} display="inline" />
                    </b>
                    , chúng tôi gồm:
                </div>
                <div>
                    <b>
                        Một bên là Người dạy nghề: <span style={{ textTransform: 'uppercase' }}>{data?.companyName}</span>
                    </b>
                </div>
                <div>(sau đây gọi là "Người dạy nghề" hoặc "Công ty")</div>
                <div>
                    Địa chỉ trụ sở chính:{' '}
                    <b>
                        <PrintEditor text={data?.companyName || '.....................'} display="inline" />
                    </b>
                </div>
                <div>
                    Điện thoại:{' '}
                    <b>
                        <PrintEditor text={data?.companyPhone || '.....................'} display="inline" />
                    </b>
                </div>
                <div>
                    Đại diện bởi:{' '}
                    <b>
                        <PrintEditor text={data?.companyOwner || '.....................'} display="inline" />
                    </b>
                </div>
                <div style={{ display: 'flex' }}>
                    <span style={{ flex: 2 }}>
                        Chức vụ/Chức danh:{' '}
                        <b>
                            <PrintEditor text={data?.ownerPosition || '.....................'} display="inline" />
                        </b>
                    </span>
                    <span style={{ flex: 1 }}>
                        Quốc tịch:{' '}
                        <b>
                            <PrintEditor text="Việt Nam" />
                        </b>
                    </span>
                </div>
                <div>
                    <b>Và một bên là Người tập nghề:</b>
                </div>
                <div>
                    Họ tên:{' '}
                    <b>
                        <PrintEditor text={data?.fullName || '.....................'} display="inline" />
                    </b>
                </div>
                <div style={{ display: 'flex' }}>
                    <span style={{ flex: 2 }}>
                        Giới tính:{' '}
                        <b>
                            <PrintEditor text={formatGender(data?.genderName) || '.....................'} display="inline" />
                        </b>
                    </span>
                    <span style={{ flex: 1 }}>
                        Quốc tịch:{' '}
                        <b>
                            <PrintEditor text="Việt Nam" />
                        </b>
                    </span>
                </div>
                <div>
                    Ngày sinh:{' '}
                    <b>
                        <PrintEditor text={data?.birthday || '.....................'} display="inline" />
                    </b>
                </div>
                <div>
                    Số CMND/CCCD: <PrintEditor text={data?.idCardNo || '.....................'} display="inline" /> Ngày cấp:{' '}
                    <PrintEditor text={data?.idCardIssueDate || '.....................'} display="inline" /> Nơi cấp:{' '}
                    <PrintEditor text={data?.idCardIssuePlace || '.....................'} display="inline" />
                </div>
                <div>
                    Hộ khẩu thường trú:{' '}
                    <b>
                        <PrintEditor text={data?.contactAddress || '.....................'} display="inline" />
                    </b>
                </div>
                <div>
                    (Dưới đây gọi tắt là "<b>Người tập nghề</b>")
                </div>
                <div>Cùng thỏa thuận ký kết Hợp đồng tập nghề và cam kết thực hiện đúng những điều khoản sau đây:</div>

                <div className="contractor-terms"> {renderTerms(terms)}</div>

                <div style={{ display: 'flex', gap: 16, justifyContent: 'space-between', marginTop: 24 }}>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <div>
                            <b>NGƯỜI TẬP NGHỀ</b>
                        </div>
                        <div style={{ marginTop: 80, textTransform: 'uppercase' }}>
                            <b>
                                <PrintEditor text={data?.fullName || '.....................'} display="inline" />
                            </b>
                        </div>
                    </div>

                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <div>
                            <b>ĐẠI DIỆN NGƯỜI SỬ DỤNG LAO ĐỘNG</b>
                        </div>
                        <div style={{ marginTop: 80, textTransform: 'uppercase' }}>
                            <b>
                                <PrintEditor text={data?.companyOwner || '.....................'} display="inline" />
                            </b>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InternshipContractPrintPage;
