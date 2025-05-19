import { jsPDF } from 'jspdf';

export interface Printer {
  name: string;
  type: 'thermal' | 'pdf';
  width: number; // in mm
  dpi: number;
  print: (content: string) => Promise<void>;
}

class PrinterPlugin {
  private printers: Printer[] = [];
  private selectedPrinter: Printer | null = null;

  constructor() {
    // Add PDF printer by default
    this.printers.push({
      name: 'PDF Virtual Printer',
      type: 'pdf',
      width: 80,
      dpi: 203,
      print: async (content: string) => {
        const doc = new jsPDF({
          unit: 'mm',
          format: [this.selectedPrinter?.width || 80, 297],
        });

        // Parse HTML content for images and formatting
        const parser = new DOMParser();
        const htmlDoc = parser.parseFromString(content, 'text/html');
        const images = htmlDoc.getElementsByTagName('img');
        
        let y = 10;

        // Handle images
        if (images.length > 0) {
          for (let i = 0; i < images.length; i++) {
            const img = images[i];
            const src = img.getAttribute('src');
            if (src) {
              try {
                const imgWidth = this.selectedPrinter?.width ? this.selectedPrinter.width - 20 : 60;
                doc.addImage(src, 'PNG', 10, y, imgWidth, imgWidth * 0.4);
                y += imgWidth * 0.4 + 5;
              } catch (error) {
                console.error('Error adding image to PDF:', error);
              }
            }
          }
        }

        // Add text content
        doc.setFontSize(10);
        const textContent = content.replace(/<[^>]*>/g, '');
        const lines = textContent.split('\n');
        
        lines.forEach(line => {
          if (line.trim()) {
            doc.text(line, 5, y);
            y += 5;
          }
        });
        
        doc.save(`ticket-${new Date().getTime()}.pdf`);
      }
    });

    // Detect thermal printers
    this.detectThermalPrinters();
  }

  private async detectThermalPrinters() {
    try {
      if ('printer' in navigator && 'query' in (navigator as any).printer) {
        const devices = await (navigator as any).printer.query();
        
        for (const device of devices) {
          // Check if it's a thermal printer by common manufacturer names
          const isThermal = /epson|star|bixolon|citizen|zebra/i.test(device.manufacturer || '');
          
          if (isThermal) {
            this.printers.push({
              name: device.name,
              type: 'thermal',
              width: device.capabilities?.paperWidth || 80,
              dpi: device.capabilities?.resolution || 203,
              print: async (content: string) => {
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                document.body.appendChild(iframe);
                
                const doc = iframe.contentWindow?.document;
                if (doc) {
                  doc.open();
                  doc.write(`
                    <style>
                      @page {
                        margin: 0;
                        width: ${device.capabilities?.paperWidth}mm;
                      }
                      body {
                        font-family: monospace;
                        margin: 0;
                        padding: 5mm;
                        width: ${device.capabilities?.paperWidth - 10}mm;
                      }
                      img {
                        max-width: 100%;
                        height: auto;
                      }
                      .center {
                        text-align: center;
                      }
                      .right {
                        text-align: right;
                      }
                    </style>
                    ${content}
                  `);
                  doc.close();
                  
                  try {
                    await iframe.contentWindow?.print();
                  } finally {
                    document.body.removeChild(iframe);
                  }
                }
              }
            });
          }
        }
      }
    } catch (error) {
      console.error('Error detecting thermal printers:', error);
    }
  }

  getPrinters(): Printer[] {
    return this.printers;
  }

  getSelectedPrinter(): Printer | null {
    return this.selectedPrinter;
  }

  setSelectedPrinter(printerName: string) {
    const printer = this.printers.find(p => p.name === printerName);
    if (printer) {
      this.selectedPrinter = printer;
      localStorage.setItem('selectedPrinter', printer.name);
    }
  }

  async print(content: string): Promise<boolean> {
    try {
      if (!this.selectedPrinter) {
        this.selectedPrinter = this.printers[0];
      }
      
      await this.selectedPrinter.print(content);
      return true;
    } catch (error) {
      console.error('Error printing:', error);
      return false;
    }
  }

  initialize() {
    const savedPrinter = localStorage.getItem('selectedPrinter');
    if (savedPrinter) {
      this.setSelectedPrinter(savedPrinter);
    } else {
      this.selectedPrinter = this.printers[0];
    }
  }

  getPaperWidth(): number {
    return this.selectedPrinter?.width || 80;
  }

  getDPI(): number {
    return this.selectedPrinter?.dpi || 203;
  }
}

export const printerPlugin = new PrinterPlugin();