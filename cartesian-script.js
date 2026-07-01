// PDF.js Setup
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

class CartesianViewer {
    constructor() {
        this.pdfDoc = null;
        this.currentPage = 1;
        this.totalPages = 0;
        this.scale = 1.5;
        this.pages = new Map();
        this.currentView = 'grid'; // 'grid' or 'fullscreen'
        
        this.initializeElements();
        this.attachEventListeners();
        this.loadPDF();
    }

    initializeElements() {
        // View elements
        this.gridView = document.getElementById('gridView');
        this.fullscreenView = document.getElementById('fullscreenView');
        this.viewerMain = document.getElementById('viewerMain');
        
        // Containers
        this.loadingContainer = document.getElementById('loadingContainer');
        this.errorContainer = document.getElementById('errorContainer');
        this.gridContainer = document.getElementById('gridContainer');
        
        // Grid controls
        this.gridViewBtn = document.getElementById('gridViewBtn');
        this.fullscreenViewBtn = document.getElementById('fullscreenViewBtn');
        
        // Fullscreen controls
        this.pageCanvas = document.getElementById('pageCanvas');
        this.pageInputFS = document.getElementById('pageInputFS');
        this.totalPagesFS = document.getElementById('totalPagesFS');
        this.prevPageBtn = document.getElementById('prevPageBtn');
        this.nextPageBtn = document.getElementById('nextPageBtn');
        this.progressFillFS = document.getElementById('progressFillFS');
        
        // Error
        this.errorMessage = document.getElementById('errorMessage');
    }

    attachEventListeners() {
        this.gridViewBtn.addEventListener('click', () => this.switchView('grid'));
        this.fullscreenViewBtn.addEventListener('click', () => this.switchView('fullscreen'));
        
        this.prevPageBtn.addEventListener('click', () => this.previousPage());
        this.nextPageBtn.addEventListener('click', () => this.nextPage());
        
        this.pageInputFS.addEventListener('change', () => this.goToPage(parseInt(this.pageInputFS.value)));
        this.pageInputFS.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.goToPage(parseInt(this.pageInputFS.value));
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.currentView === 'fullscreen') {
                if (e.key === 'ArrowLeft') this.previousPage();
                if (e.key === 'ArrowRight') this.nextPage();
            }
        });
    }

    async loadPDF() {
        try {
            const pdfPath = './CARTESIAN WORLDVIEW_GAMBAN & RAFA (2026)_compressed_compressed.pdf';
            const response = await fetch(pdfPath);
            
            if (!response.ok) {
                throw new Error('Failed to load PDF file');
            }
            
            const arrayBuffer = await response.arrayBuffer();
            this.pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            this.totalPages = this.pdfDoc.numPages;
            this.totalPagesFS.textContent = this.totalPages;
            this.pageInputFS.max = this.totalPages;
            
            // Render all pages
            for (let i = 1; i <= this.totalPages; i++) {
                await this.renderPage(i);
            }
            
            this.showViewer();
            this.createGridView();
        } catch (error) {
            this.showError(error.message);
        }
    }

    async renderPage(pageNum) {
        if (this.pages.has(pageNum)) return;

        try {
            const page = await this.pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale: this.scale });

            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            const context = canvas.getContext('2d');
            const renderContext = {
                canvases: context,
                viewport: viewport
            };

            await page.render(renderContext).promise;
            this.pages.set(pageNum, canvas);
        } catch (error) {
            console.error(`Error rendering page ${pageNum}:`, error);
        }
    }

    createGridView() {
        this.gridContainer.innerHTML = '';
        for (let i = 1; i <= this.totalPages; i++) {
            const pageElement = document.createElement('div');
            pageElement.className = 'page-thumbnail';
            pageElement.addEventListener('click', () => {
                this.currentPage = i;
                this.switchView('fullscreen');
                this.displayFullscreenPage();
            });

            const canvas = this.pages.get(i);
            if (canvas) {
                const thumbCanvas = document.createElement('canvas');
                thumbCanvas.width = 160;
                thumbCanvas.height = 220;
                const ctx = thumbCanvas.getContext('2d');
                ctx.drawImage(canvas, 0, 0, 160, 220);
                pageElement.appendChild(thumbCanvas);
            }

            const pageNum = document.createElement('div');
            pageNum.className = 'page-number-overlay';
            pageNum.textContent = `Page ${i}`;
            pageElement.appendChild(pageNum);

            this.gridContainer.appendChild(pageElement);
        }
    }

    displayFullscreenPage() {
        const canvas = this.pages.get(this.currentPage);
        if (!canvas) return;

        const ctx = this.pageCanvas.getContext('2d');
        this.pageCanvas.width = canvas.width;
        this.pageCanvas.height = canvas.height;
        ctx.drawImage(canvas, 0, 0);

        this.pageInputFS.value = this.currentPage;
        this.prevPageBtn.disabled = this.currentPage <= 1;
        this.nextPageBtn.disabled = this.currentPage >= this.totalPages;
        
        const progress = (this.currentPage / this.totalPages) * 100;
        this.progressFillFS.style.width = progress + '%';
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.displayFullscreenPage();
        }
    }

    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.displayFullscreenPage();
        }
    }

    goToPage(pageNum) {
        pageNum = Math.max(1, Math.min(pageNum, this.totalPages));
        this.currentPage = pageNum;
        this.displayFullscreenPage();
    }

    switchView(view) {
        this.currentView = view;
        
        if (view === 'grid') {
            this.gridView.style.display = 'block';
            this.fullscreenView.style.display = 'none';
            this.gridViewBtn.classList.add('active');
            this.fullscreenViewBtn.classList.remove('active');
        } else {
            this.gridView.style.display = 'none';
            this.fullscreenView.style.display = 'flex';
            this.gridViewBtn.classList.remove('active');
            this.fullscreenViewBtn.classList.add('active');
            this.displayFullscreenPage();
        }
    }

    showViewer() {
        this.loadingContainer.style.display = 'none';
        this.viewerMain.style.display = 'flex';
    }

    showError(message) {
        this.loadingContainer.style.display = 'none';
        this.errorContainer.style.display = 'flex';
        this.errorMessage.textContent = message || 'An error occurred while loading the PDF.';
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new CartesianViewer();
});