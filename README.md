# Digital Flipbook

An interactive, responsive digital flipbook that converts PDF presentations into an engaging flipbook experience with smooth page-turn animations.

## Features

✨ **Interactive Features**
- 📄 PDF Upload - Drag & drop or click to upload
- 📖 Dual-Page View - Book-style two-page spread
- ✨ Smooth Animations - Page-turn transitions
- ⌨️ Keyboard Navigation - Arrow keys & spacebar support
- 🎬 Thumbnail Strip - Quick page navigation
- 📊 Progress Bar - Visual reading progress
- 🔍 Direct Page Input - Jump to any page
- 🖥️ Fullscreen Mode - Immersive reading experience

📱 **Responsive Design**
- Mobile-optimized interface
- Tablet-friendly layout
- Desktop-optimized viewing
- Touch-friendly controls

🎨 **Beautiful UI**
- Modern gradient design
- Smooth animations
- Professional styling
- Dark mode support

## Quick Start

### Option 1: Use on GitHub Pages
1. Fork this repository
2. Enable GitHub Pages in repository settings
3. Access your flipbook at `https://YOUR-USERNAME.github.io/digital-flipbook/`

### Option 2: Run Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR-USERNAME/digital-flipbook.git
   cd digital-flipbook
   ```

2. Open `index.html` in your browser or use a local server:
   ```bash
   # Using Python 3
   python -m http.server 8000

   # Using Python 2
   python -m SimpleHTTPServer 8000

   # Using Node.js (install http-server first)
   npx http-server
   ```

3. Navigate to `http://localhost:8000` in your browser

## Usage

1. **Upload a PDF**: Click "Choose PDF" or drag & drop a PDF file
2. **Navigate Pages**:
   - Click **Previous/Next** buttons
   - Use **Arrow Keys** (← →)
   - Press **Spacebar** to advance
   - Type a page number in the input field
   - Click **Thumbnails** for quick navigation

3. **Fullscreen**: Click the fullscreen icon for immersive viewing

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `← Arrow Left` | Previous page |
| `→ Arrow Right` | Next page |
| `Space` | Next page |
| `Enter` (in page input) | Go to page |

## Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Dependencies

- **PDF.js** (3.11.174) - For PDF rendering
- Vanilla JavaScript (ES6+)
- Modern CSS3 (Flexbox, Grid, Animations)

## Project Structure

```
digital-flipbook/
├── index.html        # Main HTML file
├── styles.css        # Complete styling
├── script.js         # JavaScript functionality
├── .gitignore       # Git ignore rules
└── README.md        # This file
```

## Customization

### Change Colors
Edit the CSS variables in `styles.css`:
```css
:root {
    --primary-color: #2c3e50;
    --secondary-color: #3498db;
    --accent-color: #e74c3c;
    /* ... more variables ... */
}
```

### Adjust Scale
Modify the `scale` property in `script.js`:
```javascript
this.scale = 1.5; // Increase for higher quality
```

### Change Animations
Edit animation timing in `styles.css`:
```css
@keyframes slideInLeft {
    /* Customize animation here */
}
```

## Performance Tips

- For large PDFs (100+ pages), consider using a local server
- Pre-render pages asynchronously to avoid blocking
- Use modern browsers for best performance
- Enable hardware acceleration in browser settings

## Troubleshooting

**PDF won't load?**
- Ensure the PDF is valid and not corrupted
- Check browser console for error messages
- Try a different PDF file

**Pages not rendering?**
- Check that PDF.js worker script is loaded
- Verify internet connection (CDN files)
- Try clearing browser cache

**Fullscreen not working?**
- Not all browsers support fullscreen on file:// URLs
- Use a local server instead
- Some browsers may require user interaction first

## License

MIT License - Feel free to use and modify

## Contributing

Contributions welcome! Please feel free to submit pull requests.

## Support

For issues and feature requests, please open a GitHub issue.

---

**Made with ❤️ for PDF presentations