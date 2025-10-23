declare module 'html2pdf.js' {
  function html2pdf(): {
    from(element: HTMLElement): {
      set(options: object): {
        outputPdf(): Promise<string>
        save(): Promise<void>
      }
    }
  }

  export default html2pdf
}
