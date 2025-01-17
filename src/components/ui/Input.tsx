import { InputHTMLAttributes, Ref, forwardRef } from "react";



interface IProps extends InputHTMLAttributes<HTMLInputElement>{
}
// forwardRef to access value of filed outside component with react hook form must use forwardRef() function
const Input = forwardRef(({...rest}: IProps,ref:Ref<HTMLInputElement>) => { 
    return (
        <>
        <input ref ={ref} className="border-[1px] shadow-sm border-gray-300  text-gray-900 text-sm rounded-lg focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 block w-full p-2.5"  {...rest}/>
        </>
    );
});
export default Input;