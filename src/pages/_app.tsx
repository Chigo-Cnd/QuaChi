import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Restore saved theme on load
    const saved = localStorage.getItem('quachi-theme') as 'light' | 'dark' | 'grey' | null;
    const theme = saved ?? 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  return (
    <>
      <Head>
        <title>QuaChi — Quantitative Chemistry Laboratory</title>
        <meta name="description" content="Interactive chemistry simulation platform with AI tutoring, molecular visualization, and quantitative analysis tools. By QuaModels." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#0B1220" />
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        {/* Open Graph */}
        <meta property="og:title" content="QuaChi — Quantitative Chemistry Laboratory" />
        <meta property="og:description" content="PhET-style interactive chemistry lab with AI tutoring by QuaModels." />
        <meta property="og:type" content="website" />
      </Head>
      <Component {...pageProps} />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--surface)',
            color:      'var(--text-primary)',
            border:     '1px solid var(--border)',
          },
        }}
      />
    </>
  );
}
