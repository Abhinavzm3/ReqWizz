import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setAuthUser } from "../redux/authSlice";
import { toast } from "react-toastify";

const LoginSuccess=()=>{
    const dispatch=useDispatch();
    const navigate=useNavigate();
    const params=new URLSearchParams(window.location.search);
    const userParam=params.get("user");

    useEffect(()=>{

        if(userParam){
            try {

        const userData = JSON.parse(decodeURIComponent(userParam));
        dispatch(setAuthUser(userData));
        localStorage.setItem("authUser",JSON.stringify(userData));
        sessionStorage.removeItem("authUser");
        toast.success("login successful")
        navigate('/main')
                
            } catch {
                toast.error("Invalid user data");
        navigate('/login'); 
                
            }
        }

        else navigate('/login')

    },[userParam,dispatch,navigate])

    return (<>Processing Login...</>);
}


export default LoginSuccess;