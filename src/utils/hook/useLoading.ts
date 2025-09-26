import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const useLoading = () => {
    const location = useLocation();
    const [loadingCount, setLoadingCount] = useState(0);

    const turnOnLoading = useCallback(() => {
        setLoadingCount(count => count + 1);
    }, []);

    const turnOffLoading = useCallback(() => {
        setLoadingCount(count => Math.max(count - 1, 0));
    }, []);

    const isLoading = loadingCount > 0;

    useEffect(() => {
        if (location.pathname) {
            setLoadingCount(0);
        }
    }, [location.pathname]);

    return { isLoading, turnOnLoading, turnOffLoading };
};

export default useLoading;
