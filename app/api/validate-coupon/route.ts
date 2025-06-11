import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { businessCode, couponCode } = await request.json();

    // Validar que se enviaron los datos requeridos
    if (!businessCode || !couponCode) {
      return NextResponse.json(
        { message: "Código del comercio y código del cupón son requeridos" },
        { status: 400 }
      );
    }

    // Realizar consulta al backend real
    const backendResponse = await fetch(
      "https://x6ft-zdlf-2u9q.b2.xano.io/api:9nMxKwHc/check_cupon",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cupon: couponCode,
          codigo_comercio: businessCode,
        }),
      }
    );

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      return NextResponse.json(
        { message: errorData.message || "Error al validar el cupón" },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();

    // Retornar el estado del cupón desde el backend
    return NextResponse.json({
      valid: data.valid,
      used: data.used,
      message: data.message,
    });
  } catch (error) {
    console.error("Error validating coupon:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
