import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../config/axios.config";
import { AxiosRequestConfig } from "axios";

interface IAuthenticatedQuery {
    queryKey:string[];
    url:string
    config?: AxiosRequestConfig

}
// Custom Hook To 
const userAuthenticatedQuery = ({queryKey,url,config}:IAuthenticatedQuery)=>{
    return useQuery({
        queryKey, // this key  used in caching data
        queryFn: async () => {
          const { data } = await axiosInstance.get(url,config);
          return data // this method must return data 
        },
      });
};

export default userAuthenticatedQuery;