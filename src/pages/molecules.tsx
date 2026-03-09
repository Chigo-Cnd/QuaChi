import Head from 'next/head';
import AppLayout from '@/components/AppLayout';
import MoleculeViewer from '@/components/MoleculeViewer';

export default function MoleculesPage() {
  return (
    <AppLayout title="3D Molecules">
      <Head><title>Molecule Viewer — QuaChi</title></Head>
      <MoleculeViewer />
    </AppLayout>
  );
}
