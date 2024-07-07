import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useForm, SubmitHandler } from "react-hook-form";
import InputErrorMessage from "../components/ui/InputErrorMessage";
import { REGISTER_FORM } from "../data";
import { IErrorResponse, IFormInput } from "../interfaces";
import { yupResolver } from "@hookform/resolvers/yup";
import { registerSchema } from "../validation";
import axiosInstance from "../config/axios.config";
import toast from "react-hot-toast";
import { useState } from "react";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>({ resolver: yupResolver(registerSchema) });

  const navigate = useNavigate();

  //** Handlers*/
  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    setIsLoading(true); // laoding spinner work in button  => (pending request)
    try {
      //** (url,data,config => optional) */
      const {status} = await axiosInstance.post(
        "/auth/local/register",
        data
      );
      /* FullFilled => success => optional */
      if (status === 200) {
        toast.success("Successfuly Registeration Process", {
          duration: 1500,
          position: "top-right",
          // Styling
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
          },
        });
        setTimeout(() => {
          /** This function wait 2 seconds and navigate to login page */
          navigate("/login");
        }, 2000);
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

  //** Renders */
  const registerFormHandler = REGISTER_FORM.map(
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
        Register to Get Access
      </h2>
      <form className="space-y-4 " onSubmit={handleSubmit(onSubmit)}>
        {registerFormHandler}
        <Button fullWidth isLoading={isLoading}>
          Register
        </Button>
      </form>
    </div>
  );
};

export default RegisterPage;
