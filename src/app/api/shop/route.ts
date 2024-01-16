// "use server"

import { NextRequest, NextResponse } from "next/server"
import { getUserDetails } from "../utils/action"
import { prisma } from "@/utils/connect"
import { shopType } from "./types";


export const PUT=async(req:NextRequest)=>{   //verify shop by admin  //take id in json  //delete shop by admin
    try {
        const {slug,action}=await req.json();
        const user=await getUserDetails(req);
        if(user==null){
            return NextResponse.json({
                error:true,
                message:"Login first to add shop",
                status:403
            },{status:403})
        }
        if(user.role!=="Admin"){
                return NextResponse.json({
                    error:true,
                    message:"Only admin can verify shop",
                    status:403
                },{status:403})
        }
        let updatedShop;
        if(action==="verify"){
            updatedShop=await prisma.shop.update({where:{slug:slug},data:{
                verified:true
            }})
        }
        else if(action==="delete"){
            updatedShop=await prisma.shop.update({where:{slug:slug},data:{
                softDelete:true
            }})
        }
        else if(action==="recover"){
            updatedShop=await prisma.shop.update({where:{slug:slug},data:{
                softDelete:false
            }})
        }
        return NextResponse.json({
            error:false,
            message:"Shop updated Successfully",
            status:201,
            updatedShop
        },{status:201})
    } catch (error) {
        console.log(error)
        return NextResponse.json({
            error:true,
            message:"Something went wrong",
            status:500
        },{status:500})
    }
}


export const POST=async(req:NextRequest)=>{  //add shop
    try {
        const {title,desc,img,slug,address}:shopType=await req.json()
        const user=await getUserDetails(req);
        if(user==null){
            return NextResponse.json({
                error:true,
                message:"Login first to add shop",
                status:403
            },{status:403})
        }
        const userId=user.id;
        const updateUserRole=await prisma.user.update({where:{id:userId},data:{role:"ShopOwner"}})
        const newShop = await prisma.shop.create({
            data: {
                title,
                desc,
                slug,
                img,
                address,
                userId,
            },
        });
        return NextResponse.json({
            error:false,
            message:"Shop Created Successfully",
            status:201,
            newShop,
            updateUserRole
        },{status:201})
    } catch (error) {
        console.log(error)
        return NextResponse.json({
            error:true,
            message:"Something went wrong",
            status:500
        },{status:500})
    }
    
}

export const GET=async(req:NextRequest)=>{ //get all shops of user  OR get all shops
    try {
        const user=await getUserDetails(req);
        if(user?.role==="ShopOwner"){
            const userShops=await prisma.shop.findMany({
                where:{
                    userId:user.id,
                    softDelete:false
                }
            });
            return NextResponse.json({
                error:false,
                message:"Your shop fetched successfully",
                status:200,
                userShops
            },{status:200})
        }
        const allShops=await prisma.shop.findMany({where:{softDelete:false}})
        return NextResponse.json({
            error:true,
            message:"Shop fetched successfully",
            status:200,
            allShops
        },{status:200})
    } catch (error) {
        return NextResponse.json({
            error:true,
            message:"Something went wrong",
            status:500
        },{status:500})
    }
}