package com.interviewer.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Set;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/**
 * Turns an uploaded resume into plain text. Text is trivial; DOCX is a zip with
 * one XML part; PDF uses PDFBox. A scanned PDF with no text layer is reported
 * honestly instead of being parsed as empty.
 */
public final class ResumeTextExtractor {

    public static final Set<String> TEXT_EXTENSIONS = Set.of("txt", "md", "text");
    public static final Set<String> SUPPORTED_EXTENSIONS = Set.of("txt", "md", "text", "pdf", "docx");

    private ResumeTextExtractor() {
    }

    public static String extract(byte[] bytes, String extension) throws IOException {
        String normalized = extension == null ? "" : extension.toLowerCase();
        if (TEXT_EXTENSIONS.contains(normalized)) {
            return new String(bytes, StandardCharsets.UTF_8);
        }
        if ("pdf".equals(normalized)) {
            return extractPdf(bytes);
        }
        if ("docx".equals(normalized)) {
            return extractDocx(bytes);
        }
        throw new IOException("Unsupported resume format: " + normalized);
    }

    private static String extractPdf(byte[] bytes) throws IOException {
        try (PDDocument document = Loader.loadPDF(bytes)) {
            String text = new PDFTextStripper().getText(document);
            if (text == null || text.isBlank()) {
                throw new IOException("This PDF has no text layer. Paste the text or upload a DOCX/TXT.");
            }
            return text;
        }
    }

    private static String extractDocx(byte[] bytes) throws IOException {
        try (ZipInputStream zip = new ZipInputStream(new ByteArrayInputStream(bytes))) {
            ZipEntry entry;
            while ((entry = zip.getNextEntry()) != null) {
                if (!"word/document.xml".equals(entry.getName())) continue;
                String xml = new String(zip.readAllBytes(), StandardCharsets.UTF_8);
                String text = xml
                        .replaceAll("</w:p>", "\n")
                        .replaceAll("<w:tab[^>]*/>", "\t")
                        .replaceAll("<w:br[^>]*/>", "\n")
                        .replaceAll("<[^>]+>", "")
                        .replace("&amp;", "&")
                        .replace("&lt;", "<")
                        .replace("&gt;", ">")
                        .replace("&quot;", "\"")
                        .replace("&apos;", "'");
                if (text.isBlank()) {
                    throw new IOException("This DOCX has no readable text.");
                }
                return text;
            }
        }
        throw new IOException("This file is not a valid DOCX.");
    }
}
