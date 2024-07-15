import { useState } from "react";
import Button from "./ui/Button";
import useCustomHook from "../hooks/useAuthenticatedQuery";
import { ITodo } from "../interfaces";
import Modal from "./ui/Modal";
import Input from "./ui/Input";
import Textarea from "./ui/Textarea";
import axiosInstance from "../config/axios.config";
import todoValidation from "../validation/TodoValidation";
import InputErrorMessage from "./ui/InputErrorMessage";
import TodoSkeleton from "./TodoSkeleton";
import { faker } from "@faker-js/faker";
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

  // Add New Todo
  const [addModelOpen, setAddModelOpen] = useState<boolean>(false);
  const [addTodoData, setAddTodoData] = useState<ITodo>({
    title: "",
    description: "",
  });

  //* Fetch Data using useQuery() hook
  const { isPending, error, data } = useCustomHook({
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
  if (isPending)
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }, (_, inx) => (
          <TodoSkeleton key={inx} />
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

  const openAddModel = () => {
    setAddModelOpen(true);
    setError({
      title: "",
      description: "",
    });
  };

  const closeAddModel = () => {
    setAddModelOpen(false);
    setAddTodoData({
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

  // Related with Field of Add Model
  const onChangeHandlerAddition = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setAddTodoData({
      ...addTodoData,
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
          { data: { title, description, user: [userData.user?.id] } },
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
  // Related with Field of Edit Model (Update Todo)
  const submitHandlerAddition = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setIsUpdating(true); // to run loader in button
    const { title, description } = addTodoData;

    const errors = todoValidation({ title, description });
    const hasErrorMessage =
      Object.values(errors).some((error) => error === "") &&
      Object.values(errors).every((error) => error === "");
    if (hasErrorMessage) {
      try {
        const res = await axiosInstance.post(
          `/todos`,
          { data: { title, description, user: [userData.user?.id] } },
          {
            headers: {
              Authorization: `Bearer ${userData?.jwt}`,
            },
          }
        );
        if (res.status === 200) {
          setQueryVersion((prev) => prev + 1); // change in this state to refetch data based on changing in querykey
          closeAddModel(); // close model and reset fields
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsUpdating(false); // stop loading spinner
      }
    } else {
      setError(errors);
      setIsUpdating(false);
      return;
    }
  };
  // Related with Generate Fake Todos
  const GenerateFakeTodos = async () => {
    for (let index = 0; index < 20; index++) {
      try {
        const { data } = await axiosInstance.post(
          `/todos`,
          {
            data: {
              title: faker.word.words(4),
              description: faker.lorem.paragraphs(1),
              user: [userData.user?.id],
            },
          },
          {
            headers: {
              Authorization: `Bearer ${userData?.jwt}`,
            },
          }
        );
        console.log(data);
      } catch (error) {
        console.log(error);
      }
    }
    setQueryVersion((prev) => prev + 1); // change in this state to refetch data based on changing in querykey
  };

  return (
    <div className="space-y-2">
      {isPending ? (
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className=" w-40 h-12 bg-gray-300 rounded-md dark:bg-gray-200"></div>
            <div className=" w-40 h-12 bg-gray-300 rounded-md dark:bg-gray-200"></div>
          </div>
        </div>
      ) : (
        <div className="mb-3 flex justify-center space-x-3">
          <Button variant={"default"} onClick={openAddModel} size={"sm"}>
            Add New Todo
          </Button>
          <Button variant={"outline"} size={"sm"} onClick={GenerateFakeTodos}>
            Generate Fake Todos
          </Button>
        </div>
      )}

      {/* Display Todo */}
      {/**
       * Note
       * (Reverse Method) => don't work directly with data comes from API , data should store in state and used reverse method with state data.todos.reverse().map
       *
       */}
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
      {/* Create Model To Edit Todo */}
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
            <Button
              variant={"cancel"}
              size={"sm"}
              onClick={closeEditeModel}
              type={"button"}
            >
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
          <Button onClick={closeDeleteModel} variant={"cancel"} type={"button"}>
            Cancel
          </Button>
        </div>
      </Modal>

      {/* Create Model To Add Todo */}
      <Modal
        isOpen={addModelOpen}
        closeModal={closeAddModel}
        title="Add New Todo"
      >
        <form className="" onSubmit={submitHandlerAddition}>
          <div className="flex flex-col justify-center space-y-2">
            <Input
              name="title"
              placeholder="Add Todo"
              value={addTodoData.title}
              onChange={onChangeHandlerAddition}
            />
            <InputErrorMessage msg={errors["title"]} />
            <Textarea
              name="description"
              placeholder="Add Description"
              value={addTodoData.description}
              onChange={onChangeHandlerAddition}
            />
            <InputErrorMessage msg={errors["description"]} />
          </div>
          <div className="flex space-x-2 mt-4">
            <Button variant={"default"} size={"sm"} isLoading={isUpdating}>
              Add Todo
            </Button>
            <Button
              variant={"cancel"}
              size={"sm"}
              onClick={closeAddModel}
              type={"button"}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default TodoList;
