import React, { useState } from 'react';
import { useCredit } from '@/contexts/CreditContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Loader2, Check, Trash2, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Document {
  id: string;
  title: string;
  description: string;
  required: boolean;
  acceptedFormats: string[];
  maxSize: string;
}

const requiredDocuments: Document[] = [
  {
    id: 'rg',
    title: 'RG ou CNH',
    description: 'Documento de identidade com foto',
    required: true,
    acceptedFormats: ['PDF', 'JPG', 'PNG'],
    maxSize: '5MB'
  },
  {
    id: 'cpf',
    title: 'CPF',
    description: 'Cadastro de Pessoa Física',
    required: true,
    acceptedFormats: ['PDF', 'JPG', 'PNG'],
    maxSize: '5MB'
  },
  {
    id: 'comprovante_renda',
    title: 'Comprovante de Renda',
    description: 'Holerite, extrato bancário ou declaração IR',
    required: true,
    acceptedFormats: ['PDF', 'JPG', 'PNG'],
    maxSize: '8MB'
  },
  {
    id: 'comprovante_residencia',
    title: 'Comprovante de Residência',
    description: 'Conta de luz, água, telefone (últimos 3 meses)',
    required: true,
    acceptedFormats: ['PDF', 'JPG', 'PNG'],
    maxSize: '5MB'
  }
];

interface DocumentUploadState {
  [key: string]: {
    fileId?: string;
    fileName?: string;
    isUploaded: boolean;
    preview?: string;
  };
}

