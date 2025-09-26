import PrintEditor from '@/components/common/print-editor';
import pathnames from '@/pathnames';
import contractService from '@/services/hr-management/contract-management';
import { IContract } from '@/types/hr-management/contract-management';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './index.scss';

const ContractPrintPage = () => {
    const { contractId = '' } = useParams();
    const [data, setData] = useState<IContract | undefined>();
    const pathname = useLocation().pathname;
    const navigation = useNavigate();

    // Fetch contract data
    useEffect(() => {
        const fetchData = async () => {
            const res = await contractService.getContractDetail(contractId);
            const { succeeded, data } = res;

            if (succeeded) setData(data);
            else navigation(pathnames.notFound + '?url=' + pathname);
        };

        fetchData();
    }, [contractId, pathname, navigation]);

    const terms = [
        {
            id: '1',
            title: 'Điều 1: Thời hạn, địa điểm và công việc hợp đồng',
            children: [
                {
                    id: '1.1',
                    title: '1.1. Loại hợp đồng lao động và thời hạn hợp đồng:',
                    textStyle: 'italic',
                    value: (
                        <ul>
                            <li>
                                Loại hợp đồng lao động: <span style={{ textTransform: 'capitalize' }}>{data?.contractTypeName}</span>
                            </li>
                            <li>
                                Thời hạn: Từ ngày: {data?.startDate}. Đến ngày: {data?.endDate}
                            </li>
                            <li>
                                Địa điểm làm việc chính tại: <b style={{ textTransform: 'uppercase' }}>{data?.companyName}</b>
                            </li>
                            <li>
                                Ngoài địa điểm làm việc chính, tùy theo yêu cầu và đặc thù công việc, người lao động sẽ làm việc hoặc công tác ở các
                                chi nhánh theo sự sắp xếp, phân công và điều động của công ty.
                            </li>
                        </ul>
                    )
                },
                {
                    id: '1.2',
                    title: '1.2. Chức danh chuyên môn:',
                    textStyle: 'italic',
                    valueType: 'inline',
                    value: data?.professionalTitles
                },
                {
                    id: '1.3',
                    title: '1.3. Công việc phải làm:',
                    textStyle: 'italic',
                    valueType: 'inline',
                    value: ''
                }
            ]
        },
        {
            id: '2',
            title: 'Điều 2: Chế độ làm việc',
            value: (
                <ul className="no-style">
                    <li>
                        <b>Thời gian làm việc:</b> 8 giờ/ngày (không quá 48 giờ/tuần). Sáng từ 8giờ 30 đến 12giờ. Chiều từ 13 giờ 30 đến 18 giờ, từ
                        thứ 2 đến thứ 6 . Người lao động có thể đi làm việc vào ngày thứ bảy tùy theo khối lượng công việc cần phải hoàn thành cho
                        đúng tiến độ theo yêu cầu của công ty.
                    </li>
                    <li>Dụng cụ làm việc: Được cấp phát những dụng cụ làm việc tùy theo nhu cầu của công việc.</li>
                </ul>
            )
        },
        {
            id: '3',
            title: 'Điều 3: Quyền lợi và nghĩa vụ của người lao động',
            children: [
                {
                    title: '1. Quyền Lợi:',
                    children: [
                        {
                            title: 'a) Mức lương, hình thức trả lương, thời hạn trả lương:',
                            value: (
                                <ul>
                                    <li>
                                        Mức lương căn bản: {data?.salary} ({data?.salaryInText})
                                    </li>
                                    <li>Hình thức trả lương: Trả lương theo thời gian và khối lượng sản phẩm/công việc hoàn thành.</li>
                                    <li>
                                        Thời hạn trả lương: Người lao động được trả trực tiếp qua tài khoản ngân hàng vào tuần đầu tiên của tháng kế
                                        tiếp.
                                    </li>
                                    <li>Phụ cấp lương (nếu có) gồm:</li>
                                    <li>Các khoản bổ sung khác (nếu có):</li>
                                </ul>
                            )
                        },
                        {
                            title: 'b) Các quyền lợi khác',
                            value: (
                                <ul>
                                    <li>
                                        <b>Tiền thưởng:</b> Người lao động đang làm việc phải có mặt tại thời điểm phát thưởng hàng năm của công ty,
                                        tùy thuộc vào kết quả kinh doanh hàng năm của công ty và mức độ hoàn thành công việc của người lao động.
                                    </li>
                                    <li>
                                        <b>Chế độ nâng lương:</b> Phụ thuộc vào kết quả làm việc của người lao động theo đánh giá của quản lý dự án và
                                        quy định của của công ty.
                                    </li>
                                    <li>Phương tiện đi lại làm việc: Tự túc</li>
                                    <li>
                                        Chế độ nghỉ ngơi (nghỉ lễ, phép, việc riêng):
                                        <ul>
                                            <li>
                                                Nghỉ hàng tuần : Người lao động được nghỉ ít nhất 1à 01 (Một) ngày (chủ nhật), hoặc người lao động có
                                                thể được nghỉ nhiều hơn tùy vào yêu cầu công việc.
                                            </li>
                                            <li>
                                                Nghỉ lễ/tết : Người lao động được nghỉ 11 ngày lễ, tết theo qui định của pháp luật lao động hiện hành.
                                                Cụ thể:
                                                <ul>
                                                    <li>Tết Dương Lịch: 01 ngày;</li>
                                                    <li>Tết Âm Lịch: 05 ngày;</li>
                                                    <li>Giỗ Tổ Hùng Vương: 01 ngày;</li>
                                                    <li>Ngày 30 tháng 4: 01 ngày;</li>
                                                    <li>Ngày Quốc tế Lao động 1/5: 01 ngày;</li>
                                                    <li>
                                                        Ngày Quốc khánh 2/9: 02 ngày (01 ngày 2/9 và 01 ngày trước hoặc sau liền kề 2/9 theo quy định
                                                        của Chính phủ).
                                                    </li>
                                                    <li>
                                                        Trường hợp những ngày nghỉ lễ trên trùng vào ngày thứ bảy và chủ nhật thì nhân viên sẽ được
                                                        nghỉ bù vào các ngày tiếp theo
                                                    </li>
                                                </ul>
                                            </li>
                                            <li>
                                                Nghỉ phép năm: Nhân viên làm việc liên tục 12 tháng trong một năm trong điều kiện lao động bình thường
                                                được nghỉ 12 ngày phép năm, hưởng nguyên lương. Riêng nhân viên làm việc lâu năm thì cứ năm năm làm
                                                việc được cộng thêm 01 ngày nghỉ phép.
                                            </li>
                                            <li>
                                                Nhân viên nghỉ về việc riêng được hưởng nguyên lương trong những trường hợp sau:
                                                <ul>
                                                    <li>Người lao động kết hôn: nghỉ 03 ngày;</li>
                                                    <li>Con kết hôn: nghỉ 01 ngày;</li>
                                                    <li>Bố mẹ (cả bên chồng và bên vợ) chết; vợ hoặc chồng chết; con chết: nghỉ 03 ngày.</li>
                                                </ul>
                                            </li>
                                        </ul>
                                    </li>
                                    <li>Bảo hiểm xã hội, bảo hiểm y tế và bảo hiểm thất nghiệp: Thực hiện theo quy đinh của pháp luật hiện hành.</li>
                                    <li>
                                        Chế độ đào tạo: Tùy thuộc vào chính sách của công ty và theo yêu cầu của công việc. Trong trường hợp người lao
                                        động được tham gia chương trình đào tạo thì hai bên ký hợp đồng đào tạo riêng.
                                    </li>
                                </ul>
                            )
                        }
                    ]
                },
                {
                    title: '2. Nghĩa vụ:',
                    value: (
                        <ul>
                            <li>Hoàn thành công việc được giao và sẵn sàng chấp nhận mọi sự điều động khi có yêu cầu của công ty</li>
                            <li>
                                Nắm rõ và chấp hành nghiêm túc qui định của công ty về: Văn hóa công ty; Cam kết bảo mật thông tin; nội qui lao động,
                                kỷ luật lao động, an toàn lao động, vệ sinh lao động, PCCC, thỏa ước lao động và các chủ trương, chính sách của Công
                                ty.
                            </li>
                            <li>
                                Tự chịu trách nhiệm cá nhân đối với giao dịch dân sự đã ký kết với các cá nhân, tổ chức bên ngoài trong thời gian làm
                                việc tại công ty.
                            </li>
                            <li>
                                Bồi thường thiệt hại cho công ty:
                                <ul>
                                    <li>
                                        Trong trường hợp người lao động có hành vi vi phạm, gây thiệt hại về tài sản công ty (hư hỏng, mất mát...) thì
                                        phải bồi thường theo nội quy của công ty và theo quy định của pháp luật hiện hành.
                                    </li>
                                    <li>
                                        Trong trường hợp người lao động được đưa đi đào tạo nâng cao nghiệp vụ (nếu có) mà vi phạm cam kết trong hợp
                                        đồng đào tạo nghề, thì phải bồi thường chi phí đào tạo nghề theo quy định trong hợp đồng đào tạo nghề mà hai
                                        bên đã ký, đồng thời không nhận được bất kỳ hình thức khen thưởng nào của công ty.
                                    </li>
                                    <li>
                                        Nếu người lao động đơn phương chấm dứt hợp đồng lao động thì người lao động phải nộp đơn xin nghỉ việc cho
                                        công ty và tuân thủ thủ tục báo trước theo quy định của pháp luật lao động hiện hành.
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    )
                }
            ]
        },
        {
            id: '4',
            title: 'Điều 4: Nghĩa vụ và quyền hạn của người sử dụng lao động.',
            children: [
                {
                    title: '1. Nghĩa vụ:',
                    value: (
                        <ul>
                            <li>Bảo đảm việc làm và thực hiện đầy đủ những điều đã cam kết trong hợp đồng lao động.</li>
                            <li>
                                Thanh toán đầy đủ, đúng thời hạn các chế độ và quyền lợi cho người lao động theo hợp đồng lao động, thoả ước lao động
                                tập thể.
                            </li>
                        </ul>
                    )
                },
                {
                    title: '2. Quyền hạn:',
                    value: (
                        <ul>
                            <li>Điều hành người lao động hoàn thành công việc theo Hợp đồng (bố trí, điều chuyển công việc cho người lao động)</li>
                            <li>
                                Tạm hoãn, chấm dứt Hợp đồng và áp dụng các biện pháp kỷ luật theo quy định của pháp luật lao động hiện hành và theo
                                nội quy của Công ty trong thời gian hợp đồng còn giá trị.
                            </li>
                            <li>
                                Có quyền đòi bồi thường, khiếu nại với cơ quan có thẩm quyền để bảo vệ quyền lợi của mình nếu người lao động vi phạm
                                pháp luật hay các điều khoản của hợp đồng này.
                            </li>
                        </ul>
                    )
                }
            ]
        },
        {
            id: '5',
            title: 'Điều 5: Những thỏa thuận khác ',
            value: (
                <ul>
                    <li>
                        Trong quá trình thực hiện hợp đồng, nếu một bên có nhu cầu thay đổi nội dung trong hợp đồng phải gửi bằng văn bản và báo cho
                        bên kia biết trước ít nhất 03 ngày làm việc để 02 bên cùng thỏa thuận. Trong thời gian tiến hành thỏa thuận, hai bên vẫn tuân
                        theo hợp đồng lao động đã ký kết. Nếu 02 bên thỏa thuận đạt được sự thay đổi nội dung hợp đồng thì sẽ ký kết bản Phụ lục hợp
                        đồng lao động theo quy định của pháp luật lao động.
                    </li>
                    <li>
                        Bất kỳ phụ lục và mọi sửa đổi với hợp đồng lao động này đều phải lập thành văn bản được ký bởi người có thẩm quyền của công ty
                        và người lao động, và đây sẽ được coi là một phần không thể tách rời của hợp đồng này.
                    </li>
                    <li>
                        Mức lương căn bản trong điểm a Điều 3 của hợp đồng này là căn cứ giải quyết các chế độ lao động và bồi thường thiệt hại lao
                        động theo quy định.
                    </li>
                </ul>
            )
        },
        {
            id: '6',
            title: 'Điều 6: Điều khoản thi hành',
            value: (
                <ul>
                    <li>
                        Những vấn đề về lao động không ghi trong hợp đồng lao động này thì áp dụng quy định của thỏa ước lao động tập thể, nội quy lao
                        động của công ty và pháp luật lao động.
                    </li>
                    <li>
                        Mọi tranh chấp phát sinh từ hợp đồng này hay liên quan đến hợp đồng này trước hết sẽ được giải quyết thông qua thương lượng,
                        hòa giải giữa các bên với nhau. Trường hợp hai bên không thương lượng, hòa giải được với nhau thì sẽ yêu cầu cơ quan có thẩm
                        quyền giải quyết theo quy định của pháp luật lao động hiện hành.
                    </li>
                    <li>
                        Hợp đồng lao động được lập thành 02 bản có giá trị như nhau, mỗi bên giữ một bản và có hiệu lực từ ngày: {data?.startDate}
                    </li>
                </ul>
            )
        }
    ];

    const renderTerms = (list: any[]) => {
        return list.map((item, index) => {
            const { title, textStyle, valueType = 'body', value, children } = item;

            return (
                <div className="contract-terms-item" key={'item_' + index}>
                    {title && (
                        <div className="contract-terms-item-header">
                            <span className="contract-terms-item-title" style={{ fontStyle: textStyle }}>
                                {title}
                            </span>

                            {valueType === 'inline' && value && <span className="contract-terms-item-value"> {value}</span>}
                        </div>
                    )}

                    {/* Value body */}
                    {valueType === 'body' && value && <div className="contract-terms-item-body">{value}</div>}

                    {/* Children */}
                    {children && <div className="contract-terms-item-body">{renderTerms(children)}</div>}
                </div>
            );
        });
    };

    return (
        <div className="contract-print page-print">
            <div
                style={{
                    display: 'flex',
                    gap: 20,
                    justifyContent: 'space-between'
                }}
            >
                <div>
                    <div style={{ fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>{data?.companyName}</div>
                    <div>
                        Số: <span style={{ fontWeight: 600 }}>T175651</span>
                    </div>
                </div>

                <div style={{ textAlign: 'center', width: 240, minWidth: 240 }}>
                    CỘNG HOÀ XÃ HỘI CHỦ NGHIÃ VIỆT NAM
                    <br />
                    Độc Lập - Tự Do - Hạnh Phúc
                    <br />
                    <span>----------</span>
                    <br />
                </div>
            </div>

            <div style={{ marginTop: 32, marginBottom: 24, fontWeight: 'bold', textAlign: 'center', fontSize: 16 }}>HỢP ĐỒNG LAO ĐỘNG</div>

            <div>
                <div style={{ marginLeft: 16 }}>
                    <i>
                        <ul>
                            <li>Căn cứ Bộ luật Lao động 2019;</li>
                            <li>
                                Căn cứ văn bản nội bộ của <span style={{ textTransform: 'uppercase' }}>{data?.companyName}</span>;
                            </li>
                            <li>Căn cứ vào sự thỏa thuận của hai bên.</li>
                        </ul>
                    </i>
                </div>
                <div style={{ marginTop: 16, display: 'flex', gap: 16, justifyContent: 'space-between' }}>
                    <div>
                        Chúng tôi, một bên là Ông/Bà: <span className="font-bold">{data?.companyOwner}</span>
                    </div>
                    <div style={{ minWidth: 120 }}>
                        Quốc tịch: <PrintEditor textTransform="capitalize" text={data?.nationalityOwner} />
                    </div>
                </div>
                <div>Chức vụ: {data?.ownerPosition}</div>
                <div>
                    Đại diện cho: <span style={{ fontWeight: 600, textTransform: 'uppercase' }}>{data?.companyName}</span>
                </div>
                <div>Điạ chỉ: {data?.companyAddress}.</div>
                <div>Điện thoại: {data?.companyPhone}</div>
                <div style={{ display: 'flex', gap: 16, justifyContent: 'space-between' }}>
                    <div>
                        Và một bên là Ông/Bà: <PrintEditor text={data?.fullName} textTransform="capitalize" />
                    </div>
                    <div style={{ minWidth: 120 }}>
                        Quốc tịch: <PrintEditor textTransform="capitalize" text={data?.nationalityName} />
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 16, justifyContent: 'space-between' }}>
                    <div>
                        Ngày sinh: <PrintEditor text={data?.birthday} textTransform="capitalize" />
                    </div>
                    <div style={{ minWidth: 120 }}>
                        Nơi sinh: <PrintEditor text={data?.birthPlace} textTransform="capitalize" />
                    </div>
                </div>
                <div>Nghề nghiệp: {data?.career}</div>
                <div>
                    Điạ chỉ thường trú: <PrintEditor text={data?.contactAddress} />
                </div>
                <div>
                    Số CMND: <PrintEditor text={data?.idCardNo} />. Cấp ngày: <PrintEditor text={data?.idCardIssueDate} />. Tại:{' '}
                    <PrintEditor text={data?.idCardIssuePlace} textTransform="capitalize" />
                </div>
                <div>
                    Số sổ lao động nếu có: <PrintEditor text="....................." />. Cấp ngày: <PrintEditor text="......./......./.........." />.
                    Tại: <PrintEditor text="......................................." textTransform="capitalize" />
                </div>
                <div>Thoả thuận ký hợp đồng lao động và cam kết làm đúng những điều khoản sau đây:</div>

                {/* Contract terms */}
                <div className="contract-terms"> {renderTerms(terms)}</div>

                <div style={{ display: 'flex', gap: 16, justifyContent: 'space-between', marginTop: 16 }}>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <div>
                            <b>Người lao động</b>
                        </div>
                        <div>(Ký tên)</div>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <div>
                            <b>Người sử dụng lao động</b>
                        </div>
                        <div>(Ký tên và đóng dấu)</div>
                        <div style={{ marginTop: 100, textTransform: 'uppercase' }}>PHẠM NGỌC NHƯ UYỂN</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContractPrintPage;
