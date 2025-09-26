import './index.scss';

const LoadingPage = () => {
    return (
        <div className="loading-page">
            <img src="/media/logo.png" alt="HRM Tool" className="loading-logo"></img>
            <div className="loading-dots-container">
                <div className="loading-dots">
                    <div className="loading-dot red"></div>
                    <div className="loading-dot primary"></div>
                    <div className="loading-dot green"></div>
                </div>
            </div>
        </div>
    );
};

export default LoadingPage;
