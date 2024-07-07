import * as yup from "yup";

export const registerSchema = yup
  .object({
    username: yup
      .string()
      .required("UserName is Required")
      .min(5, "UserName should be at least 5 charachters"),
    email: yup
      .string()
      .required("Email is required")
      .matches(/^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/, "Not a valid email address."),
    password: yup
      .string()
      .required("Password is required")
      .min(5, "Password should be at least 6 charachters."),
  })
  .required();

export const loginSchema = yup
  .object({
    identifier: yup
      .string()
      .required("Email is Required")
      .matches(/^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/, "Not A Valid Email Address"),
    password: yup
      .string()
      .required("Password is required")
      .min(6, "Password should be at least 6 charachters."),
  })
  .required();
