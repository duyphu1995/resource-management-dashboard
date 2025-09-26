import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import './index.scss';

const NotFoundPage = () => {
    const navigation = useNavigate();

    return (
        <div className="page-not-found-container">
            <div className="page-not-found-content">
                <svg width="298" height="298" viewBox="0 0 298 298" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M53.9407 109.162L16.6907 169.693C15.806 171.127 15.7688 172.934 16.5929 174.405C17.4171 175.877 18.9723 176.789 20.6578 176.789H62.5641C65.1343 176.789 67.2203 174.703 67.2203 172.133C67.2203 169.563 65.1343 167.477 62.5641 167.477H28.9925L61.875 114.042C63.2206 111.853 62.5361 108.985 60.3477 107.635C58.1593 106.289 55.291 106.974 53.9407 109.162Z"
                        fill="url(#paint0_linear_4487_84970)"
                    />
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M57.9082 148.852V214.039C57.9082 216.609 59.9942 218.695 62.5645 218.695C65.1347 218.695 67.2207 216.609 67.2207 214.039V148.852C67.2207 146.281 65.1347 144.195 62.5645 144.195C59.9942 144.195 57.9082 146.281 57.9082 148.852Z"
                        fill="url(#paint1_linear_4487_84970)"
                    />
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M268.128 109.162L230.878 169.693C229.994 171.127 229.956 172.934 230.78 174.405C231.605 175.877 233.16 176.789 234.845 176.789H276.752C279.322 176.789 281.408 174.703 281.408 172.133C281.408 169.563 279.322 167.477 276.752 167.477H243.18L276.062 114.042C277.408 111.853 276.724 108.985 274.535 107.635C272.347 106.289 269.479 106.974 268.128 109.162Z"
                        fill="url(#paint2_linear_4487_84970)"
                    />
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M272.096 148.852V214.039C272.096 216.609 274.182 218.695 276.752 218.695C279.322 218.695 281.408 216.609 281.408 214.039V148.852C281.408 146.281 279.322 144.195 276.752 144.195C274.182 144.195 272.096 146.281 272.096 148.852Z"
                        fill="url(#paint3_linear_4487_84970)"
                    />
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M89.3374 147.008C94.9016 143.796 104.112 149.318 109.895 159.333C115.678 169.349 115.855 180.086 110.291 183.299C104.726 186.512 95.5162 180.99 89.7332 170.974C83.9501 160.958 83.7732 150.221 89.3374 147.008Z"
                        fill="url(#paint4_linear_4487_84970)"
                        className="page-not-found-ghost"
                    />
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M210.926 148.985C205.967 144.897 195.97 148.822 188.613 157.748C181.256 166.67 179.31 177.23 184.264 181.318C189.223 185.407 199.22 181.481 206.577 172.555C213.934 163.634 215.88 153.074 210.926 148.985Z"
                        fill="url(#paint5_linear_4487_84970)"
                        className="page-not-found-ghost"
                    />
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M153.361 92.0067C178.524 92.4258 201.814 113.942 199.924 152.538C198.76 176.229 184.088 182.692 175.953 208.408C171.986 220.952 171.577 233.617 171.721 240.471C171.781 241.822 171.251 243.13 170.268 244.052C169.286 244.979 167.945 245.43 166.604 245.286C136.319 240.807 97.4863 200.628 97.4863 161.85C97.4863 120.731 122.528 91.4899 153.361 92.0067Z"
                        fill="url(#paint6_linear_4487_84970)"
                        className="page-not-found-ghost"
                    />
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M100.196 180.15C98.4502 174.106 97.4863 167.964 97.4863 161.85C97.4863 120.731 122.528 91.4899 153.361 92.0067C172.424 92.3234 190.416 104.751 197.191 127.539C193.591 162.735 166.301 190.137 133.218 190.137C121.149 190.137 109.853 186.487 100.196 180.15Z"
                        fill="url(#paint7_linear_4487_84970)"
                        className="page-not-found-ghost"
                    />
                    <path
                        d="M148.705 172.133C153.848 172.133 158.018 165.879 158.018 158.164C158.018 150.449 153.848 144.195 148.705 144.195C143.562 144.195 139.393 150.449 139.393 158.164C139.393 165.879 143.562 172.133 148.705 172.133Z"
                        fill="url(#paint8_linear_4487_84970)"
                        className="page-not-found-ghost"
                    />
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        className="page-not-found-ghost"
                        d="M134.559 126.184C135.402 129.267 135.453 134.496 130.848 137.611C129.782 138.328 129.503 139.776 130.22 140.842C130.941 141.909 132.389 142.188 133.451 141.466C140.142 136.95 140.272 129.434 139.053 124.96C138.713 123.717 137.432 122.986 136.194 123.325C134.955 123.661 134.224 124.941 134.559 126.184Z"
                        fill="url(#paint9_linear_4487_84970)"
                    />
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        className="page-not-found-ghost"
                        d="M158.357 124.96C157.137 129.434 157.268 136.95 163.959 141.466C165.02 142.188 166.468 141.909 167.19 140.842C167.907 139.776 167.628 138.328 166.562 137.611C161.957 134.496 162.008 129.267 162.851 126.184C163.186 124.941 162.455 123.661 161.216 123.325C159.978 122.986 158.697 123.717 158.357 124.96Z"
                        fill="url(#paint10_linear_4487_84970)"
                    />
                    <ellipse cx="157.705" cy="263.836" rx="60" ry="11" fill="#EAF5FB" />
                    <defs>
                        <linearGradient
                            id="paint0_linear_4487_84970"
                            x1="22.5529"
                            y1="124.039"
                            x2="73.3852"
                            y2="217.182"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop stopColor="#258CC2" />
                            <stop offset="1" stopColor="#2A9AD6" />
                        </linearGradient>
                        <linearGradient
                            id="paint1_linear_4487_84970"
                            x1="22.5533"
                            y1="124.038"
                            x2="73.3856"
                            y2="217.182"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop stopColor="#0573AE" />
                            <stop offset="1" stopColor="#2A9AD6" />
                        </linearGradient>
                        <linearGradient
                            id="paint2_linear_4487_84970"
                            x1="229.98"
                            y1="121.11"
                            x2="287.484"
                            y2="218.696"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop stopColor="#2A9AD6" />
                            <stop offset="1" stopColor="#2A9AD6" />
                        </linearGradient>
                        <linearGradient
                            id="paint3_linear_4487_84970"
                            x1="229.98"
                            y1="121.11"
                            x2="287.485"
                            y2="218.695"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop stopColor="#0573AE" />
                            <stop offset="1" stopColor="#2A9AD6" />
                        </linearGradient>
                        <linearGradient
                            id="paint4_linear_4487_84970"
                            x1="83.1399"
                            y1="150.957"
                            x2="109.327"
                            y2="176.627"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop stopColor="#A4BBDB" />
                            <stop offset="1" stopColor="#8DA3BE" />
                        </linearGradient>
                        <linearGradient
                            id="paint5_linear_4487_84970"
                            x1="220.825"
                            y1="154.126"
                            x2="181.564"
                            y2="175.489"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop stopColor="#A4BBDB" />
                            <stop offset="1" stopColor="#8DA3BE" />
                        </linearGradient>
                        <linearGradient
                            id="paint6_linear_4487_84970"
                            x1="97.4863"
                            y1="168.653"
                            x2="200.031"
                            y2="168.653"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop stopColor="#CADCF0" />
                            <stop offset="1" stopColor="#A4BBDB" />
                        </linearGradient>
                        <linearGradient
                            id="paint7_linear_4487_84970"
                            x1="109.369"
                            y1="117.56"
                            x2="197.191"
                            y2="127.539"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop stopColor="#E9F3FC" />
                            <stop offset="1" stopColor="#CADCF0" />
                        </linearGradient>
                        <linearGradient
                            id="paint8_linear_4487_84970"
                            x1="128.837"
                            y1="124.765"
                            x2="170.939"
                            y2="172.515"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop stopColor="#738BAB" />
                            <stop offset="1" stopColor="#526B8F" />
                        </linearGradient>
                        <linearGradient
                            id="paint9_linear_4487_84970"
                            x1="128.837"
                            y1="124.764"
                            x2="170.939"
                            y2="172.514"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop stopColor="#738BAB" />
                            <stop offset="1" stopColor="#526B8F" />
                        </linearGradient>
                        <linearGradient
                            id="paint10_linear_4487_84970"
                            x1="128.837"
                            y1="124.764"
                            x2="170.938"
                            y2="172.514"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop stopColor="#738BAB" />
                            <stop offset="1" stopColor="#526B8F" />
                        </linearGradient>
                    </defs>
                </svg>
                <h1 className="page-not-found-title">PAGE NOT FOUND</h1>
                <p className="page-not-found-text">OOPS!!! The page you were looking for, couldn’t be found</p>
                <Button type="primary" onClick={() => navigation('/')}>
                    Back to home
                </Button>
            </div>
        </div>
    );
};

export default NotFoundPage;
