# Spacecraft Portfolio

A modern, interactive portfolio website built with Next.js and Three.js, featuring immersive 3D experiences and smooth animations.

## 🚀 Features

- **Interactive 3D Graphics** - Built with React Three Fiber and Three.js
- **Smooth Animations** - GSAP-powered transitions and effects
- **Responsive Design** - Optimized for all devices and screen sizes
- **Modern Stack** - Next.js 14 with React 18
- **Performance Optimized** - Static generation and optimized builds
- **SEO Ready** - Built-in Next.js SEO capabilities

## 🛠️ Tech Stack

- **Framework:** Next.js 14
- **Frontend:** React 18
- **3D Graphics:** Three.js, React Three Fiber, Drei
- **Animations:** GSAP
- **Styling:** CSS/Styled Components
- **Language:** TypeScript
- **Deployment:** Static Export Ready

## 🏃‍♂️ Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/pablomoli/spacecraft
cd spacecraft
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run export` - Export static files for deployment

## 🚢 Deployment

This project is configured for static export, making it deployable to:

- **Vercel** (recommended for Next.js)
- **Netlify**
- **GitHub Pages**
- **AWS S3**
- Any static hosting service

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically on every push

### Static Export

```bash
npm run export
```

The `out` folder will contain the static files ready for deployment.

## 🎨 Customization

- **3D Models**: Add your models to `/public/models/`
- **Textures**: Store textures in `/public/textures/`
- **Content**: Update portfolio content in `/src/components/`
- **Styling**: Modify styles in component files
- **Animations**: Customize GSAP animations in `/src/animations/`

## 📁 Project Structure

```
spacecraft/
├── public/          # Static assets
├── src/
│   ├── components/  # React components
│   ├── pages/       # Next.js pages
│   ├── styles/      # Stylesheets
│   └── utils/       # Utility functions
├── package.json
└── next.config.mjs
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🐛 Issues

If you encounter any issues or have suggestions, please [open an issue](https://github.com/yourusername/spacecraft/issues).

---

**Built with ❤️ using Next.js and Three.js**

