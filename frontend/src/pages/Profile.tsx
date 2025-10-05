import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Camera, Save, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Header2 } from '@/components/layout/Header2';

const profileSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  cpfCnpj: z.string().min(11, 'CPF/CNPJ inválido'),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').optional().or(z.literal('')),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      cpfCnpj: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        setIsUploading(false);
        toast({
          title: 'Foto atualizada',
          description: 'Sua foto de perfil foi atualizada com sucesso.',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: ProfileFormValues) => {
    console.log('Profile data:', data);
    toast({
      title: 'Perfil atualizado',
      description: 'Suas informações foram salvas com sucesso.',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <Header2 />
      <div className="sticky top-0 z-10 bg-gradient-to-r from-primary/10 via-accent/5 to-secondary/10 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2 hover:bg-primary/10 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary">
            Editar Perfil
          </h1>
          <p className="text-body-3 text-muted-foreground">
            Atualize suas informações pessoais
          </p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm rounded-2xl shadow-soft border border-border/50 p-6 md:p-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8 pb-8 border-b border-border/50">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary via-accent to-secondary p-1 shadow-elevated hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-bold bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  )}
                </div>
              </div>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer shadow-elevated hover:scale-110 transition-transform duration-200"
              >
                <Camera className="h-5 w-5" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={isUploading}
                />
              </label>
            </div>
            <p className="text-body-4 text-muted-foreground mt-4">
              Clique no ícone para alterar a foto
            </p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Nome */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-body-3 font-medium">Nome Completo</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Digite seu nome completo"
                        className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-body-3 font-medium">Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="seu@email.com"
                        className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone and CPF/CNPJ - Side by side on desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-body-3 font-medium">Telefone</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="(00) 00000-0000"
                          className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cpfCnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-body-3 font-medium">CPF/CNPJ</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="000.000.000-00"
                          className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Password Section */}
              <div className="pt-6 border-t border-border/50">
                <h3 className="text-body-2 font-semibold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Alterar Senha
                </h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-body-3 font-medium">Senha Atual</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder="Digite sua senha atual"
                            className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-body-3 font-medium">Nova Senha</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="password"
                              placeholder="Mínimo 6 caracteres"
                              className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-body-3 font-medium">Confirmar Senha</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="password"
                              placeholder="Repita a nova senha"
                              className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6">
                <Button
                  type="submit"
                  className="gap-2 from-primary via-accent to-secondary hover:opacity-90 transition-opacity shadow-elevated"
                  size="lg"
                >
                  <Save className="h-5 w-5" />
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Profile;