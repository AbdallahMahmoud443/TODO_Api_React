interface IProps {
  msg?: string;
}
const InputErrorMessage = ({ msg }: IProps) => {
  return msg ? (
    <span className="block text-red-700 font-semibold text-sm mt-1">{msg}</span>
  ) : null;
};

export default InputErrorMessage;
