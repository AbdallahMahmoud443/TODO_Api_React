import { useState } from "react";
import Button from "./ui/Button";
import userAuthenticatedQuery from "../hooks/useAuthenticatedQuery";
import { ITodo } from "../interfaces";
import Modal from "./ui/Modal";
import Input from "./ui/Input";
import Textarea from "./ui/Textarea";
import axiosInstance from "../config/axios.config";
import todoValidation from "../validation/TodoValidation";
import InputErrorMessage from "./ui/InputErrorMessage";
import TodoSkeleton from "./TodoSkeleton";

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
  const [queryVersion, setQueryVersion] = useState<number>(1); // Related with react Query

  // Create state for errors (appear when submit data to create and update todos )
  const [errors, setError] = useState({ title: "", description: "" });

  // Delete Todo
  const [deleteModelOpen, setDeleteModelOpen] = useState<boolean>(false);
  const [deleteTodoData, setDeleteTodoData] = useState<ITodo>({
    id: 0,
    title: "",
    description: "",
  });

  //* Fetch Data using useQuery() hook
  const { isPending, error, data } = userAuthenticatedQuery({
    //** todoList-id any chnage in queryKey (useQuery Will Fetch Data Again) unique Keys*/
    queryKey: [`todoList`, `${queryVersion}`],
    url: "/users/me?populate=todos",
    config: {
      headers: {
        Authorization: `Bearer ${userData?.jwt}`,
      },
    },
  });
  
  // return Skeleton while fetching data
  if (isPending) return (
    <div className="space-y-2">
    {Array.from({length:3},(_,inx)=>(
      <TodoSkeleton key={inx}/>
    ))}
    </div>

  );
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
    setError({
      title: "",
      description: "",
    });
  };
  const closeEditeModel = () => {
    setEditModelOpen(false);
    setTodoDataEdit({
      id: 0,
      title: "",
      description: "",
    }); // reset data for fields
  };

  const openDeleteModel = (todo: ITodo) => {
    setDeleteModelOpen(true);
    setDeleteTodoData(todo);
  };
  const closeDeleteModel = () => {
    setDeleteModelOpen(false);
    setDeleteTodoData({
      id: 0,
      title: "",
      description: "",
    });
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
    setError({ ...errors, [name]: "" }); //* to show error when write error will disappear important
  };

  // Related with Field of Edit Model (Update Todo)
  const submitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsUpdating(true); // to run loader in button
    const { title, description } = todoDataEdit;

    const errors = todoValidation({ title, description });
    const hasErrorMessage =
      Object.values(errors).some((error) => error === "") &&
      Object.values(errors).every((error) => error === "");
    if (hasErrorMessage) {
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
          setQueryVersion((prev) => prev + 1); // change in this state to refetch data based on changing in querykey
          closeEditeModel(); // close model and reset fields
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsUpdating(false); // stop loading spinner
      }
    } else {
      setError(errors);
      console.log(errors);
      setIsUpdating(false);
      return;
    }
  };

  // Related delete Model (delete Todo)
  const deleteTodoHandler = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    try {
      const { status } = await axiosInstance.delete(
        `/todos/${deleteTodoData.id}`,
        {
          headers: {
            Authorization: `Bearer ${userData?.jwt}`,
          },
        }
      );
      if (status === 200) {
        closeDeleteModel();
        setQueryVersion((prev) => prev + 1); // change in this state to refetch data based on changing in querykey
      }
    } catch (error) {
      console.log(error);
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
              <Button
                variant={"danger"}
                size={"sm"}
                onClick={() => {
                  openDeleteModel(todo);
                }}
              >
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
            <InputErrorMessage msg={errors["title"]} />
            <Textarea
              name="description"
              placeholder="Edit Description"
              value={todoDataEdit.description}
              onChange={onChangeHandler}
            />
            <InputErrorMessage msg={errors["description"]} />
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
      {/** Delete Model */}
      <Modal
        isOpen={deleteModelOpen}
        closeModal={closeDeleteModel}
        title="Are you sure you want to remove this Product from your Store?"
        description="Deleting this product will remove it permanently from your inventory. Any associated data, sales history, and other related information will also be deleted. Please make sure this is the intended action."
      >
        <div className="flex items-center space-x-3 mt-2">
          <Button variant={"danger"} onClick={deleteTodoHandler}>
            Yes, remove
          </Button>
          <Button onClick={closeDeleteModel} variant={"cancel"}>
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
};
export default TodoList;
