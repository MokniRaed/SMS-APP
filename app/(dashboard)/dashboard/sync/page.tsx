'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Loader2, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

type DataType = {
  id: string;
  name: string;
  description: string;
  endpoint?: string;
  hasSubTypes?: boolean;
};

type CategoryType = {
  id: string;
  name: string;
  endpoint: string;
};

const categoryTypes: CategoryType[] = [
  {
    id: 'cat_stat',
    name: 'Stat Niveau 1',
    endpoint: '/categories/upload?type=cat_stat'
  },
  {
    id: 'cat_nv_1',
    name: 'Stat Niveau 2',
    endpoint: '/categories/upload?type=cat_nv_1'
  },
  {
    id: 'cat_nv_2',
    name: ' Stat Niveau 3',
    endpoint: '/categories/upload?type=cat_nv_2'
  },
  {
    id: 'st',
    name: ' Societé',
    endpoint: '/categories/upload?type=st'
  },
  {
    id: 'marque',
    name: 'Marque',
    endpoint: '/categories/upload?type=marque'
  }
];

const importTypes: DataType[] = [
  {
    id: 'clients',
    name: 'Clients',
    description: 'Import client information',
    endpoint: '/clients/upload-contacts'
  },
  {
    id: 'articles',
    name: 'Articles',
    description: 'Import article catalog',
    endpoint: '/articles/upload-articles'
  },
  {
    id: 'collaborateurs',
    name: 'Collaborateurs',
    description: 'Import collaborator data',
    endpoint: '/collaborators/upload-collaborators'
  },
  {
    id: 'zones',
    name: 'Zones',
    description: 'Import geographical zones',
    endpoint: '/projects/upload-zones'
  },
  {
    id: 'sous-zones',
    name: 'Sous-Zones',
    description: 'Import sub-zones',
    endpoint: '/projects/upload-sub-zones'
  },
  {
    id: 'categories',
    name: 'Categories',
    description: 'Import category data',
    hasSubTypes: true
  },
];

const exportTypes: DataType[] = [
  {
    id: 'tasks',
    name: 'Tâches',
    description: 'Export task records',
    endpoint: '/tasks/export'
  },
  {
    id: 'requests',
    name: 'Requêtes',
    description: 'Export request data',
    endpoint: '/requests/export'
  },
  {
    id: 'orders',
    name: 'Commandes',
    description: 'Export order history',
    endpoint: '/orders/export'
  },
  {
    id: 'projects',
    name: 'Projets',
    description: 'Export project data',
    endpoint: '/projects/export'
  },
  {
    id: 'categories',
    name: 'Categories',
    description: 'Export Categories data',
    endpoint: '/categories/export'
  },
  // {
  //   id: 'info-libre',
  //   name: 'Liste Information libre',
  //   description: 'Export free information list',
  //   endpoint: '/info-libre/export'
  // },
  {
    id: 'contacts',
    name: 'Liste Contacts client',
    description: 'Export client contacts',
    endpoint: '/clients/export-contacts'
  },
  // {
  //   id: 'equipment',
  //   name: 'Liste Equipements',
  //   description: 'Export equipment list',
  //   endpoint: '/equipment/export'
  // },
];

interface FilePreview {
  name: string;
  size: string;
  type: string;
}

export default function SyncPage() {
  const [selectedImport, setSelectedImport] = useState<string>('');
  const [selectedCategoryType, setSelectedCategoryType] = useState<string>('');
  const [selectedExport, setSelectedExport] = useState<string>('');
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<FilePreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setSelectedFile(null);
    setFilePreview(null);
    setError(null);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null);

    if (!file) {
      resetFileInput();
      return;
    }

    // Validate file type
    const validTypes = ['.csv', '.xlsx', '.xls'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!validTypes.includes(fileExtension)) {
      setError(`Invalid file type. Please select a CSV or Excel file (${validTypes.join(', ')})`);
      resetFileInput();
      return;
    }

    // Validate file size (e.g., max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('File size exceeds 10MB limit');
      resetFileInput();
      return;
    }

    setSelectedFile(file);
    setFilePreview({
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type
    });
  };

  const handleImportTypeChange = (value: string) => {
    setSelectedImport(value);
    setError(null);
    // Reset category type if user changes import type
    if (value !== 'categories') {
      setSelectedCategoryType('');
    }
  };

  const handleImportFile = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to import');
      return;
    }

    if (selectedImport === 'categories' && !selectedCategoryType) {
      toast.error('Please select a category type to import');
      return;
    }

    if (!selectedImport) {
      toast.error('Please select a data type to import');
      return;
    }

    setIsImporting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      let endpoint;
      if (selectedImport === 'categories') {
        const categoryType = categoryTypes.find(type => type.id === selectedCategoryType);
        if (!categoryType?.endpoint) {
          throw new Error('Invalid category type selected');
        }
        endpoint = categoryType.endpoint;
        formData.append('categoryType', selectedCategoryType);
      } else {
        const selectedType = importTypes.find(type => type.id === selectedImport);
        if (!selectedType?.endpoint) {
          throw new Error('Invalid import type selected');
        }
        endpoint = selectedType.endpoint;
      }

      formData.append('type', selectedImport);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Import failed');
      }

      toast.success('Data imported successfully');
      resetFileInput();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to import data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsImporting(false);
    }
  };

  const handleExport = async () => {
    if (!selectedExport) {
      toast.error('Please select a data type to export');
      return;
    }

    const selectedType = exportTypes.find(type => type.id === selectedExport);
    if (!selectedType?.endpoint) {
      toast.error('Invalid export type selected');
      return;
    }

    setIsExporting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${selectedType.endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: selectedExport }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Export failed');
      }

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
      const errorMessage = error instanceof Error ? error.message : 'Failed to export data';
      toast.error(errorMessage);
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
                <Select
                  value={selectedImport}
                  onValueChange={handleImportTypeChange}
                >
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

              {/* Show Category Type dropdown when Categories is selected */}
              {selectedImport === 'categories' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Category Type</label>
                  <Select
                    value={selectedCategoryType}
                    onValueChange={setSelectedCategoryType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category type" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button
                    disabled={isImporting}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Select File
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <p className="text-sm text-muted-foreground">
                    Supported formats: CSV, Excel (.xlsx, .xls)
                  </p>
                </div>

                {filePreview && (
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                    <div className="space-y-1">
                      <p className="font-medium">{filePreview.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {filePreview.size} • {filePreview.type}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={resetFileInput}
                      disabled={isImporting}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  disabled={
                    isImporting ||
                    !selectedImport ||
                    !selectedFile ||
                    (selectedImport === 'categories' && !selectedCategoryType)
                  }
                  onClick={handleImportFile}
                  className="w-full"
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
                className="w-full"
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