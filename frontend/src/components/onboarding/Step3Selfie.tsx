import React, { useState, useRef } from 'react';
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
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 640, facingMode: 'user' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setStream(mediaStream);
      setCameraActive(true);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao acessar câmera',
        description: 'Você pode enviar uma foto ao invés disso.',
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current || !data.onboardingId) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0);
    
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      
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
    }, 'image/jpeg', 0.9);
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

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-h2 mb-2">Selfie de Verificação</h2>
        <p className="text-body-3 text-muted-foreground">
          Tire uma selfie para confirmar sua identidade
        </p>
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
                    className="w-full aspect-square object-cover"
                  />
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
                    disabled={loading}
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
                        Capturar
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
