import { NextResponse } from "next/server"
import { z } from "zod"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  image: z.string().url("Invalid image URL").optional().nullable(),
})

export async function PUT(request: Request) {
  try {
    // Using mock authentication - always authenticated
    const mockUserId = 'mock-user-id'
    
    // No authentication check needed as we're using mock auth
    
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
      where: { id: mockUserId },
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