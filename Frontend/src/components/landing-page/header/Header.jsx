import React from 'react'
import BlueButton from './BlueButton'
import TransparentButton from './TransparentButton'
import Logo from '../../../assets/skillsync-logo1.png'

const Header = () => {
  return (
    <div className='h-16 bg-primary shadow-xl w-rel flex justify-between items-center sticky top-0 z-50 px-20'>
      <div className='flex gap-2 items-center'>
          <img className='h-12 w-auto' src={Logo} alt="" />
          <span className='text-2xl text-white font-semibold'>SkillSync</span>

      </div>
        <div className='flex gap-12 justify-between'>
            <div className='flex items-center gap-12 text-white'>
                <a href="">Features</a>
                <a href="">About Us</a>
                <a href="">Contact Us</a>
                {/* <a href="">Work with us</a> */}
            </div>
            <div className='flex gap-4'>
                {/* <TransparentButton button="Login"/> */}
                <BlueButton button="Get Started"/>
            </div>
        </div>
    </div>  
  )
}

export default Header