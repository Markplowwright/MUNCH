// "use server"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/utils/connect";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getUserType, registerType } from "../types";
import { cookies } from 'next/headers'

export const POST = async (req: NextRequest, res: NextResponse) => {
    const { name, userName, password, email, phone, image }: registerType = await req.json();

    try {
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { userName },
                    { email },
                    { phone },
                ],
            },
        });
        console.log(user)
        if (user) {

            return NextResponse.json({
                error: true,
                status: 403,  // Forbidden
                message: "User already exists",
            }, { status: 403 });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await prisma.user.create({
            data: {
                name,
                userName,
                email,
                phone,
                image,
                password: hashedPassword,
            },
        });

        var token = jwt.sign({ id: newUser.id }, process.env.JWT!);
        cookies().set('token', token);
        cookies().set({
            name: 'role',
            value: "User",
            // httpOnly: true,
          })
        return NextResponse.json({
            error: false,
            status: 201,  // Created
            message: "User created successfully",
            newUser,
            token,
        }, { status: 201 });

    } catch (error) {
        console.log(error)
        return NextResponse.json({
            error: true,
            status: 500,  // Internal Server Error
            message: "Something went wrong",
        }, { status: 500 });
    }
}

export const Put = async (req: NextRequest) => {  //get user for validation
    try {
        // Perform GET logic here
        const { userName, email, phone }: getUserType = await req.json()
        const userN = await prisma.user.findUnique({ where: { userName }, });
        let userE = email && await prisma.user.findFirst({ where: { email } });
        let userP = phone && await prisma.user.findFirst({ where: { phone: phone ?? undefined }, });
        if (userE) {
            return NextResponse.json({
                error: true,
                status: 200,  // Internal Server Error
                message: "Email already exist",
            }, { status: 200 });
        }
        if (userP) {
            return NextResponse.json({
                error: true,
                status: 200,  // Internal Server Error
                message: "Phone Number already exist",
            }, { status: 200 });
        }
        if (userN) {
            return NextResponse.json({
                error: true,
                status: 200,  // Internal Server Error
                message: "user name already exist",
            }, { status: 200 });
        }
        else {
            return NextResponse.json({
                error: false,
                status: 200,  // Internal Server Error
                message: "Its unique",
            }), { status: 200 };
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({
            error: true,
            status: 500,  // Internal Server Error
            message: "Something went wrong",
        }, { status: 500 });
    }
}
