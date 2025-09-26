import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import DetailHeader from '@/components/common/detail-management/detail-header';
import pathnames from '@/pathnames';
import { IDataBreadcrumb } from '@/types/common';
import { Flex } from 'antd';
import './index.scss';

const breadcrumbList: IDataBreadcrumb[] = [
    { title: pathnames.home.name },
    { title: pathnames.transferEmployee.main.name, path: pathnames.transferEmployee.main.path },
    { title: pathnames.transferEmployee.transferGuide.name }
];

// Define the content data structure
const transferRules = [
    <>
        A transfer will be <span className="c-red">finished</span> when it has all approvals (if any).
    </>,
    <>
        A transfer will be <span className="c-red">cancelled</span> if any disapproval is made. Email will be sent to both two PMs with a CC to HR.
    </>,
    <>
        Approvals/disapprovals are made in <span className="font-weight-600">Employee Transfer</span> &gt;{' '}
        <span className="font-weight-600">Transfers List.</span>
    </>
];

const transferCases = [
    {
        title: (
            <>
                <span className="font-weight-600">Case 1:</span> Transfer between projects managed by same PM.
            </>
        ),
        items: [
            'No approval needed. Employee will be immediately transferred.',
            'Email to Director when transfer is created.',
            'Email to IT, HR, QMS when transfer is finished.'
        ]
    },
    {
        title: (
            <>
                <span className="font-weight-600">Case 2:</span> Transfer in same DC, different PMs.
            </>
        ),
        items: ['Need approval of target PM.', 'Email to DC Director after create transfer.', 'Email to IT, HR, QMS after finish transfer.']
    },
    {
        title: (
            <>
                <span className="font-weight-600">Case 3: </span> Transfer in same DG, different DC.
            </>
        ),
        items: [
            'Need approval of original DC Director, target DC Director and target PM.',
            'Email to two Directors and target PM after create transfer.',
            'Email to IT, HR, QMS after finish transfer.'
        ]
    },
    {
        title: (
            <>
                <span className="font-weight-600">Case 4: </span> Transfer between different DG.
            </>
        ),
        items: ['Same as Case 3.']
    }
];

const howToTransfer = [
    {
        step: 'Step 1:',
        content: [
            'Two way to transfer an employee',
            <>
                Go to <span className="font-weight-600">Employee Transfer</span> &gt; <span className="font-weight-600">New Transfer.</span>
            </>,
            <>
                <span className="font-weight-600">Transfer</span> link in Project Information table (
                <span className="font-weight-600">Group Management &gt; select Project in org chart</span>).
            </>
        ]
    },
    {
        step: 'Step 2:',
        content: [
            'Type employee’s name in Full Name and select correct employee from suggested list.',
            <>
                <span className="font-weight-600 c-red">Note:</span> <span className="c-red">Need to select an employee from suggested list</span> or
                system won’t be able to define who is being transferred.
            </>
        ],
        image: '/media/images/transfer-guide-step-two.webp'
    },
    {
        content: ['']
    },

    {
        step: 'Step 3:',
        content: ['Input information in Employee Transfer form and submit transfer.'],
        image: '/media/images/transfer-guide-step-three.webp'
    }
];

const EmployeeTransferGuide = () => {
    const pageTitle = pathnames.transferEmployee.transferGuide.name;
    return (
        <DetailContent rootClassName="hrm-transfer-guide">
            <BaseBreadcrumb dataItem={breadcrumbList} />
            <DetailHeader pageTitle={pageTitle} />
            <Flex vertical className="transfer-guide-lv1">
                <div className="font-weight-600 c-red">Transfer Rule</div>
                <ul className="transfer-guide-lv2">
                    {transferRules.map((rule, index) => (
                        <li key={index}>{rule}</li>
                    ))}
                    <li>
                        Four cases could happen in a transfer:
                        <ul>
                            {transferCases.map((transferCase, index) => (
                                <li key={index}>
                                    <div>{transferCase.title}</div>
                                    <ul>
                                        {transferCase.items.map((item, itemIndex) => (
                                            <li key={itemIndex}>{item}</li>
                                        ))}
                                    </ul>
                                </li>
                            ))}
                        </ul>
                    </li>
                </ul>
                <div>
                    <div className="font-weight-600 c-red">How To Transfer</div>
                    {howToTransfer.map((step, index) => (
                        <div key={index}>
                            <div>
                                <span className="font-weight-600">{step.step}</span> {step.content[0]}
                            </div>
                            <ul className="transfer-guide-lv2">
                                {step.content.slice(1).map((contentItem, itemIndex) => (
                                    <li key={itemIndex}>{contentItem}</li>
                                ))}
                            </ul>
                            {step.image && <img src={step.image} alt="Guide step" />}
                        </div>
                    ))}
                </div>
            </Flex>
        </DetailContent>
    );
};

export default EmployeeTransferGuide;
