import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema } from "../validation";
import { useState } from "react";
import { LOGIN_FORM } from "../data";
import Input from "../components/ui/Input";
import InputErrorMessage from "../components/ui/InputErrorMessage";
import Button from "../components/ui/Button";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { IErrorResponse } from "../interfaces";
import axiosInstance from "../config/axios.config";
// import {useNavigate } from "react-router-dom";

interface IFormInput {
  identifier: string;
  password: string;
}
const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>({ resolver: yupResolver(loginSchema) });

  //const navigate = useNavigate();

  // state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // Handlers
  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    setIsLoading(true); // laoding spinner work in button  => (pending request)
    try {
      //** (url,data,config => optional) */
      const { status, data: userDate } = await axiosInstance.post(
        "/auth/local",
        data
      );
      /* FullFilled => success => optional */
      if (status === 200) {
        toast.success("Successfully Login Process", {
          duration: 1500,
          position: "top-right",
          // Styling
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
          },
        });
        // store information of user after login process in local storage
        localStorage.setItem("loggedInUser",JSON.stringify(userDate))
        setTimeout(()=>{
          // navigate('/') not work with routes because not reload page to detect item in local storage
          location.replace('/'); // refresh page to understand item add in local storage
        },2000);
      }
    } catch (error) {
      /** rejected  => optional */
      // IErrorResponse is type of error object that return from AxiosError this is (trick)
      const errorObj = error as AxiosError<IErrorResponse>;
      const errormessage = errorObj.response?.data?.error?.message;
      toast.error(`${errormessage}`, {
        duration: 1500,
        position: "top-right",
        // Styling
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
    } finally {
      setIsLoading(false); /* Stop loading spinner in button */
    }
  };

  // Renders
  const loginFormHandler = LOGIN_FORM.map(
    ({ name, placeholder, type, validation }, idx) => {
      return (
        <div className="mb-3" key={idx}>
          <Input
            {...register(name, validation)}
            placeholder={placeholder}
            type={type}
          />
          {errors[name] && <InputErrorMessage msg={errors[name]?.message} />}
        </div>
      );
    }
  );
  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-center mb-4 text-3xl font-semibold">
        Login to get access!
      </h2>
      <form className="space-y-4 " onSubmit={handleSubmit(onSubmit)}>
        {loginFormHandler}
        <Button fullWidth isLoading={isLoading}>
          Register
        </Button>
      </form>
    </div>
  );
};

export default LoginPage;
