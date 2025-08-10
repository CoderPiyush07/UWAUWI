# UWAUWI - Image & PDF Converter

A modern, responsive web application for converting and compressing image and PDF files with real-time progress tracking.

## Features

### 🖼️ Image Conversion
- **Supported Input Formats**: JPG, JPEG, PNG, WebP, BMP, GIF, TIFF, HEIC
- **Supported Output Formats**: JPG, JPEG, PNG, WebP, BMP, GIF, TIFF
- **Compression Levels**: Low (Best Quality), Medium (Balanced), High (Smallest Size)
- **Fast Processing**: Uses Sharp library for efficient image processing

### 📄 PDF Compression
- **Supported Format**: PDF files
- **Compression Levels**: Low, Medium, High
- **Smart Optimization**: Uses pdf-lib for efficient compression
- **Structure Optimization**: Removes redundant objects and optimizes file structure

### 🚀 Core Features
- **Drag & Drop Upload**: Intuitive file upload interface
- **Real-time Progress**: Live progress bar with WebSocket updates
- **Dark Mode**: Toggle between light and dark themes
- **Mobile Responsive**: Works perfectly on all device sizes
- **In-Memory Processing**: Fast processing without disk I/O
- **Security**: 50MB file size limit, input validation, rate limiting
- **Download Management**: Automatic cleanup of temporary files

## Technology Stack

### Backend
- **Node.js** + **Express**: Web server framework
- **Sharp**: High-performance image processing
- **pdf-lib**: PDF manipulation and compression
- **Multer**: File upload handling
- **WebSocket**: Real-time progress updates
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing

### Frontend
- **Vanilla JavaScript**: No framework dependencies
- **CSS Grid/Flexbox**: Modern responsive layout
- **CSS Variables**: Dynamic theming support
- **Progressive Enhancement**: Works without JavaScript for basic functionality

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/CoderPiyush07/UWAUWI.git
   cd UWAUWI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Open your browser**
   ```
   http://localhost:3000
   ```

## Development

### Project Structure
```
UWAUWI/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── routes/
│   ├── upload.js         # File upload routes
│   └── convert.js        # Conversion routes
├── controllers/
│   ├── imageController.js # Image processing logic
│   └── pdfController.js  # PDF processing logic
├── utils/
│   ├── imageConverter.js # Image conversion utilities
│   └── pdfConverter.js   # PDF conversion utilities
└── public/
    ├── index.html        # Main HTML file
    ├── css/
    │   └── style.css     # Styles with theme support
    └── js/
        └── app.js        # Frontend JavaScript
```

### Available Scripts
- `npm start`: Start the production server
- `npm run dev`: Start development server with nodemon (requires nodemon)

### Environment Variables
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)

## API Endpoints

### Upload
- `POST /api/upload/file`: Upload a file for conversion
- `GET /api/upload/formats`: Get supported formats information

### Conversion
- `POST /api/convert/image`: Convert image files
- `POST /api/convert/pdf`: Compress PDF files
- `GET /api/convert/download/:filename`: Download converted files

## Security Features

- **File Size Limit**: 50MB maximum upload size
- **MIME Type Validation**: Only allowed file types accepted
- **Rate Limiting**: Prevents abuse with request limits
- **Helmet Security**: Security headers for protection
- **Input Sanitization**: Validates all user inputs
- **Temporary File Cleanup**: Automatic cleanup after 10 minutes

## Browser Support

- **Modern Browsers**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **Mobile Support**: iOS Safari 12+, Chrome Mobile 60+
- **Progressive Enhancement**: Basic functionality works without JavaScript

## Performance

- **In-Memory Processing**: No disk I/O for faster processing
- **Efficient Libraries**: Sharp and pdf-lib for optimal performance
- **WebSocket Updates**: Real-time progress without polling
- **Responsive Images**: Optimized for all screen sizes
- **Minimal Dependencies**: Lightweight and fast

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Acknowledgments

- **Sharp**: Fast image processing library
- **pdf-lib**: PDF manipulation library
- **Express**: Web application framework