# 🚀 Spacecraft Portfolio

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white" alt="Three.js">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=white" alt="GSAP">
</div>

<br>

<div align="center">
  <h3>An interactive 3D portfolio that takes you on a journey through space</h3>
  <p>Experience my projects in an immersive WebGL environment with smooth animations and stunning visuals</p>
</div>

<div align="center">
  <a href="https://pablomolina.space"><strong>🌐 View Live Demo</strong></a> •
  <a href="#-features"><strong>Features</strong></a> •
  <a href="#-quick-start"><strong>Quick Start</strong></a> •
  <a href="#-tech-stack"><strong>Tech Stack</strong></a>
</div>

<br>

![Spacecraft Demo](https://github.com/pablomoli/spacecraft/assets/placeholder/demo.gif)

## ✨ Features

### 🎮 Interactive 3D Experience
- Navigate through a beautifully crafted space environment
- Click on floating objects to explore different projects
- Smooth camera transitions between scenes
- Particle effects and dynamic lighting

### 📱 Responsive & Performant
- **60+ FPS** on modern devices through optimized rendering
- **Mobile-first** design with touch controls
- **Progressive loading** for faster initial render
- **Fallback support** for devices without WebGL

### 🎨 Modern Design
- Clean, minimalist UI that doesn't distract from content
- Smooth GSAP animations for all transitions
- Custom shaders for unique visual effects
- Dark theme optimized for space aesthetics

### ⚡ Technical Excellence
- **TypeScript** for type safety and better DX
- **Static generation** for optimal SEO
- **Code splitting** for faster page loads
- **Accessibility** features including keyboard navigation

## 🛠️ Tech Stack

<table>
  <tr>
    <td align="center" width="96">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" width="48" height="48" alt="Next.js" />
      <br>Next.js 14
    </td>
    <td align="center" width="96">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="48" height="48" alt="React" />
      <br>React 18
    </td>
    <td align="center" width="96">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/threejs/threejs-original.svg" width="48" height="48" alt="Three.js" />
      <br>Three.js
    </td>
    <td align="center" width="96">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" width="48" height="48" alt="TypeScript" />
      <br>TypeScript
    </td>
  </tr>
</table>

### Core Dependencies
- **React Three Fiber** - React renderer for Three.js
- **Drei** - Useful helpers for React Three Fiber
- **GSAP** - Professional-grade animation library
- **Vercel** - Deployment and hosting

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/pablomoli/spacecraft.git
cd spacecraft

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Build for Production

```bash
# Create optimized build
npm run build

# Test production build locally
npm run start
```

## 📁 Project Structure

```
spacecraft/
├── public/
│   ├── models/         # 3D models (.glb, .gltf)
│   ├── textures/       # Texture files
│   └── fonts/          # Custom fonts
├── src/
│   ├── components/
│   │   ├── Scene/      # Three.js scene components
│   │   ├── UI/         # Interface components
│   │   └── Effects/    # Post-processing effects
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Helper functions
│   ├── shaders/        # GLSL shader files
│   └── pages/          # Next.js pages
├── styles/             # Global styles
└── next.config.mjs     # Next.js configuration
```

## 🎨 Customization Guide

### Adding New 3D Models
1. Place your `.glb` or `.gltf` files in `/public/models/`
2. Import using `useGLTF` from `@react-three/drei`
3. Add to scene in `/src/components/Scene/`

### Modifying Animations
- Edit GSAP timelines in `/src/utils/animations.js`
- Adjust spring configs in components for physics-based animations
- Modify camera paths in `/src/components/Scene/CameraController.js`

### Changing Color Scheme
- Update CSS variables in `/src/styles/globals.css`
- Modify Three.js materials in scene components
- Adjust post-processing effects in `/src/components/Effects/`

## 📊 Performance

<table>
  <tr>
    <th>Metric</th>
    <th>Score</th>
    <th>Details</th>
  </tr>
  <tr>
    <td>Lighthouse Performance</td>
    <td>95+</td>
    <td>Desktop score</td>
  </tr>
  <tr>
    <td>First Contentful Paint</td>
    <td>&lt;1s</td>
    <td>Fast initial render</td>
  </tr>
  <tr>
    <td>Time to Interactive</td>
    <td>&lt;2s</td>
    <td>Quick to respond</td>
  </tr>
  <tr>
    <td>Bundle Size</td>
    <td>~500KB</td>
    <td>Gzipped</td>
  </tr>
</table>

## 🚢 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/pablomoli/spacecraft)

### Manual Deployment

```bash
# Build static files
npm run build

# Files will be in the 'out' directory
# Deploy to any static hosting service
```

### Environment Variables
Create a `.env.local` file:

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- 3D models from [source]
- Inspiration from [Bruno Simon's Portfolio](https://bruno-simon.com/)
- Three.js community for amazing examples
- Special thanks to all contributors

## 📧 Contact

Pablo Molina - [pablomolinarojas@gmail.com](mailto:pablomolinarojas@gmail.com)

Portfolio - [pablomolina.space](https://pablomolina.space)

LinkedIn - [pablo-molina-ro](https://linkedin.com/in/pablo-molina-ro)

---

<div align="center">
  <b>If you like this project, please give it a ⭐!</b>
  <br>
  <sub>Built with ❤️ using Next.js and Three.js</sub>
</div>
## Wormhole Animation – Sweet Spot Config (Sept 2025)

This project uses a shader‑driven wormhole background with a single progress uniform that blends between static space and a warp effect. After extensive tuning, the following settings produce the desired “slow taste → streaky warp → clean exit” experience:

- Timeline
  - Charge up: `2.0s` (`WORMHOLE_ANIMATION_CONFIG.chargeUp.duration`)
  - Hold: `0.8s` (`WORMHOLE_ANIMATION_CONFIG.hold.duration`)
  - Return: `0.45s` (`WORMHOLE_ANIMATION_CONFIG.return.duration`)

- Shader motion ramps (entry feel)
  - Compute `p = smoothstep(0, 1, uWarpProgress)`.
  - Delay global motion until ~65% of progress:
    - `ps = clamp((p - 0.65) / 0.35, 0..1)` and `speedBlend = pow(ps, 3.0)`
  - Delay star streaking until ~85% of progress:
    - `pss = clamp((p - 0.85) / 0.15, 0..1)` and `starSpeedBlend = pow(pss, 3.4)`
  - Effective speeds: `speedEff = mix(baseSpeed, warpSpeed, speedBlend)` and `starSpeedEff = mix(baseStarSpeed, warpStarSpeed, starSpeedBlend)`

- Shader visual blends (continuous)
  - Density, glow, hue shift, saturation, rotation speed, center repulsion, twinkle intensity blend with `p`.
  - Only motion uses delayed ramps so visuals change before motion.

- Exit settle (phase 3)
  - A small “shockwave + zoom settle” runs only during return using `uExitProgress` (0→1):
    - UV settle zoom + subtle radial ripple
    - Small glow pulse and slight desaturation

Rationale: keep CPU updates minimal (single progress), move the look into the shader, and shape motion vs. visuals independently. This removes prop/imperative races and makes the animation robust and performant.
