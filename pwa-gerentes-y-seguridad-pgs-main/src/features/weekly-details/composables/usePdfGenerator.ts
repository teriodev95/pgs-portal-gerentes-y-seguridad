import axios from 'axios';
import { ref } from 'vue';

export const usePdfGenerator = () => {
  const isGeneratingPDF = ref(false);
  
  const generatePDF = async (htmlTemplate: string) => {
    isGeneratingPDF.value = true;
    try {
      const response = await axios({
        method: 'post',
        url: 'https://api.pdfshift.io/v3/convert/pdf',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic YXBpLWtleTpza184MTA3M2JjMWJlMDg0Y2VjNjE4MzBhNzZmOWI0OTJiNjg5OTg1Y2Y2'
        },
        data: {
          source: htmlTemplate,
          format: 'A4',
          landscape: false
        },
        responseType: 'blob'
      });
      
      if (!response.data) throw new Error('Error al obtener el PDF');
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error generando PDF:', error);
      throw error;
    } finally {
      isGeneratingPDF.value = false;
    }
  };

  const downloadPDF = (url: string, fileName: string = 'documento.pdf') => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const openPDF = (url: string) => {
    window.open(url, '_blank');
  };

  return {
    isGeneratingPDF,
    generatePDF,
    openPDF,
    downloadPDF
  };
};