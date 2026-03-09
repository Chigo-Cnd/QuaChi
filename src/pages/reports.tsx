import Head from 'next/head';
import AppLayout from '@/components/AppLayout';
import ReportEditor from '@/components/ReportEditor';

export default function ReportsPage() {
  return (
    <AppLayout title="Lab Reports">
      <Head><title>Lab Reports — QuaChi</title></Head>
      <ReportEditor />
    </AppLayout>
  );
}
