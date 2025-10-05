import React, { useState, useRef, useCallback } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/hooks/use-toast';
import { Camera, Upload, RefreshCw, Loader2, Check, X } from 'lucide-react';

export const Step3Selfie: React.FC = () => {
  const { data, updateData, nextStep, prevStep } = useOnboarding();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const { uploadState, uploadFile, resetUpload, deleteFile } = useFileUpload();

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      setStream(mediaStream);
      setCameraActive(true);
    } catch (error: unknown) {
      console.error('Erro ao acessar câmera:', error);

      let errorMessage = 'Você pode enviar uma foto ao invés disso.';

      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Permissão negada. Por favor, permita o acesso à câmera e tente novamente.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'Nenhuma câmera encontrada. Use a opção "Enviar Foto".';
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'Câmera está sendo usada por outro aplicativo.';
        } else if (error.name === 'OverconstrainedError') {
          errorMessage = 'Câmera não atende aos requisitos. Tente com "Enviar Foto".';
        }
      }

      toast({
        variant: 'destructive',
        title: 'Erro na câmera',
        description: errorMessage,
      });
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !data.onboardingId) return;

    setLoading(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          setLoading(false);
          return;
        }

        try {
          const file = new File([blob], `selfie_${Date.now()}.jpg`, {
            type: 'image/jpeg',
          });

          const result = await uploadFile(file, {
            bucket: 'kyc',
            folder: 'selfies'
          });

          if (result.success && result.data) {
            const preview = URL.createObjectURL(blob);
            updateData({
              selfie: blob,
              selfiePreview: preview,
              fileIds: {
                ...data.fileIds,
                selfie: result.data.fileId
              }
            });

            toast({
              title: 'Selfie capturada!',
              description: 'Foto processada e enviada com sucesso.',
            });

            stopCamera();
          }
        } catch (error) {
          toast({
            variant: 'destructive',
            title: 'Erro',
            description: 'Ocorreu um erro ao processar a selfie',
          });
        } finally {
          setLoading(false);
          resetUpload();
        }
      },
      'image/jpeg',
      0.9
    );
  }, [data.onboardingId, uploadFile, updateData, data.fileIds, toast, stopCamera, resetUpload]);

  const handleFileUpload = async (file: File) => {
    if (!data.onboardingId) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = async () => {
      try {
        if (img.width < 640 || img.height < 480) {
          toast({
            variant: 'destructive',
            title: 'Resolução baixa',
            description: 'A imagem deve ter pelo menos 640x480 pixels',
          });
          return;
        }

        const result = await uploadFile(file, {
          bucket: 'kyc',
          folder: 'selfies'
        });

        if (result.success && result.data) {
          const preview = URL.createObjectURL(file);
          updateData({
            selfie: file,
            selfiePreview: preview,
            fileIds: {
              ...data.fileIds,
              selfie: result.data.fileId
            }
          });

          toast({
            title: 'Selfie enviada!',
            description: 'Foto processada com sucesso.',
          });
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Erro ao processar a imagem',
        });
      } finally {
        resetUpload();
      }
    };
  };

  const retakeSelfie = () => {
    if (data.fileIds?.selfie) {
      deleteFile(data.fileIds.selfie);
    }

    updateData({
      selfie: null,
      selfiePreview: null,
      fileIds: { ...data.fileIds, selfie: undefined }
    });
    
    if (data.selfiePreview) {
      URL.revokeObjectURL(data.selfiePreview);
    }
  };

  const handleNext = () => {
    if (!data.selfie) {
      toast({
        variant: 'destructive',
        title: 'Selfie obrigatória',
        description: 'Por favor, capture ou envie uma selfie para continuar.',
      });
      return;
    }
    nextStep();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-h2 mb-2">Verificação Biométrica</h2>
        <p className="text-body-3 text-muted-foreground">
          Capture uma selfie para validar sua identidade
        </p>
      </div>

      <div className="space-y-6">
        {!data.selfiePreview ? (
          <>
            {cameraActive ? (
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full aspect-square object-cover rounded-lg bg-black"
                />
                <canvas ref={canvasRef} className="hidden" />
                
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 border-2 border-white/30 rounded-lg" />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-80 border-2 border-primary rounded-lg" />
                </div>

                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={stopCamera}
                    disabled={loading}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    size="lg"
                    onClick={capturePhoto}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="mr-2 h-4 w-4" />
                    )}
                    {loading ? 'Processando...' : 'Capturar'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-border rounded-lg p-8">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                    <Camera size={32} className="text-muted-foreground" />
                  </div>
                  
                  <h3 className="text-body-2 font-semibold">
                    Capture sua selfie
                  </h3>
                  <p className="text-body-4 text-muted-foreground">
                    Use a câmera ou envie uma foto existente
                  </p>

                  <div className="space-y-3 max-w-xs mx-auto">
                    <Button
                      type="button"
                      size="lg"
                      onClick={startCamera}
                      className="w-full"
                      disabled={uploadState.isUploading}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Usar Câmera
                    </Button>

                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">
                        Problemas com a câmera? Permita o acesso quando solicitado
                        pelo navegador
                      </p>
                    </div>

                    <label className="block">
                      <input
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                        className="hidden"
                        disabled={uploadState.isUploading}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        className="w-full"
                        disabled={uploadState.isUploading}
                        asChild
                      >
                        <span>
                          {uploadState.isUploading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="mr-2 h-4 w-4" />
                          )}
                          {uploadState.isUploading ? 'Enviando...' : 'Enviar Foto'}
                        </span>
                      </Button>
                    </label>

                    {uploadState.isUploading && (
                      <div className="mt-4">
                        <Progress value={uploadState.progress} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          Enviando... {uploadState.progress}%
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={data.selfiePreview}
                alt="Selfie preview"
                className="w-full aspect-square object-cover rounded-lg"
              />
              <div className="absolute top-2 right-2">
                <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center">
                  <Check size={16} className="text-white" />
                </div>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={retakeSelfie}
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Tirar Nova Foto
            </Button>
          </div>
        )}
      </div>

      <div className="flex gap-4 mt-8">
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
          disabled={uploadState.isUploading}
        >
          {uploadState.isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            'Próximo'
          )}
        </Button>
      </div>

      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <h4 className="text-body-3 font-semibold mb-2">Dicas para uma boa selfie:</h4>
        <ul className="text-body-4 text-muted-foreground space-y-1">
          <li>• Mantenha o rosto bem iluminado</li>
          <li>• Olhe diretamente para a câmera</li>
          <li>• Evite óculos escuros ou acessórios que cubram o rosto</li>
          <li>• Certifique-se que está sozinho na foto</li>
        </ul>
      </div>
    </div>
  );
};