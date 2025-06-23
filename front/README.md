# UTEC Diagram 🧩

Una solución serverless de diagramación técnica basada en código (Diagrams as Code), desarrollada para el reto **Hackathon Cloud Computing - UTEC 2025**.

## 🌐 Enlace al Frontend

🔗 [Ver aplicación en vivo](http://liquid-io.s3-website-us-east-1.amazonaws.com/)

---

## 🧠 Sobre el Curso

**CS2032 - Cloud Computing**

El curso de Cloud Computing es fundamental para los estudiantes de Ciencias de la Computación. Explora los principios teóricos y prácticos de la computación en la nube, desde la virtualización hasta la implementación de aplicaciones escalables y resilientes.

### 🎯 Objetivos del Curso:

- Comprender los modelos y arquitecturas de computación en la nube.
- Implementar aplicaciones distribuidas utilizando servicios en la nube.
- Gestionar infraestructura y recursos en la nube de manera eficiente.
- Aplicar buenas prácticas en seguridad y monitoreo en entornos de nube.
- Desarrollar habilidades para diseñar soluciones escalables y resilientes.

### 📚 Temas Principales:

- Fundamentos de computación en la nube y modelos de despliegue.
- Virtualización con máquinas virtuales y contenedores.
- Almacenamiento en la nube y bases de datos SQL/NoSQL.
- Arquitecturas escalables, elásticas y sin servidor (serverless).
- Gestión de aplicaciones multi-tenant y orientadas a eventos.

---

## 💡 Descripción del Proyecto

UTEC Diagram permite generar visualmente:

- **Diagramas de Arquitectura AWS**  
- **Diagramas Entidad-Relación (ER)**  
- **Visualización de estructuras JSON**

El sistema es completamente serverless y soporta múltiples tipos de diagramación a partir de texto en un editor embebido. La aplicación se apoya en tecnologías como **React**, **Vite**, **AWS Lambda**, **S3**, y **API Gateway**.

---

## 🛠️ Tecnologías Utilizadas

| Componente         | Tecnología               |
|--------------------|--------------------------|
| Frontend           | React + Vite + TailwindCSS |
| Hosting Frontend   | Amazon S3 (Static Website Hosting) |
| Backend            | AWS Lambda (Python)     |
| Diagrama as Code   | Diagrams / ERAlchemy / Mermaid |
| API REST           | API Gateway (AWS)       |
| Almacenamiento     | Amazon S3                |
| Seguridad          | Token JWT + Multitenancy |

---

## 👥 Equipo de Desarrollo

| Integrante                        | Carrera                   |
|----------------------------------|---------------------------|
| Ronal Jesus Condor Blas          | Ciencias de la Computación |
| Llorent Nunayalle Brañes         | Ciencias de la Computación |
| Marco Madrid Gonzales            | Ciencias de la Computación |

---

## 📦 Estructura del Repositorio

```
frontend/
  └── index.html
  └── /_next/
  └── /images/
  └── /login/
  └── /register/
  └── ...

backend/
  └── diagrams_converter.py
  └── eralchemy_converter.py
  └── serverless.yml
  └── ...

infra/
  └── bucket-config.tf
  └── api-gateway-config.tf
```

---

## 🚀 Cómo desplegar

1. `cd frontend && npm run build`
2. `aws s3 sync ./out s3://liquid-io --delete`
3. Backend: `sls deploy --stage prod`

---

## 📄 Licencia

MIT © 2025 UTEC Diagram Hackathon Team
