import { useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { uploadDocument } from '@/services/onboardingService';
import { useToast } from '@/hooks/use-toast';
import { Upload, Loader2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type DocType = 'idFront' | 'idBack' | 'proof';

const documentTypes = [
  { type: 'idFront' as DocType, label: 'RG/CPF (Frente)', required: true },
  { type: 'idBack' as DocType, label: 'RG/CPF (Verso)', required: true },
  { type: 'proof' as DocType, label: 'Comprovante de Endereço', required: true },
];

export const Step2Documents: React.FC = () => {
  const { data, updateData, nextStep, prevStep } = useOnboarding();
  const { toast } = useToast();
  const [uploading, setUploading] = useState<DocType | null>(null);
  const [uploadStatus, setUploadStatus] = useState<Record<DocType, boolean>>({
    idFront: !!data.documents.idFront,
    idBack: !!data.documents.idBack,
    proof: !!data.documents.proof,
  });

  const handleFileSelect = async (type: DocType, file: File) => {
    if (!data.onboardingId) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'ID de cadastro não encontrado',
      });
      return;
    }

    setUploading(type);

    try {
      const response = await uploadDocument(data.onboardingId, file, type);

      if (response.status === 'ok' && response.data) {
        updateData({
          documents: { ...data.documents, [type]: file },
          documentPreviews: { ...data.documentPreviews, [type]: response.data.urlPreview },
          fileIds: { ...data.fileIds, [type]: response.data.fileId },
        });
        setUploadStatus({ ...uploadStatus, [type]: true });
        toast({
          title: 'Upload concluído!',
          description: `${documentTypes.find(d => d.type === type)?.label} enviado com sucesso.`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro no upload',
          description: response.message || 'Falha ao enviar documento',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Ocorreu um erro ao fazer upload',
      });
    } finally {
      setUploading(null);
    }
  };

  const handleNext = () => {
    const allUploaded = documentTypes.every(doc => uploadStatus[doc.type]);
    
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
        {documentTypes.map(({ type, label, required }) => (
          <div
            key={type}
            className={cn(
              'border-2 border-dashed rounded-lg p-6 transition-smooth',
              uploadStatus[type]
                ? 'border-success bg-success/5'
                : 'border-border hover:border-primary'
            )}
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                {uploadStatus[type] ? (
                  <div className="w-10 h-10 rounded-full bg-success flex items-center justify-center">
                    <Check size={20} className="text-white" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Upload size={20} className="text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="text-body-3 font-medium">
                    {label} {required && <span className="text-error">*</span>}
                  </p>
                  <p className="text-body-4 text-muted-foreground">
                    JPG, PNG ou PDF • Máx. 8MB
                  </p>
                </div>
              </div>

              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(type, file);
                  }}
                  className="hidden"
                  disabled={uploading === type}
                />
                <Button
                  type="button"
                  variant={uploadStatus[type] ? 'secondary' : 'default'}
                  size="sm"
                  disabled={uploading === type}
                  asChild
                >
                  <span>
                    {uploading === type ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : uploadStatus[type] ? (
                      'Alterar'
                    ) : (
                      'Enviar'
                    )}
                  </span>
                </Button>
              </label>
            </div>

            {data.documentPreviews[type] && (
              <div className="mt-4">
                <img
                  src={data.documentPreviews[type]}
                  alt={label}
                  className="w-24 h-24 object-cover rounded border border-border"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={prevStep}
          className="flex-1"
        >
          Voltar
        </Button>
        <Button
          type="button"
          size="lg"
          onClick={handleNext}
          className="flex-1"
        >
          Próximo
        </Button>
      </div>
    </div>
  );
};
