import {ILoginInput, IRegisterInput} from "../interfaces";

export const REGISTER_FORM:IRegisterInput[] = [
  {
    name:"username",
    placeholder:"User Name",
    type:"text",
    validation:{
      required:true,
      minLength:5
    }
  },
  {
    name:"email",
    placeholder:"Email",
    type:"email",
    validation:{
      required:true,
     pattern: /^[a-zA-Z0-9_.±]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/
    }
  },
  {
    name:"password",
    placeholder:"Password",
    type:"password",
    validation:{
      required:true,
      minLength:6
    }
  },
]


export const LOGIN_FORM:ILoginInput[] = [
  {
    name:"identifier",
    placeholder:"Email",
    type:"email",
    validation:{
      required:true,
     pattern: /^[a-zA-Z0-9_.±]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/
  }
},
  {
    name:"password",
    placeholder:"Password",
    type:"password",
    validation:{
      required:true,
      minLength:6
    }
  }
]