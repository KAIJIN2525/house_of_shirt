import React from 'react'
import { TbBrandMeta } from 'react-icons/tb'
import { IoLogoInstagram } from 'react-icons/io5'
import { RiTwitterXLine } from 'react-icons/ri'

const Topbar = () => {
  return (
    <div className='bg-gray-800 text-white'>
        <div className="container mx-auto flex justify-between items-center py-3 px-10">
            <div className='hidden md:flex items-center space-x-4'>
                <a href="#" className='hover:text-gray-300'>
                    <TbBrandMeta className='size-4'/>
                </a>
                <a href="#" className='hover:text-gray-300'>
                    <IoLogoInstagram className='size-4'/>
                </a>
                <a href="#" className='hover:text-gray-300'>
                    <RiTwitterXLine className='size-4'/>
                </a>
            </div>
            <div className="text-sm text-center flex-grow">
                <span>We ship worldwide - Fast and reliable shipping!</span>
            </div>

            <div className="text-sm hidden md:block">
                <a href="tel:+1234567890" className='hover:text-gray-300' >+1234567890</a>
            </div>
        </div>
    </div>
  )
}

export default Topbar