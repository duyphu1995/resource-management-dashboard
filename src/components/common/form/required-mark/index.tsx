const RequiredMark = (label: React.ReactNode, { required }: { required: boolean }) => (
    <>
        {label}
        {required && <div className="required">*</div>}
    </>
);

export default RequiredMark;