export const DocumentUpload: React.FC = () => {
  const { currentApplication, updateApplication } = useCredit();
  const { toast } = useToast();
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentUploadState>(() => {
    const initialState: DocumentUploadState = {};
    requiredDocuments.forEach(doc => {
      initialState[doc.id] = {
        isUploaded: !!(currentApplication?.documents?.[doc.id]),
        fileName: currentApplication?.documents?.[doc.id]?.name,
        fileId: currentApplication?.fileIds?.[doc.id]
      };
    });
    return initialState;
  });

  const { uploadState, uploadFile, resetUpload, deleteFile } = useFileUpload();

  const handleFileSelect = async (docId: string, file: File) => {
    setUploadingDoc(docId);

    const result = await uploadFile(file, {
      bucket: 'documents',
      folder: 'credit-application'
    });

    if (result.success && result.data) {
      const newDocuments = {
        ...documents,
        [docId]: {
          fileId: result.data.fileId,
          fileName: result.data.fileName,
          isUploaded: true,
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
        }
      };
      setDocuments(newDocuments);

      updateApplication({
        documents: {
          ...currentApplication?.documents,
          [docId]: file
        },
        fileIds: {
          ...currentApplication?.fileIds,
          [docId]: result.data.fileId
        }
      });
    }

    setUploadingDoc(null);
    resetUpload();
  };

  const handleDeleteDocument = async (docId: string) => {
    const doc = documents[docId];
    if (doc.fileId) {
      const success = await deleteFile(doc.fileId);
      if (success) {
        setDocuments({
          ...documents,
          [docId]: { isUploaded: false }
        });

        const newDocuments = { ...currentApplication?.documents };
        delete newDocuments[docId];
        
        const newFileIds = { ...currentApplication?.fileIds };
        delete newFileIds[docId];

        updateApplication({
          documents: newDocuments,
          fileIds: newFileIds
        });

        if (doc.preview) {
          URL.revokeObjectURL(doc.preview);
        }
      }
    }
  };

  const allRequiredUploaded = requiredDocuments
    .filter(doc => doc.required)
    .every(doc => documents[doc.id].isUploaded);

  const getAcceptString = (formats: string[]): string => {
    const mimeTypes: { [key: string]: string } = {
      'PDF': 'application/pdf',
      'JPG': 'image/jpeg',
      'PNG': 'image/png'
    };
    
    return formats.map(format => mimeTypes[format]).join(',');
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-h2 mb-2">Envio de Documentos</h2>
        <p className="text-body-3 text-muted-foreground">
          Envie os documentos necessários para análise do seu crédito
        </p>
      </div>

      <div className="grid gap-6">
        {requiredDocuments.map((doc) => {
          const docState = documents[doc.id];
          const isCurrentlyUploading = uploadingDoc === doc.id;
          
          return (
            <div
              key={doc.id}
              className={cn(
                'border-2 border-dashed rounded-lg p-6 transition-smooth',
                docState.isUploaded
                  ? 'border-success bg-success/5'
                  : 'border-border hover:border-primary'
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    {docState.isUploaded ? (
                      <div className="w-10 h-10 rounded-full bg-success flex items-center justify-center">
                        <Check size={20} className="text-white" />
                      </div>
                    ) : isCurrentlyUploading ? (
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                        <Loader2 size={20} className="text-white animate-spin" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <FileText size={20} className="text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-body-2 font-semibold">
                        {doc.title}
                      </h3>
                      {doc.required && (
                        <span className="text-xs bg-error/10 text-error px-2 py-1 rounded">
                          Obrigatório
                        </span>
                      )}
                    </div>
                    
                    <p className="text-body-4 text-muted-foreground mb-2">
                      {doc.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span>Formatos: {doc.acceptedFormats.join(', ')}</span>
                      <span>Máx: {doc.maxSize}</span>
                    </div>

                    {docState.isUploaded && (
                      <p className="text-body-4 text-success mt-2 font-medium">
                        📎 {docState.fileName}
                      </p>
                    )}

                    {docState.isUploaded && docState.preview && (
                      <div className="mt-3">
                        <img
                          src={docState.preview}
                          alt={`Preview ${doc.title}`}
                          className="max-w-32 h-20 object-cover rounded border"
                        />
                      </div>
                    )}

                    {isCurrentlyUploading && (
                      <div className="mt-4">
                        <Progress value={uploadState.progress} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          Enviando... {uploadState.progress}%
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  {docState.isUploaded ? (
                    <>
                      {docState.preview && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (docState.preview) {
                              window.open(docState.preview, '_blank');
                            }
                          }}
                        >
                          <Eye size={16} className="mr-1" />
                          Ver
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteDocument(doc.id)}
                      >
                        <Trash2 size={16} className="mr-1" />
                        Remover
                      </Button>
                    </>
                  ) : (
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept={getAcceptString(doc.acceptedFormats)}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileSelect(doc.id, file);
                        }}
                        className="hidden"
                        disabled={isCurrentlyUploading}
                      />
                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        disabled={isCurrentlyUploading}
                        asChild
                      >
                        <span>
                          {isCurrentlyUploading ? (
                            <Loader2 size={16} className="mr-1 animate-spin" />
                          ) : (
                            <Upload size={16} className="mr-1" />
                          )}
                          {isCurrentlyUploading ? 'Enviando...' : 'Enviar'}
                        </span>
                      </Button>
                    </label>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-body-3 font-semibold">Progresso dos documentos</h4>
          <span className="text-body-4 text-muted-foreground">
            {Object.values(documents).filter(doc => doc.isUploaded).length} de {requiredDocuments.length}
          </span>
        </div>
        <Progress 
          value={(Object.values(documents).filter(doc => doc.isUploaded).length / requiredDocuments.length) * 100} 
          className="h-2"
        />
        
        {allRequiredUploaded && (
          <p className="text-success text-sm mt-2 font-medium">
            ✓ Todos os documentos obrigatórios foram enviados!
          </p>
        )}
      </div>

      <div className="mt-6 p-4 bg-info/10 rounded-lg border border-info/20">
        <h4 className="text-body-3 font-semibold text-info mb-2">Importante:</h4>
        <ul className="text-body-4 text-muted-foreground space-y-1">
          <li>• Certifique-se de que todos os documentos estão legíveis</li>
          <li>• Evite fotos com sombras ou reflexos</li>
          <li>• Os documentos devem estar dentro da validade</li>
          <li>• Para comprovante de renda, envie os últimos 3 meses</li>
          <li>• Seus dados pessoais serão protegidos conforme nossa política de privacidade</li>
        </ul>
      </div>
    </div>
  );
};