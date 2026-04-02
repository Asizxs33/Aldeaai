/**
 * Export utilities for ҚМЖ and other generated content
 * Provides export to Word, Excel, and print functionality
 */

/**
 * Convert HTML table to CSV data
 * @param {string} content - HTML or Markdown content with tables
 * @returns {string} CSV formatted data
 */
export const convertToCSV = (content) => {
    // Extract table data from markdown/HTML
    const lines = content.split('\n');
    let csvData = '';
    let inTable = false;

    for (const line of lines) {
        if (line.includes('|')) {
            inTable = true;
            // Skip separator lines
            if (line.match(/^\|[\s\-:]+\|$/)) continue;

            // Convert table row to CSV
            const cells = line.split('|')
                .filter(cell => cell.trim())
                .map(cell => `"${cell.trim().replace(/"/g, '""')}"`);
            csvData += cells.join(',') + '\n';
        } else if (inTable && !line.includes('|')) {
            inTable = false;
        }
    }

    return csvData;
};

/**
 * Download content as a file
 * @param {string} content - File content
 * @param {string} filename - File name
 * @param {string} mimeType - MIME type
 */
export const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

/**
 * Export ҚМЖ content to Word document (HTML format that Word can open)
 * @param {string} content - Generated ҚМЖ content (markdown/text)
 * @param {string} title - Document title
 */
export const exportToWord = (content, title = 'ҚМЖ') => {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${title}</title>
    <style>
        body { font-family: 'Times New Roman', serif; font-size: 11pt; margin: 2cm; }
        h1 { font-size: 16pt; text-align: center; margin-bottom: 20px; }
        
        /* Word-specific table styling */
        table { 
            border-collapse: collapse; 
            width: 100%; 
            margin: 15px 0; 
            mso-border-alt: solid windowtext .5pt; 
            mso-padding-alt: 0cm 5.4pt 0cm 5.4pt;
        }
        
        td, th { 
            border: 1px solid windowtext; 
            padding: 5px; 
            mso-border-alt: solid windowtext .5pt;
            vertical-align: top;
        }
        
        strong { font-weight: bold; }
        p { margin: 5px 0; }
        ul { margin: 5px 0; padding-left: 20px; }
    </style>
</head>
<body>
    <h1>${title}</h1>
    ${markdownToHtml(content)}
</body>
</html>`;

    downloadFile(htmlContent, `${title}.doc`, 'application/msword');
};

/**
 * Export ҚМЖ content to Excel (CSV format)
 * @param {string} content - Generated ҚМЖ content
 * @param {string} title - File title
 */
export const exportToExcel = (content, title = 'ҚМЖ') => {
    const csvContent = convertToCSV(content);

    // Add BOM for Excel UTF-8 support
    const bom = '\uFEFF';
    downloadFile(bom + csvContent, `${title}.csv`, 'text/csv;charset=utf-8');
};

/**
 * Print content
 * @param {string} content - Content to print
 * @param {string} title - Document title
 */
export const printContent = (content, title = 'ҚМЖ') => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${title}</title>
    <style>
        @page { size: A4; margin: 1.5cm; }
        body { font-family: 'Times New Roman', serif; font-size: 11pt; }
        h1 { font-size: 14pt; text-align: center; margin-bottom: 15px; }
        h2 { font-size: 12pt; margin-top: 15px; }
        table { border-collapse: collapse; width: 100%; margin: 10px 0; font-size: 10pt; }
        th, td { border: 1px solid black; padding: 5px; text-align: left; vertical-align: top; }
        th { background-color: #e0e0e0; }
    </style>
</head>
<body>
    <h1>${title}</h1>
    ${markdownToHtml(content)}
</body>
</html>`);
    printWindow.document.close();
    printWindow.print();
};

/**
 * Simple markdown to HTML converter
 * @param {string} markdown - Markdown content
 * @returns {string} HTML content
 */
export const markdownToHtml = (markdown) => {
    if (!markdown) return '';

    // Check if the content is ALREADY an HTML table or partial HTML (for streaming)
    // We trim whitespace and check if it starts with <
    if (markdown.trim().startsWith('<')) {
        return markdown;
    }

    let html = markdown
        // Headers
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        // Bold
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        // Lists
        .replace(/^\s*[-•]\s(.*)$/gim, '<li>$1</li>')
        .replace(/^\s*\d+\.\s(.*)$/gim, '<li>$1</li>')
        // Paragraphs
        .replace(/\n\n/g, '</p><p>')
        // Line breaks
        .replace(/\n/g, '<br>');

    // Wrap list items in ul
    html = html.replace(/(<li>.*<\/li>)+/gim, '<ul>$&</ul>');

    // Convert markdown tables to HTML tables
    html = convertMarkdownTablesToHtml(html);

    return `<p>${html}</p>`;
};

/**
 * Convert markdown tables to HTML tables
 * @param {string} html - HTML with markdown tables
 * @returns {string} HTML with proper tables
 */
const convertMarkdownTablesToHtml = (html) => {
    const tableRegex = /\|(.+)\|/g;
    const lines = html.split('<br>');
    let result = [];
    let tableLines = [];
    let inTable = false;

    for (const line of lines) {
        if (line.includes('|')) {
            // Skip separator lines
            if (line.match(/^\|[\s\-:]+\|$/)) continue;

            tableLines.push(line);
            inTable = true;
        } else {
            if (inTable && tableLines.length > 0) {
                result.push(convertTableLinesToHtml(tableLines));
                tableLines = [];
            }
            inTable = false;
            result.push(line);
        }
    }

    // Handle remaining table
    if (tableLines.length > 0) {
        result.push(convertTableLinesToHtml(tableLines));
    }

    return result.join('<br>');
};

/**
 * Convert table lines to HTML table
 * @param {string[]} lines - Table lines
 * @returns {string} HTML table
 */
const convertTableLinesToHtml = (lines) => {
    if (lines.length === 0) return '';

    let html = '<table>';

    lines.forEach((line, index) => {
        const cells = line.split('|').filter(cell => cell.trim());
        const tag = index === 0 ? 'th' : 'td';

        html += '<tr>';
        cells.forEach(cell => {
            html += `<${tag}>${cell.trim()}</${tag}>`;
        });
        html += '</tr>';
    });

    html += '</table>';
    return html;
};

/**
 * Copy content to clipboard
 * @param {string} content - Content to copy
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (content) => {
    try {
        await navigator.clipboard.writeText(content);
        return true;
    } catch (err) {
        console.error('Failed to copy:', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = content;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        } catch (e) {
            document.body.removeChild(textArea);
            return false;
        }
    }
};
