import React, { useState, useEffect } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/hooks/use-toast';
import { Upload, Loader2, Check, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type DocType = 'idFront' | 'idBack' | 'proof';

const documentTypes = [
  { type: 'idFront' as DocType, label: 'RG/CPF (Frente)', required: true },
  { type: 'idBack' as DocType, label: 'RG/CPF (Verso)', required: true },
  {
    type: 'proof' as DocType,
    label: 'Comprovante de Endereço',
    required: true,
  },
];

interface DocumentUploadState {
  [key: string]: {
    fileId?: string;
    fileName?: string;
    isUploaded: boolean;
    preview?: string;
  };
}

export const Step2Documents: React.FC = () => {
  const { data, updateData, nextStep, prevStep } = useOnboarding();
  const { toast } = useToast();
  const [uploadingDoc, setUploadingDoc] = useState<DocType | null>(null);
  
  // Estado local para documentos
  const [documents, setDocuments] = useState<DocumentUploadState>({
    idFront: { isUploaded: false },
    idBack: { isUploaded: false },
    proof: { isUploaded: false },
  });

  const { uploadState, uploadFile, resetUpload, deleteFile } = useFileUpload();

  // Atualizar estado local com base nos dados do contexto
  useEffect(() => {
    setDocuments({
      idFront: { 
        isUploaded: !!data.fileIds?.idFront,
        fileId: data.fileIds?.idFront,
        fileName: data.documentPreviews?.idFront ? data.documentPreviews.idFront.split('/').pop() : undefined
      },
      idBack: { 
        isUploaded: !!data.fileIds?.idBack,
        fileId: data.fileIds?.idBack,
        fileName: data.documentPreviews?.idBack ? data.documentPreviews.idBack.split('/').pop() : undefined
      },
      proof: { 
        isUploaded: !!data.fileIds?.proof,
        fileId: data.fileIds?.proof,
        fileName: data.documentPreviews?.proof ? data.documentPreviews.proof.split('/').pop() : undefined
      },
    });
  }, [data.fileIds, data.documentPreviews]);

  const handleFileSelect = async (type: DocType, file: File) => {
    if (!data.onboardingId) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'ID de cadastro não encontrado',
      });
      return;
    }

    setUploadingDoc(type);

    const result = await uploadFile(file, {
      bucket: 'kyc',
      folder: 'kyc-documents',
    });

    if (result.success && result.data) {
      // Atualizar contexto de onboarding
      updateData({
        ...data,
        fileIds: {
          ...data.fileIds,
          [type]: result.data.fileId,
        },
        documentPreviews: {
          ...data.documentPreviews,
          [type]: URL.createObjectURL(file),
        },
      });
    }

    setUploadingDoc(null);
    resetUpload();
  };

  const handleDeleteDocument = async (type: DocType) => {
    const fileId = data.fileIds?.[type];
    if (fileId) {
      const success = await deleteFile(fileId);
      if (success) {
        // Atualizar contexto de onboarding
        const newFileIds = { ...data.fileIds };
        delete newFileIds[type];
        
        const newPreviews = { ...data.documentPreviews };
        delete newPreviews[type];

        updateData({
          ...data,
          fileIds: newFileIds,
          documentPreviews: newPreviews,
        });

        toast({
          title: 'Documento removido',
          description: 'Documento excluído com sucesso.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Falha ao excluir documento',
        });
      }
    }
  };

  const handleNext = () => {
    // Verificar se todos os documentos obrigatórios foram enviados
    const allUploaded = documentTypes.every(
      (doc) => !!data.fileIds?.[doc.type]
    );

    if (!allUploaded) {
      toast({
        variant: 'destructive',
        title: 'Documentos incompletos',
        description: 'Por favor, envie todos os documentos obrigatórios.',
      });
      return;
    }

    nextStep();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-h2 mb-2">Envio de Documentos</h2>
        <p className="text-body-3 text-muted-foreground">
          Envie fotos claras dos seus documentos
        </p>
      </div>

      <div className="space-y-4 mb-8">
        {documentTypes.map(({ type, label, required }) => {
          const doc = documents[type];
          const isCurrentlyUploading = uploadingDoc === type;

          return (
            <div
              key={type}
              className={cn(
                'border-2 border-dashed rounded-lg p-6 transition-smooth',
                doc.isUploaded
                  ? 'border-success bg-success/5'
                  : 'border-border hover:border-primary'
              )}
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  {doc.isUploaded ? (
                    <div className="w-10 h-10 rounded-full bg-success flex items-center justify-center">
                      <Check size={20} className="text-white" />
                    </div>
                  ) : isCurrentlyUploading ? (
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                      <Loader2 size={20} className="text-white animate-spin" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Upload size={20} className="text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="text-body-3 font-medium">
                      {label}{' '}
                      {required && <span className="text-error">*</span>}
                    </p>
                    <p className="text-body-4 text-muted-foreground">
                      JPG, PNG • Máx. 5MB
                    </p>
                    {doc.isUploaded && doc.fileName && (
                      <p className="text-body-4 text-success">{doc.fileName}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {doc.isUploaded ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteDocument(type)}
                    >
                      <Trash2 size={16} className="mr-1" />
                      Remover
                    </Button>
                  ) : (
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileSelect(type, file);
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

              {isCurrentlyUploading && (
                <div className="mt-4">
                  <Progress value={uploadState.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enviando... {uploadState.progress}%
                  </p>
                </div>
              )}

              {doc.isUploaded && data.documentPreviews?.[type] && (
                <div className="mt-4">
                  <img
                    src={data.documentPreviews[type]}
                    alt={`Preview ${label}`}
                    className="max-w-32 h-20 object-cover rounded border"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>
          Voltar
        </Button>
        <Button onClick={handleNext}>Próximo</Button>
      </div>

      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <h4 className="text-body-3 font-semibold mb-2">Dicas importantes:</h4>
        <ul className="text-body-4 text-muted-foreground space-y-1">
          <li>• Certifique-se que os documentos estão bem iluminados</li>
          <li>• Evite reflexos e sombras</li>
          <li>• Todos os campos devem estar visíveis e legíveis</li>
          <li>• Formato aceito: JPG, PNG (máximo 5MB)</li>
        </ul>
      </div>
    </div>
  );
};