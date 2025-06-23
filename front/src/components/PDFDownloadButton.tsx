"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, FileDown } from "lucide-react";
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';

interface PDFDownloadButtonProps {
  grammar: string;
  input: string;
  results: {
    firstFollow: { nonTerminal: string, first: string[], follow: string[] }[],
    ll1Table: { nonTerminal: string, terminals: Record<string, string> }[],
    derivation: { stack: string[], input: string[], rule: string }[]
  } | null;
  onGenerateStart: () => void;
  onGenerateEnd: () => void;
}

const PDFDownloadButton: React.FC<PDFDownloadButtonProps> = ({ 
  grammar, 
  input, 
  results, 
  onGenerateStart, 
  onGenerateEnd 
}) => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const generatePDF = async () => {
    if (!results) return;
    
    setIsGenerating(true);
    onGenerateStart();
    
    try {
      // Crear un nuevo documento PDF
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Agregar logo de UTEC
      const logoImg = new Image();
      logoImg.src = '/images/utec-logo.png';
      
      // Esperar a que la imagen se cargue antes de continuar
      await new Promise((resolve) => {
        logoImg.onload = resolve;
        setTimeout(resolve, 1000);
      });
      
      // Agregar el logo en la parte superior
      try {
        doc.addImage(logoImg, 'PNG', 10, 10, 40, 20);
      } catch (error) {
        console.error("Error al cargar el logo, continuando sin él:", error);
      }
      
      // Título
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Análisis LL(1) - Resultados', pageWidth / 2, 20, { align: 'center' });
      
      // Información de la gramática
      doc.setFontSize(14);
      doc.text('Gramática:', 10, 40);
      
      doc.setFontSize(10);
      doc.setFont('courier', 'normal');
      
      // Dividir la gramática en líneas
      const grammarLines = grammar.split('\n');
      let yPos = 45;
      
      grammarLines.forEach(line => {
        doc.text(line, 15, yPos);
        yPos += 5;
      });
      
      // Cadena de entrada
      yPos += 5;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Cadena de entrada:', 10, yPos);
      yPos += 7;
      
      doc.setFontSize(10);
      doc.setFont('courier', 'normal');
      doc.text(input, 15, yPos);
      yPos += 10;
      
      // FIRST y FOLLOW
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Conjuntos FIRST y FOLLOW', 10, yPos);
      yPos += 10;
      
      // Crear la tabla FIRST/FOLLOW
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      
      // Cabecera de la tabla
      doc.setFillColor(240, 240, 240);
      doc.rect(10, yPos - 5, pageWidth - 20, 7, 'F');
      doc.text('No Terminal', 15, yPos);
      doc.text('FIRST', pageWidth / 2 - 10, yPos);
      doc.text('FOLLOW', pageWidth - 40, yPos);
      yPos += 7;
      
      // Filas de la tabla
      doc.setFont('courier', 'normal');
      results.firstFollow.forEach((item, index) => {
        if (yPos > pageHeight - 20) {
          doc.addPage();
          yPos = 20;
        }
        
        // Alternar el fondo para mejor legibilidad
        if (index % 2 === 0) {
          doc.setFillColor(248, 248, 248);
          doc.rect(10, yPos - 5, pageWidth - 20, 7, 'F');
        }
        
        doc.text(item.nonTerminal, 15, yPos);
        doc.text("{ " + item.first.join(", ") + " }", pageWidth / 2 - 10, yPos);
        doc.text("{ " + item.follow.join(", ") + " }", pageWidth - 40, yPos);
        
        yPos += 7;
      });
      
      // Agregar una nueva página para la tabla LL(1)
      doc.addPage();
      yPos = 20;
      
      // Título de la tabla LL(1)
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Tabla LL(1)', 10, yPos);
      yPos += 10;
      
      // Obtener todas las terminales
      const terminals = Object.keys(results.ll1Table[0]?.terminals || {});
      
      // Calcular el ancho por columna
      const terminalWidth = (pageWidth - 40) / terminals.length;
      
      // Cabecera de la tabla LL(1)
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setFillColor(240, 240, 240);
      doc.rect(10, yPos - 5, pageWidth - 20, 7, 'F');
      
      doc.text('No Terminal', 15, yPos);
      
      terminals.forEach((term, idx) => {
        const xPos = 40 + (idx * terminalWidth);
        doc.text(term, xPos, yPos);
      });
      
      yPos += 7;
      
      // Filas de la tabla LL(1)
      doc.setFont('courier', 'normal');
      results.ll1Table.forEach((row, index) => {
        if (yPos > pageHeight - 20) {
          doc.addPage();
          yPos = 20;
          
          // Repetir cabecera en nueva página
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.setFillColor(240, 240, 240);
          doc.rect(10, yPos - 5, pageWidth - 20, 7, 'F');
          
          doc.text('No Terminal', 15, yPos);
          
          terminals.forEach((term, idx) => {
            const xPos = 40 + (idx * terminalWidth);
            doc.text(term, xPos, yPos);
          });
          
          yPos += 7;
          doc.setFont('courier', 'normal');
        }
        
        // Alternar el fondo
        if (index % 2 === 0) {
          doc.setFillColor(248, 248, 248);
          doc.rect(10, yPos - 5, pageWidth - 20, 7, 'F');
        }
        
        doc.text(row.nonTerminal, 15, yPos);
        
        Object.values(row.terminals).forEach((prod, idx) => {
          const xPos = 40 + (idx * terminalWidth);
          doc.text(prod, xPos, yPos);
        });
        
        yPos += 7;
      });
      
      // Agregar una nueva página para la tabla de derivación
      doc.addPage();
      yPos = 20;
      
      // Título de la tabla de derivación
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Tabla de Derivación', 10, yPos);
      yPos += 10;
      
      // Cabecera de la tabla de derivación
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setFillColor(240, 240, 240);
      doc.rect(10, yPos - 5, pageWidth - 20, 7, 'F');
      
      doc.text('PILA', 15, yPos);
      doc.text('ENTRADA', pageWidth / 2 - 10, yPos);
      doc.text('ACCIÓN', pageWidth - 40, yPos);
      
      yPos += 7;
      
      // Contenido de la tabla de derivación
      doc.setFont('courier', 'normal');
      results.derivation.forEach((step, index) => {
        if (yPos > pageHeight - 20) {
          doc.addPage();
          yPos = 20;
          
          // Repetir cabecera en nueva página
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setFillColor(240, 240, 240);
          doc.rect(10, yPos - 5, pageWidth - 20, 7, 'F');
          
          doc.text('PILA', 15, yPos);
          doc.text('ENTRADA', pageWidth / 2 - 10, yPos);
          doc.text('ACCIÓN', pageWidth - 40, yPos);
          
          yPos += 7;
          doc.setFont('courier', 'normal');
        }
        
        // Alternar el fondo
        if (index % 2 === 0) {
          doc.setFillColor(248, 248, 248);
          doc.rect(10, yPos - 5, pageWidth - 20, 7, 'F');
        }
        
        // Truncar texto largo
        const stackText = step.stack.join(' ').substring(0, 30) + (step.stack.join(' ').length > 30 ? '...' : '');
        const inputText = step.input.join(' ').substring(0, 30) + (step.input.join(' ').length > 30 ? '...' : '');
        
        doc.text(stackText, 15, yPos);
        doc.text(inputText, pageWidth / 2 - 10, yPos);
        doc.text(step.rule || '-', pageWidth - 40, yPos);
        
        yPos += 7;
      });
      
      // Pie de página
      const today = new Date();
      const dateStr = today.toLocaleDateString();
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text(`Generado el ${dateStr} - Analizador LL(1) - UTEC`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      
      // Guardar PDF
      doc.save('analisis_ll1_resultados.pdf');
      
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Error al generar el PDF. Verifica la consola para más detalles.");
    } finally {
      setIsGenerating(false);
      onGenerateEnd();
    }
  };

  return (
    <motion.div 
      className="mb-6 flex justify-end"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Button 
        onClick={generatePDF} 
        disabled={isGenerating || !results}
        className="bg-gray-900 hover:bg-gray-700 text-white transition-colors duration-300 flex items-center gap-2"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generando PDF...
          </>
        ) : (
          <>
            <FileDown className="h-4 w-4" />
            Descargar Resultados como PDF
          </>
        )}
      </Button>
    </motion.div>
  );
};

export default PDFDownloadButton;