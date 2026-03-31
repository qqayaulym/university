const Button = ({ variant = "primary", className = "", icon: Icon, children, ...props }) => {
  return (
    <button className={`uiButton uiButton-${variant} ${className}`.trim()} {...props}>
      {Icon && <Icon size={18} className="buttonIcon" />}
      {children}
    </button>
  );
};

export default Button;
