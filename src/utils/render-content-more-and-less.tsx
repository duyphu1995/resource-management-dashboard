import { useState } from 'react';

const RenderContentMoreAndLess = (content: string = '', charLimit: number = 50) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => setExpanded(prev => !prev);

    if (!content) return '-';

    const isTextOverflowing = content.length > charLimit;
    const displayContent = expanded ? content : content.slice(0, charLimit) + (isTextOverflowing ? '...' : '');

    return (
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <span
                style={{
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: expanded ? 'initial' : 1,
                    WebkitBoxOrient: 'vertical'
                }}
            >
                {displayContent}
                {expanded && (
                    <span style={{ cursor: 'pointer', color: '#1890ff' }} onClick={toggleExpand}>
                        {' '}
                        less
                    </span>
                )}
            </span>
            {isTextOverflowing && !expanded && (
                <span style={{ cursor: 'pointer', color: '#1890ff' }} onClick={toggleExpand}>
                    more
                </span>
            )}
        </div>
    );
};

export default RenderContentMoreAndLess;
