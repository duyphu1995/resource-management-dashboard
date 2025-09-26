import { useEffect, useRef } from 'react';

const useCancelableRequest = () => {
    const controllerRef = useRef<AbortController | null>(null);

    const getSignal = () => {
        if (controllerRef.current) {
            controllerRef.current.abort();
        }
        controllerRef.current = new AbortController();
        return controllerRef.current.signal;
    };

    useEffect(() => {
        return () => {
            controllerRef.current?.abort();
        };
    }, []);

    return getSignal;
};

export default useCancelableRequest;
