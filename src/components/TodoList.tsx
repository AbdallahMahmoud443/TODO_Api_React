import {
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
  useEffect,
  useState,
} from "react";
import Button from "./ui/Button";
import axiosInstance from "../config/axios.config";
import { useQuery } from "@tanstack/react-query";
import userAuthenticatedQuery from "../hooks/useAuthenticatedQuery";

const TodoList = () => {
  const storageKey = "loggedInUser";
  const userDataItem = localStorage.getItem(storageKey);
  const userData = userDataItem ? JSON.parse(userDataItem) : null;

  // status for store fetched todos
  const [todos, setTodos] = useState([]);

  // Fetch Data using useQuery() hook
  const { isPending, error, data } = userAuthenticatedQuery({
    queryKey: ["todo"],
    url: "/users/me?populate=todos",
    config: {
      headers: {
        Authorization: `Bearer ${userData?.jwt}`,
      },
    },
  });

  // return Snipper while fetching data
  if (isPending) return <p className="w-full font-semibold">Loading...⏳</p>;

  /* return paragraph contain error while occurring error (error)=> is server error example forbidden
     and for client side error (error page in rounting will apear when cause error)
  */
  if (error)
    return (
      <p className="w-full font-semibold">
        Error in fetching data😌{error.message}
      </p>
    );

  return (
    <div className="space-y-1 ">
      {data.todos.length ? (
        data.todos.map(
          (todo: {
            id: Key | null | undefined;
            title:
              | string
              | number
              | boolean
              | ReactElement<any, string | JSXElementConstructor<any>>
              | Iterable<ReactNode>
              | ReactPortal
              | null
              | undefined;
          }) => (
            <div
              key={todo.id}
              className="flex items-center justify-between hover:bg-gray-100 duration-300 p-3 rounded-md
            w-full even:bg-gray-100"
            >
              <p className="w-full font-semibold">{todo.title}</p>
              <div className="flex items-center justify-end w-full space-x-3">
                <Button variant={"default"} size={"sm"}>
                  Edit{" "}
                </Button>
                <Button variant={"danger"} size={"sm"}>
                  Remove
                </Button>
              </div>
            </div>
          )
        )
      ) : (
        <p className="w-full font-semibold">Not found Todos yet....😌</p>
      )}
    </div>
  );
};
export default TodoList;
