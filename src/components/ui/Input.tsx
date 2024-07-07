import { InputHTMLAttributes, Ref, forwardRef } from "react";



interface IProps extends InputHTMLAttributes<HTMLInputElement>{
}
// forwardRef to access value of filed outside component with react hook form must use forwardRef() function
const Input = forwardRef(({...rest}: IProps,ref:Ref<HTMLInputElement>) => { 
    return (
        <>
        <input ref ={ref} className="border-[1px] shadow-sm border-gray-300  text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 focus:outline-none block w-full p-2.5"  {...rest}/>
        </>
    );
});
export default Input;