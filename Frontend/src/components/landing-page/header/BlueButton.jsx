import React from 'react'

const BlueButton = (props) => {
  return (
    <button className='py-2 px-4 bg-white text-primary shadow-md rounded-xl hover:bg-[#0143B4]'>{props.button}</button>
  )
}

export default BlueButton

