const Card = ({ className = "", children }) => {
  return <div className={`uiCard ${className}`.trim()}>{children}</div>;
};

export default Card;
