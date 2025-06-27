const ProgressBar = ({ progress }) => {
  return (
    <div className="w-full bg-gray-800 h-1 fixed top-0 left-0 z-50">
      <div className="bg-blue-500 h-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
      <div className="absolute top-2 right-4 text-blue-400 text-sm font-medium">{Math.round(progress)}%</div>
    </div>
  )
}

export default ProgressBar
