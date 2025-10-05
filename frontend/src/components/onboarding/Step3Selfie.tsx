import { useState, useRef, useEffect } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { submitSelfie } from '@/services/onboardingService';
import { useToast } from '@/hooks/use-toast';
import { Camera, Upload, Loader2, RefreshCw } from 'lucide-react';

export const Step3Selfie: React.FC = () => {
  const { data, updateData, nextStep, prevStep } = useOnboarding();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      // Verificar se o navegador suporta getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Câmera não suportada neste navegador');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640, min: 480 },
          height: { ideal: 640, min: 480 },
          facingMode: 'user',
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;

        // Aguardar o vídeo carregar antes de ativar
        videoRef.current.onloadedmetadata = () => {
          videoRef.current
            ?.play()
            .then(() => {
              setVideoReady(true);
            })
            .catch((playError) => {
              console.error('Erro ao reproduzir vídeo:', playError);
              toast({
                variant: 'destructive',
                title: 'Erro ao iniciar vídeo',
                description: 'Tente recarregar a página ou use "Enviar Foto".',
              });
            });
        };
      }

      setStream(mediaStream);
      setCameraActive(true);
    } catch (error: unknown) {
      console.error('Erro ao acessar câmera:', error);

      let errorMessage = 'Você pode enviar uma foto ao invés disso.';

      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage =
            'Permissão negada. Por favor, permita o acesso à câmera e tente novamente.';
        } else if (error.name === 'NotFoundError') {
          errorMessage =
            'Nenhuma câmera encontrada. Use a opção "Enviar Foto".';
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'Câmera está sendo usada por outro aplicativo.';
        } else if (error.name === 'OverconstrainedError') {
          errorMessage =
            'Câmera não atende aos requisitos. Tente com "Enviar Foto".';
        }
      }

      toast({
        variant: 'destructive',
        title: 'Erro ao acessar câmera',
        description: errorMessage,
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
    setVideoReady(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current || !data.onboardingId) {
      toast({
        variant: 'destructive',
        title: 'Erro na captura',
        description: 'Vídeo não está pronto. Tente novamente.',
      });
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;

    // Verificar se o vídeo está reproduzindo e tem dimensões válidas
    if (video.videoWidth === 0 || video.videoHeight === 0 || !videoReady) {
      toast({
        variant: 'destructive',
        title: 'Vídeo não carregado',
        description: 'Aguarde o vídeo carregar completamente.',
      });
      return;
    }

    // Definir dimensões do canvas baseado no vídeo
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      toast({
        variant: 'destructive',
        title: 'Erro no canvas',
        description: 'Não foi possível preparar a captura.',
      });
      return;
    }

    // Desenhar o frame atual do vídeo no canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Converter para blob
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          toast({
            variant: 'destructive',
            title: 'Erro na captura',
            description: 'Não foi possível gerar a imagem.',
          });
          return;
        }

        setLoading(true);
        stopCamera();

        try {
          const response = await submitSelfie(data.onboardingId!, blob);

          if (response.status === 'ok') {
            const preview = URL.createObjectURL(blob);
            updateData({
              selfie: blob,
              selfiePreview: preview,
            });

            toast({
              title: 'Selfie capturada!',
              description: 'Foto processada com sucesso.',
            });
          } else {
            toast({
              variant: 'destructive',
              title: 'Erro ao processar selfie',
              description: response.message || 'Tente novamente',
            });
          }
        } catch (error) {
          toast({
            variant: 'destructive',
            title: 'Erro',
            description: 'Ocorreu um erro ao processar a selfie',
          });
        } finally {
          setLoading(false);
        }
      },
      'image/jpeg',
      0.9
    );
  };

  const handleFileUpload = async (file: File) => {
    if (!data.onboardingId) return;

    // Validate resolution
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = async () => {
      if (img.width < 600 || img.height < 600) {
        toast({
          variant: 'destructive',
          title: 'Resolução baixa',
          description: 'A foto deve ter pelo menos 600x600 pixels',
        });
        return;
      }

      setLoading(true);

      try {
        const response = await submitSelfie(data.onboardingId!, file);

        if (response.status === 'ok') {
          const preview = URL.createObjectURL(file);
          updateData({
            selfie: file,
            selfiePreview: preview,
          });

          toast({
            title: 'Selfie enviada!',
            description: 'Foto processada com sucesso.',
          });
        } else {
          toast({
            variant: 'destructive',
            title: 'Erro ao processar selfie',
            description: response.message || 'Tente novamente',
          });
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Ocorreu um erro ao processar a selfie',
        });
      } finally {
        setLoading(false);
      }
    };
  };

  const handleNext = () => {
    if (!data.selfie) {
      toast({
        variant: 'destructive',
        title: 'Selfie necessária',
        description: 'Por favor, tire ou envie uma selfie para continuar.',
      });
      return;
    }

    nextStep();
  };

  const retakeSelfie = () => {
    updateData({ selfie: undefined, selfiePreview: undefined });
    startCamera();
  };

  // Cleanup quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-h2 mb-2">Selfie de Verificação</h2>
        <p className="text-body-3 text-muted-foreground mb-4">
          Tire uma selfie para confirmar sua identidade
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
          <h3 className="font-semibold text-blue-900 mb-2">Instruções:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Mantenha o rosto bem iluminado</li>
            <li>• Olhe diretamente para a câmera</li>
            <li>• Mantenha uma expressão neutra</li>
            <li>• Certifique-se de que seu rosto está completamente visível</li>
          </ul>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-6 mb-8">
        {!data.selfiePreview ? (
          <>
            {cameraActive ? (
              <div className="space-y-4">
                <div className="relative bg-muted rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full aspect-square object-cover"
                  />
                  {!videoReady && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin" />
                        <p>Carregando câmera...</p>
                      </div>
                    </div>
                  )}
                  {videoReady && (
                    <div className="absolute top-4 left-4 bg-green-500 text-white px-2 py-1 rounded-full text-sm flex items-center gap-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      Ao vivo
                    </div>
                  )}
                </div>
                <canvas ref={canvasRef} className="hidden" />
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={stopCamera}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    size="lg"
                    onClick={capturePhoto}
                    disabled={loading || !videoReady}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <Camera className="mr-2 h-4 w-4" />
                        {videoReady ? 'Capturar' : 'Aguarde...'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                  <Camera size={64} className="text-muted-foreground" />
                </div>

                <div className="space-y-3">
                  <Button
                    type="button"
                    size="lg"
                    onClick={startCamera}
                    className="w-full"
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
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="w-full"
                      asChild
                    >
                      <span>
                        <Upload className="mr-2 h-4 w-4" />
                        Enviar Foto
                      </span>
                    </Button>
                  </label>
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
        <Button type="button" size="lg" onClick={handleNext} className="flex-1">
          Próximo
        </Button>
      </div>
    </div>
  );
};
