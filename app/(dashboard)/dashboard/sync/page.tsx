'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Download, Upload, Loader2 } from 'lucide-react';

type DataType = {
  id: string;
  name: string;
  description: string;
};

const importTypes: DataType[] = [
  { id: 'clients', name: 'Clients', description: 'Import client information' },
  { id: 'articles', name: 'Articles', description: 'Import article catalog' },
  { id: 'collaborateurs', name: 'Collaborateurs', description: 'Import collaborator data' },
  { id: 'zones', name: 'Zones', description: 'Import geographical zones' },
  { id: 'sous-zones', name: 'Sous-Zones', description: 'Import sub-zones' },
];

const exportTypes: DataType[] = [
  { id: 'tasks', name: 'Tâches', description: 'Export task records' },
  { id: 'requests', name: 'Requêtes', description: 'Export request data' },
  { id: 'orders', name: 'Commandes', description: 'Export order history' },
  { id: 'projects', name: 'Projets', description: 'Export project data' },
  { id: 'info-libre', name: 'Liste Information libre', description: 'Export free information list' },
  { id: 'contacts', name: 'Liste Contacts client', description: 'Export client contacts' },
  { id: 'equipment', name: 'Liste Equipements', description: 'Export equipment list' },
];

export default function SyncPage() {
  const [selectedImport, setSelectedImport] = useState<string>('');
  const [selectedExport, setSelectedExport] = useState<string>('');
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!selectedImport) {
      toast.error('Please select a data type to import');
      return;
    }

    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', selectedImport);

      const response = await fetch('/api/sync/import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Import failed');
      toast.success('Data imported successfully');
    } catch (error) {
      toast.error('Failed to import data');
    } finally {
      setIsImporting(false);
    }
  };

  const handleExport = async () => {
    if (!selectedExport) {
      toast.error('Please select a data type to export');
      return;
    }

    setIsExporting(true);
    try {
      const response = await fetch('/api/sync/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: selectedExport }),
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export-${selectedExport}-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Data Synchronization</h1>

      <Tabs defaultValue="import" className="space-y-4">
        <TabsList>
          <TabsTrigger value="import">Import Data</TabsTrigger>
          <TabsTrigger value="export">Export Data</TabsTrigger>
        </TabsList>

        <TabsContent value="import">
          <Card>
            <CardHeader>
              <CardTitle>Import Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Data Type</label>
                <Select value={selectedImport} onValueChange={setSelectedImport}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select data to import" />
                  </SelectTrigger>
                  <SelectContent>
                    {importTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        <div>
                          <div className="font-medium">{type.name}</div>
                          <div className="text-sm text-muted-foreground">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  disabled={isImporting || !selectedImport}
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Import Data
                    </>
                  )}
                </Button>
                <input
                  id="file-input"
                  type="file"
                  accept=".csv,.xlsx"
                  className="hidden"
                  onChange={handleImportFile}
                />
                <p className="text-sm text-muted-foreground">
                  Supported formats: CSV, Excel (.xlsx)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export">
          <Card>
            <CardHeader>
              <CardTitle>Export Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Data Type</label>
                <Select value={selectedExport} onValueChange={setSelectedExport}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select data to export" />
                  </SelectTrigger>
                  <SelectContent>
                    {exportTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        <div>
                          <div className="font-medium">{type.name}</div>
                          <div className="text-sm text-muted-foreground">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                disabled={isExporting || !selectedExport}
                onClick={handleExport}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export Data
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}