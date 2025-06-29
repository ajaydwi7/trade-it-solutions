"use client"

import AppLayout from "./AppLayout"

const FormLayout = ({
  children,
  title,
  subtitle,
  progress = 0,
  stepText = "",
  onBack,
  showProgress = true,
  backgroundColor = "solid",
  customBgColor = "#101019",
  className = "",
  formClassName = "",
  showErrorNotification = false,
  errorMessage = "",
  onErrorDismiss,
  variant = "default", // "default", "terms", "auth"
}) => {
  const getFormStyles = () => {
    switch (variant) {
      case "terms":
        return "bg-black/70 rounded-[48px] border border-indigo-500/50 backdrop-blur-2xl"
      case "auth":
        return "bg-black/20 backdrop-blur-2xl border border-indigo-500/50 rounded-3xl"
      default:
        return "bg-gray-900 bg-opacity-40 backdrop-blur-xl border border-gray-700 rounded-2xl"
    }
  }

  return (
    <AppLayout
      showProgress={showProgress}
      progress={progress}
      showPercent={true}
      showBackButton={!!onBack}
      onBack={onBack}
      stepText={stepText}
      backgroundColor={backgroundColor}
      customBgColor={customBgColor}
      centerContent={true}
      maxWidth="max-w-5xl"
      className={className}
      showErrorNotification={showErrorNotification}
      errorMessage={errorMessage}
      onErrorDismiss={onErrorDismiss}
      topSpacing="top-20"
    >
      <div className="w-full">
        {/* Header Section */}
        {(title || subtitle) && (
          <div className="text-center mb-8">
            {title && <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h1>}
            {subtitle && <p className="text-gray-300 text-lg">{subtitle}</p>}
          </div>
        )}

        {/* Form Content */}
        <div className={`${getFormStyles()} p-8 ${formClassName}`}>{children}</div>
      </div>
    </AppLayout>
  )
}

export default FormLayout
