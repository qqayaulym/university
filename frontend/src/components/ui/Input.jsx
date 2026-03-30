const Input = ({ className = "", ...props }) => {
  return <input className={`uiInput ${className}`.trim()} {...props} />;
};

export default Input;
