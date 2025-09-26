export interface IPrintEditorProps {
    text?: string;
    textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase' | 'full-width' | 'full-size-kana';
    minWidth?: number;
    display?: 'inline-block' | 'inline';
    color?: string;
}

const PrintEditor = (props: IPrintEditorProps) => {
    const { text = '............', textTransform = 'none', display = 'inline-block', minWidth = 10, color = 'red' } = props;

    return (
        <span
            className="print-editor"
            contentEditable={true}
            style={{ color, outline: 'none', textTransform, textAlign: 'left', display, minWidth }}
            dangerouslySetInnerHTML={{ __html: text }}
        />
    );
};

export default PrintEditor;
