import Head from 'next/head';
import AppLayout from '@/components/AppLayout';
import AIChat from '@/components/AIChat';

export default function AITutorPage() {
  return (
    <AppLayout title="AI Tutor">
      <Head><title>QuaChi AI Tutor</title></Head>
      <AIChat fullPage />
    </AppLayout>
  );
}
