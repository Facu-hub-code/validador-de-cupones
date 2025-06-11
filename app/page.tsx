"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle, Loader2, Sparkles, Copy, RefreshCw } from "lucide-react"
import confetti from "canvas-confetti"
import { motion } from "framer-motion"

type ValidationResult = {
  valid: boolean
  used?: boolean
  message: string
}

export default function CouponValidator() {
  const [businessCode, setBusinessCode] = useState("")
  const [couponCode, setCouponCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  // Cargar código del comercio desde localStorage al montar el componente
  useEffect(() => {
    const savedBusinessCode = localStorage.getItem("businessCode")
    if (savedBusinessCode) {
      setBusinessCode(savedBusinessCode)
    }
  }, [])

  // Guardar código del comercio en localStorage cuando cambie
  useEffect(() => {
    if (businessCode) {
      localStorage.setItem("businessCode", businessCode)
    }
  }, [businessCode])

  const validateCoupon = async () => {
    if (!businessCode.trim() || !couponCode.trim()) {
      setResult({
        valid: false,
        message: "Por favor, completa ambos campos.",
      })
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/validate-coupon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessCode: businessCode.trim(),
          couponCode: couponCode.trim(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        if (data.valid && !data.used) {
          setResult({
            valid: true,
            used: false,
            message: "¡Cupón válido! Aún no fue utilizado.",
          })
          // Lanzar confeti cuando el cupón es válido
          setTimeout(() => launchConfetti(), 100)
        } else if (data.valid && data.used) {
          setResult({
            valid: true,
            used: true,
            message: "Este cupón ya fue utilizado.",
          })
        } else {
          setResult({
            valid: false,
            message: "El cupón no es válido.",
          })
        }
      } else {
        setResult({
          valid: false,
          message: data.message || "Error al validar el cupón. Intenta nuevamente.",
        })
      }
    } catch (error) {
      setResult({
        valid: false,
        message: "Error de conexión. Verifica tu internet e intenta nuevamente.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    validateCoupon()
  }

  const getAlertVariant = () => {
    if (!result) return "default"
    if (result.valid && !result.used) return "default"
    if (result.valid && result.used) return "destructive"
    return "destructive"
  }

  const getAlertIcon = () => {
    if (!result) return null
    if (result.valid && !result.used) return <CheckCircle className="h-5 w-5 text-green-500" />
    if (result.valid && result.used) return <AlertCircle className="h-5 w-5 text-amber-500" />
    return <XCircle className="h-5 w-5 text-red-500" />
  }

  const launchConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#8b5cf6", "#6d28d9", "#4c1d95", "#c4b5fd"],
    })
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const exampleCodes = [
    { business: "LACELESTE", coupon: "pancito10", status: "valid" },
    { business: "LACELESTE", coupon: "promo15", status: "valid" },
    { business: "LACELESTE", coupon: "descuento20", status: "used" },
  ]

  const fillExample = (business: string, coupon: string) => {
    setBusinessCode(business)
    setCouponCode(coupon)
  }

  return (
    <div className="min-h-screen bg-pattern flex flex-col items-center justify-center p-4 py-10">
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="gradient-border mb-6">
            <Card className="shadow-xl border-0">
              <CardHeader className="text-center pb-2">
                <div className="flex justify-center mb-2">
                  <motion.img
                    src="/wizard-mascot.png"
                    alt="Mascota validador"
                    className="w-28 h-28 object-contain floating"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  />
                </div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-indigo-500 text-transparent bg-clip-text">
                  Validador de Cupones
                </CardTitle>
                <CardDescription className="text-gray-600 text-lg">
                  Verifica la validez de los cupones de tus clientes
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6 pt-2">
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-5 border border-purple-100">
                  <h3 className="text-sm font-semibold text-purple-900 mb-3 flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 text-purple-600" />
                    Códigos de ejemplo para probar:
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-purple-800 font-medium">
                        Comercio: <span className="font-bold">LACELESTE</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-purple-700 hover:text-purple-900 hover:bg-purple-100"
                        onClick={() => copyToClipboard("LACELESTE", "business")}
                      >
                        {copied === "business" ? "¡Copiado!" : <Copy className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {exampleCodes.map((code, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-white rounded-lg p-2 shadow-sm border border-purple-100 hover:border-purple-300 transition-all"
                        >
                          <div className="flex items-center space-x-2">
                            <span
                              className={`example-tag ${
                                code.status === "valid"
                                  ? "example-tag-valid"
                                  : code.status === "used"
                                    ? "example-tag-used"
                                    : "example-tag-invalid"
                              }`}
                            >
                              {code.status === "valid" ? "Válido" : code.status === "used" ? "Usado" : "Inválido"}
                            </span>
                            <span className="font-mono text-sm">{code.coupon}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-purple-700 hover:text-purple-900 hover:bg-purple-100"
                            onClick={() => fillExample(code.business, code.coupon)}
                          >
                            Usar
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Label htmlFor="businessCode" className="text-sm font-medium text-gray-700 flex items-center">
                      Código del Comercio
                    </Label>
                    <div className="relative">
                      <Input
                        id="businessCode"
                        type="text"
                        placeholder="ej: LACELESTE"
                        value={businessCode}
                        onChange={(e) => setBusinessCode(e.target.value.toUpperCase())}
                        className="uppercase pl-3 pr-10 py-6 border-purple-200 focus:border-purple-400 focus:ring-purple-400 transition-all duration-300 text-lg font-medium"
                        disabled={isLoading}
                      />
                      {businessCode && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                          onClick={() => setBusinessCode("")}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </motion.div>

                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Label htmlFor="couponCode" className="text-sm font-medium text-gray-700 flex items-center">
                      Código del Cupón
                    </Label>
                    <div className="relative">
                      <Input
                        id="couponCode"
                        type="text"
                        placeholder="ej: pancito10"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="pl-3 pr-10 py-6 border-purple-200 focus:border-purple-400 focus:ring-purple-400 transition-all duration-300 text-lg font-medium"
                        disabled={isLoading}
                      />
                      {couponCode && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                          onClick={() => setCouponCode("")}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Button
                      type="submit"
                      className="w-full py-6 bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl shine-effect"
                      disabled={isLoading || !businessCode.trim() || !couponCode.trim()}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Validando...
                        </>
                      ) : (
                        "Validar Cupón"
                      )}
                    </Button>
                  </motion.div>
                </form>

                {result && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="fade-in"
                  >
                    <Alert
                      variant={getAlertVariant()}
                      className={`mt-4 p-4 ${
                        result.valid && !result.used
                          ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 pulse"
                          : result.valid && result.used
                            ? "bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200"
                            : "bg-gradient-to-r from-red-50 to-rose-50 border-red-200"
                      }`}
                    >
                      <div className="flex items-center">
                        {getAlertIcon()}
                        <AlertDescription className="ml-2 font-medium text-lg">{result.message}</AlertDescription>
                      </div>
                    </Alert>
                  </motion.div>
                )}

                {couponCode && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCouponCode("")
                        setResult(null)
                      }}
                      className="w-full py-5 text-purple-600 border-purple-200 hover:bg-purple-50 hover:text-purple-700 transition-all duration-300 flex items-center justify-center"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Limpiar y validar otro cupón
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>

        <motion.div
          className="mt-6 text-center text-sm text-gray-500 glass-effect p-3 rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p>El código del comercio se guarda automáticamente en este dispositivo</p>
        </motion.div>
      </div>
    </div>
  )
}
