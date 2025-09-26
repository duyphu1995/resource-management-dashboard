import pathnames from '@/pathnames';
import { selectAuth } from '@/redux/auth-slice';
import { useAppSelector } from '@/redux/store';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigation = useNavigate();
    const currentUser = useAppSelector(selectAuth).currentUser;

    useEffect(() => {
        if (currentUser) navigation(pathnames.groupManagement.main.path + '/' + currentUser.projectId);
    }, [navigation, currentUser]);
    return null;
};

export default Home;
