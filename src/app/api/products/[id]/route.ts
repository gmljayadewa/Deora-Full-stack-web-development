import {NextResponse} from 'next/server';
import {prisma} from '@/lib/prisma';


export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updatedProduct = await prisma.product.update({
      where: { id,isActive: true },
      
      data: body,
    });

    return NextResponse.json(updatedProduct, { status: 200 });

  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }
    console.error("PUT /api/products/[id] error:", error);
    return NextResponse.json({ message: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }   // ← Promise<> එකතු කරන්ඩ
) {
  try {
    const { id } = await params;   // ← await කරන්ඩ

    await prisma.product.delete({
      where: { id,isActive: false },
    
    });

    return new NextResponse(null, { status: 204 });

  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }
    console.error("DELETE /api/products/[id] error:", error);
    return NextResponse.json({ message: "Failed to delete product" }, { status: 500 });
  }
}