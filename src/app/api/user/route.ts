// "use server"

import { NextRequest, NextResponse } from "next/server";
import { getUserDetails } from "../utils/action";
import { prisma } from "@/utils/connect";
import { cookies } from 'next/headers'

export const PUT = async (req: NextRequest) => {
    try {
        console.log("hello")
        var { name, phone, email, image, address }: updateForm = await req.json();
        const user = await getUserDetails(req);
        if (user == null) {
            return NextResponse.json({
                error: true,
                message: "Login first to update user",
                status: 403
            }, { status: 403 })
        }
        if (phone) {
            await prisma.user.update({ where: { id: user.id }, data: { phoneVerified: null } })
        }
        if (email) {
            await prisma.user.update({ where: { id: user.id }, data: { emailVerified: null } })
        }
        const updatedUser = await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                name, phone, email, image, address
            }
        })
        let msg;
        if(user.role==="ShopOwner"){
            msg="Your details updated successfully and need to be verified by admin till then your shops will not be visible to users"
        }
        else{
            msg="User updated successfully"
        }
        return NextResponse.json({
            error: false,
            message: msg,
            status: 200,
            updatedUser
        }, { status: 200 })
    } catch (error) {
        console.log(error)
        return NextResponse.json({
            error: true,
            message: "Something went wrong",
            status: 404
        }, { status: 404 })
    }
}

export const GET = async (req: NextRequest) => {
    try {
        const loggedInUser = await getUserDetails(req);
        if (loggedInUser == null) {
            return NextResponse.json({
                error: true,
                message: "Login to view your profile.",
                status: 403
            }, { status: 403 })
        }
        if (loggedInUser.role === "ShopOwner") {
            const user = await prisma.user.findUnique({
                where: {
                    id: loggedInUser.id
                },
                include: {
                    shops: true,
                    shopOwner: true
                }
            })
            const { password, ...rest } = user as { password: string, [key: string]: any };
            return NextResponse.json({
                error: false,
                message: "ShopOwner found successfully",
                status: 200,
                user: rest
            }, { status: 200 })
        }
        else {
            const user = await prisma.user.findUnique({
                where: {
                    id: loggedInUser.id
                }
            })
            const { password, ...rest } = user as { password: string, [key: string]: any };
            return NextResponse.json({
                error: false,
                message: "User found successfully",
                status: 200,
                user: rest
            }, { status: 200 })
        }
    } catch (error) {
        return NextResponse.json({
            error: true,
            message: "Something went wrong",
            status: 404
        }, { status: 404 })
    }
}
export const DELETE = async (req: NextRequest) => {
    try {
        const user = await getUserDetails(req);
        if (user == null) {
            return NextResponse.json({
                error: true,
                message: "Login first to delete user",
                status: 403
            }, { status: 403 })
        }

        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                softDelete: true
            }
        })
        return NextResponse.json({
            error: false,
            message: "User deleted successfully",
            status: 200,
        }, { status: 200 })
    } catch (error) {
        return NextResponse.json({
            error: true,
            message: "Something went wrong",
            status: 500
        }, { status: 500 })
    }
}

