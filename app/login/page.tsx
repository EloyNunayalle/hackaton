"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function LoginForm() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const res = await fetch(
        "https://nvg4zyy4od.execute-api.us-east-1.amazonaws.com/dev/usuario/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      let token: string | null = null;
      // Busca el token en diferentes estructuras posibles
      if (data.token) {
        token = data.token;
      } else if (data.body) {
        try {
          const bodyData = typeof data.body === "string" ? JSON.parse(data.body) : data.body;
          token = bodyData.token || bodyData.accessToken || bodyData.authToken;
        } catch {}
      } else if (data.accessToken) {
        token = data.accessToken;
      } else if (data.authToken) {
        token = data.authToken;
      }

      if (res.ok && token) {
        localStorage.setItem("token", token);
        setMsg("¡Inicio de sesión exitoso! Redirigiendo...");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } else if (res.ok && !token) {
        setMsg("Login exitoso pero no se recibió token de autenticación.");
      } else {
        setMsg(data.message || "Error al iniciar sesión.");
      }
    } catch (error) {
      setMsg("Error de red al conectar con el servidor.");
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white bg-opacity-95 relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-10 left-8 w-32 h-32 bg-black opacity-10 rounded-2xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-black opacity-10 rounded-3xl"></div>
        <div className="absolute top-1/2 right-24 w-24 h-24 bg-black opacity-10 rounded-xl"></div>
      </div>

      <div className="flex flex-1 justify-center items-center z-10">
        <div className="w-full max-w-md flex flex-col items-center">
          <h1 className="text-5xl font-bold tracking-tight text-center mb-8">
            Liquid
            <span className="block text-black border-b-2 border-black inline-block mt-2 pb-1">
              -IO
            </span>
          </h1>

          <Card className="border border-gray-200 bg-white shadow-lg w-full">
            <CardHeader>
              <CardTitle className="text-3xl text-black text-center mb-2">
                Iniciar sesión
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={handleSubmit}>
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
                <Button
                  type="submit"
                  className="w-full bg-black text-white hover:bg-gray-800 hover:scale-105 transition-transform"
                  disabled={loading}
                >
                  {loading ? "Ingresando..." : "Ingresar"}
                </Button>
                {msg && (
                  <div className={`text-center mt-2 p-3 rounded ${
                    msg.includes('exitoso') || msg.includes('guardado') 
                      ? 'text-green-700 bg-green-50 border border-green-200' 
                      : 'text-red-700 bg-red-50 border border-red-200'
                  }`}>
                    {msg}
                  </div>
                )}
                <div className="text-center mt-2">
                  <span className="text-gray-700 text-base">
                    ¿No tienes cuenta?{" "}
                    <Link href="/register" className="text-black font-semibold hover:underline">
                      Regístrate
                    </Link>
                  </span>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-black bg-opacity-95 border-t border-gray-200 text-black py-12 mt-8">
        <div className="container mx-auto text-center">
          <p className="mb-4 text-white">
            Liquid-IO - Universidad de Ingeniería y Tecnología
          </p>
          <p className="text-gray-500 text-sm">
            © 2025 - Ciencias de la Computación
          </p>
        </div>
      </footer>
    </div>
  );
}