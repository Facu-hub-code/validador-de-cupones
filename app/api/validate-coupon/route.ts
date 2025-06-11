import { type NextRequest, NextResponse } from "next/server"

// Simulación de base de datos de cupones para demostración
// En tu implementación real, esto vendría de tu base de datos
const mockCoupons = {
  LACELESTE: {
    pancito10: { valid: true, used: false },
    descuento20: { valid: true, used: true },
    promo15: { valid: true, used: false },
  },
  PANADERIASOL: {
    pan25: { valid: true, used: false },
    dulce30: { valid: true, used: true },
  },
}

export async function POST(request: NextRequest) {
  try {
    const { businessCode, couponCode } = await request.json()

    // Validar que se enviaron los datos requeridos
    if (!businessCode || !couponCode) {
      return NextResponse.json({ message: "Código del comercio y código del cupón son requeridos" }, { status: 400 })
    }

    // Simular delay de red (opcional, para testing)
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Verificar si el comercio existe
    const business = mockCoupons[businessCode.toUpperCase()]
    if (!business) {
      return NextResponse.json({
        valid: false,
        message: "Código de comercio no válido",
      })
    }

    // Verificar si el cupón existe para este comercio
    const coupon = business[couponCode.toLowerCase()]
    if (!coupon) {
      return NextResponse.json({
        valid: false,
        used: false,
        message: "El cupón no es válido",
      })
    }

    // Retornar el estado del cupón
    return NextResponse.json({
      valid: coupon.valid,
      used: coupon.used,
      message: coupon.used ? "Este cupón ya fue utilizado" : "Cupón válido. Aún no fue utilizado",
    })
  } catch (error) {
    console.error("Error validating coupon:", error)
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 })
  }
}
