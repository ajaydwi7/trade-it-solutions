"use client"

import { useState, useEffect } from "react"
import ProgressBar from "../ProgressBar"
import { ArrowLeft } from "lucide-react"

const AppLayout = ({
  children,
  showProgress = false,
  progress = 0,
  showPercent = false,
  showBackButton = false,
  onBack,
  stepText = "",
  backgroundColor = "gradient", // "gradient", "solid", or custom color
  customBgColor = "#101019",
  showBackgroundImages = false,
  className = "",
  containerClassName = "",
  contentClassName = "",
  maxWidth = "max-w-6xl",
  padding = "px-4",
  centerContent = true,
  minHeight = "min-h-screen",
  showErrorNotification = false,
  errorMessage = "",
  onErrorDismiss,
  topSpacing = "pt-8",
}) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const getBackgroundStyle = () => {
    if (backgroundColor === "gradient") {
      return "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
    } else if (backgroundColor === "solid") {
      return ""
    } else {
      return ""
    }
  }

  const getCustomBackgroundStyle = () => {
    if (backgroundColor === "solid" || (backgroundColor !== "gradient" && customBgColor)) {
      return { backgroundColor: customBgColor }
    }
    return {}
  }

  return (
    <div
      className={`${minHeight} relative overflow-hidden ${getBackgroundStyle()} ${className}`}
      style={getCustomBackgroundStyle()}
    >
      {/* Background Images - Only show if enabled */}
      {showBackgroundImages && (
        <>
          <div className="absolute inset-0 hidden md:block">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WEB%20BACKGROUND.png-OZ4OMdtxyVzgNZTsKH6DnBI8zA47Ol.jpeg"
              alt="Background"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 md:hidden">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/MOBILE%20BACKGROUND.jpg-PHaF8vfpeVmOjN6jtm4jvvI91pnyCR.jpeg"
              alt="Mobile Background"
              className="w-full h-full object-cover"
            />
          </div>
        </>
      )}

      {/* Progress Bar */}
      {showProgress && (
        <div className="relative z-10">
          <ProgressBar progress={progress} showPercent={showPercent} />
        </div>
      )}

      {/* Error Notification */}
      {showErrorNotification && errorMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg z-50 shadow-lg">
          {errorMessage}
          {onErrorDismiss && (
            <button onClick={onErrorDismiss} className="ml-2 text-white hover:text-gray-200">
              ×
            </button>
          )}
        </div>
      )}

      {/* Main Content Container */}
      <div className={`relative z-10 ${containerClassName}`}>
        <div
          className={`${maxWidth} mx-auto ${padding} ${centerContent ? "flex items-center justify-center" : ""} ${minHeight} ${contentClassName}`}
        >
          {/* Back Button and Step Indicator */}
          {(showBackButton || stepText) && (
            <div className={`absolute ${topSpacing} left-8 flex items-center gap-4 text-white z-20`}>
              {showBackButton && onBack && (
                <button
                  onClick={onBack}
                  className="rounded-full border border-white/20 hover:bg-white/10 p-2 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              {stepText && <div className="text-xl font-medium">{stepText}</div>}
            </div>
          )}

          {/* Main Content */}
          <div className="w-full">{children}</div>
        </div>
      </div>
    </div>
  )
}

export default AppLayout
