import React from 'react'

const Loading = () => {
  return (
    <div className="w-full gap-x-2 flex justify-center items-center">
      <div className="w-5 h-5 bg-[#01BDA5] rounded-full animate-bounce [animation-delay:-0.3s]" />
      <div className="w-5 h-5 bg-[#01A38E] rounded-full animate-bounce [animation-delay:-0.15s]" />
      <div className="w-5 h-5 bg-[#33CAb7] rounded-full animate-bounce" />
    </div>
  )
}

export default Loading