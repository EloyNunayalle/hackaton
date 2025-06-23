"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Upload, 
  Download, 
  FileText, 
  Image, 
  Code, 
  Eye,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clipboard,
  ExternalLink,
  Network,
  Database,
  Layers,
  Share2
} from "lucide-react";

// Interfaces actualizadas
interface ApiResponse {
  statusCode: number;
  headers: {
    "Content-Type": string;
    "Access-Control-Allow-Origin": string;
    "Access-Control-Allow-Headers": string;
    "Access-Control-Allow-Methods": string;
  };
  body: string;
}

interface DiagramResult {
  success: boolean;
  urls: {
    img?: string;
    png?: string;
    pdf: string;
    svg: string;
  };
  encoded: string;
  s3_info: {
    s3_key: string;
    saved_at: string;
  };
  tenant_id: string;
}

// Configuración de tipos de diagrama con sus respectivas APIs
const diagramTypes = {
  mermaid: {
    id: 'mermaid',
    name: 'Mermaid',
    description: 'Diagramas de flujo, secuencia, ER',
    icon: Share2,
    api: 'https://68axiykxw7.execute-api.us-east-1.amazonaws.com/dev/generar/Mermaid',
    example: `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process 1]
    B -->|No| D[Process 2]
    C --> E[End]
    D --> E`,
    placeholder: "Escribe tu código Mermaid aquí...\nEjemplo:\ngraph TD\n    A-->B\n    B-->C"
  },
  jsonMermaid: {
    id: 'jsonMermaid',
    name: 'JSON to Mermaid',
    description: 'Convierte JSON a diagramas Mermaid',
    icon: Code,
    api: 'https://68axiykxw7.execute-api.us-east-1.amazonaws.com/dev/generar/jsonMermaid',
    example: `{
  "title": "Grafo de Servicios Distribuidos",
  "format": "png",
  "filename": "grafo_servicios",
  "nodes": [
    "Frontend",
    "AuthService",
    "UserService",
    "ProductService",
    "OrderService",
    "InventoryService",
    "NotificationService",
    "PaymentGateway",
    "DatabaseUsers",
    "DatabaseOrders",
    "DatabaseProducts",
    "RedisCache",
    "Logger",
    "S3Storage"
  ],
  "edges": [
    { "from": "Frontend", "to": "AuthService" },
    { "from": "Frontend", "to": "UserService" },
    { "from": "AuthService", "to": "UserService" },
    { "from": "UserService", "to": "DatabaseUsers" },
    { "from": "Frontend", "to": "ProductService" },
    { "from": "ProductService", "to": "DatabaseProducts" },
    { "from": "ProductService", "to": "RedisCache" },
    { "from": "Frontend", "to": "OrderService" },
    { "from": "OrderService", "to": "InventoryService" },
    { "from": "OrderService", "to": "PaymentGateway" },
    { "from": "OrderService", "to": "DatabaseOrders" },
    { "from": "OrderService", "to": "NotificationService" },
    { "from": "NotificationService", "to": "S3Storage" },
    { "from": "OrderService", "to": "Logger" },
    { "from": "UserService", "to": "Logger" },
    { "from": "AuthService", "to": "Logger" }
  ]
}`,
    placeholder: "Escribe tu JSON aquí...\nEjemplo:\n{\n  \"type\": \"flowchart\",\n  \"nodes\": [...],\n  \"connections\": [...]\n}"
  },
  awsArchitecture: {
    id: 'awsArchitecture',
    name: 'AWS Architecture',
    description: 'Diagramas de arquitectura AWS',
    icon: Layers,
    api: 'https://68axiykxw7.execute-api.us-east-1.amazonaws.com/dev/generar/diagrams',
    example: `from diagrams import Diagram, Cluster
from diagrams.aws.network import VPC, ELB, Route53, CloudFront
from diagrams.aws.compute import EC2, Lambda, ECS
from diagrams.aws.database import RDS, Dynamodb, Redshift
from diagrams.aws.storage import S3
from diagrams.aws.integration import SQS, SNS, Eventbridge
from diagrams.aws.ml import Sagemaker
from diagrams.aws.security import IAM
from diagrams.aws.management import Cloudwatch

with Diagram('Arquitectura Completa sin CI/CD', filename='/tmp/arquitectura_microservicios', outformat='png', show=False):

    dns = Route53('DNS')
    cdn = CloudFront('CDN')
    bucket_static = S3('Frontend Assets')

    with Cluster('Red Interna VPC'):
        vpc = VPC('Private VPC')

        with Cluster('Balanceo y Autenticación'):
            lb = ELB('Load Balancer')
            auth_lambda = Lambda('Auth Service')

        with Cluster('Contenedores de Aplicación'):
            ecs_1 = ECS('Product Service')
            ecs_2 = ECS('User Service')
            ecs_3 = ECS('Order Service')

        with Cluster('Bases de Datos'):
            rds = RDS('PostgreSQL')
            dynamo = Dynamodb('User Sessions')
            redshift = Redshift('Analytics')

        with Cluster('Colas y Eventos'):
            queue = SQS('Order Queue')
            topic = SNS('User Notifications')
            event_bus = Eventbridge('EventBridge')

        with Cluster('Machine Learning'):
            sagemaker = Sagemaker('ML Model')

        with Cluster('Monitoreo y Seguridad'):
            monitor = Cloudwatch('Logs + Metrics')
            iam = IAM('Roles')

    dns >> cdn >> bucket_static
    dns >> lb >> auth_lambda
    auth_lambda >> [ecs_1, ecs_2, ecs_3]
    ecs_1 >> rds
    ecs_2 >> dynamo
    ecs_3 >> queue >> ecs_3
    ecs_2 >> topic
    ecs_3 >> event_bus >> sagemaker
    redshift << rds
    ecs_1 >> monitor
    iam >> monitor`,
    placeholder: "Pega aquí tu código Python de diagrams para AWS Architecture"
  },
  entityRelationship: {
    id: 'entityRelationship',
    name: 'Entity Relationship',
    description: 'Diagramas de base de datos ER',
    icon: Database,
    api: 'https://68axiykxw7.execute-api.us-east-1.amazonaws.com/dev/generar/entityRelationship',
    example: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER }|..|{ DELIVERY-ADDRESS : uses
    CUSTOMER {
        string name
        string custNumber
        string sector
    }
    ORDER {
        int orderNumber
        string deliveryAddress
    }`,
    placeholder: "Escribe tu diagrama ER aquí...\nEjemplo:\nerDiagram\n    CUSTOMER ||--o{ ORDER : places\n    ORDER ||--|{ LINE-ITEM : contains"
  }
};

type DiagramTypeKey = keyof typeof diagramTypes;

type TemplateType = keyof typeof templates;

const templates = {
  mermaid: {
    type: 'mermaid',
    code: `graph TD
    A[Inicio] --> B{¿Condición?}
    B -->|Sí| C[Proceso 1]
    B -->|No| D[Proceso 2]
    C --> E[Fin]
    D --> E`
  },
  flowchart: {
    type: 'mermaid',
    code: `flowchart LR
    Cliente-->|Solicita|Servidor
    Servidor-->|Responde|Cliente`
  },
  sequence: {
    type: 'mermaid',
    code: `sequenceDiagram
    participant Usuario
    participant Sistema
    Usuario->>Sistema: Iniciar sesión
    Sistema-->>Usuario: Respuesta`
  },
  mermaidClass: {
    type: 'mermaid',
    code: `classDiagram
    Animal <|-- Perro
    Animal <|-- Gato
    Animal : +String nombre
    Animal : +int edad
    Animal: +hacerSonido()`
  },
  mermaidGantt: {
    type: 'mermaid',
    code: `gantt
    title Proyecto Demo
    section Fase 1
    Tarea 1 :a1, 2024-07-01, 5d
    Tarea 2 :after a1, 3d`
  },
  mermaidDecision: {
    type: 'mermaid',
    code: `graph LR
    Start --> Decision{¿Continuar?}
    Decision -- Sí --> Step1[Primer paso]
    Decision -- No --> End[Fin]
    Step1 --> End`
  },
  mermaidSwimlanes: {
    type: 'mermaid',
    code: `flowchart TD
    subgraph Cliente
      A1[Solicita Servicio]
    end
    subgraph Servidor
      B1[Procesa Solicitud]
    end
    A1 --> B1`
  },
  jsonMermaidSimple: {
    type: 'jsonMermaid',
    code: `{
  "nodes": ["A", "B", "C"],
  "edges": [
    { "from": "A", "to": "B" },
    { "from": "B", "to": "C" }
  ]
}`
  },
  jsonMermaidServices: {
    type: 'jsonMermaid',
    code: `{
  "title": "Microservicios",
  "nodes": ["API", "Auth", "DB", "Cache"],
  "edges": [
    { "from": "API", "to": "Auth" },
    { "from": "API", "to": "DB" },
    { "from": "API", "to": "Cache" }
  ]
}`
  },
  jsonMermaidDistribuido: {
    type: 'jsonMermaid',
    code: `{
  "title": "Grafo Distribuido",
  "nodes": ["Frontend", "Backend", "DB"],
  "edges": [
    { "from": "Frontend", "to": "Backend" },
    { "from": "Backend", "to": "DB" }
  ]
}`
  },
  jsonMermaidFlow: {
    type: 'jsonMermaid',
    code: `{
  "title": "Flujo de Aprobación",
  "nodes": ["Inicio", "Revisión", "Aprobado", "Rechazado", "Fin"],
  "edges": [
    { "from": "Inicio", "to": "Revisión" },
    { "from": "Revisión", "to": "Aprobado" },
    { "from": "Revisión", "to": "Rechazado" },
    { "from": "Aprobado", "to": "Fin" },
    { "from": "Rechazado", "to": "Fin" }
  ]
}`
  },
  awsArchitectureFull: {
    type: 'awsArchitecture',
    code: `from diagrams import Diagram, Cluster
from diagrams.aws.network import VPC, ELB, Route53, CloudFront
from diagrams.aws.compute import EC2, Lambda, ECS
from diagrams.aws.database import RDS, Dynamodb, Redshift
from diagrams.aws.storage import S3
from diagrams.aws.integration import SQS, SNS, Eventbridge
from diagrams.aws.ml import Sagemaker
from diagrams.aws.security import IAM
from diagrams.aws.management import Cloudwatch

with Diagram('Arquitectura Completa sin CI/CD', filename='/tmp/arquitectura_microservicios', outformat='png', show=False):

    dns = Route53('DNS')
    cdn = CloudFront('CDN')
    bucket_static = S3('Frontend Assets')

    with Cluster('Red Interna VPC'):
        vpc = VPC('Private VPC')

        with Cluster('Balanceo y Autenticación'):
            lb = ELB('Load Balancer')
            auth_lambda = Lambda('Auth Service')

        with Cluster('Contenedores de Aplicación'):
            ecs_1 = ECS('Product Service')
            ecs_2 = ECS('User Service')
            ecs_3 = ECS('Order Service')

        with Cluster('Bases de Datos'):
            rds = RDS('PostgreSQL')
            dynamo = Dynamodb('User Sessions')
            redshift = Redshift('Analytics')

        with Cluster('Colas y Eventos'):
            queue = SQS('Order Queue')
            topic = SNS('User Notifications')
            event_bus = Eventbridge('EventBridge')

        with Cluster('Machine Learning'):
            sagemaker = Sagemaker('ML Model')

        with Cluster('Monitoreo y Seguridad'):
            monitor = Cloudwatch('Logs + Metrics')
            iam = IAM('Roles')

    dns >> cdn >> bucket_static
    dns >> lb >> auth_lambda
    auth_lambda >> [ecs_1, ecs_2, ecs_3]
    ecs_1 >> rds
    ecs_2 >> dynamo
    ecs_3 >> queue >> ecs_3
    ecs_2 >> topic
    ecs_3 >> event_bus >> sagemaker
    redshift << rds
    ecs_1 >> monitor
    iam >> monitor`
  }
};


const DiagramGenerator = () => {
  const [selectedType, setSelectedType] = useState<DiagramTypeKey>('mermaid');
  const [code, setCode] = useState<string>(diagramTypes.mermaid.example);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [result, setResult] = useState<DiagramResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [imageLoading, setImageLoading] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  // Redirige al login si no hay token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  // Cambiar tipo de diagrama seleccionado
  const handleTypeChange = (type: DiagramTypeKey) => {
    setSelectedType(type);
    setCode(diagramTypes[type].example);
    setError(null);
    setResult(null);
    setDebugInfo(null);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        setCode(e.target?.result as string);
        setError(null);
      };
      reader.readAsText(file);
    } else {
      setError('Por favor selecciona un archivo de texto (.txt)');
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setCode(text);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`No se pudo acceder al portapapeles: ${err.message}`);
      } else {
        setError('Error al acceder al portapapeles');
      }
    }
  };

  const validateCode = () => {
    if (!code.trim()) {
      setError('El código del diagrama no puede estar vacío');
      return false;
    }
    return true;
  };

  const generateDiagram = async () => {
    if (!validateCode()) return;

    setIsGenerating(true);
    setError(null);
    setResult(null);
    setImageError(false);
    setDebugInfo(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No hay token de autenticación. Inicia sesión nuevamente.");
        router.push("/login");
        return;
      }

      const selectedDiagramType = diagramTypes[selectedType];
      const apiUrl = selectedDiagramType.api;

      // --- CONVERSIÓN SEGÚN TIPO ---
      let payload: any = code;
      if (selectedType === 'jsonMermaid') {
        try {
          payload = JSON.parse(code); // El usuario debe ingresar JSON válido
        } catch (e) {
          setError("El JSON ingresado no es válido.");
          setIsGenerating(false);
          return;
        }
      } else if (selectedType === 'awsArchitecture') {
        // El usuario ingresa código Python, lo enviamos como string en { code: ... }
        payload = { code }; // No modificar el código, solo envolverlo en un objeto
      } else {
        payload = { code };
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        setError("Sesión expirada. Inicia sesión nuevamente.");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error del servidor: ${response.status} ${response.statusText}\n${errorText}`);
      }

      const responseText = await response.text();
      let apiResponse: any;
      try {
        apiResponse = JSON.parse(responseText);
        setDebugInfo({ step: 'parsed_main_response', data: apiResponse });
      } catch (parseError) {
        setError(`Error al parsear respuesta principal: ${parseError}`);
        setDebugInfo({ step: 'parse_main_error', error: parseError, rawText: responseText });
        return;
      }

      let parsedBody: any;
      if (apiResponse.body && typeof apiResponse.body === 'string') {
        try {
          parsedBody = JSON.parse(apiResponse.body);
          setDebugInfo({ step: 'parsed_aws_body', data: parsedBody });
        } catch (parseError) {
          setError(`Error al parsear el body de AWS: ${parseError}`);
          setDebugInfo({ step: 'parse_aws_body_error', error: parseError, body: apiResponse.body });
          return;
        }
      } else {
        parsedBody = apiResponse;
        setDebugInfo({ step: 'direct_response', data: parsedBody });
      }

      // Soporta tanto urls.img, urls.png como file_url
      const imgUrl = parsedBody.urls?.img || parsedBody.urls?.png || parsedBody.file_url;

      if (
        parsedBody &&
        parsedBody.success === true &&
        (parsedBody.urls || parsedBody.file_url) &&
        imgUrl &&
        typeof imgUrl === 'string' &&
        imgUrl.trim() !== ''
      ) {
        // Unifica la propiedad img para el render
        if (!parsedBody.urls) parsedBody.urls = {};
        parsedBody.urls.img = imgUrl;
        setResult(parsedBody as DiagramResult);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        setDebugInfo({ step: 'success', data: parsedBody });
      } else {
        const validationDetails = {
          hasBody: !!parsedBody,
          success: parsedBody?.success,
          hasUrls: !!parsedBody?.urls,
          urlsType: typeof parsedBody?.urls,
          hasImg: !!imgUrl,
          imgType: typeof imgUrl,
          imgValue: imgUrl
        };
        setError(`Validación fallida. Detalles: ${JSON.stringify(validationDetails, null, 2)}`);
        setDebugInfo({ step: 'validation_failed', details: validationDetails, fullBody: parsedBody });
      }

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Error al generar el diagrama: ${err.message}`);
        setDebugInfo({ step: 'catch_error', error: err.message, stack: err.stack });
      } else {
        setError('Error desconocido al generar el diagrama');
        setDebugInfo({ step: 'catch_unknown_error', error: err });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error al descargar: ${response.status}`);
      }
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      if (err instanceof Error) {
        setError(`Error al descargar: ${err.message}`);
      } else {
        setError('Error al descargar archivo');
      }
    }
  };

  const loadTemplate = (templateType: TemplateType) => {
    const template = templates[templateType];
    setSelectedType(template.type as DiagramTypeKey);
    setCode(template.code);
    setError(null);
    setResult(null);
    setDebugInfo(null);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const openInNewTab = (url: string) => {
    window.open(url, '_blank');
  };

  const selectedDiagramType = diagramTypes[selectedType];

  return (
    <div className="min-h-screen bg-white text-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-black to-gray-600 bg-clip-text text-transparent">
            Liquid-IO
          </h1>
          <p className="text-xl text-gray-600">Generador de Diagramas</p>
          <p className="text-sm text-gray-500 mt-2">
            Crea diagramas profesionales con código simple
          </p>
        </div>

        {/* Success Notification */}
        {showSuccess && (
          <div className="fixed top-6 right-6 bg-black text-white p-4 rounded-lg shadow-xl z-50">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>¡Diagrama generado exitosamente!</span>
            </div>
          </div>
        )}

        {/* Diagram Type Selection */}
        <div className="mb-8">
          <Card className="border-2 border-gray-200 shadow-lg">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-black">Tipo de Diagrama</CardTitle>
              <CardDescription>
                Selecciona el tipo de diagrama que deseas crear
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(diagramTypes).map(([key, type]) => {
                  const IconComponent = type.icon;
                  const isSelected = selectedType === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handleTypeChange(key as DiagramTypeKey)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                        isSelected
                          ? 'border-black bg-black text-white shadow-lg'
                          : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center mb-2">
                        <IconComponent className={`w-5 h-5 mr-2 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                        <span className="font-medium">{type.name}</span>
                      </div>
                      <p className={`text-xs ${isSelected ? 'text-gray-200' : 'text-gray-500'}`}>
                        {type.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Editor Panel */}
          <div className="lg:col-span-2">
            <Card className="border-2 border-gray-200 shadow-lg">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center text-black">
                  <Code className="mr-2 h-5 w-5" />
                  Editor de Código - {selectedDiagramType.name}
                </CardTitle>
                <CardDescription>
                  {selectedDiagramType.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 bg-white">
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="border-gray-300 text-black hover:bg-gray-50"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Subir archivo
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePaste}
                    className="border-gray-300 text-black hover:bg-gray-50"
                  >
                    <Clipboard className="w-4 h-4 mr-2" />
                    Pegar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCode(selectedDiagramType.example)}
                    className="border-gray-300 text-black hover:bg-gray-50"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Ejemplo {selectedDiagramType.name}
                  </Button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Code Editor */}
                <Textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={selectedDiagramType.placeholder}
                  className="font-mono text-sm h-80 bg-gray-50 border-gray-300 focus:border-black focus:ring-black resize-none"
                />

                {/* Generate Button */}
                <div className="mt-6">
                  <Button
                    onClick={generateDiagram}
                    disabled={isGenerating}
                    className="w-full bg-black hover:bg-gray-800 text-white transition-colors duration-200"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generando diagrama {selectedDiagramType.name}...
                      </>
                    ) : (
                      <>
                        <Eye className="w-5 h-5 mr-2" />
                        Generar Diagrama {selectedDiagramType.name}
                      </>
                    )}
                  </Button>
                </div>

                {/* Debug Info Mejorado */}
                {debugInfo && (
                  <div className="mt-4 p-4 bg-gray-100 rounded text-xs text-gray-700 border">
                    <div className="font-bold mb-2 text-black">🔍 Información de Debug:</div>
                    <div className="mb-2"><strong>Paso:</strong> {debugInfo.step}</div>
                    <div className="mb-2"><strong>API:</strong> {selectedDiagramType.api}</div>
                    <div className="max-h-40 overflow-y-auto">
                      <pre className="whitespace-pre-wrap break-all">
                        {JSON.stringify(debugInfo, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Current Code Info */}
                <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-gray-600">
                  <strong>Código actual ({code.length} caracteres) - Tipo: {selectedDiagramType.name}:</strong>
                  <pre className="mt-1 whitespace-pre-wrap max-h-20 overflow-y-auto">
                    {code}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div>
            <Card className="border-2 border-gray-200 shadow-lg h-fit">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center text-black">
                  <Image className="mr-2 h-5 w-5" />
                  Resultado
                </CardTitle>
                <CardDescription>
                  Vista previa y opciones de descarga
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {result ? (
                  <div className="space-y-4">
                    {/* Diagram Preview */}
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 relative">
                      {imageLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
                          <Loader2 className="w-8 h-8 animate-spin text-black" />
                        </div>
                      )}
                      {imageError ? (
                        <div className="text-center py-8 text-gray-500">
                          <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p className="mb-4">La imagen no se puede mostrar aquí debido a CORS</p>
                          <div className="space-y-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openInNewTab(result.urls.img!)}
                              className="w-full text-black hover:text-black border-black hover:bg-gray-50"
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Ver imagen en nueva pestaña
                            </Button>
                            <p className="text-xs text-gray-400 break-all">
                              URL: {result.urls.img}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <img
                            src={result.urls.img!}
                            alt="Generated Diagram"
                            className="w-full h-auto rounded border"
                            onLoad={handleImageLoad}
                            onError={handleImageError}
                            onLoadStart={() => setImageLoading(true)}
                            crossOrigin="anonymous"
                          />
                          <div className="mt-2 text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openInNewTab(result.urls.img!)}
                              className="text-xs text-black border-gray-300 hover:bg-gray-50"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Abrir en nueva pestaña
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openInNewTab(result.urls.img!)}
                        className="border-gray-300 text-black hover:bg-gray-50 flex-1"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Ver PNG
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openInNewTab(result.urls.svg)}
                        className="border-gray-300 text-black hover:bg-gray-50 flex-1"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Ver SVG
                      </Button>
                    </div>

                    {/* Download Options */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-black">Descargar como:</h4>
                      <div className="flex flex-col space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadFile(result.urls.img!, `diagram-${selectedType}-${result.s3_info.saved_at}.png`)}
                          className="border-gray-300 text-black hover:bg-gray-50 justify-start"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          PNG
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadFile(result.urls.svg, `diagram-${selectedType}-${result.s3_info.saved_at}.svg`)}
                          className="border-gray-300 text-black hover:bg-gray-50 justify-start"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          SVG
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadFile(result.urls.pdf, `diagram-${selectedType}-${result.s3_info.saved_at}.pdf`)}
                          className="border-gray-300 text-black hover:bg-gray-50 justify-start"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          PDF
                        </Button>
                      </div>
                    </div>

                    {/* Diagram Info */}
                    <div className="text-xs text-gray-500 space-y-1 pt-4 border-t border-gray-200">
                      <div><strong>Tipo:</strong> {selectedDiagramType.name}</div>
                      <div><strong>API:</strong> {selectedDiagramType.api}</div>
                      <div><strong>Tenant:</strong> {result.tenant_id}</div>
                      <div><strong>S3 Key:</strong> {result.s3_info?.s3_key}</div>
                      <div><strong>Generado:</strong> {result.s3_info?.saved_at}</div>
                      <div><strong>Encoded:</strong> {result.encoded ? result.encoded.substring(0, 20) + '...' : ''}</div>
                      <div><strong>Success:</strong> {result.success ? 'Sí' : 'No'}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>El diagrama aparecerá aquí después de generar</p>
                    <p className="text-xs mt-2">Tipo seleccionado: {selectedDiagramType.name}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-6">
            <Alert variant="destructive" className="border-red-300 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="whitespace-pre-wrap font-mono text-xs">
                {error}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Quick Examples */}
        <div className="mt-12">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-black">Ejemplos Rápidos</CardTitle>
              <CardDescription>
                Haz clic en cualquier ejemplo para cargarlo en el editor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(templates).map(([type, template]) => (
                  <button
                    key={type}
                    onClick={() => loadTemplate(type as TemplateType)}
                    className="p-4 text-left border border-gray-200 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                  >
                    <div className="font-medium capitalize text-black mb-2">
                      {(diagramTypes as any)[template.type]?.name || type}
                    </div>
                    <pre className="text-xs text-gray-600 overflow-hidden whitespace-pre-wrap">
                      {template.code.length > 80 ? template.code.substring(0, 80) + '...' : template.code}
                    </pre>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Footer
const Footer = () => (
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
);

export default function DashboardPage() {
  return (
    <>
      <DiagramGenerator />
      <Footer />
    </>
  );
}