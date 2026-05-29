/* ==========================================
   ATS MARKDOWN RESUME STUDIO - APP ENGINE
   ========================================== */

// --- Default Configurations ---
const DEFAULT_STYLE_CONFIG = {
    fontFamily: "'Raleway', 'Inter', sans-serif",
    fontSize: "14",
    lineHeight: "1.45",
    headingScale: "1.6",
    marginX: "30",
    marginY: "25",
    sectionSpacing: "12",
    colorBg: "#ffffff",
    colorHeadings: "#1e293b",
    colorBody: "#334155",
    colorLinks: "#7c3aed",
    colorAccent: "#0d9488",
    layoutMode: "1-column",
    sidebarBg: "#2d3748",
    sidebarText: "#ffffff",
    sidebarPosition: "right",
    sidebarSections: "EDUCATION,TECHNICAL SKILLS"
};

// SVG Icons for the ATS Checklist
const ICONS = {
    check: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="margin-top:2px; flex-shrink:0;"><polyline points="20 6 9 17 4 12"/></svg>`,
    error: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="margin-top:2px; flex-shrink:0;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    info: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-top:2px; flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`
};

document.addEventListener('DOMContentLoaded', async () => {
    // --- DOM Elements Cache ---
    const markdownInput = document.getElementById('markdown-input');
    const resumeOutput = document.getElementById('resume-output');
    
    // Zoom Controls
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const zoomLevelText = document.getElementById('zoom-level');
    const previewCanvas = document.getElementById('preview-canvas');
    const canvasWrapper = document.querySelector('.preview-canvas-wrapper');
    const zoomResetBtn = document.getElementById('zoom-reset');
    
    // Toolbar Actions
    const btnLoadSample = document.getElementById('btn-load-sample');
    const btnClear = document.getElementById('btn-clear');
    const btnPrint = document.getElementById('btn-print');
    
    // Theme switch elements
    const btnThemeToggle = document.getElementById('btn-theme-toggle');
    const themeBtnIcon = document.getElementById('theme-btn-icon');
    const themeBtnText = document.getElementById('theme-btn-text');

    // About Modal Elements
    const btnAbout = document.getElementById('btn-about');
    const aboutModal = document.getElementById('about-modal');
    const btnCloseModal = document.getElementById('btn-close-modal');
    
    // Style Customizer Controls
    const fontTiles = document.querySelectorAll('.font-tile');
    const fontSizeSlider = document.getElementById('font-size');
    const lineHeightSlider = document.getElementById('line-height');
    const headingScaleSlider = document.getElementById('heading-scale');
    const marginXSlider = document.getElementById('margin-x');
    const marginYSlider = document.getElementById('margin-y');
    const sectionSpacingSlider = document.getElementById('section-spacing');
    
    const layoutModeSelect = document.getElementById('layout-mode');
    const sidebarOnlyControls = document.getElementById('sidebar-only-controls');
    const sidebarPositionSelect = document.getElementById('sidebar-position');
    const colorSidebarBg = document.getElementById('color-sidebar-bg');
    const hexSidebarBg = document.getElementById('hex-sidebar-bg');
    const colorSidebarText = document.getElementById('color-sidebar-text');
    const hexSidebarText = document.getElementById('hex-sidebar-text');
    const sidebarChecklistContainer = document.getElementById('sidebar-sections-checklist');
    
    const colorBg = document.getElementById('color-bg');
    const hexBg = document.getElementById('hex-bg');
    const colorHeadings = document.getElementById('color-headings');
    const colorBody = document.getElementById('color-body');
    const colorLinks = document.getElementById('color-links');
    const colorAccent = document.getElementById('color-accent');
    
    // Color preset buttons
    const presetClassicNb = document.getElementById('preset-classic-nb');
    const presetDarkMode = document.getElementById('preset-dark-mode');
    const presetCleanBlue = document.getElementById('preset-clean-blue');
    const presetCustom = document.getElementById('preset-custom');
    
    // Sliders value label updates
    const valFontSize = document.getElementById('val-font-size');
    const valLineHeight = document.getElementById('val-line-height');
    const valHeadingScale = document.getElementById('val-heading-scale');
    const valMarginX = document.getElementById('val-margin-x');
    const valMarginY = document.getElementById('val-margin-y');
    const valSectionSpacing = document.getElementById('val-section-spacing');
    
    // Hex Color Labels
    const hexHeadings = document.getElementById('hex-headings');
    const hexBody = document.getElementById('hex-body');
    const hexLinks = document.getElementById('hex-links');
    const hexAccent = document.getElementById('hex-accent');
    
    // ATS Checklist and Score
    const scoreRingProgress = document.getElementById('score-ring-progress');
    const scoreValueText = document.getElementById('score-value');
    const verdictTitle = document.getElementById('verdict-title');
    const verdictDesc = document.getElementById('verdict-desc');
    const atsChecklistContainer = document.getElementById('ats-checklist');
    const charWordCount = document.getElementById('char-word-count');
    
    // Export Clipboard buttons
    const btnCopyStandalone = document.getElementById('btn-copy-standalone');
    const btnCopyCss = document.getElementById('btn-copy-css');
    const btnCopyHtml = document.getElementById('btn-copy-html');
    const btnDownloadMd = document.getElementById('btn-download-md');
    const btnSyncN8n = document.getElementById('btn-sync-n8n');
    const n8nWebhookUrl = document.getElementById('n8n-webhook-url');
    
    // Toast Alert
    const toast = document.getElementById('toast');

    // --- State Variables ---
    let zoomFactor = 1.0;
    let isUserZoomed = false; // Tracks if user manually changed zoom
    let styleConfig = { ...DEFAULT_STYLE_CONFIG };
    let templatesCssText = "";

    // Load templates.css stylesheet code for n8n embedding
    try {
        const response = await fetch('templates.css?v=1.2.5');
        if (response.ok) {
            templatesCssText = await response.text();
        }
    } catch (e) {
        console.error("Failed to preload templates.css:", e);
    }

    // --- Core Methods ---
    
    // Toast helper
    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2500);
    }

    // Apply Style Configuration to preview
    function applyStyles() {
        const root = resumeOutput;
        root.style.setProperty('--resume-font-family', styleConfig.fontFamily);
        root.style.setProperty('--resume-font-size', styleConfig.fontSize + 'px');
        root.style.setProperty('--resume-line-height', styleConfig.lineHeight);
        root.style.setProperty('--resume-heading-scale', styleConfig.headingScale);
        root.style.setProperty('--resume-margin-x', styleConfig.marginX + 'px');
        root.style.setProperty('--resume-margin-y', styleConfig.marginY + 'px');
        root.style.setProperty('--resume-section-spacing', styleConfig.sectionSpacing + 'px');
        
        root.style.setProperty('--resume-color-bg', styleConfig.colorBg || '#ffffff');
        root.style.setProperty('--resume-color-headings', styleConfig.colorHeadings);
        root.style.setProperty('--resume-color-body', styleConfig.colorBody);
        root.style.setProperty('--resume-color-links', styleConfig.colorLinks);
        root.style.setProperty('--resume-color-accent', styleConfig.colorAccent);
        
        root.style.setProperty('--resume-sidebar-bg', styleConfig.sidebarBg || '#2d3748');
        root.style.setProperty('--resume-sidebar-text', styleConfig.sidebarText || '#ffffff');

        // Update Slider Labels
        valFontSize.textContent = styleConfig.fontSize + 'px';
        valLineHeight.textContent = styleConfig.lineHeight;
        valHeadingScale.textContent = styleConfig.headingScale;
        valMarginX.textContent = styleConfig.marginX + 'px';
        valMarginY.textContent = styleConfig.marginY + 'px';
        valSectionSpacing.textContent = styleConfig.sectionSpacing + 'px';

        // Update Hex Texts
        hexBg.textContent = styleConfig.colorBg || '#ffffff';
        hexHeadings.textContent = styleConfig.colorHeadings;
        hexBody.textContent = styleConfig.colorBody;
        hexLinks.textContent = styleConfig.colorLinks;
        hexAccent.textContent = styleConfig.colorAccent;
        hexSidebarBg.textContent = styleConfig.sidebarBg || '#2d3748';
        hexSidebarText.textContent = styleConfig.sidebarText || '#ffffff';

        // Show/hide sidebar only controls
        if (styleConfig.layoutMode === '2-column') {
            sidebarOnlyControls.style.display = 'block';
        } else {
            sidebarOnlyControls.style.display = 'none';
        }

        // Active font tile
        fontTiles.forEach(tile => {
            if (tile.getAttribute('data-font') === styleConfig.fontFamily) {
                tile.classList.add('active');
            } else {
                tile.classList.remove('active');
            }
        });

        // Active preset button
        updateActivePresetBtn();
    }

    function updateActivePresetBtn() {
        presetClassicNb.classList.remove('active');
        presetDarkMode.classList.remove('active');
        presetCleanBlue.classList.remove('active');
        presetCustom.classList.remove('active');

        const bg = (styleConfig.colorBg || '#ffffff').toLowerCase();
        const headings = styleConfig.colorHeadings.toLowerCase();
        const body = styleConfig.colorBody.toLowerCase();
        const links = styleConfig.colorLinks.toLowerCase();
        const accent = styleConfig.colorAccent.toLowerCase();

        if (bg === '#ffffff' && headings === '#111111' &&
            body === '#222222' && links === '#000000' &&
            accent === '#444444') {
            presetClassicNb.classList.add('active');
        } else if (bg === '#0f172a' && headings === '#f8fafc' &&
            body === '#cbd5e1' && links === '#38bdf8' &&
            accent === '#34d399') {
            presetDarkMode.classList.add('active');
        } else if (bg === '#ffffff' && headings === '#0f172a' &&
            body === '#334155' && links === '#2563eb' &&
            accent === '#0ea5e9') {
            presetCleanBlue.classList.add('active');
        } else {
            presetCustom.classList.add('active');
        }
    }

    let customColors = {
        colorBg: DEFAULT_STYLE_CONFIG.colorBg,
        colorHeadings: DEFAULT_STYLE_CONFIG.colorHeadings,
        colorBody: DEFAULT_STYLE_CONFIG.colorBody,
        colorLinks: DEFAULT_STYLE_CONFIG.colorLinks,
        colorAccent: DEFAULT_STYLE_CONFIG.colorAccent,
        sidebarBg: DEFAULT_STYLE_CONFIG.sidebarBg,
        sidebarText: DEFAULT_STYLE_CONFIG.sidebarText
    };

    function saveCustomColorsState() {
        const bg = (styleConfig.colorBg || '#ffffff').toLowerCase();
        const headings = styleConfig.colorHeadings.toLowerCase();
        const body = styleConfig.colorBody.toLowerCase();
        const links = styleConfig.colorLinks.toLowerCase();
        const accent = styleConfig.colorAccent.toLowerCase();

        const isPreset = (
            (bg === '#ffffff' && headings === '#111111' &&
             body === '#222222' && links === '#000000' &&
             accent === '#444444') ||
            (bg === '#0f172a' && headings === '#f8fafc' &&
             body === '#cbd5e1' && links === '#38bdf8' &&
             accent === '#34d399') ||
            (bg === '#ffffff' && headings === '#0f172a' &&
             body === '#334155' && links === '#2563eb' &&
             accent === '#0ea5e9')
        );
        if (!isPreset) {
            customColors.colorBg = styleConfig.colorBg;
            customColors.colorHeadings = styleConfig.colorHeadings;
            customColors.colorBody = styleConfig.colorBody;
            customColors.colorLinks = styleConfig.colorLinks;
            customColors.colorAccent = styleConfig.colorAccent;
            customColors.sidebarBg = styleConfig.sidebarBg;
            customColors.sidebarText = styleConfig.sidebarText;
        }
    }

    // Debounce helper for server saves
    function debounce(func, delay) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }

    // Save configuration and markdown to local files on the server
    const saveToServer = debounce(() => {
        const payload = {
            markdown: markdownInput.value,
            config: styleConfig
        };
        
        fetch('/api/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
            console.log("Fichiers de configuration locaux sauvegardés sur le serveur.");
        })
        .catch(err => {
            console.error("Erreur de sauvegarde locale sur le serveur :", err);
        });
    }, 1000);

    // Import configurations from controls values
    function updateConfigFromControls() {
        styleConfig.fontSize = fontSizeSlider.value;
        styleConfig.lineHeight = lineHeightSlider.value;
        styleConfig.headingScale = headingScaleSlider.value;
        styleConfig.marginX = marginXSlider.value;
        styleConfig.marginY = marginYSlider.value;
        styleConfig.sectionSpacing = sectionSpacingSlider.value;
        
        styleConfig.layoutMode = layoutModeSelect.value;
        styleConfig.sidebarBg = colorSidebarBg.value;
        styleConfig.sidebarText = colorSidebarText.value;
        styleConfig.sidebarPosition = sidebarPositionSelect.value;

        styleConfig.colorBg = colorBg.value;
        styleConfig.colorHeadings = colorHeadings.value;
        styleConfig.colorBody = colorBody.value;
        styleConfig.colorLinks = colorLinks.value;
        styleConfig.colorAccent = colorAccent.value;
        
        // Save current color states to custom colors
        saveCustomColorsState();
        
        applyStyles();
        
        // Recompile markdown since layout modes affect DOM structure
        compileMarkdown(markdownInput.value);
        
        saveToServer();
    }

    // Sync GUI controls with current active state
    function updateControlsFromConfig() {
        fontSizeSlider.value = styleConfig.fontSize;
        lineHeightSlider.value = styleConfig.lineHeight;
        headingScaleSlider.value = styleConfig.headingScale;
        marginXSlider.value = styleConfig.marginX;
        marginYSlider.value = styleConfig.marginY;
        sectionSpacingSlider.value = styleConfig.sectionSpacing;
        
        layoutModeSelect.value = styleConfig.layoutMode || "1-column";
        colorSidebarBg.value = styleConfig.sidebarBg || "#2d3748";
        colorSidebarText.value = styleConfig.sidebarText || "#ffffff";
        sidebarPositionSelect.value = styleConfig.sidebarPosition || "right";

        colorBg.value = styleConfig.colorBg || "#ffffff";
        colorHeadings.value = styleConfig.colorHeadings;
        colorBody.value = styleConfig.colorBody;
        colorLinks.value = styleConfig.colorLinks;
        colorAccent.value = styleConfig.colorAccent;
        
        applyStyles();
    }

    // Auto-Fit Zoom calculation to prevent canvas clipping
    function autoFitZoom() {
        if (isUserZoomed) return; // Don't override manual zooms
        
        if (!canvasWrapper) return;
        
        const wrapperWidth = canvasWrapper.clientWidth - 60; // Include margins
        const sheetWidth = 794; // 210mm in pixels at 96dpi (793.7px)
        
        if (wrapperWidth < sheetWidth) {
            zoomFactor = wrapperWidth / sheetWidth;
        } else {
            zoomFactor = 1.0;
        }
        
        updateZoomDisplay();
    }

    let lastSectionsJSON = "";
    
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function updateHeaderInMarkdown(title, toSidebar) {
        const mdText = markdownInput.value;
        const lines = mdText.split('\n');
        const escapedTitle = escapeRegExp(title.trim().toLowerCase());
        
        // Match lines starting with ## or ### and followed by the title
        const headerRegex = new RegExp(`^(##|###)\\s+(${escapedTitle})\\s*$`, 'i');
        
        let updated = false;
        const newLines = lines.map(line => {
            const match = line.match(headerRegex);
            if (match) {
                updated = true;
                const newHeader = toSidebar ? '###' : '##';
                return `${newHeader} ${line.substring(match[1].length).trim()}`;
            }
            return line;
        });
        
        if (updated) {
            markdownInput.value = newLines.join('\n');
            // Recompile markdown to update preview
            compileMarkdown(markdownInput.value);
            saveToServer();
        }
    }

    function updateSidebarChecklist(sections) {
        const sectionsJSON = JSON.stringify(sections);
        if (sectionsJSON === lastSectionsJSON) {
            // Keep checkbox states in sync with current section states
            const checkboxes = sidebarChecklistContainer.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach((cb, index) => {
                if (sections[index]) {
                    cb.checked = sections[index].isSidebar;
                }
            });
            return;
        }
        
        lastSectionsJSON = sectionsJSON;
        sidebarChecklistContainer.innerHTML = '';
        
        if (sections.length === 0) {
            sidebarChecklistContainer.innerHTML = '<span style="font-size:10px; color:var(--text-muted); font-style:italic; padding: 4px;">No sections detected (headers starting with "##" or "###")</span>';
            return;
        }
        
        sections.forEach(section => {
            const title = section.title;
            const isSidebar = section.isSidebar;
            
            const item = document.createElement('label');
            item.className = 'sidebar-checklist-item';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = title;
            checkbox.checked = isSidebar;
            
            checkbox.addEventListener('change', () => {
                updateHeaderInMarkdown(title, checkbox.checked);
            });
            
            item.appendChild(checkbox);
            item.appendChild(document.createTextNode(title));
            sidebarChecklistContainer.appendChild(item);
        });
    }
 
    // Markdown Parser with Guide Custom Directives & delimiters
    function compileMarkdown(mdText) {
        if (!mdText.trim()) {
            resumeOutput.innerHTML = `<p style="color:#64748b; font-style:italic;">Start typing Markdown on the left to preview...</p>`;
            return;
        }

        // Configure Marked.js
        marked.setOptions({
            gfm: true,
            breaks: true
        });

        // 1. Pre-process custom directives: :accent[text] and :muted[text]
        let processedMd = mdText;
        processedMd = processedMd.replace(/:accent\[([^\]]+)\]/g, '<span class="resume-accent">$1</span>');
        processedMd = processedMd.replace(/:muted\[([^\]]+)\]/g, '<span class="resume-muted">$1</span>');

        // Compile markdown to HTML
        let html = marked.parse(processedMd);

        // 2. Post-process contact block if present: e.g. [CONTACT : text]
        html = html.replace(/\[CONTACT\s*:\s*([^\]]+)\]/gi, (match, contents) => {
            const parts = contents.split('|').map(p => p.trim());
            const formattedParts = parts.map(part => {
                if (part.includes('@') && !part.includes(' ')) {
                    return `<a href="mailto:${part}">${part}</a>`;
                }
                if (part.startsWith('http://') || part.startsWith('https://')) {
                    const cleanUrl = part.replace(/^https?:\/\/(www\.)?/, '');
                    return `<a href="${part}" target="_blank">${cleanUrl}</a>`;
                }
                return `<span>${part}</span>`;
            });
            return `<div class="resume-contact-bar">${formattedParts.join(' &nbsp;•&nbsp; ')}</div>`;
        });

        // RESTRUCTURE FOR 2 COLUMNS IF ENABLED
        let finalHtml = html;
        if (styleConfig.layoutMode === '2-column') {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const bodyElements = Array.from(doc.body.children);
            
            const headerElements = [];
            const mainColElements = [];
            const sidebarColElements = [];
            
            let currentDest = null;
            let foundFirstHeading = false;
            
            for (let el of bodyElements) {
                if (el.tagName === 'H2') {
                    foundFirstHeading = true;
                    currentDest = mainColElements;
                    currentDest.push(el.cloneNode(true));
                } else if (el.tagName === 'H3') {
                    foundFirstHeading = true;
                    currentDest = sidebarColElements;
                    currentDest.push(el.cloneNode(true));
                } else if (!foundFirstHeading) {
                    headerElements.push(el.cloneNode(true));
                } else {
                    if (currentDest) {
                        currentDest.push(el.cloneNode(true));
                    } else {
                        headerElements.push(el.cloneNode(true));
                    }
                }
            }
            
            // Build checklist of all sections (all H2 and H3 headings)
            const allSections = Array.from(doc.querySelectorAll('h2, h3')).map(h => ({
                title: h.textContent.trim(),
                isSidebar: h.tagName.toLowerCase() === 'h3'
            }));
            updateSidebarChecklist(allSections);
            
            const headerHtml = headerElements.map(el => el.outerHTML).join('\n');
            const mainHtml = mainColElements.map(el => el.outerHTML).join('\n');
            const sidebarHtml = sidebarColElements.map(el => el.outerHTML).join('\n');
            
            finalHtml = `
                <div class="resume-header">
                    ${headerHtml}
                </div>
                <div class="resume-columns ${styleConfig.sidebarPosition === 'left' ? 'sidebar-left' : ''}">
                    <div class="resume-main-col">
                        ${mainHtml}
                    </div>
                    <div class="resume-sidebar-col" style="background-color: ${styleConfig.sidebarBg || '#2d3748'}; color: ${styleConfig.sidebarText || '#ffffff'};">
                        ${sidebarHtml}
                    </div>
                </div>
            `;
        } else {
            // In 1-column mode, all H2 and H3 are rendered sequentially
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const allSections = Array.from(doc.querySelectorAll('h2, h3')).map(h => ({
                title: h.textContent.trim(),
                isSidebar: h.tagName.toLowerCase() === 'h3'
            }));
            updateSidebarChecklist(allSections);
        }

        resumeOutput.innerHTML = finalHtml;

        // Dynamic title configuration for PDF filename proposal on printing
        const titleParser = new DOMParser();
        const titleDoc = titleParser.parseFromString(finalHtml, 'text/html');
        const firstHeader = titleDoc.querySelector('h1');
        let nameKey = "resume";
        if (firstHeader) {
            const cleanNameText = firstHeader.textContent.replace(/\([^)]*\)/g, '');
            const slugify = (text) => {
                return text.toString().toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^a-z0-9]/g, '');
            };
            const nameParts = cleanNameText.split(/\s+/).map(slugify).filter(Boolean);
            if (nameParts.length >= 2) {
                nameKey = nameParts[0][0] + nameParts[nameParts.length - 1];
            } else if (nameParts.length === 1) {
                nameKey = nameParts[0];
            }
        }

        let positionKey = "";
        if (firstHeader) {
            let sibling = firstHeader.nextElementSibling;
            while (sibling && (sibling.classList.contains('resume-contact-bar') || sibling.tagName !== 'P')) {
                sibling = sibling.nextElementSibling;
            }
            if (sibling && sibling.tagName === 'P') {
                const slugifyPosition = (text) => {
                    return text.toString().toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/[^a-z0-9]+/g, '_')
                        .replace(/^_+|_+$/g, '');
                };
                positionKey = slugifyPosition(sibling.textContent);
            }
        }

        if (positionKey) {
            document.title = `${nameKey}_${positionKey}`;
        } else {
            document.title = nameKey;
        }

        // Perform ATS validation on the actual structured HTML content
        runAtsChecker(mdText, finalHtml);
    }

    // Dynamic ATS Checker Engine
    function runAtsChecker(md, html) {
        let score = 100;
        const checks = [];

        // Textual representation of compiled HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const plainText = doc.body.textContent || "";
        
        // Count words/chars
        const wordCount = plainText.trim().split(/\s+/).filter(w => w.length > 0).length;
        const charCount = plainText.length;
        charWordCount.textContent = `Words: ${wordCount} | Characters: ${charCount}`;

        // 1. Email Check
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
        if (emailRegex.test(plainText)) {
            checks.push({ status: 'pass', text: 'Valid email address present.' });
        } else {
            score -= 15;
            checks.push({ status: 'fail', text: 'No email address detected.' });
        }

        // 2. Phone Check
        const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{2,4}[-.\s]?\d{2,4}[-.\s]?\d{2,4}/;
        if (phoneRegex.test(plainText)) {
            checks.push({ status: 'pass', text: 'Phone number present.' });
        } else {
            score -= 15;
            checks.push({ status: 'fail', text: 'No phone number detected.' });
        }

        // 3. Tables Warning (ATS parsing blocker)
        if (md.includes('| --- |') || html.includes('<table')) {
            score -= 15;
            checks.push({ status: 'fail', text: 'Table detected: Avoid tables (ATS scanners read table cells out of order).' });
        } else {
            checks.push({ status: 'pass', text: 'Table-free structure (Compliant).' });
        }

        // 4. Image Check
        if (md.includes('![]') || md.includes('![') || html.includes('<img')) {
            score -= 10;
            checks.push({ status: 'fail', text: 'Image detected: Avoid graphics/images (ATS scanners ignore images and text inside them).' });
        } else {
            checks.push({ status: 'pass', text: 'No graphics/images (Compliant).' });
        }

        // 5. Headings Check
        const standardHeaders = ['experience', 'education', 'formation', 'skills', 'competenc', 'project', 'projet', 'summary', 'profile', 'profil', 'resume', 'résumé'];
        const headers = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => h.textContent.toLowerCase());
        let standardHeadingCount = 0;
        headers.forEach(h => {
            if (standardHeaders.some(sh => h.includes(sh))) {
                standardHeadingCount++;
            }
        });

        if (standardHeadingCount >= 2) {
            checks.push({ status: 'pass', text: 'Standard section headings identified.' });
        } else {
            score -= 15;
            checks.push({ status: 'fail', text: 'Use standard section headings (e.g., "Experience", "Education").' });
        }

        // 6. Candidates full name check (First Heading should be candidate name)
        const firstHeader = doc.querySelector('h1');
        if (firstHeader && firstHeader.textContent.trim().length > 2) {
            checks.push({ status: 'pass', text: 'Candidate full name identified in H1.' });
        } else {
            score -= 15;
            checks.push({ status: 'fail', text: 'Start your resume with your Name in H1.' });
        }

        // 7. Bullet points formatting check
        const lists = doc.querySelectorAll('li');
        if (lists.length >= 3) {
            checks.push({ status: 'pass', text: 'Standardized bullet point structure.' });
        } else {
            score -= 15;
            checks.push({ status: 'fail', text: 'Use bullet point lists (at least 3 items) for professional experience.' });
        }

        // Ensure score bounds
        score = Math.max(0, Math.min(100, score));

        // Render checklist UI with proper mapping of c.status to icon keys
        atsChecklistContainer.innerHTML = checks.map(c => {
            const iconKey = c.status === 'pass' ? 'check' : (c.status === 'fail' ? 'error' : 'info');
            const icon = ICONS[iconKey];
            return `<li class="${c.status}">${icon} <span>${c.text}</span></li>`;
        }).join('');

        // Update radial progress circle
        const circumference = 163.36;
        const offset = circumference - (score / 100) * circumference;
        scoreRingProgress.style.strokeDashoffset = offset;
        scoreValueText.textContent = `${score}%`;

        // Style score indicators based on score
        if (score >= 90) {
            scoreRingProgress.setAttribute('stroke', '#10b981'); // success green
            verdictTitle.textContent = "Perfect Formatting!";
            verdictDesc.textContent = "Ready to be parsed by recruiters and ATS scanners.";
        } else if (score >= 70) {
            scoreRingProgress.setAttribute('stroke', '#fbbf24'); // warning yellow
            verdictTitle.textContent = "Average Formatting";
            verdictDesc.textContent = "Fix critical warnings to optimize parsing.";
        } else {
            scoreRingProgress.setAttribute('stroke', '#ef4444'); // danger red
            verdictTitle.textContent = "Optimization Required";
            verdictDesc.textContent = "Your resume may not be parsed correctly by ATS.";
        }
    }

    // Zoom Handlers
    function updateZoomDisplay() {
        previewCanvas.style.setProperty('--zoom-factor', zoomFactor);
        zoomLevelText.textContent = `${Math.round(zoomFactor * 100)}%`;
    }

    zoomInBtn.addEventListener('click', () => {
        isUserZoomed = true;
        if (zoomFactor < 1.8) {
            zoomFactor += 0.1;
            updateZoomDisplay();
        }
    });

    zoomOutBtn.addEventListener('click', () => {
        isUserZoomed = true;
        if (zoomFactor > 0.4) {
            zoomFactor -= 0.1;
            updateZoomDisplay();
        }
    });

    zoomResetBtn.addEventListener('click', () => {
        isUserZoomed = false;
        autoFitZoom();
    });

    zoomLevelText.addEventListener('dblclick', () => {
        isUserZoomed = false;
        autoFitZoom();
    });

    // --- About Modal Listeners ---
    btnAbout.addEventListener('click', () => {
        aboutModal.classList.add('show');
    });

    btnCloseModal.addEventListener('click', () => {
        aboutModal.classList.remove('show');
    });

    // Close modal on clicking backdrop
    aboutModal.addEventListener('click', (e) => {
        if (e.target === aboutModal) {
            aboutModal.classList.remove('show');
        }
    });

    // Close modal on Escape key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && aboutModal.classList.contains('show')) {
            aboutModal.classList.remove('show');
        }
    });

    // --- Action Listeners ---
    markdownInput.addEventListener('input', (e) => {
        const mdText = e.target.value;
        compileMarkdown(mdText);
        saveToServer();
    });

    // Wire customizer sliders and pickers
    const uiElements = [
        fontSizeSlider, lineHeightSlider, headingScaleSlider, 
        marginXSlider, marginYSlider, sectionSpacingSlider,
        layoutModeSelect, sidebarPositionSelect,
        colorSidebarBg, colorSidebarText,
        colorBg, colorHeadings, colorBody, colorLinks, colorAccent
    ];

    uiElements.forEach(el => {
        el.addEventListener('input', updateConfigFromControls);
        el.addEventListener('change', updateConfigFromControls);
    });

    // Wire font tiles selection
    fontTiles.forEach(tile => {
        tile.addEventListener('click', () => {
            styleConfig.fontFamily = tile.getAttribute('data-font');
            applyStyles();
            
            // Recompile markdown since typography changes might affect auto zoom
            compileMarkdown(markdownInput.value);
            saveToServer();
        });
    });

    // Wire color presets
    presetClassicNb.addEventListener('click', () => {
        styleConfig.colorBg = '#ffffff';
        styleConfig.colorHeadings = '#111111';
        styleConfig.colorBody = '#222222';
        styleConfig.colorLinks = '#000000';
        styleConfig.colorAccent = '#444444';
        updateControlsFromConfig();
        compileMarkdown(markdownInput.value);
        saveToServer();
    });

    presetDarkMode.addEventListener('click', () => {
        styleConfig.colorBg = '#0f172a';
        styleConfig.colorHeadings = '#f8fafc';
        styleConfig.colorBody = '#cbd5e1';
        styleConfig.colorLinks = '#38bdf8';
        styleConfig.colorAccent = '#34d399';
        updateControlsFromConfig();
        compileMarkdown(markdownInput.value);
        saveToServer();
    });

    presetCleanBlue.addEventListener('click', () => {
        styleConfig.colorBg = '#ffffff';
        styleConfig.colorHeadings = '#0f172a';
        styleConfig.colorBody = '#334155';
        styleConfig.colorLinks = '#2563eb';
        styleConfig.colorAccent = '#0ea5e9';
        updateControlsFromConfig();
        compileMarkdown(markdownInput.value);
        saveToServer();
    });

    presetCustom.addEventListener('click', () => {
        styleConfig.colorBg = customColors.colorBg;
        styleConfig.colorHeadings = customColors.colorHeadings;
        styleConfig.colorBody = customColors.colorBody;
        styleConfig.colorLinks = customColors.colorLinks;
        styleConfig.colorAccent = customColors.colorAccent;
        styleConfig.sidebarBg = customColors.sidebarBg;
        styleConfig.sidebarText = customColors.sidebarText;
        updateControlsFromConfig();
        compileMarkdown(markdownInput.value);
        saveToServer();
    });

    // App Theme Toggle (Auto / Light / Dark)
    let appTheme = localStorage.getItem('app-theme') || 'system';

    const themeIcons = {
        system: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
        light: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
        dark: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`
    };

    const themeTexts = {
        system: "Theme: Auto",
        light: "Theme: Light",
        dark: "Theme: Dark"
    };

    function applyAppTheme(theme) {
        let activeTheme = theme;
        if (theme === 'system') {
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            activeTheme = isDark ? 'dark' : 'light';
        }
        
        document.documentElement.setAttribute('data-theme', activeTheme);
        themeBtnIcon.innerHTML = themeIcons[theme];
        themeBtnText.textContent = themeTexts[theme];
    }

    btnThemeToggle.addEventListener('click', () => {
        if (appTheme === 'system') {
            appTheme = 'light';
        } else if (appTheme === 'light') {
            appTheme = 'dark';
        } else {
            appTheme = 'system';
        }
        localStorage.setItem('app-theme', appTheme);
        applyAppTheme(appTheme);
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (appTheme === 'system') {
            applyAppTheme('system');
        }
    });

    applyAppTheme(appTheme);

    btnLoadSample.addEventListener('click', () => {
        if (confirm("Do you want to reload the default Julien Avarre sample? Your local changes will be replaced.")) {
            // Load from sample.md
            fetch('sample.md')
                .then(res => res.text())
                .then(sampleText => {
                    markdownInput.value = sampleText;
                    compileMarkdown(sampleText);
                    saveToServer();
                    showToast("Julien Avarre sample reloaded!");
                })
                .catch(err => console.error(err));
        }
    });
    
    btnClear.addEventListener('click', () => {
        if (confirm("Are you sure you want to clear the editor?")) {
            markdownInput.value = "";
            compileMarkdown("");
            saveToServer();
        }
    });

    btnPrint.addEventListener('click', () => {
        window.print();
    });

    // Handle Auto-Fit Zoom on window resize
    window.addEventListener('resize', autoFitZoom);

    // --- Export Node formats for n8n ---

    // 1. Copy Standalone HTML (CSS Embedded in Style tag)
    btnCopyStandalone.addEventListener('click', () => {
        const inlineVariables = `
        :root {
            --resume-font-family: ${styleConfig.fontFamily};
            --resume-font-size: ${styleConfig.fontSize}px;
            --resume-line-height: ${styleConfig.lineHeight};
            --resume-heading-scale: ${styleConfig.headingScale};
            --resume-margin-x: ${styleConfig.marginX}px;
            --resume-margin-y: ${styleConfig.marginY}px;
            --resume-section-spacing: ${styleConfig.sectionSpacing}px;
            --resume-color-bg: ${styleConfig.colorBg || '#ffffff'};
            --resume-color-headings: ${styleConfig.colorHeadings};
            --resume-color-body: ${styleConfig.colorBody};
            --resume-color-links: ${styleConfig.colorLinks};
            --resume-color-accent: ${styleConfig.colorAccent};
            --resume-sidebar-bg: ${styleConfig.sidebarBg || '#2d3748'};
            --resume-sidebar-text: ${styleConfig.sidebarText || '#ffffff'};
        }`;

        const compiledHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${document.title || 'Resume'}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Raleway:wght@300;400;500;600;700;800&family=Merriweather:ital,wght@0,300;0,400;0,700;1,300&family=JetBrains+Mono:wght@400;500;700&family=Lora:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet">
    <style>
        ${inlineVariables}
        ${templatesCssText}
        
        /* Layout overrides for clean full-screen rendering */
        body {
            background-color: var(--resume-color-bg, #ffffff);
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
        }
        .a4-sheet {
            box-shadow: none !important;
            border-radius: 0 !important;
            margin: 0 auto;
        }
        
        /* Contact Header styling */
        .resume-contact-bar {
            font-size: calc(var(--resume-font-size) * 0.85);
            color: var(--resume-color-links);
            background-color: rgba(0, 0, 0, 0.02);
            border: 1px solid rgba(0, 0, 0, 0.04);
            padding: 6px 12px;
            border-radius: 4px;
            margin-top: 8px;
            margin-bottom: 16px;
            text-align: center;
        }
    </style>
</head>
<body>
    <article class="a4-sheet" id="resume-output">
        ${resumeOutput.innerHTML}
    </article>
</body>
</html>`;

        navigator.clipboard.writeText(compiledHtml)
            .then(() => showToast("Standalone HTML copied to clipboard!"))
            .catch(err => console.error("Clipboard copy error:", err));
    });

    // 2. Copy Raw CSS Only
    btnCopyCss.addEventListener('click', () => {
        const inlineVariables = `/* Custom Config Variables */
:root {
    --resume-font-family: ${styleConfig.fontFamily};
    --resume-font-size: ${styleConfig.fontSize}px;
    --resume-line-height: ${styleConfig.lineHeight};
    --resume-heading-scale: ${styleConfig.headingScale};
    --resume-margin-x: ${styleConfig.marginX}px;
    --resume-margin-y: ${styleConfig.marginY}px;
    --resume-section-spacing: ${styleConfig.sectionSpacing}px;
    --resume-color-bg: ${styleConfig.colorBg || '#ffffff'};
    --resume-color-headings: ${styleConfig.colorHeadings};
    --resume-color-body: ${styleConfig.colorBody};
    --resume-color-links: ${styleConfig.colorLinks};
    --resume-color-accent: ${styleConfig.colorAccent};
    --resume-sidebar-bg: ${styleConfig.sidebarBg || '#2d3748'};
    --resume-sidebar-text: ${styleConfig.sidebarText || '#ffffff'};
}
`;
        const cssContent = inlineVariables + "\n" + templatesCssText;
        navigator.clipboard.writeText(cssContent)
            .then(() => showToast("CSS styles copied to clipboard!"))
            .catch(err => console.error("Clipboard copy error:", err));
    });

    // 3. Copy Raw Resume Inner HTML only
    btnCopyHtml.addEventListener('click', () => {
        const markup = resumeOutput.innerHTML;
        navigator.clipboard.writeText(markup)
            .then(() => showToast("Inner HTML markup copied to clipboard!"))
            .catch(err => console.error("Clipboard copy error:", err));
    });

    // 4. Download Source Markdown (.md)
    btnDownloadMd.addEventListener('click', () => {
        const mdContent = markdownInput.value;
        const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'resume.md';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast("Markdown download started!");
    });

    // 5. Sync Config to n8n Webhook
    if (n8nWebhookUrl) {
        n8nWebhookUrl.value = localStorage.getItem('n8n_webhook_url') || '';
    }

    if (btnSyncN8n && n8nWebhookUrl) {
        btnSyncN8n.addEventListener('click', () => {
            const url = n8nWebhookUrl.value.trim();
            if (!url) {
                showToast("Please enter an n8n webhook URL first!");
                return;
            }
            
            localStorage.setItem('n8n_webhook_url', url);
            
            const payload = {
                config: styleConfig,
                css: templatesCssText
            };
            
            btnSyncN8n.disabled = true;
            const originalText = btnSyncN8n.textContent;
            btnSyncN8n.textContent = "Syncing...";
            
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
            .then(res => {
                if (res.ok) {
                    showToast("Design configuration synced successfully!");
                } else {
                    throw new Error("HTTP " + res.status);
                }
            })
            .catch(err => {
                console.error("n8n sync failed:", err);
                showToast("Sync failed: " + err.message);
            })
            .finally(() => {
                btnSyncN8n.disabled = false;
                btnSyncN8n.textContent = originalText;
            });
        });
    }

    // --- Column Resizing Handles ---
    const handleLeft = document.getElementById('handle-left');
    const handleRight = document.getElementById('handle-right');
    const editorPanel = document.querySelector('.editor-panel');
    const controlsPanel = document.querySelector('.controls-panel');

    if (handleLeft && handleRight) {
        // Left handle (resizes editorPanel width)
        handleLeft.addEventListener('mousedown', (e) => {
            e.preventDefault();
            const startX = e.clientX;
            const startWidth = editorPanel.getBoundingClientRect().width;
            
            handleLeft.classList.add('dragging');
            
            function onMouseMove(moveEvent) {
                const deltaX = moveEvent.clientX - startX;
                const newWidth = Math.max(250, Math.min(600, startWidth + deltaX));
                editorPanel.style.width = `${newWidth}px`;
                autoFitZoom();
            }
            
            function onMouseUp() {
                handleLeft.classList.remove('dragging');
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            }
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        // Right handle (resizes controlsPanel width)
        handleRight.addEventListener('mousedown', (e) => {
            e.preventDefault();
            const startX = e.clientX;
            const startWidth = controlsPanel.getBoundingClientRect().width;
            
            handleRight.classList.add('dragging');
            
            function onMouseMove(moveEvent) {
                // Dragging to the left increases controls panel width
                const deltaX = startX - moveEvent.clientX;
                const newWidth = Math.max(280, Math.min(600, startWidth + deltaX));
                controlsPanel.style.width = `${newWidth}px`;
                autoFitZoom();
            }
            
            function onMouseUp() {
                handleRight.classList.remove('dragging');
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            }
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    }

    // --- API Startup Loader ---
    async function loadWorkspaceData() {
        try {
            const response = await fetch('/api/load');
            if (response.ok) {
                const data = await response.json();
                
                // 1. Populates Editor Text
                if (data.markdown) {
                    markdownInput.value = data.markdown;
                    compileMarkdown(data.markdown);
                } else {
                    // Fallback to local storage or load sample
                    const savedMd = localStorage.getItem('ats_resume_markdown');
                    if (savedMd) {
                        markdownInput.value = savedMd;
                        compileMarkdown(savedMd);
                    } else {
                        // Load default sample
                        fetch('sample.md')
                            .then(res => res.text())
                            .then(txt => {
                                markdownInput.value = txt;
                                compileMarkdown(txt);
                            });
                    }
                }
                
                // 2. Populates Style configuration
                if (data.config) {
                    styleConfig = { ...DEFAULT_STYLE_CONFIG, ...data.config };
                } else {
                    // Fallback to local storage or default
                    const savedStyles = localStorage.getItem('ats_resume_styles');
                    if (savedStyles) {
                        try {
                            styleConfig = { ...DEFAULT_STYLE_CONFIG, ...JSON.parse(savedStyles) };
                        } catch(e) {
                            styleConfig = { ...DEFAULT_STYLE_CONFIG };
                        }
                    } else {
                        styleConfig = { ...DEFAULT_STYLE_CONFIG };
                    }
                }
                
                // Initialize customColors from loaded config
                customColors.colorBg = styleConfig.colorBg || DEFAULT_STYLE_CONFIG.colorBg;
                customColors.colorHeadings = styleConfig.colorHeadings;
                customColors.colorBody = styleConfig.colorBody;
                customColors.colorLinks = styleConfig.colorLinks;
                customColors.colorAccent = styleConfig.colorAccent;
                customColors.sidebarBg = styleConfig.sidebarBg || DEFAULT_STYLE_CONFIG.sidebarBg;
                customColors.sidebarText = styleConfig.sidebarText || DEFAULT_STYLE_CONFIG.sidebarText;
                
                updateControlsFromConfig();
                
            } else {
                throw new Error("HTTP " + response.status);
            }
        } catch (e) {
            console.warn("API load failed, falling back to local storage:", e);
            // Local fallback
            const savedMd = localStorage.getItem('ats_resume_markdown');
            if (savedMd) {
                markdownInput.value = savedMd;
                compileMarkdown(savedMd);
            }
            const savedStyles = localStorage.getItem('ats_resume_styles');
            if (savedStyles) {
                try {
                    styleConfig = { ...DEFAULT_STYLE_CONFIG, ...JSON.parse(savedStyles) };
                } catch(e) {}
            }
            
            // Initialize customColors from fallback config
            customColors.colorBg = styleConfig.colorBg || DEFAULT_STYLE_CONFIG.colorBg;
            customColors.colorHeadings = styleConfig.colorHeadings;
            customColors.colorBody = styleConfig.colorBody;
            customColors.colorLinks = styleConfig.colorLinks;
            customColors.colorAccent = styleConfig.colorAccent;
            customColors.sidebarBg = styleConfig.sidebarBg || DEFAULT_STYLE_CONFIG.sidebarBg;
            customColors.sidebarText = styleConfig.sidebarText || DEFAULT_STYLE_CONFIG.sidebarText;
            
            updateControlsFromConfig();
        }
        
        // Compute default canvas fitting scale on startup
        setTimeout(autoFitZoom, 300);
    }

    // Launch loading
    await loadWorkspaceData();
});
