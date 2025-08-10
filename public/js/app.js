class FileConverter {
  constructor() {
    this.uploadedFile = null;
    this.ws = null;
    this.init();
  }

  /**
   * Initialize the application
   */
  init() {
    this.setupEventListeners();
    this.setupWebSocket();
    this.setupTheme();
    console.log('File Converter initialized');
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // File upload events
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
    uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
    uploadArea.addEventListener('drop', this.handleDrop.bind(this));
    fileInput.addEventListener('change', this.handleFileSelect.bind(this));

    // Conversion button
    document.getElementById('convertBtn').addEventListener('click', this.startConversion.bind(this));

    // Download and retry buttons
    document.getElementById('downloadBtn').addEventListener('click', this.downloadFile.bind(this));
    document.getElementById('newConversionBtn').addEventListener('click', this.resetApp.bind(this));
    document.getElementById('retryBtn').addEventListener('click', this.resetApp.bind(this));

    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', this.toggleTheme.bind(this));
  }

  /**
   * Setup WebSocket connection for progress updates
   */
  setupWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    try {
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
      };
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'progress') {
            this.updateProgress(data.data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        // Try to reconnect after 3 seconds
        setTimeout(() => this.setupWebSocket(), 3000);
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to setup WebSocket:', error);
    }
  }

  /**
   * Setup theme functionality
   */
  setupTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeToggle(savedTheme);
  }

  /**
   * Toggle theme between light and dark
   */
  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    this.updateThemeToggle(newTheme);
  }

  /**
   * Update theme toggle button
   */
  updateThemeToggle(theme) {
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  /**
   * Handle drag over event
   */
  handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('uploadArea').classList.add('dragover');
  }

  /**
   * Handle drag leave event
   */
  handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('uploadArea').classList.remove('dragover');
  }

  /**
   * Handle file drop
   */
  handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('uploadArea').classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      this.processFile(files[0]);
    }
  }

  /**
   * Handle file selection
   */
  handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
      this.processFile(files[0]);
    }
  }

  /**
   * Process uploaded file
   */
  async processFile(file) {
    try {
      // Validate file size
      if (file.size > 50 * 1024 * 1024) {
        this.showError('File size exceeds 50MB limit');
        return;
      }

      this.showLoading(true);

      // Upload file
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/file', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      this.uploadedFile = {
        ...result.fileInfo,
        buffer: file
      };

      this.showFileInfo(result.fileInfo);
      this.showConversionOptions(result.fileInfo);

    } catch (error) {
      console.error('Upload error:', error);
      this.showError(error.message);
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Show file information
   */
  showFileInfo(fileInfo) {
    document.getElementById('fileName').textContent = fileInfo.originalName;
    document.getElementById('fileType').textContent = fileInfo.mimeType;
    document.getElementById('fileSize').textContent = this.formatFileSize(fileInfo.size);
    
    this.showSection('fileInfoSection');
  }

  /**
   * Show conversion options
   */
  showConversionOptions(fileInfo) {
    const formatGroup = document.getElementById('formatGroup');
    
    if (fileInfo.isImage) {
      formatGroup.style.display = 'block';
      // Set default output format based on input
      const outputFormat = document.getElementById('outputFormat');
      if (fileInfo.mimeType.includes('png')) {
        outputFormat.value = 'png';
      } else if (fileInfo.mimeType.includes('webp')) {
        outputFormat.value = 'webp';
      } else {
        outputFormat.value = 'jpg';
      }
    } else {
      formatGroup.style.display = 'none';
    }
    
    this.showSection('conversionSection');
  }

  /**
   * Start conversion process
   */
  async startConversion() {
    if (!this.uploadedFile) {
      this.showError('No file uploaded');
      return;
    }

    try {
      const convertBtn = document.getElementById('convertBtn');
      convertBtn.disabled = true;
      convertBtn.querySelector('.btn-text').style.display = 'none';
      convertBtn.querySelector('.btn-loader').style.display = 'inline';

      this.showSection('progressSection');

      // Convert file to base64 for transmission
      const fileBase64 = await this.fileToBase64(this.uploadedFile.buffer);

      let endpoint, payload;

      if (this.uploadedFile.isImage) {
        endpoint = '/api/convert/image';
        payload = {
          fileData: fileBase64,
          outputFormat: document.getElementById('outputFormat').value,
          compressionLevel: document.getElementById('compressionLevel').value
        };
      } else if (this.uploadedFile.isPDF) {
        endpoint = '/api/convert/pdf';
        payload = {
          fileData: fileBase64,
          compressionLevel: document.getElementById('compressionLevel').value
        };
      } else {
        throw new Error('Unsupported file type');
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Conversion failed');
      }

      this.showResults(result);

    } catch (error) {
      console.error('Conversion error:', error);
      this.showError(error.message);
    } finally {
      const convertBtn = document.getElementById('convertBtn');
      convertBtn.disabled = false;
      convertBtn.querySelector('.btn-text').style.display = 'inline';
      convertBtn.querySelector('.btn-loader').style.display = 'none';
    }
  }

  /**
   * Convert file to base64
   */
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }

  /**
   * Update progress bar
   */
  updateProgress(data) {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const progressPercentage = document.getElementById('progressPercentage');

    progressFill.style.width = `${data.progress}%`;
    progressText.textContent = data.message;
    progressPercentage.textContent = `${Math.round(data.progress)}%`;

    if (data.error) {
      this.showError(data.error);
    }
  }

  /**
   * Show conversion results
   */
  showResults(result) {
    document.getElementById('originalSize').textContent = this.formatFileSize(result.originalSize);
    document.getElementById('newSize').textContent = this.formatFileSize(result.convertedSize || result.compressedSize);
    document.getElementById('compressionRatio').textContent = result.compressionRatio;

    // Store download URL for later use
    this.downloadUrl = result.downloadUrl;

    this.hideSection('progressSection');
    this.showSection('resultsSection');
  }

  /**
   * Download converted file
   */
  downloadFile() {
    if (this.downloadUrl) {
      const link = document.createElement('a');
      link.href = this.downloadUrl;
      link.download = '';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  /**
   * Reset application to initial state
   */
  resetApp() {
    this.uploadedFile = null;
    this.downloadUrl = null;
    
    // Reset file input
    document.getElementById('fileInput').value = '';
    
    // Hide all sections except upload
    this.hideSection('fileInfoSection');
    this.hideSection('conversionSection');
    this.hideSection('progressSection');
    this.hideSection('resultsSection');
    this.hideSection('errorSection');
    
    // Show upload section
    this.showSection('uploadSection');
  }

  /**
   * Show error message
   */
  showError(message) {
    document.getElementById('errorMessage').textContent = message;
    this.hideSection('progressSection');
    this.hideSection('resultsSection');
    this.showSection('errorSection');
  }

  /**
   * Show loading overlay
   */
  showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    overlay.style.display = show ? 'flex' : 'none';
  }

  /**
   * Show section
   */
  showSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
      section.style.display = 'block';
      section.classList.add('fade-in');
    }
  }

  /**
   * Hide section
   */
  hideSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
      section.style.display = 'none';
      section.classList.remove('fade-in');
    }
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new FileConverter();
});