package com.interviewer;

import com.interviewer.service.ResumeTextExtractor;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ResumeTextExtractorTest {

    @Test
    void readsPlainText() throws IOException {
        assertEquals("Ada Lovelace, Java",
                ResumeTextExtractor.extract("Ada Lovelace, Java".getBytes(StandardCharsets.UTF_8), "txt"));
    }

    @Test
    void readsDocxParagraphs() throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (ZipOutputStream zip = new ZipOutputStream(out)) {
            zip.putNextEntry(new ZipEntry("word/document.xml"));
            zip.write(("<w:document><w:body><w:p><w:r><w:t>Ada Lovelace</w:t></w:r></w:p>"
                    + "<w:p><w:r><w:t>Java, Spring Boot</w:t></w:r></w:p></w:body></w:document>")
                    .getBytes(StandardCharsets.UTF_8));
            zip.closeEntry();
        }

        String text = ResumeTextExtractor.extract(out.toByteArray(), "docx");
        assertTrue(text.contains("Ada Lovelace"));
        assertTrue(text.contains("Java, Spring Boot"));
    }

    @Test
    void readsPdfTextLayer() throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage();
            document.addPage(page);
            try (PDPageContentStream stream = new PDPageContentStream(document, page)) {
                stream.beginText();
                stream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 12);
                stream.newLineAtOffset(72, 700);
                stream.showText("Ada Lovelace Java");
                stream.endText();
            }
            document.save(out);
        }

        assertTrue(ResumeTextExtractor.extract(out.toByteArray(), "pdf").contains("Ada Lovelace Java"));
    }

    @Test
    void rejectsScannedPdfWithoutText() throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PDDocument document = new PDDocument()) {
            document.addPage(new PDPage());
            document.save(out);
        }

        IOException error = assertThrows(IOException.class,
                () -> ResumeTextExtractor.extract(out.toByteArray(), "pdf"));
        assertTrue(error.getMessage().contains("no text layer"));
    }
}
