"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import Link from "next/link";

export default function RegisterForm() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    nombre: "",
    apellido: "",
    edad: "",
  });   
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch(
        "https://nvg4zyy4od.execute-api.us-east-1.amazonaws.com/dev/usuario/crear",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            edad: Number(form.edad),
          }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setMsg("¡Registro exitoso!");
        setForm({ email: "", password: "", nombre: "", apellido: "", edad: "" });
      } else {
        setMsg(data.message || "Error al registrar.");
      }
    } catch {
      setMsg("Error de red.");
    }
    setLoading(false);
  };

  return (
    <>
      <div className="flex flex-col min-h-screen bg-white bg-opacity-95 relative overflow-hidden">
        {/* Cuadrados decorativos de fondo */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-10 left-8 w-32 h-32 bg-black opacity-10 rounded-2xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-black opacity-10 rounded-3xl"></div>
          <div className="absolute top-1/2 right-24 w-24 h-24 bg-black opacity-10 rounded-xl"></div>
        </div>
        {/* Formulario centrado */}
        <div className="flex flex-1 justify-center items-center z-10">
          <motion.div
            className="w-full max-w-md flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Título centrado arriba del formulario */}
            <h1 className="text-5xl font-bold tracking-tight text-center mb-8">
              Liquid
              <span className="block text-black border-b-2 border-black inline-block mt-2 pb-1">-IO</span>
            </h1>
            <Card className="border border-gray-200 bg-white shadow-lg w-full">
              <CardHeader>
                <CardTitle className="text-3xl text-black text-center mb-2">
                  Registro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <input
                    type="text"
                    name="nombre"
                    placeholder="Nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                  />
                  <input
                    type="text"
                    name="apellido"
                    placeholder="Apellido"
                    value={form.apellido}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Correo electrónico"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                  />
                  <input
                    type="password"
                    name="password"
                    placeholder="Contraseña"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                  />
                  <input
                    type="number"
                    name="edad"
                    placeholder="Edad"
                    value={form.edad}
                    onChange={handleChange}
                    required
                    min={1}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                  />
                  <Button
                    type="submit"
                    className="w-full bg-black text-white hover:bg-gray-800 hover:scale-105 transition-transform"
                    disabled={loading}
                  >
                    {loading ? "Registrando..." : "Registrarse"}
                  </Button>
                  {msg && (
                    <div className="text-center mt-2 text-black">{msg}</div>
                  )}
                  <div className="text-center mt-2">
                    <span className="text-gray-700 text-base">
                      ¿Ya tienes cuenta?{" "}
                      <Link
                        href="/login"
                        className="text-black font-semibold hover:underline"
                      >
                        Inicia sesión
                      </Link>
                    </span>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      {/* Footer */}
      <footer className="w-full bg-black bg-opacity-95 border-t border-gray-200 text-black py-12 mt-8">
        <div className="container mx-auto text-center">
          <p className="mb-4 text-white">Liquid-IO - Universidad de Ingeniería y Tecnología</p>
          <p className="text-gray-500 text-sm">© 2025 - Ciencias de la Computación</p>
        </div>
      </footer>
    </>
  );
}