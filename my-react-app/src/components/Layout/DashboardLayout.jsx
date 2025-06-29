"use client"

import AppLayout from "./AppLayout"

const DashboardLayout = ({
  children,
  sidebar,
  backgroundColor = "gradient",
  showBackgroundImages = true,
  className = "",
}) => {
  return (
    <AppLayout
      backgroundColor={backgroundColor}
      showBackgroundImages={showBackgroundImages}
      centerContent={false}
      padding=""
      className={className}
    >
      <div className="flex min-h-screen">
        {/* Sidebar */}
        {sidebar && (
          <div className="w-80 bg-gray-800 bg-opacity-50 backdrop-blur-sm border-r border-gray-700 p-6">{sidebar}</div>
        )}

        {/* Main Content */}
        <div className="flex-1">{children}</div>
      </div>
    </AppLayout>
  )
}

export default DashboardLayout
