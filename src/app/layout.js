import { Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-grotesk',
})

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
})

// The record's face (SIL OFL), used only for experiment-page prose;
// preload off so the journey never pays for it.
const cmuSerif = localFont({
  src: [
    { path: '../fonts/cmu-serif-500-roman.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/cmu-serif-500-italic.woff2', weight: '500', style: 'italic' },
    { path: '../fonts/cmu-serif-700-roman.woff2', weight: '700', style: 'normal' },
    { path: '../fonts/cmu-serif-700-italic.woff2', weight: '700', style: 'italic' },
  ],
  variable: '--font-cmu',
  preload: false,
})

export const metadata = {
  title: 'Pablo Molina',
  description:
    'Software engineer. Interactive 3D portfolio and a measured experiment record: embeddings, retrieval evals, interpretability.',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${jetBrainsMono.variable} ${cmuSerif.variable} ${spaceGrotesk.className}`}>
        {children}
      </body>
    </html>
  )
}
