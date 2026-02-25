interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost"
  }
  
  export function Button({
    variant = "primary",
    className = "",
    ...props
  }: ButtonProps) {
    const variants = {
      primary: "bg-primary text-white hover:bg-blue-700",
      secondary: "bg-secondary text-white hover:bg-slate-800",
      ghost: "bg-transparent text-primary hover:bg-white/10",
    }
  
    return (
      <button
        {...props}
        className={`
          px-4 py-2 rounded-xl font-medium transition
          ${variants[variant]}
          ${className}
        `}
      />
    )
  }
  