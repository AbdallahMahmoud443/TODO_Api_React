import {
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
  useState,
} from "react";
import Button from "./ui/Button";
import userAuthenticatedQuery from "../hooks/useAuthenticatedQuery";
import { ITodo } from "../interfaces";
import Modal from "./ui/Modal";
import Input from "./ui/Input";
import Textarea from "./ui/Textarea";

const TodoList = () => {
  const storageKey = "loggedInUser";
  const userDataItem = localStorage.getItem(storageKey);
  const userData = userDataItem ? JSON.parse(userDataItem) : null;

  //* status for store fetched todos
  const [todos, setTodos] = useState([]);
  const [isEditModelOpen, setEditModelOpen] = useState<boolean>(false);
  const [todoDataEdit,setTodoDataEdit] = useState<ITodo>({
    id:0,
    title:"",
    description:""
  });

  //* Fetch Data using useQuery() hook
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

  //* Handers

  // realted with edit model
  const openEditeModel = (todo:ITodo) => {
    setEditModelOpen(true);
    setTodoDataEdit(todo); // send data of todo to state to display it in fields
  };
  const closeEditeModel = () => {
    setEditModelOpen(false);
    setTodoDataEdit({
      id:0,
      title:"",
      description:""
    }); // reset data for fields
  };

  return (
    <div className="space-y-1 ">
      {/* Display Todo */}
      {data.todos.length ? (
        data.todos.map((todo: ITodo) => (
          <div
            key={todo.id}
            className="flex items-center justify-between hover:bg-gray-100 duration-300 p-3 rounded-md
            w-full even:bg-gray-100"
          >
            <p className="w-full font-semibold">{todo.title}</p>
            <div className="flex items-center justify-end w-full space-x-3">
              <Button variant={"default"} size={"sm"} onClick={()=>openEditeModel(todo)}>
                Edit
              </Button>
              <Button variant={"danger"} size={"sm"}>
                Remove
              </Button>
            </div>
          </div>
        ))
      ) : (
        <p className="w-full font-semibold">Not found Todos yet....😌</p>
      )}
      {/* Create Model To Edit Tod */}
      <Modal
        isOpen={isEditModelOpen}
        closeModal={closeEditeModel}
        title="Edit Todo"
      >
        <div className="flex flex-col justify-center space-y-2">
          <Input placeholder="Edit Todo" value={todoDataEdit.title}/>
          <Textarea placeholder="Edit Description" value={todoDataEdit.description}/>
        </div>
        <div className="flex space-x-2 mt-4">
        <Button variant={"default"} size={"sm"}>
          Edit Todo
        </Button>
        <Button variant={"cancel"} size={"sm"} onClick={closeEditeModel}>
          Cancel
        </Button>
        </div>
      </Modal>
    </div>
  );
};
export default TodoList;
