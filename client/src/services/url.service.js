import axios from "axios";

const apiUrl=`${process.env.REACT_APP_API_URL}/api`;

const axiosInstance=axios.create({
    baseURL:apiUrl,
    withCredentials:true, //Required to send cookies with credentials
})

export default axiosInstance;