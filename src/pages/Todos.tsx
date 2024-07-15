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
  const [pageSize, setPageSize] = useState<number>(20);
  const [sortBy, setSortBy] = useState<string>("ASC");

  //* Fetch Data using useQuery() hook
  const { isPending, error, data, isFetching } = useCustomHook({
    //** todoList-id any chnage in queryKey (useQuery Will Fetch Data Again) unique Keys*/
    queryKey: [`todosPage-${page}-${queryVersion}-${pageSize}-${sortBy}`],
    url: `/todos?pagination[pageSize]=${pageSize}&pagination[page]=${page}&sort=createdAt:${sortBy}`, // Pagination
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
  const onChangeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(+e.target.value);
  };
  const onChangeSortBy = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };
  return (
    <div className="space-y-4 my-6">
      <div className="flex justify-between">
        <Button variant={"default"} size={"sm"} onClick={GenerateFakeTodos}>
          Generate Fake Todos
        </Button>
        <div className="flex space-x-3">
          <span className="p-2  text-gray-600">PageSize:</span>
          <select
            className="border-[1px] shadow-sm border-gray-300  text-gray-900 text-sm rounded-lg
           focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 block w-fit p-2"
            onChange={onChangeSelect}
            value={pageSize}
            
          >
            <option disabled>PageSize</option>
            <option value={20}>20</option>
            <option value={40}>40</option>
            <option value={60}>60</option>
            <option value={80}>80</option>
            <option value={100}>100</option>
          </select>
          <span className="p-2  text-gray-600">Sorting:</span>
          <select
            className="border-[1px] shadow-sm border-gray-300  text-gray-900 text-sm rounded-lg
           focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 block w-fit p-2"
            onChange={onChangeSortBy}
            value={sortBy}
          >
            <option disabled>Sorting</option>
            <option value={"ASC"}>Latest</option>
            <option value={"DESC"}>Oldest</option>
          </select>
        </div>
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
