import { useEffect, useState } from "react";
import Button from "./ui/Button";
import axiosInstance from "../config/axios.config";

const TodoList = () => {

  const storageKey = "loggedInUser";
  const userDataItem = localStorage.getItem(storageKey);
  const userData = userDataItem ? JSON.parse(userDataItem) : null;

  // status for store fetched todos
  const [todos, setTodos] = useState([]);

  // Fetch Data From API Using UseEffect
  useEffect(() => {
    try {
      axiosInstance.get('/users/me?populate=todos', {
        headers: {
          Authorization: `Bearer ${userData?.jwt}`
        }
      }).then((data) => setTodos(data?.data?.todos)).catch((err) => console.log('THE ERROR:', err))
    } catch (error) {
      console.log(error);
    }
  }, [userData?.jwt])

  return (

    <div className="space-y-1 ">
      {todos.map((todo) => (
          <div key={todo.id} className="flex items-center justify-between hover:bg-gray-100 duration-300 p-3 rounded-md
            w-full even:bg-gray-100">
            <p className="w-full font-semibold">
              {todo.id}-{todo.title}
            </p>
            <div className="flex items-center justify-end w-full space-x-3">
              <Button variant={"default"} size={"sm"}>Edit </Button>
              <Button variant={"danger"} size={"sm"}>Remove</Button>
            </div>
        </div>))}

    </div>
  )
};
export default TodoList;
