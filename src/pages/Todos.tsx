import { useState } from "react";
import TodoSkeleton from "../components/TodoSkeleton";
import Paginator from "../components/ui/Paginator";
import useCustomHook from "../hooks/useAuthenticatedQuery";
import Button from "../components/ui/Button";
import { faker } from "@faker-js/faker";
import axiosInstance from "../config/axios.config";

const TodosPage = () => {
  const storageKey = "loggedInUser";
  const userDataItem = localStorage.getItem(storageKey);
  const userData = userDataItem ? JSON.parse(userDataItem) : null;

  const [queryVersion, setQueryVersion] = useState<number>(1); // Related with react Query
  // Page State Realated with pagination
  const [page, setPage] = useState<number>(1);

  //* Fetch Data using useQuery() hook
  const { isPending, error, data, isFetching } = useCustomHook({
    //** todoList-id any chnage in queryKey (useQuery Will Fetch Data Again) unique Keys*/
    queryKey: [`todosPage-${page}-${queryVersion}`],
    url: `/todos?pagination[pageSize]=10&pagination[page]=${page}`, // Pagination
    config: {
      headers: {
        Authorization: `Bearer ${userData?.jwt}`,
      },
    },
  });

  // return Skeleton while fetching data
  if (isPending) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }, (_, inx) => (
          <TodoSkeleton key={inx} />
        ))}
      </div>
    );
  }
  // Print error
  if (error) {
    return (
      <p className="w-full font-semibold">
        Error in fetching data😌{error.message}
      </p>
    );
  }
  console.log(data);
  // setpage count

  //* Handlers
  const btnNextHandler = () => {
    setPage((prev) => prev + 1);
  };
  const btnPreviousHandler = () => {
    setPage((prev) => prev - 1);
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
    
    <div className="space-y-4 my-6">
      <div>
      <Button variant={"default"} size={"sm"} onClick={GenerateFakeTodos}>
            Generate Fake Todos
          </Button>
      </div>
      {data.data.length ? (
        data.data.map(
          ({
            id,
            attributes,
          }: {
            id: number;
            attributes: { title: string };
          }) => (
            <div
              key={id}
              className="flex items-center justify-between hover:bg-gray-100 duration-300 p-3 rounded-md
            w-full even:bg-gray-100"
            >
              <p className="w-full font-semibold">
                {id}-{attributes.title}
              </p>
            </div>
          )
        )
      ) : (
        <p className="w-full font-semibold">Not found Todos yet....😌</p>
      )}
      <Paginator
        page={page}
        btnNext={btnNextHandler}
        btnPrevious={btnPreviousHandler}
        pageCount={data.meta.pagination.pageCount}
        total={data.meta.pagination.total}
        // isPending => get new data (loading), isfetching => get cashing data (loading
        isloading={isPending || isFetching}

      />
    </div>
  );
};

export default TodosPage;
