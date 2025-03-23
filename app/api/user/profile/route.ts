import { NextResponse } from "next/server"
import { z } from "zod"
import { PrismaClient } from "@prisma/client"
import { auth } from "@/auth"

const prisma = new PrismaClient()

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  image: z.string().url("Invalid image URL").optional().nullable(),
})

export async function PUT(request: Request) {
  try {
    // Check authentication
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to update your profile" }, 
        { status: 401 }
      )
    }
    
    // Parse and validate request body
    const body = await request.json()
    const result = profileSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message }, 
        { status: 400 }
      )
    }
    
    // Update user profile
    const { name, image } = result.data
    const updateData: any = {}
    
    if (name !== undefined) updateData.name = name
    if (image !== undefined) updateData.image = image
    
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    })
    
    return NextResponse.json(updatedUser)
    
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json(
      { error: "An error occurred while updating your profile" }, 
      { status: 500 }
    )
  }
} 