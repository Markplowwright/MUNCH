"use client"
import { productType } from '@/app/api/product/type'
import { baseUrl } from '@/baseUrl'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import FormContainer from '@/components/common/FormContainer'
import ImgContainer from '@/components/common/ImgContainer'
import Loader from '@/components/common/Loader'
import {  productOptionType } from '@/types/types'
import {  editProductFormData } from '@/utils/formData'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
type Props={
  params:{id:string}
}
const  Page = ({params}:Props) => {
  const [data,setData]=useState<any>()
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [productData, setProductData] = useState<productType>()
  const router = useRouter()
  const [options, setOptions] = useState<productOptionType[]>([])
  useEffect(() => {
    const getData = async (id:string) => {
      try {
        const response = await axios.get(`${baseUrl}/product/${id}`)
        setData(response.data);
      } catch (error: any) {
        setData(error.response)
      }
    }
    getData(params.id)
  }, [params.id])

  const handleUploadImage = async () => {
      try {
          const formData = new FormData();
          formData.append('file', selectedImage!);
          formData.append('type', "single");
          const imageResponse = await axios.post(`${baseUrl}/upload-image`, formData)
          return imageResponse.data.imgUrls;
      } catch (error) {
          toast.error("Image upload failed")
          return null;
      }
  }
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      try {
          let imgUrl;
          if (selectedImage) {
              imgUrl = await handleUploadImage()
          }
          const response = await axios.put(`${baseUrl}/product/${params.id}`, {title:productData?.title,desc:productData?.desc,type:productData?.type,img:imgUrl,options, price:productData?.price})
          toast.success(response.data.message);
          router.push(`/product/${response.data.updatedProduct.id}`)
      } catch (error: any) {
          console.log(error)
          toast.error(error.response.data.message)
      }
  }
  const handleImageChange = (selectedImage: File | null) => {
      setSelectedImage(selectedImage);
  };
  const handleSave = async (formDetails: productType, optionDetails: productOptionType[]) => {
      try {
          setProductData(formDetails)
          setOptions(optionDetails)
          setConfirmOpen(true)
      } catch (error) {
          toast.error("Something went wrong")
      }
  }
  if(data && data.error){
    return <div>Something went wrong</div>
  }
  if(!data){
    return <Loader message='Edit food details easliy on munch' />
  }
  return (
    <div>
    <div className='main flex flex-col md:flex-row gap-14 md:gap-4 items-center justify-center hideScrollBar w-full'>
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleSubmit}
        title="Confirm Action"
        message="Are you sure you want to perform this action?"
      />
      <div className=" w-full h-1/2 md:h-1/2 md:w-1/2 flex items-center justify-center">
        <ImgContainer type='singleProduct' alt='add image' edit={true} imgUrl={data.product.img} func={handleImageChange} />
      </div>
      <FormContainer onSave={handleSave} data={editProductFormData} originalData={data.product}  originalAdditionalOptions={data.product.options} additional={true} title="Edit shop" />
    </div>
    </div>
  )
}

export default Page 