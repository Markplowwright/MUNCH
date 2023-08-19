import { bhootagni } from '@/data'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const ShopMenuPage = () => {
  return (
    <div className='flex text-main flex-wrap'>
    {bhootagni.map(item=>(
      <Link className='product-container group'  href={`/product/${item.id}`} key={item.id} >
        <div className="product-imgContainer">
        {item.img && <Image src={item.img} fill  alt={item.title} className='object-contain w-fit' />}
        </div>
        <div className="product-textContainer">
          <h1 className='text-xl uppercase p-2'>{item.title}</h1>
          <h2 className='group-hover:hidden text-xl'>Rs {item.price}</h2>
          <button className='btn hidden group-hover:block'>Add to Cart</button>
        </div>
      </Link>
    ))}
    </div>
  )
}

export default ShopMenuPage