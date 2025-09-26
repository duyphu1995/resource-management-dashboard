import { useState } from 'react';

const SampleSplitter = ({ id = 'drag-bar', dir, isDragging, ...props }: any) => {
    const [isFocused, setIsFocused] = useState(false);
    const cn = (...args: any[]) => args.filter(Boolean).join(' ');

    return (
        <div
            id={id}
            data-testid={id}
            tabIndex={0}
            className={cn(
                'sample-drag-bar',
                dir === 'horizontal' && 'sample-drag-bar--horizontal',
                (isDragging || isFocused) && 'sample-drag-bar--dragging'
            )}
            onMouseEnter={() => setIsFocused(true)}
            onMouseLeave={() => setIsFocused(false)}
            {...props}
        >
            <div className={cn('sample-drag-bar__preview', (isDragging || isFocused) && 'active')} />
        </div>
    );
};

export default SampleSplitter;
