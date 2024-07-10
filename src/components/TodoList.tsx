import { useState } from "react";
import Button from "./ui/Button";
import userAuthenticatedQuery from "../hooks/useAuthenticatedQuery";
import { ITodo } from "../interfaces";
import Modal from "./ui/Modal";
import Input from "./ui/Input";
import Textarea from "./ui/Textarea";
import axiosInstance from "../config/axios.config";

const TodoList = () => {
  const storageKey = "loggedInUser";
  const userDataItem = localStorage.getItem(storageKey);
  const userData = userDataItem ? JSON.parse(userDataItem) : null;

  //* status for store fetched todos
  const [isEditModelOpen, setEditModelOpen] = useState<boolean>(false); // open & close edit model
  const [todoDataEdit, setTodoDataEdit] = useState<ITodo>({
    id: 0,
    title: "",
    description: "",
  }); // data will editbale by edit form
  const [isUpdating, setIsUpdating] = useState<boolean>(false); // Realted With Spinner on edit button
  // const [queryVersion,setQueryVersion] = useState<number>(1);

  //* Fetch Data using useQuery() hook
  const { isPending, error, data } = userAuthenticatedQuery({
    //** todoList-id any chnage in queryKey (useQuery Will Fetch Data Again) unique Keys*/
    queryKey: [`todoList`,`${todoDataEdit.id}`], 
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
  // Related with edit model
  const openEditeModel = (todo: ITodo) => {
    setEditModelOpen(true);
    setTodoDataEdit(todo); // send data of todo to state to display it in fields
  };
  const closeEditeModel = () => {
    setEditModelOpen(false);
    setTodoDataEdit({
      id: 0,
      title: "",
      description: "",
    }); // reset data for fields
  };

  // Related with Field of Edit Model
  const onChangeHandler = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setTodoDataEdit({
      ...todoDataEdit,
      [name]: value,
    });
  };

  // Related with Field of Edit Model
  const submitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsUpdating(true); // to run loader in button
    const { title, description } = todoDataEdit;
    try {
    
      const res = await axiosInstance.put(
        `/todos/${todoDataEdit.id}`,
        { data: { title, description } },
        {
          headers: {
            Authorization: `Bearer ${userData?.jwt}`,
          },
        }
      );
      if (res.status === 200) {
        // setQueryVersion(prev => prev +1) // change in this state to refetch data based on changing in querykey
        closeEditeModel(); // to close model after updating
      }
      console.log(res);
    } catch (error) {
      console.log(error);
    } finally {
      setIsUpdating(false); // stop loading spinner
    }
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
              <Button
                variant={"default"}
                size={"sm"}
                onClick={() => openEditeModel(todo)}
              >
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
        <form className="" onSubmit={submitHandler}>
          <div className="flex flex-col justify-center space-y-2">
            <Input
              name="title"
              placeholder="Edit Todo"
              value={todoDataEdit.title}
              onChange={onChangeHandler}
            />
            <Textarea
              name="description"
              placeholder="Edit Description"
              value={todoDataEdit.description}
              onChange={onChangeHandler}
            />
          </div>
          <div className="flex space-x-2 mt-4">
            <Button variant={"default"} size={"sm"} isLoading={isUpdating}>
              Edit Todo
            </Button>
            <Button variant={"cancel"} size={"sm"} onClick={closeEditeModel}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default TodoList;
