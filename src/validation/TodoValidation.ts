const todoValidation = (todo: { title: string; description: string }) => {
  const errors: { title: string; description: string } = {
    title: "",
    description: "",
  };
  if (!todo.title.trim() || 
       todo.title.length < 10 || 
       todo.title.length > 30) {
    errors.title = "todo Title Characters Must Be Between 10 and 30";
  }
  if (
    !todo.description.trim() ||
     todo.description.length < 50 ||
     todo.description.length > 200
  ) {
    errors.description = "todo description Characters Must Be Between 50 and 200";
  }
  return errors;
};

export default todoValidation;
