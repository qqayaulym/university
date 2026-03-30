const StatusMessage = ({ type = "info", children }) => {
  if (!children) return null;
  return <p className={`statusText ${type}`}>{children}</p>;
};

export default StatusMessage;
