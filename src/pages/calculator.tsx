import { useState } from 'react';
import Head from 'next/head';
import AppLayout from '@/components/AppLayout';
import CalculatorWorkspace from '@/components/CalculatorWorkspace';

export default function CalculatorPage() {
  return (
    <AppLayout title="Calculators">
      <Head><title>Calculators — QuaChi</title></Head>
      <CalculatorWorkspace />
    </AppLayout>
  );
}
