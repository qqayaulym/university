const Button = ({ variant = "primary", className = "", children, ...props }) => {
  return (
    <button className={`uiButton uiButton-${variant} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
};

export default Button;
