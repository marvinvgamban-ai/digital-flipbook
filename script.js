// PDF.js Setup
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// Flipbook Class
class DigitalFlipbook {
    constructor() {
        this.pdfDoc = null;
        this.currentPage = 1;
        this.totalPages = 0;
        this.scale = 1.5;
        this.pages = new Map();
        this.isLoading = false;

        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.uploadBtn = document.getElementById('uploadBtn');
        this.pdfInput = document.getElementById('pdfInput');
        this.uploadSection = document.getElementById('uploadSection');
        this.flipbookWrapper = document.getElementById('flipbookWrapper');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.errorMessage = document.getElementById('errorMessage');
        this.errorText = document.getElementById('errorText');
        this.closeError = document.getElementById('closeError');

        this.leftCanvas = document.getElementById('leftCanvas');
        this.rightCanvas = document.getElementById('rightCanvas');
        this.leftPageNum = document.getElementById('leftPageNum');
        this.rightPageNum = document.getElementById('rightPageNum');

        this.pageInput = document.getElementById('pageInput');
        this.totalPagesSpan = document.getElementById('totalPages');
        this.progressFill = document.getElementById('progressFill');

        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');

        this.thumbnailStrip = document.getElementById('thumbnailStrip');
        this.flipbookContainer = document.querySelector('.flipbook-container');
    }

    attachEventListeners() {
        this.uploadBtn.addEventListener('click', () => this.pdfInput.click());
        this.pdfInput.addEventListener('change', (e) => this.handleFileUpload(e));

        this.prevBtn.addEventListener('click', () => this.previousPage());
        this.nextBtn.addEventListener('click', () => this.nextPage());
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());

        this.pageInput.addEventListener('change', () => this.goToPage(parseInt(this.pageInput.value)));
        this.pageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.goToPage(parseInt(this.pageInput.value));
            }
        });

        this.closeError.addEventListener('click', () => this.hideError());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));

        // Drag and drop
        document.addEventListener('dragover', (e) => e.preventDefault());
        document.addEventListener('drop', (e) => {
            e.preventDefault();
            if (e.dataTransfer.files.length > 0) {
                this.pdfInput.files = e.dataTransfer.files;
                this.handleFileUpload({ target: { files: e.dataTransfer.files } });
            }
        });
    }

    async handleFileUpload(event) {
        const files = event.target.files;
        if (files.length === 0) return;

        const file = files[0];
        if (file.type !== 'application/pdf') {
            this.showError('Please upload a valid PDF file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                await this.loadPDF(e.target.result);
            } catch (error) {
                this.showError(`Error loading PDF: ${error.message}`);
            }
        };
        reader.readAsArrayBuffer(file);
    }

    async loadPDF(arrayBuffer) {
        this.showLoading(true);
        try {
            this.pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            this.totalPages = this.pdfDoc.numPages;

            this.totalPagesSpan.textContent = this.totalPages;
            this.pageInput.max = this.totalPages;

            this.uploadSection.style.display = 'none';
            this.flipbookWrapper.style.display = 'flex';

            // Pre-render all pages
            for (let i = 1; i <= this.totalPages; i++) {
                await this.renderPage(i);
            }

            this.currentPage = 1;
            this.displayPages();
            this.createThumbnails();
            this.showLoading(false);
        } catch (error) {
            this.showLoading(false);
            throw error;
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

    displayPages() {
        this.updatePageInput();
        this.updateProgress();

        // Display left page
        const leftPageNum = this.currentPage;
        this.displayPage(leftPageNum, this.leftCanvas, this.leftPageNum);

        // Display right page
        const rightPageNum = this.currentPage + 1;
        if (rightPageNum <= this.totalPages) {
            this.displayPage(rightPageNum, this.rightCanvas, this.rightPageNum);
        } else {
            this.clearCanvas(this.rightCanvas);
            this.rightPageNum.textContent = '';
        }

        // Update button states
        this.prevBtn.disabled = this.currentPage <= 1;
        this.nextBtn.disabled = this.currentPage + 1 >= this.totalPages;

        // Scroll thumbnail into view
        this.scrollThumbnailIntoView(leftPageNum);
    }

    displayPage(pageNum, canvas, pageNumElement) {
        if (pageNum > this.totalPages) {
            this.clearCanvas(canvas);
            pageNumElement.textContent = '';
            return;
        }

        const sourceCanvas = this.pages.get(pageNum);
        if (!sourceCanvas) return;

        const context = canvas.getContext('2d');
        canvas.width = sourceCanvas.width;
        canvas.height = sourceCanvas.height;

        context.drawImage(sourceCanvas, 0, 0);
        pageNumElement.textContent = pageNum;
    }

    clearCanvas(canvas) {
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage -= 2;
            if (this.currentPage < 1) this.currentPage = 1;
            this.displayPages();
        }
    }

    nextPage() {
        if (this.currentPage + 1 < this.totalPages) {
            this.currentPage += 2;
            if (this.currentPage > this.totalPages) {
                this.currentPage = this.totalPages - 1;
            }
            this.displayPages();
        }
    }

    goToPage(pageNum) {
        pageNum = Math.max(1, Math.min(pageNum, this.totalPages));
        if (pageNum % 2 === 0) pageNum--;
        this.currentPage = pageNum;
        this.displayPages();
    }

    updatePageInput() {
        this.pageInput.value = this.currentPage;
    }

    updateProgress() {
        const progress = (this.currentPage / this.totalPages) * 100;
        this.progressFill.style.width = progress + '%';
    }

    async createThumbnails() {
        this.thumbnailStrip.innerHTML = '';
        for (let i = 1; i <= this.totalPages; i++) {
            const thumbContainer = document.createElement('div');
            thumbContainer.className = 'thumbnail';
            if (i === this.currentPage) thumbContainer.classList.add('active');

            const thumbCanvas = document.createElement('canvas');
            const sourceCanvas = this.pages.get(i);
            if (sourceCanvas) {
                thumbCanvas.width = 80;
                thumbCanvas.height = 100;
                const context = thumbCanvas.getContext('2d');
                context.drawImage(sourceCanvas, 0, 0, 80, 100);
            }

            thumbContainer.appendChild(thumbCanvas);
            thumbContainer.addEventListener('click', () => {
                let targetPage = i;
                if (targetPage % 2 === 0) targetPage--;
                this.goToPage(targetPage);
            });

            this.thumbnailStrip.appendChild(thumbContainer);
        }
    }

    scrollThumbnailIntoView(pageNum) {
        const thumbnails = document.querySelectorAll('.thumbnail');
        thumbnails.forEach((thumb, index) => {
            thumb.classList.remove('active');
            if (index + 1 === pageNum || index + 1 === pageNum + 1) {
                thumb.classList.add('active');
            }
        });

        const activeThumbnail = document.querySelector('.thumbnail.active');
        if (activeThumbnail) {
            activeThumbnail.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }

    handleKeyPress(event) {
        if (!this.pdfDoc) return;

        switch (event.key) {
            case 'ArrowLeft':
                this.previousPage();
                break;
            case 'ArrowRight':
                this.nextPage();
                break;
            case ' ':
                event.preventDefault();
                this.nextPage();
                break;
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.flipbookContainer.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    showError(message) {
        this.errorText.textContent = message;
        this.errorMessage.style.display = 'flex';
    }

    hideError() {
        this.errorMessage.style.display = 'none';
    }

    showLoading(show) {
        this.loadingSpinner.style.display = show ? 'flex' : 'none';
    }
}

// Initialize flipbook when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new DigitalFlipbook();
});