"use client"

const CardLayout = ({
  children,
  title,
  className = "",
  headerClassName = "",
  contentClassName = "",
  variant = "default", // "default", "form", "dashboard"
}) => {
  const getCardStyles = () => {
    switch (variant) {
      case "form":
        return "bg-black/70 rounded-[48px] border border-indigo-500/50 backdrop-blur-2xl"
      case "dashboard":
        return "bg-gray-800 bg-opacity-30 backdrop-blur-sm rounded-2xl border border-gray-700"
      default:
        return "bg-gray-900 bg-opacity-40 backdrop-blur-xl border border-gray-700 rounded-2xl"
    }
  }

  return (
    <div className={`${getCardStyles()} p-6 ${className}`}>
      {title && (
        <div className={`mb-6 ${headerClassName}`}>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
        </div>
      )}
      <div className={contentClassName}>{children}</div>
    </div>
  )
}

export default CardLayout
