import React from 'react'
import { HiArrowPathRoundedSquare, HiOutlineCreditCard, HiShoppingBag } from 'react-icons/hi2'

const FeaturesSection = () => {
  return (
    <section className='py-16 px-4 bg-white lg:px-0'>
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {/* Features 1 */}
            <div className="flex flex-col items-center">
                <div className="p-4 rounded-full mb-4">
                    <HiShoppingBag className='text-4xl' />
                </div>
                <h3 className="text-lg tracking-tighter font-semibold mb-2">FAST SHIPPING</h3>
                <p className="text-gray-600 text-sm tracking-tighter">Fast worldwide shipping.</p>
            </div>

            {/* Features 2 */}
            <div className="flex flex-col items-center">
                <div className="p-4 rounded-full mb-4">
                    <HiArrowPathRoundedSquare className='text-4xl' />
                </div>
                <h3 className="text-lg tracking-tighter font-semibold mb-2">45 DAYS RETURN</h3>
                <p className="text-gray-600 text-sm tracking-tighter">Money back guarantee.</p>
            </div>
            {/* Features 3 */}
            <div className="flex flex-col items-center">
                <div className="p-4 rounded-full mb-4">
                    <HiOutlineCreditCard className='text-4xl' />
                </div>
                <h3 className="text-lg tracking-tighter font-semibold mb-2">SECURE TRANSACTION</h3>
                <p className="text-gray-600 text-sm tracking-tighter">100% secured transaction process</p>
            </div>
        </div>
    </section>
  )
}

export default FeaturesSection