import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, File, Check } from 'lucide-react';
import { useCredit } from '../../contexts/CreditContext';
import { cn } from '@/lib/utils';

interface DocumentType {
  id: keyof NonNullable<NonNullable<ReturnType<typeof useCredit>['currentApplication']>['documents']>;
  name: string;
  required: boolean;
}

const documentTypes: DocumentType[] = [
  { id: 'id', name: 'Documento de Identidade (RG ou CNH)', required: true },
  { id: 'cpf', name: 'CPF', required: true },
  { id: 'incomeProof', name: 'Comprovante de Renda', required: true },
  { id: 'bankStatement', name: 'Extrato Bancário (últimos 3 meses)', required: true },
];

export const DocumentUpload: React.FC = () => {
  const { currentApplication, updateCurrentApplication } = useCredit();
  const [uploadedDocs, setUploadedDocs] = useState<Set<string>>(new Set());

  const handleFileUpload = (docId: string, file: File) => {
    // Mock file upload - in real app, upload to server and get URL
    const mockFileUrl = `uploaded_${docId}_${file.name}`;
    
    updateCurrentApplication({
      documents: {
        ...currentApplication?.documents,
        [docId]: mockFileUrl
      }
    });

    setUploadedDocs(prev => new Set([...prev, docId]));
  };

  const isDocumentUploaded = (docId: string) => {
    return uploadedDocs.has(docId) || currentApplication?.documents?.[docId as keyof typeof currentApplication.documents];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-h3">Documentos Necessários</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {documentTypes.map((doc) => (
          <div key={doc.id} className="space-y-2">
            <Label className="text-body-3 font-medium flex items-center gap-2">
              {doc.name}
              {doc.required && <span className="text-error">*</span>}
              {isDocumentUploaded(doc.id) && (
                <Check className="w-4 h-4 text-success" />
              )}
            </Label>
            
            <div className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
              isDocumentUploaded(doc.id) 
                ? "border-success bg-success/5" 
                : "border-tertiary/50 hover:border-primary/50"
            )}>
              {isDocumentUploaded(doc.id) ? (
                <div className="flex items-center justify-center gap-2 text-success">
                  <File className="w-5 h-5" />
                  <span className="text-body-3">Documento enviado com sucesso</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                  <p className="text-body-3 text-muted-foreground">
                    Clique para enviar ou arraste o arquivo aqui
                  </p>
                  <p className="text-body-4 text-muted-foreground">
                    Formatos aceitos: PDF, JPG, PNG (máx. 5MB)
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Mock file selection
                      const mockFile = { name: `${doc.id}.pdf`, type: 'application/pdf' } as File;
                      handleFileUpload(doc.id, mockFile);
                    }}
                  >
                    Selecionar Arquivo
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}

        <div className="mt-6 p-4 bg-info/10 rounded-lg border border-info/20">
          <h4 className="text-body-3 font-semibold text-info mb-2">Importante:</h4>
          <ul className="text-body-4 text-muted-foreground space-y-1">
            <li>• Todos os documentos marcados com * são obrigatórios</li>
            <li>• Certifique-se de que os documentos estão legíveis</li>
            <li>• Seus dados estão protegidos e serão utilizados apenas para análise de crédito</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};